import { Loading } from '../Loading'
import { useEffect, useRef, useState } from 'react'
import { useJaVoice } from '../audio'
import { canRecognise } from '../speech'
import { readBool } from '../settings'
import { sfx } from '../sfx'
import { ExitButton } from '../icons'
import { ExerciseView } from '../path/ui/ExerciseView'
import { type Db } from '../db/db'
import { ITEMS, LESSONS, type Lesson as LessonT } from '../path/course'
import { accuracy, advance, buildLesson, startRun, type RunState } from '../path/lesson'
import { completeLesson, getProgress, learnedItems } from '../path/progress'

interface Summary { xp: number; first: boolean; accuracy: number; streak: number | null } // streak null: the lesson saved but the streak could not be read

export function Lesson({ db, lesson, autoplay, onExit, onStart }: { db: Db; lesson: LessonT; autoplay: boolean; onExit: () => void; onStart: (id: string) => void }) {
  const [canSpeak] = useState(useJaVoice()) // snapshot: a voice appearing later must not reshuffle a lesson in progress
  const [canListen] = useState(() => canRecognise() && readBool('nihongo.speaking', true))
  const [canWrite] = useState(() => readBool('nihongo.writing', true))
  const [run, setRun] = useState<RunState | null>(null)
  const [step, setStep] = useState(0)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0) // bump to retry saving
  const saving = useRef(false)

  // Build the exercises once, knowing which items earlier lessons already taught.
  useEffect(() => {
    let live = true
    void getProgress(db)
      .then((p) => live && setRun(startRun(buildLesson(lesson, ITEMS, { canSpeak, canListen, canWrite, learned: learnedItems(LESSONS, p.done) }))))
      .catch((e) => live && setError(`Couldn't open this lesson (${e}).`))
    return () => {
      live = false
    }
  }, [db, lesson, canSpeak, canListen, canWrite])

  // Save once the last exercise is done. A failed save keeps the run so nothing is lost; "Try again" retries.
  useEffect(() => {
    if (!run || run.queue.length > 0 || summary || saving.current) return
    saving.current = true
    void completeLesson(db, lesson, ITEMS, run.misses, accuracy(run))
      .then(
        async (r) => {
          // Saved. Reading the streak is cosmetic and must never reach the retry path below (it would award XP twice).
          const streak = await getProgress(db).then((p) => p.streak, () => null)
          setSummary({ xp: r.xp, first: r.first, accuracy: accuracy(run), streak })
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
    return (
      <div className="card done-card">
        <Confetti />
        <p className="eyebrow">{summary.first ? 'Lesson complete' : 'Practice complete'}</p>
        <h2>{pct === 100 ? 'Perfect!' : pct >= 80 ? 'Great work!' : 'Nice effort!'}</h2>
        <div className="tiles">
          <div className="tile acc"><small>Right first time</small><strong>{pct}%</strong></div>
          {summary.streak !== null && <div className="tile streak"><small>Streak</small><strong>{summary.streak} day{summary.streak === 1 ? '' : 's'}</strong></div>}
        </div>
        <div className="actions">
          {next && <button className="primary big" autoFocus onClick={() => onStart(next.id)}>Next lesson: <span lang="ja">{next.title}</span></button>}
          <button className={next ? '' : 'primary big'} onClick={onExit}>Done</button>
        </div>
      </div>
    )
  }
  if (run.queue.length === 0) return <><div className="bar"><ExitButton onClick={onExit} /></div><p role="status">Saving…</p></>

  const ex = run.queue[0]
  const done = (missed: string[]) => { setRun((r) => advance(r!, missed)); setStep((s) => s + 1) }
  // "Can't speak now": drop every speaking exercise left in this lesson, unscored (like Duolingo)
  const skipSpeaking = () => {
    setRun((r) => { const queue = r!.queue.filter((e) => e.type !== 'speak'); const gone = r!.queue.length - queue.length; return { ...r!, queue, total: r!.total - gone, initial: r!.initial - gone } })
    setStep((s) => s + 1)
  }
  return (
    <div className="lesson">
      <div className="bar">
        <ExitButton onClick={onExit} />
        <progress max={run.initial} value={run.initial - run.queue.length} aria-label="Lesson progress" />
      </div>
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
