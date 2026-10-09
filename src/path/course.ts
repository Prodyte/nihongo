import { KANA, toKata } from '../data/kana'
import jlptKanji from '../data/jlpt/kanji.json'
import jlptWords from '../data/jlpt/words.json'
import { GRAMMAR_LESSONS, GRAMMAR_UNIT } from './grammar'
import { displayJp, kanaToRomaji, tokensToRomaji } from './romaji'
import { VOCAB_UNITS } from './vocab'

/** One thing a lesson teaches. For kana, `gloss` is the romaji; for words it is the English meaning. */
export interface Item {
  id: string // 'hira:あ' | 'kata:ア' (the existing card ids) | 'vocab:<romaji-slug>' (starter words) | 'w:<written form>' (JLPT words)
  kind: 'kana' | 'word' | 'sentence' | 'kanji'
  script?: 'hira' | 'kata'
  jp: string
  gloss: string
  romaji: string
  sound: string // what it sounds like: items with the same sound can't be told apart by ear (お/を are both "o")
  kanji?: string // starter words: the kanji, shown as a small extra
  written?: string // JLPT words written with kanji: shown instead of jp, with jp (the reading) as furigana
  level?: 5 | 4 | 3 // JLPT level
  on?: string[] // kanji: on'yomi (Chinese-derived readings), in hiragana
  kun?: string[] // kanji: kun'yomi (native readings); okurigana in brackets: ひと(つ)
  strokes?: number // kanji
  examples?: string[] // kanji: ids of course words written with it, most common first
  note?: string // shown on the intro card
  accepts?: string[] // kana: every romaji spelling accepted when typed (shi/si, ji/di...)
  tokens?: string[] // sentence: the chunks in order
  bank?: string[] // sentence: extra wrong chunks for the word bank
  alts?: string[][] // sentence: other correct orders
}
export interface Explain { title: string; body: string[]; examples: string[] } // examples: sentence item ids
export interface Lesson { id: string; title: string; items: string[]; explain?: Explain }
export interface Unit { id: string; section: string; title: string; blurb: string; lessons: Lesson[] }

const HIRA_BASE = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'らりるれろ', 'やゆよわをん']
const HIRA_VOICED = ['がぎぐげご', 'ざじずぜぞ', 'だぢづでど', 'ばびぶべぼ', 'ぱぴぷぺぽ']
const HIRA_COMBO_ROWS = ['きゃきゅきょ', 'しゃしゅしょ', 'ちゃちゅちょ', 'にゃにゅにょ', 'ひゃひゅひょ', 'みゃみゅみょ', 'りゃりゅりょ', 'ぎゃぎゅぎょ', 'じゃじゅじょ', 'びゃびゅびょ', 'ぴゃぴゅぴょ']

const chars = (s: string) => s.match(/.[ゃゅょ]?/gu)!
const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
/** Like chunk, but sizes differ by at most one (166 kanji in 5s: 34 lessons of 4-5, not 33 of 5 and a lone kanji). */
const even = <T,>(a: T[], n: number) => { const k = Math.ceil(a.length / n); return Array.from({ length: k }, (_, i) => a.slice(Math.round((i * a.length) / k), Math.round(((i + 1) * a.length) / k))) }

/** How an item is written for the learner: kanji where the word has them, else kana. */
export const written = (it: Item) => it.written ?? it.jp

/** Add an item; a second item with the same id would silently replace the first, so fail instead. */
export function registerItem(items: Map<string, Item>, item: Item) {
  if (items.has(item.id)) throw new Error(`Duplicate item id ${item.id}`)
  items.set(item.id, item)
}

export const ITEMS = new Map<string, Item>()
const NOTES: Record<string, string> = { 'hira:を': 'Written "wo" but pronounced "o". Mostly used as a grammar particle.', 'kata:ヲ': 'Written "wo" but pronounced "o". Rare in katakana.' }
for (const k of KANA)
  registerItem(ITEMS, { id: k.id, kind: 'kana', script: k.script, jp: k.kana, gloss: k.romaji[0], romaji: k.romaji[0], sound: k.romaji[0] === 'wo' ? 'o' : k.romaji[0], note: NOTES[k.id], accepts: k.romaji })

