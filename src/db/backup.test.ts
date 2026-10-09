import 'fake-indexeddb/auto'
import { Rating } from 'ts-fsrs'
import { describe, expect, it } from 'vitest'
import { BackupError, exportBackup, importBackup } from './backup'
import { gradeCard, openDb, seedKana } from './db'

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
    expect(await importBackup(dst, text)).toEqual({ cards: 208, reviews: 3, decks: 1 })
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
  it.each([
    ['not json', 'nope'],
    ['wrong app', JSON.stringify({ app: 'other', version: 1 })],
    ['wrong version', JSON.stringify({ app: 'nihongo', version: 99, cards: [], reviews: [], decks: [] })],
    ['missing arrays', JSON.stringify({ app: 'nihongo', version: 1 })],
    ['bad card', JSON.stringify({ app: 'nihongo', version: 1, cards: [{ id: 1 }], reviews: [], decks: [] })],
    ['bad scheduling number', JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'a', deck: 'd', front: 'f', back: [], fsrs: { ...okFsrs, stability: 'x' } }] })],
    ['bad state', JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'a', deck: 'd', front: 'f', back: [], fsrs: { ...okFsrs, state: 9 } }] })],
    ['duplicate ids', JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'a', deck: 'd', front: 'f', back: [], fsrs: okFsrs }, { id: 'a', deck: 'd', front: 'f', back: [], fsrs: okFsrs }] })],
    ['bad date', JSON.stringify({ app: 'nihongo', version: 1, reviews: [], decks: [], cards: [{ id: 'a', deck: 'd', front: 'f', back: [], fsrs: { ...okFsrs, due: 'tomorrow' } }] })],
  ])('rejects %s without touching existing data', async (_, text) => {
    const db = await populated()
    const before = await db.getAll('cards')
    await expect(importBackup(db, text)).rejects.toBeInstanceOf(BackupError)
    expect(await db.getAll('cards')).toEqual(before)
    expect(await db.count('reviews')).toBe(3)
  })
})
