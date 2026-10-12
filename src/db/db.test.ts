import 'fake-indexeddb/auto'
import { newFsrsCard } from '../srs/scheduler'
import { describe, expect, it } from 'vitest'
import { Rating, State } from 'ts-fsrs'
import { KANA } from '../data/kana'
import { getDeck, gradeCard, newToday, openDb, seedKana } from './db'

let n = 0
const fresh = () => openDb(`test-${n++}`)

describe('db', () => {
  it('seeds all kana by deck', async () => {
    const db = await fresh()
    await seedKana(db)
    expect(await getDeck(db, 'kana')).toHaveLength(104)
  })
  it('re-seeding keeps progress', async () => {
    const db = await fresh()
    await seedKana(db)
    await gradeCard(db, 'kana:あ', Rating.Good)
    await seedKana(db)
    expect((await db.get('cards', 'kana:あ'))!.fsrs.state).not.toBe(State.New)
    expect(await db.count('cards')).toBe(KANA.length / 2) // one card per sound
  })
  it('folds the old separate hiragana and katakana cards into one per sound: better-known schedule, both histories, merged lessons', async () => {
    const db = await fresh()
    const old = (id: string, front: string, deck: string) => db.put('cards', { id, deck, front, back: ['a'], fsrs: newFsrsCard() })
    await Promise.all([old('hira:あ', 'あ', 'hira'), old('kata:ア', 'ア', 'kata'), old('kata:イ', 'イ', 'kata')])
    await gradeCard(db, 'hira:あ', Rating.Good, new Date('2026-03-01T10:00:00Z'))
    await gradeCard(db, 'kata:ア', Rating.Again, new Date('2026-03-02T10:00:00Z'))
    await gradeCard(db, 'kata:ア', Rating.Good, new Date('2026-03-03T10:00:00Z'))
    await gradeCard(db, 'kata:ア', Rating.Easy, new Date('2026-03-09T10:00:00Z')) // ア is the better known
    const best = (await db.get('cards', 'kata:ア'))!.fsrs
    const done = (id: string, at: string, acc: number) => db.put('lessons', { id, completedAt: new Date(at), plays: 1, bestAccuracy: acc })
    await Promise.all([done('hira-basic-1', '2026-03-01', 1), done('kata-basic-1', '2026-03-04', 0.8), done('hira-basic-2', '2026-03-05', 1)])
    await seedKana(db)
    await seedKana(db) // and again: nothing changes twice
    expect(await db.count('cards')).toBe(KANA.length / 2)
    expect(await db.get('cards', 'hira:あ')).toBeUndefined()
    expect(await db.get('cards', 'kata:ア')).toBeUndefined()
    expect(await db.get('cards', 'kana:あ')).toMatchObject({ deck: 'kana', front: 'あ', fsrs: best })
    expect((await db.getAllFromIndex('reviews', 'by-card', 'kana:あ')).map((r) => r.grade)).toEqual([Rating.Good, Rating.Again, Rating.Good, Rating.Easy])
    expect(await db.get('cards', 'kana:い')).toBeTruthy() // an untouched old card becomes the merged one too
    expect(await db.get('lessons', 'kana-basic-1')).toMatchObject({ completedAt: new Date('2026-03-04'), bestAccuracy: 0.8 }) // both done
    expect(await db.get('lessons', 'kana-basic-2')).toBeUndefined() // only the hiragana half was done: katakana is still to learn
    expect(await db.getAllKeys('lessons')).toEqual(['kana-basic-1'])
  })
  it('gradeCard updates the card and logs a review atomically', async () => {
    const db = await fresh()
    await seedKana(db)
    const updated = await gradeCard(db, 'kana:あ', Rating.Easy)
    expect(updated.fsrs.reps).toBe(1)
    expect((await db.get('cards', 'kana:あ'))!.fsrs.due).toEqual(updated.fsrs.due)
    const reviews = await db.getAllFromIndex('reviews', 'by-card', 'kana:あ')
    expect(reviews).toHaveLength(1)
    expect(reviews[0].grade).toBe(Rating.Easy)
  })
  it('rejects an unknown card without writing a review', async () => {
    const db = await fresh()
    await expect(gradeCard(db, 'nope', Rating.Good)).rejects.toThrow('unknown card')
    expect(await db.count('reviews')).toBe(0)
  })
  it('newToday counts first-ever reviews today only', async () => {
    const db = await fresh()
    await seedKana(db)
    const now = new Date('2026-03-10T12:00:00')
    await gradeCard(db, 'kana:あ', Rating.Good, new Date('2026-03-09T12:00:00')) // yesterday
    await gradeCard(db, 'kana:い', Rating.Good, now)
    await gradeCard(db, 'kana:う', Rating.Again, now)
    await gradeCard(db, 'kana:い', Rating.Good, new Date('2026-03-10T12:30:00')) // repeat, not new
    expect(await newToday(db, new Date('2026-03-10T13:00:00'))).toBe(2)
  })
})
