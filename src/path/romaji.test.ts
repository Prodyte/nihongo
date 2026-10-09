import { describe, expect, it } from 'vitest'
import { displayJp, furiganaParts, kanaToRomaji, PARTICLES, readingOf, surfaceOf, tokensToRomaji } from './romaji'

describe('kanaToRomaji', () => {
  it.each([
    ['がっこう', 'gakkou'], ['コーヒー', 'koohii'], ['みっつ', 'mittsu'], ['きょう', 'kyou'], ['ラーメン', 'raamen'], ['しゅうまつ', 'shuumatsu'],
    ['まっちゃ', 'matcha'], ['おんな', 'onna'], ['こんな', 'konna'], ['ほん', 'hon'], ['ぎゅうにゅう', 'gyuunyuu'], ['ちゃ', 'cha'], ['ジュース', 'juusu'],
  ])('%s -> %s', (kana, romaji) => expect(kanaToRomaji(kana)).toBe(romaji))

  it("puts an apostrophe after ん before a vowel or y (it would read differently without)", () => {
    expect(kanaToRomaji('きんようび')).toBe("kin'youbi") // kinyoubi would be きにょうび
    expect(kanaToRomaji('こんいん')).toBe("kon'in")
    expect(kanaToRomaji('ほんや')).toBe("hon'ya")
    expect(kanaToRomaji('ぎんこう')).toBe('ginkou') // before a consonant it is unambiguous
    expect(kanaToRomaji('みなさん')).toBe('minasan')
  })
  it('throws on characters it cannot read, so content errors cannot slip through', () => {
    expect(() => kanaToRomaji('水')).toThrow('No romaji for 水')
    expect(() => kanaToRomaji('あっ')).toThrow('Dangling っ at the end')
    expect(() => kanaToRomaji('あっん')).toThrow('Dangling っ before ん')
    expect(() => kanaToRomaji('あっー')).toThrow('Dangling っ before ー')
  })
})

describe('sentences', () => {
  it('reads は as wa, を as o and へ as e only when they are particles', () => {
    expect(tokensToRomaji(['わたし', 'は', 'がくせい', 'です'])).toBe('watashi wa gakusei desu')
    expect(tokensToRomaji(['みず', 'を', 'のみます'])).toBe('mizu o nomimasu')
    expect(tokensToRomaji(['がっこう', 'へ', 'いきます'])).toBe('gakkou e ikimasu')
    expect(tokensToRomaji(['はな', 'です'])).toBe('hana desu') // は inside a word stays "ha"
  })
  it('spaces after particles, ends with 。, and leaves a final か attached', () => {
    expect(displayJp(['わたし', 'は', 'がくせい', 'です'])).toBe('わたしは がくせいです。')
    expect(displayJp(['あなた', 'は', 'がくせい', 'です', 'か'])).toBe('あなたは がくせいですか。')
    expect(displayJp(['わたし', 'の', 'ともだち', 'は', 'がくせい', 'です'])).toBe('わたしの ともだちは がくせいです。')
    expect(displayJp(['わたし', 'は', 'コーヒー', 'を', 'のみます'])).toBe('わたしは コーヒーを のみます。')
  })
  it('knows the particles', () => {
    for (const p of ['は', 'の', 'も', 'を', 'か']) expect(PARTICLES.has(p)).toBe(true)
    expect(PARTICLES.has('です')).toBe(false)
  })
})

describe('furigana markup in sentence chunks', () => {
  it('readingOf / surfaceOf split 漢字[かな] markup; furiganaParts gives ruby pairs', () => {
    expect(readingOf('食[た]べます')).toBe('たべます')
    expect(surfaceOf('朝[あさ]ご飯[はん]')).toBe('朝ご飯')
    expect(furiganaParts('学校[がっこう]に 行[い]きます')).toEqual([['学校', 'がっこう'], 'に ', ['行', 'い'], 'きます'])
    expect(tokensToRomaji(['学校[がっこう]', 'へ', '行[い]きます'])).toBe('gakkou e ikimasu')
  })
  it('displayJp spaces after particles and て-forms, keeping the markup', () => {
    expect(displayJp(['ちょっと', '待[ま]って', 'ください'])).toBe('ちょっと待[ま]って ください。')
    expect(displayJp(['静[しず]か', 'な', '所[ところ]', 'です'])).toBe('静[しず]かな 所[ところ]です。')
  })
})
