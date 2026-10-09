// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Rating } from 'ts-fsrs'
import { afterEach, expect, it } from 'vitest'
import { gradeCard, openDb, seedKana } from '../db/db'
import { Home } from './Home'
import { MISTAKES, Study } from './Study'

afterEach(cleanup)

it('Review offers "Practise mistakes" for recent misses; drilling them leaves their schedule alone', async () => {
  const db = await openDb('practice-1')
  await seedKana(db)
  await gradeCard(db, 'hira:あ', Rating.Again) // a recent mistake
  const before = (await db.get('cards', 'hira:あ'))!.fsrs
  const reviews = await db.count('reviews')
  const user = userEvent.setup()
  let practised = false
  render(<Home db={db} config={{ deck: 'all', mode: 'flashcard' }} onChange={() => {}} onStart={() => {}} onPractice={() => { practised = true }} onDrill={() => {}} onRead={() => {}} onKana={() => {}} />)
  await user.click(await screen.findByRole('button', { name: 'Practise mistakes (1)' }))
  expect(practised).toBe(true)
  cleanup()

  render(<Study db={db} deck={MISTAKES} mode="flashcard" autoplay={false} onExit={() => {}} />)
  await screen.findByText('1 left')
  expect(document.querySelector('.kana')!.textContent).toBe('あ')
  await user.click(screen.getByRole('button', { name: /show answer/i }))
  await user.click(screen.getByRole('button', { name: /^Good/ }))
  await screen.findByText('Session complete 🎉')
  expect((await db.get('cards', 'hira:あ'))!.fsrs).toEqual(before) // practice is not a review
  expect(await db.count('reviews')).toBe(reviews)
})

it('when nothing is due, Review says so and when the next review comes', async () => {
  const db = await openDb('practice-2')
  await seedKana(db)
  await gradeCard(db, 'hira:い', Rating.Good)
  render(<Home db={db} config={{ deck: 'all', mode: 'flashcard' }} onChange={() => {}} onStart={() => {}} onPractice={() => {}} onDrill={() => {}} onRead={() => {}} onKana={() => {}} />)
  expect((await screen.findByText(/All caught up\. Next review in \d+ minutes?\./)).textContent).toBeTruthy()
  expect(screen.queryByRole('button', { name: /Practise mistakes/ })).toBeNull()
})
