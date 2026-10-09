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
  await screen.findByText('Start a streak today')
  expect(screen.getByText('Daily goal: 0 / 20 XP')).toBeTruthy()
  expect(buttons()).toEqual([[`Next lesson: ${LESSONS[0].title}`, true]])
  await user.click(screen.getByRole('button', { name: /^Next lesson/ }))
  expect(onLesson).toHaveBeenCalledWith(LESSONS[0].id)
  expect(screen.getByRole('heading', { name: 'N5' })).toBeTruthy() // progress on the level being learned
  expect(screen.getByRole('progressbar', { name: 'N5 kanji' })).toBeTruthy()
})

it('with cards due, reviewing leads; XP, goal and streak show', async () => {
  const db = await freshDb()
  await completeLesson(db, LESSONS[0], ITEMS, {}, 1) // 15 XP today
  await completeLesson(db, LESSONS[1], ITEMS, {}, 1) // 30 XP: goal met
  const c = (await db.get('cards', 'hira:あ'))!
  await db.put('cards', { ...c, fsrs: { ...c.fsrs, state: State.Review, due: new Date(0) } })
  const onReview = vi.fn()
  const user = userEvent.setup()
  render(<Today db={db} onReview={onReview} onLesson={() => {}} />)
  await screen.findByText('Daily goal: 30 / 20 XP')
  expect(screen.getByRole('heading', { name: 'Goal met today ✓' })).toBeTruthy()
  expect(screen.getByText(/1-day streak/)).toBeTruthy()
  const [first, second] = buttons()
  expect(first).toEqual([expect.stringMatching(/^Review 1 due/), true])
  expect(second).toEqual([`Next lesson: ${LESSONS[2].title}`, false])
  await user.click(screen.getByRole('button', { name: /^Review 1 due/ }))
  expect(onReview).toHaveBeenCalled()
})

it('uses the goal chosen in Settings, and a bad stored value falls back to 20', async () => {
  localStorage.setItem('nihongo.goal', '50')
  render(<Today db={await freshDb()} onReview={() => {}} onLesson={() => {}} />)
  await screen.findByText('Daily goal: 0 / 50 XP')
  cleanup()
  localStorage.setItem('nihongo.goal', '7')
  render(<Today db={await freshDb()} onReview={() => {}} onLesson={() => {}} />)
  await screen.findByText('Daily goal: 0 / 20 XP')
})
