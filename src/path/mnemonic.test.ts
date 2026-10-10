import { expect, it } from 'vitest'
import PARTS from '../data/jlpt/parts.json'
import { ITEMS } from './course'
import { kanaHint } from './kanaMnemonics'
import { KANJI_STORIES } from './kanjiStories'
import { hintFor, memoFor } from './mnemonic'

const memo = (id: string) => memoFor(ITEMS.get(id)!)

it('a kanji shows its story and parts; a pictograph its story alone; an N3 kanji with neither nothing', () => {
  expect(memo('kanji:休')).toMatchObject({ label: 'Parts', pieces: [['亻', 'person'], ['木', 'tree']], story: expect.stringMatching(/leaning against a tree/) })
  expect(memo('kanji:日')).toMatchObject({ pieces: [], story: expect.stringMatching(/sun/) })
  const bare = [...ITEMS.values()].find((it) => it.kind === 'kanji' && !(it.jp in PARTS) && !KANJI_STORIES[it.jp])!
  expect(memoFor(bare)).toBeNull()
})

it('every N5 kanji has a story', () => {
  const n5 = [...ITEMS.values()].filter((it) => it.kind === 'kanji' && it.level === 5).map((it) => it.jp)
  expect(n5.filter((k) => !KANJI_STORIES[k])).toEqual([])
})

it('kana hints: a picture for each basic kana, a rule for voiced kana and combinations; shown after a wrong answer', () => {
  const kana = [...ITEMS.values()].filter((it) => it.kind === 'kana')
  expect(kana.filter((k) => !k.note)).toEqual([])
  expect(kanaHint('が')).toBe('か (ka) with two ticks ゛: ka becomes ga.')
  expect(kanaHint('ぱ')).toBe('は (ha) with a circle ゜: ha becomes pa.')
  expect(kanaHint('キャ')).toBe('キ (ki) + small ャ (ya): blend them into one sound, kya.')
  expect(ITEMS.get('hira:を')!.note).toMatch(/wo-ah.*pronounced "o"/)
  expect(hintFor(ITEMS.get('hira:き')!)).toMatch(/key/)
  expect(hintFor(ITEMS.get('kanji:休')!)).toMatch(/leaning/)
  expect(hintFor(ITEMS.get('w:日本')!)).toBeUndefined()
})

it("a compound word shows each kanji's meaning; a one-kanji word its kanji's parts; kana words nothing", () => {
  expect(memo('w:日本')?.pieces.map(([c]) => c)).toEqual(['日', '本'])
  expect(memo('w:日本')?.label).toBe('Kanji')
  expect(memo('w:休む')).toMatchObject({ label: '休 is made of', pieces: [['亻', 'person'], ['木', 'tree']] })
  expect(memo('w:ゆっくり')).toBeNull()
})

it('parts data: course kanji only, at least two different parts each, all but a handful named', () => {
  const all = Object.entries(PARTS as Record<string, string[][]>)
  expect(all.length).toBeGreaterThan(400)
  for (const [k, ps] of all) {
    expect(ITEMS.has(`kanji:${k}`)).toBe(true)
    expect(new Set(ps.map(([c]) => c)).size).toBe(ps.length)
    expect(ps.length).toBeGreaterThanOrEqual(2)
  }
  expect(all.flatMap(([, ps]) => ps).filter(([, m]) => !m).length).toBeLessThan(5)
})
