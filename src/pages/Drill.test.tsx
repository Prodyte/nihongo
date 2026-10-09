// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { openDb, seedKana } from '../db/db'
import { conjugate, FORM_LABEL, verbClass, type Form } from '../path/conjugate'
import { ITEMS, lessonById, written } from '../path/course'
import { completeLesson, getProgress } from '../path/progress'
import { kanaToRomaji } from '../path/romaji'
import { Drill } from './Drill'

afterEach(cleanup)

/** The right answer for the conjugation question on screen, worked out with the engine. */
function answer(): string {
  const prompt = document.querySelector('.prompt')!.cloneNode(true) as HTMLElement
  prompt.querySelectorAll('rt').forEach((rt) => rt.remove()) // furigana aren't part of the word
  const verb = [...ITEMS.values()].find((x) => x.kind === 'word' && written(x) === prompt.textContent && /^to /.test(x.gloss))!
  const label = document.querySelector('.form-label')!.textContent!.slice(2)
  const form = (Object.keys(FORM_LABEL) as Form[]).find((f) => FORM_LABEL[f] === label)!
  return kanaToRomaji(conjugate(verb.jp, form, verbClass(verb.jp, written(verb))!))
}

it('a conjugation drill: 10 of your verbs, each in a form; right answers earn 1 XP each; then another round is offered', async () => {
  const db = await openDb('drill-1')
  await seedKana(db)
  for (const id of ['verbs-1', 'verbs-2', 'verbs-3']) await completeLesson(db, lessonById(id)!, ITEMS, {}, 1)
  const xp0 = (await getProgress(db)).xpToday
  const user = userEvent.setup()
  render(<Drill db={db} kind="conjugate" onExit={() => {}} />)
  for (let i = 0; i < 10; i++) {
    await screen.findByText(/^→ /)
    if (i < 7) await user.type(screen.getByRole('textbox'), `${answer()}{Enter}`)
    else await user.click(screen.getByRole('button', { name: 'I don’t know' }))
    await user.click(await screen.findByRole('button', { name: 'Continue' }))
  }
  expect(await screen.findByText('7/10')).toBeTruthy()
  await vi.waitFor(async () => expect((await getProgress(db)).xpToday).toBe(xp0 + 7))
  expect(screen.getByRole('button', { name: 'Practise again' })).toBeTruthy()
})
