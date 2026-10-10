// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { State } from 'ts-fsrs'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { openDb, seedKana } from '../db/db'
import { ITEMS, LESSONS } from '../path/course'
import { completeLesson } from '../path/progress'
import { Today } from './Today'

let n = 0
const freshDb = async () => { const db = await openDb(`today-${n++}`); await seedKana(db); return db }
beforeEach(() => localStorage.clear())
afterEach(cleanup)
const buttons = () => screen.getAllByRole('button').map((b) => [b.textContent, b.classList.contains('primary')])

it('a new learner: no streak, just the first lesson (kana come from the path, not as new review cards)', async () => {
  const onLesson = vi.fn()
  const user = userEvent.setup()
  render(<Today db={await freshDb()} onReview={() => {}} onLesson={onLesson} />)
  await screen.findByText('No streak yet')
  expect(screen.getByText('Do a lesson or a review to start one.')).toBeTruthy()
  expect(screen.queryByText(/XP/)).toBeNull()
  expect(buttons()).toEqual([[`Next lesson: ${LESSONS[0].title}`, true]])
  await user.click(screen.getByRole('button', { name: /^Next lesson/ }))
  expect(onLesson).toHaveBeenCalledWith(LESSONS[0].id)
  expect(screen.getByRole('heading', { name: 'N5' })).toBeTruthy() // progress on the level being learned
  expect(screen.getByRole('progressbar', { name: 'N5 kanji' })).toBeTruthy()
})

it('with cards due, reviewing leads; the streak shows, done for today', async () => {
  const db = await freshDb()
  await completeLesson(db, LESSONS[0], ITEMS, {}, 1) // 15 XP today
  await completeLesson(db, LESSONS[1], ITEMS, {}, 1) // 30 XP: goal met
  const c = (await db.get('cards', 'hira:あ'))!
  await db.put('cards', { ...c, fsrs: { ...c.fsrs, state: State.Review, due: new Date(0) } })
  const onReview = vi.fn()
  const user = userEvent.setup()
  render(<Today db={db} onReview={onReview} onLesson={() => {}} />)
  await screen.findByText('1-day streak')
  expect(screen.getByText(/Done for today\./)).toBeTruthy()
  expect(screen.queryByText(/XP/)).toBeNull()
  const [first, second] = buttons()
  expect(first).toEqual(['Review', true]) // reviews first, as the primary action
  expect(screen.getByText('1 review due')).toBeTruthy()
  expect(second).toEqual([`Next lesson: ${LESSONS[2].title}`, false])
  await user.click(screen.getByRole('button', { name: 'Review' }))
  expect(onReview).toHaveBeenCalled()
})

