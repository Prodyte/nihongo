import { describe, expect, it } from 'vitest'
import { ITEMS, LESSONS } from './course'
import { search } from './lookup'
import { coverage } from './progress'

const ids = (q: string) => search(q).map((i) => i.id)

describe('search', () => {
  it('finds by kanji, kana, romaji (typed like an IME) and English, exact matches first', () => {
    expect(ids('時間')[0]).toBe('w:時間')
    expect(ids('じかん')[0]).toBe('w:時間')
    expect(ids('jikan')[0]).toBe('w:時間')
    expect(ids('日')[0]).toBe('kanji:日')
    expect(ids('にち')).toContain('kanji:日') // an on reading
    expect(ids('library')).toContain('w:図書館')
    expect(ids('')).toEqual([])
  })
  it('caps the results, and English needs 3+ letters (so "a" is not every word)', () => {
    expect(search('to').length).toBeLessThanOrEqual(50)
    expect(ids('ar')).not.toContain('w:図書館')
  })
  it('a regex character in the query is searched literally', () => {
    expect(() => search('(e.g')).not.toThrow()
  })
})

describe('coverage', () => {
  it('counts words, kanji and grammar per level from finished lessons; starter twins count toward their level', () => {
    const none = coverage(LESSONS, ITEMS, new Set())
    expect(none.map((c) => c.level)).toEqual([5, 4, 3])
    expect(none[0].kanji).toEqual([0, 79])
    expect(none[0].grammar).toEqual([0, 24])
    expect(none[2].grammar).toEqual([0, 32])
    expect(none[0].words[1]).toBeGreaterThan(650) // N5 words including the starter ones
    const starter = coverage(LESSONS, ITEMS, new Set(LESSONS.filter((l) => l.items[0].startsWith('vocab:')).map((l) => l.id)))
    expect(starter[0].words[0]).toBeGreaterThan(100)
    const k = LESSONS.find((l) => l.id === 'n5-k-1')!
    expect(coverage(LESSONS, ITEMS, new Set([k.id]))[0].kanji).toEqual([k.items.length, 79])
  })
})
