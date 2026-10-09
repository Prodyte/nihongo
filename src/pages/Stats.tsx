import { useEffect, useState } from 'react'
import { Rating, State } from 'ts-fsrs'
import type { Db } from '../db/db'

export function Stats({ db }: { db: Db }) {
  const [s, setS] = useState<{ byState: number[]; total: number; correct: number; today: number } | null>(null)
  useEffect(() => {
    void (async () => {
      const [cards, reviews] = await Promise.all([db.getAll('cards'), db.getAll('reviews')])
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const byState = [0, 0, 0, 0]
      cards.forEach((c) => byState[c.fsrs.state]++)
      setS({
        byState,
        total: reviews.length,
        correct: reviews.filter((r) => r.grade !== Rating.Again).length,
        today: reviews.filter((r) => r.at >= start).length,
      })
    })()
  }, [db])
  if (!s) return <p>Loading…</p>
  return (
    <div className="card">
      <h2>Stats</h2>
      <dl>
        <dt>Reviews today</dt><dd>{s.today}</dd>
        <dt>Accuracy (all time)</dt><dd>{s.total ? `${Math.round((100 * s.correct) / s.total)}%` : '–'}</dd>
        <dt>New</dt><dd>{s.byState[State.New]}</dd>
        <dt>Learning</dt><dd>{s.byState[State.Learning] + s.byState[State.Relearning]}</dd>
        <dt>Review</dt><dd>{s.byState[State.Review]}</dd>
      </dl>
    </div>
  )
}
