import { createEmptyCard } from 'ts-fsrs'
import { expect, it } from 'vitest'
import { intervals } from './scheduler'

it('previews the next interval for each grade, shortest for Again, longest for Easy', () => {
  const now = new Date('2026-03-10T12:00:00')
  const iv = intervals(createEmptyCard(now), now)
  expect(Object.keys(iv)).toEqual(['1', '2', '3', '4'])
  for (const v of Object.values(iv)) expect(v).toMatch(/^\d+(\.\d)?(m|h|d|mo|y)$/)
  expect(iv[1]).toMatch(/m$/) // Again on a new card: minutes
  expect(iv[4]).toMatch(/d$/) // Easy: days
})
