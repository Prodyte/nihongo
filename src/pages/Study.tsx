import { useCallback, useEffect, useRef, useState } from 'react'
import { Rating, type Grade } from 'ts-fsrs'
import { gradeCard, newToday, studyCards, type Db, type StoredCard } from '../db/db'
import { Flashcard } from '../modes/Flashcard'
import { Quiz } from '../modes/Quiz'
import { Typing } from '../modes/Typing'
import { addReviewXp } from '../path/progress'
import { dueCards } from '../srs/scheduler'

export const DAILY_NEW = 20
export type Mode = 'flashcard' | 'typing' | 'quiz'
const MODES = { flashcard: Flashcard, typing: Typing, quiz: Quiz }

export function Study({ db, deck, mode, autoplay, onExit }: { db: Db; deck: string; mode: Mode; autoplay: boolean; onExit: () => void }) {
  const [pool, setPool] = useState<StoredCard[]>([])
  const [queue, setQueue] = useState<StoredCard[] | null>(null)
  const [reviewed, setReviewed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(false)

  useEffect(() => {
    let live = true
    void (async () => {
      const cards = await studyCards(db, deck, mode)
      const left = Math.max(0, DAILY_NEW - (await newToday(db)))
      if (!live) return
      setPool(cards)
      setQueue(dueCards(cards, new Date(), left))
    })().catch((e) => live && setError(String(e)))
    return () => {
      live = false
    }
  }, [db, deck, mode])

  const onGrade = useCallback(
    async (g: Grade) => {
      if (busy.current || !queue) return
      busy.current = true
      try {
        const updated = await gradeCard(db, queue[0].id, g)
        void addReviewXp(db).catch(() => {}) // best effort: XP must never block grading
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
    [db, queue],
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
  const Current = MODES[mode]
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
