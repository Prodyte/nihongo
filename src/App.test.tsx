// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import App from './App'
import { KANA } from './data/kana'

afterEach(cleanup)

const current = () => screen.getByRole('navigation', { name: 'Main' }).querySelector('[aria-current="page"]')!.textContent

it('opens on the path; Review studies a flashcard end to end, and reviewing earns XP', async () => {
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('heading', { name: 'Your path' })
  expect(current()).toBe('Path')

  await user.click(screen.getByRole('button', { name: 'Review' }))
  await waitFor(() => expect(screen.getByText(/20 new/)).toBeTruthy())
  expect(current()).toBe('Review')
  const autoplay = screen.getByRole('checkbox', { name: /play audio automatically/i }) as HTMLInputElement
  expect(autoplay.checked).toBe(true) // on by default
  await user.click(autoplay)
  expect(localStorage.getItem('nihongo.autoplay')).toBe('0') // and the choice is remembered
  await user.click(screen.getByRole('button', { name: 'Study' }))

  await screen.findByText('20 left') // daily new-card cap
  expect(current()).toBe('Review') // still the Review tab while studying
  const front = document.querySelector('.kana')!.textContent!
  await user.click(screen.getByRole('button', { name: /show answer/i }))
  const expected = KANA.find((k) => k.id === `hira:${front}`)!.romaji[0]
  expect(screen.getByText(expected, { selector: '.answer' })).toBeTruthy()

  await user.click(screen.getByRole('button', { name: /^Good/ }))
  await screen.findByText('19 left')

  await user.click(screen.getByRole('button', { name: 'Path' })) // the review counted as activity: 1 XP and a streak
  await screen.findByText('Daily goal: 1 / 20 XP')
  expect(screen.getByText('🔥 1-day streak')).toBeTruthy()
})

it('a lesson is full-screen (no tabs), and Exit brings the tabs back', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: /^Continue:/ }))
  await screen.findByRole('button', { name: 'Got it' })
  expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
  await user.click(screen.getByRole('button', { name: '← Exit' }))
  expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy()
  expect(current()).toBe('Path')
})
