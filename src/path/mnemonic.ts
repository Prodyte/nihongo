import PARTS from '../data/jlpt/parts.json'
import { ITEMS, type Item } from './course'

const parts = PARTS as Record<string, string[][]> // [part, meaning]
const meaningOf = (char: string) => ITEMS.get(`kanji:${char}`)?.gloss.split(', ')[0]

/** A memory aid built from pieces the learner can see: a kanji's parts (休 = 亻 person + 木 tree), a compound word's
 * kanji (日本 = 日 day + 本 origin), or a one-kanji word's parts. Null when there is nothing useful to show. */
export function memoFor(it: Item): { label: string; pieces: string[][] } | null {
  if (it.kind === 'kanji') return parts[it.jp] ? { label: 'Parts', pieces: parts[it.jp] } : null
  if (it.kind !== 'word') return null
  const kanji = [...new Set([...(it.written ?? it.kanji ?? '')].filter((c) => meaningOf(c)))]
  if (kanji.length >= 2) return { label: 'Kanji', pieces: kanji.map((c) => [c, meaningOf(c)!]) }
  if (kanji.length === 1 && parts[kanji[0]]) return { label: `${kanji[0]} is made of`, pieces: parts[kanji[0]] }
  return null
}
