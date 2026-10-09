import { useEffect, useState } from 'react'
import { Rating, type Grade } from 'ts-fsrs'
import type { ModeProps } from './types'

const GRADES: [Grade, string][] = [[Rating.Again, 'Again'], [Rating.Hard, 'Hard'], [Rating.Good, 'Good'], [Rating.Easy, 'Easy']]

export function Flashcard({ card, onGrade }: ModeProps) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (!shown && (e.key === ' ' || e.key === 'Enter')) {
        if (!(e.target instanceof HTMLButtonElement)) setShown(true) // a focused button handles its own click
      }
      else if (shown && e.key.length === 1 && '1234'.includes(e.key)) onGrade(GRADES[Number(e.key) - 1][0])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown, onGrade])

  return (
    <div className="card">
      <div className="kana">{card.front}</div>
      {shown ? (
        <>
          <div className="answer">{card.back[0]}</div>
          <div className="row">
            {GRADES.map(([g, label], i) => (
              <button key={label} onClick={() => onGrade(g)}>{label} <kbd>{i + 1}</kbd></button>
            ))}
          </div>
        </>
      ) : (
        <button className="primary" onClick={() => setShown(true)}>Show answer <kbd>space</kbd></button>
      )}
    </div>
  )
}
