import { useEffect, useMemo, useState } from 'react'
import { Rating } from 'ts-fsrs'
import { speak } from '../audio'
import { sfx } from '../sfx'
import { choices } from './choices'
import { ITEMS } from '../path/course'
import { Example } from '../path/ui/Example'
import { Ruby } from '../path/ui/Ruby'
import { fit } from '../path/ui/furigana'
import { SpeakButton } from './SpeakButton'
import { cardFront } from '../db/db'
import type { ModeProps } from './types'

export function Quiz({ card, pool, autoplay, onGrade }: ModeProps) {
  const options = useMemo(() => choices(card, pool), [card, pool])
  const [picked, setPicked] = useState<string | null>(null)
  const right = card.back[0]
  useEffect(() => {
    if (picked !== null && autoplay) speak(card.reading ?? card.front) // only after answering
  }, [picked, autoplay, card.front, card.reading])
  return (
    <div className="card">
      <div className="kana" lang="ja" style={fit(cardFront(card), card.reading)}><Ruby text={cardFront(card)} reading={card.reading} /></div>
      {ITEMS.get(card.id) && <Example item={ITEMS.get(card.id)!} revealed={picked !== null} />}
      <div className="grid">
        {options.map((o) => (
          <button key={o} disabled={picked !== null} onClick={() => { setPicked(o); sfx(o === right ? 'right' : 'wrong') }}
            className={picked === null ? '' : o === right ? 'good' : o === picked ? 'bad' : ''}>
            {picked !== null && (o === right || o === picked) && <span className="mark">{o === right ? '✓' : '✗'} </span>}{o}
          </button>
        ))}
      </div>
      <div role="status" className={picked === null ? '' : picked === right ? 'answer good' : 'answer bad'}>
        {picked === null ? '' : picked === right ? '✓ Correct' : `✗ Incorrect, the answer is ${right}`}
      </div>
      {picked !== null && card.reading && <div className="reading" lang="ja">{card.reading}</div>}
      {picked !== null && <SpeakButton text={card.reading ?? card.front} />}
      {picked !== null && (
        <button className="primary" autoFocus onClick={() => onGrade(picked === right ? Rating.Good : Rating.Again)}>Next</button>
      )}
    </div>
  )
}
