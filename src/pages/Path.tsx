import { useEffect, useState } from 'react'
import type { Db } from '../db/db'
import { LESSONS, UNITS } from '../path/course'
import { currentLesson, dailyGoalProgress, getProgress, isUnlocked } from '../path/progress'
import { readBool, readInt, writeBool, writeInt } from '../settings'

const GOALS = [10, 20, 50]

export function Path({ db, onStart }: { db: Db; onStart: (lessonId: string) => void }) {
  const [p, setP] = useState<{ done: ReadonlySet<string>; streak: number; xpToday: number } | null>(null)
  const [goal, setGoal] = useState(() => readInt('nihongo.goal', 20))
  const [skipAhead, setSkipAhead] = useState(() => readBool('nihongo.skipAhead', false))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void getProgress(db).then((r) => live && setP(r)).catch((e) => live && setError(`Couldn't load your progress (${e}).`))
    return () => {
      live = false
    }
  }, [db])

  if (error) return <p role="alert" className="bad">{error}</p>
  if (!p) return <p>Loading…</p>
  const g = dailyGoalProgress(p.xpToday, goal)
  const current = currentLesson(LESSONS, p.done)

  return (
    <>
      <div className="card">
        <h2>Your path</h2>
        <p className="counts">{p.streak > 0 ? `🔥 ${p.streak}-day streak` : 'Start a streak today'}</p>
        <label className="grow">
          <span>Daily goal: {g.xp} / {g.goal} XP{g.met ? ' ✓' : ''}</span>
          <progress max={g.goal} value={Math.min(g.xp, g.goal)} aria-label="Daily goal" />
        </label>
        <label>
          Daily goal
          <select value={goal} onChange={(e) => { const v = Number(e.target.value); setGoal(v); writeInt('nihongo.goal', v) }}>
            {GOALS.map((x) => <option key={x} value={x}>{x} XP a day</option>)}
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={skipAhead} onChange={(e) => { setSkipAhead(e.target.checked); writeBool('nihongo.skipAhead', e.target.checked) }} />
          Let me choose any lesson
        </label>
        {current && <button className="primary" onClick={() => onStart(current.id)}>Continue: <span lang="ja">{current.title}</span></button>}
        {!current && <p>You finished the whole path. 🎉 Keep your memory sharp in Review.</p>}
      </div>
      {UNITS.map((u) => {
        const doneCount = u.lessons.filter((l) => p.done.has(l.id)).length
        return (
          <details key={u.id} className="card unit" open={current !== null && u.lessons.some((l) => l.id === current.id)}>
            <summary><strong>{u.title}</strong> <small>{doneCount}/{u.lessons.length}</small></summary>
            <p>{u.blurb}</p>
            <ul className="lessons">
              {u.lessons.map((l) => {
                const idx = LESSONS.indexOf(l)
                const open = isUnlocked(LESSONS, idx, p.done, skipAhead)
                const done = p.done.has(l.id)
                return (
                  <li key={l.id}>
                    <button disabled={!open} className={l === current ? 'primary' : ''} onClick={() => onStart(l.id)}>
                      <span lang="ja">{l.title}</span>
                      <small>{done ? '✓ Done · practise' : open ? 'Start' : '🔒 Locked'}</small>
                    </button>
                  </li>
                )
              })}
            </ul>
          </details>
        )
      })}
    </>
  )
}
