// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { openDb, seedKana } from '../db/db'
import { ITEMS, LESSONS, UNITS } from '../path/course'
import { completeLesson } from '../path/progress'
import { Path } from './Path'

let n = 0
const freshDb = async () => { const db = await openDb(`path-ui-${n++}`); await seedKana(db); return db }
beforeEach(() => localStorage.clear())
afterEach(cleanup)

const lessonButton = (title: string) => screen.getAllByRole('button').find((b) => b.textContent!.startsWith(title) && b.closest('ul.lessons'))!

it('a new learner: first lesson open, the rest locked, first unit expanded', async () => {
  render(<Path db={await freshDb()} onStart={() => {}} />)
  await screen.findByRole('heading', { name: 'Your path' })
  expect(screen.getByText(`0 of ${LESSONS.length} lessons done`)).toBeTruthy()
  const first = lessonButton(LESSONS[0].title)
  const second = lessonButton(LESSONS[1].title)
  expect((first as HTMLButtonElement).disabled).toBe(false)
  expect((second as HTMLButtonElement).disabled).toBe(true)
  expect(second.textContent).toContain('🔒 Locked')
  const units = [...document.querySelectorAll<HTMLDetailsElement>('details.unit')]
  const kana = UNITS.filter((u) => u.section === 'Kana').length
  expect(units).toHaveLength(kana) // folded sections render nothing inside until opened
  expect(units.map((u) => u.open)).toEqual([true, ...Array(kana - 1).fill(false)])
  expect(document.querySelectorAll('ul.lessons button')).toHaveLength(UNITS[0].lessons.length) // and so do folded units
})

it('sections by level: only the one holding the current lesson is open', async () => {
  const db = await freshDb()
  for (const l of LESSONS.slice(0, 68)) await db.put('lessons', { id: l.id, completedAt: new Date(), plays: 1, bestAccuracy: 1 })
  render(<Path db={db} onStart={() => {}} />)
  await screen.findByRole('heading', { name: 'JLPT N5' })
  const sections = [...document.querySelectorAll<HTMLDetailsElement>('details.section')]
  expect(sections.map((d) => d.querySelector('h2')!.textContent)).toEqual(['Kana', 'First words and sentences', 'JLPT N5', 'JLPT N4', 'JLPT N3'])
  expect(sections.map((d) => d.open)).toEqual([false, false, true, false, false])
  expect(sections[0].querySelector('summary small')!.textContent).toBe('✓ Done')
  expect(screen.getByRole('button', { name: new RegExp(`^Continue: ${LESSONS[68].title}`) })).toBeTruthy()
  await userEvent.click(sections[4].querySelector('summary')!) // opening a folded section shows its units
  await waitFor(() => expect(sections[4].querySelectorAll('details.unit').length).toBe(UNITS.filter((u) => u.section === 'N3').length))
})

it('starting a lesson reports its id, from the Continue button or the list', async () => {
  const onStart = vi.fn()
  const user = userEvent.setup()
  render(<Path db={await freshDb()} onStart={onStart} />)
  await user.click(await screen.findByRole('button', { name: /^Continue:/ }))
  await user.click(lessonButton(LESSONS[0].title))
  expect(onStart.mock.calls).toEqual([[LESSONS[0].id], [LESSONS[0].id]])
})

it('after a lesson: it shows as done and the next unlocks', async () => {
  const db = await freshDb()
  await completeLesson(db, LESSONS[0], ITEMS, {}, 1)
  render(<Path db={db} onStart={() => {}} />)
  await screen.findByText(`1 of ${LESSONS.length} lessons done`)
  expect(lessonButton(LESSONS[0].title).textContent).toContain('✓ Done')
  expect((lessonButton(LESSONS[1].title) as HTMLButtonElement).disabled).toBe(false)
  expect((lessonButton(LESSONS[2].title) as HTMLButtonElement).disabled).toBe(true)
  expect(screen.getByRole('button', { name: new RegExp(`^Continue: ${LESSONS[1].title}`) })).toBeTruthy()
})

it('"Let me choose any lesson" (set in Settings) unlocks everything', async () => {
  localStorage.setItem('nihongo.skipAhead', '1')
  render(<Path db={await freshDb()} onStart={() => {}} />)
  await screen.findByRole('heading', { name: 'Your path' })
  expect([...document.querySelectorAll<HTMLButtonElement>('ul.lessons button')].every((b) => !b.disabled)).toBe(true)
})

it('when every lesson is done there is a finish message and no Continue button', async () => {
  const db = await freshDb()
  for (const l of LESSONS) await db.put('lessons', { id: l.id, completedAt: new Date(), plays: 1, bestAccuracy: 1 })
  render(<Path db={db} onStart={() => {}} />)
  await screen.findByText(/You finished the whole path/)
  expect(screen.queryByRole('button', { name: /^Continue:/ })).toBeNull()
})
