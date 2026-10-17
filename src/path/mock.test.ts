import { expect, it } from 'vitest'
import { ITEMS, LESSONS } from './course'
import { gapFor } from './lesson'
import { buildMock, MOCK_LEVELS, MOCK_QUESTIONS } from './mock'

it('buildMock: 30 questions per level in JLPT sections, each item once, from that level, every one answerable', () => {
  for (const level of MOCK_LEVELS)
    for (const voice of [true, false])
      for (let seed = 0; seed < 5; seed++) {
        let x = seed + 1
        const rand = () => ((x = (x * 16807) % 2147483647) / 2147483647)
        const qs = buildMock(level, ITEMS, voice, rand)
        expect(qs).toHaveLength(MOCK_QUESTIONS)
        const count = (s: string) => qs.filter((q) => q.section === s).length
        expect([count('Vocabulary'), count('Kanji'), count('Grammar'), count('Listening')]).toEqual(voice ? [9, 7, 8, 6] : [12, 8, 10, 0])
        expect(new Set(qs.map((q) => q.ex.item.id)).size).toBe(qs.length)
        for (const { section, ex } of qs) {
          expect(ex.item.level, ex.item.id).toBe(level)
          expect(ex.options.length).toBeGreaterThanOrEqual(ex.item.kind === 'sentence' ? 2 : 4)
          expect(ex.options.filter((o) => o === ex.answer)).toHaveLength(1)
          if (section === 'Listening') expect(ex.type).toBe('listen')
          if (section === 'Grammar') expect(ex.type === 'choice' && ex.dir).toBe('fill')
          if (ex.type === 'choice' && ex.dir === 'toReading' && ex.item.kind === 'kanji') expect(ex.answer).toBe(ex.item.on![0])
        }
      }
})

it("every level's grammar sentences can be asked as a gap", () => {
  for (const l of LESSONS.filter((l) => /^n\d-g-/.test(l.id))) for (const id of l.items) expect(() => gapFor(ITEMS.get(id)!)).not.toThrow()
})
