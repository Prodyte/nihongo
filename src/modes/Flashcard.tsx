import { useEffect, useRef, useState } from 'react'
import { Rating, type Grade } from 'ts-fsrs'
import { Html } from '../anki/media'
import { speak } from '../audio'
import { SpeakButton } from './SpeakButton'
import type { ModeProps } from './types'

const GRADES: [Grade, string][] = [[Rating.Again, 'Again'], [Rating.Hard, 'Hard'], [Rating.Good, 'Good'], [Rating.Easy, 'Easy']]

export function Flashcard({ db, card, autoplay, onGrade }: ModeProps) {
  const [shown, setShown] = useState(false)
  const slot = useRef<HTMLDivElement>(null)
  // Move focus to the revealed answer, not a grade button: a held Enter would auto-repeat onto it and grade by accident.
  useEffect(() => {
    if (shown) slot.current?.focus()
  }, [shown])
  useEffect(() => {
    if (shown && autoplay && !card.html) speak(card.front) // kana: say it once the answer is revealed
  }, [shown, autoplay, card.html, card.front])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return // leave browser shortcuts (Cmd+1 switches tabs) alone
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
      {card.html ? (
        <Html db={db} deck={card.deck} html={shown ? card.back[0] : card.front} autoplay={autoplay} />
      ) : (
        <div className="kana" lang="ja">{card.front}</div>
      )}
      <div className="answer-slot" aria-live="polite" tabIndex={-1} ref={slot}>
        {shown && (
          <>
            {!card.html && <div className="answer">{card.back[0]} <SpeakButton text={card.front} /></div>}
            <div className="row">
              {GRADES.map(([g, label], i) => (
                <button key={label} onClick={() => onGrade(g)}>{label} <kbd aria-hidden="true">{i + 1}</kbd></button>
              ))}
            </div>
          </>
        )}
      </div>
      {!shown && <button className="primary" autoFocus onClick={() => setShown(true)}>Show answer <kbd aria-hidden="true">space</kbd></button>}
    </div>
  )
}
