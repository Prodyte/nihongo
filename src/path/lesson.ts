import { shuffle } from '../modes/choices'
import { written, type Item, type Lesson } from './course'
import { displayJp, PARTICLES } from './romaji'

export type Exercise = (
  | { type: 'intro'; item: Item }
  | { type: 'explain'; title: string; body: string[]; examples: Item[] } // a grammar lesson's opening card
  | { type: 'choice'; item: Item; dir: 'toGloss' | 'toJp' | 'fill' | 'toReading'; prompt: string; options: string[]; answer: string; hint?: string; readings?: Readings } // fill: pick the particle that completes the sentence
  | { type: 'listen'; item: Item; options: string[]; answer: string; readings?: Readings } // hear item.jp, pick it
  | { type: 'match'; pairs: { id: string; jp: string; reading?: string; gloss: string }[] }
  | { type: 'build'; item: Item; bank: string[]; answer: string[]; alts: string[][] } // put the chunks of a sentence in order
  | { type: 'type'; item: Item; dir: 'toRomaji' | 'toGloss' | 'toJp' | 'toReading'; prompt: string } // kana: type the romaji; words: type the English, or the Japanese via romaji; toReading: a kanji word's reading
) & { retry?: boolean }

/** Furigana for options written with kanji: written form -> reading. */
export type Readings = Record<string, string>

export interface BuildOpts {
  canSpeak: boolean // a Japanese voice exists; otherwise there are no listening exercises
  learned: ReadonlySet<string> // item ids from lessons already completed (no intro; used as distractors)
  rand?: () => number
}

const sameBucket = (a: Item, b: Item) => a.kind === b.kind && a.script === b.script
const key = (it: Item, by: 'gloss' | 'sound') => `${it.kind}|${it.script}|${it[by]}`

const show = (it: Item, field: 'jp' | 'gloss') => (field === 'jp' ? written(it) : it.gloss)

/** `n` options: the answer plus distractors from `pool` (taken in order, so put the closest items first). Japanese options
 * are shown as written (kanji where the word has them). */
function options(answer: Item, field: 'jp' | 'gloss', pool: Item[], same: 'gloss' | 'sound', n = 4): { options: string[]; readings?: Readings } {
  const chosen = [answer]
  for (const it of pool) {
    if (chosen.length === n) break
    if (it.id === answer.id || !sameBucket(it, answer)) continue // never mix hiragana into a katakana question
    if (it[same] === answer[same]) continue // would be a second right answer (じ/ぢ are both "ji"; お/を both sound "o")
    if (chosen.some((c) => show(c, field) === show(it, field))) continue
    chosen.push(it)
  }
  const withKanji = field === 'jp' ? chosen.filter((c) => c.written) : []
  return { options: chosen.map((c) => show(c, field)), ...(withKanji.length && { readings: Object.fromEntries(withKanji.map((c) => [c.written, c.jp])) }) }
}

/** Particles offered as wrong answers for a gap. Chosen so none of them also makes a correct sentence: a blank は is never
 * offered も (わたしも is fine, "too"), and a blank を is never offered は (みずは のみます is fine, "as for water"). */
const WRONG_PARTICLES: Record<string, string[]> = { は: ['の', 'を', 'か'], も: ['の', 'を', 'か'], の: ['を', 'か'], を: ['の', 'か'], か: ['は', 'の', 'を'] }

const counted = new WeakMap<ReadonlyMap<string, Item>, Record<string, Map<string, number>>>()
/** Is `it` the only item of its kind with this gloss (or sound)? Counted once per item set: the course has thousands. */
function uniqueBy(items: ReadonlyMap<string, Item>, by: 'gloss' | 'sound') {
  const cache = counted.get(items) ?? {}
  counted.set(items, cache)
  if (!cache[by]) {
    const m = new Map<string, number>()
    for (const it of items.values()) m.set(key(it, by), (m.get(key(it, by)) ?? 0) + 1)
    cache[by] = m
  }
  const m = cache[by]
  return (it: Item) => m.get(key(it, by)) === 1
}

