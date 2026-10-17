import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { accentFor, isHigh, morae, pattern } from './accents'
import { ITEMS } from './course'

const accents = JSON.parse(readFileSync(new URL('../../public/accents.json', import.meta.url), 'utf-8')) as Record<string, number[]>

it('splits kana into morae: small ゃゅょ (and ァィ...) join the kana before; っ, ー and ん stand alone', () => {
  expect(morae('きょう')).toEqual(['きょ', 'う'])
  expect(morae('がっこう')).toEqual(['が', 'っ', 'こ', 'う'])
  expect(morae('コーヒー')).toEqual(['コ', 'ー', 'ヒ', 'ー'])
  expect(morae('ちゃんと')).toEqual(['ちゃ', 'ん', 'と'])
  expect(morae('パーティー')).toEqual(['パ', 'ー', 'ティ', 'ー'])
})

it('names the pattern and marks the high morae', () => {
  const highs = (d: number, n: number) => Array.from({ length: n }, (_, i) => isHigh(i, d))
  expect([pattern(0, 3), pattern(1, 3), pattern(2, 3), pattern(3, 3)]).toEqual(['heiban', 'atamadaka', 'nakadaka', 'odaka'])
  expect(highs(0, 3)).toEqual([false, true, true]) // さくら-like flat: low, then high on
  expect(highs(1, 3)).toEqual([true, false, false])
  expect(highs(2, 3)).toEqual([false, true, false])
  expect(highs(3, 3)).toEqual([false, true, true]) // odaka: drawn like heiban, the drop mark tells them apart
})

it('accents.json: keys match course words, drops fit the word, and most words have one', () => {
  const words = [...ITEMS.values()].filter((i) => i.kind === 'word')
  const found = words.filter((w) => accentFor(accents, w))
  expect(found.length / words.length).toBeGreaterThan(0.9)
  for (const w of found) for (const d of accentFor(accents, w)!) expect(d).toBeLessThanOrEqual(morae(w.jp).length)
  expect(accentFor(accents, ITEMS.get('w:時間')!)).toEqual([0])
  expect(accentFor(accents, ITEMS.get('kana:あ')!)).toBeUndefined() // the kana あ isn't the word あ
})
