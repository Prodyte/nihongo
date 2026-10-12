// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ITEMS } from '../course'
import { Feedback } from './Feedback'
import { FuriganaContext } from './furigana'
import { Intro } from './Intro'

afterEach(cleanup)
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
