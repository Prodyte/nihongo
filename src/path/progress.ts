import { Rating, State, type Grade } from 'ts-fsrs'
import { newFsrsCard, schedule } from '../srs/scheduler'
import { BUILTIN_DECKS, type Db, type StoredCard } from '../db/db'
import type { Item, Lesson } from './course'

// ---- pure helpers ----------------------------------------------------------------------------

/** Local calendar day as YYYY-MM-DD (activity is per local day, not per 24 h). */
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Consecutive active days ending today; a streak is still alive today if yesterday was active. */
export function streak(days: ReadonlySet<string>, today: Date): number {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (days.has(dayKey(d))) {
    n++
    d.setDate(d.getDate() - 1) // calendar arithmetic: safe across month, year and DST changes
  }
  return n
}

/** First completion earns 10 XP (+5 for a flawless run); repeating a lesson earns 5. */
export const xpFor = (first: boolean, flawless: boolean) => (first ? 10 + (flawless ? 5 : 0) : 5)

export const dailyGoalProgress = (xp: number, goal: number) => ({ xp, goal, fraction: Math.min(1, xp / goal), met: xp >= goal })

/** A lesson is open when the previous one is done (or when the learner chose to skip ahead). */
export const isUnlocked = (lessons: readonly Lesson[], index: number, done: ReadonlySet<string>, skipAhead: boolean) =>
  skipAhead || index === 0 || done.has(lessons[index - 1].id)

export const currentLesson = (lessons: readonly Lesson[], done: ReadonlySet<string>) => lessons.find((l) => !done.has(l.id)) ?? null

export const learnedItems = (lessons: readonly Lesson[], done: ReadonlySet<string>) =>
  new Set(lessons.filter((l) => done.has(l.id)).flatMap((l) => l.items))

/** Accepted typed answers for a vocabulary card: the full gloss, each comma part, each without "(…)", and verbs without "to ". */
export function glossAnswers(gloss: string): string[] {
  const parts = gloss.split(', ').flatMap((p) => [p, p.replace(/\s*\([^)]*\)/g, '').trim()])
  const all = parts.flatMap((p) => [p, p.replace(/^to /, '')]) // "to eat" is also accepted as "eat"
  return [...new Set([gloss, ...all].filter(Boolean))]
}

// ---- database --------------------------------------------------------------------------------

const rateByMisses = (misses: number): Grade => (misses === 0 ? Rating.Good : misses === 1 ? Rating.Hard : Rating.Again)

/**
 * Finish a lesson in ONE transaction: create vocabulary cards, grade each item once (only if its card is new or due,
 * so replaying a lesson can't inflate FSRS stability), record the lesson, and add XP.
 */
export async function completeLesson(
  db: Db, lesson: Lesson, items: ReadonlyMap<string, Item>, misses: Record<string, number>, accuracy: number, now = new Date(),
) {
  const lessonItems = lesson.items.map((id) => items.get(id) ?? failWith(`Unknown item ${id} in lesson ${lesson.id}`)) // before any write
  const tx = db.transaction(['cards', 'reviews', 'lessons', 'activity', 'decks'], 'readwrite')
  tx.done.catch(() => {}) // an abort is reported by the failing await below; don't also raise an unhandled rejection
  const best = Number.isFinite(accuracy) ? Math.min(1, Math.max(0, accuracy)) : 0
  const cards = tx.objectStore('cards')
  let graded = 0
  for (const item of lessonItems) {
    let card: StoredCard | undefined = await cards.get(item.id)
    if (!card && item.kind !== 'kana') {
      const deck = BUILTIN_DECKS[item.kind]
      card = { id: item.id, deck: deck.id, front: item.jp, back: item.kind === 'word' ? glossAnswers(item.gloss) : [item.gloss], fsrs: newFsrsCard(now) }
      await tx.objectStore('decks').put(deck)
    }
    if (!card) continue // kana cards are seeded at startup; nothing to grade if one is somehow missing
    if (card.fsrs.state === State.New || card.fsrs.due <= now) {
      const grade = rateByMisses(misses[item.id] ?? 0)
      const { card: next, log } = schedule(card.fsrs, grade, now)
      card = { ...card, fsrs: next }
      await tx.objectStore('reviews').add({ cardId: item.id, grade, at: now, log })
      graded++
    }
    await cards.put(card)
  }

  const old = await tx.objectStore('lessons').get(lesson.id)
  const flawless = lessonItems.every((i) => !misses[i.id])
  await tx.objectStore('lessons').put({
    id: lesson.id, completedAt: old?.completedAt ?? now, plays: (old?.plays ?? 0) + 1, bestAccuracy: Math.max(old?.bestAccuracy ?? 0, best),
  })
  const xp = xpFor(!old, flawless)
  const day = dayKey(now)
  const act = await tx.objectStore('activity').get(day)
  await tx.objectStore('activity').put({ date: day, xp: (act?.xp ?? 0) + xp, lessons: (act?.lessons ?? 0) + 1 })
  await tx.done
  return { xp, first: !old, flawless, graded }
}

/** +1 XP for a card reviewed in Study, so a streak rewards reviewing as well as lessons. */
export async function addReviewXp(db: Db, now = new Date()) {
  const tx = db.transaction('activity', 'readwrite')
  tx.done.catch(() => {})
  const day = dayKey(now)
  const act = await tx.store.get(day)
  await tx.store.put({ date: day, xp: (act?.xp ?? 0) + 1, lessons: act?.lessons ?? 0 })
  await tx.done
}

export async function getProgress(db: Db, now = new Date()) {
  const [lessons, activity] = await Promise.all([db.getAll('lessons'), db.getAll('activity')])
  const days = new Set(activity.filter((a) => a.xp > 0).map((a) => a.date))
  return {
    done: new Set(lessons.map((l) => l.id)),
    streak: streak(days, now),
    xpToday: activity.find((a) => a.date === dayKey(now))?.xp ?? 0,
  }
}

function failWith(msg: string): never {
  throw new Error(msg)
}
