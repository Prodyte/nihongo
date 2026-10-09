import { expect, it } from 'vitest'
import { kanaToRomaji } from '../../path/romaji'
import { normKana, toKana } from '../../path/typing'
import kanjiRows from './kanji.json'
import wordRows from './words.json'

const words = wordRows as [number, string, string, string][]
const kanji = kanjiRows as [string, number, string[], string[], string[], number][]

it('words: N5, then N4, then N3; about 3,400 of them, each written once', () => {
  expect(words.length).toBeGreaterThan(3300)
  const levels = words.map((w) => w[0])
  expect(levels).toEqual([...levels].sort((a, b) => b - a))
  const keys = words.map(([, k, r]) => k || r)
  expect(new Set(keys).size).toBe(keys.length)
})

it('words: no source markup is left (variants, affix tildes, honorific dashes, suru notes)', () => {
  for (const [, k, r, g] of words) {
    expect(`${k}${r}`, r).toMatch(/^[぀-ヿ一-鿿々ー]+$/)
    expect(r, r).toMatch(/^[぀-ヿー]+$/)
    expect(g, r).not.toMatch(/--|;|～|〜|\(abbr\.\)|\(e\.g\.$/)
    expect(g.length, g).toBeGreaterThan(0)
    expect(g.length, g).toBeLessThanOrEqual(60)
  }
})

it('words: every reading has romaji, and typing that romaji gives the reading back', () => {
  for (const [, , r] of words) {
    const romaji = kanaToRomaji(r)
    expect(normKana(toKana(romaji).kana), `${r} ${romaji}`).toBe(normKana(r))
  }
})

it('kanji: 612 for N5-N3 in level order, each with a meaning and a reading', () => {
  expect(kanji).toHaveLength(612)
  expect(kanji.filter((k) => k[1] === 5)).toHaveLength(79)
  const levels = kanji.map((k) => k[1])
  expect(levels).toEqual([...levels].sort((a, b) => b - a))
  for (const [c, , meanings, on, kun, strokes] of kanji) {
    expect(c).toMatch(/^[一-鿿]$/)
    expect(meanings.length, c).toBeGreaterThan(0)
    expect(on.length + kun.length, c).toBeGreaterThan(0)
    expect(strokes, c).toBeGreaterThan(0)
    expect(meanings.join(), c).not.toMatch(/radical/)
  }
})
