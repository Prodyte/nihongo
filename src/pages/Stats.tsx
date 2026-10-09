import { useEffect, useState } from 'react'
import { Rating, State } from 'ts-fsrs'
import type { Db } from '../db/db'
import { ITEMS, LESSONS } from '../path/course'
import { stateOf } from '../path/lookup'
import { coverage, getProgress, type LevelCoverage } from '../path/progress'
import { Levels } from './Levels'

interface S { byState: number[]; known: number; total: number; correct: number; today: number; levels: LevelCoverage[] }

export function Stats({ db }: { db: Db }) {
  const [s, setS] = useState<S | null>(null)
  useEffect(() => {
    void (async () => {
      const [cards, reviews, p] = await Promise.all([db.getAll('cards'), db.getAll('reviews'), getProgress(db)])
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const byState = [0, 0, 0, 0]
      cards.forEach((c) => byState[c.fsrs.state]++)
      setS({
        byState,
        known: cards.filter((c) => stateOf(c.fsrs) === 'known').length,
        total: reviews.length,
        correct: reviews.filter((r) => r.grade !== Rating.Again).length,
        today: reviews.filter((r) => r.at >= start).length,
        levels: coverage(LESSONS, ITEMS, p.done),
      })
    })()
  }, [db])
  if (!s) return <p>Loading…</p>
  return (
    <>
      <div className="card form">
        <h2>JLPT progress</h2>
        <Levels levels={s.levels} />
      </div>
      <div className="card form">
        <h2>Reviews</h2>
        <dl>
          <dt>Reviews today</dt><dd>{s.today}</dd>
          <dt>Accuracy (all time)</dt><dd>{s.total ? `${Math.round((100 * s.correct) / s.total)}%` : '–'}</dd>
          <dt>Learning</dt><dd>{s.byState[State.Learning] + s.byState[State.Relearning] + s.byState[State.Review] - s.known}</dd>
          <dt>Known (remembered for 3+ weeks)</dt><dd>{s.known}</dd>
        </dl>
      </div>
    </>
  )
}
