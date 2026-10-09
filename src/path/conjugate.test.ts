import { describe, expect, it } from 'vitest'
import { conjugate, conjugateWritten, FORMS, verbClass } from './conjugate'

const all = (reading: string, written?: string) => { const c = verbClass(reading, written)!; return FORMS.map((f) => conjugate(reading, f, c)) }

describe('verbClass', () => {
  it('る after an i/e sound is ichidan, except the known godan ones; する and くる are irregular', () => {
    expect(verbClass('たべる', '食べる')).toBe('ichidan')
    expect(verbClass('みる', '見る')).toBe('ichidan')
    expect(verbClass('かえる', '帰る')).toBe('godan')
    expect(verbClass('はいる', '入る')).toBe('godan')
    expect(verbClass('しる', '知る')).toBe('godan')
    expect(verbClass('きる', '切る')).toBe('godan')
    expect(verbClass('きる', '着る')).toBe('ichidan') // same reading, told apart by the kanji
    expect(verbClass('わかる', '分かる')).toBe('godan')
    expect(verbClass('うらぎる', '裏切る')).toBe('godan') // a compound ending in a godan verb
    expect(verbClass('きにいる', '気に入る')).toBe('godan')
    expect(verbClass('かえる', '変える')).toBe('ichidan') // same reading as 帰る
    expect(verbClass('する')).toBe('suru')
    expect(verbClass('べんきょうする')).toBe('suru')
    expect(verbClass('くる', '来る')).toBe('kuru')
    expect(verbClass('おおきい')).toBeNull() // not a verb
  })
})

describe('conjugate', () => {
  it('ichidan, godan by ending, and the irregulars, in ます, ません, ました, て, た, ない', () => {
    expect(all('たべる', '食べる')).toEqual(['たべます', 'たべません', 'たべました', 'たべて', 'たべた', 'たべない'])
    expect(all('かく', '書く')).toEqual(['かきます', 'かきません', 'かきました', 'かいて', 'かいた', 'かかない'])
    expect(all('およぐ', '泳ぐ')).toEqual(['およぎます', 'およぎません', 'およぎました', 'およいで', 'およいだ', 'およがない'])
    expect(all('はなす', '話す')).toEqual(['はなします', 'はなしません', 'はなしました', 'はなして', 'はなした', 'はなさない'])
    expect(all('まつ', '待つ')).toEqual(['まちます', 'まちません', 'まちました', 'まって', 'まった', 'またない'])
    expect(all('しぬ', '死ぬ')).toEqual(['しにます', 'しにません', 'しにました', 'しんで', 'しんだ', 'しなない'])
    expect(all('あそぶ', '遊ぶ')).toEqual(['あそびます', 'あそびません', 'あそびました', 'あそんで', 'あそんだ', 'あそばない'])
    expect(all('のむ', '飲む')).toEqual(['のみます', 'のみません', 'のみました', 'のんで', 'のんだ', 'のまない'])
    expect(all('かえる', '帰る')).toEqual(['かえります', 'かえりません', 'かえりました', 'かえって', 'かえった', 'かえらない'])
    expect(all('かう', '買う')).toEqual(['かいます', 'かいません', 'かいました', 'かって', 'かった', 'かわない'])
    expect(all('いく', '行く')).toEqual(['いきます', 'いきません', 'いきました', 'いって', 'いった', 'いかない'])
    expect(all('ある')).toEqual(['あります', 'ありません', 'ありました', 'あって', 'あった', 'ない'])
    expect(all('する')).toEqual(['します', 'しません', 'しました', 'して', 'した', 'しない'])
    expect(all('くる', '来る')).toEqual(['きます', 'きません', 'きました', 'きて', 'きた', 'こない'])
  })
})

describe('conjugateWritten', () => {
  it('keeps the kanji and changes the okurigana', () => {
    expect(conjugateWritten('食べる', 'たべる', 'te', 'ichidan')).toBe('食べて')
    expect(conjugateWritten('書く', 'かく', 'te', 'godan')).toBe('書いて')
    expect(conjugateWritten('分かる', 'わかる', 'nai', 'godan')).toBe('分からない')
    expect(conjugateWritten('来る', 'くる', 'nai', 'kuru')).toBe('来ない')
    expect(conjugateWritten('来る', 'くる', 'masu', 'kuru')).toBe('来ます')
    expect(conjugateWritten('ある', 'ある', 'nai', 'godan')).toBe('ない')
  })
})
