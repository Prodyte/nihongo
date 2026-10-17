// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import type { Item } from '../course'
import { Pitch } from './Pitch'

afterEach(cleanup)
beforeAll(() => {
  const data = { '学校|がっこう': [0], '|テレビ': [1], '飲み物|のみもの': [3, 2], '弟|おとうと': [4], '|ちょっと': [1, 0] }
  vi.stubGlobal('fetch', vi.fn(async (url: string) => (url.endsWith('accents.json') ? new Response(JSON.stringify(data)) : new Response('', { status: 404 }))))
  return () => vi.unstubAllGlobals()
})
const word = (written: string, jp: string): Item => ({ id: `w:${written || jp}`, kind: 'word', jp, written: written || undefined, gloss: '', romaji: '', sound: '' })
/** Each mora as text plus marks: ¯ high, ↘ drop after it; a trailing ¯ is the heiban line running on. */
const drawn = (img: HTMLElement) => [...img.children].map((m) => `${m.textContent}${m.classList.contains('hi') ? '¯' : ''}${m.classList.contains('drop') ? '↘' : ''}`).join(' ')

it('heiban: low first mora, then a line that runs on past the word', async () => {
  render(<Pitch item={word('学校', 'がっこう')} />)
  const img = await screen.findByRole('img', { name: 'pitch: heiban, no drop' })
  expect(drawn(img)).toBe('が っ¯ こ¯ う¯ ¯')
})

it('atamadaka, nakadaka and odaka drop after the right mora; several accents are all drawn', async () => {
  render(<><Pitch item={word('', 'テレビ')} /><Pitch item={word('飲み物', 'のみもの')} /><Pitch item={word('弟', 'おとうと')} /></>)
  expect(drawn(await screen.findByRole('img', { name: 'pitch: atamadaka, drops after the 1st mora' }))).toBe('テ¯↘ レ ビ')
  expect(drawn(await screen.findByRole('img', { name: 'pitch: odaka, drops after the last mora' }))).toBe('お と¯ う¯ と¯↘')
  expect(drawn(screen.getByRole('img', { name: 'pitch: nakadaka, drops after the 2nd mora' }))).toBe('の み¯↘ も の')
  expect(screen.getAllByRole('img')).toHaveLength(4) // のみもの has two accents (3 and 2)
})

it('shows nothing for a word without data, or for a kana sound', async () => {
  const { container } = render(<><Pitch item={word('', 'ちょっと')} /><Pitch item={word('猫', 'ねこ')} /><Pitch item={{ ...word('', 'ちょっと'), kind: 'kana' }} /></>)
  await screen.findByRole('img', { name: 'pitch: atamadaka, drops after the 1st mora' }) // ちょっと loaded, so the others had their chance
  expect(drawn(screen.getAllByRole('img')[0])).toBe('ちょ¯↘ っ と')
  expect(container.querySelectorAll('.pitch')).toHaveLength(1)
})
