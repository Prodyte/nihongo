import { describe, expect, it } from 'vitest'
import { renderTemplate as r } from './render'

const ctx = { ord: 0, answer: false, frontSide: '' }

describe('renderTemplate', () => {
  it('substitutes fields and drops unknown ones', () => {
    expect(r('{{Front}} / {{Nope}}', { Front: '犬' }, ctx)).toBe('犬 / ')
  })
  it('sections show on non-empty and hide on empty; inverted sections flip', () => {
    const t = '{{#Hint}}H:{{Hint}}{{/Hint}}{{^Hint}}no hint{{/Hint}}'
    expect(r(t, { Hint: 'x' }, ctx)).toBe('H:x')
    expect(r(t, { Hint: '<br>  ' }, ctx)).toBe('no hint')
  })
  it('handles nested sections', () => {
    const t = '{{#A}}a{{#B}}b{{/B}}{{/A}}'
    expect(r(t, { A: '1', B: '1' }, ctx)).toBe('ab')
    expect(r(t, { A: '1', B: '' }, ctx)).toBe('a')
    expect(r(t, { A: '', B: '1' }, ctx)).toBe('')
  })
  it('FrontSide is only the passed question html', () => {
    expect(r('{{FrontSide}}<hr>{{Back}}', { Back: 'dog' }, { ...ctx, answer: true, frontSide: 'Q' })).toBe('Q<hr>dog')
  })
  it('cloze: question hides the active deletion, answer shows it, others stay plain', () => {
    const f = { Text: 'The capital of {{c1::Japan::country}} is {{c2::Tokyo}}' }
    expect(r('{{cloze:Text}}', f, ctx)).toBe('The capital of <span class="cloze">[country]</span> is Tokyo')
    expect(r('{{cloze:Text}}', f, { ...ctx, ord: 1, answer: true })).toBe('The capital of Japan is <span class="cloze">Tokyo</span>')
  })
  it('furigana / kana / kanji filters, and they leave [sound:] alone', () => {
    const f = { W: '漢字[かんじ]を 勉強[べんきょう]' }
    expect(r('{{furigana:W}}', f, ctx)).toBe('<ruby>漢字<rt>かんじ</rt></ruby>を<ruby>勉強<rt>べんきょう</rt></ruby>')
    expect(r('{{kana:W}}', f, ctx)).toBe('かんじをべんきょう')
    expect(r('{{kanji:W}}', f, ctx)).toContain('漢字')
    expect(r('{{furigana:A}}', { A: '[sound:a.mp3]' }, ctx)).toBe('[sound:a.mp3]')
  })
  it('template names that match Object.prototype members are just empty fields', () => {
    expect(r('a{{constructor}}b{{#__proto__}}x{{/__proto__}}{{toString}}', { F: '1' }, ctx)).toBe('ab')
  })
  it('text: strips html, hint: wraps in details, type: renders nothing', () => {
    expect(r('{{text:A}}', { A: '<b>x</b>' }, ctx)).toBe('x')
    expect(r('{{hint:A}}', { A: 'h' }, ctx)).toBe('<details><summary>Hint</summary>h</details>')
    expect(r('{{type:A}}', { A: 'h' }, ctx)).toBe('')
  })
})
