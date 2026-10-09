export interface Kana {
  id: string // 'hira:あ' | 'kata:ア'
  script: 'hira' | 'kata'
  kana: string
  romaji: string[] // first is canonical, rest are accepted typing alternates
  group: 'base' | 'dakuten' | 'combo'
}

// Hiragana only: "kana romaji[/alt...]". Katakana is derived by a fixed Unicode offset.
const BASE = `あ a い i う u え e お o か ka き ki く ku け ke こ ko
さ sa し shi/si す su せ se そ so た ta ち chi/ti つ tsu/tu て te と to
な na に ni ぬ nu ね ne の no は ha ひ hi ふ fu/hu へ he ほ ho
ま ma み mi む mu め me も mo や ya ゆ yu よ yo
ら ra り ri る ru れ re ろ ro わ wa を wo/o ん n/nn`
const DAKUTEN = `が ga ぎ gi ぐ gu げ ge ご go ざ za じ ji/zi ず zu ぜ ze ぞ zo
だ da ぢ ji/di づ zu/du で de ど do ば ba び bi ぶ bu べ be ぼ bo
ぱ pa ぴ pi ぷ pu ぺ pe ぽ po`
const COMBO_ROWS: [string, string][] = [
  ['き', 'ky'], ['し', 'sh'], ['ち', 'ch'], ['に', 'ny'], ['ひ', 'hy'], ['み', 'my'],
  ['り', 'ry'], ['ぎ', 'gy'], ['じ', 'j'], ['び', 'by'], ['ぴ', 'py'],
]
const ALT: Record<string, string[]> = { sh: ['sy'], ch: ['ty', 'cy'], j: ['jy', 'zy'] }
const COMBO_SMALL: [string, string][] = [['ゃ', 'a'], ['ゅ', 'u'], ['ょ', 'o']]

const pairs = (s: string) => {
  const t = s.trim().split(/\s+/)
  return Array.from({ length: t.length / 2 }, (_, i) => [t[2 * i], t[2 * i + 1].split('/')] as const)
}
export const toKata = (s: string) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))

const hira: Omit<Kana, 'id' | 'script'>[] = [
  ...pairs(BASE).map(([kana, romaji]) => ({ kana, romaji, group: 'base' as const })),
  ...pairs(DAKUTEN).map(([kana, romaji]) => ({ kana, romaji, group: 'dakuten' as const })),
  ...COMBO_ROWS.flatMap(([k, r]) =>
    COMBO_SMALL.map(([small, v]) => ({
      kana: k + small,
      // しゃ=sha (alt sya), ちゃ=cha (alt tya), じゃ=ja (alts jya, zya)
      romaji: [r + v, ...(ALT[r] ?? []).map((a) => a + v)],
      group: 'combo' as const,
    })),
  ),
]

export const KANA: Kana[] = [
  ...hira.map((k) => ({ ...k, id: `hira:${k.kana}`, script: 'hira' as const })),
  ...hira.map((k) => ({ ...k, kana: toKata(k.kana), id: `kata:${toKata(k.kana)}`, script: 'kata' as const })),
]

/** Loanword sounds written with a small vowel (ファ, ティ, チェ). Not taught as kana cards; used for reading and typing words.
 * Spelled as a Japanese IME types them: ティ is "thi", because "ti" already means ち. */
export const LOAN_KANA: [kana: string, romaji: string][] = [
  ['ふぁ', 'fa'], ['ふぃ', 'fi'], ['ふぇ', 'fe'], ['ふぉ', 'fo'], ['てぃ', 'thi'], ['でぃ', 'dhi'],
  ['ちぇ', 'che'], ['じぇ', 'je'], ['しぇ', 'she'], ['うぃ', 'wi'], ['うぇ', 'we'],
]

export const matches = (answers: string[], typed: string) => answers.includes(typed.trim().toLowerCase())
