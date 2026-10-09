// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyCard, Rating } from 'ts-fsrs'
import { afterEach, expect, it, vi } from 'vitest'
import type { Db } from '../db/db'
import { ITEMS } from '../path/course'
import { Cloze } from './Cloze'

afterEach(cleanup)
const id = 'sent:watashi-wa-gakusei-desu'

for (const right of [true, false])
  it(`a grammar card shows its sentence with the gap and the English; ${right ? 'right is Good' : 'wrong is Again'}`, async () => {
    const onGrade = vi.fn()
    const user = userEvent.setup()
    render(<Cloze db={{} as Db} card={{ id, deck: 'grammar', front: 'わたしは がくせいです。', back: ['I am a student.'], fsrs: createEmptyCard() }} pool={[]} autoplay={false} onGrade={onGrade} />)
    expect(screen.getByText('Which word completes the sentence?')).toBeTruthy()
    expect(screen.getByText(ITEMS.get(id)!.gloss)).toBeTruthy()
    const options = screen.getByRole('group', { name: 'Answers' }).querySelectorAll('button')
    const pick = [...options].find((b) => (b.textContent!.trim().startsWith('は')) === right)!
    await user.click(pick)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onGrade).toHaveBeenCalledWith(right ? Rating.Good : Rating.Again)
  })
