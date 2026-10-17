// Cloud sync through Supabase: one row per user holding the same JSON as a backup file. Each sync pulls that row,
// merges it with this device's progress, saves the result locally (validated by importBackup) and pushes it back.
// ponytail: whole-snapshot rows; two devices syncing in the same second can drop one side's newest work. Move to
// per-record tables if that ever bites or the row grows past a few MB (≈10k reviews ≈ 3 MB).
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { exportBackup, importBackup } from './db/backup'
import { deckTombs, setDeckTombs, type Db } from './db/db'

const URL_ = 'https://mlvhkclvuporivwznhcq.supabase.co'
const KEY = 'sb_publishable_SxhHZJ7i5luS4O4sEM421g_wEm3oQTE' // publishable: safe in the page, row-level security guards the data
const STORE = 'sb-mlvhkclvuporivwznhcq-auth-token' // where supabase-js keeps the session

let client: Promise<SupabaseClient> | null = null
/** The client is loaded on demand, so people who never sign in don't download it. */
export const supabase = () => (client ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(URL_, KEY)))

/** Signed in before, or arriving from a sign-in link: worth loading the client at startup. */
export const maybeSignedIn = () => {
  try {
    return !!localStorage.getItem(STORE) || /access_token=/.test(location.hash)
  } catch {
    return false
  }
}

const hash = new URLSearchParams(typeof location === 'undefined' ? '' : location.hash.slice(1))
/** From an email link: "reset your password" (the Account page asks for a new one), or an expired link's error. Read before supabase-js clears the hash. */
export const recovery = { pending: hash.get('type') === 'recovery', error: hash.get('error_description') }
export const endRecovery = () => { recovery.pending = false }
/** The expired link's error, once. */
export const takeLinkError = () => {
  const e = recovery.error
  recovery.error = null
  return e
}

/** A new version of the app is waiting (set from main.tsx): App applies it on a tab screen, never mid-lesson. Here as the module both share. */
export const update = { apply: null as (() => void) | null, ready: () => {} }

export async function session(): Promise<Session | null> {
  if (!maybeSignedIn()) return null
  return (await (await supabase()).auth.getSession()).data.session
}

/* eslint-disable @typescript-eslint/no-explicit-any -- backup JSON, validated by importBackup */
type Snap = { cards: any[]; reviews: any[]; decks: any[]; lessons: any[]; activity: any[]; deletedDecks?: string[] } & Record<string, unknown>

const noId = (r: Record<string, unknown>) => {
  const { id, ...rest } = r
  void id
  return rest
}

const byKey = <T>(a: T[], b: T[], key: (x: T) => string, pick: (x: T, y: T) => T) => {
  const m = new Map(a.map((x) => [key(x), x]))
  for (const y of b) {
    const x = m.get(key(y))
    m.set(key(y), x ? pick(x, y) : y)
  }
  return [...m.values()]
}

