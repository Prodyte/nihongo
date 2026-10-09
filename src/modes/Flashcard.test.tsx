// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyCard } from 'ts-fsrs'
import { afterEach, expect, it } from 'vitest'
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
