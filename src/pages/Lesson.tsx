import { Loading } from '../Loading'
import { useEffect, useRef, useState } from 'react'
import { useJaVoice } from '../audio'
import { canRecognise } from '../speech'
import { readBool } from '../settings'
import { sfx } from '../sfx'
import { ExitButton } from '../icons'
import { ExerciseView } from '../path/ui/ExerciseView'
import { reviewCounts, type Db } from '../db/db'
import { ITEMS, LESSONS, type Lesson as LessonT } from '../path/course'
import { accuracy, advance, buildLesson, startRun, type Exercise, type RunState } from '../path/lesson'
import { completeLesson, getProgress, learnedItems } from '../path/progress'

interface Summary { xp: number; first: boolean; accuracy: number; streak: number | null; due: number } // streak null: the lesson saved but the streak could not be read

// A lesson under way is kept on this device, so leaving it loses nothing (a stray tap on ✕, the back gesture, the phone
// closing the app in the background): opening the lesson again carries on from the same exercise. One lesson, for a day.
const SAVED = 'nihongo.lesson'
const SAVED_V = 1 // bump when the shape of Exercise or RunState changes: an older saved run is then dropped, not shown
const known = (e: Exercise) => (e.type === 'match' ? e.pairs.every((p) => ITEMS.has(p.id)) : e.type === 'explain' || ITEMS.has(e.item.id))
function savedRun(id: string): { run: RunState; step: number } | null {
  try {
    const s = JSON.parse(localStorage.getItem(SAVED) ?? 'null')
    const ok = s?.v === SAVED_V && s.id === id && Date.now() - s.at < 86400000 && Array.isArray(s.run?.queue) && s.run.queue.length > 0 && s.run.queue.every(known)
    return ok ? { run: s.run, step: s.step } : null
  } catch {
    return null // blocked storage, or something else's data under the key
  }
}
function keepRun(id: string, run: RunState | null, step: number) {
  try {
    if (run?.queue.length) localStorage.setItem(SAVED, JSON.stringify({ v: SAVED_V, id, at: Date.now(), run, step }))
    else localStorage.removeItem(SAVED)
  } catch { /* the lesson just won't be resumable */ }
}

