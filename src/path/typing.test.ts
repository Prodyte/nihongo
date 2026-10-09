import { describe, expect, it } from 'vitest'
import { KANA } from '../data/kana'
import { VOCAB_UNITS } from './vocab'
import { glossAnswers } from './progress'
import { checkEnglish, checkJapanese, distance, normKana, toKana } from './typing'

const kana = (s: string) => toKana(s).kana

describe('toKana', () => {
  it.each([
    ['a', 'あ'], ['ka', 'か'], ['shi', 'し'], ['si', 'し'], ['tsu', 'つ'], ['tu', 'つ'], ['fu', 'ふ'], ['hu', 'ふ'],
    ['ji', 'じ'], ['zi', 'じ'], ['di', 'ぢ'], ['du', 'づ'], ['o', 'お'], ['wo', 'を'], ['wa', 'わ'],
    ['kya', 'きゃ'], ['sha', 'しゃ'], ['sya', 'しゃ'], ['cho', 'ちょ'], ['tyo', 'ちょ'], ['jyu', 'じゅ'], ['gyuunyuu', 'ぎゅうにゅう'],
    ['gakkou', 'がっこう'], ['mittsu', 'みっつ'], ['matcha', 'まっちゃ'], ['sassato', 'さっさと'],
    ['aa', 'ああ'], ['koohii', 'こおひい'], ['ringo', 'りんご'], ['hon', 'ほん'], ['sensei', 'せんせい'], ['benkyousuru', 'べんきょうする'],
  ])('%s -> %s', (romaji, expected) => expect(kana(romaji)).toBe(expected))

  describe('the letter n', () => {
    it.each([
      ['konnichiha', 'こんにちは'], ['konnichiwa', 'こんにちわ'], ['konna', 'こんな'], ['sannin', 'さんにん'], ['kinyuu', 'きにゅう'],
      ["kin'yuu", 'きんゆう'], ['n', 'ん'], ['nn', 'ん'], ['minasan', 'みなさん'], ['kanji', 'かんじ'], ['onna', 'おんな'], ["kin'youbi", 'きんようび'], ['kinnyoubi', 'きんにょうび'], ['kinyoubi', 'きにょうび'],
    ])('%s -> %s', (romaji, expected) => expect(kana(romaji)).toBe(expected))
  })

  it('is case-insensitive, passes IME kana and punctuation through, and maps - to ー', () => {
    expect(kana('KA')).toBe('か')
    expect(kana('みず')).toBe('みず')
    expect(kana('mizuを')).toBe('みずを')
    expect(kana('ko-hi-')).toBe('こーひー')
    expect(kana('a b')).toBe('あ b') // a lone unknown letter stays visible
  })
  it('keeps junk visible so the answer fails', () => {
    expect(kana('xqa')).toBe('xqあ')
  })

  it('live preview: the unfinished tail is pending, not converted', () => {
    expect(toKana('sh', false)).toEqual({ kana: '', pending: 'sh' })
    expect(toKana('ka', false)).toEqual({ kana: 'か', pending: '' })
    expect(toKana('kak', false)).toEqual({ kana: 'か', pending: 'k' })
    expect(toKana('kakk', false)).toEqual({ kana: 'かっ', pending: 'k' })
    expect(toKana('n', false)).toEqual({ kana: '', pending: 'n' })
    expect(toKana('n', true)).toEqual({ kana: 'ん', pending: '' })
    expect(toKana('kon', false)).toEqual({ kana: 'こ', pending: 'n' })
    expect(toKana('konn', false)).toEqual({ kana: 'こん', pending: 'n' }) // may still become こんな
    expect(toKana('konna', false)).toEqual({ kana: 'こんな', pending: '' })
    expect(toKana('ny', false)).toEqual({ kana: '', pending: 'ny' })
  })

  it('every spelling of every hiragana in the table types that kana (じ/ず/お keep "ji"/"zu"/"o"; ぢ づ を via di/du/wo)', () => {
    const shared: Record<string, string> = { ji: 'じ', zu: 'ず', o: 'お' }
    for (const k of KANA.filter((x) => x.script === 'hira' && x.kana !== 'ん'))
      for (const r of k.romaji) expect(kana(r), `${k.kana} typed as ${r}`).toBe(shared[r] ?? k.kana)
    expect([kana('di'), kana('du'), kana('wo')]).toEqual(['ぢ', 'づ', 'を'])
  })
})

