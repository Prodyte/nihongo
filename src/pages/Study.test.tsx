// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { openDb } from '../db/db'
import { LESSONS } from '../path/course'
import { newFsrsCard } from '../srs/scheduler'
import { Study } from './Study'

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
