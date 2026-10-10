import PARTS from '../data/jlpt/parts.json'
import { ITEMS, type Item } from './course'
import { KANJI_STORIES } from './kanjiStories'

const parts = PARTS as Record<string, string[][]> // [part, meaning]
type Memo = { label: string; pieces: string[][]; story?: string }
const meaningOf = (char: string) => ITEMS.get(`kanji:${char}`)?.gloss.split(', ')[0]
/** A word's course kanji, each once. */
const kanjiOf = (it: Item) => [...new Set([...(it.written ?? it.kanji ?? '')].filter((c) => meaningOf(c)))]

/** A memory aid built from what the learner can see: a kana's picture hint; a kanji's story and parts (休 = 亻 person +
 * 木 tree); a compound word's kanji (日本 = 日 day + 本 origin); a one-kanji word's kanji story and parts. Null when
 * there is nothing useful to show. */
export function memoFor(it: Item): Memo | null {
  if (it.kind === 'kana') return it.note ? { label: '', pieces: [], story: it.note } : null
  const k = it.kind === 'kanji' ? [it.jp] : it.kind === 'word' ? kanjiOf(it) : []
  if (k.length >= 2) return { label: 'Kanji', pieces: k.map((c) => [c, meaningOf(c)!]) }
  if (k.length === 0) return null
  const [c] = k
  const memo = { label: it.kind === 'kanji' ? 'Parts' : `${c} is made of`, pieces: parts[c] ?? [], story: KANJI_STORIES[c] }
  return memo.pieces.length || memo.story ? memo : null
}

/** One line to show after a wrong answer, when a kana or kanji has a hint. */
export function hintFor(it: Item): string | undefined {
  const memo = (it.kind === 'kana' || it.kind === 'kanji') && memoFor(it)
  return memo ? memo.story ?? memo.pieces.map(([c, m]) => `${c} ${m}`.trim()).join(' + ') : undefined
}
