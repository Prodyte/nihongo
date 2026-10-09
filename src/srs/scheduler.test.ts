import { describe, expect, it } from 'vitest'
import { Rating, State } from 'ts-fsrs'
import { dueCards, newFsrsCard, schedule } from './scheduler'

const t0 = new Date('2026-01-01T00:00:00Z')
const day = 86_400_000

describe('scheduler', () => {
  it('Easy pushes the next review further out than Again', () => {
    const again = schedule(newFsrsCard(t0), Rating.Again, t0).card
    const easy = schedule(newFsrsCard(t0), Rating.Easy, t0).card
    expect(easy.due.getTime()).toBeGreaterThan(again.due.getTime())
    expect(easy.state).toBe(State.Review)
    expect(again.state).toBe(State.Learning)
  })
  it('does not mutate the input card', () => {
    const c = newFsrsCard(t0)
    schedule(c, Rating.Good, t0)
    expect(c.reps).toBe(0)
  })
  it('dueCards: due reviews oldest first, then capped new cards, skipping future ones', () => {
    const reviewed = (due: number) => ({ id: `r${due}`, fsrs: { ...newFsrsCard(t0), state: State.Review, due: new Date(t0.getTime() + due) } })
    const fresh = (i: number) => ({ id: `n${i}`, fsrs: newFsrsCard(t0) })
    const now = new Date(t0.getTime() + day)
    const out = dueCards([reviewed(day * 2), reviewed(day / 2), reviewed(day), fresh(1), fresh(2), fresh(3)], now, 2)
    expect(out.map((c) => c.id)).toEqual([`r${day / 2}`, `r${day}`, 'n1', 'n2'])
  })
})
