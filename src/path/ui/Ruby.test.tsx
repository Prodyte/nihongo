// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { FuriganaContext, type Furigana } from './furigana'
import { Ruby } from './Ruby'

afterEach(cleanup)
const html = (mode: Furigana, known: string[], text: string, reading?: string) => {
  const { container } = render(<FuriganaContext.Provider value={{ mode, known: new Set(known) }}><Ruby text={text} reading={reading} /></FuriganaContext.Provider>)
  const out = container.innerHTML
  cleanup()
  return out
}

it('auto: readings over words with a kanji the learner has not learned; none once all its kanji are known', () => {
  expect(html('auto', [], '時間', 'じかん')).toBe('<ruby>時間<rt>じかん</rt></ruby>')
  expect(html('auto', ['時'], '時間', 'じかん')).toBe('<ruby>時間<rt>じかん</rt></ruby>') // 間 still new
  expect(html('auto', ['時', '間'], '時間', 'じかん')).toBe('時間')
})
it('always / never override that; kana words and missing readings never get ruby', () => {
  expect(html('always', ['時', '間'], '時間', 'じかん')).toBe('<ruby>時間<rt>じかん</rt></ruby>')
  expect(html('never', [], '時間', 'じかん')).toBe('時間')
  expect(html('always', [], 'ない', 'ない')).toBe('ない')
  expect(html('always', [], '時間')).toBe('時間')
})
