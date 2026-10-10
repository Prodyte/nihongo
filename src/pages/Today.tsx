import { Loading } from '../Loading'
import { useEffect, useState } from 'react'
import { reviewCounts, type Db } from '../db/db'
import { Icon } from '../icons'
import { ITEMS, lessonKind, LESSONS, unitOf } from '../path/course'
import { coverage, currentLesson, getProgress, type LevelCoverage } from '../path/progress'
import { nextDue, until } from '../srs/stages'
import { Levels } from './Levels'

interface State { streak: number; xpToday: number; week: { day: Date; on: boolean }[]; next: (typeof LESSONS)[number] | null; due: number; fresh: number; level: LevelCoverage; nextReview: string | null; hour: number }

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
        if (live) setS({ streak: p.streak, xpToday: p.xpToday, week: p.week, next, ...c, level, nextReview: nd && until(nd, now), hour: now.getHours() })
      })
      .catch((e) => live && setError(`Couldn't load your progress (${e}).`))
    return () => {
      live = false
    }
  }, [db])

  if (error) return <p role="alert" className="bad">{error}</p>
  if (!s) return <Loading />
  const today = s.xpToday > 0 // studied today: the streak is safe
  const reviews = s.due + s.fresh
  const reviewFirst = s.due > 0 // a new lesson only adds more to remember
  const [hello, hi] = GREETING(s.hour)
  const kind = s.next && lessonKind(s.next)
  const unit = s.next && unitOf(s.next)

  const reviewCard = (
    <section className={`card review-card${reviewFirst ? ' due' : ''}`} aria-label="Reviews">
      <span className="review-count" aria-hidden="true">{reviews ? <strong>{reviews}</strong> : <Icon name="check" size={26} />}</span>
      <div className="review-text">
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
          <p className="sub">{hi}</p>
        </div>
      </div>
      <section className="card streak-card" aria-label="Streak">
        <div className="goal">
          <div className={`streak-badge${s.streak ? '' : ' off'}`} aria-hidden="true"><Icon name="flame" size={28} /></div>
          <div>
            <p><strong>{s.streak ? `${s.streak}-day streak` : 'No streak yet'}</strong></p>
            <p className="hint left">{today ? 'Done for today. See you tomorrow.' : s.streak ? 'Do a lesson or a review today to keep it going.' : 'Do a lesson or a review to start one.'}</p>
          </div>
        </div>
        <ol className="week" aria-label="The last seven days">
          {s.week.map((d, i) => {
            const name = d.day.toLocaleDateString(undefined, { weekday: 'short' })
            return (
              <li key={i} className={`${d.on ? 'on' : ''}${i === 6 ? ' today' : ''}`}>
                <span className="dot" aria-hidden="true">{d.on && <Icon name="check" size={16} />}</span>
                <small aria-hidden="true">{i === 6 ? 'Today' : name.slice(0, 2)}</small>
                <span className="visually-hidden">{i === 6 ? 'Today' : name}: {d.on ? 'studied' : 'not studied'}</span>
              </li>
            )
          })}
        </ol>
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
        <section className="card"><p>You finished the whole path. Well done!</p></section>
      )}
      {!reviewFirst && reviewCard}
      <section className="card form" aria-label="Level progress">
        <Levels levels={[s.level]} />
      </section>
    </>
  )
}
