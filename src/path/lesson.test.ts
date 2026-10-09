import { describe, expect, it } from 'vitest'
import { ITEMS, LESSONS, lessonById, type Item } from './course'
import { accuracy, advance, buildLesson, startRun, type Exercise } from './lesson'

/** Small deterministic PRNG (mulberry32) so shuffles are reproducible. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const learnedBefore = (i: number) => new Set(LESSONS.slice(0, i).flatMap((l) => l.items))
/** none: first lesson ever; earlier: previous lessons done; repeat: this lesson and all before it done (practice) */
const learnedFor = (mode: 'none' | 'earlier' | 'repeat', i: number) => (mode === 'none' ? new Set<string>() : learnedBefore(mode === 'earlier' ? i : i + 1))
// gloss of a Japanese option string within an item's script bucket (for "two right answers" checks)
const glossOfJp = (jp: string, like: Item) => [...ITEMS.values()].find((x) => x.jp === jp && x.kind === like.kind && x.script === like.script)?.gloss
const dupSound = (it: Item) => [...ITEMS.values()].filter((x) => x.kind === it.kind && x.script === it.script && x.sound === it.sound).length > 1
const dupGloss = (it: Item) => [...ITEMS.values()].filter((x) => x.kind === it.kind && x.script === it.script && x.gloss === it.gloss).length > 1

describe('buildLesson invariants, over every lesson', () => {
  for (const canSpeak of [true, false])
    for (const mode of ['none', 'earlier', 'repeat'] as const)
      it(`canSpeak=${canSpeak}, history=${mode}`, () => {
        LESSONS.forEach((lesson, i) => {
          const learned = learnedFor(mode, i)
          const exs = buildLesson(lesson, ITEMS, { canSpeak, learned, rand: seeded(i + 1) })
          const where = `${lesson.id}`
          const mine = lesson.items.map((id) => ITEMS.get(id)!)

          // intros first, only for unlearned items, none after
          const firstNonIntro = exs.findIndex((e) => e.type !== 'intro')
          expect(exs.slice(0, firstNonIntro).every((e) => e.type === 'intro'), where).toBe(true)
          expect(exs.slice(firstNonIntro).some((e) => e.type === 'intro'), where).toBe(false)
          expect(exs.filter((e) => e.type === 'intro').length, where).toBe(mode === 'repeat' ? 0 : mine.length)

          if (!canSpeak) expect(exs.some((e) => e.type === 'listen'), where).toBe(false)
          expect(exs.length, where).toBeLessThanOrEqual(24)

          const touched = new Set<string>()
          for (const e of exs) {
            if (e.type === 'match') { expect(e.pairs.length, where).toBeGreaterThanOrEqual(2); expect(e.pairs.length).toBeLessThanOrEqual(5); e.pairs.forEach((p) => touched.add(p.id)); continue }
            if (e.type === 'intro') continue
            touched.add(e.item.id)
            expect(e.options.length, where).toBeGreaterThanOrEqual(2)
            expect(e.options.length, where).toBeLessThanOrEqual(4)
            expect(new Set(e.options).size, where).toBe(e.options.length) // no repeated option
            expect(e.options.filter((o) => o === e.answer), where).toHaveLength(1)
            if (e.type === 'listen') expect(dupSound(e.item), `${where}: ${e.item.jp} sounds like another kana, must not be asked by ear`).toBe(false)
            if (e.type === 'listen' || e.dir === 'toJp') {
              expect(dupGloss(e.item), `${where}: ${e.item.jp} has a twin sound, must not be asked by sound or in reverse`).toBe(false)
              // no distractor reads the same as the answer, and all options share the answer's script
              expect(e.options.filter((o) => glossOfJp(o, e.item) === e.item.gloss), where).toHaveLength(1)
              if (e.item.script === 'kata') for (const o of e.options) expect(o, where).toMatch(/^[゠-ヿ]+$/)
              if (e.item.script === 'hira') for (const o of e.options) expect(o, where).toMatch(/^[぀-ゟ]+$/)
            }
          }
          for (const it of mine) expect(touched.has(it.id), `${where}: ${it.jp} is never practised`).toBe(true)
          for (const e of exs) if (e.type === 'match') for (const p of e.pairs) expect(dupGloss(ITEMS.get(p.id)!), where).toBe(false)
        })
      })
})

