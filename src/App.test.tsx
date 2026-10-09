// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import App from './App'
import { KANA } from './data/kana'

afterEach(cleanup)

it('studies a hiragana flashcard end to end', async () => {
  const user = userEvent.setup()
  render(<App />)
  // nav also has a "Study" button; the home card's is the second one
  await waitFor(() => expect(screen.getByText(/20 new/)).toBeTruthy())
  await user.click(screen.getAllByRole('button', { name: 'Study' })[1])

  await screen.findByText('20 left') // daily new-card cap
  const front = document.querySelector('.kana')!.textContent!
  await user.click(screen.getByRole('button', { name: /show answer/i }))
  const expected = KANA.find((k) => k.id === `hira:${front}`)!.romaji[0]
  expect(screen.getByText(expected, { selector: '.answer' })).toBeTruthy()

  await user.click(screen.getByRole('button', { name: /^Good/ }))
  await screen.findByText('19 left')
})
