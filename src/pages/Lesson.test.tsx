// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { Rating, State } from 'ts-fsrs'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { openDb, seedKana, type Db } from '../db/db'
import { ITEMS, lessonById, type Lesson as LessonT } from '../path/course'
import { Match } from '../path/ui/Match'
import { Lesson } from './Lesson'

let n = 0
const freshDb = async () => { const db = await openDb(`lesson-ui-${n++}`); await seedKana(db); return db }
beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

const user = () => userEvent.setup({ delay: null })
// option text without the ✓/✗ mark and the 1-4 key hint
const optionText = (b: HTMLElement) => (b.textContent ?? '').replace(/^[✓✗]\s*/, '').replace(/\s*\d$/, '').trim()
const mount = (db: Db, lesson: LessonT, extra: Partial<Parameters<typeof Lesson>[0]> = {}) =>
  render(<Lesson db={db} lesson={lesson} autoplay={false} onExit={() => {}} onStart={() => {}} {...extra} />)

async function solveMatch(u: UserEvent, items: ReturnType<typeof ITEMS.get>[]) {
  for (const b of [...document.querySelectorAll<HTMLElement>('.match button[lang="ja"]')]) {
    const item = items.find((it) => it!.jp === b.textContent!.replace(/^✓\s*/, '').trim())!
    await u.click(b)
    await u.click([...document.querySelectorAll<HTMLElement>('.match button:not([lang])')].find((x) => x.textContent!.trim() === item.gloss)!)
  }
}

/** Play a lesson through the real UI. `spoken` is what the (stubbed) voice said, for listening exercises. */
async function drive(u: UserEvent, lesson: LessonT, { spoken = [] as string[], wrongFirst = false, stopAfterIntros = false } = {}) {
  const items = lesson.items.map((id) => ITEMS.get(id))
  let wrongPending = wrongFirst
  for (let i = 0; i < 150; i++) {
    await waitFor(() => expect(screen.queryByText('Lesson complete 🎉') ?? screen.queryByRole('button', { name: 'Got it' }) ?? screen.queryByText('Match the pairs') ?? screen.queryByRole('textbox') ?? screen.queryByRole('group', { name: 'Answers' })).toBeTruthy())
    if (screen.queryByText('Lesson complete 🎉')) return
    const got = screen.queryByRole('button', { name: 'Got it' })
    if (got) { await u.click(got); continue }
    if (stopAfterIntros) return
    if (screen.queryByText('Match the pairs')) { await solveMatch(u, items); await u.click(await screen.findByRole('button', { name: 'Continue' })); continue }
    const box = screen.queryByRole('textbox')
    if (box) { // typing: the label says what to type, the prompt says what it is about
      const ask = document.querySelector('label.q')!.textContent!
      const shown = document.querySelector('.prompt')!.textContent
      const text = ask.includes('Japanese') ? items.find((it) => it!.gloss === shown)!.romaji : items.find((it) => it!.jp === shown)!.gloss // 'Japanese' first: its hint also says "romaji"
      await u.type(box, `${text}{Enter}`)
      await u.click(await screen.findByRole('button', { name: 'Continue' }))
      continue
    }
    const opts = within(screen.getByRole('group', { name: 'Answers' })).getAllByRole('button')
    const prompt = document.querySelector('.prompt')
    const answer = !prompt ? spoken.at(-1)!
      : prompt.classList.contains('kana') ? items.find((it) => it!.jp === prompt.textContent)!.gloss
      : items.find((it) => it!.gloss === prompt.textContent)!.jp
    const pick = wrongPending ? opts.find((b) => optionText(b) !== answer)! : opts.find((b) => optionText(b) === answer)!
    if (wrongPending) { wrongPending = false; await u.click(pick); await screen.findByText(/✗ Correct answer:/) } else await u.click(pick)
    await u.click(await screen.findByRole('button', { name: 'Continue' }))
  }
  throw new Error('lesson did not finish')
}

it('a flawless kana lesson: summary, 15 XP, items graded Good, lesson recorded', async () => {
  const db = await freshDb()
  const lesson = lessonById('hira-basic-1')! // あ い う え お
  const u = user()
  mount(db, lesson)
  await drive(u, lesson)
  expect(screen.getByText('+15 XP')).toBeTruthy()
  expect(screen.getByText(/100% right first time · 1-day streak/)).toBeTruthy()
  expect(screen.getByRole('button', { name: /Next lesson: か き く け こ/ })).toBeTruthy()
  expect(await db.get('lessons', 'hira-basic-1')).toMatchObject({ plays: 1, bestAccuracy: 1 })
  for (const id of lesson.items) expect((await db.get('cards', id))!.fsrs.state).not.toBe(State.New)
  expect((await db.getAll('reviews')).map((r) => r.grade)).toEqual(Array(5).fill(Rating.Good))
  expect(await db.count('decks')).toBe(0) // kana only: no vocabulary deck
})