export function Lesson({ db, lesson, autoplay, onExit, onStart, onReview }: { db: Db; lesson: LessonT; autoplay: boolean; onExit: () => void; onStart: (id: string) => void; onReview?: () => void }) {
  const [canSpeak] = useState(useJaVoice()) // snapshot: a voice appearing later must not reshuffle a lesson in progress
  const [canListen] = useState(() => canRecognise() && readBool('nihongo.speaking', true))
  const [canWrite] = useState(() => readBool('nihongo.writing', true))
  const [saved] = useState(() => savedRun(lesson.id)) // this lesson, left part-way
  const [run, setRun] = useState<RunState | null>(saved?.run ?? null)
  const [step, setStep] = useState(saved?.step ?? 0)
  const [resumed, setResumed] = useState(!!saved) // say so until the next answer: the progress bar starts part-filled
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0) // bump to retry saving
  const saving = useRef(false)

  // Build the exercises once, knowing which items earlier lessons already taught (unless a run was left part-way).
  useEffect(() => {
    if (saved) return
    let live = true
    void getProgress(db)
      .then((p) => live && setRun(startRun(buildLesson(lesson, ITEMS, { canSpeak, canListen, canWrite, learned: learnedItems(LESSONS, p.done) }))))
      .catch((e) => live && setError(`Couldn't open this lesson (${e}).`))
    return () => {
      live = false
    }
  }, [db, lesson, canSpeak, canListen, canWrite, saved])

  // Kept from the first answer on, and dropped with the last one (saving to the database takes over from there).
  useEffect(() => {
    if (run && (step > 0 || !run.queue.length)) keepRun(lesson.id, run, step)
  }, [lesson.id, run, step])

  // Save once the last exercise is done. A failed save keeps the run so nothing is lost; "Try again" retries.
  useEffect(() => {
    if (!run || run.queue.length > 0 || summary || saving.current) return
    saving.current = true
    void completeLesson(db, lesson, ITEMS, run.misses, accuracy(run))
      .then(
        async (r) => {
          // Saved. Reading the streak is cosmetic and must never reach the retry path below (it would award XP twice).
          // So is the count of reviews due: with some waiting, they are the next step, before another lesson adds more.
          const [streak, due] = await Promise.all([getProgress(db).then((p) => p.streak, () => null), reviewCounts(db, 'all', 'flashcard').then((c) => c.due, () => 0)])
          setSummary({ xp: r.xp, first: r.first, accuracy: accuracy(run), streak, due })
          sfx('done')
        },
        (e) => setError(`Couldn't save your progress (${e}).`),
      )
      .finally(() => { saving.current = false })
  }, [db, lesson, run, summary, attempt])

  if (error) return (
    <div className="card">
      <p role="alert" className="bad">{error}</p>
      {run && run.queue.length === 0 && <button className="primary" onClick={() => { setError(null); setAttempt((a) => a + 1) }}>Try again</button>}
      <button onClick={onExit}>Back</button>
    </div>
  )
  if (!run) return <><div className="bar"><ExitButton onClick={onExit} /></div><Loading /></> // never a dead end, even if loading hangs

  if (summary) {
    const idx = LESSONS.findIndex((l) => l.id === lesson.id)
    const next = LESSONS[idx + 1]
    const pct = Math.round(summary.accuracy * 100)
    const review = summary.due > 0 && onReview
    return (
      <div className="card done-card">
        <Confetti />
        <p className="eyebrow">{summary.first ? 'Lesson complete' : 'Practice complete'}</p>
        <h2>{pct === 100 ? 'Perfect!' : pct >= 80 ? 'Great work!' : 'Nice effort!'}</h2>
        <div className="tiles">
          <div className="tile acc"><small>Right first time</small><strong>{pct}%</strong></div>
          {summary.streak !== null && <div className="tile streak"><small>Streak</small><strong>{summary.streak} day{summary.streak === 1 ? '' : 's'}</strong></div>}
        </div>
        {review && <p className="summary">{summary.due === 1 ? 'A review is due. Do it' : `${summary.due} reviews are due. Do them`} before learning more.</p>}
        <div className="actions">
          {review && <button className="primary big" autoFocus onClick={review}>Review {summary.due} due</button>}
          {next && <button className={review ? 'big' : 'primary big'} autoFocus={!review} onClick={() => onStart(next.id)}>Next lesson: <span lang="ja">{next.title}</span></button>}
          <button className={next || review ? '' : 'primary big'} onClick={onExit}>Done</button>
        </div>
      </div>
    )
  }
  if (run.queue.length === 0) return <><div className="bar"><ExitButton onClick={onExit} /></div><p role="status">Saving…</p></>

  const ex = run.queue[0]
  const done = (missed: string[]) => { setRun((r) => advance(r!, missed)); setStep((s) => s + 1); setResumed(false) }
  // "Can't speak now": drop every speaking exercise left in this lesson, unscored (like Duolingo); a retry copy was never counted
  const skipSpeaking = () => {
    setRun((r) => { const queue = r!.queue.filter((e) => e.type !== 'speak'); const gone = r!.queue.filter((e) => e.type === 'speak' && !e.retry).length; return { ...r!, queue, total: r!.total - gone, initial: r!.initial - gone } })
    setStep((s) => s + 1)
    setResumed(false)
  }
  return (
    <div className="lesson">
      <div className="bar">
        <ExitButton onClick={onExit} />
        <progress max={run.initial} value={run.initial - run.queue.length} aria-label="Lesson progress" />
      </div>
      {resumed && <p className="hint test-label" role="status">Carrying on where you left off.</p>}
      <ExerciseView ex={ex} step={step} autoplay={autoplay} onDone={done} onSkipSpeaking={skipSpeaking} />
    </div>
  )
}

const COLORS = ['var(--accent)', 'var(--gold)', 'var(--good)', 'var(--indigo)']
/** A short burst of confetti (CSS only; hidden when the system asks for reduced motion). */
function Confetti() {
  const [bits] = useState(() => Array.from({ length: 28 }, (_, i) => ({ left: `${(i * 37) % 100}%`, delay: `${(i % 7) * 0.08}s`, color: COLORS[i % COLORS.length], rotate: `${(i * 47) % 360}deg` })))
  return <div className="confetti" aria-hidden="true">{bits.map((b, i) => <i key={i} style={{ left: b.left, animationDelay: b.delay, background: b.color, rotate: b.rotate }} />)}</div>
}
