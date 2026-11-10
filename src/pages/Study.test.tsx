// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { State } from 'ts-fsrs'
import { afterEach, expect, it } from 'vitest'
import { openDb } from '../db/db'
import { LESSONS } from '../path/course'
import { newFsrsCard } from '../srs/scheduler'
import { SESSION, Study } from './Study'

afterEach(cleanup)

it('a learning card due within the session stays in it until it graduates', async () => {
  const db = await openDb('study-1')
  await db.put('cards', { id: 'x', deck: 'd', front: '犬', back: ['dog'], fsrs: newFsrsCard() })
  const user = userEvent.setup()
  render(<Study db={db} deck="d" mode="flashcard" autoplay={false} onExit={() => {}} />)
  const good = async () => {
    await user.click(await screen.findByRole('button', { name: /show answer/i }))
    await user.click(screen.getByRole('button', { name: /^Good/ }))
  }
  await good() // new -> learning, due in 10 min
  await screen.findByText('0 left · 1 again') // answered once, back in minutes: not counted as left to do
  await good() // graduates (days away)
  await screen.findByRole('heading', { name: /Session complete/ })
  screen.getByText('1 card · 1 remembered first time')
})

it('Undo takes back the last grade: the card comes back as it was and its review is gone', async () => {
  const db = await openDb('study-undo')
  const fsrs = newFsrsCard()
  await db.put('cards', { id: 'x', deck: 'd', front: '犬', back: ['dog'], fsrs })
  const user = userEvent.setup()
  render(<Study db={db} deck="d" mode="flashcard" autoplay={false} onExit={() => {}} />)
  await user.click(await screen.findByRole('button', { name: /show answer/i }))
  await user.click(screen.getByRole('button', { name: /^Easy/ })) // a mis-tap: days away, the session ends
  await screen.findByRole('heading', { name: /Session complete/ })
  expect(await db.count('reviews')).toBe(1)
  await user.click(screen.getByRole('button', { name: 'Undo' }))
  await screen.findByRole('button', { name: /show answer/i })
  expect(await db.count('reviews')).toBe(0)
  expect((await db.get('cards', 'x'))!.fsrs.state).toBe(fsrs.state)
  expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull() // one step back, not a history
})

it('a load error still offers a way out', async () => {
  const db = await openDb('study-err')
  db.close() // every read now throws
  let left = false
  render(<Study db={db} deck="d" mode="flashcard" autoplay={false} onExit={() => (left = true)} />)
  await screen.findByRole('alert')
  screen.getByRole('button', { name: 'Try again' })
  await userEvent.setup().click(screen.getByRole('button', { name: 'Exit' }))
  expect(left).toBe(true)
})

it('the end of a review offers the next lesson, with Done beside it', async () => {
  const db = await openDb('study-next')
  await db.put('cards', { id: 'x', deck: 'd', front: '犬', back: ['dog'], fsrs: newFsrsCard() })
  let started = ''
  const user = userEvent.setup()
  render(<Study db={db} deck="d" mode="flashcard" autoplay={false} onExit={() => {}} onLesson={(id) => (started = id)} />)
  await user.click(await screen.findByRole('button', { name: /show answer/i }))
  await user.click(screen.getByRole('button', { name: /^Easy/ }))
  await user.click(await screen.findByRole('button', { name: /^Next lesson: / }))
  expect(started).toBe(LESSONS[0].id) // nothing done yet: the first lesson
  expect(screen.getByRole('button', { name: 'Done' }).className).not.toContain('primary') // one seal: the lesson is the step
})

/** A review card that fell due yesterday. */
const due = (i: number) => ({ id: `c${i}`, deck: 'd', front: `字${i}`, back: [`m${i}`], fsrs: { ...newFsrsCard(), state: State.Review, stability: 30, difficulty: 5, reps: 3, scheduled_days: 30, last_review: new Date(Date.now() - 31 * 864e5), due: new Date(Date.now() - 864e5) } })

it('a long queue comes a batch at a time: 30 cards, how many are waiting, and Keep going takes the next batch', async () => {
  const db = await openDb('study-batches')
  for (let i = 0; i < 50; i++) await db.put('cards', due(i))
  const user = userEvent.setup({ delay: null })
  render(<Study db={db} deck="d" mode="flashcard" autoplay={false} onExit={() => {}} />)
  const run = async (n: number) => {
    for (let i = 0; i < n; i++) {
      await user.click(await screen.findByRole('button', { name: /show answer/i }))
      await user.click(screen.getByRole('button', { name: /^Good/ }))
    }
  }
  await screen.findByText(`${SESSION} left`) // not "50 left"
  await run(SESSION)
  await screen.findByRole('heading', { name: /Session complete/ })
  screen.getByText('30 cards · 30 remembered first time')
  screen.getByText('20 more are waiting.')
  expect(screen.queryByText(/Next review/)).toBeNull() // the next review is now
  expect(screen.getByRole('button', { name: 'Keep going' }).className).toContain('primary')
  await user.click(screen.getByRole('button', { name: 'Keep going' }))
  await screen.findByText('20 left') // the rest: under a batch and a half, so all of it
  await run(20)
  await screen.findByRole('heading', { name: /Session complete/ })
  screen.getByText('20 cards · 20 remembered first time') // this batch's own count
  expect(screen.queryByRole('button', { name: 'Keep going' })).toBeNull()
  expect(await db.count('reviews')).toBe(50)
})

it('a queue up to a batch and a half is taken whole, so nobody is left a handful', async () => {
  const db = await openDb('study-whole')
  for (let i = 0; i < 45; i++) await db.put('cards', due(i))
  render(<Study db={db} deck="d" mode="flashcard" autoplay={false} onExit={() => {}} />)
  await screen.findByText('45 left')
})
