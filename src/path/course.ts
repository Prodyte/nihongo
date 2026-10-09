import { KANA, toKata } from '../data/kana'
import jlptKanji from '../data/jlpt/kanji.json'
import jlptWords from '../data/jlpt/words.json'
import { GRAMMAR_LESSONS, GRAMMAR_UNIT, type GrammarLessonSpec } from './grammar'
import { N4_GRAMMAR } from './grammarN4'
import { N5_GRAMMAR } from './grammarN5'
import { displayJp, kanaToRomaji, PARTICLES, readingOf, surfaceOf, tokensToRomaji } from './romaji'
import { verbClass } from './conjugate'
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
  gap?: { at: number; wrong: string[] } // sentence: the chunk the fill-the-gap question blanks, and its wrong options (else the first particle)
}
export interface Explain { title: string; body: string[]; examples: string[] } // examples: sentence item ids
export interface Lesson { id: string; title: string; items: string[]; explain?: Explain }
export interface Unit { id: string; section: string; title: string; blurb: string; lessons: Lesson[] }

const HIRA_BASE = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'らりるれろ', 'やゆよわをん']
const HIRA_VOICED = ['がぎぐげご', 'ざじずぜぞ', 'だぢづでど', 'ばびぶべぼ', 'ぱぴぷぺぽ']
const HIRA_COMBO_ROWS = ['きゃきゅきょ', 'しゃしゅしょ', 'ちゃちゅちょ', 'にゃにゅにょ', 'ひゃひゅひょ', 'みゃみゅみょ', 'りゃりゅりょ', 'ぎゃぎゅぎょ', 'じゃじゅじょ', 'びゃびゅびょ', 'ぴゃぴゅぴょ']

const chars = (s: string) => s.match(/.[ゃゅょ]?/gu)!
const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
/** Like chunk, but sizes differ by at most one (166 kanji in 5s: 34 lessons of 4-5, not 33 of 5 and a lone kanji; units of 9-10 lessons, never a lone one). */
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

/** Register a grammar lesson's sentences and make the lesson. Chunks may carry furigana (学校[がっこう]): jp is then the
 * kana sentence (typed, spoken) and `written` the marked-up one (shown). */
function grammarLesson(spec: GrammarLessonSpec, id: string, level?: 5 | 4): Lesson {
  const ids = spec.sentences.map((s) => {
    const romaji = tokensToRomaji(s.tokens)
    const sid = `sent:${romaji.replace(/'/g, '').replace(/ /g, '-')}`
    const jp = displayJp(s.tokens.map(readingOf))
    const shown = displayJp(s.tokens)
    registerItem(ITEMS, { id: sid, kind: 'sentence', jp, ...(shown !== jp && { written: shown }), gloss: s.en, romaji, sound: romaji.replace(/ /g, ''), tokens: s.tokens, bank: s.bank, alts: s.alts, gap: s.gap, level })
    return sid
  })
  return { id, title: spec.title, items: ids, explain: { ...spec.explain, examples: spec.explain.examples.map((i) => ids[i]) } }
}

