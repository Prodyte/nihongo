// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { State } from 'ts-fsrs'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { KANA } from './data/kana'
import { openDb } from './db/db'

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
  await user.selectOptions(screen.getByRole('combobox', { name: 'Deck' }), 'kana') // choosing the kana deck does offer them
  await waitFor(() => expect(screen.getByText(/20 new/)).toBeTruthy())
  await user.click(screen.getByRole('button', { name: 'Study' }))

  await screen.findByText('20 left') // daily new-card cap
  expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull() // focused: no tabs
  const front = document.querySelector('.kana')!.textContent!
  await user.click(screen.getByRole('button', { name: /show answer/i }))
  expect(front).toMatch(/^\S+ \S+$/) // a kana card shows both scripts: あ ア
  const expected = KANA.find((k) => k.kana === front.split(' ')[0])!.romaji[0]
  expect(screen.getByText(expected, { selector: '.answer' })).toBeTruthy()

  await user.click(screen.getByRole('button', { name: /^Easy/ })) // Good would keep the new card for its 10-minute step
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
  for (const [item, heading] of [['Grammar', 'Grammar'], ['Decks', 'Decks'], ['Stats', 'JLPT progress'], ['Settings', 'Settings'], ['About', 'Credits']]) {
    await user.click(tab('More'))
    await user.click(screen.getByRole('button', { name: new RegExp(`^${item}`) }))
    await screen.findByRole('heading', { name: heading })
    expect(current()).toBe('More')
  }
})

it("the phone's back button goes back a screen (not out of the app); tabs don't pile up history; an exit button pops its entry", async () => {
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('navigation', { name: 'Main' })
  const depth = history.length
  await user.click(tab('Path'))
  await user.click(tab('More'))
  expect(history.length).toBe(depth) // tabs replace the entry
  await user.click(screen.getByRole('button', { name: /^Settings/ }))
  await screen.findByRole('heading', { name: 'Settings' })
  expect(history.length).toBe(depth + 1)
  history.back()
  await waitFor(() => expect(screen.getByRole('button', { name: /^Settings/ })).toBeTruthy()) // back on More
  expect(current()).toBe('More')
  await user.click(tab('Review'))
  await user.click(await screen.findByRole('button', { name: /^Kana chart/ }))
  await user.click(await screen.findByRole('button', { name: 'Exit' }))
  await waitFor(() => expect(current()).toBe('Review'))
  await new Promise((r) => setTimeout(r, 50)) // the exit's own history.back() must not move the view again
  expect(current()).toBe('Review')
})

it('the app icon badge shows the reviews due: cleared at 0, set when cards fall due, refreshed when the app is hidden', async () => {
  const badge = { setAppBadge: vi.fn(() => Promise.resolve()), clearAppBadge: vi.fn(() => Promise.resolve()) }
  Object.assign(navigator, badge)
  try {
    const db = await openDb()
    for (const c of await db.getAll('cards')) if (c.fsrs.state !== State.New) await db.delete('cards', c.id) // earlier tests' reviews
    db.close()
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(badge.clearAppBadge).toHaveBeenCalled()) // on startup
    expect(badge.setAppBadge).not.toHaveBeenCalled()
    const d = await openDb()
    const card = (await d.getAll('cards'))[0]
    await d.put('cards', { ...card, fsrs: { ...card.fsrs, state: State.Review, due: new Date(Date.now() - 60_000) } })
    d.close()
    await user.click(tab('Review')) // a screen change
    await waitFor(() => expect(badge.setAppBadge).toHaveBeenLastCalledWith(1))
    badge.setAppBadge.mockClear()
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await waitFor(() => expect(badge.setAppBadge).toHaveBeenCalledWith(1))
  } finally {
    delete (document as { visibilityState?: string }).visibilityState
    for (const k of Object.keys(badge)) delete (navigator as unknown as Record<string, unknown>)[k]
  }
})

it('the Review tab opens a mock JLPT test full-screen; Exit returns to Review', async () => {
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('navigation', { name: 'Main' })
  await user.click(tab('Review'))
  await user.click(await screen.findByRole('button', { name: /^Mock N4/ }))
  await screen.findByRole('heading', { name: 'Mock JLPT N4' })
  expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Exit' }))
  await waitFor(() => expect(current()).toBe('Review'))
})

it('the Review tab opens Listening full-screen when there is a Japanese voice; Exit returns to Review', async () => {
  vi.stubGlobal('speechSynthesis', { getVoices: () => [{ lang: 'ja-JP', name: 'Kyoko' }], speak: vi.fn(), cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })
  try {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('navigation', { name: 'Main' })
    await user.click(tab('Review'))
    await user.click(await screen.findByRole('button', { name: /^Listening comprehension/ }))
    await screen.findByRole('heading', { name: 'Listening' })
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Exit' }))
    await waitFor(() => expect(current()).toBe('Review'))
  } finally {
    vi.unstubAllGlobals()
  }
})
