import { Loading } from '../Loading'
import { useEffect, useState } from 'react'
import { reviewCounts, type Db } from '../db/db'
import { Icon } from '../icons'
import { ITEMS, lessonKind, LESSONS, unitOf } from '../path/course'
import { coverage, currentLesson, dailyGoalProgress, getProgress, type LevelCoverage } from '../path/progress'
import { readGoal } from '../settings'
import { nextDue, until } from '../srs/stages'
import { Levels } from './Levels'

interface State { streak: number; xpToday: number; next: (typeof LESSONS)[number] | null; due: number; fresh: number; level: LevelCoverage; nextReview: string | null; hour: number }

const GREETING = (h: number) => (h < 11 ? ['おはよう', 'Good morning'] : h < 18 ? ['こんにちは', 'Good afternoon'] : ['こんばんは', 'Good evening'])

/** The home screen: one obvious next step. Reviews come first (they are what keeps words in memory), then the next lesson. */
export function Today({ db, onReview, onLesson }: { db: Db; onReview: () => void; onLesson: (id: string) => void }) {
  const [s, setS] = useState<State | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void Promise.all([getProgress(db), reviewCounts(db, 'all', 'flashcard').catch(() => ({ due: 0, fresh: 0 })), db.getAll('cards').catch(() => [])]) // counts are a hint: never block the home screen
      .then(([p, c, cards]) => {
        const now = new Date()
        const next = currentLesson(LESSONS, p.done)
        const levels = coverage(LESSONS, ITEMS, p.done)
        // the level you are working on: the next lesson's, or the first not yet complete
        const level = levels.find((l) => next?.id.startsWith(`n${l.level}-`)) ?? levels.find((l) => l.words[0] < l.words[1]) ?? levels[2]
        const nd = nextDue(cards, now)
        if (live) setS({ streak: p.streak, xpToday: p.xpToday, next, ...c, level, nextReview: nd && until(nd, now), hour: now.getHours() })
      })
      .catch((e) => live && setError(`Couldn't load your progress (${e}).`))
    return () => {
      live = false
    }
  }, [db])

  if (error) return <p role="alert" className="bad">{error}</p>
  if (!s) return <Loading />
  const g = dailyGoalProgress(s.xpToday, readGoal())
  const reviews = s.due + s.fresh
  const reviewFirst = s.due > 0 // a new lesson only adds more to remember
  const [hello, hi] = GREETING(s.hour)
  const kind = s.next && lessonKind(s.next)
  const unit = s.next && unitOf(s.next)

  const reviewCard = (
    <section className="card review-card" aria-label="Reviews">
      <div>
        <strong>{reviews ? `${s.due ? `${s.due} review${s.due === 1 ? '' : 's'} due` : ''}${s.due && s.fresh ? ' + ' : ''}${s.fresh ? `${s.fresh} new` : ''}` : 'All caught up'}</strong>
        <small>{reviews ? 'Spaced repetition keeps them in memory' : s.nextReview ? `Next review ${s.nextReview}` : 'Finish a lesson to start reviewing'}</small>
      </div>
      {reviews > 0 && <button className={reviewFirst ? 'primary' : ''} onClick={onReview}>Review</button>}
    </section>
  )

  return (
    <>
      <div className="greeting">
        <div>
          <h2 lang="ja">{hello}</h2>
          <p className="sub">{hi}{g.met ? ' · goal met today ✓' : ''}</p>
        </div>
        <div className="chips-row">
          <span className={`chip streak${s.streak ? '' : ' off'}`} title="Daily streak"><Icon name="flame" size={18} /> {s.streak}<span className="visually-hidden">-day streak</span></span>
          <span className="chip xp" title="XP today"><Icon name="star" size={18} /> {s.xpToday}<span className="visually-hidden"> XP today</span></span>
        </div>
      </div>
      <section className="card" aria-label="Daily goal">
        <div className="goal">
          <div className={`ring${g.met ? ' met' : ''}`} style={{ '--p': Math.round(g.fraction * 100) } as React.CSSProperties} aria-hidden="true">{g.met ? <Icon name="check" /> : `${Math.round(g.fraction * 100)}%`}</div>
          <div>
            <p><strong>Daily goal: {g.xp} / {g.goal} XP</strong></p>
            <p className="hint" style={{ textAlign: 'left' }}>{s.streak > 0 ? `${s.streak}-day streak. Keep it going!` : 'Start a streak today'}</p>
          </div>
        </div>
      </section>
      {reviewFirst && reviewCard}
      {s.next && kind ? (
        <section className="card next-card" aria-label="Up next">
          <p className="eyebrow">Up next</p>
          <div className="title">
            <span className={`badge k-${kind.kind}`} lang="ja" aria-hidden="true">{kind.glyph}</span>
            <div><strong lang="ja">{s.next.title}</strong><small>{unit && unit.title.startsWith(kind.label) ? unit.title : `${kind.label} · ${unit?.title}`}</small></div>
          </div>
          <button className={reviewFirst ? 'big' : 'primary big'} onClick={() => onLesson(s.next!.id)}>Next lesson: <span lang="ja">{s.next.title}</span></button>
        </section>
      ) : (
        <section className="card"><p>You finished the whole path. 🎉</p></section>
      )}
      {!reviewFirst && reviewCard}
      <section className="card form" aria-label="Level progress">
        <Levels levels={[s.level]} />
      </section>
    </>
  )
}
