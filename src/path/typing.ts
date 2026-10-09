import { KANA, LOAN_KANA } from '../data/kana'

// ---- romaji -> hiragana ----------------------------------------------------------------------

const VOWELS = 'aiueo'
/** Every romaji spelling in the KANA table (shi/si, tsu/tu, fu/hu, ji/zi...). The first kana to claim a spelling keeps it (お, not を, owns "o"). */
const TABLE = new Map<string, string>()
for (const k of KANA)
  if (k.script === 'hira') for (const r of k.romaji) if (r !== 'n' && r !== 'nn' && !TABLE.has(r)) TABLE.set(r, k.kana)
for (const [k, r] of LOAN_KANA) TABLE.set(r, k)
const KEYS = [...TABLE.keys()]

const isLetter = (c: string | undefined): c is string => !!c && c >= 'a' && c <= 'z'
const isVowel = (c: string | undefined) => !!c && VOWELS.includes(c)

/**
 * Type romaji, get hiragana, like a Japanese IME. `pending` is the unfinished tail ("sh") for the live preview.
 * `final: true` (checking an answer) turns a trailing "n" into ん. Kana already typed by an IME passes through.
 */
export function toKana(input: string, final = true): { kana: string; pending: string } {
  const s = input.toLowerCase()
  let out = ''
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (!isLetter(c)) { out += c === '-' ? 'ー' : c; i++; continue }
    const next = s[i + 1]
    if (c === 'n') {
      if (next === undefined) {
        if (final) { out += 'ん'; i++; continue }
        return { kana: out, pending: 'n' }
      }
      if (next === "'") { out += 'ん'; i += 2; continue }
      if (next === 'n') {
        const after = s[i + 2]
        if (after === undefined) {
          if (final) { out += 'ん'; i += 2; continue } // "nn" at the end is one ん
          return { kana: out + 'ん', pending: 'n' } // might still become んな
        }
        // "nna" is ん + な (konna), "nnk" is a plain ん: so the first n is ん either way
        out += 'ん'
        i += isVowel(after) || after === 'y' ? 1 : 2
        continue
      }
      if (!isVowel(next) && next !== 'y') { out += 'ん'; i++; continue } // n before a consonant (or a space)
    }
    // doubled consonant (kk, tt) and "tch" -> small っ
    if (c !== 'n' && !isVowel(c) && (next === c || (c === 't' && s.startsWith('ch', i + 1)))) { out += 'っ'; i++; continue }
    let hit = ''
    for (const len of [3, 2, 1]) {
      const piece = s.slice(i, i + len)
      if (piece.length === len && TABLE.has(piece)) { hit = piece; break }
    }
    if (hit) { out += TABLE.get(hit); i += hit.length; continue }
    const rest = s.slice(i)
    if (!final && /^[a-z]{1,3}$/.test(rest) && KEYS.some((k) => k.startsWith(rest))) return { kana: out, pending: rest }
    out += c // not romaji we know: keep it visible so the answer fails
    i++
  }
  return { kana: out, pending: '' }
}

// ---- normalising kana to compare --------------------------------------------------------------

const VOWEL_KANA: Record<string, string> = { a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お' }
const VOWEL_OF = new Map<string, string>() // hiragana syllable -> the kana for its vowel (for ー)
for (const [kana, r] of [...KANA.filter((k) => k.script === 'hira').map((k): [string, string] => [k.kana, k.romaji[0]]), ...LOAN_KANA]) {
  const v = VOWEL_KANA[r.slice(-1)]
  if (v) VOWEL_OF.set(kana, v)
}

/** Katakana -> hiragana, ー -> the previous vowel (コーヒー = こおひい), ぢ/づ -> じ/ず (same sound: "tsuzukeru" is つづける), and spaces/punctuation dropped. */
export function normKana(s: string): string {
  let out = ''
  for (const ch of s) {
    const c = ch >= 'ァ' && ch <= 'ヶ' ? String.fromCharCode(ch.charCodeAt(0) - 0x60) : ch
    if (c === 'ー') { out += VOWEL_OF.get(out.slice(-2)) ?? VOWEL_OF.get(out.slice(-1)) ?? c; continue }
    out += c
  }
  return out.replace(/[\s　。、．，.,!?！？「」]/g, '').replace(/ぢ/g, 'じ').replace(/づ/g, 'ず')
}

// ---- checking answers -------------------------------------------------------------------------

export interface Check { ok: boolean; note?: string }

// particles are written differently from how they sound
const PARTICLES: Record<string, { sounds: string; typed: string; reads: string }> = {
  は: { sounds: 'わ', typed: 'ha', reads: 'wa' },
  を: { sounds: 'お', typed: 'wo', reads: 'o' },
  へ: { sounds: 'え', typed: 'he', reads: 'e' },
}

/**
 * Is `typed` (romaji, or kana from an IME) the Japanese `expected`? Exact: no typo forgiveness.
 * `word`: a word ending in は also accepts わ (こんにちは is taught as "konnichiwa").
 * For sentences, typing "wa" for the particle は fails with a hint; pass `tokens` so only real particle tokens (not は inside はな) get one.
 */
export function checkJapanese(typed: string, expected: string, o: { alts?: string[]; word?: boolean; tokens?: string[] } = {}): Check {
  const got = normKana(toKana(typed).kana)
  const forms = [expected, ...(o.alts ?? [])].map(normKana)
  if (forms.includes(got)) return { ok: true }
  if (o.word) {
    return forms[0].length > 1 && forms[0].endsWith('は') && got === `${forms[0].slice(0, -1)}わ` ? { ok: true, note: `It is written ${expected}: は is read “wa” here.` } : { ok: false }
  }
  // positions (in the normalised first form) that really are particles; without tokens, assume any は/を/へ could be
  const at = o.tokens && new Set(o.tokens.flatMap((t, i) => (t in PARTICLES ? [normKana(o.tokens!.slice(0, i).join('')).length] : [])))
  for (const f of at ? forms.slice(0, 1) : forms) // positions are only known for the written order
    for (let i = 0; i < f.length; i++) {
      if (at && !at.has(i)) continue
      const p = PARTICLES[f[i]]
      if (p && got === f.slice(0, i) + p.sounds + f.slice(i + 1)) return { ok: false, note: `The particle ${f[i]} is typed “${p.typed}”, even though it sounds like “${p.reads}”.` }
    }
  return { ok: false }
}

export function distance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[b.length]
}

const normEn = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}' ]/gu, ' ').replace(/\s+/g, ' ').trim()

/** Is `typed` one of the accepted English answers? One wrong letter is forgiven when the answer has 6+ letters. */
export function checkEnglish(typed: string, answers: string[]): Check {
  const t = normEn(typed)
  if (!t) return { ok: false }
  const norm = answers.map(normEn)
  if (norm.includes(t)) return { ok: true }
  const near = norm.findIndex((a) => a.length >= 6 && distance(a, t) <= 1)
  return near >= 0 ? { ok: true, note: `Check the spelling: “${answers[near]}”.` } : { ok: false }
}
