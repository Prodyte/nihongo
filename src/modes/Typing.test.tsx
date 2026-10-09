// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyCard, Rating } from 'ts-fsrs'
import { afterEach, expect, it, vi } from 'vitest'
import type { Db, StoredCard } from '../db/db'
import { Typing } from './Typing'

afterEach(cleanup)
const card = (c: Partial<StoredCard>): StoredCard => ({ id: 'x', deck: 'vocab', front: '時間', back: ['time'], fsrs: createEmptyCard(), ...c })

it('a word card asks for the English meaning, forgives a slip, and shows the reading after', async () => {
  const onGrade = vi.fn()
  const user = userEvent.setup()
  render(<Typing db={{} as Db} card={card({ front: '病院', reading: 'びょういん', back: ['hospital'] })} pool={[]} autoplay={false} onGrade={onGrade} />)
  await user.type(screen.getByRole('textbox', { name: 'English meaning' }), 'hospitel{Enter}')
  expect(screen.getByRole('status').textContent).toMatch(/✓ Correct.*hospital/)
  expect(document.querySelector('[role=status] .reading')!.textContent).toBe('びょういん')
  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(onGrade).toHaveBeenCalledWith(Rating.Good)
})
it('a kana card asks for the romaji, exactly', async () => {
  const onGrade = vi.fn()
  const user = userEvent.setup()
  render(<Typing db={{} as Db} card={card({ deck: 'hira', front: 'し', back: ['shi', 'si'] })} pool={[]} autoplay={false} onGrade={onGrade} />)
  await user.type(screen.getByRole('textbox', { name: 'romaji answer' }), 'shu{Enter}')
  expect(screen.getByRole('status').textContent).toBe('✗ Answer: shi / si')
  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(onGrade).toHaveBeenCalledWith(Rating.Again)
})
