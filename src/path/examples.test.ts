import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { ITEMS } from './course'
import { exampleFor } from './examples'
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
