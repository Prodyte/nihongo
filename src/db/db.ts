import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { Rating, State, type Card, type Grade, type ReviewLog } from 'ts-fsrs'
import { mediaRefs } from '../anki/refs'
import type { Parsed } from '../anki/apkg'
import { KANA, toKata } from '../data/kana'
import { newFsrsCard, schedule } from '../srs/scheduler'

export interface StoredCard {
  id: string
  deck: string // 'kana' (one card per sound: あ with ア), the path's decks; imported Anki decks get their own name
  front: string
  back: string[]
  fsrs: Card
  html?: boolean // imported Anki card: front/back[0] are HTML, not kana/romaji
  reading?: string // path words written with kanji: the kana reading (furigana, and what is spoken)
  saved?: number // Lookup's "Study this": saved at this time (ms); negative = unsaved at -saved, so sync keeps the latest choice
}
export interface DeckRecord { id: string; name: string }
/** Built-in decks the path creates when a lesson first teaches words or sentences (kana cards are seeded at startup). */
export const BUILTIN_DECKS = { word: { id: 'vocab', name: 'Path words' }, sentence: { id: 'grammar', name: 'Grammar sentences' }, kanji: { id: 'kanji', name: 'Path kanji' } } as const
export interface MediaRecord { key: string; data: Uint8Array; type: string } // key = `${deck}\0${filename}`
export interface LessonRecord { id: string; completedAt: Date; plays: number; bestAccuracy: number }
export interface ActivityRecord { date: string; xp: number; lessons: number } // date = local YYYY-MM-DD
export interface ReviewRecord {
  id?: number
  cardId: string
  grade: Grade
  at: Date
  log: ReviewLog
  lesson?: true // graded by a path lesson, test-out or placement, not a Review session: doesn't use up the daily new-card cap
}
interface Schema extends DBSchema {
  cards: { key: string; value: StoredCard; indexes: { 'by-deck': string } }
  reviews: { key: number; value: ReviewRecord; indexes: { 'by-card': string; 'by-at': Date } }
  decks: { key: string; value: DeckRecord }
  media: { key: string; value: MediaRecord }
  lessons: { key: string; value: LessonRecord }
  activity: { key: string; value: ActivityRecord }
}
export type Db = IDBPDatabase<Schema>

export const openDb = (name = 'nihongo') => {
  const opening: Promise<Db> = openDB<Schema>(name, 4, {
    // another tab opened a newer version: close this connection so its upgrade isn't blocked forever
    blocking() {
      void opening.then((d) => d.close())
    },
    upgrade(db, old, _new, tx) {
      if (old < 1) {
        db.createObjectStore('cards', { keyPath: 'id' }).createIndex('by-deck', 'deck')
        db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true }).createIndex('by-card', 'cardId')
      }
      if (old < 2) {
        db.createObjectStore('decks', { keyPath: 'id' })
        db.createObjectStore('media', { keyPath: 'key' })
      }
      if (old < 3) {
        db.createObjectStore('lessons', { keyPath: 'id' })
        db.createObjectStore('activity', { keyPath: 'date' })
      }
      if (old < 4) tx.objectStore('reviews').createIndex('by-at', 'at') // today's or this month's reviews without reading a year of them
    },
  })
  return opening
}

const SOUNDS = KANA.filter((k) => k.script === 'hira')
const KANA_UNITS: [string, number][] = [['basic', 9], ['voiced', 5], ['combos', 6]]

/** What a review card shows: a kana card both scripts (あ ア), anything else its front. */
export const cardFront = (c: StoredCard) => (c.deck === 'kana' ? `${c.front} ${toKata(c.front)}` : c.front)

/**
 * Add any kana cards not stored yet; existing cards keep their progress. Also folds the old separate hiragana and
 * katakana cards (hira:あ, kata:ア) into one card per sound (kana:あ): the better-known card's schedule wins, both review
 * histories move over, and a merged lesson counts as done when both old ones were. Runs at startup and after every
 * restore or sync, so data from an older version (or another device still on one) is folded in too.
 */
