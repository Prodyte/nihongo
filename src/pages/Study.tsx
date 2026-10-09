import { useCallback, useEffect, useRef, useState } from 'react'
import { Rating, type Grade } from 'ts-fsrs'
import { getCards, gradeCard, newToday, type Db, type StoredCard } from '../db/db'
import { Flashcard } from '../modes/Flashcard'
import { Quiz } from '../modes/Quiz'
import { Typing } from '../modes/Typing'
import { dueCards } from '../srs/scheduler'

export const DAILY_NEW = 20
export type Mode = 'flashcard' | 'typing' | 'quiz'
const MODES = { flashcard: Flashcard, typing: Typing, quiz: Quiz }

export function Study({ db, deck, mode, onExit }: { db: Db; deck: string; mode: Mode; onExit: () => void }) {
  const [pool, setPool] = useState<StoredCard[]>([])
  const [queue, setQueue] = useState<StoredCard[] | null>(null)
  const [reviewed, setReviewed] = useState(0)
  const busy = useRef(false)

  useEffect(() => {
    void (async () => {
      const cards = await getCards(db, deck)
      const left = Math.max(0, DAILY_NEW - (await newToday(db)))
      setPool(cards)
      setQueue(dueCards(cards, new Date(), left))
    })()
  }, [db, deck])

  const onGrade = useCallback(
    async (g: Grade) => {
      if (busy.current || !queue) return
      busy.current = true
      try {
        const updated = await gradeCard(db, queue[0].id, g)
        // Again: see it once more this session (FSRS also schedules it for later)
        setQueue((q) => [...q!.slice(1), ...(g === Rating.Again ? [updated] : [])])
        setReviewed((n) => n + 1)
      } finally {
        busy.current = false
      }
    },
    [db, queue],
  )

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
      <Current key={`${queue[0].id}:${reviewed}`} card={queue[0]} pool={pool} onGrade={onGrade} />
    </>
  )
}
