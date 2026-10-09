import { describe, expect, it } from 'vitest'
import { contentChunks, ITEMS, wordFor } from './course'
import { readingOf, surfaceOf, tokensToRomaji } from './romaji'
import { STORIES } from './stories'

const words = [...ITEMS.values()].filter((w) => w.kind === 'word' && (w.id.startsWith('vocab:') || w.level === 5))

describe('stories', () => {
  it('every word is an N5 or starter course word (so it can be looked up), every chunk has kana readings', () => {
    const missing: string[] = []
    for (const s of STORIES)
      for (const t of [...s.sentences.flatMap((x) => x.tokens), ...s.title.split(' ')]) {
        expect(readingOf(t), `${s.id}: ${t}`).toMatch(/^[ぁ-んァ-ヶー]+$/)
        expect(() => tokensToRomaji([t]), `${s.id}: ${t}`).not.toThrow()
      }
    for (const s of STORIES) for (const t of contentChunks(s.sentences.flatMap((x) => x.tokens))) if (!wordFor(t, words)) missing.push(`${s.id}: ${surfaceOf(t)}`)
    expect(missing).toEqual([])
  })
  it('have unique ids, 6+ sentences with English, and 3 questions whose answer is one of the options', () => {
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(STORIES.length)
    for (const s of STORIES) {
      expect(s.sentences.length, s.id).toBeGreaterThanOrEqual(6)
      for (const x of s.sentences) expect(x.en.trim(), s.id).not.toBe('')
      expect(s.questions, s.id).toHaveLength(3)
      for (const q of s.questions) {
        expect(q.options[q.answer], `${s.id}: ${q.q}`).toBeDefined()
        expect(new Set(q.options).size, `${s.id}: ${q.q}`).toBe(q.options.length)
      }
    }
  })
})