describe('buildLesson specifics', () => {
  it('never offers を as an answer to hearing お (both sound "o"), nor asks を by ear', () => {
    const o = lessonById('hira-basic-1')!
    const rest = new Set(LESSONS.slice(1, 9).flatMap((l) => l.items)) // を is in here
    for (let seed = 1; seed <= 60; seed++) {
      for (const e of buildLesson(o, ITEMS, { canSpeak: true, learned: rest, rand: seeded(seed) })) if (e.type === 'listen') expect(e.options).not.toContain('を')
      for (const e of buildLesson(lessonById('hira-basic-9')!, ITEMS, { canSpeak: true, learned: new Set(), rand: seeded(seed) })) if (e.type === 'listen') expect(e.item.jp).not.toBe('を')
    }
    expect(ITEMS.get('hira:を')).toMatchObject({ gloss: 'wo', sound: 'o' })
    expect(ITEMS.get('hira:を')!.note).toMatch(/pronounced "o"/)
  })
  it('throws a clear error for an unknown item id', () => {
    expect(() => buildLesson({ id: 'x', title: 'x', items: ['hira:nope'] }, ITEMS, { canSpeak: true, learned: new Set() })).toThrow('Unknown item hira:nope in lesson x')
  })
  it('never emits a question with fewer than two options (tiny pool)', () => {
    const one = new Map([['w:a', { id: 'w:a', kind: 'word' as const, jp: 'あ', gloss: 'a', romaji: 'a', sound: 'a' }]])
    const exs = buildLesson({ id: 'tiny', title: 'tiny', items: ['w:a'] }, one, { canSpeak: true, learned: new Set() })
    expect(exs.map((e) => e.type)).toEqual(['intro'])
  })
  const lesson = lessonById('hira-voiced-3')! // だ ぢ づ で ど: ぢ and づ sound like じ and ず
  const exs = buildLesson(lesson, ITEMS, { canSpeak: true, learned: new Set(), rand: seeded(7) })
  it('only asks twin-sound kana kana -> romaji, and never in matching', () => {
    for (const e of exs) {
      if (e.type === 'choice' && (e.item.jp === 'ぢ' || e.item.jp === 'づ')) expect(e.dir).toBe('toGloss')
      if (e.type === 'listen') expect(['ぢ', 'づ']).not.toContain(e.item.jp)
      if (e.type === 'match') expect(e.pairs.map((p) => p.jp)).not.toEqual(expect.arrayContaining(['ぢ']))
    }
    expect(exs.some((e) => e.type === 'choice' && e.item.jp === 'ぢ')).toBe(true)
  })
  it('uses earlier words as distractors in a vocabulary lesson', () => {
    const l = lessonById('greetings-2')!
    const learned = learnedBefore(LESSONS.indexOf(l))
    const e = buildLesson(l, ITEMS, { canSpeak: false, learned, rand: seeded(3) }).find((x) => x.type === 'choice')!
    expect(e.type === 'choice' && e.options).toHaveLength(4)
  })
  it('is deterministic for a seed and varies across seeds', () => {
    const l = LESSONS[0]
    const a = buildLesson(l, ITEMS, { canSpeak: true, learned: new Set(), rand: seeded(1) })
    expect(buildLesson(l, ITEMS, { canSpeak: true, learned: new Set(), rand: seeded(1) })).toEqual(a)
    expect(buildLesson(l, ITEMS, { canSpeak: true, learned: new Set(), rand: seeded(2) })).not.toEqual(a)
  })
  it('a lesson of 3 items still builds valid 3-option questions', () => {
    const l = lessonById('hira-combos-6')!
    expect(l.items).toHaveLength(3)
    const e = buildLesson(l, ITEMS, { canSpeak: true, learned: new Set(), rand: seeded(5) }).find((x) => x.type === 'choice')!
    expect(e.type === 'choice' && e.options).toHaveLength(3)
  })
})

describe('advance (run state)', () => {
  const [a, b] = LESSONS[0].items.map((id) => ITEMS.get(id)!)
  const ch = (item: Item): Exercise => ({ type: 'choice', item, dir: 'toGloss', prompt: item.jp, options: [item.gloss, 'x'], answer: item.gloss })
  const intro = (item: Item): Exercise => ({ type: 'intro', item })

  it('intro steps are free: not counted, no misses', () => {
    let s = startRun([intro(a), ch(a)])
    expect(s.total).toBe(1)
    s = advance(s)
    expect(s).toMatchObject({ correct: 0, queue: [ch(a)] })
  })
  it('right first try counts; wrong one comes back once, counts as a miss, and does not count when retried right', () => {
    let s = startRun([ch(a), ch(b)])
    s = advance(s, [a.id]) // wrong
    expect(s.misses).toEqual({ [a.id]: 1 })
    expect(s.queue.map((e) => e.retry ?? false)).toEqual([false, true])
    s = advance(s) // b right first try
    expect(s.correct).toBe(1)
    s = advance(s) // a retried, right
    expect(s.queue).toHaveLength(0)
    expect(s.correct).toBe(1) // the retry earns no accuracy credit
    expect(accuracy(s)).toBe(0.5)
  })
  it('a retry that is wrong again is not requeued forever', () => {
    let s = startRun([ch(a)])
    s = advance(s, [a.id])
    s = advance(s, [a.id])
    expect(s.queue).toHaveLength(0)
    expect(s.misses[a.id]).toBe(2)
  })
  it('a match with several wrong pairs records every missed item', () => {
    const m: Exercise = { type: 'match', pairs: [a, b].map((it) => ({ id: it.id, jp: it.jp, gloss: it.gloss })) }
    const s = advance(startRun([m]), [a.id, b.id, a.id])
    expect(s.misses).toEqual({ [a.id]: 2, [b.id]: 1 })
    expect(s.queue).toHaveLength(1)
  })
  it('progress never goes backwards, even with retries: initial - queue.length only rises', () => {
    let s = startRun([ch(a), ch(b)])
    const seen: number[] = [s.initial - s.queue.length]
    for (const missed of [[a.id], [], []]) { s = advance(s, missed); seen.push(s.initial - s.queue.length) }
    expect(seen).toEqual([0, 0, 1, 2])
    expect(s.queue).toHaveLength(0)
  })
  it('accuracy of an empty run is 1', () => {
    expect(accuracy(startRun([]))).toBe(1)
  })
})
