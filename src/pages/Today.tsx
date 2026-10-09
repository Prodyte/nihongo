import { useEffect, useState } from 'react'
import { reviewCounts, type Db } from '../db/db'
import { LESSONS } from '../path/course'
import { currentLesson, dailyGoalProgress, getProgress } from '../path/progress'
import { readGoal } from '../settings'

interface State { streak: number; xpToday: number; next: (typeof LESSONS)[number] | null; due: number; fresh: number }

/** The home screen: one obvious next step. Reviews come first (they are what keeps words in memory), then the next lesson. */
export function Today({ db, onReview, onLesson }: { db: Db; onReview: () => void; onLesson: (id: string) => void }) {
  const [s, setS] = useState<State | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void Promise.all([getProgress(db), reviewCounts(db, 'all', 'flashcard').catch(() => ({ due: 0, fresh: 0 }))]) // counts are a hint: never block the home screen
      .then(([p, c]) => live && setS({ streak: p.streak, xpToday: p.xpToday, next: currentLesson(LESSONS, p.done), ...c }))
      .catch((e) => live && setError(`Couldn't load your progress (${e}).`))
    return () => {
      live = false
    }
  }, [db])

  if (error) return <p role="alert" className="bad">{error}</p>
  if (!s) return <p>Loading…</p>
  const g = dailyGoalProgress(s.xpToday, readGoal())
  const reviews = s.due + s.fresh
  const reviewLabel = s.due ? `Review ${s.due} due${s.fresh ? ` + ${s.fresh} new` : ''}` : `Study ${s.fresh} new cards`
  const next = s.next
  const lesson = next && ([<>Next lesson: <span lang="ja">{next.title}</span></>, () => onLesson(next.id)] as const)
  const review = reviews > 0 && ([reviewLabel, onReview] as const)
  // reviews first while any are due (a new lesson only adds more to remember); otherwise the lesson leads
  const buttons = (s.due > 0 ? [review, lesson] : [lesson, review]).filter((b) => !!b)

  return (
    <>
      <section className="card hero">
        <h2>{g.met ? 'Goal met today ✓' : 'Today'}</h2>
        <p className="streak">{s.streak > 0 ? <><span aria-hidden="true">🔥</span> {s.streak}-day streak</> : 'Start a streak today'}</p>
        <label className="grow">
          <span>Daily goal: {g.xp} / {g.goal} XP</span>
          <progress max={g.goal} value={Math.min(g.xp, g.goal)} aria-label="Daily goal" />
        </label>
        {buttons.map(([label, go], i) => <button key={i} className={i === 0 ? 'primary big' : ''} onClick={go}>{label}</button>)}
        {!s.next && <p>You finished the whole path. 🎉{reviews ? '' : ' Nothing to review right now.'}</p>}
      </section>
    </>
  )
}