const fail = (msg: string): never => {
  throw new Error(msg)
}

export function buildLesson(lesson: Lesson, items: ReadonlyMap<string, Item>, opts: BuildOpts): Exercise[] {
  const { canSpeak, learned, rand = Math.random } = opts
  const mine = lesson.items.map((id) => items.get(id) ?? fail(`Unknown item ${id} in lesson ${lesson.id}`))
  if (lesson.explain) return buildGrammar(lesson, lesson.explain, mine, items, opts)
  if (mine[0]?.kind === 'kanji') return buildKanji(lesson, mine, items, opts)
  const far = [...learned].filter((id) => !lesson.items.includes(id)).flatMap((id) => items.get(id) ?? [])
  const pool = [...shuffle(mine, rand), ...shuffle(far, rand)] // lesson items make the likeliest distractors

  // Items sharing a gloss with another item of their kind can't be asked in reverse or matched (two right answers);
  // items sharing a sound can't be asked by ear either.
  const [uniqueGloss, uniqueSound] = [uniqueBy(items, 'gloss'), uniqueBy(items, 'sound')]
  const askable = shuffle(mine.filter(uniqueGloss), rand)
  const audible = shuffle(askable.filter(uniqueSound), rand)

  const shuffled = (it: Item, field: 'jp' | 'gloss', same: 'gloss' | 'sound' = 'gloss') => { const o = options(it, field, pool, same); return { ...o, options: shuffle(o.options, rand) } }
  const toGloss = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toGloss', prompt: written(it), ...shuffled(it, 'gloss'), answer: it.gloss })
  const toJp = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toJp', prompt: it.gloss, ...shuffled(it, 'jp'), answer: written(it) })

  const out: Exercise[] = mine.filter((it) => !learned.has(it.id)).map((item) => ({ type: 'intro', item }))
  out.push(...shuffle(mine, rand).map(toGloss))
  if (askable.length >= 2) out.push({ type: 'match', pairs: askable.slice(0, 5).map((it) => ({ id: it.id, jp: written(it), ...(it.written && { reading: it.jp }), gloss: it.gloss })) })
  if (canSpeak) out.push(...audible.slice(0, 3).map((item): Exercise => ({ type: 'listen', item, ...shuffled(item, 'jp', 'sound'), answer: written(item) })))
  out.push(...shuffle(askable, rand).slice(0, canSpeak ? 3 : 4).map(toJp))
  // typing comes last: it is the hardest. Kana: type the romaji. Words: type the English, and type the Japanese from the English.
  const typed = (item: Item, dir: 'toRomaji' | 'toGloss' | 'toJp'): Exercise => ({ type: 'type', item, dir, prompt: dir === 'toJp' ? item.gloss : written(item) })
  if (mine.length === 0) return out
  if (mine[0].kind === 'kana') out.push(...shuffle(mine, rand).slice(0, 3).map((it) => typed(it, 'toRomaji')))
  else {
    // typing Japanese from English needs a meaning only one word has ("white" is both しろ and しろい)
    const toJpTyped = shuffle(askable, rand).slice(0, 2)
    const toGlossTyped = shuffle(mine.filter((it) => !toJpTyped.includes(it)), rand).slice(0, 2)
    out.push(...toGlossTyped.map((it) => typed(it, 'toGloss')), ...toJpTyped.map((it) => typed(it, 'toJp')))
  }
  // a question needs at least two options (a course edit could leave a tiny pool)
  return out.filter((e) => !('options' in e) || e.options.length >= 2)
}

/** The word bank: the sentence's chunks plus the wrong ones, shuffled, and never handed over already in the right order. */
export function bankFor(tokens: string[], extras: string[], rand: () => number): string[] {
  let bank = shuffle([...tokens, ...extras], rand)
  for (let tries = 0; tries < 5 && bank.length === tokens.length && bank.every((t, i) => t === tokens[i]); tries++) bank = shuffle(bank, rand)
  return bank
}

