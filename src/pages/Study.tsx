import { useCallback, useEffect, useRef, useState } from 'react'
import { Rating, type Grade } from 'ts-fsrs'
import { BUILTIN_DECKS, DAILY_NEW, gradeCard, newToday, studyCards, type Db, type StoredCard } from '../db/db'
import { Cloze } from '../modes/Cloze'
import { Flashcard } from '../modes/Flashcard'
import { Quiz } from '../modes/Quiz'
import { Typing } from '../modes/Typing'
import { ITEMS } from '../path/course'
import { addReviewXp } from '../path/progress'
import { shuffle } from '../modes/choices'
import { dueCards } from '../srs/scheduler'
import { mistakes } from '../srs/stages'

export type Mode = 'flashcard' | 'typing' | 'quiz'
const MODES = { flashcard: Flashcard, typing: Typing, quiz: Quiz }

/** Deck id for "practise mistakes": recent misses and leeches, drilled without changing their schedule. */
export const MISTAKES = 'mistakes'

export function Study({ db, deck, mode, autoplay, onExit }: { db: Db; deck: string; mode: Mode; autoplay: boolean; onExit: () => void }) {
  const practice = deck === MISTAKES
  const [pool, setPool] = useState<StoredCard[]>([])
  const [queue, setQueue] = useState<StoredCard[] | null>(null)
  const [reviewed, setReviewed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(false)

  useEffect(() => {
    let live = true
    void (async () => {
      const cards = await studyCards(db, practice ? 'all' : deck, mode)
      if (practice) {
        const missed = mistakes(await db.getAll('reviews'), cards, new Date())
        if (!live) return
        setPool(cards)
        setQueue(shuffle(cards.filter((c) => missed.has(c.id)), Math.random))
        return
      }
      const left = Math.max(0, DAILY_NEW - (await newToday(db)))
      if (!live) return
      setPool(cards)
      setQueue(dueCards(cards, new Date(), left))
    })().catch((e) => live && setError(String(e)))
    return () => {
      live = false
    }
  }, [db, deck, mode, practice])

  const onGrade = useCallback(
    async (g: Grade) => {
      if (busy.current || !queue) return
      busy.current = true
      try {
        // practice drills without touching the schedule (the cards keep their real reviews)
        const updated = practice ? queue[0] : await gradeCard(db, queue[0].id, g)
        if (!practice) void addReviewXp(db).catch(() => {}) // best effort: XP must never block grading
        // Again: see it once more this session (FSRS also schedules it for later)
        setQueue((q) => [...q!.slice(1), ...(g === Rating.Again ? [updated] : [])])
        setReviewed((n) => n + 1)
        setError(null)
      } catch (e) {
        setError(`Couldn't save that answer (${e}). Try again.`)
      } finally {
        busy.current = false
      }
    },
    [db, queue, practice],
  )

  if (error && !queue) return <p role="alert">{error}</p>
  if (!queue) return <p>Loading…</p>
  if (!queue.length)
    return (
      <div className="card">
        <h2>{reviewed ? 'Session complete 🎉' : 'Nothing due right now'}</h2>
        <p>{reviewed} reviews this session.</p>
        <button className="primary" onClick={onExit}>Back</button>
      </div>
    )
  const Current = queue[0].deck === BUILTIN_DECKS.sentence.id && ITEMS.has(queue[0].id) ? Cloze : MODES[mode] // grammar is always fill-the-gap
  return (
    <>
      <div className="bar">
        <button onClick={onExit}>← Exit</button>
        <span>{queue.length} left</span>
      </div>
      {error && <p role="alert" className="bad">{error}</p>}
      <Current key={`${queue[0].id}:${reviewed}`} db={db} autoplay={autoplay} card={queue[0]} pool={pool} onGrade={onGrade} />
    </>
  )
}
