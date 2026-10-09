// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it } from 'vitest'
import App from './App'
import { KANA } from './data/kana'

afterEach(cleanup)
beforeEach(() => localStorage.setItem('nihongo.onboarded', '1')) // the welcome flow has its own test

const current = () => screen.getByRole('navigation', { name: 'Main' }).querySelector('[aria-current="page"]')!.textContent
const tab = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}$`) })

it('opens on Today; Review studies a flashcard end to end (full-screen), and reviewing starts a streak', async () => {
  const user = userEvent.setup()
  render(<App />)
  await screen.findByText('No streak yet')
  expect(current()).toBe('Today')

  await user.click(tab('Review'))
  await waitFor(() => expect(screen.getByText('0 due · 0 new')).toBeTruthy()) // all decks: kana you haven't met aren't offered
  expect(current()).toBe('Review')
  expect((screen.getByRole('combobox', { name: 'Deck' }) as HTMLSelectElement).value).toBe('all') // every deck by default
  await user.selectOptions(screen.getByRole('combobox', { name: 'Deck' }), 'hira') // choosing the kana deck does offer them
  await waitFor(() => expect(screen.getByText(/20 new/)).toBeTruthy())
  await user.click(screen.getByRole('button', { name: 'Study' }))

  await screen.findByText('20 left') // daily new-card cap
  expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull() // focused: no tabs
  const front = document.querySelector('.kana')!.textContent!
  await user.click(screen.getByRole('button', { name: /show answer/i }))
  const expected = KANA.find((k) => k.id === `hira:${front}`)!.romaji[0]
  expect(screen.getByText(expected, { selector: '.answer' })).toBeTruthy()

  await user.click(screen.getByRole('button', { name: /^Good/ }))
  await screen.findByText('19 left')
  await user.click(screen.getByRole('button', { name: 'Exit' }))
  expect(current()).toBe('Review') // back where the session started

  await user.selectOptions(screen.getByRole('combobox', { name: 'Mode' }), 'quiz')
  await user.click(tab('Today')) // the review counted as activity: 1 XP and a streak
  await screen.findByText('1-day streak')
  expect(screen.getByText(/1-day streak/)).toBeTruthy()
  await user.click(tab('Review'))
  expect((screen.getByRole('combobox', { name: 'Mode' }) as HTMLSelectElement).value).toBe('quiz') // the Review tab keeps its choices
})

it('a lesson started from Today is full-screen, and Exit returns to Today', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: /^Next lesson:/ }))
  await screen.findByRole('button', { name: 'Got it' })
  expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Exit' }))
  expect(current()).toBe('Today')
})

it('a lesson started from Path returns to Path; More leads to Decks, Stats and Settings', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: /^Path$/ }))
  await user.click(await screen.findByRole('button', { name: /^Continue:/ }))
  await user.click(await screen.findByRole('button', { name: 'Exit' }))
  expect(current()).toBe('Path')
  for (const [item, heading] of [['Grammar', 'Grammar'], ['Decks', 'Decks'], ['Stats', 'JLPT progress'], ['Settings', 'Settings'], ['Credits', 'Credits']]) {
    await user.click(tab('More'))
    await user.click(screen.getByRole('button', { name: new RegExp(`^${item}`) }))
    await screen.findByRole('heading', { name: heading })
    expect(current()).toBe('More')
  }
})