/**
 * A grammar lesson: the explanation, then every sentence is met by recognising it (translate, fill the gap, listen) and
 * produced (build it, type it). With six sentences o0..o5 each one gets at least one of each.
 */
function buildGrammar(lesson: Lesson, explain: NonNullable<Lesson['explain']>, mine: Item[], items: ReadonlyMap<string, Item>, { canSpeak, learned, rand = Math.random }: BuildOpts): Exercise[] {
  const far = [...learned].filter((id) => !lesson.items.includes(id)).flatMap((id) => items.get(id) ?? [])
  const pool = [...shuffle(mine, rand), ...shuffle(far, rand)]
  const o = shuffle(mine, rand)
  const pick = (...at: number[]) => at.flatMap((i) => (o[i] ? [o[i]] : []))
  const opts = (it: Item, field: 'jp' | 'gloss', same: 'gloss' | 'sound' = 'gloss') => { const o = options(it, field, pool, same); return { ...o, options: shuffle(o.options, rand) } }

  const translate = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toGloss', prompt: written(it), ...opts(it, 'gloss'), answer: it.gloss })
  const say = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toJp', prompt: it.gloss, ...opts(it, 'jp'), answer: written(it) })
  const listen = (item: Item): Exercise => ({ type: 'listen', item, ...opts(item, 'jp', 'sound'), answer: written(item) })
  const gap = (it: Item) => gapFor(it, rand)
  const build = (it: Item): Exercise => {
    const tokens = it.tokens ?? fail(`Sentence ${it.id} has no tokens`)
    return { type: 'build', item: it, bank: bankFor(tokens, it.bank ?? [], rand), answer: tokens, alts: it.alts ?? [] }
  }
  const typed = (it: Item): Exercise => ({ type: 'type', item: it, dir: 'toJp', prompt: it.gloss })

  const out: Exercise[] = []
  if (mine.some((it) => !learned.has(it.id))) out.push({ type: 'explain', title: explain.title, body: explain.body, examples: explain.examples.flatMap((id) => items.get(id) ?? []) })
  out.push(...pick(0, 1, 2).map(translate), ...pick(3, 4, 5, 0).map(gap), ...pick(1, 2, 3, 4).map(build))
  if (canSpeak) out.push(...pick(2, 4).map(listen))
  out.push(...pick(1, 3).map(say), ...pick(5, 0).map(typed))
  return out.filter((e) => !('options' in e) || e.options.length >= 2)
}

/**
 * A kanji lesson: meet each kanji (stroke order, meanings, readings, example words), pick its meaning, match, pick the
 * kanji for a meaning, then read a word written with it: pick its reading, and type meanings and readings.
 */
function buildKanji(lesson: Lesson, mine: Item[], items: ReadonlyMap<string, Item>, { learned, rand = Math.random }: BuildOpts): Exercise[] {
  const far = [...learned].filter((id) => !lesson.items.includes(id)).flatMap((id) => items.get(id) ?? [])
  const pool = [...shuffle(mine, rand), ...shuffle(far, rand)]
  const unique = uniqueBy(items, 'gloss')
  const askable = shuffle(mine.filter(unique), rand)
  const opts = (it: Item, field: 'jp' | 'gloss') => { const o = options(it, field, pool, 'gloss'); return { ...o, options: shuffle(o.options, rand) } }

  // a word to read for each kanji: its most common example; distractors are readings of other words around it
  const example = (k: Item) => (k.examples ?? []).map((id) => items.get(id)).find((w): w is Item => !!w && !!w.written)
  const words = mine.flatMap((k) => example(k) ?? [])
  const readingPool = [...words, ...mine.flatMap((k) => (k.examples ?? []).flatMap((id) => items.get(id) ?? [])), ...far.filter((x) => x.kind === 'word')]
  const toReading = (w: Item): Exercise => {
    const readings = [w.jp]
    for (const x of readingPool) if (readings.length < 4 && x.jp !== w.jp && !readings.includes(x.jp) && written(x) !== written(w)) readings.push(x.jp)
    return { type: 'choice', item: w, dir: 'toReading', prompt: written(w), options: shuffle(readings, rand), answer: w.jp }
  }

  const out: Exercise[] = mine.filter((it) => !learned.has(it.id)).map((item) => ({ type: 'intro', item }))
  out.push(...shuffle(mine, rand).map((it): Exercise => ({ type: 'choice', item: it, dir: 'toGloss', prompt: it.jp, ...opts(it, 'gloss'), answer: it.gloss })))
  if (askable.length >= 2) out.push({ type: 'match', pairs: askable.slice(0, 5).map((it) => ({ id: it.id, jp: it.jp, gloss: it.gloss })) })
  out.push(...askable.slice(0, 3).map((it): Exercise => ({ type: 'choice', item: it, dir: 'toJp', prompt: it.gloss, ...opts(it, 'jp'), answer: it.jp })))
  const readWords = shuffle(words, rand)
  out.push(...readWords.slice(0, 3).map(toReading))
  out.push(...shuffle(mine, rand).slice(0, 2).map((item): Exercise => ({ type: 'type', item, dir: 'toGloss', prompt: item.jp })))
  out.push(...readWords.slice(-2).map((item): Exercise => ({ type: 'type', item, dir: 'toReading', prompt: written(item) }))) // the last two: fresh ones when there are 5
  return out.filter((e) => !('options' in e) || e.options.length >= 2)
}

