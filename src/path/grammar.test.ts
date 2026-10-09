import { describe, expect, it } from 'vitest'
import { ITEMS, LESSONS, UNITS } from './course'
import { GRAMMAR_LESSONS } from './grammar'
import { PARTICLES, tokensToRomaji } from './romaji'
import { VOCAB_UNITS } from './vocab'

const grammar = LESSONS.filter((l) => l.id.startsWith('grammar-1-'))
const sentences = grammar.flatMap((l) => l.items.map((id) => ITEMS.get(id)!))
const vocab = VOCAB_UNITS.flatMap((u) => u.words)
const vocabJp = new Set(vocab.map((w) => w[0]))

// polite ます-form of a taught dictionary-form verb (so we never teach the form of a verb we haven't taught)
const ICHIDAN = new Set(['たべる', 'みる', 'ねる', 'おきる', 'いる'])
const I_ROW: Record<string, string> = { う: 'い', く: 'き', ぐ: 'ぎ', す: 'し', つ: 'ち', ぬ: 'に', ぶ: 'び', む: 'み', る: 'り' }
const masu = (dict: string) => {
  if (dict === 'する') return 'します'
  if (dict === 'くる') return 'きます'
  if (dict.endsWith('する')) return `${dict.slice(0, -2)}します`
  if (ICHIDAN.has(dict)) return `${dict.slice(0, -1)}ます`
  return `${dict.slice(0, -1)}${I_ROW[dict.slice(-1)]}ます`
}
const verbs = vocab.filter((w) => w[2].startsWith('to ')).map((w) => w[0])
const masuForms = new Set(verbs.map(masu))

describe('grammar unit content', () => {
  it('is one unit of four lessons of six sentences, last in the course', () => {
    expect(UNITS.at(-1)!.title).toBe('Grammar: simple sentences')
    expect(grammar).toHaveLength(4)
    expect(grammar.map((l) => l.items.length)).toEqual([6, 6, 6, 6])
    expect(LESSONS.slice(-4)).toEqual(grammar)
  })
  it('every sentence: tokens join to its display text, is built from taught words, particles and ます-forms', () => {
    const bad: string[] = []
    for (const s of sentences)
      for (const t of s.tokens!)
        if (!vocabJp.has(t) && !PARTICLES.has(t) && !['です'].includes(t) && !masuForms.has(t)) bad.push(`${s.jp}: ${t}`)
    expect(bad).toEqual([])
    for (const s of sentences) expect(s.jp.replace(/[ 。]/g, ''), s.jp).toBe(s.tokens!.join(''))
  })
  it('ます-forms are derived from taught verbs (たべる→たべます, のむ→のみます, かう→かいます, する→します)', () => {
    expect([masu('たべる'), masu('のむ'), masu('かう'), masu('よむ'), masu('する'), masu('べんきょうする'), masu('いく'), masu('はなす')]).toEqual(['たべます', 'のみます', 'かいます', 'よみます', 'します', 'べんきょうします', 'いきます', 'はなします'])
    const used = sentences.flatMap((s) => s.tokens!).filter((t) => t.endsWith('ます'))
    expect(used.length).toBeGreaterThan(0)
    for (const t of used) expect(masuForms.has(t), t).toBe(true)
  })
  it('romaji is generated from the tokens; ids and English are unique; pronunciations are right', () => {
    expect(ITEMS.get('sent:watashi-wa-gakusei-desu')).toMatchObject({ jp: 'わたしは がくせいです。', gloss: 'I am a student.', romaji: 'watashi wa gakusei desu' })
    expect(ITEMS.get('sent:mizu-o-nomimasu')!.romaji).toBe('mizu o nomimasu')
    for (const s of sentences) expect(s.romaji, s.jp).toBe(tokensToRomaji(s.tokens!))
    expect(new Set(sentences.map((s) => s.gloss)).size).toBe(24)
    expect(new Set(sentences.map((s) => s.jp)).size).toBe(24)
    expect(new Set(sentences.map((s) => s.id)).size).toBe(24)
  })
  it('every sentence has a particle to blank out, and its wrong chunks are not already in it', () => {
    for (const s of sentences) {
      expect(s.tokens!.some((t) => PARTICLES.has(t)), s.jp).toBe(true)
      for (const b of s.bank ?? []) expect(s.tokens, `${s.jp} bank ${b}`).not.toContain(b)
    }
  })
  it('alternative orders use exactly the same chunks, in a different order', () => {
    for (const s of sentences)
      for (const alt of s.alts ?? []) {
        expect([...alt].sort(), s.jp).toEqual([...s.tokens!].sort())
        expect(alt, s.jp).not.toEqual(s.tokens)
      }
    expect(sentences.filter((s) => s.alts).length).toBe(2)
  })
  it('each lesson opens with an explanation whose examples are its own sentences', () => {
    for (const [i, l] of grammar.entries()) {
      expect(l.explain!.title.length, l.id).toBeGreaterThan(0)
      expect(l.explain!.body.length, l.id).toBeGreaterThanOrEqual(3)
      expect(l.explain!.examples, l.id).toHaveLength(2)
      for (const id of l.explain!.examples) expect(l.items, l.id).toContain(id)
      expect(l.title, l.id).toBe(GRAMMAR_LESSONS[i].title)
    }
  })
  it('the explanation text names the patterns the sentences use (は/です, の/も, を/ます, い-adjectives)', () => {
    const text = (i: number) => grammar[i].explain!.body.join(' ')
    expect(text(0)).toMatch(/です/); expect(text(0)).toMatch(/は/)
    expect(text(1)).toMatch(/の/); expect(text(1)).toMatch(/も/)
    expect(text(2)).toMatch(/ます/); expect(text(2)).toMatch(/を/)
    expect(text(3)).toMatch(/い/)
  })
})