export async function seedKana(db: Db, now = new Date()) {
  const tx = db.transaction(['cards', 'reviews', 'lessons'], 'readwrite')
  const cards = tx.objectStore('cards')
  const reviews = tx.objectStore('reviews')
  const have = new Set(await cards.getAllKeys())
  for (const k of SOUNDS) {
    const id = `kana:${k.kana}`
    const oldIds = [`hira:${k.kana}`, `kata:${toKata(k.kana)}`].filter((o) => have.has(o))
    if (have.has(id) && !oldIds.length) continue
    const old = (await Promise.all(oldIds.map((o) => cards.get(o)))).filter((c): c is StoredCard => !!c)
    if (!have.has(id)) {
      const best = old.sort((a, b) => b.fsrs.stability - a.fsrs.stability || b.fsrs.reps - a.fsrs.reps)[0]
      await cards.add({ id, deck: 'kana', front: k.kana, back: k.romaji, fsrs: best?.fsrs ?? newFsrsCard(now) })
    }
    const seen = new Set((await reviews.index('by-card').getAll(id)).map((r) => r.at.getTime()))
    for (const o of oldIds) {
      for (const r of await reviews.index('by-card').getAll(o)) {
        await reviews.delete(r.id!)
        if (!seen.has(r.at.getTime())) { seen.add(r.at.getTime()); await reviews.add({ cardId: id, grade: r.grade, at: r.at, log: r.log }) }
      }
      await cards.delete(o)
    }
  }
  const lessons = tx.objectStore('lessons')
  for (const [unit, n] of KANA_UNITS)
    for (let i = 1; i <= n; i++) {
      const [h, k] = await Promise.all([lessons.get(`hira-${unit}-${i}`), lessons.get(`kata-${unit}-${i}`)])
      if (!h && !k) continue
      if (h && k && !(await lessons.get(`kana-${unit}-${i}`)))
        await lessons.put({ id: `kana-${unit}-${i}`, completedAt: h.completedAt > k.completedAt ? h.completedAt : k.completedAt, plays: Math.max(h.plays, k.plays), bestAccuracy: Math.min(h.bestAccuracy, k.bestAccuracy) })
      await Promise.all([lessons.delete(`hira-${unit}-${i}`), lessons.delete(`kata-${unit}-${i}`)])
    }
  await tx.done
}

export const getDeck = (db: Db, deck: string) => db.getAllFromIndex('cards', 'by-deck', deck)
export const getCards = (db: Db, deck: string) => (deck === 'all' ? db.getAll('cards') : getDeck(db, deck))

/** Cards a study mode can use: typing and quiz skip imported HTML cards; typing also skips whole sentences (typing English sentences exactly is needlessly harsh). */
export async function studyCards(db: Db, deck: string, mode: string) {
  let cards = await getCards(db, deck)
  // Mixed review never introduces kana you haven't met: the path teaches them. Picking a kana deck still offers them.
  if (deck === 'all') cards = cards.filter((c) => !(c.fsrs.state === State.New && c.deck === 'kana'))
  cards = cards.filter((c) => !(c.fsrs.state === State.New && (c.saved ?? 0) < 0)) // saved in Lookup, then unsaved before studying
  return mode === 'flashcard' ? cards : cards.filter((c) => !c.html) // grammar cards are reviewed fill-the-gap in every mode
}

export const DAILY_NEW = 20

/** What a session would hold right now: cards due, and new cards still allowed today. */
export async function reviewCounts(db: Db, deck: string, mode: string, now = new Date()) {
  const cards = await studyCards(db, deck, mode)
  const left = Math.max(0, DAILY_NEW - (await newToday(db, now)))
  return {
    due: cards.filter((c) => c.fsrs.state !== State.New && c.fsrs.due <= now).length,
    fresh: Math.min(left, cards.filter((c) => c.fsrs.state === State.New).length),
  }
}

/** Cards first studied in Review since local midnight, to enforce the daily new-card cap. Untagged reviews from before the `lesson` tag count. */
export async function newToday(db: Db, now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return (await db.getAllFromIndex('reviews', 'by-at', IDBKeyRange.lowerBound(start))).filter((r) => r.log.state === State.New && !r.lesson).length
}

/**
 * The reviews weakSpots needs to rank `cards`: the whole history of each card it could list (a miss or Hard in the last
 * 30 days, or 2+ lapses). Any other card scores under 2 and is never listed, so its reviews aren't read: after a year of
 * study, reading every review blocks a phone for about half a second.
 */
export async function weakSpotReviews(db: Db, cards: StoredCard[], now = new Date()) {
  const month = await db.getAllFromIndex('reviews', 'by-at', IDBKeyRange.lowerBound(new Date(now.getTime() - 30 * 86400000)))
  const ids = new Set([...month.filter((r) => r.grade <= Rating.Hard).map((r) => r.cardId), ...cards.filter((c) => c.fsrs.lapses >= 2).map((c) => c.id)])
  const byCard = db.transaction('reviews').store.index('by-card')
  return (await Promise.all([...ids].map((id) => byCard.getAll(id)))).flat()
}

