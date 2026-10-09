import 'fake-indexeddb/auto'
import { openDB } from 'idb'
import { Rating, State } from 'ts-fsrs'
import { describe, expect, it } from 'vitest'
import { openDb, seedKana } from '../db/db'
import { newFsrsCard } from '../srs/scheduler'
import { ITEMS, LESSONS, lessonById } from './course'
import { addReviewXp, completeLesson, currentLesson, dailyGoalProgress, dayKey, getProgress, glossAnswers, isUnlocked, learnedItems, streak, xpFor } from './progress'

let n = 0
const fresh = async () => { const db = await openDb(`progress-${n++}`); await seedKana(db); return db }
const at = (iso: string) => new Date(iso) // 'YYYY-MM-DDTHH:mm:ss' without Z = local time
const days = (...d: string[]) => new Set(d)

describe('dayKey / streak', () => {
  it('formats local dates with padding', () => {
    expect(dayKey(at('2026-03-04T23:59:59'))).toBe('2026-03-04')
    expect(dayKey(at('2026-12-31T00:00:00'))).toBe('2026-12-31')
  })
  it('counts consecutive days ending today', () => {
    expect(streak(days(), at('2026-03-10T12:00:00'))).toBe(0)
    expect(streak(days('2026-03-10'), at('2026-03-10T12:00:00'))).toBe(1)
    expect(streak(days('2026-03-08', '2026-03-09', '2026-03-10'), at('2026-03-10T23:59:00'))).toBe(3)
  })
  it('stays alive today when yesterday was active, dies after a missed day', () => {
    expect(streak(days('2026-03-08', '2026-03-09'), at('2026-03-10T08:00:00'))).toBe(2)
    expect(streak(days('2026-03-07', '2026-03-08'), at('2026-03-10T08:00:00'))).toBe(0)
  })
  it('a gap ends the run', () => {
    expect(streak(days('2026-03-06', '2026-03-08', '2026-03-09', '2026-03-10'), at('2026-03-10T09:00:00'))).toBe(3)
  })
  it('works across month, leap-day, year and daylight-saving boundaries', () => {
    expect(streak(days('2026-02-27', '2026-02-28', '2026-03-01'), at('2026-03-01T10:00:00'))).toBe(3)
    expect(streak(days('2028-02-28', '2028-02-29', '2028-03-01'), at('2028-03-01T10:00:00'))).toBe(3)
    expect(streak(days('2025-12-31', '2026-01-01'), at('2026-01-01T00:30:00'))).toBe(2)
    expect(streak(days('2026-03-07', '2026-03-08', '2026-03-09'), at('2026-03-09T10:00:00'))).toBe(3) // US spring forward is 8 March
    expect(streak(days('2026-10-31', '2026-11-01', '2026-11-02'), at('2026-11-02T10:00:00'))).toBe(3) // EU/US autumn changes
  })
})

describe('xp, goal, unlocking', () => {
  it('xp: 10 first time, +5 flawless, 5 for repeats', () => {
    expect([xpFor(true, false), xpFor(true, true), xpFor(false, true), xpFor(false, false)]).toEqual([10, 15, 5, 5])
  })
  it('daily goal progress', () => {
    expect(dailyGoalProgress(5, 20)).toEqual({ xp: 5, goal: 20, fraction: 0.25, met: false })
    expect(dailyGoalProgress(45, 20)).toMatchObject({ fraction: 1, met: true })
  })
  it('lessons unlock in order, unless skipping ahead', () => {
    const done = new Set([LESSONS[0].id])
    expect(isUnlocked(LESSONS, 0, new Set(), false)).toBe(true)
    expect(isUnlocked(LESSONS, 1, done, false)).toBe(true)
    expect(isUnlocked(LESSONS, 2, done, false)).toBe(false)
    expect(isUnlocked(LESSONS, 40, new Set(), true)).toBe(true)
    expect(currentLesson(LESSONS, done)).toBe(LESSONS[1])
    expect(currentLesson(LESSONS, new Set(LESSONS.map((l) => l.id)))).toBeNull()
  })
  it('learnedItems is the union of completed lessons', () => {
    expect(learnedItems(LESSONS, new Set([LESSONS[0].id, LESSONS[2].id]))).toEqual(new Set([...LESSONS[0].items, ...LESSONS[2].items]))
  })
  it('glossAnswers accepts the full gloss, each comma part, and versions without brackets', () => {
    expect(glossAnswers('hello, good afternoon')).toEqual(['hello, good afternoon', 'hello', 'good afternoon'])
    expect(glossAnswers('good morning (casual)')).toEqual(['good morning (casual)', 'good morning'])
    expect(glossAnswers('water')).toEqual(['water'])
  })
})

