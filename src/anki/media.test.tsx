// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { render, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { openDb, saveImport } from '../db/db'
import { Html } from './media'

it("the answer side doesn't autoplay the question's audio again", async () => {
  const db = await openDb('html-test')
  const front = '[sound:q.mp3]'
  const back = `${front}<br>[sound:a.mp3]` // {{FrontSide}} without <hr id=answer>
  await saveImport(db, { decks: [{ id: '1', name: 'D' }], cards: [{ id: '9', deckId: '1', front, back }], media: new Map([['q.mp3', new Uint8Array([1])], ['a.mp3', new Uint8Array([2])]]), skipped: 0 })
  const played: string[] = []
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) { played.push(this.dataset.media!); return new Promise(() => {}) })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  const { rerender } = render(<Html db={db} deck="anki:1" html={front} autoplay />)
  await waitFor(() => expect(played).toEqual(['q.mp3']))
  rerender(<Html db={db} deck="anki:1" html={back} autoplay />)
  await waitFor(() => expect(played).toEqual(['q.mp3', 'a.mp3']))
})