/** Apply a grade: update the card and append a review record in one transaction. */
export async function gradeCard(db: Db, id: string, grade: Grade, now = new Date()): Promise<StoredCard> {
  const tx = db.transaction(['cards', 'reviews'], 'readwrite')
  const card = await tx.objectStore('cards').get(id)
  if (!card) throw new Error(`unknown card ${id}`)
  const { card: next, log } = schedule(card.fsrs, grade, now)
  const updated = { ...card, fsrs: next }
  await Promise.all([
    tx.objectStore('cards').put(updated),
    tx.objectStore('reviews').add({ cardId: id, grade, at: now, log }),
  ])
  await tx.done
  return updated
}

export const mediaKey = (deck: string, name: string) => `${deck}\0${name.normalize('NFC')}` // macOS filenames are often NFD
const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac', flac: 'audio/flac',
}

const TOMBS = 'nihongo.deletedDecks'
/** Decks deleted (true) or imported again (false) on this device since its last sync, so sync drops them everywhere or brings them back. */
export const deckTombs = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(TOMBS) ?? '{}')
  } catch {
    return {}
  }
}
export const setDeckTombs = (t: Record<string, boolean>) => {
  try {
    localStorage.setItem(TOMBS, JSON.stringify(t))
  } catch { /* private mode: a deleted deck may come back from another device */ }
}

/**
 * An SVG opened in its own tab runs its scripts as this origin (IndexedDB, localStorage): keep only safe SVG markup.
 * DOMPurify loads only when a deck has SVGs (import is lazy already; this keeps it out of the main bundle).
 */
async function cleanSvgs(media: Map<string, Uint8Array>) {
  const svgs = [...media.keys()].filter((n) => /\.svg$/i.test(n))
  if (!svgs.length) return media
  const { default: purify } = await import('dompurify')
  const out = new Map(media)
  for (const n of svgs) {
    const svg = purify.sanitize(new TextDecoder().decode(media.get(n)), { USE_PROFILES: { svg: true, svgFilters: true }, RETURN_DOM_FRAGMENT: true }).firstElementChild
    if (svg) out.set(n, new TextEncoder().encode(new XMLSerializer().serializeToString(svg))) // XML, not HTML, serialization: it's served as image/svg+xml
    else out.delete(n)
  }
  return out
}

/** Store a parsed deck. Re-importing refreshes content but keeps each card's review progress. */
export async function saveImport(db: Db, p: Parsed, fresh = (): StoredCard['fsrs'] => newFsrsCard()) {
  const media = await cleanSvgs(p.media) // before the transaction: an await on anything but it would commit it early
  const tx = db.transaction(['cards', 'decks', 'media'], 'readwrite')
  let added = 0
  let updated = 0
  for (const d of p.decks) await tx.objectStore('decks').put({ id: `anki:${d.id}`, name: d.name })
  for (const c of p.cards) {
    const id = `anki:${c.deckId}:${c.id}`
    const old = await tx.objectStore('cards').get(id)
    if (old) updated++
    else added++
    await tx.objectStore('cards').put({ id, deck: `anki:${c.deckId}`, front: c.front, back: [c.back], html: true, fsrs: old?.fsrs ?? fresh() })
  }
  // Each deck gets only the files its cards reference (subdecks share a package, not necessarily media).
  // ponytail: re-import never removes cards/media dropped upstream; a card moved between decks restarts.
  const refs = new Map<string, Set<string>>()
  for (const c of p.cards) {
    const names = refs.get(c.deckId) ?? new Set<string>()
    mediaRefs(c.front + c.back).forEach((n) => names.add(n))
    refs.set(c.deckId, names)
  }
  for (const [deckId, names] of refs)
    for (const name of names) {
      const data = media.get(name) // parseApkg keys media by NFC name
      if (data) await tx.objectStore('media').put({ key: mediaKey(`anki:${deckId}`, name), data, type: MIME[name.split('.').pop()!.toLowerCase()] ?? 'application/octet-stream' })
    }
  await tx.done
  setDeckTombs({ ...deckTombs(), ...Object.fromEntries(p.decks.map((d) => [`anki:${d.id}`, false])) })
  return { added, updated, skipped: p.skipped }
}

export async function deleteDeck(db: Db, id: string) {
  const tx = db.transaction(['cards', 'reviews', 'decks', 'media'], 'readwrite')
  for (const cid of await tx.objectStore('cards').index('by-deck').getAllKeys(id)) {
    for (const rid of await tx.objectStore('reviews').index('by-card').getAllKeys(cid)) await tx.objectStore('reviews').delete(rid)
    await tx.objectStore('cards').delete(cid)
  }
  await tx.objectStore('media').delete(IDBKeyRange.bound(mediaKey(id, ''), mediaKey(id, '\uffff')))
  await tx.objectStore('decks').delete(id)
  await tx.done
  setDeckTombs({ ...deckTombs(), [id]: true })
}
