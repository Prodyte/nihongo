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

/** When each grade would schedule the card next, as a short interval ("10m", "3h", "4d", "2mo"): shown on the grade buttons. */
export function intervals(card: Card, now = new Date()): Record<Grade, string> {
  const r = f.repeat(card, now)
  const fmt = (due: Date) => {
    const min = Math.max(1, Math.round((due.getTime() - now.getTime()) / 60000))
    return min < 60 ? `${min}m` : min < 1440 ? `${Math.round(min / 60)}h` : min < 43200 ? `${Math.round(min / 1440)}d` : min < 525600 ? `${Math.round(min / 43200)}mo` : `${(min / 525600).toFixed(1)}y`
  }
  return { 1: fmt(r[1].card.due), 2: fmt(r[2].card.due), 3: fmt(r[3].card.due), 4: fmt(r[4].card.due) } as Record<Grade, string>
}
