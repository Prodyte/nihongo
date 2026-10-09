// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { DECK_LINKS } from '../data/deckLinks'
import { openDb } from '../db/db'
import { Decks } from './Decks'

afterEach(cleanup)

it('lists every deck link, https only, unique, opened safely in a new tab', async () => {
  render(<Decks db={await openDb('decks-page-test')} />)
  const links = await screen.findAllByRole('link')
  expect(links).toHaveLength(DECK_LINKS.length)
  expect(new Set(DECK_LINKS.map((d) => d.url)).size).toBe(DECK_LINKS.length)
  for (const a of links) {
    expect(a.getAttribute('href')).toMatch(/^https:\/\//)
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
    expect(a.textContent).toContain('opens in a new tab')
  }
})

it("lists imported decks only: the path's built-in vocabulary deck can't be deleted from here", async () => {
  const db = await openDb('decks-filter-test')
  await db.put('decks', { id: 'vocab', name: 'Path words' })
  await db.put('decks', { id: 'anki:1', name: 'My Anki deck' })
  render(<Decks db={db} />)
  await screen.findByText('My Anki deck')
  expect(screen.queryByText('Path words')).toBeNull()
  expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1)
})
