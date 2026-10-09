import { useEffect, useRef, useState } from 'react'
import { useJaVoice } from '../audio'
import { sfx } from '../sfx'
import { type Db } from '../db/db'
import { ITEMS, LESSONS, type Lesson as LessonT } from '../path/course'
import { accuracy, advance, buildLesson, startRun, type RunState } from '../path/lesson'
import { completeLesson, getProgress, learnedItems } from '../path/progress'
import { Choice } from '../path/ui/Choice'
import { Intro } from '../path/ui/Intro'
import { KanjiIntro } from '../path/ui/KanjiIntro'
import { Build } from '../path/ui/Build'
import { Explain } from '../path/ui/Explain'
import { Match } from '../path/ui/Match'
import { Type } from '../path/ui/Type'

interface Summary { xp: number; first: boolean; accuracy: number; streak: number | null } // streak null: the lesson saved but the streak could not be read

export function Lesson({ db, lesson, autoplay, onExit, onStart }: { db: Db; lesson: LessonT; autoplay: boolean; onExit: () => void; onStart: (id: string) => void }) {
  const [canSpeak] = useState(useJaVoice()) // snapshot: a voice appearing later must not reshuffle a lesson in progress
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
      .then((p) => live && setRun(startRun(buildLesson(lesson, ITEMS, { canSpeak, learned: learnedItems(LESSONS, p.done) }))))
      .catch((e) => live && setError(`Couldn't open this lesson (${e}).`))
    return () => {
      live = false
    }
  }, [db, lesson, canSpeak])

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
  if (!run) return <><button onClick={onExit}>← Exit</button><p>Loading…</p></> // never a dead end, even if loading hangs

  if (summary) {
    const idx = LESSONS.findIndex((l) => l.id === lesson.id)
    const next = LESSONS[idx + 1]
    return (
      <div className="card">
        <h2>Lesson complete 🎉</h2>
        <p className="counts">+{summary.xp} XP{summary.first ? '' : ' (practice)'}</p>
        <p>{Math.round(summary.accuracy * 100)}% right first time{summary.streak !== null && ` · ${summary.streak}-day streak`}</p>
        {next && <button className="primary" autoFocus onClick={() => onStart(next.id)}>Next lesson: <span lang="ja">{next.title}</span></button>}
        <button className={next ? '' : 'primary'} onClick={onExit}>Done</button>
      </div>
    )
  }
  if (run.queue.length === 0) return <><button onClick={onExit}>← Exit</button><p role="status">Saving…</p></>

  const ex = run.queue[0]
  const done = (missed: string[]) => { setRun((r) => advance(r!, missed)); setStep((s) => s + 1) }
  return (
    <>
      <div className="bar">
        <button onClick={onExit}>← Exit</button>
        <progress max={run.initial} value={run.initial - run.queue.length} aria-label="Lesson progress" />
      </div>
      {ex.type === 'intro' ? (ex.item.kind === 'kanji' ? <KanjiIntro key={step} item={ex.item} onDone={done} /> : <Intro key={step} item={ex.item} autoplay={autoplay} onDone={done} />)
        : ex.type === 'explain' ? <Explain key={step} ex={ex} onDone={done} />
        : ex.type === 'build' ? <Build key={step} ex={ex} onDone={done} />
        : ex.type === 'match' ? <Match key={step} pairs={ex.pairs} onDone={done} />
        : ex.type === 'type' ? <Type key={step} ex={ex} autoplay={autoplay} onDone={done} />
        : <Choice key={step} ex={ex} autoplay={autoplay} onDone={done} />}
    </>
  )
}
