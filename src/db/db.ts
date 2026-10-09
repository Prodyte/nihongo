import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { State, type Card, type Grade, type ReviewLog } from 'ts-fsrs'
import { mediaRefs } from '../anki/refs'
import type { Parsed } from '../anki/apkg'
import { KANA } from '../data/kana'
import { newFsrsCard, schedule } from '../srs/scheduler'

export interface StoredCard {
  id: string
  deck: string // e.g. 'hira', 'kata'; imported Anki decks get their own name
  front: string
  back: string[]
  fsrs: Card
  html?: boolean // imported Anki card: front/back[0] are HTML, not kana/romaji
}
export interface DeckRecord { id: string; name: string }
export interface MediaRecord { key: string; data: Uint8Array; type: string } // key = `${deck}\0${filename}`
export interface LessonRecord { id: string; completedAt: Date; plays: number; bestAccuracy: number }
export interface ActivityRecord { date: string; xp: number; lessons: number } // date = local YYYY-MM-DD
export interface ReviewRecord {
  id?: number
  cardId: string
  grade: Grade
  at: Date
  log: ReviewLog
}
interface Schema extends DBSchema {
  cards: { key: string; value: StoredCard; indexes: { 'by-deck': string } }
  reviews: { key: number; value: ReviewRecord; indexes: { 'by-card': string } }
  decks: { key: string; value: DeckRecord }
  media: { key: string; value: MediaRecord }
  lessons: { key: string; value: LessonRecord }
  activity: { key: string; value: ActivityRecord }
}
export type Db = IDBPDatabase<Schema>

export const openDb = (name = 'nihongo') => {
  const opening: Promise<Db> = openDB<Schema>(name, 3, {
    // another tab opened a newer version: close this connection so its upgrade isn't blocked forever
    blocking() {
      void opening.then((d) => d.close())
    },
    upgrade(db, old) {
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
    },
  })
  return opening
}

/** Add any kana cards not stored yet; existing cards keep their progress. */
export async function seedKana(db: Db, now = new Date()) {
  const tx = db.transaction('cards', 'readwrite')
  const have = new Set(await tx.store.getAllKeys())
  await Promise.all(
    KANA.filter((k) => !have.has(k.id)).map((k) =>
      tx.store.add({ id: k.id, deck: k.script, front: k.kana, back: k.romaji, fsrs: newFsrsCard(now) }),
    ),
  )
  await tx.done
}

export const getDeck = (db: Db, deck: string) => db.getAllFromIndex('cards', 'by-deck', deck)
export const getCards = (db: Db, deck: string) => (deck === 'all' ? db.getAll('cards') : getDeck(db, deck))

/** Cards a study mode can use: typing and quiz skip imported HTML cards; typing also skips whole sentences (typing English sentences exactly is needlessly harsh). */
export async function studyCards(db: Db, deck: string, mode: string) {
  const cards = await getCards(db, deck)
  return mode === 'flashcard' ? cards : cards.filter((c) => !c.html && !(mode === 'typing' && c.deck === 'grammar'))
}

/** Cards first studied since local midnight, to enforce the daily new-card cap. */
export async function newToday(db: Db, now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  // ponytail: full scan of reviews; add an 'at' index if history grows large
  return (await db.getAll('reviews')).filter((r) => r.at >= start && r.log.state === State.New).length
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

/** Store a parsed deck. Re-importing refreshes content but keeps each card's review progress. */
export async function saveImport(db: Db, p: Parsed, fresh = (): StoredCard['fsrs'] => newFsrsCard()) {
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
      const data = p.media.get(name) // parseApkg keys media by NFC name
      if (data) await tx.objectStore('media').put({ key: mediaKey(`anki:${deckId}`, name), data, type: MIME[name.split('.').pop()!.toLowerCase()] ?? 'application/octet-stream' })
    }
  await tx.done
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
}
