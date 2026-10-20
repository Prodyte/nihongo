// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { openDb } from '../db/db'
import { getProgress } from '../path/progress'
import { STORIES } from '../path/stories'
import { Reading } from './Reading'

afterEach(cleanup)

it('open a story, tap a word to look it up, reveal a translation, answer the questions (they count toward the streak)', async () => {
  const db = await openDb('reading-1')
  const user = userEvent.setup()
  render(<Reading db={db} onExit={() => {}} />)
  await user.click(screen.getByRole('button', { name: /My day/ }))
  const words = document.querySelectorAll<HTMLButtonElement>('button.word')
  await user.click([...words].find((w) => w.textContent!.startsWith('起'))!)
  expect(document.querySelector('.lookup-pop')!.textContent).toMatch(/おきます · to wake up/) // the dictionary word, the form in the text, and its meaning
  await user.click(screen.getAllByRole('button', { name: 'Translate' })[0])
  expect(screen.getByText('I get up at seven every morning.')).toBeTruthy()
  const story = STORIES[0]
  const qs = document.querySelectorAll('fieldset.question')
  for (const [i, q] of story.questions.entries()) await user.click(within(qs[i] as HTMLElement).getByRole('button', { name: q.options[q.answer] }))
  expect(screen.getByText('3 of 3 right')).toBeTruthy()
  await vi.waitFor(async () => expect((await getProgress(db)).xpToday).toBe(6))
  expect(localStorage.getItem('nihongo.read')).toContain('my-day')
})

it('lists stories under their level, N5 then N4 then N3', async () => {
  render(<Reading db={await openDb('reading-2')} onExit={() => {}} />)
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['N5', 'N4', 'N3'])
  for (const s of STORIES) expect(within(screen.getByRole('region', { name: `N${s.level}` })).getByRole('button', { name: new RegExp(s.en) })).toBeTruthy()
})

it('endings and counters are not taken for a dictionary word that only looks like them', async () => {
  const user = userEvent.setup()
  render(<Reading db={await openDb('reading-4')} onExit={() => {}} />)
  const tap = async (story: RegExp, text: string) => {
    await user.click(screen.getByRole('button', { name: story }))
    await user.click([...document.querySelectorAll<HTMLButtonElement>('button.word')].find((w) => w.textContent === text)!)
    const pop = document.querySelector('.lookup-pop')!.textContent!
    await user.click(screen.getByRole('button', { name: 'Exit' }))
    return pop
  }
  const tenMinutes = await tap(/My town/, '十分じゅっぷん') // ruby: the kanji, then the reading
  expect(tenMinutes).toMatch(/じゅっぷん/)
  expect(tenMinutes).not.toMatch(/enough/) // 十分 じゅうぶん
  const blame = await tap(/Getting up early/, 'せいで')
  expect(blame).toMatch(/grammar/)
  expect(blame).not.toMatch(/nest/) // 巣
})

it('a looked-up word can be saved for Review with Study this (a particle has no button)', async () => {
  const db = await openDb('reading-3')
  const user = userEvent.setup()
  render(<Reading db={db} onExit={() => {}} />)
  await user.click(screen.getByRole('button', { name: /My day/ }))
  const words = [...document.querySelectorAll<HTMLButtonElement>('button.word')]
  await user.click(words.find((w) => w.textContent === 'は')!)
  expect(document.querySelector('.lookup-pop')!.textContent).toMatch(/particle/)
  expect(screen.queryByRole('button', { name: 'Study this' })).toBeNull()
  await user.click(words.find((w) => w.textContent!.startsWith('起'))!)
  await user.click(await screen.findByRole('button', { name: 'Study this' }))
  expect((await screen.findByRole('button', { name: 'Studying' })).getAttribute('aria-pressed')).toBe('true')
  const card = (await db.getAll('cards')).find((c) => (c.saved ?? 0) > 0)
  expect(card?.back.join()).toMatch(/to wake up/)
})