/** Fill-the-gap for a sentence: its curated gap, or its first particle with curated wrong particles. */
export function gapFor(it: Item, rand: () => number = Math.random): Extract<Exercise, { type: 'choice' }> {
  const tokens = it.tokens ?? fail(`Sentence ${it.id} has no tokens`)
  // a curated gap (a verb form, a counter...): the English hint says which form is meant
  if (it.gap) return { type: 'choice', item: it, dir: 'fill', prompt: displayJp(tokens, it.gap.at), hint: it.gloss, options: shuffle([tokens[it.gap.at], ...it.gap.wrong], rand), answer: tokens[it.gap.at] }
  const at = tokens.findIndex((t) => PARTICLES.has(t))
  if (at < 0) fail(`Sentence ${it.id} has no particle to blank out`)
  const answer = tokens[at]
  // a particle without curated wrong answers would give a one-option question that gets silently dropped: say so instead
  const wrong = WRONG_PARTICLES[answer] ?? fail(`No wrong particles defined for ${answer} (sentence ${it.id}): add them to WRONG_PARTICLES`)
  return { type: 'choice', item: it, dir: 'fill', prompt: displayJp(tokens, at), hint: it.gloss, options: shuffle([answer, ...wrong], rand), answer }
}

/** Cards you read and tap through: no right or wrong, so no accuracy and no misses. */
const UNGRADED = new Set<Exercise['type']>(['intro', 'explain'])

export interface RunState {
  queue: Exercise[]
  misses: Record<string, number> // item id -> mistakes (any exercise)
  total: number // graded exercises in the lesson (intros don't count)
  correct: number // graded exercises answered right on the first try
  initial: number // queue length at the start: the progress bar's denominator (a retry replaces the exercise it repeats)
}

export const startRun = (queue: Exercise[]): RunState => ({ queue, misses: {}, total: queue.filter((e) => !UNGRADED.has(e.type)).length, correct: 0, initial: queue.length })

/** Resolve the current exercise. `missed` = item ids answered wrongly (empty = right). A wrong exercise comes back once at the end. */
export function advance(s: RunState, missed: string[] = []): RunState {
  const [head, ...rest] = s.queue
  if (!head || UNGRADED.has(head.type)) return { ...s, queue: rest }
  const misses = { ...s.misses }
  for (const id of missed) misses[id] = (misses[id] ?? 0) + 1
  const right = missed.length === 0
  return {
    ...s,
    misses,
    correct: s.correct + (right && !head.retry ? 1 : 0),
    queue: right || head.retry ? rest : [...rest, { ...head, retry: true }],
  }
}

export const accuracy = (s: RunState) => (s.total ? s.correct / s.total : 1)
