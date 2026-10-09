import { seedKana, type ActivityRecord, type Db, type DeckRecord, type LessonRecord, type ReviewRecord, type StoredCard } from './db'

export class BackupError extends Error {}

const APP = 'nihongo'
const VERSION = 2 // v2 adds lessons + activity; v1 files still restore (path progress is then reset)

/** Progress backup: cards, reviews, decks, lesson progress, daily activity. Not media (large): re-import the .apkg to restore images/audio. */
export async function exportBackup(db: Db, now = new Date()): Promise<string> {
  const [cards, reviews, decks, lessons, activity] = await Promise.all([db.getAll('cards'), db.getAll('reviews'), db.getAll('decks'), db.getAll('lessons'), db.getAll('activity')])
  return JSON.stringify({ app: APP, version: VERSION, exportedAt: now, cards, reviews, decks, lessons, activity })
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const date = (v: unknown, what: string, optional = false) => {
  if (v == null && optional) return undefined
  const d = new Date(String(v))
  if (typeof v !== 'string' || Number.isNaN(d.getTime())) throw new BackupError(`Backup is corrupt: bad date in ${what}.`)
  return d
}

const fin = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
const nat = (v: unknown, min = 0) => typeof v === 'number' && Number.isInteger(v) && v >= min
const FSRS_NUMS = ['stability', 'difficulty', 'scheduled_days', 'learning_steps', 'reps', 'lapses', 'elapsed_days']
const LOG_NUMS = ['rating', 'state', 'stability', 'difficulty', 'scheduled_days', 'learning_steps']

function reviveCard(c: unknown): StoredCard {
  if (!isObj(c) || typeof c.id !== 'string' || typeof c.deck !== 'string' || typeof c.front !== 'string' ||
      !Array.isArray(c.back) || !c.back.every((b) => typeof b === 'string') || !isObj(c.fsrs))
    throw new BackupError('Backup is corrupt: a card is malformed.')
  const f = c.fsrs
  if (!FSRS_NUMS.every((k) => fin(f[k])) || ![0, 1, 2, 3].includes(f.state as number)) throw new BackupError('Backup is corrupt: a card has invalid scheduling data.')
  return { ...(c as unknown as StoredCard), fsrs: { ...(f as unknown as StoredCard['fsrs']), due: date(f.due, 'card.due')!, last_review: date(f.last_review, 'card.last_review', true) } }
}

function reviveLesson(l: unknown): LessonRecord {
  if (!isObj(l) || typeof l.id !== 'string' || !nat(l.plays, 1) || !fin(l.bestAccuracy) || (l.bestAccuracy as number) < 0 || (l.bestAccuracy as number) > 1) throw new BackupError('Backup is corrupt: a lesson record is malformed.')
  return { id: l.id, completedAt: date(l.completedAt, 'lesson.completedAt')!, plays: l.plays as number, bestAccuracy: l.bestAccuracy as number }
}

function reviveActivity(a: unknown): ActivityRecord {
  if (!isObj(a) || typeof a.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(a.date) || !nat(a.xp) || !nat(a.lessons))
    throw new BackupError('Backup is corrupt: an activity record is malformed.')
  return { date: a.date, xp: a.xp as number, lessons: a.lessons as number }
}

function reviveReview(r: unknown): ReviewRecord {
  if (!isObj(r) || typeof r.cardId !== 'string' || typeof r.grade !== 'number' || !isObj(r.log))
    throw new BackupError('Backup is corrupt: a review is malformed.')
  if (!LOG_NUMS.every((k) => fin((r.log as Record<string, unknown>)[k]))) throw new BackupError('Backup is corrupt: a review has invalid scheduling data.')
  return { ...(r as unknown as ReviewRecord), at: date(r.at, 'review.at')!, log: { ...(r.log as unknown as ReviewRecord['log']), due: date(r.log.due, 'log.due')!, review: date(r.log.review, 'log.review')! } }
}

/** Replace all cards, reviews, decks, lessons and activity with the backup's. Validates everything first, so a bad file changes nothing. */
export async function importBackup(db: Db, text: string) {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new BackupError('That file is not valid JSON.')
  }
  if (!isObj(raw) || raw.app !== APP) throw new BackupError('That is not a nihongo backup file.')
  if (raw.version !== 1 && raw.version !== VERSION) throw new BackupError(`Unsupported backup version ${String(raw.version)}.`)
  if (!Array.isArray(raw.cards) || !Array.isArray(raw.reviews) || !Array.isArray(raw.decks)) throw new BackupError('Backup is corrupt: missing data.')
  const extra = (k: 'lessons' | 'activity') => {
    if (raw.version === 1) return [] // v1 had no path data
    if (!Array.isArray(raw[k])) throw new BackupError('Backup is corrupt: missing data.')
    return raw[k] as unknown[]
  }
  const lessons = extra('lessons').map(reviveLesson)
  const activity = extra('activity').map(reviveActivity)
  if (new Set(lessons.map((l) => l.id)).size !== lessons.length) throw new BackupError('Backup is corrupt: duplicate lesson ids.')
  if (new Set(activity.map((a) => a.date)).size !== activity.length) throw new BackupError('Backup is corrupt: duplicate activity dates.')
  const cards = raw.cards.map(reviveCard)
  if (new Set(cards.map((c) => c.id)).size !== cards.length) throw new BackupError('Backup is corrupt: duplicate card ids.')
  const reviews = raw.reviews.map(reviveReview)
  const decks = raw.decks.map((d: unknown) => {
    if (!isObj(d) || typeof d.id !== 'string' || typeof d.name !== 'string') throw new BackupError('Backup is corrupt: a deck is malformed.')
    return d as unknown as DeckRecord
  })

  // ponytail: media of decks absent from the backup is left behind (orphaned but harmless)
  const tx = db.transaction(['cards', 'reviews', 'decks', 'lessons', 'activity'], 'readwrite')
  await Promise.all(['cards', 'reviews', 'decks', 'lessons', 'activity'].map((s) => tx.objectStore(s as 'cards').clear()))
  await Promise.all([
    ...cards.map((c) => tx.objectStore('cards').put(c)),
    ...reviews.map((r) => tx.objectStore('reviews').put(r)),
    ...decks.map((d) => tx.objectStore('decks').put(d)),
    ...lessons.map((l) => tx.objectStore('lessons').put(l)),
    ...activity.map((a) => tx.objectStore('activity').put(a)),
  ])
  await tx.done
  await seedKana(db) // a backup without (some of) the built-in kana must not leave them missing
  return { cards: cards.length, reviews: reviews.length, decks: decks.length, lessons: lessons.length }
}