it('a wrong answer shows the right one, repeats once, costs accuracy and XP, and grades that item Hard', async () => {
  const db = await freshDb()
  const lesson = lessonById('hira-basic-1')!
  const u = user()
  mount(db, lesson)
  await drive(u, lesson, { wrongFirst: true })
  expect(screen.getByText('+10 XP')).toBeTruthy()
  expect(screen.queryByText(/100% right first time/)).toBeNull()
  const grades = (await db.getAll('reviews')).map((r) => r.grade).sort()
  expect(grades).toEqual([Rating.Hard, Rating.Good, Rating.Good, Rating.Good, Rating.Good].sort())
})

it('listening: the voice speaks on arrival, a replay button is shown, and the lesson completes', async () => {
  const spoken: string[] = []
  vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; lang = ''; voice: unknown = null; constructor(t: string) { this.text = t } })
  vi.stubGlobal('speechSynthesis', { getVoices: () => [{ lang: 'ja-JP' }], speak: (x: { text: string }) => spoken.push(x.text), cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })
  const db = await freshDb()
  const lesson = lessonById('hira-basic-1')!
  const u = user()
  mount(db, lesson)
  let heardListen = false
  // advance to the first listening exercise: it is the one with a speaker button and no prompt
  for (let i = 0; i < 60 && !heardListen; i++) {
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Got it' }) ?? screen.queryByRole('group', { name: 'Answers' }) ?? screen.queryByText('Match the pairs')).toBeTruthy())
    if (screen.queryByText('Tap what you hear')) { heardListen = true; break }
    await drive(u, lesson, { stopAfterIntros: true })
    if (screen.queryByText('Tap what you hear')) { heardListen = true; break }
    if (screen.queryByText('Match the pairs')) { await solveMatch(u, lesson.items.map((id) => ITEMS.get(id))); await u.click(await screen.findByRole('button', { name: 'Continue' })); continue }
    const group = screen.queryByRole('group', { name: 'Answers' })
    if (group) {
      const prompt = document.querySelector('.prompt')!
      const items = lesson.items.map((id) => ITEMS.get(id)!)
      const answer = prompt.classList.contains('kana') ? items.find((it) => it.jp === prompt.textContent)!.gloss : items.find((it) => it.gloss === prompt.textContent)!.jp
      await u.click(within(group).getAllByRole('button').find((b) => optionText(b) === answer)!)
      await u.click(await screen.findByRole('button', { name: 'Continue' }))
    }
  }
  expect(heardListen).toBe(true)
  const before = spoken.length
  expect(before).toBeGreaterThan(0)
  expect(lesson.items).toContain(`hira:${spoken.at(-1)}`) // it said one of this lesson's kana
  await u.click(screen.getByRole('button', { name: 'Play sound' }))
  expect(spoken.length).toBe(before + 1) // replay
  await drive(u, lesson, { spoken })
  expect(screen.getByText('+15 XP')).toBeTruthy()
})

it('a vocabulary lesson creates the words as cards and shows reading and meaning on the intro', async () => {
  const db = await freshDb()
  const lesson = lessonById('food-1')! // みず おちゃ ごはん パン たまご さかな
  const u = user()
  mount(db, lesson)
  await screen.findByText('New word')
  expect(screen.getByText('みず')).toBeTruthy()
  expect(document.querySelector('.reading')!.textContent).toBe('mizu · 水') // reading and kanji
  expect(screen.getByText('water')).toBeTruthy()
  await drive(u, lesson)
  expect(await db.getAllFromIndex('cards', 'by-deck', 'vocab')).toHaveLength(6)
  expect(await db.get('decks', 'vocab')).toEqual({ id: 'vocab', name: 'Starter vocabulary' })
})

it('Loading is never a dead end: Exit is there even if the lesson never finishes loading', async () => {
  const onExit = vi.fn()
  const db = await freshDb()
  vi.spyOn(db, 'getAll').mockImplementation((() => new Promise(() => {})) as typeof db.getAll) // the progress read hangs
  mount(db, lessonById('hira-basic-1')!, { onExit })
  await screen.findByText('Loading…')
  await user().click(screen.getByRole('button', { name: '← Exit' }))
  expect(onExit).toHaveBeenCalled()
})

it('Next lesson starts the following lesson', async () => {
  const onStart = vi.fn()
  const db = await freshDb()
  const u = user()
  mount(db, lessonById('hira-basic-1')!, { onStart })
  await drive(u, lessonById('hira-basic-1')!)
  await u.click(screen.getByRole('button', { name: /Next lesson/ }))
  expect(onStart).toHaveBeenCalledWith('hira-basic-2')
})

it('leaving mid-lesson saves nothing', async () => {
  const onExit = vi.fn()
  const db = await freshDb()
  const u = user()
  mount(db, lessonById('hira-basic-1')!, { onExit })
  await u.click(await screen.findByRole('button', { name: 'Got it' }))
  await u.click(screen.getByRole('button', { name: '← Exit' }))
  expect(onExit).toHaveBeenCalled()
  expect(await db.count('lessons')).toBe(0)
  expect(await db.count('reviews')).toBe(0)
})

