// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ITEMS } from '../course'
import { Feedback } from './Feedback'
import { FuriganaContext } from './furigana'
import { Intro } from './Intro'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const withRomaji = (romaji: boolean, ui: React.ReactNode) => render(<FuriganaContext.Provider value={{ mode: 'auto', known: new Set(), romaji }}>{ui}</FuriganaContext.Provider>)

it('romaji shows next to a new word only while the setting allows it; the kana reading always shows', () => {
  const word = [...ITEMS.values()].find((i) => i.kind === 'word' && i.written)!
  withRomaji(true, <Intro item={word} autoplay={false} onDone={() => {}} />)
  expect(document.querySelector('.reading')!.textContent).toBe(`${word.jp} · ${word.romaji}`)
  cleanup()
  withRomaji(false, <Intro item={word} autoplay={false} onDone={() => {}} />)
  expect(document.querySelector('.reading')!.textContent).toBe(word.jp)
  cleanup()
  const mizu = ITEMS.get('vocab:mizu')!
  withRomaji(false, <Intro item={mizu} autoplay={false} onDone={() => {}} />)
  expect(document.querySelector('.reading')?.textContent ?? '').not.toContain('mizu') // just its kanji (水), if any
  cleanup()
  withRomaji(false, <Feedback result={false} item={mizu} answer={mizu.jp} onContinue={() => {}} />)
  expect(screen.getByRole('status').textContent).not.toContain('mizu')
  cleanup()
  withRomaji(true, <Feedback result={false} item={mizu} answer={mizu.jp} onContinue={() => {}} />)
  expect(screen.getByRole('status').textContent).toContain('(mizu)')
})

it('a new word shows its pitch accent under the reading; a word without one shows none', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => (url.endsWith('accents.json') ? new Response(JSON.stringify({ '時間|じかん': [0] })) : new Response('', { status: 404 }))))
  withRomaji(false, <Intro item={ITEMS.get('w:時間')!} autoplay={false} onDone={() => {}} />)
  const img = await screen.findByRole('img', { name: 'pitch: heiban, no drop' })
  expect(img.closest('.pitch')!.previousElementSibling!.className).toBe('reading')
  cleanup()
  withRomaji(false, <Intro item={[...ITEMS.values()].find((i) => i.id.startsWith('w:') && i.id !== 'w:時間')!} autoplay={false} onDone={() => {}} />)
  await new Promise((r) => setTimeout(r))
  expect(screen.queryByRole('img', { name: /pitch/ })).toBeNull()
})