function kanaUnits(script: 'hira' | 'kata'): Unit[] {
  const name = script === 'hira' ? 'Hiragana' : 'Katakana'
  const conv = (s: string) => (script === 'hira' ? s : toKata(s))
  const unit = (id: string, title: string, blurb: string, groups: string[][]): Unit => ({
    id: `${script}-${id}`, section: 'Kana', title: `${name}: ${title}`, blurb,
    lessons: groups.map((g, i) => {
      const items = g.map((c) => `${script}:${conv(c)}`)
      return { id: `${script}-${id}-${i + 1}`, title: items.map((x) => x.slice(5)).join(' '), items }
    }),
  })
  return [
    unit('basic', 'the basics', 'The 46 basic sounds.', HIRA_BASE.map(chars)),
    unit('voiced', 'voiced sounds', 'Add two small marks to change the sound.', HIRA_VOICED.map(chars)),
    unit('combos', 'combined sounds', 'Small や ゆ よ blend two sounds into one.', chunk(HIRA_COMBO_ROWS.map(chars), 2).map((rows) => rows.flat())),
  ]
}

function vocabUnits(): Unit[] {
  return VOCAB_UNITS.map((u) => {
    const ids = u.words.map(([jp, romaji, en, kanji]) => {
      const id = `vocab:${romaji.replace(/'/g, '').replace(/ /g, '-')}` // ids ignore the apostrophe so they stay stable
      registerItem(ITEMS, { id, kind: 'word', jp, gloss: en, romaji, sound: romaji.replace(/ /g, ''), kanji })
      return id
    })
    return { id: u.id, section: 'Starter', title: u.title, blurb: u.blurb, lessons: chunk(ids, 6).map((items, i) => ({ id: `${u.id}-${i + 1}`, title: `${u.title} ${i + 1}`, items })) }
  })
}

function grammarUnits(): Unit[] {
  const lessons = GRAMMAR_LESSONS.map((spec, n): Lesson => {
    const ids = spec.sentences.map((s) => {
      const romaji = tokensToRomaji(s.tokens)
      const id = `sent:${romaji.replace(/'/g, '').replace(/ /g, '-')}`
      registerItem(ITEMS, { id, kind: 'sentence', jp: displayJp(s.tokens), gloss: s.en, romaji, sound: romaji.replace(/ /g, ''), tokens: s.tokens, bank: s.bank, alts: s.alts })
      return id
    })
    return { id: `${GRAMMAR_UNIT.id}-${n + 1}`, title: spec.title, items: ids, explain: { ...spec.explain, examples: spec.explain.examples.map((i) => ids[i]) } }
  })
  return [{ ...GRAMMAR_UNIT, section: 'Starter', lessons }]
}

// ---- JLPT words (src/data/jlpt, built by scripts/build_course_data.py) --------------------------------------------------

const LEVELS = [5, 4, 3] as const
const WORDS_PER_LESSON = 6 // like the starter units: about 20 steps a lesson
const LESSONS_PER_UNIT = 10
/** Source spellings of starter words that the automatic match below can't see (different gloss wording). */
const STARTER_ALIASES: Record<string, string> = { 有る: 'vocab:aru', 居る: 'vocab:iru', 為る: 'vocab:suru', 易しい: 'vocab:yasashii', 優しい: 'vocab:yasashii' }
/** Words that look like a starter twin but are taught separately: the starter あつい "hot" doesn't teach 暑い (weather) vs 熱い (things). */
const NOT_TWINS = new Set(['暑い', '熱い'])

