import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { KANA } from '../data/kana'
import { kanaToRomaji } from './romaji'
import jlptWords from '../data/jlpt/words.json'
import { interleave, ITEMS, LESSONS, registerItem, SECTIONS, starterTwin, UNITS } from './course'
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
  it('sections in order: kana, starter, then N5, N4, N3; the first 68 lessons are unchanged (saved progress depends on their ids)', () => {
    expect(SECTIONS).toEqual(['Kana', 'Starter', 'N5', 'N4', 'N3'])
    const sections = UNITS.map((u) => u.section)
    expect(sections).toEqual([...sections].sort((a, b) => SECTIONS.indexOf(a) - SECTIONS.indexOf(b))) // each section contiguous
    expect(UNITS.slice(0, 3).map((u) => u.lessons.length)).toEqual([9, 5, 6])
    expect(UNITS.slice(3, 6).map((u) => u.lessons.length)).toEqual([9, 5, 6])
    expect(UNITS.slice(6, 14).map((u) => u.lessons.length)).toEqual(Array(8).fill(3))
    expect(UNITS[14].lessons).toHaveLength(4)
    const firstOf = (p: string) => LESSONS.findIndex((l) => l.items[0].startsWith(p))
    expect([firstOf('hira:'), firstOf('kata:'), firstOf('vocab:'), firstOf('sent:'), firstOf('kanji:'), firstOf('w:')]).toEqual([0, 20, 40, 64, 68, 69])
  })
  it('JLPT units hold up to 10 lessons at one level: words (6 a lesson) and kanji (5) spread through, ids counting from 1', () => {
    for (const level of [5, 4, 3]) {
      const lessons = UNITS.filter((u) => u.section === `N${level}`).flatMap((u) => u.lessons)
      for (const [kind, prefix, size] of [['word', 'v', 6], ['kanji', 'k', 5]] as const) {
        const mine = lessons.filter((l) => l.id.startsWith(`n${level}-${prefix}-`))
        expect(mine.map((l) => l.id)).toEqual(mine.map((_, i) => `n${level}-${prefix}-${i + 1}`))
        for (const l of mine) {
          expect(l.items.length, l.id).toBeLessThanOrEqual(size)
          expect(l.items.length, l.id).toBeGreaterThanOrEqual(size - 1) // no stragglers
          for (const id of l.items) expect(ITEMS.get(id), id).toMatchObject({ kind, level })
        }
      }
      // spread out: never more than 2 kanji lessons in a row, nor a long run of word lessons without one
      const kinds = lessons.map((l) => (l.id.includes('-k-') ? 'k' : 'v')).join('')
      expect(kinds, `N${level}`).not.toMatch(/kkk|v{12}/)
    }
    for (const u of UNITS.filter((x) => x.id.startsWith('n'))) expect(u.lessons.length, u.id).toBeLessThanOrEqual(10)
  })
  it('lesson ids map to the same words as when progress was first saved (a data edit must not shift them)', () => {
    const sample = Object.fromEntries(['n5-v-1', 'n5-v-50', 'n4-v-1', 'n4-v-100', 'n3-v-1', 'n3-v-300'].map((id) => [id, LESSONS.find((l) => l.id === id)?.items]))
    expect(sample).toMatchSnapshot()
    // and every JLPT lesson: if this changes, saved progress would point at other words. Append new words at the end of a
    // level (or migrate saved lessons) instead of regenerating the order.
    const all = LESSONS.filter((l) => /^n\d-/.test(l.id)).map((l) => `${l.id}=${l.items.join(',')}`).join('\n')
    expect(createHash('sha256').update(all).digest('hex')).toMatchSnapshot()
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
    expect(LESSONS.flatMap((l) => l.items).filter((id) => id.startsWith('w:')).length).toBeGreaterThan(3200)
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

describe('JLPT words', () => {
  const starter = [...ITEMS.values()].filter((i) => i.id.startsWith('vocab:'))
  it('a word the starter units teach is not taught again: same reading and kanji, or a shared meaning, or a listed alias', () => {
    expect(starterTwin('水', 'みず', 'water', starter)?.id).toBe('vocab:mizu')
    expect(starterTwin('はい', 'はい', 'yes', starter)?.id).toBe('vocab:hai')
    expect(starterTwin('有る', 'ある', 'to be, to have', starter)?.id).toBe('vocab:aru')
    expect(starterTwin('灰', 'はい', 'ash', starter)).toBeUndefined() // a homophone is a different word
    expect(starterTwin('厚い', 'あつい', 'thick', starter)).toBeUndefined()
    expect(starterTwin('暑い', 'あつい', 'hot (weather)', starter)).toBeUndefined() // the kanji tell two words apart: teach them
    expect(ITEMS.has('w:水')).toBe(false)
    expect(ITEMS.get('w:灰')).toMatchObject({ jp: 'はい', written: '灰', gloss: 'ash', level: 3 })
  })
  it('every JLPT word is taught once (or by its starter twin): none lost', () => {
    const taught = new Set(LESSONS.flatMap((l) => l.items))
    for (const [, w, r, g] of jlptWords as [number, string, string, string][]) {
      const id = `w:${w || r}`
      expect(taught.has(id) || !!starterTwin(w || r, r, g, starter), id).toBe(true)
    }
  })
  it('no two words are written the same (a question showing it would have two right answers)', () => {
    const shown = [...ITEMS.values()].filter((i) => i.kind === 'word').map((i) => i.written ?? i.jp)
    expect(shown.filter((w, i) => shown.indexOf(w) !== i)).toEqual([])
  })
  it('kana-only words have no written form; kanji words keep the reading in jp and romaji from it', () => {
    expect(ITEMS.get('w:ない')).toMatchObject({ jp: 'ない', romaji: 'nai' })
    expect(ITEMS.get('w:ない')!.written).toBeUndefined()
    expect(ITEMS.get('w:時間')).toMatchObject({ jp: 'じかん', written: '時間', romaji: 'jikan', sound: 'jikan', level: 5 })
  })
})

describe('interleave', () => {
  it('spreads the second list evenly through the first, keeping both orders and every entry', () => {
    expect(interleave<number | string>([1, 2, 3, 4], ['a', 'b'])).toEqual(['a', 1, 2, 'b', 3, 4])
    expect(interleave<number>([1, 2], [])).toEqual([1, 2])
    expect(interleave<string>([], ['a'])).toEqual(['a'])
    expect(interleave<number | string>([1], ['a', 'b', 'c'])).toEqual(['a', 1, 'b', 'c'])
  })
})

describe('registerItem', () => {
  it('refuses a second item with the same id instead of silently replacing the first', () => {
    const m = new Map()
    const item = { id: 'vocab:x', kind: 'word' as const, jp: 'あ', gloss: 'a', romaji: 'a', sound: 'a' }
    registerItem(m, item)
    expect(() => registerItem(m, { ...item, jp: 'い' })).toThrow('Duplicate item id vocab:x')
    expect(m.get('vocab:x')!.jp).toBe('あ')
  })
})
