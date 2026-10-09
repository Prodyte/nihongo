// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { JaText } from './JaText'

afterEach(cleanup)

it('wraps each run of Japanese in lang="ja" and leaves the English alone', () => {
  const { container } = render(<p><JaText text="わたしは = “as for me”. Try たべる → たべます, ok?" /></p>)
  const spans = [...container.querySelectorAll('span[lang="ja"]')].map((s) => s.textContent)
  expect(spans).toEqual(['わたしは', 'たべる', 'たべます'])
  expect(container.textContent).toBe('わたしは = “as for me”. Try たべる → たべます, ok?') // nothing lost or added
})
it('the Japanese full stop and comma stay with the Japanese, not the English voice', () => {
  const { container } = render(<p><JaText text="Say わたしは。 or はい、そうです。 now" /></p>)
  expect([...container.querySelectorAll('span[lang="ja"]')].map((s) => s.textContent)).toEqual(['わたしは。', 'はい、そうです。'])
})
it('plain English has no spans; all-Japanese is one span', () => {
  const a = render(<p><JaText text="Just English." /></p>)
  expect(a.container.querySelectorAll('span')).toHaveLength(0)
  cleanup()
  const b = render(<p><JaText text="こんにちは" /></p>)
  expect(b.container.querySelectorAll('span[lang="ja"]')).toHaveLength(1)
})
