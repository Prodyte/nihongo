// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exportBackup } from './db/backup'
import { deckTombs, deleteDeck, openDb, seedKana, setDeckTombs } from './db/db'
import { newFsrsCard } from './srs/scheduler'
import { exclusive, merge, switchAccount, sync, syncedUser } from './sync'

// a fake Supabase holding one progress row
const cloud = vi.hoisted(() => ({ row: null as unknown, user: 'u1' }))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getSession: async () => ({ data: { session: { user: { id: cloud.user, email: 'a@b.c' } } } }) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: cloud.row && { data: cloud.row }, error: null }) }) }),
      upsert: async ({ data }: { data: unknown }) => { cloud.row = data; return { error: null } },
    }),
  }),
}))
beforeEach(() => { localStorage.clear(); localStorage.setItem('sb-mlvhkclvuporivwznhcq-auth-token', '1'); cloud.row = null; cloud.user = 'u1' })

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
    expect(merge(s, s)).toEqual({ ...s, deletedDecks: [] })
  })
  it("a deck deleted on either side is dropped with its cards and their reviews; other decks' stay", () => {
    const side = (deletedDecks: string[]) => ({ cards: [{ ...card('a1', 1), deck: 'anki:1' }, card('v', 1)], reviews: [{ cardId: 'a1', at: '2026-01-01T00:00:00Z' }, { cardId: 'v', at: '2026-01-01T00:00:00Z' }], decks: [{ id: 'anki:1', name: 'A' }, { id: 'vocab', name: 'V' }], lessons: [], activity: [], deletedDecks })
    for (const m of [merge(side(['anki:1']), side([])), merge(side([]), side(['anki:1']))]) {
      expect(m.cards.map((c) => c.id)).toEqual(['v'])
      expect(m.reviews.map((r) => r.cardId)).toEqual(['v'])
      expect(m.decks.map((d) => d.id)).toEqual(['vocab'])
      expect(m.deletedDecks).toEqual(['anki:1'])
    }
  })
})

describe('sync', () => {
  it("no account row yet: pushes this device's data and reports no change", async () => {
    const db = await openDb('sync-first')
    await seedKana(db)
    expect(await sync(db)).toBe(false)
    expect((cloud.row as { cards: unknown[] }).cards).toHaveLength(JSON.parse(await exportBackup(db)).cards.length)
    expect(syncedUser()).toBe('u1')
  })
  it("a deck deleted here is deleted from the account's copy and stays deleted", async () => {
    const db = await openDb('sync-tombstone')
    await db.put('decks', { id: 'anki:1', name: 'A' })
    await db.put('cards', { id: 'a1', deck: 'anki:1', front: 'a', back: ['a'], fsrs: newFsrsCard() })
    await sync(db)
    expect((cloud.row as { decks: unknown[] }).decks).toHaveLength(1)
    await deleteDeck(db, 'anki:1')
    expect(deckTombs()).toEqual({ 'anki:1': true })
    await sync(db)
    expect(await db.getAll('decks')).toEqual([])
    expect(cloud.row).toMatchObject({ decks: [], deletedDecks: ['anki:1'] })
    expect(deckTombs()).toEqual({}) // the account remembers it now
    await db.put('decks', { id: 'anki:1', name: 'A' }) // imported again (saveImport marks it so)
    setDeckTombs({ 'anki:1': false })
    await sync(db)
    expect(cloud.row).toMatchObject({ decks: [{ id: 'anki:1' }], deletedDecks: [] })
  })
  it('another account signing in must choose: replace swaps in its progress (none: a fresh start), then syncs', async () => {
    const db = await openDb('sync-switch')
    await seedKana(db)
    await db.put('lessons', { id: 'l1', completedAt: new Date(), plays: 1, bestAccuracy: 1 })
    await sync(db)
    cloud.user = 'u2'
    cloud.row = null
    await expect(sync(db)).rejects.toThrow(/another account/)
    await switchAccount(db, true)
    expect(await sync(db)).toBe(false)
    expect(await db.count('lessons')).toBe(0)
    expect(await db.count('cards')).toBeGreaterThan(0) // kana seeded again
    expect(syncedUser()).toBe('u2')
  })
  it('a sync asked for during an exclusive step (a restore) is skipped, and syncs run again after it', async () => {
    const db = await openDb('sync-exclusive')
    let done = () => {}
    const step = exclusive(() => new Promise<void>((r) => { done = r }))
    expect(await Promise.race([sync(db), new Promise((r) => setTimeout(() => r('blocked'), 50))])).toBe('blocked')
    done()
    await step
    cloud.row = null
    expect(await sync(db)).toBe(false)
    expect(cloud.row).not.toBeNull() // this one really ran
  })
})
