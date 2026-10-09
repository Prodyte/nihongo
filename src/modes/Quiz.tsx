import { useEffect, useMemo, useState } from 'react'
import { Rating } from 'ts-fsrs'
import { speak } from '../audio'
import { choices } from './choices'
import { SpeakButton } from './SpeakButton'
import type { ModeProps } from './types'

export function Quiz({ card, pool, autoplay, onGrade }: ModeProps) {
  const options = useMemo(() => choices(card, pool), [card, pool])
  const [picked, setPicked] = useState<string | null>(null)
  const right = card.back[0]
  useEffect(() => {
    if (picked !== null && autoplay) speak(card.front) // only after answering
  }, [picked, autoplay, card.front])
  return (
    <div className="card">
      <div className="kana" lang="ja">{card.front}</div>
      <div className="grid">
        {options.map((o) => (
          <button key={o} disabled={picked !== null} onClick={() => setPicked(o)}
            className={picked === null ? '' : o === right ? 'good' : o === picked ? 'bad' : ''}>
            {picked !== null && (o === right ? '✓ ' : o === picked ? '✗ ' : '')}{o}
          </button>
        ))}
      </div>
      <div role="status" className={picked === null ? '' : picked === right ? 'answer good' : 'answer bad'}>
        {picked === null ? '' : picked === right ? '✓ Correct' : `✗ Incorrect, the answer is ${right}`}
      </div>
      {picked !== null && <SpeakButton text={card.front} />}
      {picked !== null && (
        <button className="primary" autoFocus onClick={() => onGrade(picked === right ? Rating.Good : Rating.Again)}>Next</button>
      )}
    </div>
  )
}
