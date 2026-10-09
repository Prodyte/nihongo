import 'fake-indexeddb/auto'
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
    expect(await getDeck(db, 'hira')).toHaveLength(104)
    expect(await getDeck(db, 'kata')).toHaveLength(104)
  })
  it('re-seeding keeps progress', async () => {
    const db = await fresh()
    await seedKana(db)
    await gradeCard(db, 'hira:あ', Rating.Good)
    await seedKana(db)
    expect((await db.get('cards', 'hira:あ'))!.fsrs.state).not.toBe(State.New)
    expect(await db.count('cards')).toBe(KANA.length)
  })
  it('gradeCard updates the card and logs a review atomically', async () => {
    const db = await fresh()
    await seedKana(db)
    const updated = await gradeCard(db, 'hira:あ', Rating.Easy)
    expect(updated.fsrs.reps).toBe(1)
    expect((await db.get('cards', 'hira:あ'))!.fsrs.due).toEqual(updated.fsrs.due)
    const reviews = await db.getAllFromIndex('reviews', 'by-card', 'hira:あ')
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
    await gradeCard(db, 'hira:あ', Rating.Good, new Date('2026-03-09T12:00:00')) // yesterday
    await gradeCard(db, 'hira:い', Rating.Good, now)
    await gradeCard(db, 'hira:う', Rating.Again, now)
    await gradeCard(db, 'hira:い', Rating.Good, new Date('2026-03-10T12:30:00')) // repeat, not new
    expect(await newToday(db, new Date('2026-03-10T13:00:00'))).toBe(2)
  })
})
