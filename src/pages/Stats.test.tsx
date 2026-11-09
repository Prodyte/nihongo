// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { Rating, State } from 'ts-fsrs'
import { openDb, seedKana, type Db, type ReviewRecord } from '../db/db'
import { Stats } from './Stats'

afterEach(() => { cleanup(); vi.useRealTimers() })

it('the activity grid counts only days that have happened', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 11, 12)) // a Wednesday: Thursday to Saturday are still to come
  const db = await openDb('stats-0')
  await seedKana(db)
  render(<Stats db={db} />)
  expect((await screen.findByRole('img', { name: /^Active on/ })).getAttribute('aria-label')).toBe('Active on 0 of the last 123 days')
})

it('a failed read says so instead of loading forever', async () => {
  const db = new Proxy({}, { get: () => () => Promise.reject(new Error('quota')) }) as Db // every read fails
  render(<Stats db={db} />)
  expect((await screen.findByRole('alert')).textContent).toMatch(/Couldn't load your stats/)
})

it('reviews today and all-time accuracy count every review', async () => {
  const db = await openDb('stats-1')
  await seedKana(db)
  const log = { state: State.Review } as ReviewRecord['log']
  const today = new Date()
  const earlier = new Date(today.getTime() - 3 * 86400000)
  for (const [grade, at] of [[Rating.Again, earlier], [Rating.Good, earlier], [Rating.Hard, today], [Rating.Again, today]] as const) await db.add('reviews', { cardId: 'kana:あ', grade, at, log })
  render(<Stats db={db} />)
  await screen.findByText('Reviews today')
  expect(screen.getByText('Reviews today').nextElementSibling!.textContent).toBe('2')
  expect(screen.getByText('Accuracy (all time)').nextElementSibling!.textContent).toBe('50%')
})
