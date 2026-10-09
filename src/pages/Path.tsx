import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Db } from '../db/db'
import { LESSONS, SECTIONS, UNITS } from '../path/course'
import { currentLesson, getProgress, isUnlocked } from '../path/progress'
import { readBool } from '../settings'

const INDEX = new Map(LESSONS.map((l, i) => [l.id, i]))

/** A <details> that only renders its contents while open: the path has ~700 lessons, mostly in folded units. */
function Fold({ open: initial, className, summary, children }: { open: boolean; className: string; summary: ReactNode; children: () => ReactNode }) {
  const [open, setOpen] = useState(initial)
  return (
    <details className={className} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{summary}</summary>
      {open && children()}
    </details>
  )
}

const SECTION_NAMES: Record<string, string> = { Kana: 'Kana', Starter: 'First words and sentences', N5: 'JLPT N5', N4: 'JLPT N4', N3: 'JLPT N3' }

export function Path({ db, onStart, onTest }: { db: Db; onStart: (lessonId: string) => void; onTest: (unitId: string) => void }) {
  const [done, setDone] = useState<ReadonlySet<string> | null>(null)
  const [skipAhead] = useState(() => readBool('nihongo.skipAhead', false))
  const [error, setError] = useState<string | null>(null)
  const hereRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let live = true
    void getProgress(db).then((r) => live && setDone(r.done)).catch((e) => live && setError(`Couldn't load your progress (${e}).`))
    return () => {
      live = false
    }
  }, [db])
  useEffect(() => { hereRef.current?.scrollIntoView?.({ block: 'center' }) }, [done]) // a long path: start where the learner is

  if (error) return <p role="alert" className="bad">{error}</p>
  if (!done) return <p>Loading…</p>
  const current = currentLesson(LESSONS, done)
  const total = LESSONS.filter((l) => done.has(l.id)).length

  return (
    <>
      <div className="card hero">
        <h2>Your path</h2>
        <p>{total} of {LESSONS.length} lessons done</p>
        <progress max={LESSONS.length} value={total} aria-label="Path progress" />
        {current && <button className="primary big" onClick={() => onStart(current.id)}>Continue: <span lang="ja">{current.title}</span></button>}
        {!current && <p>You finished the whole path. 🎉 Keep your memory sharp in Review.</p>}
      </div>
      {SECTIONS.map((section) => {
        const units = UNITS.filter((u) => u.section === section)
        const lessons = units.flatMap((u) => u.lessons)
        const doneHere = lessons.filter((l) => done.has(l.id)).length
        const here = current !== null && lessons.includes(current)
        return (
          <Fold key={section} className="section" open={here || (current === null && section === SECTIONS[0])}
            summary={<><h2>{SECTION_NAMES[section] ?? section}</h2><small>{doneHere === lessons.length ? '✓ Done' : `${doneHere}/${lessons.length}`}</small></>}>
            {() => units.map((u) => {
              const doneCount = u.lessons.filter((l) => done.has(l.id)).length
              return (
                <Fold key={u.id} className="card unit" open={current !== null && u.lessons.includes(current)}
                  summary={<><strong>{u.title}</strong> <small>{doneCount === u.lessons.length ? '✓' : `${doneCount}/${u.lessons.length}`}</small></>}>
                  {() => (
                    <>
                      <p>{u.blurb}</p>
                      {!isUnlocked(LESSONS, INDEX.get(u.lessons[0].id)!, done, skipAhead) && (
                        <button className="test-out" onClick={() => onTest(u.id)}>Already know this? Test out</button>
                      )}
                      <ul className="lessons">
                        {u.lessons.map((l) => {
                          const open = isUnlocked(LESSONS, INDEX.get(l.id)!, done, skipAhead)
                          const isDone = done.has(l.id)
                          return (
                            <li key={l.id}>
                              <button ref={l === current ? hereRef : undefined} disabled={!open} className={l === current ? 'primary' : isDone ? 'done' : ''} onClick={() => onStart(l.id)}>
                                <span lang="ja">{l.title}</span>
                                <small>{isDone ? '✓ Done · practise' : open ? 'Start' : '🔒 Locked'}</small>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </>
                  )}
                </Fold>
              )
            })}
          </Fold>
        )
      })}
    </>
  )
}
