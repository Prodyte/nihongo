// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ITEMS, lessonById } from '../course'
import type { Exercise } from '../lesson'
import { Explain } from './Explain'

afterEach(cleanup)

const lesson = lessonById('grammar-1-1')!
const ex = { type: 'explain', title: lesson.explain!.title, body: lesson.explain!.body, examples: lesson.explain!.examples.map((id) => ITEMS.get(id)!) } as Extract<Exercise, { type: 'explain' }>

it('shows the rule, two example sentences with reading and meaning, and Got it continues', async () => {
  const onDone = vi.fn()
  render(<Explain ex={ex} onDone={onDone} />)
  expect(screen.getByRole('heading', { name: /A は B です/ })).toBeTruthy()
  for (const p of lesson.explain!.body) expect(document.body.textContent).toContain(p)
  const examples = [...document.querySelectorAll('ul.examples li')]
  expect(examples).toHaveLength(2)
  expect(examples[0].textContent).toContain('わたしは がくせいです。')
  expect(examples[0].textContent).toContain('watashi wa gakusei desu')
  expect(examples[0].textContent).toContain('I am a student.')
  expect(examples[0].querySelector('[lang="ja"]')).toBeTruthy()
  await userEvent.setup({ delay: null }).click(screen.getByRole('button', { name: 'Got it' }))
  expect(onDone).toHaveBeenCalledWith([]) // nothing to miss
})
it('two identical paragraphs do not collide (no duplicate-key warning)', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  render(<Explain ex={{ ...ex, body: ['Same.', 'Same.', 'Same.'] }} onDone={() => {}} />)
  expect(spy).not.toHaveBeenCalled()
  spy.mockRestore()
})
it('Japanese inside the explanation is tagged lang="ja" and a held Enter cannot skip the card', () => {
  render(<Explain ex={ex} onDone={() => {}} />)
  expect([...document.querySelectorAll('.explain p [lang="ja"]')].length).toBeGreaterThan(3)
  expect(fireEvent.keyDown(screen.getByRole('button', { name: 'Got it' }), { key: 'Enter', repeat: true })).toBe(false)
})
