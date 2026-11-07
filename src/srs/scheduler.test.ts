import { createEmptyCard, State } from 'ts-fsrs'
import { expect, it } from 'vitest'
import { intervals } from './scheduler'

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
