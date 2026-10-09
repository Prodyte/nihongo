import 'fake-indexeddb/auto'
import { Rating } from 'ts-fsrs'
import { describe, expect, it } from 'vitest'
import { BackupError, exportBackup, importBackup } from './backup'
import { gradeCard, openDb, seedKana } from './db'
import { ITEMS, lessonById } from '../path/course'
import { completeLesson } from '../path/progress'

let n = 0
const fresh = () => openDb(`backup-${n++}`)

const okFsrs = { due: '2026-01-01T00:00:00Z', stability: 1, difficulty: 1, scheduled_days: 0, learning_steps: 0, reps: 0, lapses: 0, elapsed_days: 0, state: 0 }

async function populated() {
  const db = await fresh()
  await seedKana(db)
  await db.put('decks', { id: 'anki:1', name: 'Deck' })
  await gradeCard(db, 'hira:あ', Rating.Good, new Date('2026-03-01T10:00:00Z'))
  await gradeCard(db, 'hira:あ', Rating.Again, new Date('2026-03-05T10:00:00Z'))
  await gradeCard(db, 'kata:ア', Rating.Easy, new Date('2026-03-02T10:00:00Z'))
  return db
}

describe('backup', () => {
  it('round-trips cards, reviews and decks, including Dates', async () => {
    const src = await populated()
    const text = await exportBackup(src)
    const dst = await fresh()
    expect(await importBackup(dst, text)).toEqual({ cards: 208, reviews: 3, decks: 1, lessons: 0 })
    expect(await dst.getAll('cards')).toEqual(await src.getAll('cards'))
    expect(await dst.getAll('reviews')).toEqual(await src.getAll('reviews'))
    const c = (await dst.get('cards', 'hira:あ'))!
    expect(c.fsrs.due).toBeInstanceOf(Date)
    expect(c.fsrs.last_review).toBeInstanceOf(Date)
  })
  it('restore replaces existing data and keeps working (grading after restore)', async () => {
    const text = await exportBackup(await populated())
    const dst = await fresh()
    await seedKana(dst)
    await gradeCard(dst, 'hira:い', Rating.Good) // progress that the backup does not have
    await importBackup(dst, text)
    expect((await dst.get('cards', 'hira:い'))!.fsrs.reps).toBe(0)
    await expect(gradeCard(dst, 'hira:あ', Rating.Good)).resolves.toBeTruthy()
  })
  it('re-seeds the built-in kana when the backup lacks them, keeping the backup\'s own cards', async () => {
    const dst = await fresh()
    const text = JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'anki:1:1', deck: 'anki:1', front: 'f', back: ['b'], html: true, fsrs: okFsrs }] })
    await importBackup(dst, text)
    expect(await dst.count('cards')).toBe(209)
    expect(await dst.get('cards', 'anki:1:1')).toBeTruthy()
  })
  it('v2 round-trips lesson progress and daily activity with Dates', async () => {
    const src = await populated()
    await completeLesson(src, lessonById('greetings-1')!, ITEMS, {}, 1, new Date('2026-03-04T09:00:00'))
    const dst = await fresh()
    expect(await importBackup(dst, await exportBackup(src))).toMatchObject({ lessons: 1 })
    expect(await dst.getAll('lessons')).toEqual(await src.getAll('lessons'))
    expect(await dst.getAll('activity')).toEqual(await src.getAll('activity'))
    expect((await dst.get('lessons', 'greetings-1'))!.completedAt).toBeInstanceOf(Date)
    expect(await dst.count('cards')).toBe(208 + 6) // the six vocabulary cards come back too
  })
  it('a v1 backup still restores, and resets lesson progress (v1 had none)', async () => {
    const dst = await fresh()
    await completeLesson(dst, lessonById('greetings-1')!, ITEMS, {}, 1)
    const v1 = JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'anki:1:1', deck: 'anki:1', front: 'f', back: ['b'], html: true, fsrs: okFsrs }] })
    await importBackup(dst, v1)
    expect(await dst.count('lessons')).toBe(0)
    expect(await dst.count('activity')).toBe(0)
    expect(await dst.get('cards', 'anki:1:1')).toBeTruthy()
  })
  it.each([
    ['not json', 'nope'],
    ['wrong app', JSON.stringify({ app: 'other', version: 1 })],
    ['wrong version', JSON.stringify({ app: 'nihongo', version: 99, cards: [], reviews: [], decks: [] })],
    ['missing arrays', JSON.stringify({ app: 'nihongo', version: 1 })],
    ['bad card', JSON.stringify({ app: 'nihongo', version: 1, cards: [{ id: 1 }], reviews: [], decks: [] })],
    ['bad scheduling number', JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'a', deck: 'd', front: 'f', back: [], fsrs: { ...okFsrs, stability: 'x' } }] })],
    ['bad state', JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'a', deck: 'd', front: 'f', back: [], fsrs: { ...okFsrs, state: 9 } }] })],
    ['duplicate ids', JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'a', deck: 'd', front: 'f', back: [], fsrs: okFsrs }, { id: 'a', deck: 'd', front: 'f', back: [], fsrs: okFsrs }] })],
    ['v2 without lessons', JSON.stringify({ app: 'nihongo', version: 2, cards: [], reviews: [], decks: [], activity: [] })],
    ['bad lesson record', JSON.stringify({ app: 'nihongo', version: 2, cards: [], reviews: [], decks: [], activity: [], lessons: [{ id: 'x', completedAt: '2026-01-01T00:00:00Z', plays: 'many', bestAccuracy: 1 }] })],
    ['bad activity date', JSON.stringify({ app: 'nihongo', version: 2, cards: [], reviews: [], decks: [], lessons: [], activity: [{ date: 'yesterday', xp: 5, lessons: 1 }] })],
    ['bad date', JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'a', deck: 'd', front: 'f', back: [], fsrs: { ...okFsrs, due: 'tomorrow' } }] })],
  ])('rejects %s without touching existing data', async (_, text) => {
    const db = await populated()
    const before = await db.getAll('cards')
    await expect(importBackup(db, text)).rejects.toBeInstanceOf(BackupError)
    expect(await db.getAll('cards')).toEqual(before)
    expect(await db.count('reviews')).toBe(3)
  })
})
