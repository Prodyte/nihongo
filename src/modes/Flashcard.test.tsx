// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyCard } from 'ts-fsrs'
import { afterEach, expect, it, vi } from 'vitest'
import { ITEMS } from '../path/course'
import type { Db } from '../db/db'
import { Flashcard } from './Flashcard'

afterEach(cleanup)

it('a kanji card shows its meanings, on/kun readings and an example word on the back', async () => {
  const user = userEvent.setup()
  render(<Flashcard db={{} as Db} card={{ id: 'kanji:日', deck: 'kanji', front: '日', back: ['day'], fsrs: createEmptyCard() }} pool={[]} autoplay={false} onGrade={() => {}} />)
  await user.click(screen.getByRole('button', { name: /Show answer/ }))
  expect(document.querySelector('.kanji-readings')!.textContent).toMatch(/音 .*ニチ|音 .*にち/)
  expect(document.querySelector('.kanji-readings')!.textContent).toMatch(/訓 /)
  expect(document.querySelector('.kanji-example')!.textContent).toMatch(/日/)
})

it('a word card asks in context: its sentence (word marked) on the front; the English and sound come with the answer', async () => {
  const mizu = ITEMS.get('vocab:mizu')!
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ [`${mizu.written ?? mizu.kanji ?? ''}|${mizu.jp}`]: ['水[みず]を飲[の]みます。', 'I drink water.', 1] })))
  const user = userEvent.setup()
  render(<Flashcard db={{} as Db} card={{ id: mizu.id, deck: 'vocab', front: 'みず', back: ['water'], fsrs: createEmptyCard() }} pool={[]} autoplay={false} onGrade={() => {}} />)
  const sentence = await screen.findByRole('figure')
  expect(sentence.querySelector('mark')!.textContent).toMatch(/^水/)
  expect(sentence.textContent).not.toContain('I drink water.')
  expect(sentence.querySelector('button')).toBeNull() // its sound would give the reading away
  await user.click(screen.getByRole('button', { name: /Show answer/ }))
  expect(sentence.textContent).toContain('I drink water.')
  expect(screen.getAllByRole('figure')).toHaveLength(1) // shown once, not again on the back
  vi.unstubAllGlobals()
})
