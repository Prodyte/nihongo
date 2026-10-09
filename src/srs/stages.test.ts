import { createEmptyCard, Rating, State } from 'ts-fsrs'
import { describe, expect, it } from 'vitest'
import { forecast, isLeech, mistakes, nextDue, stage, until } from './stages'

const c = createEmptyCard(new Date('2026-01-01'))
const card = (o: Partial<typeof c>) => ({ ...c, ...o })
const now = new Date('2026-03-10T12:00:00')

describe('stages', () => {
  it('new cards have no stage; learning is Apprentice; reviews by stability: <7 Apprentice, <30 Guru, <180 Master, else Burned', () => {
    expect(stage(c)).toBeNull()
    expect(stage(card({ state: State.Learning, stability: 100 }))).toBe('Apprentice')
    expect(stage(card({ state: State.Relearning, stability: 100 }))).toBe('Apprentice')
    expect([3, 7, 29, 30, 179, 180, 900].map((s) => stage(card({ state: State.Review, stability: s })))).toEqual(['Apprentice', 'Guru', 'Guru', 'Master', 'Master', 'Burned', 'Burned'])
  })
  it('a leech has lapsed 6+ times', () => {
    expect(isLeech(card({ lapses: 5 }))).toBe(false)
    expect(isLeech(card({ lapses: 6 }))).toBe(true)
  })
})

describe('forecast and next review', () => {
  const at = (iso: string, state = State.Review) => ({ fsrs: card({ state, due: new Date(iso) }) })
  const cards = [at('2026-03-01T00:00:00'), at('2026-03-10T18:00:00'), at('2026-03-11T08:00:00'), at('2026-03-16T23:00:00'), at('2026-03-17T01:00:00'), at('2026-03-10T13:00:00', State.New)]
  it('counts per local day for a week; overdue counts today; new cards and later ones are left out', () => {
    expect(forecast(cards, now).map((d) => d.count)).toEqual([2, 1, 0, 0, 0, 0, 1])
    expect(forecast(cards, now)[0].day).toBe('2026-03-10')
  })
  it('nextDue is the soonest future review; until reads it roughly', () => {
    expect(nextDue(cards, now)).toEqual(new Date('2026-03-10T18:00:00'))
    expect(nextDue([], now)).toBeNull()
    expect(until(new Date('2026-03-10T12:30:00'), now)).toBe('in 30 minutes')
    expect(until(new Date('2026-03-10T18:00:00'), now)).toBe('in 6 hours')
    expect(until(new Date('2026-03-13T12:00:00'), now)).toBe('in 3 days')
  })
})

describe('mistakes', () => {
  it('cards answered Again in the last 7 days, plus leeches', () => {
    const reviews = [
      { cardId: 'a', grade: Rating.Again, at: new Date('2026-03-09') },
      { cardId: 'b', grade: Rating.Good, at: new Date('2026-03-09') },
      { cardId: 'c', grade: Rating.Again, at: new Date('2026-02-01') }, // too long ago
    ]
    const cards = [{ id: 'd', fsrs: card({ lapses: 8 }) }, { id: 'e', fsrs: c }]
    expect([...mistakes(reviews, cards, now)].sort()).toEqual(['a', 'd'])
  })
})
