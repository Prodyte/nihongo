// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ITEMS } from '../course'
import { displayJp } from '../romaji'
import type { Exercise } from '../lesson'
import { Choice } from './Choice'

afterEach(cleanup)
type Ex = Extract<Exercise, { type: 'choice' | 'listen' }>
const show = (e: Ex) => { const onDone = vi.fn(); render(<Choice ex={e} autoplay={false} onDone={onDone} />); return { onDone, u: userEvent.setup({ delay: null }) } }
const options = () => within(screen.getByRole('group', { name: 'Answers' })).getAllByRole('button')

const item = ITEMS.get('sent:watashi-wa-gakusei-desu')!
const gap: Ex = { type: 'choice', item, dir: 'fill', prompt: displayJp(item.tokens!, 1), hint: item.gloss, options: ['の', 'は', 'を', 'か'], answer: 'は' }

it('a gap question shows the sentence with ＿, the English hint, and short particle options in two columns', () => {
  show(gap)
  expect(screen.getByText('Which word completes the sentence?')).toBeTruthy()
  expect(document.querySelector('.prompt')!.textContent).toBe('わたし＿ がくせいです。') // the gap is spaced like the particle it replaces
  expect(screen.getByText('I am a student.')).toBeTruthy()
  expect(document.querySelector('.grid')!.classList.contains('wide')).toBe(false)
  expect(options().map((b) => b.getAttribute('lang'))).toEqual(['ja', 'ja', 'ja', 'ja'])
})
it('the right particle is accepted; a wrong one is marked and the answer given', async () => {
  let r = show(gap)
  await r.u.click(options().find((b) => b.textContent!.startsWith('は'))!)
  expect(screen.getByText('✓ Correct')).toBeTruthy()
  await r.u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(r.onDone).toHaveBeenCalledWith([])
  cleanup()
  r = show(gap)
  await r.u.click(options().find((b) => b.textContent!.startsWith('の'))!)
  expect(screen.getByText('✗ Correct answer: は')).toBeTruthy()
  await r.u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(r.onDone).toHaveBeenCalledWith([item.id])
})
it('sentence options (translate, say, listen) use the full width; the sentence prompt is not giant kana', () => {
  const other = ITEMS.get('sent:anata-wa-sensei-desu')!
  show({ type: 'choice', item, dir: 'toGloss', prompt: item.jp, options: [item.gloss, other.gloss], answer: item.gloss })
  expect(document.querySelector('.grid')!.classList.contains('wide')).toBe(true)
  expect(document.querySelector('.prompt')!.classList.contains('sentence')).toBe(true)
  expect(screen.getByText('What does this mean?')).toBeTruthy()
  cleanup()
  show({ type: 'choice', item, dir: 'toJp', prompt: item.gloss, options: [item.jp, other.jp], answer: item.jp })
  expect(document.querySelector('.grid')!.classList.contains('wide')).toBe(true)
  expect(screen.getByText('How do you say “I am a student.”?')).toBeTruthy()
})
it('feedback for a sentence includes its reading and meaning', async () => {
  const { u } = show({ type: 'choice', item, dir: 'toGloss', prompt: item.jp, options: [item.gloss, 'x'], answer: item.gloss })
  await u.click(options()[0].textContent!.includes('x') ? options()[1] : options()[0])
  const status = screen.getAllByRole('status')[0]
  expect(status.textContent).toContain('わたしは がくせいです。')
  expect(status.textContent).toContain('(watashi wa gakusei desu)')
  expect(status.textContent).toContain('I am a student.')
})
