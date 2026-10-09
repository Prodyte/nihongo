// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it } from 'vitest'
import App from '../App'

beforeEach(() => localStorage.clear())
afterEach(cleanup)

it('a first visit shows the welcome flow; "new to Japanese" lands on Today, and it never shows again', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: 'Get started' }))
  await user.click(screen.getByRole('radio', { name: /I’m new to Japanese/ }))
  await user.click(screen.getByRole('button', { name: 'Start learning' }))
  await screen.findByText('No streak yet')
  cleanup()
  render(<App />)
  await screen.findByText('No streak yet')
  expect(screen.queryByRole('button', { name: 'Get started' })).toBeNull()
})

it('"I can read kana" starts the kana test-out', async () => {
  localStorage.clear()
  indexedDB.deleteDatabase('nihongo')
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: 'Get started' }))
  await user.click(screen.getByRole('radio', { name: /I can read hiragana and katakana/ }))
  await user.click(screen.getByRole('button', { name: 'Start the test' }))
  expect(await screen.findByText(/^Test: Katakana: combined sounds · covers 40 lessons/)).toBeTruthy()
})
