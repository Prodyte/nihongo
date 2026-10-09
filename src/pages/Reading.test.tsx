// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { openDb } from '../db/db'
import { getProgress } from '../path/progress'
import { STORIES } from '../path/stories'
import { Reading } from './Reading'

afterEach(cleanup)

it('open a story, tap a word to look it up, reveal a translation, answer the questions for XP', async () => {
  const db = await openDb('reading-1')
  const user = userEvent.setup()
  render(<Reading db={db} onExit={() => {}} />)
  await user.click(screen.getByRole('button', { name: /My day/ }))
  const words = document.querySelectorAll<HTMLButtonElement>('button.word')
  await user.click([...words].find((w) => w.textContent!.startsWith('起'))!)
  expect(document.querySelector('.lookup-pop')!.textContent).toMatch(/おきます · to wake up/) // the dictionary word, the form in the text, and its meaning
  await user.click(screen.getAllByRole('button', { name: 'Translate' })[0])
  expect(screen.getByText('I get up at seven every morning.')).toBeTruthy()
  const story = STORIES[0]
  const qs = document.querySelectorAll('fieldset.question')
  for (const [i, q] of story.questions.entries()) await user.click(within(qs[i] as HTMLElement).getByRole('button', { name: q.options[q.answer] }))
  expect(screen.getByText('3 of 3 right · +6 XP')).toBeTruthy()
  await vi.waitFor(async () => expect((await getProgress(db)).xpToday).toBe(6))
  expect(localStorage.getItem('nihongo.read')).toContain('my-day')
})
