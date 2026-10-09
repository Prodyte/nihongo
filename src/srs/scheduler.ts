import { createEmptyCard, fsrs, State, type Card, type Grade } from 'ts-fsrs'

const f = fsrs() // default FSRS params; per-user optimization is a later concern

export const newFsrsCard = (now = new Date()): Card => createEmptyCard(now)

export const schedule = (card: Card, grade: Grade, now = new Date()) => f.next(card, now, grade)

/** Due reviews/learning cards (oldest first), then up to `newLimit` unseen cards. */
export function dueCards<T extends { fsrs: Card }>(cards: T[], now = new Date(), newLimit = 20): T[] {
  const due = cards.filter((c) => c.fsrs.state !== State.New && c.fsrs.due <= now)
  due.sort((a, b) => a.fsrs.due.getTime() - b.fsrs.due.getTime())
  return [...due, ...cards.filter((c) => c.fsrs.state === State.New).slice(0, newLimit)]
}
