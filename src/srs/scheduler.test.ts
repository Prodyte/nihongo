import { createEmptyCard, State } from 'ts-fsrs'
import { expect, it } from 'vitest'
import { dueCards, intervals } from './scheduler'

it('previews the next interval for each grade, shortest for Again, longest for Easy', () => {
  const now = new Date('2026-03-10T12:00:00')
  const iv = intervals(createEmptyCard(now), now)
  expect(Object.keys(iv)).toEqual(['1', '2', '3', '4'])
  for (const v of Object.values(iv)) expect(v).toMatch(/^\d+(\.\d)? (min|hours?|days?|months?|years?)$/)
  expect(iv[1]).toBe('1 min') // Again on a new card
  expect(iv[4]).toMatch(/ days$/) // Easy: days
})

it('spells units out and rounds at the unit boundary', () => {
  const now = new Date('2026-03-10T12:00:00')
  const review = { ...createEmptyCard(now), state: State.Review, stability: 60, difficulty: 5, reps: 5, scheduled_days: 60, last_review: new Date(now.getTime() - 60 * 864e5), due: now }
  for (const v of Object.values(intervals(review, now))) expect(v).toMatch(/^(\d+ min|\d+ hours?|\d+ days?|\d+ months?|\d+(\.\d)? years?)$/)
  expect(Object.values(intervals(review, now)).some((v) => /months?$/.test(v))).toBe(true)
})

it('a session takes cards still being learned first (oldest first), then due reviews by day, then new cards up to the limit', () => {
  const now = new Date('2026-03-10T12:00:00')
  const card = (id: string, state: State, due: string) => ({ id, fsrs: { ...createEmptyCard(now), state, due: new Date(due) } })
  const cards = [
    card('new1', State.New, '2026-03-10T00:00:00'), card('new2', State.New, '2026-03-10T00:00:00'),
    card('today', State.Review, '2026-03-10T08:00:00'), card('lastWeek', State.Review, '2026-03-03T23:00:00'),
    card('later', State.Review, '2026-03-10T12:00:01'), // not due yet
    card('relearn', State.Relearning, '2026-03-10T11:58:00'), card('learn', State.Learning, '2026-03-10T11:50:00'),
  ]
  expect(dueCards(cards, now, 1).map((c) => c.id)).toEqual(['learn', 'relearn', 'lastWeek', 'today', 'new1'])
  expect(dueCards(cards, now, 0).map((c) => c.id)).toEqual(['learn', 'relearn', 'lastWeek', 'today'])
})

it('reviews due the same day come in a different order each session, so a lesson\'s words stop arriving together in lesson order', () => {
  const now = new Date('2026-03-10T12:00:00')
  // six words graded in one lesson fall due at the same instant; an older day's review still comes before them
  const lesson = Array.from({ length: 6 }, (_, i) => ({ id: `w${i}`, fsrs: { ...createEmptyCard(now), state: State.Review, due: new Date('2026-03-10T07:00:00') } }))
  const cards = [...lesson, { id: 'old', fsrs: { ...createEmptyCard(now), state: State.Review, due: new Date('2026-03-09T07:00:00') } }]
  const orders = new Set(Array.from({ length: 20 }, () => dueCards(cards, now).map((c) => c.id).join()))
  expect(orders.size).toBeGreaterThan(1)
  for (const o of orders) {
    expect(o.startsWith('old,')).toBe(true)
    expect(o.split(',').sort()).toEqual(['old', 'w0', 'w1', 'w2', 'w3', 'w4', 'w5'])
  }
  let seed = 0.9
  const rand = () => (seed -= 0.1) // falling numbers: the reverse of the stored order
  expect(dueCards(lesson, now, 0, rand).map((c) => c.id)).toEqual(['w5', 'w4', 'w3', 'w2', 'w1', 'w0'])
})
