import { describe, expect, it } from 'vitest'
import { KANA } from '../data/kana'
import { kanaToRomaji } from './romaji'
import { ITEMS, LESSONS, UNITS } from './course'
import { VOCAB_UNITS } from './vocab'

// the vocabulary's romaji is checked against the production kana -> romaji converter (こんにちは/こんばんは: は is read "wa")
const toRomaji = (kana: string) => kanaToRomaji(kana.replace(/(こんにちは|こんばんは)/g, (m) => m.slice(0, -1) + 'わ'))

describe('vocabulary content', () => {
  const words = VOCAB_UNITS.flatMap((u) => u.words)
  it('has 8 units of 18 words', () => {
    expect(VOCAB_UNITS).toHaveLength(8)
    for (const u of VOCAB_UNITS) expect(u.words, u.id).toHaveLength(18)
  })
  it('every romaji matches its kana', () => {
    const bad = words.filter(([jp, romaji]) => toRomaji(jp) !== romaji.replace(/ /g, '')).map(([jp, romaji]) => `${jp}: written ${romaji}, kana says ${toRomaji(jp)}`)
    expect(bad).toEqual([])
  })
  it('is kana only, with clean romaji, and has no empty fields', () => {
    for (const [jp, romaji, en, kanji] of words) {
      expect(jp, jp).toMatch(/^[ぁ-ゖァ-ヺー]+$/)
      expect(romaji, romaji).toMatch(/^[a-z']+( [a-z']+)*$/)
      expect(en.trim(), jp).not.toBe('')
      if (kanji !== undefined) expect(kanji, jp).toMatch(/[一-鿿]/)
    }
  })
  it('has unique kana, English and ids, so no question has two right answers', () => {
    for (const col of [0, 1, 2] as const) {
      const vals = words.map((w) => w[col])
      expect(vals.filter((v, i) => vals.indexOf(v) !== i), `column ${col}`).toEqual([])
    }
  })
})

describe('course structure', () => {
  it('has 15 units: 3 hiragana, 3 katakana, 8 vocabulary, 1 grammar; 68 lessons', () => {
    expect(UNITS).toHaveLength(15)
    expect(UNITS.slice(0, 3).map((u) => u.lessons.length)).toEqual([9, 5, 6])
    expect(UNITS.slice(3, 6).map((u) => u.lessons.length)).toEqual([9, 5, 6])
    expect(UNITS.slice(6, 14).map((u) => u.lessons.length)).toEqual(Array(8).fill(3))
    expect(UNITS[14].lessons).toHaveLength(4)
    expect(LESSONS).toHaveLength(68)
  })
  it('puts hiragana before katakana before vocabulary', () => {
    const firstOf = (p: string) => LESSONS.findIndex((l) => l.items[0].startsWith(p))
    expect(firstOf('hira:')).toBe(0)
    expect(firstOf('kata:')).toBe(20)
    expect(firstOf('vocab:')).toBe(40)
    expect(firstOf('sent:')).toBe(64) // grammar comes last: its sentences use the vocabulary
  })
  it('every lesson has 1-6 items that all exist, and ids/titles are unique and non-empty', () => {
    for (const l of LESSONS) {
      expect(l.items.length, l.id).toBeGreaterThanOrEqual(1)
      expect(l.items.length, l.id).toBeLessThanOrEqual(6)
      expect(l.title.trim(), l.id).not.toBe('')
      for (const id of l.items) expect(ITEMS.has(id), id).toBe(true)
    }
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length)
  })
  it('teaches every kana card exactly once, and every word exactly once', () => {
    const counts = new Map<string, number>()
    for (const l of LESSONS) for (const id of l.items) counts.set(id, (counts.get(id) ?? 0) + 1)
    for (const k of KANA) expect(counts.get(k.id), k.id).toBe(1)
    expect(LESSONS.flatMap((l) => l.items).filter((id) => id.startsWith('vocab:'))).toHaveLength(144)
    expect(LESSONS.flatMap((l) => l.items).filter((id) => id.startsWith('sent:'))).toHaveLength(24)
    for (const [id, n] of counts) expect(n, id).toBe(1)
  })
  it('items carry the right fields', () => {
    expect(ITEMS.get('hira:し')).toMatchObject({ kind: 'kana', script: 'hira', jp: 'し', gloss: 'shi' })
    expect(ITEMS.get('kata:キャ')).toMatchObject({ script: 'kata', gloss: 'kya' })
    expect(ITEMS.get('vocab:mizu')).toMatchObject({ kind: 'word', jp: 'みず', gloss: 'water', kanji: '水' })
    expect(ITEMS.get('vocab:yoroshiku-onegaishimasu')).toBeTruthy()
    expect(ITEMS.get('vocab:kinyoubi')).toMatchObject({ romaji: "kin'youbi", sound: "kin'youbi" }) // the id is stable; the reading keeps the apostrophe
  })
})