describe('normKana', () => {
  it.each([['コーヒー', 'こおひい'], ['ラーメン', 'らあめん'], ['パン', 'ぱん'], ['シュー', 'しゅう'], ['わたしは がくせいです。', 'わたしはがくせいです'], ['ケーキ', 'けえき'], ['ドア', 'どあ']])('%s -> %s', (a, b) => expect(normKana(a)).toBe(b))
})

describe('checkJapanese', () => {
  const words = VOCAB_UNITS.flatMap((u) => u.words)
  it('accepts all 144 vocabulary words typed in their own romaji (with or without spaces)', () => {
    const bad = words.filter(([jp, romaji]) => !checkJapanese(romaji, jp, { word: true }).ok || !checkJapanese(romaji.replace(/ /g, ''), jp, { word: true }).ok).map(([jp, r]) => `${jp} / ${r}`)
    expect(bad).toEqual([])
  })
  it('katakana words accept hiragana-style typing, and an IME-typed answer works too', () => {
    expect(checkJapanese('koohii', 'コーヒー', { word: true }).ok).toBe(true)
    expect(checkJapanese('こおひい', 'コーヒー', { word: true }).ok).toBe(true)
    expect(checkJapanese('mizu', 'みず', { word: true }).ok).toBe(true)
  })
  it('ぢ/づ sound like じ/ず, so typing either spelling is right; loanword sounds use IME spellings', () => {
    for (const t of ['tsuzukeru', 'tsudukeru', 'つずける']) expect(checkJapanese(t, 'つづける', { word: true }).ok, t).toBe(true)
    expect(checkJapanese('hanaji', 'はなぢ', { word: true }).ok).toBe(true)
    expect(checkJapanese('paathii', 'パーティー', { word: true }).ok).toBe(true)
    expect(checkJapanese('fooku', 'フォーク', { word: true }).ok).toBe(true)
    expect(checkJapanese('chekku', 'チェック', { word: true }).ok).toBe(true)
  })
  it('is exact: a wrong or misspelt word fails', () => {
    for (const t of ['mizo', 'mizuu', 'miz', 'mi zu u', 'water', '']) expect(checkJapanese(t, 'みず', { word: true }).ok, t).toBe(false)
  })
  it('は-final words accept ha or wa, with a note for wa; other words do not take wa for ha', () => {
    expect(checkJapanese('konnichiha', 'こんにちは', { word: true })).toEqual({ ok: true })
    expect(checkJapanese('konnichiwa', 'こんにちは', { word: true }).ok).toBe(true)
    expect(checkJapanese('konnichiwa', 'こんにちは', { word: true }).note).toMatch(/read “wa”/)
    expect(checkJapanese('wasi', 'はし', { word: true }).ok).toBe(false)
    expect(checkJapanese('wa', 'は', { word: true }).ok).toBe(false) // a lone は is not a greeting
  })
  it('sentences: particles are typed as written, and the hint says so', () => {
    const s = 'わたしは がくせいです。'
    expect(checkJapanese('watashi ha gakusei desu', s).ok).toBe(true)
    expect(checkJapanese('watashihagakuseidesu', s).ok).toBe(true)
    const wa = checkJapanese('watashi wa gakusei desu', s)
    expect(wa.ok).toBe(false)
    expect(wa.note).toBe('The particle は is typed “ha”, even though it sounds like “wa”.')
    expect(checkJapanese('mizu o nomimasu', 'みずを のみます。').note).toMatch(/particle を is typed “wo”/)
    expect(checkJapanese('mizu wo nomimasu', 'みずを のみます。').ok).toBe(true)
    expect(checkJapanese('gakusei desu watashi ha', s).ok).toBe(false)
  })
  it('the particle hint only fires for real particle tokens, not は/を inside a word', () => {
    const t = ['わたし', 'は', 'はな', 'です']
    expect(checkJapanese('watashi ha wana desu', 'わたしは はなです。', { tokens: t }).note).toBeUndefined() // wrong, but は in はな is not a particle
    expect(checkJapanese('watashi wa hana desu', 'わたしは はなです。', { tokens: t }).note).toMatch(/particle は/)
    expect(checkJapanese('watashi wa hana desu', 'わたしは はなです。', { tokens: t }).ok).toBe(false)
  })
  it('alternative word orders are accepted', () => {
    expect(checkJapanese('sakana wo tomodachi ha tabemasu', 'ともだちは さかなを たべます。', { alts: ['さかなを ともだちは たべます。'] }).ok).toBe(true)
  })
})

