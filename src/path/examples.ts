import type { Item } from './course'
import { furiganaParts } from './romaji'

export type Ex = [jp: string, en: string, tatoeba: number]
let examples: Promise<Record<string, Ex>> | null = null
/** Example sentences (Tatoeba, CC BY 2.0 FR, built by scripts/build_examples.py), fetched once and cached offline by the PWA. */
export const loadExamples = () => {
  examples ??= fetch(`${import.meta.env.BASE_URL}examples.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
  examples.catch(() => { examples = null }) // let a later card try again (e.g. back online)
  return examples
}
/** Keyed "written|reading". A starter word whose JLPT twin was merged into it (あか for 赤|あか) uses its reading when only one key has it. */
export const exampleFor = (all: Record<string, Ex>, it: Item): Ex | undefined => {
  const exact = all[`${it.written ?? it.kanji ?? ''}|${it.jp}`]
  if (exact || !it.id.startsWith('vocab:')) return exact
  const same = Object.keys(all).filter((k) => k.endsWith(`|${it.jp}`))
  return same.length === 1 ? all[same[0]] : undefined
}

/** The sentence split around the word, furigana markup kept: [before, word, after]. The word is found as written, or by its
 * stem when conjugated (助ける in 助けて: 助け); a kanji run with furigana is never cut. Null when it isn't found. */
export function splitAround(sentence: string, it: Item): [string, string, string] | null {
  const parts = furiganaParts(sentence)
  const surface = parts.map((p) => (typeof p === 'string' ? p : p[0])).join('')
  const forms = [it.written, it.kanji, it.jp].filter((f): f is string => !!f)
  const stems = forms.filter((f) => /[\u3041-\u3096]$/.test(f)).map((f) => f.slice(0, -1)).filter((f) => f.length >= 2 || /\p{Script=Han}/u.test(f))
  const hit = [...forms, ...stems].find((f) => surface.includes(f))
  if (!hit) return null
  const s = surface.indexOf(hit)
  const e = s + hit.length
  const out: [string, string, string] = ['', '', '']
  let at = 0
  for (const p of parts) {
    if (typeof p === 'string') {
      const cut = (n: number) => Math.max(0, Math.min(p.length, n - at))
      out[0] += p.slice(0, cut(s))
      out[1] += p.slice(cut(s), cut(e))
      out[2] += p.slice(cut(e))
      at += p.length
    } else {
      const end = at + p[0].length
      out[end <= s ? 0 : at >= e ? 2 : 1] += `${p[0]}[${p[1]}]`
      at = end
    }
  }
  return out
}
