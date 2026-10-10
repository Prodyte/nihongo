import { expect, it } from 'vitest'
import PARTS from '../data/jlpt/parts.json'
import { ITEMS } from './course'
import { memoFor } from './mnemonic'

const memo = (id: string) => memoFor(ITEMS.get(id)!)

it('a kanji shows its parts; a pictograph has none', () => {
  expect(memo('kanji:休')).toEqual({ label: 'Parts', pieces: [['亻', 'person'], ['木', 'tree']] })
  expect(memo('kanji:日')).toBeNull()
})

it("a compound word shows each kanji's meaning; a one-kanji word its kanji's parts; kana and kana words nothing", () => {
  expect(memo('w:日本')?.pieces.map(([c]) => c)).toEqual(['日', '本'])
  expect(memo('w:日本')?.label).toBe('Kanji')
  expect(memo('w:休む')).toEqual({ label: '休 is made of', pieces: [['亻', 'person'], ['木', 'tree']] })
  expect(memo('hira:あ')).toBeNull()
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
