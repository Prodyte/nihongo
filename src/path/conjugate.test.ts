import { describe, expect, it } from 'vitest'
import { conjugate, conjugateWritten, FORMS, verbClass } from './conjugate'
import { ITEMS } from './course'

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
    expect(verbClass('する', '擦る')).toBe('godan') // read する, but not する
    expect(verbClass('せいかつする', '生活')).toBe('suru') // a する noun stored without its する
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
    expect(all('とう', '問う').slice(3, 5)).toEqual(['とうて', 'とうた'])
    expect(all('あいする', '愛する')[5]).toBe('あいさない')
  })
  it('-iru/-eru verbs that are godan anyway, and the honorifics whose ます stem is い', () => {
    expect(all('よみがえる', '蘇る')[0]).toBe('よみがえります')
    expect(all('きる', '斬る')[0]).toBe('きります')
    expect(all('かじる')[0]).toBe('かじります')
    expect(all('ちぎる')[3]).toBe('ちぎって')
    expect(all('まじる')[5]).toBe('まじらない')
    expect(all('いる', '煎る')[0]).toBe('いります')
    expect(all('ねじる', '捩る')[0]).toBe('ねじります')
    expect(all('しめる')[0]).toBe('しめります') // the course's kana-only しめる is 湿る; 閉める keeps its kanji
    expect(all('しめる', '閉める')[0]).toBe('しめます')
    expect(all('いらっしゃる')).toEqual(['いらっしゃいます', 'いらっしゃいません', 'いらっしゃいました', 'いらっしゃって', 'いらっしゃった', 'いらっしゃらない'])
    expect(all('おっしゃる')[0]).toBe('おっしゃいます')
    expect(all('なさる')[2]).toBe('なさいました')
    expect(all('さる', '去る')[0]).toBe('さります') // not honorific
  })
  it('every course verb a drill can ask is classed as its dictionary says (spot checks over the whole list)', () => {
    const words = [...ITEMS.values()].filter((w) => w.kind === 'word' && /^to /.test(w.gloss))
    const cls = (written: string) => { const w = words.find((x) => x.written === written || (!x.written && x.jp === written))!; return verbClass(w.jp, w.written) }
    for (const g of ['蘇る', '斬る', 'かじる', 'ちぎる', 'まじる', '炒る', '煎る', '捩る', 'しめる', '入る', '帰る', '参る']) expect(cls(g), g).toBe('godan')
    for (const i of ['経る', '得る', '診る', '着る', 'おきる', '閉める']) expect(cls(i), i).toBe('ichidan')
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
