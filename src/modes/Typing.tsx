import { useState, type FormEvent } from 'react'
import { Rating } from 'ts-fsrs'
import { matches } from '../data/kana'
import type { ModeProps } from './types'

export function Typing({ card, onGrade }: ModeProps) {
  const [typed, setTyped] = useState('')
  const [ok, setOk] = useState<boolean | null>(null)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (ok === null) setOk(matches(card.back, typed))
    else onGrade(ok ? Rating.Good : Rating.Again)
  }
  return (
    <form className="card" onSubmit={submit}>
      <div className="kana">{card.front}</div>
      <input autoFocus autoCapitalize="none" autoComplete="off" spellCheck={false} aria-label="romaji answer"
        onKeyDown={(e) => e.key === 'Enter' && e.repeat && e.preventDefault()}
        value={typed} onChange={(e) => setTyped(e.target.value)} readOnly={ok !== null} placeholder="type the romaji" />
      {ok !== null && <div className={ok ? 'answer good' : 'answer bad'}>{ok ? 'Correct' : `Answer: ${card.back.join(' / ')}`}</div>}
      <button className="primary" type="submit">{ok === null ? 'Check' : 'Next'}</button>
    </form>
  )
}
