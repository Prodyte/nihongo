import { Loading } from '../Loading'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ExitButton } from '../icons'
import { Rating, type Grade } from 'ts-fsrs'
import { BUILTIN_DECKS, DAILY_NEW, gradeCard, newToday, studyCards, undoGrade, weakSpotReviews, type Db, type StoredCard } from '../db/db'
import { Cloze } from '../modes/Cloze'
import { Flashcard } from '../modes/Flashcard'
import { Quiz } from '../modes/Quiz'
import { Typing } from '../modes/Typing'
import { ITEMS, LESSONS } from '../path/course'
import { addReviewXp, currentLesson, getProgress } from '../path/progress'
import { dueCards } from '../srs/scheduler'
import { nextDue, until, weakSpots } from '../srs/stages'

export type Mode = 'flashcard' | 'typing' | 'quiz'
const MODES = { flashcard: Flashcard, typing: Typing, quiz: Quiz }

/** Deck id for "practise weak spots" (see weakSpots), drilled without changing their schedule. */
export const MISTAKES = 'mistakes'
const LEARN_AHEAD = 20 * 60_000

export function Study({ db, deck, mode, autoplay, onExit, onLesson }: { db: Db; deck: string; mode: Mode; autoplay: boolean; onExit: () => void; onLesson?: (id: string) => void }) {
  const practice = deck === MISTAKES
  const [pool, setPool] = useState<StoredCard[]>([])
  const [queue, setQueue] = useState<StoredCard[] | null>(null)
  const [total, setTotal] = useState(0) // cards in the session; a card shown again doesn't add to it
  const [log, setLog] = useState<{ id: string; g: Grade }[]>([]) // every grade, in order
  const [undo, setUndo] = useState<{ queue: StoredCard[]; card: StoredCard } | null>(null) // the last grade, to take back
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0) // Retry after a load error
  const [nextAt, setNextAt] = useState<string | null>(null) // "in 3 hours", for the end of the session
  const [nextLesson, setNextLesson] = useState<{ id: string; title: string } | null>(null) // the path's next step, after the reviews
  const busy = useRef(false)

  useEffect(() => {
    let live = true
    const start = (q: StoredCard[]) => {
      setQueue(q)
      setTotal(q.length)
    }
    void (async () => {
      const cards = await studyCards(db, practice ? 'all' : deck, mode)
      if (practice) {
        const now = new Date()
        const weak = weakSpots(await weakSpotReviews(db, cards, now), cards, now)
        if (!live) return
        const byId = new Map(cards.map((c) => [c.id, c]))
        setPool(cards)
        start(weak.flatMap((w) => byId.get(w.id) ?? [])) // weakest first
        return
      }
      const left = Math.max(0, DAILY_NEW - (await newToday(db)))
      if (!live) return
      setPool(cards)
      start(dueCards(cards, new Date(), left))
    })().catch((e) => {
      console.error(e)
      if (live) setError('Couldn’t load your cards.')
    })
    return () => {
      live = false
    }
  }, [db, deck, mode, practice, attempt])

  // the session is over: the next lesson is the next step, and when the next review comes (practice changes no
  // schedule, so it has no next review to tell). Both are hints: a failed read just leaves them out.
  const over = queue?.length === 0 // finished, or nothing was due
  useEffect(() => {
    if (!over) return
    let live = true
    if (onLesson)
      void getProgress(db).then((p) => {
        const l = currentLesson(LESSONS, p.done)
        if (live) setNextLesson(l && { id: l.id, title: l.title })
      }, () => {})
    if (!practice)
      void studyCards(db, deck, mode).then((cards) => {
        const now = new Date()
        const next = nextDue(cards, now)
        if (live) setNextAt(next && until(next, now))
      }, () => {})
    return () => {
      live = false
    }
  }, [over, practice, db, deck, mode, onLesson])

  const onGrade = useCallback(
    async (g: Grade) => {
      if (busy.current || !queue) return
      busy.current = true
      try {
        // practice drills without touching the schedule (the cards keep their real reviews)
        const updated = practice ? queue[0] : await gradeCard(db, queue[0].id, g)
        if (!practice) void addReviewXp(db).catch(() => {}) // best effort: XP must never block grading. ponytail: undo keeps the XP
        // Again, or a learning step due within 20 min (Anki's learn-ahead limit): see it again after the rest. Practice
        // never reschedules, so only Again repeats there; elsewhere Good/Easy eventually graduate it past the window.
        const again = g === Rating.Again || (!practice && updated.fsrs.due.getTime() - Date.now() <= LEARN_AHEAD)
        setUndo({ queue, card: queue[0] })
        setQueue([...queue.slice(1), ...(again ? [updated] : [])])
        setLog((l) => [...l, { id: queue[0].id, g }])
        setError(null)
      } catch (e) {
        console.error(e)
        setError('Couldn’t save that answer. Try again.')
      } finally {
        busy.current = false
      }
    },
    [db, queue, practice],
  )

  const onUndo = useCallback(async () => {
    if (busy.current || !undo) return
    busy.current = true
    try {
      if (!practice) await undoGrade(db, undo.card)
      setQueue(undo.queue)
      setLog((l) => l.slice(0, -1))
      setUndo(null)
      setError(null)
    } catch (e) {
      console.error(e)
      setError('Couldn’t undo that answer.')
    } finally {
      busy.current = false
    }
  }, [db, undo, practice])

  // Esc leaves; Ctrl/Cmd+Z takes back the last grade (not while typing an answer: there it undoes the typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement
      if (e.key === 'Escape' && !typing) onExit() // in an answer field, Esc is the field's
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault()
        void onUndo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit, onUndo])

  const undoBtn = undo && <button type="button" className="ghost undo" onClick={() => void onUndo()}>Undo</button>
  if (!queue)
    return (
      <div className="lesson">
        <div className="bar"><ExitButton onClick={onExit} /></div>
        {error ? (
          <div className="card">
            <p role="alert">{error}</p>
            <button className="primary" onClick={() => { setError(null); setAttempt((n) => n + 1) }}>Try again</button>
          </div>
        ) : <Loading />}
      </div>
    )
  if (!queue.length) {
    const firsts = new Map<string, Grade>()
    for (const { id, g } of log) if (!firsts.has(id)) firsts.set(id, g)
    const remembered = [...firsts.values()].filter((g) => g !== Rating.Again).length
    return (
      <div className="lesson">
      <div className="card done-card">
        {/* focused on arrival, so a screen reader says the session is over */}
        <h2 tabIndex={-1} ref={(h) => h?.focus()}>{log.length ? <>Session complete <span aria-hidden="true">🎉</span></> : 'Nothing due right now'}</h2>
        {log.length > 0 && <p className="summary">{firsts.size} {firsts.size === 1 ? 'card' : 'cards'} · {remembered} remembered first time</p>}
        {nextAt && <p className="summary">Next review {nextAt}.</p>}
        {error && <p role="alert" className="bad">{error}</p>}
        <div className="actions">
          {nextLesson && onLesson && <button className="primary big" onClick={() => onLesson(nextLesson.id)}>Next lesson: <span lang="ja">{nextLesson.title}</span></button>}
          <button className={nextLesson && onLesson ? undefined : 'primary'} onClick={onExit}>Done</button>
          {undoBtn}
        </div>
      </div>
      </div>
    )
  }
  const Current = queue[0].deck === BUILTIN_DECKS.sentence.id && ITEMS.has(queue[0].id) ? Cloze : MODES[mode] // grammar is always fill-the-gap
  // "left" counts cards not yet answered; a card back for another go within minutes is counted apart, so Good moves the count
  const seen = new Set(log.map((l) => l.id))
  const fresh = queue.filter((c) => !seen.has(c.id)).length
  return (
    <div className="lesson">
      <div className="bar">
        <ExitButton onClick={onExit} />
        <progress value={total - fresh} max={total || 1} aria-label="Cards answered" />
        {undoBtn}
        <span className="left">{fresh} left{queue.length > fresh && ` · ${queue.length - fresh} again`}</span>
      </div>
      {practice && <p className="hint practice-note">Practice: your schedule won’t change.</p>}
      {error && <p role="alert" className="bad">{error}</p>}
      <Current key={`${queue[0].id}:${log.length}`} db={db} autoplay={autoplay} card={queue[0]} pool={pool} onGrade={onGrade} practice={practice} />
    </div>
  )
}
