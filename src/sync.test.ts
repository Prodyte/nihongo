import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { exportBackup } from './db/backup'
import { openDb, seedKana } from './db/db'
import { merge } from './sync'

const card = (id: string, reps: number, last?: string) => ({ id, deck: 'vocab', front: id, back: [id], fsrs: { reps, last_review: last } })

describe('merge', () => {
  it('keeps the more-reviewed card, every review once, lessons and activity from both sides', () => {
    const a = { cards: [card('x', 3), card('y', 1)], reviews: [{ id: 1, cardId: 'x', at: '2026-01-01T00:00:00Z' }], decks: [], lessons: [{ id: 'l1', completedAt: '2026-01-02T00:00:00Z', plays: 1, bestAccuracy: 0.5 }], activity: [{ date: '2026-01-01', xp: 10, lessons: 1 }] }
    const b = { cards: [card('x', 2), card('y', 4), card('z', 0)], reviews: [{ id: 1, cardId: 'x', at: '2026-01-01T00:00:00Z' }, { id: 2, cardId: 'y', at: '2026-01-03T00:00:00Z' }], decks: [{ id: 'anki:1', name: 'A' }], lessons: [{ id: 'l1', completedAt: '2026-01-01T00:00:00Z', plays: 2, bestAccuracy: 0.9 }, { id: 'l2', completedAt: '2026-01-03T00:00:00Z', plays: 1, bestAccuracy: 1 }], activity: [{ date: '2026-01-01', xp: 5, lessons: 2 }, { date: '2026-01-03', xp: 5, lessons: 1 }] }
    const m = merge(a, b)
    expect(Object.fromEntries(m.cards.map((c) => [c.id, c.fsrs.reps]))).toEqual({ x: 3, y: 4, z: 0 })
    expect(m.reviews).toEqual([{ cardId: 'x', at: '2026-01-01T00:00:00Z' }, { cardId: 'y', at: '2026-01-03T00:00:00Z' }])
    expect(m.decks).toHaveLength(1)
    expect(m.lessons).toEqual([{ id: 'l1', completedAt: '2026-01-01T00:00:00Z', plays: 2, bestAccuracy: 0.9 }, b.lessons[1]])
    expect(m.activity).toEqual([{ date: '2026-01-01', xp: 10, lessons: 2 }, b.activity[1]])
  })
  it('equal reps: the later review wins; merging a real snapshot with itself changes nothing but review ids', async () => {
    expect(merge({ cards: [card('x', 1, '2026-01-01')], reviews: [], decks: [], lessons: [], activity: [] }, { cards: [card('x', 1, '2026-02-01')], reviews: [], decks: [], lessons: [], activity: [] }).cards[0].fsrs.last_review).toBe('2026-02-01')
    const db = await openDb('sync-test')
    await seedKana(db)
    const s = JSON.parse(await exportBackup(db))
    expect(merge(s, s)).toEqual(s)
  })
})
