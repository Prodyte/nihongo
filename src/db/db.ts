import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { State, type Card, type Grade, type ReviewLog } from 'ts-fsrs'
import { KANA } from '../data/kana'
import { newFsrsCard, schedule } from '../srs/scheduler'

export interface StoredCard {
  id: string
  deck: string // e.g. 'hira', 'kata'; imported Anki decks get their own name
  front: string
  back: string[]
  fsrs: Card
}
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
}
export type Db = IDBPDatabase<Schema>

export const openDb = (name = 'nihongo') =>
  openDB<Schema>(name, 1, {
    upgrade(db) {
      db.createObjectStore('cards', { keyPath: 'id' }).createIndex('by-deck', 'deck')
      db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true }).createIndex('by-card', 'cardId')
    },
  })

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
