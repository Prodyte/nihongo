import { describe, expect, it } from 'vitest'
import { contentChunks, grammarWords, wordFor } from './course'
import { DIALOGUES } from './dialogues'
import { readingOf, surfaceOf, tokensToRomaji } from './romaji'

const words = { 5: grammarWords(5), 4: grammarWords(4), 3: grammarWords(3) }
const PUNCT = new Set(['、', '。', '？'])

describe('dialogues', () => {
  it('every word is a starter course word or one of the dialogue level or easier (as the stories check), every chunk has kana readings', () => {
    const missing: string[] = []
    for (const d of DIALOGUES) {
      const tokens = d.lines.flatMap((l) => l.tokens).filter((t) => !PUNCT.has(t))
      for (const t of tokens) {
        expect(readingOf(t), `${d.id}: ${t}`).toMatch(/^[ぁ-んァ-ヶー]+$/)
        expect(() => tokensToRomaji([t]), `${d.id}: ${t}`).not.toThrow()
      }
      for (const t of contentChunks(tokens)) if (!wordFor(t, words[d.level])) missing.push(`${d.id}: ${surfaceOf(t)}`)
    }
    expect(missing).toEqual([])
  })
  it('have unique ids, 4+ per level, two speakers taking 4-8 lines (A first), punctuation only between words, and 2-3 questions whose answer is one of the options', () => {
    expect(new Set(DIALOGUES.map((d) => d.id)).size).toBe(DIALOGUES.length)
    for (const level of [5, 4, 3]) expect(DIALOGUES.filter((d) => d.level === level).length, `N${level}`).toBeGreaterThanOrEqual(4)
    for (const d of DIALOGUES) {
      expect(d.lines.length, d.id).toBeGreaterThanOrEqual(4)
      expect(d.lines.length, d.id).toBeLessThanOrEqual(8)
      expect(d.lines[0].who, d.id).toBe('A')
      expect(d.lines.some((l) => l.who === 'B'), d.id).toBe(true)
      for (const l of d.lines) {
        expect(l.en.trim(), d.id).not.toBe('')
        expect(PUNCT.has(l.tokens[0]), `${d.id}: ${l.en}`).toBe(false)
        expect(l.tokens.slice(0, -1).some((t, i) => PUNCT.has(t) && PUNCT.has(l.tokens[i + 1])), `${d.id}: ${l.en}`).toBe(false)
        expect(['、', '。'].includes(l.tokens.at(-1)!), `${d.id}: ${l.en}`).toBe(false) // the line's 。 is added when shown
      }
      expect(d.questions.length, d.id).toBeGreaterThanOrEqual(2)
      expect(d.questions.length, d.id).toBeLessThanOrEqual(3)
      for (const q of d.questions) {
        expect(q.options[q.answer], `${d.id}: ${q.q}`).toBeDefined()
        expect(new Set(q.options).size, `${d.id}: ${q.q}`).toBe(q.options.length)
      }
    }
  })
})
