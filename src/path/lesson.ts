import { shuffle } from '../modes/choices'
import type { Item, Lesson } from './course'

export type Exercise = (
  | { type: 'intro'; item: Item }
  | { type: 'choice'; item: Item; dir: 'toGloss' | 'toJp'; prompt: string; options: string[]; answer: string }
  | { type: 'listen'; item: Item; options: string[]; answer: string } // hear item.jp, pick it
  | { type: 'match'; pairs: { id: string; jp: string; gloss: string }[] }
) & { retry?: boolean }

export interface BuildOpts {
  canSpeak: boolean // a Japanese voice exists; otherwise there are no listening exercises
  learned: ReadonlySet<string> // item ids from lessons already completed (no intro; used as distractors)
  rand?: () => number
}

const sameBucket = (a: Item, b: Item) => a.kind === b.kind && a.script === b.script
const key = (it: Item) => `${it.kind}|${it.script}|${it.gloss}`

/** `n` shuffled options: the answer plus distractors from `pool` (taken in order, so put the closest items first). */
function options(answer: Item, field: 'jp' | 'gloss', pool: Item[], n = 4): string[] {
  const picked = [answer[field]]
  for (const it of pool) {
    if (picked.length === n) break
    if (it.id === answer.id || !sameBucket(it, answer)) continue // never mix hiragana into a katakana question
    if (it.gloss === answer.gloss) continue // would be a second right answer (e.g. じ and ぢ are both "ji")
    if (picked.includes(it[field])) continue
    picked.push(it[field])
  }
  return picked
}

export function buildLesson(lesson: Lesson, items: ReadonlyMap<string, Item>, { canSpeak, learned, rand = Math.random }: BuildOpts): Exercise[] {
  const mine = lesson.items.map((id) => items.get(id)!)
  const far = [...learned].filter((id) => !lesson.items.includes(id)).flatMap((id) => items.get(id) ?? [])
  const pool = [...shuffle(mine, rand), ...shuffle(far, rand)] // lesson items make the likeliest distractors

  // Items sharing a gloss with another item of their kind can't be asked by sound or in reverse (two right answers).
  const glossCount = new Map<string, number>()
  for (const it of items.values()) glossCount.set(key(it), (glossCount.get(key(it)) ?? 0) + 1)
  const askable = shuffle(mine.filter((it) => glossCount.get(key(it)) === 1), rand)

  const shuffled = (it: Item, field: 'jp' | 'gloss') => shuffle(options(it, field, pool), rand)
  const toGloss = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toGloss', prompt: it.jp, options: shuffled(it, 'gloss'), answer: it.gloss })
  const toJp = (it: Item): Exercise => ({ type: 'choice', item: it, dir: 'toJp', prompt: it.gloss, options: shuffled(it, 'jp'), answer: it.jp })

  const out: Exercise[] = mine.filter((it) => !learned.has(it.id)).map((item) => ({ type: 'intro', item }))
  out.push(...shuffle(mine, rand).map(toGloss))
  if (askable.length >= 2) out.push({ type: 'match', pairs: askable.slice(0, 5).map((it) => ({ id: it.id, jp: it.jp, gloss: it.gloss })) })
  if (canSpeak) out.push(...askable.slice(0, 3).map((item): Exercise => ({ type: 'listen', item, options: shuffled(item, 'jp'), answer: item.jp })))
  out.push(...shuffle(askable, rand).slice(0, canSpeak ? 4 : 5).map(toJp))
  return out
}

export interface RunState {
  queue: Exercise[]
  misses: Record<string, number> // item id -> mistakes (any exercise)
  total: number // graded exercises in the lesson (intros don't count)
  correct: number // graded exercises answered right on the first try
}

export const startRun = (queue: Exercise[]): RunState => ({ queue, misses: {}, total: queue.filter((e) => e.type !== 'intro').length, correct: 0 })

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
