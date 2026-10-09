import { describe, expect, it } from 'vitest'
import { contentChunks, ITEMS, LESSONS, wordFor, written } from './course'
import { N5_GRAMMAR } from './grammarN5'
import { readingOf, surfaceOf } from './romaji'

const lessons = LESSONS.filter((l) => l.id.startsWith('n5-g-'))
const sentences = lessons.flatMap((l) => l.items.map((id) => ITEMS.get(id)!))
const words = [...ITEMS.values()].filter((w) => w.kind === 'word' && (w.id.startsWith('vocab:') || w.level === 5))
const HAN = /\p{Script=Han}/u

describe('N5 grammar', () => {
  it('24 lessons of six sentences, in order, spread through the N5 section', () => {
    expect(lessons.map((l) => l.id)).toEqual(N5_GRAMMAR.map((_, i) => `n5-g-${i + 1}`))
    for (const l of lessons) expect(l.items, l.id).toHaveLength(6)
    const n5 = LESSONS.filter((l) => l.id.startsWith('n5-'))
    const at = lessons.map((l) => n5.indexOf(l))
    for (let i = 1; i < at.length; i++) expect(at[i] - at[i - 1], lessons[i].id).toBeGreaterThanOrEqual(3)
    expect(at[0]).toBeLessThan(10) // the first comes early
  })
  it('every word in a sentence is an N5 (or starter) word taught before the lesson', () => {
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
    expect(sentences.filter((s) => s.gap).length).toBeGreaterThan(120)
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
  const of = (t: string) => wordFor(t, words)?.id
  it('finds the dictionary word behind a conjugated chunk', () => {
    expect(of('食[た]べませんでした')).toBe(of('食[た]べる'))
    expect(of('話[はな]しました')).toBe(of('話[はな]す')) // the verb, not the noun 話
    expect(of('休[やす]みましょう')).toBe(of('休[やす]む')) // the verb, not the noun 休み
    expect(of('寒[さむ]くない')).toBe(of('寒[さむ]い'))
    expect(of('よくなかった')).toBe(of('いい'))
    expect(of('電話[でんわ]して')).toBe(of('電話[でんわ]'))
    expect(of('したくない')).toBe(of('する'))
    expect(of('います')).toBe(of('いる'))
  })
  it('finds nothing for words the course does not teach', () => {
    expect(of('猿[さる]')).toBeUndefined()
    expect(of('ほげ')).toBeUndefined()
  })
})
