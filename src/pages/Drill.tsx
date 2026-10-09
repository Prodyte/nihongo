import { useEffect, useState } from 'react'
import { useJaVoice } from '../audio'
import type { Db } from '../db/db'
import { ExitButton } from '../icons'
import { buildDrill, DRILL_TITLE, learnedForDrills, type DrillKind } from '../path/drills'
import type { Exercise } from '../path/lesson'
import { addReviewXp } from '../path/progress'
import { ExerciseView } from '../path/ui/ExerciseView'
import { sfx } from '../sfx'

/** A short practice session (10 questions) on things already learned. Right answers count toward today's streak; schedules are untouched. */
export function Drill({ db, kind, onExit }: { db: Db; kind: DrillKind; onExit: () => void }) {
  const voice = useJaVoice()
  const [exs, setExs] = useState<Exercise[] | null>(null)
  const [step, setStep] = useState(0)
  const [right, setRight] = useState(0)
  const [round, setRound] = useState(0)

  useEffect(() => {
    let live = true
    void learnedForDrills(db).then((items) => { if (live) { setExs(buildDrill(kind, items)); setStep(0); setRight(0) } }, () => live && setExs([]))
    return () => {
      live = false
    }
  }, [db, kind, round])

  const finished = !!exs && step >= exs.length
  useFinishSound(finished && exs!.length > 0)
  if (!exs) return <><div className="bar"><ExitButton onClick={onExit} /></div><div className="skeleton tall" aria-label="Loading" /></>
  if (!exs.length) return (
    <div className="card empty">
      <h2>Nothing to practise yet</h2>
      <p>{kind === 'conjugate' ? 'Learn a few verbs on the path first (they start in the N5 section).' : 'Finish a few word lessons on the path first.'}</p>
      <button className="primary" onClick={onExit}>Back</button>
    </div>
  )
  if (finished) return (
    <div className="card done-card">
      <p className="eyebrow">{DRILL_TITLE[kind]}</p>
      <h2>{right === exs.length ? 'Perfect!' : right / exs.length >= 0.7 ? 'Well done!' : 'Keep practising!'}</h2>
      <div className="tiles">
        <div className="tile acc"><small>Right</small><strong>{right}/{exs.length}</strong></div>
      </div>
      <div className="actions">
        <button className="primary big" autoFocus onClick={() => setRound((r) => r + 1)}>Practise again</button>
        <button onClick={onExit}>Done</button>
      </div>
    </div>
  )
  const done = (missed: string[]) => {
    if (!missed.length) { setRight((r) => r + 1); void addReviewXp(db).catch(() => {}) }
    setStep((s) => s + 1)
  }
  return (
    <>
      <div className="bar">
        <ExitButton onClick={onExit} />
        <progress max={exs.length} value={step} aria-label={`${DRILL_TITLE[kind]} progress`} />
      </div>
      {(kind === 'listen' || kind === 'shadow') && !voice && <p className="hint">This needs a Japanese voice on your device (Settings → Accessibility → Spoken content on iPad).</p>}
      <ExerciseView ex={exs[step]} step={step} autoplay={false} onDone={done} onSkipSpeaking={onExit} />
    </>
  )
}

function useFinishSound(on: boolean) {
  useEffect(() => {
    if (on) sfx('done')
  }, [on])
}
