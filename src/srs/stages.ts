import { Rating, State, type Card } from 'ts-fsrs'
import { dayKey } from '../path/progress'

/** WaniKani-style stages from how long FSRS expects you to remember a card (its stability, in days). */
export const STAGES = ['Apprentice', 'Guru', 'Master', 'Burned'] as const
export type Stage = (typeof STAGES)[number]
const BOUNDS: [number, Stage][] = [[7, 'Apprentice'], [30, 'Guru'], [180, 'Master']]

export function stage(card: Card): Stage | null {
  if (card.state === State.New) return null
  if (card.state !== State.Review) return 'Apprentice' // still learning, or relearning after a lapse
  return BOUNDS.find(([days]) => card.stability < days)?.[1] ?? 'Burned'
}

/** A card you keep forgetting (Anki calls these leeches): worth extra practice or a mnemonic. */
export const LEECH_LAPSES = 6
export const isLeech = (card: Card) => card.lapses >= LEECH_LAPSES

/** Reviews due on each of the next `days` local days (day 0 includes everything already overdue). */
export function forecast(cards: { fsrs: Card }[], now: Date, days = 7): { day: string; count: number }[] {
  const out = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    return { day: dayKey(d), count: 0 }
  })
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days)
  for (const { fsrs: c } of cards) {
    if (c.state === State.New || c.due >= end) continue
    const i = c.due <= now ? 0 : out.findIndex((o) => o.day === dayKey(c.due))
    if (i >= 0) out[i].count++
  }
  return out
}

/** When the next review falls due after `now` (null if nothing is scheduled). */
export function nextDue(cards: { fsrs: Card }[], now: Date): Date | null {
  let best: Date | null = null
  for (const { fsrs: c } of cards) if (c.state !== State.New && c.due > now && (!best || c.due < best)) best = c.due
  return best
}

/** "in 3 hours", "in 2 days": how long until a date, roughly. */
export function until(when: Date, now: Date): string {
  const min = Math.max(1, Math.round((when.getTime() - now.getTime()) / 60000))
  if (min < 60) return `in ${min} minute${min === 1 ? '' : 's'}`
  const h = Math.round(min / 60)
  if (h < 36) return `in ${h} hour${h === 1 ? '' : 's'}`
  const d = Math.round(h / 24)
  return `in ${d} days`
}

/**
 * Your weakest cards, weakest first: what "practise weak spots" drills. Misses in the last 30 days count (Again 2, or 3
 * within the last week; Hard 1), plus every lapse FSRS has recorded. A card answered right three times in a row since is
 * dropped: it has recovered. `why` says in a few words what put it on the list.
 */
export function weakSpots(reviews: { cardId: string; grade: number; at: Date }[], cards: { id: string; fsrs: Card }[], now: Date, limit = 20): { id: string; why: string }[] {
  const month = now.getTime() - 30 * 86400000
  const week = now.getTime() - 7 * 86400000
  const byCard = new Map<string, { grade: number; at: Date }[]>()
  for (const r of reviews) {
    const list = byCard.get(r.cardId)
    if (list) list.push(r)
    else byCard.set(r.cardId, [r])
  }
  const out: { id: string; why: string; score: number }[] = []
  for (const c of cards) {
    const rs = (byCard.get(c.id) ?? []).sort((a, b) => a.at.getTime() - b.at.getTime())
    const last3 = rs.slice(-3)
    if (last3.length === 3 && last3.every((r) => r.grade >= Rating.Good)) continue
    const recent = rs.filter((r) => r.at.getTime() >= month)
    const missed = recent.filter((r) => r.grade === Rating.Again)
    const hard = recent.filter((r) => r.grade === Rating.Hard).length
    const score = missed.reduce((n, r) => n + (r.at.getTime() >= week ? 3 : 2), 0) + hard + c.fsrs.lapses
    if (score < 2) continue
    const why = isLeech(c.fsrs) ? `forgotten ${c.fsrs.lapses} times` : missed.length ? `missed ${missed.length}× this month` : hard ? 'hard lately' : `forgotten ${c.fsrs.lapses} times`
    out.push({ id: c.id, why, score })
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit).map(({ id, why }) => ({ id, why }))
}
