import { ITEMS, written, type Item } from './course'
import { normKana, toKana } from './typing'

export const MAX = 50

// Everything you can look up: words and kanji (kana and sentences are taught elsewhere), with search keys precomputed.
export const ENTRIES = [...ITEMS.values()]
  .filter((i) => i.kind === 'word' || i.kind === 'kanji')
  .map((it) => ({ it, keys: [written(it), it.jp, it.kanji ?? '', normKana(it.jp), it.romaji.replace(/[ ']/g, ''), ...(it.on ?? []), ...(it.kun ?? []).map((k) => k.replace(/[().〜]/g, ''))] }))

/** Search the course's words and kanji by kanji, kana, romaji or English. */
export function search(query: string): Item[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const kana = /^[a-z' -]+$/.test(q) ? normKana(toKana(q).kana) : normKana(q) // "taberu" finds たべる
  const hits: [number, Item][] = []
  for (const { it, keys } of ENTRIES) {
    // exact matches first, then prefix matches, then English meanings containing the word
    const rank = keys.some((k) => k && (k === q || k === kana)) ? 0
      : keys.some((k) => k && (k.startsWith(q) || (kana && k.startsWith(kana)))) ? 1
      : q.length >= 3 && new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(it.gloss.toLowerCase()) ? 2
      : -1
    if (rank >= 0) hits.push([rank, it])
  }
  return hits.sort((a, b) => a[0] - b[0] || (b[1].level ?? 6) - (a[1].level ?? 6)).slice(0, MAX).map(([, it]) => it)
}
