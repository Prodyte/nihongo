import { describe, expect, it } from 'vitest'
import { ITEMS, LESSONS } from './course'
import { conjugationDrill, DRILL_SIZE, drillable, listeningDrill, speakingDrill, verbsIn } from './drills'

const learned = drillable(LESSONS.filter((l) => /^(vocab|n5-v|n5-g|grammar)/.test(l.items[0]) || /^(greetings|numbers|people|food|places|time|verbs|adjectives|grammar|n5-)/.test(l.id)).slice(0, 60).flatMap((l) => l.items.map((id) => ITEMS.get(id)!)))
const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }

describe('drills', () => {
  it('drill only words and sentences', () => {
    expect(learned.length).toBeGreaterThan(100)
    expect(drillable([ITEMS.get('hira:あ')!, ITEMS.get('kanji:日')!, ITEMS.get('w:時間')!]).map((i) => i.id)).toEqual(['w:時間'])
  })
  it('speaking: 10 speak exercises in the asked mode', () => {
    for (const mode of ['read', 'recall', 'shadow'] as const) {
      const exs = speakingDrill(learned, mode, seeded(3))
      expect(exs).toHaveLength(DRILL_SIZE)
      for (const e of exs) expect(e).toMatchObject({ type: 'speak', mode })
    }
  })
  it('listening: words are dictated, sentences asked for their meaning with one right option', () => {
    const exs = listeningDrill(learned, seeded(5))
    expect(exs.length).toBe(DRILL_SIZE)
    for (const e of exs) {
      if (e.type === 'type') { expect(e.dir).toBe('dictation'); expect(e.item.kind).toBe('word') }
      else if (e.type === 'choice') { expect(e.dir).toBe('hearMeaning'); expect(e.options.filter((o) => o === e.answer)).toHaveLength(1) }
      else throw new Error(`unexpected ${e.type}`)
    }
  })
  it('conjugation: verbs only, each asked in a form, answer and written form agree', () => {
    const verbs = verbsIn(learned)
    expect(verbs.length).toBeGreaterThan(5)
    expect(verbs.every((v) => v.gloss.startsWith('to '))).toBe(true)
    for (const e of conjugationDrill(verbs, seeded(9))) {
      if (e.type !== 'type') throw new Error('not typing')
      expect(e.dir).toBe('conjugate')
      expect(e.label).toBeTruthy()
      expect(e.item.jp).toMatch(/^[ぁ-ん]+$/)
      if (e.item.written) expect(e.item.written.slice(-1)).toBe(e.item.jp.slice(-1)) // same kana ending
    }
  })
})
