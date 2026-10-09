// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import * as audio from '../../audio'
import { ITEMS } from '../course'
import type { Exercise } from '../lesson'
import { Type } from './Type'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

type Ex = Extract<Exercise, { type: 'type' }>
const ex = (id: string, dir: Ex['dir']): Ex => { const item = ITEMS.get(id)!; return { type: 'type', item, dir, prompt: dir === 'toJp' ? item.gloss : item.jp } }
const show = (e: Ex, extra: { autoplay?: boolean } = {}) => { const onDone = vi.fn(); render(<Type ex={e} autoplay={extra.autoplay ?? false} onDone={onDone} />); return { onDone, u: userEvent.setup({ delay: null }) } }
const box = () => screen.getByRole('textbox') as HTMLInputElement

it('kana -> romaji: any accepted spelling counts (し: shi or si; ぢ: ji or di)', async () => {
  for (const [id, typed] of [['hira:し', 'shi'], ['hira:し', 'SI'], ['hira:ぢ', 'ji'], ['hira:ぢ', 'di'], ['kata:ツ', 'tu']] as const) {
    const { onDone, u } = show(ex(id, 'toRomaji'))
    await u.type(box(), `${typed}{Enter}`)
    expect(screen.getByText('✓ Correct'), `${id} ${typed}`).toBeTruthy()
    await u.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onDone).toHaveBeenCalledWith([])
    cleanup()
  }
})

it('English -> Japanese shows the kana as you type, and keeps an unfinished letter dimmed', async () => {
  const { u } = show(ex('vocab:mizu', 'toJp'))
  const preview = () => document.querySelector('.preview')!
  expect(screen.getByText('water')).toBeTruthy()
  await u.type(box(), 'mi')
  expect(preview().textContent!.trim()).toBe('み')
  await u.type(box(), 'z')
  expect(preview().textContent!.trim()).toBe('みz')
  expect(preview().querySelector('.pending')!.textContent).toBe('z')
  await u.type(box(), 'u')
  expect(preview().textContent!.trim()).toBe('みず')
  expect(preview().getAttribute('lang')).toBe('ja')
  expect(box().getAttribute('aria-describedby')).toBe(preview().id)
})

it('a right Japanese answer is accepted; a wrong one reveals the answer and reports the miss', async () => {
  let r = show(ex('vocab:mizu', 'toJp'))
  await r.u.type(box(), 'mizu{Enter}')
  await r.u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(r.onDone).toHaveBeenCalledWith([])
  cleanup()
  r = show(ex('vocab:mizu', 'toJp'))
  await r.u.type(box(), 'mizo{Enter}')
  expect(screen.getByText('✗ Correct answer: みず')).toBeTruthy()
  expect(document.querySelector('.feedback small')!.textContent).toContain('(mizu) water') // reading and meaning once, in the detail line
  expect(box().readOnly).toBe(true)
  await r.u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(r.onDone).toHaveBeenCalledWith(['vocab:mizu'])
})

it('Japanese typing is exact, but こんにちは also takes "konnichiwa" with a note', async () => {
  const { u } = show(ex('vocab:konnichiwa', 'toJp'))
  await u.type(box(), 'konnichiwa{Enter}')
  expect(screen.getByText('✓ Correct')).toBeTruthy()
  expect(screen.getByText(/は is read “wa”/)).toBeTruthy()
})

it('Japanese -> English forgives one wrong letter in a longer answer, and says how it is spelt', async () => {
  const { u } = show(ex('vocab:ashita', 'toGloss'))
  await u.type(box(), 'tomorow{Enter}')
  expect(screen.getByText('✓ Correct')).toBeTruthy()
  expect(screen.getByText('Check the spelling: “tomorrow”.')).toBeTruthy()
})

it('after answering, focus moves to Continue so the keyboard flows on (Enter would not resubmit)', async () => {
  const { u } = show(ex('vocab:mizu', 'toJp'))
  await u.type(box(), 'mizu{Enter}')
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Continue' }))
})

