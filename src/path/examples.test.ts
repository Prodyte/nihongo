import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { ITEMS } from './course'
import { exampleFor, splitAround } from './examples'
import { furiganaParts } from './romaji'

const examples = JSON.parse(readFileSync(new URL('../../public/examples.json', import.meta.url), 'utf-8')) as Record<string, [string, string, number]>

it('example sentences: most course words find one, with readable furigana', () => {
  const words = [...ITEMS.values()].filter((it) => it.kind === 'word')
  const found = words.filter((it) => exampleFor(examples, it))
  expect(found.length).toBeGreaterThan(words.length * 0.8)
  expect(exampleFor(examples, ITEMS.get('vocab:aka')!)?.[0]).toMatch(/赤|あか/) // a starter word whose JLPT twin was merged into it
  for (const [jp, en, id] of Object.values(examples)) {
    expect(furiganaParts(jp).every((p) => typeof p === 'string' ? !/\p{Script=Han}/u.test(p) : !!p[1]), jp).toBe(true) // every kanji has a reading
    expect(en.length).toBeGreaterThan(2)
    expect(Number.isInteger(id)).toBe(true)
  }
})

it('splitAround: finds the word in its sentence (as written, or by its stem when conjugated), markup kept', () => {
  const word = (jp: string, written?: string) => ({ id: 'w:x', kind: 'word', jp, written, gloss: '', romaji: '', sound: '' }) as Parameters<typeof splitAround>[1]
  expect(splitAround('今日[きょう]の朝[あさ]は晴[は]れた。', word('あさ', '朝'))).toEqual(['今日[きょう]の', '朝[あさ]', 'は晴[は]れた。'])
  expect(splitAround('私[わたし]が助[たす]けてあげられた。', word('あげる'))).toEqual(['私[わたし]が助[たす]けて', 'あげ', 'られた。'])
  expect(splitAround('彼[かれ]を助[たす]けた。', word('たすける', '助ける'))).toEqual(['彼[かれ]を', '助[たす]け', 'た。'])
  expect(splitAround('今朝[けさ]は寒[さむ]い。', word('あさ', '朝'))).toEqual(['', '今朝[けさ]', 'は寒[さむ]い。']) // a kanji run is never cut
  expect(splitAround('猫[ねこ]が好[す]き。', word('いぬ', '犬'))).toBeNull()
  const words = [...ITEMS.values()].filter((it) => it.kind === 'word' && exampleFor(examples, it))
  const found = words.filter((it) => splitAround(exampleFor(examples, it)![0], it))
  expect(found.length).toBeGreaterThan(words.length * 0.95) // 2,981 of 3,051 when written
})
