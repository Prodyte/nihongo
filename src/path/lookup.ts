import PARTS_JSON from '../data/jlpt/parts.json'
import { ITEMS, written, type Item } from './course'
import { normKana, toKana } from './typing'

export const MAX = 50

// Everything you can look up: words and kanji (kana and sentences are taught elsewhere), with search keys precomputed.
export const ENTRIES = [...ITEMS.values()]
  .filter((i) => i.kind === 'word' || i.kind === 'kanji')
  .map((it) => ({ it, keys: [written(it), it.jp, it.kanji ?? '', normKana(it.jp), it.romaji.replace(/[ ']/g, ''), ...(it.on ?? []), ...(it.kun ?? []).map((k) => k.replace(/[().〜]/g, ''))] }))

// Kanji by parts: each course kanji's KanjiVG components, and every component with its meaning, most common first.
const KANJI = ENTRIES.filter((e) => e.it.kind === 'kanji').map((e) => e.it)
const PARTS_OF = new Map(KANJI.map((k) => [k.id, new Set(((PARTS_JSON as Record<string, string[][]>)[k.jp] ?? []).map(([p]) => p))]))
const named = new Map(Object.values(PARTS_JSON as Record<string, string[][]>).flat().map(([p, m]) => [p, m]))
const freq = new Map<string, number>()
for (const ps of PARTS_OF.values()) for (const p of ps) freq.set(p, (freq.get(p) ?? 0) + 1)
// ponytail: by frequency; stroke counts exist only for parts that are course kanji themselves
export const PARTS = [...freq.keys()].sort((a, b) => freq.get(b)! - freq.get(a)!).map((p) => [p, named.get(p) ?? ''] as const)

/** Course kanji containing every selected part, and the parts that could still be added (those kanji's other parts). */
export function byParts(sel: readonly string[]) {
  const kanji = KANJI.filter((k) => sel.every((p) => PARTS_OF.get(k.id)!.has(p)))
  return { kanji: sel.length ? kanji : [], open: new Set(kanji.flatMap((k) => [...PARTS_OF.get(k.id)!])) }
}

/** Search the course's words and kanji by kanji, kana, romaji or English; a kanji part also lists the kanji containing it. */
export function search(query: string): Item[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const kana = /^[a-z' -]+$/.test(q) ? normKana(toKana(q).kana) : normKana(q) // "taberu" finds たべる
  const word = q.length >= 3 && new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') // once per search, not per entry
  const hits: [number, Item][] = []
  for (const { it, keys } of ENTRIES) {
    // exact matches first, then prefix matches, then English meanings containing the word
    const rank = keys.some((k) => k && (k === q || k === kana)) ? 0
      : keys.some((k) => k && (k.startsWith(q) || (kana && k.startsWith(kana)))) ? 1
      : word && word.test(it.gloss) ? 2
      : PARTS_OF.get(it.id)?.has(q) ? 3 // a part (亻) finds the kanji made with it
      : -1
    if (rank >= 0) hits.push([rank, it])
  }
  return hits.sort((a, b) => a[0] - b[0] || (b[1].level ?? 6) - (a[1].level ?? 6)).slice(0, MAX).map(([, it]) => it)
}
