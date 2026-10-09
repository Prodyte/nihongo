import type { Db, DeckRecord, ReviewRecord, StoredCard } from './db'

export class BackupError extends Error {}

const APP = 'nihongo'
const VERSION = 1

/** Progress backup: cards, reviews, decks. Not media (large): re-import the .apkg to restore images/audio. */
export async function exportBackup(db: Db, now = new Date()): Promise<string> {
  const [cards, reviews, decks] = await Promise.all([db.getAll('cards'), db.getAll('reviews'), db.getAll('decks')])
  return JSON.stringify({ app: APP, version: VERSION, exportedAt: now, cards, reviews, decks })
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const date = (v: unknown, what: string, optional = false) => {
  if (v == null && optional) return undefined
  const d = new Date(String(v))
  if (typeof v !== 'string' || Number.isNaN(d.getTime())) throw new BackupError(`Backup is corrupt: bad date in ${what}.`)
  return d
}

function reviveCard(c: unknown): StoredCard {
  if (!isObj(c) || typeof c.id !== 'string' || typeof c.deck !== 'string' || typeof c.front !== 'string' ||
      !Array.isArray(c.back) || !c.back.every((b) => typeof b === 'string') || !isObj(c.fsrs))
    throw new BackupError('Backup is corrupt: a card is malformed.')
  const f = c.fsrs
  return { ...(c as unknown as StoredCard), fsrs: { ...(f as unknown as StoredCard['fsrs']), due: date(f.due, 'card.due')!, last_review: date(f.last_review, 'card.last_review', true) } }
}

function reviveReview(r: unknown): ReviewRecord {
  if (!isObj(r) || typeof r.cardId !== 'string' || typeof r.grade !== 'number' || !isObj(r.log))
    throw new BackupError('Backup is corrupt: a review is malformed.')
  return { ...(r as unknown as ReviewRecord), at: date(r.at, 'review.at')!, log: { ...(r.log as unknown as ReviewRecord['log']), due: date(r.log.due, 'log.due')!, review: date(r.log.review, 'log.review')! } }
}

/** Replace all cards, reviews and decks with the backup's. Validates everything first, so a bad file changes nothing. */
export async function importBackup(db: Db, text: string) {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new BackupError('That file is not valid JSON.')
  }
  if (!isObj(raw) || raw.app !== APP) throw new BackupError('That is not a nihongo backup file.')
  if (raw.version !== VERSION) throw new BackupError(`Unsupported backup version ${String(raw.version)}.`)
  if (!Array.isArray(raw.cards) || !Array.isArray(raw.reviews) || !Array.isArray(raw.decks)) throw new BackupError('Backup is corrupt: missing data.')
  const cards = raw.cards.map(reviveCard)
  const reviews = raw.reviews.map(reviveReview)
  const decks = raw.decks.map((d: unknown) => {
    if (!isObj(d) || typeof d.id !== 'string' || typeof d.name !== 'string') throw new BackupError('Backup is corrupt: a deck is malformed.')
    return d as unknown as DeckRecord
  })

  // ponytail: media of decks absent from the backup is left behind (orphaned but harmless)
  const tx = db.transaction(['cards', 'reviews', 'decks'], 'readwrite')
  await Promise.all([tx.objectStore('cards').clear(), tx.objectStore('reviews').clear(), tx.objectStore('decks').clear()])
  await Promise.all([
    ...cards.map((c) => tx.objectStore('cards').put(c)),
    ...reviews.map((r) => tx.objectStore('reviews').put(r)),
    ...decks.map((d) => tx.objectStore('decks').put(d)),
  ])
  await tx.done
  return { cards: cards.length, reviews: reviews.length, decks: decks.length }
}
