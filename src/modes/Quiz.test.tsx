// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyCard } from 'ts-fsrs'
import { afterEach, expect, it } from 'vitest'
import type { Db } from '../db/db'
import { Quiz } from './Quiz'

afterEach(cleanup)

it('number keys pick an option, as on the other review cards', async () => {
  const card = (id: string, back: string) => ({ id, deck: 'd', front: id, back: [back], fsrs: createEmptyCard() })
  const pool = [card('犬', 'dog'), card('猫', 'cat'), card('鳥', 'bird'), card('魚', 'fish')]
  render(<Quiz db={{} as Db} card={pool[0]} pool={pool} autoplay={false} onGrade={() => {}} />)
  const first = document.querySelectorAll('.grid button')[0].textContent
  await userEvent.setup().keyboard('1')
  expect(screen.getByRole('status').textContent).toMatch(first === 'dog' ? /Correct/ : /Incorrect/)
  expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy()
})
