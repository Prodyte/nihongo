import { useEffect, useMemo, useState } from 'react'
import { Rating } from 'ts-fsrs'
import { speak } from '../audio'
import { sfx } from '../sfx'
import { choices } from './choices'
import { ITEMS } from '../path/course'
import { Example } from '../path/ui/Example'
import { Mnemonic } from '../path/ui/Mnemonic'
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
  const pick = (o: string) => {
    setPicked(o)
    sfx(o === right ? 'right' : 'wrong')
  }
  // 1–4 pick an option, as on the other review cards (Enter then presses the focused Next)
  useEffect(() => {
    if (picked !== null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      const i = Number(e.key) - 1
      if (Number.isInteger(i) && i >= 0 && i < options.length) pick(options[i])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <div className="card quiz">
      {picked === null && <p className="q">{card.deck === 'kana' ? 'Which sound is it?' : 'What does it mean?'}</p>}
      <div className="kana" lang="ja" style={fit(cardFront(card), card.reading)}><Ruby text={cardFront(card)} reading={card.reading} /></div>
      {ITEMS.get(card.id) && <Example item={ITEMS.get(card.id)!} revealed={picked !== null} />}
      <div className="grid">
        {options.map((o) => (
          <button key={o} disabled={picked !== null} onClick={() => pick(o)}
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
      {picked !== null && picked !== right && ITEMS.get(card.id) && <Mnemonic item={ITEMS.get(card.id)!} />}{/* a miss: how to remember it, not just that it was wrong */}
      {picked !== null && (
        <button className="primary" autoFocus onClick={() => onGrade(picked === right ? Rating.Good : Rating.Again)}>Next</button>
      )}
    </div>
  )
}
