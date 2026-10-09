import { useMemo, useState } from 'react'
import { Rating } from 'ts-fsrs'
import { choices } from './choices'
import type { ModeProps } from './types'

export function Quiz({ card, pool, onGrade }: ModeProps) {
  const options = useMemo(() => choices(card, pool), [card, pool])
  const [picked, setPicked] = useState<string | null>(null)
  const right = card.back[0]
  return (
    <div className="card">
      <div className="kana">{card.front}</div>
      <div className="grid">
        {options.map((o) => (
          <button key={o} disabled={picked !== null} onClick={() => setPicked(o)}
            className={picked === null ? '' : o === right ? 'good' : o === picked ? 'bad' : ''}>
            {o}
          </button>
        ))}
      </div>
      {picked !== null && (
        <button className="primary" autoFocus onClick={() => onGrade(picked === right ? Rating.Good : Rating.Again)}>Next</button>
      )}
    </div>
  )
}