it('Continue and Got it ignore a held (auto-repeating) key, so one Enter cannot skip several steps', async () => {
  const db = await freshDb()
  mount(db, lessonById('hira-basic-1')!)
  const got = await screen.findByRole('button', { name: 'Got it' })
  expect(fireEvent.keyDown(got, { key: 'Enter', repeat: true })).toBe(false) // default prevented => no click
  expect(fireEvent.keyDown(got, { key: 'Enter', repeat: false })).toBe(true)
  // ...and the Continue button after answering a question
  const u = user()
  await drive(u, lessonById('hira-basic-1')!, { stopAfterIntros: true })
  await u.click(within(await screen.findByRole('group', { name: 'Answers' })).getAllByRole('button')[0])
  const cont = await screen.findByRole('button', { name: 'Continue' })
  expect(fireEvent.keyDown(cont, { key: 'Enter', repeat: true })).toBe(false)
})

it('a failed save keeps the finished lesson, explains, and "Try again" saves it', async () => {
  const db = await freshDb()
  const lesson = lessonById('hira-basic-1')!
  const u = user()
  mount(db, lesson)
  const real = db.transaction.bind(db)
  const spy = vi.spyOn(db, 'transaction').mockImplementationOnce(((...a: Parameters<typeof real>) => { void a; throw new Error('quota') }) as typeof db.transaction)
  await drive(u, lesson).catch(() => {}) // the summary never appears, so drive's final wait times out
  await screen.findByText(/Couldn't save your progress \(Error: quota\)/)
  expect(await db.count('lessons')).toBe(0)
  spy.mockRestore()
  await u.click(screen.getByRole('button', { name: 'Try again' }))
  await screen.findByText('Lesson complete 🎉')
  expect(await db.count('lessons')).toBe(1)
})

it('if only the streak read fails after a successful save, the summary still shows and nothing is awarded twice', async () => {
  const db = await freshDb()
  const lesson = lessonById('hira-basic-1')!
  const u = user()
  mount(db, lesson)
  await screen.findByRole('button', { name: 'Got it' }) // the lesson built (its progress read happened)
  const real = db.getAll.bind(db)
  vi.spyOn(db, 'getAll').mockImplementation(((store: string) => (store === 'activity' ? Promise.reject(new Error('read failed')) : real(store as 'cards'))) as typeof db.getAll)
  await drive(u, lesson)
  expect(screen.getByText('+15 XP')).toBeTruthy()
  expect(screen.getByText(/100% right first time$/)).toBeTruthy() // no streak text, no error
  expect(screen.queryByRole('alert')).toBeNull()
  vi.restoreAllMocks() // the injected failure must not hit our own assertions below
  expect(await db.get('lessons', lesson.id)).toMatchObject({ plays: 1 })
  expect((await db.getAll('activity')).map((a) => a.xp)).toEqual([15])
})

it('digit shortcuts pick an answer, but not with Cmd/Ctrl/Alt held (those are browser shortcuts)', async () => {
  const db = await freshDb()
  const lesson = lessonById('hira-basic-1')!
  mount(db, lesson)
  await drive(user(), lesson, { stopAfterIntros: true })
  const group = await screen.findByRole('group', { name: 'Answers' })
  for (const mod of [{ metaKey: true }, { ctrlKey: true }, { altKey: true }]) fireEvent.keyDown(window, { key: '1', ...mod })
  expect(within(group).getAllByRole('button').every((b) => !(b as HTMLButtonElement).disabled)).toBe(true)
  fireEvent.keyDown(window, { key: '1' })
  await screen.findByRole('button', { name: 'Continue' })
  expect(within(group).getAllByRole('button').every((b) => (b as HTMLButtonElement).disabled)).toBe(true)
})

it('Match: wrong pairs are flagged and counted for both items, right pairs lock, finishing reports the misses', async () => {
  const [a, b] = ['hira:あ', 'hira:い'].map((id) => ITEMS.get(id)!)
  const onDone = vi.fn()
  const u = user()
  render(<Match pairs={[a, b].map((it) => ({ id: it.id, jp: it.jp, gloss: it.gloss }))} onDone={onDone} />)
  const jp = (t: string) => [...document.querySelectorAll<HTMLElement>('.match button[lang="ja"]')].find((x) => x.textContent!.includes(t))!
  const gloss = (t: string) => [...document.querySelectorAll<HTMLElement>('.match button:not([lang])')].find((x) => x.textContent!.includes(t))!
  await u.click(jp('あ'))
  expect(jp('あ').getAttribute('aria-pressed')).toBe('true')
  await u.click(gloss('i')) // wrong
  expect(screen.getByText('✗ Not a match, try again')).toBeTruthy()
  expect(jp('あ').getAttribute('aria-pressed')).toBe('false')
  await u.click(gloss('a')) // right, picked from the gloss side first
  await u.click(jp('あ'))
  expect((jp('あ') as HTMLButtonElement).disabled).toBe(true)
  await u.click(jp('い'))
  await u.click(gloss('i'))
  await screen.findByText('✓ All matched')
  expect(fireEvent.keyDown(screen.getByRole('button', { name: 'Continue' }), { key: 'Enter', repeat: true })).toBe(false) // held key
  await u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(onDone).toHaveBeenCalledWith(['hira:あ', 'hira:い'])
})