it('"I don\'t know" is a miss that shows the answer; an empty Check is not possible', async () => {
  const { onDone, u } = show(ex('vocab:ashita', 'toGloss'))
  expect((screen.getByRole('button', { name: 'Check' }) as HTMLButtonElement).disabled).toBe(true)
  await u.type(box(), '   ')
  expect((screen.getByRole('button', { name: 'Check' }) as HTMLButtonElement).disabled).toBe(true)
  await u.click(screen.getByRole('button', { name: 'I don’t know' }))
  expect(screen.getByText('✗ Correct answer: tomorrow')).toBeTruthy()
  await u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(onDone).toHaveBeenCalledWith(['vocab:ashita'])
})

it('a held Enter does not submit repeatedly or skip the feedback; the input has a visible label', async () => {
  show(ex('vocab:mizu', 'toJp'))
  expect(fireEvent.keyDown(box(), { key: 'Enter', repeat: true })).toBe(false)
  expect(screen.getByLabelText(/Type it in Japanese/)).toBe(box())
  expect(box().getAttribute('autocapitalize')).toBe('none')
  expect(box().getAttribute('autocorrect')).toBe('off')
  expect(box().getAttribute('spellcheck')).toBe('false')
})

it('after answering a word, it is spoken when autoplay is on (and not when off, and never for kana)', async () => {
  const spy = vi.spyOn(audio, 'speak').mockReturnValue(true)
  let r = show(ex('vocab:mizu', 'toJp'), { autoplay: true })
  await r.u.type(box(), 'mizu{Enter}')
  expect(spy).toHaveBeenCalledWith('みず')
  cleanup(); spy.mockClear()
  r = show(ex('vocab:mizu', 'toJp'), { autoplay: false })
  await r.u.type(box(), 'mizu{Enter}')
  expect(spy).not.toHaveBeenCalled()
  cleanup()
  r = show(ex('hira:あ', 'toRomaji'), { autoplay: true })
  await r.u.type(box(), 'a{Enter}')
  expect(spy).not.toHaveBeenCalled() // the sound would only repeat the answer you just typed
})

const SENT = 'sent:watashi-wa-gakusei-desu'
it('sentences: type it with the particle as written (ha), spaces optional; the label says so', async () => {
  const { onDone, u } = show(ex(SENT, 'toJp'))
  expect(screen.getByLabelText(/particles as written: は = ha, を = wo/)).toBe(box())
  expect(screen.getByText('I am a student.')).toBeTruthy()
  await u.type(box(), 'watashi ha gakusei desu{Enter}')
  expect(screen.getByText('✓ Correct')).toBeTruthy()
  await u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(onDone).toHaveBeenCalledWith([])
})
it('sentences: "wa" for the particle is wrong, with the reason; the answer is shown with its reading', async () => {
  const { onDone, u } = show(ex(SENT, 'toJp'))
  await u.type(box(), 'watashi wa gakusei desu{Enter}')
  expect(screen.getByText('The particle は is typed “ha”, even though it sounds like “wa”.')).toBeTruthy()
  expect(screen.getByText('✗ Correct answer: わたしは がくせいです。')).toBeTruthy()
  expect(document.querySelector('.feedback small')!.textContent).toContain('(watashi wa gakusei desu) I am a student.')
  await u.click(screen.getByRole('button', { name: 'Continue' }))
  expect(onDone).toHaveBeenCalledWith([SENT])
})
it('sentences: the live preview shows kana while typing, and the other valid word order is accepted', async () => {
  let r = show(ex(SENT, 'toJp'))
  await r.u.type(box(), 'watashiha')
  expect(document.querySelector('.preview')!.textContent!.trim()).toBe('わたしは')
  cleanup()
  r = show(ex('sent:tomodachi-wa-sakana-o-tabemasu', 'toJp'))
  await r.u.type(box(), 'sakana wo tomodachi ha tabemasu{Enter}')
  expect(screen.getByText('✓ Correct')).toBeTruthy()
})