describe('completeLesson', () => {
  const lesson = lessonById('greetings-1')!
  const now = at('2026-03-04T09:00:00')

  it('first flawless completion: creates and grades vocab cards, records lesson, awards 15 XP', async () => {
    const db = await fresh()
    const r = await completeLesson(db, lesson, ITEMS, {}, 1, now)
    expect(r).toEqual({ xp: 15, first: true, flawless: true, graded: 6 })
    const cards = await db.getAllFromIndex('cards', 'by-deck', 'vocab')
    expect(cards).toHaveLength(6)
    expect(cards.every((c) => c.fsrs.state !== State.New && c.fsrs.reps === 1)).toBe(true)
    expect(cards.find((c) => c.id === 'vocab:konnichiwa')).toMatchObject({ front: 'こんにちは', back: ['hello, good afternoon', 'hello', 'good afternoon'] })
    expect((await db.getAll('reviews')).map((x) => x.grade)).toEqual(Array(6).fill(Rating.Good))
    expect(await db.get('decks', 'vocab')).toEqual({ id: 'vocab', name: 'Starter vocabulary' })
    expect(await db.get('lessons', lesson.id)).toEqual({ id: lesson.id, completedAt: now, plays: 1, bestAccuracy: 1 })
    expect(await db.get('activity', '2026-03-04')).toEqual({ date: '2026-03-04', xp: 15, lessons: 1 })
  })
  it('grades by mistakes: 0 Good, 1 Hard, 2+ Again; only 10 XP when not flawless', async () => {
    const db = await fresh()
    const [a, b, c] = lesson.items
    const r = await completeLesson(db, lesson, ITEMS, { [b]: 1, [c]: 3 }, 0.8, now)
    expect(r).toMatchObject({ xp: 10, flawless: false })
    const grade = async (id: string) => (await db.getAllFromIndex('reviews', 'by-card', id))[0].grade
    expect([await grade(a), await grade(b), await grade(c)]).toEqual([Rating.Good, Rating.Hard, Rating.Again])
  })
  it('kana lessons grade the seeded cards and do not create a vocab deck', async () => {
    const db = await fresh()
    await completeLesson(db, LESSONS[0], ITEMS, {}, 1, now)
    expect((await db.get('cards', 'hira:あ'))!.fsrs.state).not.toBe(State.New)
    expect(await db.count('decks')).toBe(0)
    expect(await db.count('cards')).toBe(208)
  })
  it('replaying a lesson: 5 XP, plays+1, best accuracy kept, completedAt unchanged, no extra reviews while cards are not due', async () => {
    const db = await fresh()
    await completeLesson(db, lesson, ITEMS, {}, 0.9, now)
    const r = await completeLesson(db, lesson, ITEMS, { [lesson.items[0]]: 1 }, 0.7, at('2026-03-04T09:05:00')) // inside the 10-minute learning step
    expect(r).toEqual({ xp: 5, first: false, flawless: false, graded: 0 })
    expect(await db.count('reviews')).toBe(6)
    expect(await db.get('lessons', lesson.id)).toEqual({ id: lesson.id, completedAt: now, plays: 2, bestAccuracy: 0.9 })
    expect((await db.get('activity', '2026-03-04'))!).toMatchObject({ xp: 20, lessons: 2 })
  })
  it('a card whose learning step has passed is graded again on replay (it is genuinely due)', async () => {
    const db = await fresh()
    await completeLesson(db, lesson, ITEMS, {}, 1, now)
    expect((await completeLesson(db, lesson, ITEMS, {}, 1, at('2026-03-04T09:11:00'))).graded).toBe(6)
  })
  it('replaying once cards are due grades them again', async () => {
    const db = await fresh()
    await completeLesson(db, lesson, ITEMS, {}, 1, now)
    const r = await completeLesson(db, lesson, ITEMS, {}, 1, at('2026-06-01T09:00:00'))
    expect(r.graded).toBe(6)
    expect(await db.count('reviews')).toBe(12)
  })
  it('stores a clamped accuracy, never NaN or out of range', async () => {
    const db = await fresh()
    await completeLesson(db, lesson, ITEMS, {}, Number.NaN, now)
    expect((await db.get('lessons', lesson.id))!.bestAccuracy).toBe(0)
    await completeLesson(db, lesson, ITEMS, {}, 7, now)
    expect((await db.get('lessons', lesson.id))!.bestAccuracy).toBe(1)
  })
  it('an unknown item changes nothing', async () => {
    const db = await fresh()
    await expect(completeLesson(db, { id: 'bad', title: 'bad', items: [lesson.items[0], 'vocab:nope'] }, ITEMS, {}, 1, now)).rejects.toThrow('Unknown item vocab:nope')
    expect(await db.count('reviews')).toBe(0)
    expect(await db.count('lessons')).toBe(0)
    expect(await db.count('cards')).toBe(208)
  })
  it('XP accumulates per day and starts fresh on the next day', async () => {
    const db = await fresh()
    await completeLesson(db, LESSONS[0], ITEMS, {}, 1, at('2026-03-04T09:00:00'))
    await completeLesson(db, LESSONS[1], ITEMS, {}, 1, at('2026-03-04T21:00:00'))
    await completeLesson(db, LESSONS[2], ITEMS, {}, 1, at('2026-03-05T08:00:00'))
    expect((await db.getAll('activity')).map((a) => [a.date, a.xp, a.lessons])).toEqual([['2026-03-04', 30, 2], ['2026-03-05', 15, 1]])
  })
})

