// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { openDb, seedKana } from '../db/db'
import { ITEMS, lessonById } from '../path/course'
import { completeLesson } from '../path/progress'
import { Home } from './Home'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })
let n = 0
const fresh = async () => { const db = await openDb(`hub-${n++}`); await seedKana(db); return db }
const tile = (title: string) => screen.getAllByRole('button').find((b) => b.querySelector('strong')?.textContent === title) as HTMLButtonElement

it('practice tiles say why they are unavailable, and open when they can', async () => {
  const db = await fresh()
  const onDrill = vi.fn(), onRead = vi.fn(), onKana = vi.fn()
  const user = userEvent.setup()
  render(<Home db={db} config={{ deck: 'all', mode: 'flashcard' }} onChange={() => {}} onStart={() => {}} onPractice={() => {}} onDrill={onDrill} onRead={onRead} onKana={onKana} />)
  await screen.findByRole('heading', { name: 'Practice' })
  expect(tile('Read aloud').disabled).toBe(true) // jsdom: no speech recognition
  expect(within(tile('Read aloud')).getByText(/Needs speech recognition/)).toBeTruthy()
  expect(tile('Verb conjugation').disabled).toBe(true)
  await user.click(tile('Reading'))
  await user.click(tile('Kana chart'))
  expect(onRead).toHaveBeenCalled()
  expect(onKana).toHaveBeenCalled()
})

it('after learning verbs, conjugation opens', async () => {
  const db = await fresh()
  for (const id of ['verbs-1', 'verbs-2', 'verbs-3']) await completeLesson(db, lessonById(id)!, ITEMS, {}, 1)
  const onDrill = vi.fn()
  const user = userEvent.setup()
  render(<Home db={db} config={{ deck: 'all', mode: 'flashcard' }} onChange={() => {}} onStart={() => {}} onPractice={() => {}} onDrill={onDrill} onRead={() => {}} onKana={() => {}} />)
  await screen.findByRole('heading', { name: 'Practice' })
  await vi.waitFor(() => expect(tile('Verb conjugation').disabled).toBe(false))
  await user.click(tile('Verb conjugation'))
  expect(onDrill).toHaveBeenCalledWith('conjugate')
})