/** Combine two snapshots: the more-reviewed copy of each card, every review once, every lesson and day of activity; minus deleted decks. */
export function merge(a: Snap, b: Snap): Snap {
  const t = (d: unknown) => (d ? new Date(d as string).getTime() : 0)
  const gone = new Set([...(a.deletedDecks ?? []), ...(b.deletedDecks ?? [])]) // ponytail: kept forever; a few ids per deleted deck
  const cards = byKey(a.cards, b.cards, (c) => c.id, (x, y) => ({ ...(y.fsrs.reps > x.fsrs.reps || (y.fsrs.reps === x.fsrs.reps && t(y.fsrs.last_review) > t(x.fsrs.last_review)) ? y : x), ...(Math.abs(y.saved ?? 0) > Math.abs(x.saved ?? 0) ? { saved: y.saved } : x.saved !== undefined && { saved: x.saved }) })) // the latest Study this / unsave wins
  const dead = new Set(cards.filter((c) => gone.has(c.deck)).map((c) => c.id))
  return {
    ...a,
    cards: cards.filter((c) => !dead.has(c.id)),
    // ids are per-device autoincrement keys: drop them and let this device number the merged list
    reviews: byKey(a.reviews, b.reviews, (r) => `${r.cardId}|${t(r.at)}`, (x) => x).filter((r) => !dead.has(r.cardId)).map(noId),
    decks: byKey(a.decks, b.decks, (d) => d.id, (_, y) => y).filter((d) => !gone.has(d.id)),
    lessons: byKey(a.lessons, b.lessons, (l) => l.id, (x, y) => ({ ...x, completedAt: t(x.completedAt) <= t(y.completedAt) ? x.completedAt : y.completedAt, plays: Math.max(x.plays, y.plays), bestAccuracy: Math.max(x.bestAccuracy, y.bestAccuracy) })),
    // max, not sum: the same day pushed from one device twice must not count double
    activity: byKey(a.activity, b.activity, (d) => d.date, (x, y) => ({ date: x.date, xp: Math.max(x.xp, y.xp), lessons: Math.max(x.lessons, y.lessons) })),
    deletedDecks: [...gone],
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const LAST = 'nihongo.lastSync'
const USER = 'nihongo.syncUser' // the account this device last synced with
const read = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
export const lastSync = () => read(LAST)
export const syncedUser = () => read(USER)

let running: Promise<boolean> | null = null
/** Pull, merge, save, push. Resolves true when this device's data changed (screens should reload). No-op when signed out. */
export const sync = (db: Db) => {
  if (running) return running
  const p: Promise<boolean> = run(db).finally(() => { if (running === p) running = null })
  return (running = p)
}

/** Run f with no sync alongside it (a restore and its push): waits for a running sync, and syncs asked for meanwhile are skipped. */
export function exclusive<T>(f: () => Promise<T>): Promise<T> {
  // cleared before the caller resumes, so a sync it starts next really runs
  const p = (running ?? Promise.resolve()).catch(() => {}).then(f).finally(() => { if (running === mine) running = null })
  const mine: Promise<boolean> = p.then(() => false, () => false)
  running = mine
  return p
}

async function pull(sb: SupabaseClient, user: string) {
  const { data, error } = await sb.from('progress').select('data').eq('user_id', user).maybeSingle()
  if (error) throw new Error(error.message)
  return data?.data as Snap | undefined
}

/** This device's data, with the decks deleted here since the last push. */
const snapshot = async (db: Db, tombs: Record<string, boolean>): Promise<Snap> =>
  ({ ...JSON.parse(await exportBackup(db)), deletedDecks: Object.keys(tombs).filter((k) => tombs[k]) })

async function push(sb: SupabaseClient, user: string, data: Snap, tombs: Record<string, boolean>) {
  const up = await sb.from('progress').upsert({ user_id: user, data, updated_at: new Date().toISOString() })
  if (up.error) throw new Error(up.error.message)
  const now = deckTombs() // the row holds them now: forget the ones sent, keep any made meanwhile
  for (const k in tombs) if (now[k] === tombs[k]) delete now[k]
  setDeckTombs(now)
  try {
    localStorage.setItem(LAST, new Date().toISOString())
    localStorage.setItem(USER, user)
  } catch { /* private mode: fine */ }
}

async function run(db: Db) {
  const s = await session()
  if (!s) return false
  const prev = syncedUser()
  if (prev && prev !== s.user.id) throw new Error('This device last synced with another account: open Account and choose Sync now.')
  const sb = await supabase()
  const cloud = await pull(sb, s.user.id)
  const tombs = deckTombs()
  const local = await snapshot(db, tombs)
  // a deck imported again here outlives the account's tombstone for it
  const merged = cloud ? merge(local, { ...cloud, deletedDecks: cloud.deletedDecks?.filter((d) => tombs[d] !== false) }) : local
  const same = (x: Snap) => JSON.stringify({ ...x, reviews: x.reviews.map(noId), deletedDecks: undefined })
  const changed = !!cloud && same(merged) !== same(local)
  if (changed) await importBackup(db, JSON.stringify(merged))
  // push what this device now holds: importing tidies the data (old separate hiragana/katakana cards are folded into one)
  await push(sb, s.user.id, changed ? { ...JSON.parse(await exportBackup(db)), deletedDecks: merged.deletedDecks } : merged, tombs)
  return changed
}

/** After a restore (inside exclusive): replace the account's copy with this device's, so the next sync doesn't merge the old progress back. No-op when signed out. */
export async function replaceCloud(db: Db) {
  const s = await session()
  if (!s) return
  const tombs = deckTombs()
  await push(await supabase(), s.user.id, await snapshot(db, tombs), tombs)
}

/** Signed in to another account than this device last synced with: keep this device's progress (the next sync merges it
 * into the account), or replace it with the account's (empty if the account has none). */
export async function switchAccount(db: Db, replace: boolean) {
  const s = await session()
  if (!s) return
  if (replace) {
    const cloud = await pull(await supabase(), s.user.id)
    await importBackup(db, JSON.stringify(cloud ?? { app: 'nihongo', version: 2, cards: [], reviews: [], decks: [], lessons: [], activity: [] }))
    setDeckTombs({})
  }
  try {
    localStorage.setItem(USER, s.user.id)
  } catch { /* private mode: fine */ }
}
