import { describe, expect, it } from 'vitest'
import { contentChunks, grammarWords, ITEMS, LESSONS, wordFor, written } from './course'
import { N3_GRAMMAR } from './grammarN3'
import { N4_GRAMMAR } from './grammarN4'
import { N5_GRAMMAR } from './grammarN5'
import { readingOf, surfaceOf } from './romaji'

const HAN = /\p{Script=Han}/u

describe.each([[5, N5_GRAMMAR], [4, N4_GRAMMAR], [3, N3_GRAMMAR]] as const)('N%i grammar', (level, specs) => {
  const lessons = LESSONS.filter((l) => l.id.startsWith(`n${level}-g-`))
  const sentences = lessons.flatMap((l) => l.items.map((id) => ITEMS.get(id)!))
  const words = grammarWords(level)
  it('lessons of six sentences, in order, spread through the section', () => {
    expect(lessons.map((l) => l.id)).toEqual(specs.map((_, i) => `n${level}-g-${i + 1}`))
    for (const l of lessons) expect(l.items, l.id).toHaveLength(6)
    const section = LESSONS.filter((l) => l.id.startsWith(`n${level}-`))
    const at = lessons.map((l) => section.indexOf(l))
    for (let i = 1; i < at.length; i++) expect(at[i] - at[i - 1], lessons[i].id).toBeGreaterThanOrEqual(3)
    expect(at[0]).toBeLessThan(10) // the first comes early
    expect(section.length - at.at(-1)!, 'the last is not stuck at the end').toBeGreaterThan(3)
  })
  it('every word in a sentence is a course word of this level or easier, taught before the lesson', () => {
    const taughtAt = new Map(LESSONS.flatMap((l, i) => l.items.map((id): [string, number] => [id, i])))
    for (const l of lessons) {
      const here = LESSONS.indexOf(l)
      for (const id of l.items)
        for (const t of contentChunks(ITEMS.get(id)!.tokens!)) {
          const w = wordFor(t, words)
          expect(w, `${l.id}: ${surfaceOf(t)}`).toBeDefined()
          expect(taughtAt.get(w!.id)!, `${l.id}: ${surfaceOf(t)} (${w!.id}) is taught after the lesson`).toBeLessThan(here)
        }
    }
  })
  it('furigana markup is complete: every kanji has a reading, readings are kana, and a whole word reads as the course says', () => {
    for (const s of sentences)
      for (const t of [...s.tokens!, ...(s.bank ?? []), ...(s.gap?.wrong ?? [])]) {
        expect(readingOf(t), `${s.id}: ${t}`).not.toMatch(HAN)
        expect(readingOf(t), `${s.id}: ${t}`).toMatch(/^[ぁ-んァ-ヶー]+$/)
        expect(surfaceOf(t), `${s.id}: ${t}`).not.toMatch(/[[\]]/)
        const w = words.find((x) => x.written === surfaceOf(t) && HAN.test(surfaceOf(t))) // JLPT words (a starter word's kanji is only a hint)
        if (w && !['何', '背'].includes(w.written!)) expect(readingOf(t), `${s.id}: ${t} is read ${w.jp}`).toBe(w.jp) // 何 なに/なん and 背 せ/せい both have two readings
      }
  })
  it('sentences are unique in Japanese and English; written forms keep kanji, jp is all kana', () => {
    const all = [...ITEMS.values()].filter((x) => x.kind === 'sentence')
    for (const key of [(x: (typeof all)[number]) => x.gloss, (x: (typeof all)[number]) => x.jp, written]) {
      const vals = all.map(key)
      expect(vals.filter((v, i) => vals.indexOf(v) !== i)).toEqual([])
    }
    for (const s of sentences) expect(s.jp, s.id).not.toMatch(HAN)
  })
  it('curated gaps point at a chunk, offer distinct wrong forms, and never offer a chunk the sentence already has there', () => {
    for (const s of sentences) {
      if (!s.gap) continue
      expect(s.tokens![s.gap.at], s.id).toBeDefined()
      expect(new Set([s.tokens![s.gap.at], ...s.gap.wrong]).size, s.id).toBe(s.gap.wrong.length + 1)
    }
    expect(sentences.filter((s) => s.gap).length).toBeGreaterThan(sentences.length * 0.7)
  })
  it('each lesson opens with an explanation whose two examples are its own sentences; word-bank extras are not in the answer', () => {
    for (const l of lessons) {
      expect(l.explain!.body.length, l.id).toBeGreaterThanOrEqual(3)
      expect(l.explain!.examples, l.id).toHaveLength(2)
      for (const id of l.explain!.examples) expect(l.items).toContain(id)
    }
    for (const s of sentences) for (const b of s.bank ?? []) expect(s.tokens, `${s.id} ${b}`).not.toContain(b)
  })
})

describe('wordFor', () => {
  const words = grammarWords(5)
  const of = (t: string) => wordFor(t, words)?.id
  it('finds the dictionary word behind a conjugated chunk', () => {
    expect(of('食[た]べませんでした')).toBe(of('食[た]べる'))
    expect(of('話[はな]しました')).toBe(of('話[はな]す')) // the verb, not the noun 話
    expect(of('休[やす]みましょう')).toBe(of('休[やす]む')) // the verb, not the noun 休み
    expect(of('寒[さむ]くない')).toBe(of('寒[さむ]い'))
    expect(of('よくなかった')).toBe(of('いい'))
    expect(of('電話[でんわ]して')).toBe(of('電話[でんわ]'))
    expect(of('したくない')).toBe(of('する'))
    expect(of('言[い]わないで')).toBe(of('言[い]う')) // the verb, not the adverb 言わば (which never conjugates)
    expect(of('います')).toBe(of('いる'))
    expect(of('ありました')).toBe(of('ある'))
    expect(of('おいしかった')).toBe(of('おいしい'))
  })
  it('finds nothing for words the course does not teach', () => {
    expect(of('猿[さる]')).toBeUndefined()
    expect(of('ほげ')).toBeUndefined()
  })
})
