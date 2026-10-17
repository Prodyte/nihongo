// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { openDb } from '../db/db'
import { DIALOGUES } from '../path/dialogues'
import { getProgress } from '../path/progress'
import { STORIES } from '../path/stories'
import { Listening } from './Listening'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

class Utterance { text: string; lang = ''; voice: unknown = null; pitch?: number; rate = 1; constructor(t: string) { this.text = t } }
const kyoko = { lang: 'ja-JP', name: 'Kyoko' }
const otoya = { lang: 'ja-JP', name: 'Otoya' }
const voices = (list: object[]) => {
  const s = { getVoices: () => list, speak: vi.fn(), cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }
  vi.stubGlobal('speechSynthesis', s)
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
  return s
}

it('a dialogue plays without its text, speaker B in a second voice; slow replays; answering shows the score and Show text reveals A/B lines', async () => {
  const synth = voices([kyoko, otoya])
  const db = await openDb('listening-1')
  const user = userEvent.setup()
  render(<Listening db={db} onExit={() => {}} />)
  const d = DIALOGUES[0]
  await user.click(screen.getByRole('button', { name: new RegExp(d.title) }))
  expect(screen.getByText(d.scene)).toBeTruthy()
  expect(document.querySelector('[lang="ja"]')).toBeNull() // the text stays hidden
  await user.click(screen.getByRole('button', { name: 'Play' }))
  const said = synth.speak.mock.calls.map((c) => c[0] as Utterance)
  expect(said).toHaveLength(d.lines.length)
  expect(said.map((u) => u.voice)).toEqual(d.lines.map((l) => (l.who === 'A' ? kyoko : otoya)))
  expect(said[0].rate).toBe(1)

  await user.click(screen.getByRole('button', { name: 'Slow' }))
  expect(screen.getByRole('button', { name: 'Slow' }).getAttribute('aria-pressed')).toBe('true')
  synth.speak.mockClear()
  await user.click(screen.getByRole('button', { name: 'Play again' }))
  expect((synth.speak.mock.calls[0][0] as Utterance).rate).toBe(0.6)

  expect(screen.queryByRole('button', { name: 'Show text' })).toBeNull() // only after answering
  const qs = document.querySelectorAll('fieldset.question')
  for (const [i, q] of d.questions.entries()) await user.click(within(qs[i] as HTMLElement).getByRole('button', { name: q.options[q.answer] }))
  expect(screen.getByText(`${d.questions.length} of ${d.questions.length} right`)).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Show text' }))
  const lines = within(screen.getByRole('list', { name: 'Text' })).getAllByRole('listitem')
  expect(lines.map((l) => l.querySelector('.who')!.textContent)).toEqual(d.lines.map((l) => `Speaker ${l.who}`))
  expect(screen.getByText(d.lines[0].en)).toBeTruthy()
  await vi.waitFor(async () => expect((await getProgress(db)).xpToday).toBe(d.questions.length * 2))
  expect(localStorage.getItem('nihongo.heard')).toContain(`dialogue:${d.id}`)
})

it('one Japanese voice: the two speakers differ in pitch; a story plays in one voice', async () => {
  const synth = voices([kyoko])
  const user = userEvent.setup()
  render(<Listening db={await openDb('listening-2')} onExit={() => {}} />)
  await user.click(screen.getByRole('button', { name: new RegExp(DIALOGUES[0].title) }))
  await user.click(screen.getByRole('button', { name: 'Play' }))
  const pitches = synth.speak.mock.calls.map((c) => (c[0] as Utterance).pitch)
  expect(pitches).toEqual(DIALOGUES[0].lines.map((l) => (l.who === 'A' ? 0.8 : 1.4)))
  await user.click(screen.getByRole('button', { name: 'Exit' }))
  synth.speak.mockClear()
  await user.click(screen.getByRole('button', { name: new RegExp(STORIES[0].en) }))
  await user.click(screen.getByRole('button', { name: 'Play' }))
  expect(synth.speak.mock.calls.map((c) => (c[0] as Utterance).pitch)).toEqual(STORIES[0].sentences.map(() => undefined))
})

it('lists dialogues and stories by level; without a Japanese voice they are disabled and it says why', async () => {
  render(<Listening db={await openDb('listening-3')} onExit={() => {}} />) // jsdom has no speech
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['N5', 'N4', 'N3'])
  expect(screen.getByText(/Needs a Japanese voice/)).toBeTruthy()
  for (const d of DIALOGUES) expect((within(screen.getByRole('region', { name: `N${d.level}` })).getByRole('button', { name: new RegExp(d.title) }) as HTMLButtonElement).disabled).toBe(true)
  for (const s of STORIES) expect(within(screen.getByRole('region', { name: `N${s.level}` })).getByRole('button', { name: new RegExp(s.en) })).toBeTruthy()
})
