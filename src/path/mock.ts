import { shuffle } from '../modes/choices'
import { LESSONS, written, type Item } from './course'
import { gapFor, options, type Exercise } from './lesson'

export const MOCK_LEVELS = [5, 4, 3] as const
export type MockLevel = (typeof MOCK_LEVELS)[number]
export type Section = 'Vocabulary' | 'Kanji' | 'Grammar' | 'Listening'
export interface MockQuestion { section: Section; ex: Extract<Exercise, { type: 'choice' | 'listen' }> }
export const MOCK_QUESTIONS = 30
export const MOCK_MINUTES = 25
export const MOCK_PASS = 0.6
/** Best score so far, in percent (localStorage). */
export const mockBestKey = (level: MockLevel) => `nihongo.mock.n${level}`

/**
 * A mock JLPT exam over a whole level, learned or not: vocabulary (a kanji word's reading, a word's meaning), kanji
 * (reading, meaning), grammar (fill the gap in the level's grammar sentences) and, with a Japanese voice, listening.
 * Every item is asked once.
 */
export function buildMock(level: MockLevel, items: ReadonlyMap<string, Item>, canSpeak: boolean, rand: () => number = Math.random): MockQuestion[] {
  const n = canSpeak ? { vocab: 9, kanji: 7, grammar: 8, listen: 6 } : { vocab: 12, kanji: 8, grammar: 10, listen: 0 }
  const all = [...items.values()]
  const words = shuffle(all.filter((it) => it.kind === 'word' && it.level === level), rand)
  const kanji = shuffle(all.filter((it) => it.kind === 'kanji' && it.level === level), rand)
  const sentences = shuffle(LESSONS.filter((l) => l.id.startsWith(`n${level}-g-`)).flatMap((l) => l.items.flatMap((id) => items.get(id) ?? [])), rand)
  const used = new Set<string>()
  const take = (pool: Item[], k: number, ok: (it: Item) => boolean = () => true) => {
    const out = pool.filter((it) => !used.has(it.id) && ok(it)).slice(0, k)
    for (const it of out) used.add(it.id)
    return out
  }
  const opts = (it: Item, field: 'jp' | 'gloss', pool: Item[], same: 'gloss' | 'sound' = 'gloss') => { const o = options(it, field, shuffle(pool, rand), same); return { ...o, options: shuffle(o.options, rand) } }
  /** The answer and three other readings, none of them also right. */
  const readings = (answer: string, pool: string[], right: string[]) => {
    const out = [answer]
    for (const r of shuffle(pool, rand)) if (out.length < 4 && !right.includes(r) && !out.includes(r)) out.push(r)
    return shuffle(out, rand)
  }
  const q = (section: Section, ex: MockQuestion['ex']): MockQuestion => ({ section, ex })

  const half = Math.ceil(n.vocab / 2)
  const vocab = [
    ...take(words, half, (w) => !!w.written).map((w) => q('Vocabulary', { type: 'choice', item: w, dir: 'toReading', prompt: written(w), options: readings(w.jp, words.filter((x) => written(x) !== written(w)).map((x) => x.jp), [w.jp]), answer: w.jp })),
    ...take(words, n.vocab - half).map((w) => q('Vocabulary', { type: 'choice', item: w, dir: 'toGloss', prompt: written(w), ...opts(w, 'gloss', words), answer: w.gloss })),
  ]
  const kanjiRead = take(kanji, Math.ceil(n.kanji / 2), (k) => !!k.on?.length).map((k) => {
    const right = [...k.on!, ...(k.kun ?? []).map((r) => r.replace(/\(.*\)|〜/g, ''))]
    return q('Kanji', { type: 'choice', item: k, dir: 'toReading', prompt: k.jp, options: readings(k.on![0], kanji.flatMap((x) => x.on?.slice(0, 1) ?? []), right), answer: k.on![0] })
  })
  const kanjiMean = take(kanji, n.kanji - kanjiRead.length).map((k) => q('Kanji', { type: 'choice', item: k, dir: 'toGloss', prompt: k.jp, ...opts(k, 'gloss', kanji), answer: k.gloss }))
  const grammar = take(sentences, n.grammar).map((s) => q('Grammar', gapFor(s, rand)))
  const listen = take(words, n.listen).map((w) => q('Listening', { type: 'listen', item: w, ...opts(w, 'jp', words, 'sound'), answer: written(w) }))
  return [...vocab, ...kanjiRead, ...kanjiMean, ...grammar, ...listen]
}
