import { describe, expect, it } from 'vitest'
import { KANA, matches, toHira } from './kana'

const by = (id: string) => KANA.find((k) => k.id === id)!

describe('kana table', () => {
  it('has 104 cards per script (46 base + 25 dakuten + 33 combo), unique ids', () => {
    for (const s of ['hira', 'kata']) expect(KANA.filter((k) => k.script === s)).toHaveLength(104)
    expect(new Set(KANA.map((k) => k.id)).size).toBe(208)
  })
  it('derives katakana with the same romaji', () => {
    expect(by('kata:ア').romaji).toEqual(by('hira:あ').romaji)
    expect(by('kata:ガ').romaji).toEqual(['ga'])
    expect(by('kata:キャ').romaji).toEqual(['kya'])
  })
  it('every katakana maps back to its hiragana twin (shown on katakana intros)', () => {
    for (const k of KANA.filter((x) => x.script === 'kata')) expect(by(`hira:${toHira(k.kana)}`).romaji, k.kana).toEqual(k.romaji)
  })
  it('has correct tricky romaji', () => {
    expect(by('hira:し').romaji).toEqual(['shi', 'si'])
    expect(by('hira:ふ').romaji[0]).toBe('fu')
    expect(by('hira:しゃ').romaji).toEqual(['sha', 'sya'])
    expect(by('hira:じゅ').romaji).toContain('ju')
    expect(by('hira:ちょ').romaji).toEqual(['cho', 'tyo', 'cyo'])
    expect(by('hira:ぢ').romaji).toContain('di')
  })
  it('matches typed answers case-insensitively with alternates', () => {
    expect(matches(by('hira:し').romaji, ' SHI ')).toBe(true)
    expect(matches(by('hira:し').romaji, 'si')).toBe(true)
    expect(matches(by('hira:し').romaji, 'ci')).toBe(false)
  })
})
