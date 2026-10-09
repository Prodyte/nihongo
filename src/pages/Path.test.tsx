// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { openDb, seedKana } from '../db/db'
import { ITEMS, LESSONS } from '../path/course'
import { completeLesson } from '../path/progress'
import { Path } from './Path'

let n = 0
const freshDb = async () => { const db = await openDb(`path-ui-${n++}`); await seedKana(db); return db }
beforeEach(() => localStorage.clear())
afterEach(cleanup)

const lessonButton = (title: string) => screen.getAllByRole('button').find((b) => b.textContent!.startsWith(title) && b.closest('ul.lessons'))!

it('a new learner: first lesson open, the rest locked, first unit expanded, no streak yet', async () => {
  render(<Path db={await freshDb()} onStart={() => {}} />)
  await screen.findByRole('heading', { name: 'Your path' })
  expect(screen.getByText('Start a streak today')).toBeTruthy()
  expect(screen.getByText('Daily goal: 0 / 20 XP')).toBeTruthy()
  const first = lessonButton(LESSONS[0].title)
  const second = lessonButton(LESSONS[1].title)
  expect((first as HTMLButtonElement).disabled).toBe(false)
  expect((second as HTMLButtonElement).disabled).toBe(true)
  expect(second.textContent).toContain('🔒 Locked')
  const units = [...document.querySelectorAll<HTMLDetailsElement>('details.unit')]
  expect(units).toHaveLength(14)
  expect(units.map((u) => u.open)).toEqual([true, ...Array(13).fill(false)])
})

it('starting a lesson reports its id, from the Continue button or the list', async () => {
  const onStart = vi.fn()
  const user = userEvent.setup()
  render(<Path db={await freshDb()} onStart={onStart} />)
  await user.click(await screen.findByRole('button', { name: /^Continue:/ }))
  await user.click(lessonButton(LESSONS[0].title))
  expect(onStart.mock.calls).toEqual([[LESSONS[0].id], [LESSONS[0].id]])
})

it('after a lesson: it shows as done, the next unlocks, XP and streak appear', async () => {
  const db = await freshDb()
  await completeLesson(db, LESSONS[0], ITEMS, {}, 1) // today, flawless: 15 XP
  render(<Path db={db} onStart={() => {}} />)
  await screen.findByText('Daily goal: 15 / 20 XP')
  expect(screen.getByText('🔥 1-day streak')).toBeTruthy()
  expect(lessonButton(LESSONS[0].title).textContent).toContain('✓ Done')
  expect((lessonButton(LESSONS[1].title) as HTMLButtonElement).disabled).toBe(false)
  expect((lessonButton(LESSONS[2].title) as HTMLButtonElement).disabled).toBe(true)
  expect(screen.getByRole('button', { name: new RegExp(`^Continue: ${LESSONS[1].title}`) })).toBeTruthy()
})

it('the daily goal can be changed and is remembered; meeting it shows a tick', async () => {
  const db = await freshDb()
  await completeLesson(db, LESSONS[0], ITEMS, {}, 1)
  await completeLesson(db, LESSONS[1], ITEMS, {}, 1) // 30 XP
  const user = userEvent.setup()
  render(<Path db={db} onStart={() => {}} />)
  await screen.findByText('Daily goal: 30 / 20 XP ✓')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Goal per day' }), '50')
  expect(screen.getByText('Daily goal: 30 / 50 XP')).toBeTruthy()
  expect(localStorage.getItem('nihongo.goal')).toBe('50')
  cleanup()
  render(<Path db={db} onStart={() => {}} />)
  await screen.findByText('Daily goal: 30 / 50 XP') // remembered across a reload
})

it('a stored goal that is not one of the offered values falls back to 20', async () => {
  localStorage.setItem('nihongo.goal', '7')
  render(<Path db={await freshDb()} onStart={() => {}} />)
  await screen.findByText('Daily goal: 0 / 20 XP')
  expect((screen.getByRole('combobox', { name: 'Goal per day' }) as HTMLSelectElement).value).toBe('20')
})

it('"Let me choose any lesson" unlocks everything and is remembered', async () => {
  const user = userEvent.setup()
  const db = await freshDb()
  render(<Path db={db} onStart={() => {}} />)
  await user.click(await screen.findByRole('checkbox', { name: 'Let me choose any lesson' }))
  expect(localStorage.getItem('nihongo.skipAhead')).toBe('1')
  expect([...document.querySelectorAll<HTMLButtonElement>('ul.lessons button')].every((b) => !b.disabled)).toBe(true)
  cleanup()
  render(<Path db={db} onStart={() => {}} />)
  expect(((await screen.findByRole('checkbox', { name: 'Let me choose any lesson' })) as HTMLInputElement).checked).toBe(true)
})

it('when every lesson is done there is a finish message and no Continue button', async () => {
  const db = await freshDb()
  for (const l of LESSONS) await db.put('lessons', { id: l.id, completedAt: new Date(), plays: 1, bestAccuracy: 1 })
  render(<Path db={db} onStart={() => {}} />)
  await screen.findByText(/You finished the whole path/)
  expect(screen.queryByRole('button', { name: /^Continue:/ })).toBeNull()
})