describe('getProgress / addReviewXp', () => {
  it('reports done lessons, streak and today\'s XP; reviews add 1 XP each', async () => {
    const db = await fresh()
    await completeLesson(db, LESSONS[0], ITEMS, {}, 1, at('2026-03-09T12:00:00'))
    await addReviewXp(db, at('2026-03-10T08:00:00'))
    await addReviewXp(db, at('2026-03-10T08:05:00'))
    expect(await getProgress(db, at('2026-03-10T09:00:00'))).toEqual({ done: new Set([LESSONS[0].id]), streak: 2, xpToday: 2 })
    expect(await getProgress(db, at('2026-03-12T09:00:00'))).toMatchObject({ streak: 0, xpToday: 0 }) // two idle days broke it
  })
})

describe('database upgrade', () => {
  it('a connection closes itself when another tab upgrades the database, so the upgrade is not blocked', async () => {
    const name = 'blocking-test'
    const mine = await openDb(name) // v3, held open like an older tab
    const newer = await openDB(name, 4) // would hang forever if `mine` did not close
    expect(newer.version).toBe(4)
    await expect(mine.count('cards')).rejects.toThrow() // closed
    newer.close()
  })
  it('a v2 database (before the path) upgrades to v3 keeping its data', async () => {
    const name = 'upgrade-test'
    const old = await openDB(name, 2, { upgrade(d) {
      d.createObjectStore('cards', { keyPath: 'id' }).createIndex('by-deck', 'deck')
      d.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true }).createIndex('by-card', 'cardId')
      d.createObjectStore('decks', { keyPath: 'id' })
      d.createObjectStore('media', { keyPath: 'key' })
    } })
    await old.put('cards', { id: 'hira:あ', deck: 'hira', front: 'あ', back: ['a'], fsrs: newFsrsCard() })
    old.close()
    const db = await openDb(name)
    expect([...db.objectStoreNames].sort()).toEqual(['activity', 'cards', 'decks', 'lessons', 'media', 'reviews'])
    expect(await db.get('cards', 'hira:あ')).toBeTruthy()
    await completeLesson(db, LESSONS[0], ITEMS, {}, 1) // the new stores work
    expect(await db.count('lessons')).toBe(1)
  })
})
