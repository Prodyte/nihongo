// Cloud sync through Supabase: one row per user holding the same JSON as a backup file. Each sync pulls that row,
// merges it with this device's progress, saves the result locally (validated by importBackup) and pushes it back.
// ponytail: whole-snapshot rows; two devices syncing in the same second can drop one side's newest work. Move to
// per-record tables if that ever bites or the row grows past a few MB (≈10k reviews ≈ 3 MB).
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { exportBackup, importBackup } from './db/backup'
import type { Db } from './db/db'

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

export async function session(): Promise<Session | null> {
  if (!maybeSignedIn()) return null
  return (await (await supabase()).auth.getSession()).data.session
}

/* eslint-disable @typescript-eslint/no-explicit-any -- backup JSON, validated by importBackup */
type Snap = { cards: any[]; reviews: any[]; decks: any[]; lessons: any[]; activity: any[] } & Record<string, unknown>

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

/** Combine two snapshots: the more-reviewed copy of each card, every review once, every lesson and day of activity. */
export function merge(a: Snap, b: Snap): Snap {
  const t = (d: unknown) => (d ? new Date(d as string).getTime() : 0)
  return {
    ...a,
    cards: byKey(a.cards, b.cards, (c) => c.id, (x, y) => (y.fsrs.reps > x.fsrs.reps || (y.fsrs.reps === x.fsrs.reps && t(y.fsrs.last_review) > t(x.fsrs.last_review)) ? y : x)),
    // ids are per-device autoincrement keys: drop them and let this device number the merged list
    reviews: byKey(a.reviews, b.reviews, (r) => `${r.cardId}|${t(r.at)}`, (x) => x).map(noId),
    decks: byKey(a.decks, b.decks, (d) => d.id, (_, y) => y),
    lessons: byKey(a.lessons, b.lessons, (l) => l.id, (x, y) => ({ ...x, completedAt: t(x.completedAt) <= t(y.completedAt) ? x.completedAt : y.completedAt, plays: Math.max(x.plays, y.plays), bestAccuracy: Math.max(x.bestAccuracy, y.bestAccuracy) })),
    // max, not sum: the same day pushed from one device twice must not count double
    activity: byKey(a.activity, b.activity, (d) => d.date, (x, y) => ({ date: x.date, xp: Math.max(x.xp, y.xp), lessons: Math.max(x.lessons, y.lessons) })),
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const LAST = 'nihongo.lastSync'
export const lastSync = () => {
  try {
    return localStorage.getItem(LAST)
  } catch {
    return null
  }
}

let running: Promise<boolean> | null = null
/** Pull, merge, save, push. Resolves true when this device's data changed (screens should reload). No-op when signed out. */
export const sync = (db: Db) => (running ??= run(db).finally(() => (running = null)))

async function run(db: Db) {
  const s = await session()
  if (!s) return false
  const sb = await supabase()
  const { data, error } = await sb.from('progress').select('data').eq('user_id', s.user.id).maybeSingle()
  if (error) throw new Error(error.message)
  const mine = await exportBackup(db)
  const local = JSON.parse(mine) as Snap
  const merged = data ? merge(local, data.data as Snap) : local
  const text = JSON.stringify(merged)
  const changed = text !== JSON.stringify({ ...local, reviews: local.reviews.map(noId) })
  if (changed) await importBackup(db, text)
  const up = await sb.from('progress').upsert({ user_id: s.user.id, data: merged, updated_at: new Date().toISOString() })
  if (up.error) throw new Error(up.error.message)
  try {
    localStorage.setItem(LAST, new Date().toISOString())
  } catch { /* private mode: fine */ }
  return changed
}
