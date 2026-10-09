import { shuffle } from '../modes/choices'
import type { Item, Lesson } from './course'
import { displayJp, PARTICLES } from './romaji'

export type Exercise = (
  | { type: 'intro'; item: Item }
  | { type: 'explain'; title: string; body: string[]; examples: Item[] } // a grammar lesson's opening card
  | { type: 'choice'; item: Item; dir: 'toGloss' | 'toJp' | 'fill'; prompt: string; options: string[]; answer: string; hint?: string } // fill: pick the particle that completes the sentence
  | { type: 'listen'; item: Item; options: string[]; answer: string } // hear item.jp, pick it
  | { type: 'match'; pairs: { id: string; jp: string; gloss: string }[] }
  | { type: 'build'; item: Item; bank: string[]; answer: string[]; alts: string[][] } // put the chunks of a sentence in order
  | { type: 'type'; item: Item; dir: 'toRomaji' | 'toGloss' | 'toJp'; prompt: string } // kana: type the romaji; words: type the English, or the Japanese via romaji
) & { retry?: boolean }

export interface BuildOpts {
  canSpeak: boolean // a Japanese voice exists; otherwise there are no listening exercises
  learned: ReadonlySet<string> // item ids from lessons already completed (no intro; used as distractors)
  rand?: () => number
}

const sameBucket = (a: Item, b: Item) => a.kind === b.kind && a.script === b.script
const key = (it: Item, by: 'gloss' | 'sound') => `${it.kind}|${it.script}|${it[by]}`

/** `n` shuffled options: the answer plus distractors from `pool` (taken in order, so put the closest items first). */
function options(answer: Item, field: 'jp' | 'gloss', pool: Item[], same: 'gloss' | 'sound', n = 4): string[] {
  const picked = [answer[field]]
  for (const it of pool) {
    if (picked.length === n) break
    if (it.id === answer.id || !sameBucket(it, answer)) continue // never mix hiragana into a katakana question
    if (it[same] === answer[same]) continue // would be a second right answer (じ/ぢ are both "ji"; お/を both sound "o")
    if (picked.includes(it[field])) continue
    picked.push(it[field])
  }
  return picked
}

/** Particles offered as wrong answers for a gap. Chosen so none of them also makes a correct sentence: a blank は is never
 * offered も (わたしも is fine, "too"), and a blank を is never offered は (みずは のみます is fine, "as for water"). */
const WRONG_PARTICLES: Record<string, string[]> = { は: ['の', 'を', 'か'], も: ['の', 'を', 'か'], の: ['を', 'か'], を: ['の', 'か'], か: ['は', 'の', 'を'] }

const fail = (msg: string): never => {
  throw new Error(msg)
}

export function buildLesson(lesson: Lesson, items: ReadonlyMap<string, Item>, opts: BuildOpts): Exercise[] {
  const { canSpeak, learned, rand = Math.random } = opts
  const mine = lesson.items.map((id) => items.get(id) ?? fail(`Unknown item ${id} in lesson ${lesson.id}`))
  if (lesson.explain) return buildGrammar(lesson, lesson.explain, mine, items, opts)
  const far = [...learned].filter((id) => !lesson.items.includes(id)).flatMap((id) => items.get(id) ?? [])
  const pool = [...shuffle(mine, rand), ...shuffle(far, rand)] // lesson items make the likeliest distractors

  // Items sharing a gloss with another item of their kind can't be asked in reverse or matched (two right answers);
  // items sharing a sound can't be asked by ear either.
  const count = (by: 'gloss' | 'sound') => {
    const m = new Map<string, number>()
    for (const it of items.values()) m.set(key(it, by), (m.get(key(it, by)) ?? 0) + 1)
    return (it: Item) => m.get(key(it, by)) === 1
  }
  const [uniqueGloss, uniqueSound] = [count('gloss'), count('sound')]
  const askable = shuffle(mine.filter(uniqueGloss), rand)
  const audible = shuffle(askable.filter(uniqueSound), rand)

  const shuffled = (it: Item, field: 'jp' | 'gloss', same: 'gloss' | 'sound' = 'gloss') => shuffle(options(it, field, pool, same), rand)
  const toGloss = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toGloss', prompt: it.jp, options: shuffled(it, 'gloss'), answer: it.gloss })
  const toJp = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toJp', prompt: it.gloss, options: shuffled(it, 'jp'), answer: it.jp })

  const out: Exercise[] = mine.filter((it) => !learned.has(it.id)).map((item) => ({ type: 'intro', item }))
  out.push(...shuffle(mine, rand).map(toGloss))
  if (askable.length >= 2) out.push({ type: 'match', pairs: askable.slice(0, 5).map((it) => ({ id: it.id, jp: it.jp, gloss: it.gloss })) })
  if (canSpeak) out.push(...audible.slice(0, 3).map((item): Exercise => ({ type: 'listen', item, options: shuffled(item, 'jp', 'sound'), answer: item.jp })))
  out.push(...shuffle(askable, rand).slice(0, canSpeak ? 3 : 4).map(toJp))
  // typing comes last: it is the hardest. Kana: type the romaji. Words: type the English, and type the Japanese from the English.
  const typed = (item: Item, dir: 'toRomaji' | 'toGloss' | 'toJp'): Exercise => ({ type: 'type', item, dir, prompt: dir === 'toJp' ? item.gloss : item.jp })
  if (mine.length === 0) return out
  if (mine[0].kind === 'kana') out.push(...shuffle(mine, rand).slice(0, 3).map((it) => typed(it, 'toRomaji')))
  else {
    const order = shuffle(mine, rand)
    out.push(...order.slice(0, 2).map((it) => typed(it, 'toGloss')), ...order.slice(2, 4).map((it) => typed(it, 'toJp')))
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
  const opts = (it: Item, field: 'jp' | 'gloss', same: 'gloss' | 'sound' = 'gloss') => shuffle(options(it, field, pool, same), rand)

  const translate = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toGloss', prompt: it.jp, options: opts(it, 'gloss'), answer: it.gloss })
  const say = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toJp', prompt: it.gloss, options: opts(it, 'jp'), answer: it.jp })
  const listen = (item: Item): Exercise => ({ type: 'listen', item, options: opts(item, 'jp', 'sound'), answer: item.jp })
  const gap = (it: Item): Exercise => {
    const tokens = it.tokens ?? fail(`Sentence ${it.id} has no tokens`)
    const at = tokens.findIndex((t) => PARTICLES.has(t))
    if (at < 0) fail(`Sentence ${it.id} has no particle to blank out`)
    const answer = tokens[at]
    // a particle without curated wrong answers would give a one-option question that gets silently dropped: say so instead
    const wrong = WRONG_PARTICLES[answer] ?? fail(`No wrong particles defined for ${answer} (sentence ${it.id}): add them to WRONG_PARTICLES`)
    return { type: 'choice', item: it, dir: 'fill', prompt: displayJp(tokens, at), hint: it.gloss, options: shuffle([answer, ...wrong], rand), answer }
  }
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