const STOP = new Set(['to', 'the', 'and', 'for', 'of', 'an', 'in', 'on', 'at', 'be'])
const contentWords = (gloss: string) => new Set(gloss.toLowerCase().match(/[a-z]{2,}/g)?.filter((w) => !STOP.has(w))) // "no" and "do" count
/** The starter item a JLPT word duplicates, if any: same reading, and the same kanji or (lacking one) an overlapping meaning. */
export function starterTwin(written: string, reading: string, gloss: string, starter: Item[]): Item | undefined {
  if (STARTER_ALIASES[written]) return starter.find((s) => s.id === STARTER_ALIASES[written])
  if (NOT_TWINS.has(written)) return undefined
  const mine = contentWords(gloss)
  return starter.find((s) => s.jp === reading && ((s.kanji && s.kanji === written) || ((!s.kanji || written === reading) && [...contentWords(s.gloss)].some((w) => mine.has(w)))))
}

const KANJI_PER_LESSON = 5

/** Spread `b` evenly through `a`, each b-entry before the a-entry at its share of the way: [a1 b1 a2 a3 b2 a4 ...]. */
export function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = []
  let j = 0
  a.forEach((x, i) => {
    while (j < b.length && j * a.length <= i * b.length) out.push(b[j++])
    out.push(x)
  })
  return [...out, ...b.slice(j)]
}

function jlptUnits(): Unit[] {
  const starter = [...ITEMS.values()].filter((i) => i.kind === 'word')
  const words = new Map<number, string[]>(LEVELS.map((l) => [l, []]))
  for (const [level, written, reading, gloss] of jlptWords as [5 | 4 | 3, string, string, string][]) {
    if (starterTwin(written || reading, reading, gloss, starter)) continue // already taught (and carded) by the starter units
    const romaji = kanaToRomaji(reading)
    const id = `w:${written || reading}`
    registerItem(ITEMS, { id, kind: 'word', jp: reading, written: written || undefined, gloss, romaji, sound: romaji, level })
    words.get(level)!.push(id)
  }
  const allWords = [...ITEMS.values()].filter((i) => i.kind === 'word') // starter first, then N5 -> N3, most common first
  const kanji = new Map<number, string[]>(LEVELS.map((l) => [l, []]))
  for (const [char, level, meanings, on, kun, strokes] of jlptKanji as [string, 5 | 4 | 3, string[], string[], string[], number][]) {
    const examples = allWords.filter((w) => (w.written ?? w.kanji ?? '').includes(char)).slice(0, 3).map((w) => w.id)
    registerItem(ITEMS, { id: `kanji:${char}`, kind: 'kanji', jp: char, gloss: meanings.join(', '), romaji: '', sound: `kanji:${char}`, level, on, kun, strokes, examples })
    kanji.get(level)!.push(`kanji:${char}`)
  }
  return LEVELS.flatMap((level) => {
    const vocab = even(words.get(level)!, WORDS_PER_LESSON).map((items, i): Lesson => ({
      id: `n${level}-v-${i + 1}`, title: items.slice(0, 3).map((id) => written(ITEMS.get(id)!)).join('・'), items,
    }))
    const kanjiLessons = even(kanji.get(level)!, KANJI_PER_LESSON).map((items, i): Lesson => ({
      id: `n${level}-k-${i + 1}`, title: `Kanji ${items.map((id) => id.slice(6)).join(' ')}`, items,
    }))
    return chunk(interleave(vocab, kanjiLessons), LESSONS_PER_UNIT).map((lessons, u): Unit => {
      const chars = lessons.filter((l) => l.id.includes('-k-')).flatMap((l) => l.items.map((id) => id.slice(6)))
      const nWords = lessons.filter((l) => l.id.includes('-v-')).flatMap((l) => l.items).length
      return {
        id: `n${level}-u${u + 1}`, section: `N${level}`, title: `N${level} · Unit ${u + 1}`,
        blurb: [nWords && `${nWords} words`, chars.length && `kanji ${chars.join(' ')}`].filter(Boolean).join(' · '),
        lessons,
      }
    })
  })
}

export const UNITS: Unit[] = [...kanaUnits('hira'), ...kanaUnits('kata'), ...vocabUnits(), ...grammarUnits(), ...jlptUnits()]
/** Path sections in order (each unit belongs to one). */
export const SECTIONS = [...new Set(UNITS.map((u) => u.section))]

/** Every lesson in course order; a lesson unlocks when the one before it is done. */
export const LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons)
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id)
