import { describe, expect, it } from 'vitest'
import { newFsrsCard } from '../srs/scheduler'
import type { StoredCard } from '../db/db'
import { choices } from './choices'

const c = (id: string, ...back: string[]): StoredCard => ({ id, deck: 'hira', front: id, back, fsrs: newFsrsCard() })
const pool = [c('じ', 'ji', 'zi'), c('ぢ', 'ji', 'di'), c('a', 'a'), c('i', 'i'), c('u', 'u'), c('e', 'e')]

describe('choices', () => {
  it('includes the answer once, no duplicates, n options', () => {
    for (let k = 0; k < 50; k++) {
      const out = choices(pool[0], pool)
      expect(out).toHaveLength(4)
      expect(new Set(out).size).toBe(4)
      expect(out).toContain('ji')
    }
  })
  it("drops distractors that equal any accepted answer (ぢ accepts 'di' as well as 'ji')", () => {
    const withAlt = [...pool, c('x', 'di')] // a card whose canonical answer is another accepted spelling
    for (let k = 0; k < 50; k++) expect(choices(pool[1], withAlt, 6)).not.toContain('di')
  })
  it('returns fewer options when the pool is small', () => {
    expect(choices(pool[2], [pool[2], pool[3]])).toHaveLength(2)
  })
})
