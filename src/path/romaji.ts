import { KANA, LOAN_KANA, toKata } from '../data/kana'

// hiragana and katakana, incl. combinations and loanword sounds (フォ, ティ)
const MAP = new Map([...KANA.map((k): [string, string] => [k.kana, k.romaji[0]]), ...LOAN_KANA.flatMap(([k, r]): [string, string][] => [[k, r], [toKata(k), r]])])

/** Hepburn romaji for a run of kana: gakkou, koohii, kin'youbi (the apostrophe marks ん before a vowel or y). */
export function kanaToRomaji(input: string): string {
  const syl: string[] = []
  let doubled = false
  for (let i = 0; i < input.length; i++) {
    const c = input[i]
    if (c === 'っ' || c === 'ッ') { doubled = true; continue }
    if (doubled && (c === 'ん' || c === 'ン' || c === 'ー')) throw new Error(`Dangling っ before ${c} in ${input}`)
    if (c === 'ー') { syl.push([...(syl.at(-1) ?? '')].reverse().find((x) => 'aeiou'.includes(x)) ?? ''); continue }
    const two = input.slice(i, i + 2)
    const kana = /[ゃゅょャュョぁぃぅぇぉァィゥェォ]/.test(input[i + 1] ?? '') && MAP.has(two) ? two : c
    const r = MAP.get(kana)
    if (r === undefined) throw new Error(`No romaji for ${kana} in ${input}`)
    if (kana === two) i++
    syl.push((doubled ? (r.startsWith('ch') ? 't' : r[0]) : '') + r)
    doubled = false
  }
  if (doubled) throw new Error(`Dangling っ at the end of ${input}`)
  return syl.map((s, i) => (s === 'n' && /^[aiueoy]/.test(syl[i + 1] ?? '') ? "n'" : s)).join('')
}

/** The grammar particles in these lessons. は, を and へ are written one way and sound another. */
export const PARTICLES = new Set(['は', 'の', 'も', 'を', 'か', 'が', 'に', 'で', 'へ', 'と'])
const READ_AS: Record<string, string> = { は: 'wa', を: 'o', へ: 'e' }

/** How a sentence is pronounced: は is "wa" as a particle, を is "o". */
export const tokensToRomaji = (tokens: string[]) => tokens.map((t) => READ_AS[t] ?? kanaToRomaji(t)).join(' ')

/** The sentence as written for learners: a space after each particle, then 。 `blank` shows ＿ in place of that chunk. */
export const displayJp = (tokens: string[], blank?: number) =>
  tokens.map((t, i) => (i === blank ? '＿' : t)).map((t, i) => (i === blank || PARTICLES.has(t)) && i < tokens.length - 1 ? `${t} ` : t).join('') + '。'