describe('checkEnglish', () => {
  it('matches case-, punctuation- and space-insensitively, and each accepted part', () => {
    const a = glossAnswers('hello, good afternoon')
    for (const t of ['Hello', 'good afternoon!', '  GOOD   afternoon ', 'hello, good afternoon']) expect(checkEnglish(t, a).ok, t).toBe(true)
    expect(checkEnglish('goodbye', a).ok).toBe(false)
  })
  it('accepts a verb with or without "to", and text without the bracket', () => {
    expect(checkEnglish('eat', glossAnswers('to eat')).ok).toBe(true)
    expect(checkEnglish('to eat', glossAnswers('to eat')).ok).toBe(true)
    expect(checkEnglish('good morning', glossAnswers('good morning (casual)')).ok).toBe(true)
    expect(checkEnglish('exist', glossAnswers('to exist (things)')).ok).toBe(true)
  })
  it('forgives one wrong letter only in answers of 6+ letters, with a spelling note', () => {
    const r = checkEnglish('tomorow', glossAnswers('tomorrow'))
    expect(r).toEqual({ ok: true, note: 'Check the spelling: “tomorrow”.' })
    expect(checkEnglish('mandarin orang', glossAnswers('mandarin orange')).ok).toBe(true)
    expect(checkEnglish('watar', glossAnswers('water')).ok).toBe(false) // 5 letters: too short to forgive
    expect(checkEnglish('tomoroow', glossAnswers('tomorrow')).ok).toBe(true) // one substituted letter
    expect(checkEnglish('tomorw', glossAnswers('tomorrow')).ok).toBe(false) // two edits
    expect(checkEnglish('', ['water']).ok).toBe(false)
  })
  it('never forgives into a different word: no two accepted answers in the vocabulary are within one letter of each other', () => {
    const all = VOCAB_UNITS.flatMap((u) => u.words.map(([jp, , en]) => ({ jp, answers: glossAnswers(en).map((a) => a.toLowerCase().replace(/[^\p{L}\p{N}' ]/gu, ' ').replace(/\s+/g, ' ').trim()) })))
    const clashes: string[] = []
    for (const x of all) for (const y of all) {
      if (x === y) continue
      for (const a of x.answers) for (const b of y.answers) if (a.length >= 6 && a !== b && distance(a, b) <= 1) clashes.push(`${x.jp}:${a} ~ ${y.jp}:${b}`)
    }
    expect(clashes).toEqual([])
  })
})

describe('distance', () => {
  it.each([['', '', 0], ['a', '', 1], ['water', 'water', 0], ['water', 'watar', 1], ['kitten', 'sitting', 3], ['abc', 'acb', 2]])('%s / %s = %i', (a, b, d) => expect(distance(a as string, b as string)).toBe(d))
})
