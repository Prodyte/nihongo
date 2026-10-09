// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ITEMS } from '../course'
import type { Exercise } from '../lesson'
import { Build } from './Build'

afterEach(cleanup)

const make = (id: string, bank?: string[]): Extract<Exercise, { type: 'build' }> => {
  const item = ITEMS.get(id)!
  return { type: 'build', item, bank: bank ?? [...item.tokens!, ...(item.bank ?? [])].reverse(), answer: item.tokens!, alts: item.alts ?? [] }
}
const show = (ex: Extract<Exercise, { type: 'build' }>) => {
  const onDone = vi.fn()
  render(<Build ex={ex} onDone={onDone} />)
  return { onDone, u: userEvent.setup({ delay: null }) }
}
const bank = () => within(screen.getByRole('group', { name: 'Word bank' }))
const sentence = () => within(screen.getByRole('group', { name: 'Your sentence' }))
const tap = (u: ReturnType<typeof userEvent.setup>, t: string) => u.click(bank().getAllByRole('button').find((b) => b.textContent === t && !(b as HTMLButtonElement).disabled)!)
const SENTENCE = 'sent:watashi-wa-gakusei-desu'

it('shows the English, a word bank that includes a wrong chunk, and an empty answer', () => {
  show(make(SENTENCE))
  expect(screen.getByText('I am a student.')).toBeTruthy()
  expect(bank().getAllByRole('button').map((b) => b.textContent).sort()).toEqual(['がくせい', 'です', 'は', 'も', 'わたし'].sort()) // 4 chunks + the wrong も
  expect(screen.getByText('Tap the words below')).toBeTruthy()
  expect((screen.getByRole('button', { name: 'Check' }) as HTMLButtonElement).disabled).toBe(true)
})

it('the right order is accepted', async () => {
  const { onDone, u } = show(make(SENTENCE))
  for (const t of ['わたし', 'は', 'がくせい', 'です']) await tap(u, t)
  await u.click(screen.getByRole('button', { name: 'Check' }))
  expect(screen.getByText('✓ Correct')).toBeTruthy()
  await u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(onDone).toHaveBeenCalledWith([])
})

it('a wrong order, or a wrong chunk, shows the whole correct sentence and reports a miss', async () => {
  const { onDone, u } = show(make(SENTENCE))
  for (const t of ['わたし', 'も', 'がくせい', 'です']) await tap(u, t)
  await u.click(screen.getByRole('button', { name: 'Check' }))
  expect(screen.getByText('✗ Correct answer: わたしは がくせいです。')).toBeTruthy()
  expect(screen.getByText(/watashi wa gakusei desu/)).toBeTruthy()
  await u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(onDone).toHaveBeenCalledWith([SENTENCE])
})

it('an incomplete sentence is wrong too (a prefix of the answer is not enough)', async () => {
  const { u } = show(make(SENTENCE))
  for (const t of ['わたし', 'は']) await tap(u, t)
  await u.click(screen.getByRole('button', { name: 'Check' }))
  expect(screen.getByText(/✗ Correct answer/)).toBeTruthy()
})

it('the right sentence plus an extra wrong chunk is wrong too', async () => {
  const { u } = show(make(SENTENCE))
  for (const t of ['わたし', 'は', 'がくせい', 'です', 'も']) await tap(u, t)
  await u.click(screen.getByRole('button', { name: 'Check' }))
  expect(screen.getByText(/✗ Correct answer/)).toBeTruthy()
})

it('another valid word order is accepted (subject and object can swap)', async () => {
  const { onDone, u } = show(make('sent:tomodachi-wa-sakana-o-tabemasu'))
  for (const t of ['さかな', 'を', 'ともだち', 'は', 'たべます']) await tap(u, t)
  await u.click(screen.getByRole('button', { name: 'Check' }))
  expect(screen.getByText('✓ Correct')).toBeTruthy()
  await u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(onDone).toHaveBeenCalledWith([])
})

it('tapping a chosen chunk takes it back; used chunks are greyed in the bank; Start again clears', async () => {
  const { u } = show(make(SENTENCE))
  await tap(u, 'わたし'); await tap(u, 'です')
  expect(sentence().getAllByRole('button').map((b) => b.textContent)).toEqual(['わたし', 'です'])
  expect(bank().getAllByRole('button').filter((b) => (b as HTMLButtonElement).disabled).map((b) => b.textContent).sort()).toEqual(['です', 'わたし'])
  await u.click(sentence().getByRole('button', { name: 'わたし, remove' }))
  expect(sentence().getAllByRole('button').map((b) => b.textContent)).toEqual(['です'])
  expect((bank().getByRole('button', { name: 'わたし' }) as HTMLButtonElement).disabled).toBe(false)
  await u.click(screen.getByRole('button', { name: 'Start again' }))
  expect(screen.getByText('Tap the words below')).toBeTruthy()
})

it('announces the sentence so far, and locks everything after Check', async () => {
  const { u } = show(make(SENTENCE))
  await tap(u, 'わたし'); await tap(u, 'は')
  expect(screen.getByText('Your sentence: わたし は')).toBeTruthy()
  await u.click(screen.getByRole('button', { name: 'Check' }))
  expect(screen.queryByRole('button', { name: 'Check' })).toBeNull()
  expect(bank().getAllByRole('button').every((b) => (b as HTMLButtonElement).disabled)).toBe(true)
  expect(sentence().getAllByRole('button').every((b) => (b as HTMLButtonElement).disabled)).toBe(true)
})