function grammarUnits(): Unit[] {
  return [{ ...GRAMMAR_UNIT, section: 'Starter', lessons: GRAMMAR_LESSONS.map((spec, n) => grammarLesson(spec, `${GRAMMAR_UNIT.id}-${n + 1}`)) }]
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
/** The words a level's grammar sentences may use: starter words and that level or easier. */
export const grammarWords = (level: number) => [...ITEMS.values()].filter((w) => w.kind === 'word' && (w.id.startsWith('vocab:') || (w.level ?? 0) >= level))

/** Chunks a grammar lesson teaches itself rather than as vocabulary: endings, counters, set phrases. */
export const GRAMMAR_CHUNKS = new Set(['です', 'でした', 'じゃありません', 'じゃありませんでした', 'でしょう', 'いけません', 'ほう', 'けど',
  'だ', 'だった', 'じゃない', 'だったら', 'なら', 'ので', 'のに', 'ように', 'よう', 'みたい', 'らしい', 'かもしれません', 'とき', 'よ', 'ね', 'つもり', 'はず'])
const COUNTED = /^[一二三四五六七八九十]+(人|本|枚|時|分)$/ // 五人, 二本, 三時: taught by the counters lesson
// forms of kana-only verbs, matched by their polite or て stems (a plain prefix match would be too loose)
// (checked before exact matches: いない is いる, not 以内; した is する, not 下)
const KANA_VERBS: [RegExp, string][] = [[/^あり(ます|ません|まし|そう)|^あって|^あった|^あれば/, 'ある'], [/^い(ます|ません|まし|て$|た$|ない$)/, 'いる'], [/^した$/, 'する'], [/^おり(ます|ません|まし)/, 'おる']]

/**
 * The course word a sentence chunk is (a form of): 食べました -> 食べる, 寒くない -> 寒い, 電話して -> 電話,
 * よくなかった -> いい. Undefined for particles, grammar chunks and anything not in the course.
 */
export function wordFor(chunk: string, words: Item[]): Item | undefined {
  const t = surfaceOf(chunk)
  const find = (w: string) => words.find((x) => x.written === w || x.kanji === w || x.jp === w)
  const exact = KANA_VERBS.flatMap(([re, w]) => (re.test(t) ? [find(w)] : []))[0] ?? find(t)
  if (exact) return exact
  // a kana-only い-adjective, conjugated: おいしかった, おいしくない
  const adj = words.find((x) => !x.written && !x.kanji && x.jp.length >= 3 && x.jp.endsWith('い') && new RegExp(`^${x.jp.slice(0, -1)}(く|かった|けれ|そう|すぎ)`).test(t))
  if (adj) return adj
  if (/^よ(く|かった|けれ|さそう)/.test(t)) return find('いい') // いい conjugates from よい
  if (/^(し|さ|すれ)/.test(t)) return find('する') // します, して, したい, したくない, すれば
  // a conjugated verb or adjective: the dictionary form minus its last kana, which must include a kanji. Longest stem
  // wins; on a tie a verb or い-adjective beats a noun (休みましょう is 休む, not 休み). With furigana, the reading must
  // agree too: 着[つ]いた is 着く, not 着る; 降[ふ]りそう is 降る, not 降りる
  const reading = chunk.includes('[') ? readingOf(chunk) : undefined
  const score = (x: Item) => { const w = x.written ?? x.kanji ?? ''; return (w.length - 1) * 2 + (/[うくぐすつぬぶむるい]$/.test(w) ? 1 : 0) }
  let best: Item | undefined
  for (const x of words) {
    const w = x.written ?? x.kanji ?? ''
    const stem = w.slice(0, -1)
    if (/[\p{Script=Han}]/u.test(stem) && /[ぁ-ん]$/.test(w) && t.startsWith(stem) && (!reading || reading.startsWith(x.jp.slice(0, -1)) || (x.jp === 'くる' && /^[きこ]/.test(reading))) && (!best || score(x) > score(best))) best = x
  }
  if (best) return best
  const suru = t.match(/^(.{2,}?)(し|する|すれ|さ|せ)/) // 電話して, 結婚しよう, 勉強する: a noun (2+ characters) + する
  const noun = suru && find(suru[1])
  if (noun) return noun
  // a kana-only verb, conjugated: もらいました, くれます, なります, いらっしゃいます (the kana word over a kanji homophone)
  if (/\p{Script=Han}/u.test(t)) return undefined
  let verb: Item | undefined
  for (const x of words) {
    const cls = verbClass(x.jp, x.written)
    if ((cls !== 'godan' && cls !== 'ichidan') || x.jp.endsWith('ます')) continue // not いただきます
    const stem = x.jp.slice(0, -1)
    const next = cls === 'ichidan' ? 'まなてたられよさろず' : GODAN_NEXT[x.jp.slice(-1)] + (/[ゃさ]る$/.test(x.jp) ? 'い' : '') // いらっしゃいます
    if (t.startsWith(stem) && next.includes(t[stem.length]) && (!verb || stem.length > verb.jp.length - 1 || (stem.length === verb.jp.length - 1 && verb.written && !x.written))) verb = x
  }
  return verb
}
/** The kana that can follow a godan verb's stem: the i/a/e/o rows and the て-form sound. */
const GODAN_NEXT: Record<string, string> = { う: 'いわえおっ', く: 'きかけこい', ぐ: 'ぎがげごい', す: 'しさせそ', つ: 'ちたてとっ', ぬ: 'になねのん', ぶ: 'びばべぼん', む: 'みまめもん', る: 'りられろっ' }
/** Chunks of a sentence that must be taught words (not particles, endings or counters). */
export const contentChunks = (tokens: string[]) => tokens.filter((t) => !PARTICLES.has(t) && !GRAMMAR_CHUNKS.has(surfaceOf(t)) && !COUNTED.test(surfaceOf(t)))

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

/**
 * Put each grammar lesson into the path after every word its sentences use has been taught, and no closer to the
 * previous grammar lesson than an even spread allows.
 */
function placeGrammar(path: Lesson[], grammar: Lesson[], words: Item[]): Lesson[] {
  const taughtAt = new Map(path.flatMap((l, i) => l.items.map((id): [string, number] => [id, i])))
  const needs = grammar.map((g) => Math.max(-1, ...g.items.flatMap((id) => contentChunks(ITEMS.get(id)!.tokens!)).map((t) => {
    const w = wordFor(t, words) ?? fail(`${g.id}: "${surfaceOf(t)}" is not a course word (add it, or to GRAMMAR_CHUNKS)`)
    return taughtAt.get(w.id) ?? -1 // starter words come before the whole section
  })))
  const spacing = Math.floor(path.length / (grammar.length + 1))
  const out: Lesson[] = []
  let next = 0
  let last = -Infinity
  path.forEach((l, i) => {
    out.push(l)
    if (next < grammar.length && needs[next] <= i && i - last >= spacing) { out.push(grammar[next++]); last = i }
  })
  return [...out, ...grammar.slice(next)]
}

const fail = (msg: string): never => {
  throw new Error(msg)
}

/**
 * Word order for a level, adjusted so grammar lesson k's words are all taught by the share (k+1)/(n+1) of the way
 * through: a sentence must not wait for a rare word at the end of the list. Other words keep their frequency order.
 */
export function pullForward(order: string[], grammar: GrammarLessonSpec[], words: Item[]): string[] {
  const out = [...order]
  grammar.forEach((g, k) => {
    const by = Math.floor(((k + 1) * out.length) / (grammar.length + 1))
    for (const t of g.sentences.flatMap((x) => contentChunks(x.tokens))) {
      const id = wordFor(t, words)?.id
      const at = id ? out.indexOf(id) : -1
      if (at > by) { out.splice(at, 1); out.splice(by, 0, id!) }
    }
  })
  return out
}

function jlptUnits(): Unit[] {
  const starter = [...ITEMS.values()].filter((i) => i.kind === 'word')
  const words = new Map<number, string[]>(LEVELS.map((l) => [l, []]))
  for (const [level, written, reading, gloss] of jlptWords as [5 | 4 | 3, string, string, string][]) {
    const twin = starterTwin(written || reading, reading, gloss, starter)
    if (twin) { twin.level ??= level; continue } // already taught (and carded) by the starter units, which now count toward this level
    const romaji = kanaToRomaji(reading)
    const id = `w:${written || reading}`
    registerItem(ITEMS, { id, kind: 'word', jp: reading, written: written || undefined, gloss, romaji, sound: romaji, level })
    words.get(level)!.push(id)
  }
  const allWords = [...ITEMS.values()].filter((i) => i.kind === 'word') // starter first, then N5 -> N3, most common first
  words.set(5, pullForward(words.get(5)!, N5_GRAMMAR, allWords.filter((w) => w.id.startsWith('vocab:') || w.level === 5)))
  const kanji = new Map<number, string[]>(LEVELS.map((l) => [l, []]))
  for (const [char, level, meanings, on, kun, strokes] of jlptKanji as [string, 5 | 4 | 3, string[], string[], string[], number][]) {
    const examples = allWords.filter((w) => (w.written ?? w.kanji ?? '').includes(char)).slice(0, 3).map((w) => w.id)
    registerItem(ITEMS, { id: `kanji:${char}`, kind: 'kanji', jp: char, gloss: meanings.join(', '), romaji: '', sound: `kanji:${char}`, level, on, kun: kun.map((k) => k.replace(/-/g, '〜')), strokes, examples }) // -び (a suffix form) reads as 〜び
    kanji.get(level)!.push(`kanji:${char}`)
  }
  return LEVELS.flatMap((level) => {
    const vocab = even(words.get(level)!, WORDS_PER_LESSON).map((items, i): Lesson => ({
      id: `n${level}-v-${i + 1}`, title: items.slice(0, 3).map((id) => written(ITEMS.get(id)!)).join('・'), items,
    }))
    const kanjiLessons = even(kanji.get(level)!, KANJI_PER_LESSON).map((items, i): Lesson => ({
      id: `n${level}-k-${i + 1}`, title: `Kanji ${items.map((id) => id.slice(6)).join(' ')}`, items,
    }))
    let path = interleave(vocab, kanjiLessons)
    // N4 words keep their frequency order (pulling them forward like N5's would move words between saved lessons)
    const grammar = level === 5 ? N5_GRAMMAR : level === 4 ? N4_GRAMMAR : []
    if (grammar.length) path = placeGrammar(path, grammar.map((spec, i) => grammarLesson(spec, `n${level}-g-${i + 1}`, level as 5 | 4)), grammarWords(level))
    return even(path, LESSONS_PER_UNIT).map((lessons, u): Unit => {
      const chars = lessons.filter((l) => l.id.includes('-k-')).flatMap((l) => l.items.map((id) => id.slice(6)))
      const nWords = lessons.filter((l) => l.id.includes('-v-')).flatMap((l) => l.items).length
      const grammar = lessons.filter((l) => l.explain).map((l) => l.title)
      return {
        id: `n${level}-u${u + 1}`, section: `N${level}`, title: `N${level} · Unit ${u + 1}`,
        blurb: [nWords && `${nWords} words`, chars.length && `kanji ${chars.join(' ')}`, grammar.length && `grammar: ${grammar.join(', ')}`].filter(Boolean).join(' · '),
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

/** What a lesson teaches, for badges: kana, words, kanji or grammar, with a glyph (its first kana or kanji, 語, 文). */
export function lessonKind(l: Lesson): { kind: 'kana' | 'words' | 'kanji' | 'grammar'; glyph: string; label: string } {
  const first = ITEMS.get(l.items[0])!
  if (first.kind === 'kana') return { kind: 'kana', glyph: first.jp[0], label: first.script === 'kata' ? 'Katakana' : 'Hiragana' }
  if (first.kind === 'kanji') return { kind: 'kanji', glyph: first.jp, label: 'Kanji' }
  if (first.kind === 'sentence') return { kind: 'grammar', glyph: '文', label: 'Grammar' }
  return { kind: 'words', glyph: '語', label: 'Words' }
}
export const unitOf = (l: Lesson) => UNITS.find((u) => u.lessons.includes(l))
