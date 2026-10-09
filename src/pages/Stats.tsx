import { useEffect, useState } from 'react'
import { Rating } from 'ts-fsrs'
import type { Db } from '../db/db'
import { ITEMS, LESSONS } from '../path/course'
import { coverage, dayKey, getProgress, type LevelCoverage } from '../path/progress'
import { forecast, isLeech, stage, STAGES, type Stage } from '../srs/stages'
import { Levels } from './Levels'

interface S {
  stages: Record<Stage, number>
  leeches: number
  total: number
  correct: number
  today: number
  levels: LevelCoverage[]
  ahead: { day: string; count: number }[]
  days: Map<string, number> // date -> XP
}

const WEEKS = 18
const STAGE_HINT: Record<Stage, string> = { Apprentice: 'under a week', Guru: 'up to a month', Master: 'up to six months', Burned: 'six months or more' }

export function Stats({ db }: { db: Db }) {
  const [s, setS] = useState<S | null>(null)
  const [now] = useState(() => new Date())
  useEffect(() => {
    void (async () => {
      const [cards, reviews, activity, p] = await Promise.all([db.getAll('cards'), db.getAll('reviews'), db.getAll('activity'), getProgress(db)])
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const stages = Object.fromEntries(STAGES.map((x) => [x, 0])) as Record<Stage, number>
      for (const c of cards) { const st = stage(c.fsrs); if (st) stages[st]++ }
      setS({
        stages,
        leeches: cards.filter((c) => isLeech(c.fsrs)).length,
        total: reviews.length,
        correct: reviews.filter((r) => r.grade !== Rating.Again).length,
        today: reviews.filter((r) => r.at >= start).length,
        levels: coverage(LESSONS, ITEMS, p.done),
        ahead: forecast(cards, now),
        days: new Map(activity.map((a) => [a.date, a.xp])),
      })
    })()
  }, [db, now])
  if (!s) return <p>Loading…</p>
  const peak = Math.max(1, ...s.ahead.map((d) => d.count))
  return (
    <>
      <div className="card form">
        <h2>JLPT progress</h2>
        <Levels levels={s.levels} />
      </div>
      <div className="card form">
        <h2>Your cards</h2>
        <ul className="stages">
          {STAGES.map((st) => (
            <li key={st} className={`stage ${st.toLowerCase()}`}>
              <strong>{s.stages[st]}</strong>
              <span>{st}</span>
              <small>remembered {STAGE_HINT[st]}</small>
            </li>
          ))}
        </ul>
        {s.leeches > 0 && <p className="hint">{s.leeches} card{s.leeches === 1 ? '' : 's'} you keep forgetting (leeches): drill them with “Practise mistakes” in Review.</p>}
      </div>
      <div className="card form">
        <h2>Coming up</h2>
        <ol className="forecast" aria-label="Reviews due in the next 7 days">
          {s.ahead.map((d, i) => (
            <li key={d.day}>
              <span className="bar" style={{ height: `${(d.count / peak) * 100}%` }} />
              <strong>{d.count}</strong>
              <small>{i === 0 ? 'Today' : i === 1 ? 'Tmrw' : new Date(`${d.day}T00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</small>
            </li>
          ))}
        </ol>
      </div>
      <div className="card form">
        <h2>Activity</h2>
        <Heatmap days={s.days} now={now} />
        <dl>
          <dt>Reviews today</dt><dd>{s.today}</dd>
          <dt>Accuracy (all time)</dt><dd>{s.total ? `${Math.round((100 * s.correct) / s.total)}%` : '–'}</dd>
        </dl>
      </div>
    </>
  )
}

/** The last 18 weeks, one square per day, darker for more XP (like a GitHub contribution graph). */
function Heatmap({ days, now }: { days: Map<string, number>; now: Date }) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const first = new Date(today)
  first.setDate(first.getDate() - first.getDay() - (WEEKS - 1) * 7) // a Sunday, WEEKS weeks back
  const cells: { key: string; xp: number; future: boolean }[] = []
  for (const d = new Date(first); cells.length < WEEKS * 7; d.setDate(d.getDate() + 1)) cells.push({ key: dayKey(d), xp: days.get(dayKey(d)) ?? 0, future: d > today })
  const active = cells.filter((c) => c.xp > 0).length
  const level = (xp: number) => (xp === 0 ? 0 : xp < 10 ? 1 : xp < 20 ? 2 : xp < 50 ? 3 : 4)
  return (
    <div className="heatmap" role="img" aria-label={`Active on ${active} of the last ${WEEKS * 7} days`}>
      {cells.map((c) => <span key={c.key} className={c.future ? 'future' : `l${level(c.xp)}`} title={`${c.key}: ${c.xp} XP`} />)}
    </div>
  )
}
