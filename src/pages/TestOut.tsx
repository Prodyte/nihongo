import { Loading } from '../Loading'
import { useEffect, useState } from 'react'
import { ExitButton } from '../icons'
import { ExerciseView } from '../path/ui/ExerciseView'
import type { Db } from '../db/db'
import { ITEMS, LESSONS, type Unit } from '../path/course'
import { buildTest, TEST_PASS, type Exercise } from '../path/lesson'
import { getProgress, testOut } from '../path/progress'
import { sfx } from '../sfx'

/** "Already know this?": a short test over every lesson up to the end of `unit` that isn't done yet. Pass to skip them. */
export function TestOut({ db, unit, onExit }: { db: Db; unit: Unit; onExit: () => void }) {
  const [exs, setExs] = useState<Exercise[] | null>(null)
  const [todo, setTodo] = useState(0)
  const [step, setStep] = useState(0)
  const [misses, setMisses] = useState<Record<string, number>>({})
  const [result, setResult] = useState<{ passed: boolean; right: number; skipped: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void getProgress(db).then((p) => {
      const end = LESSONS.indexOf(unit.lessons.at(-1)!)
      const lessons = LESSONS.slice(0, end + 1).filter((l) => !p.done.has(l.id))
      if (!live) return
      setTodo(lessons.length)
      setExs(buildTest(lessons, ITEMS))
    }, (e) => live && setError(`Couldn't start the test (${e}).`))
    return () => {
      live = false
    }
  }, [db, unit])

  useEffect(() => {
    if (!exs || step < exs.length || result) return
    const wrong = Object.keys(misses).length
    const right = exs.length - wrong
    const passed = right / exs.length >= TEST_PASS
    const end = LESSONS.indexOf(unit.lessons.at(-1)!)
    void (passed ? testOut(db, LESSONS.slice(0, end + 1), ITEMS, misses) : Promise.resolve(0))
      .then((skipped) => { setResult({ passed, right, skipped }); sfx(passed ? 'done' : 'wrong') }, (e) => setError(`Couldn't save the result (${e}).`))
  }, [db, exs, step, misses, result, unit])

  if (error) return <div className="card"><p role="alert" className="bad">{error}</p><button onClick={onExit}>Back</button></div>
  if (!exs) return <><ExitButton onClick={onExit} /><Loading /></>
  if (result) return (
    <div className="card">
      <h2>{result.passed ? 'Passed 🎉' : 'Not this time'}</h2>
      <p className="counts">{result.right} of {exs.length} right · {Math.round(TEST_PASS * 100)}% needed</p>
      <p>{result.passed ? `${result.skipped} lesson${result.skipped === 1 ? '' : 's'} marked done. What you got wrong comes back soon in Review.` : 'Keep going from your current lesson; you can try again any time.'}</p>
      <button className="primary" autoFocus onClick={onExit}>Done</button>
    </div>
  )
  if (step >= exs.length) return <p role="status">Saving…</p>

  const ex = exs[step]
  const done = (missed: string[]) => {
    if (missed.length) setMisses((m) => ({ ...m, [missed[0]]: 1 }))
    setStep((s) => s + 1)
  }
  return (
    <>
      <div className="bar">
        <ExitButton onClick={onExit} />
        <progress max={exs.length} value={step} aria-label="Test progress" />
      </div>
      <p className="hint test-label">Test: {unit.title} · covers {todo} lesson{todo === 1 ? '' : 's'}</p>
      <ExerciseView ex={ex} step={step} autoplay={false} onDone={done} onSkipSpeaking={() => done([])} />
    </>
  )
}
