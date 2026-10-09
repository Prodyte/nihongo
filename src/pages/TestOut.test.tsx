// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { State } from 'ts-fsrs'
import { afterEach, expect, it, vi } from 'vitest'
import { openDb, seedKana } from '../db/db'
import { ITEMS, LESSONS, UNITS } from '../path/course'
import { buildTest, TEST_QUESTIONS } from '../path/lesson'
import { getProgress } from '../path/progress'
import { TestOut } from './TestOut'

afterEach(cleanup)
let n = 0
const fresh = async () => { const db = await openDb(`testout-${n++}`); await seedKana(db); return db }

it('buildTest: 15 questions, one per item, from the given lessons only, every one answerable', () => {
  const lessons = UNITS.slice(0, 2).flatMap((u) => u.lessons)
  const allowed = new Set(lessons.flatMap((l) => l.items))
  const exs = buildTest(lessons, ITEMS, () => 0.3)
  expect(exs).toHaveLength(TEST_QUESTIONS)
  const ids = exs.map((e) => ('item' in e ? e.item.id : ''))
  expect(new Set(ids).size).toBe(ids.length)
  for (const e of exs) {
    expect(allowed.has('item' in e ? e.item.id : '')).toBe(true)
    if ('options' in e) expect(e.options).toContain(e.answer)
  }
  expect(buildTest(LESSONS.filter((l) => l.explain).slice(0, 1), ITEMS).every((e) => e.type === 'choice' && e.dir === 'fill')).toBe(true) // sentences: fill the gap
})

async function take(answerRight: (i: number) => boolean) {
  const db = await fresh()
  const user = userEvent.setup()
  const onExit = vi.fn()
  render(<TestOut db={db} unit={UNITS[0]} onExit={onExit} />)
  for (let i = 0; i < TEST_QUESTIONS; i++) {
    await screen.findByText(`Test: ${UNITS[0].title} · covers ${UNITS[0].lessons.length} lessons`)
    const box = screen.queryByRole('textbox')
    if (box) {
      // typed kana: the item is in the prompt; its first romaji is right
      const kana = document.querySelector('.prompt')!.textContent!
      const it = [...ITEMS.values()].find((x) => x.kind === 'kana' && x.jp === kana)!
      await user.type(box, answerRight(i) ? it.romaji : 'qqq')
      await user.click(screen.getByRole('button', { name: 'Check' }))
    } else {
      const kana = document.querySelector('.prompt')!.textContent!
      const it = [...ITEMS.values()].find((x) => x.kind === 'kana' && x.jp === kana)!
      const buttons = [...screen.getByRole('group', { name: 'Answers' }).querySelectorAll('button')]
      await user.click(buttons.find((b) => (b.textContent!.replace(/\s*\d$/, '').trim() === it.gloss) === answerRight(i))!)
    }
    await user.click(await screen.findByRole('button', { name: 'Continue' }))
  }
  return { db, onExit }
}

it('passing (2 wrong of 15) marks the unit done without XP; missed items start as Again', async () => {
  const { db } = await take((i) => i > 1)
  await screen.findByRole('heading', { name: 'Passed 🎉' })
  expect(screen.getByText('13 of 15 right · 80% needed')).toBeTruthy()
  const p = await getProgress(db)
  for (const l of UNITS[0].lessons) expect(p.done.has(l.id), l.id).toBe(true)
  expect(p.done.has(UNITS[1].lessons[0].id)).toBe(false)
  expect(p.xpToday).toBe(0)
  const graded = (await db.getAll('cards')).filter((c) => c.deck === 'hira' && c.fsrs.state !== State.New)
  expect(graded.length).toBe(46) // every basic hiragana is now scheduled
})

it('failing (4 wrong) changes nothing', async () => {
  const { db } = await take((i) => i > 3)
  await screen.findByRole('heading', { name: 'Not this time' })
  expect((await getProgress(db)).done.size).toBe(0)
})
