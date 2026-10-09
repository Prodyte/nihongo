import { shuffle } from '../modes/choices'
import type { Item, Lesson } from './course'

export type Exercise = (
  | { type: 'intro'; item: Item }
  | { type: 'choice'; item: Item; dir: 'toGloss' | 'toJp'; prompt: string; options: string[]; answer: string }
  | { type: 'listen'; item: Item; options: string[]; answer: string } // hear item.jp, pick it
  | { type: 'match'; pairs: { id: string; jp: string; gloss: string }[] }
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

const fail = (msg: string): never => {
  throw new Error(msg)
}

export function buildLesson(lesson: Lesson, items: ReadonlyMap<string, Item>, { canSpeak, learned, rand = Math.random }: BuildOpts): Exercise[] {
  const mine = lesson.items.map((id) => items.get(id) ?? fail(`Unknown item ${id} in lesson ${lesson.id}`))
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

export interface RunState {
  queue: Exercise[]
  misses: Record<string, number> // item id -> mistakes (any exercise)
  total: number // graded exercises in the lesson (intros don't count)
  correct: number // graded exercises answered right on the first try
  initial: number // queue length at the start: the progress bar's denominator (a retry replaces the exercise it repeats)
}

export const startRun = (queue: Exercise[]): RunState => ({ queue, misses: {}, total: queue.filter((e) => e.type !== 'intro').length, correct: 0, initial: queue.length })

/** Resolve the current exercise. `missed` = item ids answered wrongly (empty = right). A wrong exercise comes back once at the end. */
export function advance(s: RunState, missed: string[] = []): RunState {
  const [head, ...rest] = s.queue
  if (!head || head.type === 'intro') return { ...s, queue: rest }
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
