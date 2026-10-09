import { useEffect, useState, type FormEvent } from 'react'
import { Rating } from 'ts-fsrs'
import { speak } from '../audio'
import { matches } from '../data/kana'
import { SpeakButton } from './SpeakButton'
import type { ModeProps } from './types'

export function Typing({ card, autoplay, onGrade }: ModeProps) {
  const [typed, setTyped] = useState('')
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    if (ok !== null && autoplay) speak(card.front) // only after answering: the sound gives away the romaji
  }, [ok, autoplay, card.front])
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (ok === null) setOk(matches(card.back, typed))
    else onGrade(ok ? Rating.Good : Rating.Again)
  }
  return (
    <form className="card" onSubmit={submit}>
      <div className="kana" lang="ja">{card.front}</div>
      <input autoFocus autoCapitalize="none" autoComplete="off" spellCheck={false} aria-label="romaji answer"
        onKeyDown={(e) => e.key === 'Enter' && e.repeat && e.preventDefault()}
        value={typed} onChange={(e) => setTyped(e.target.value)} readOnly={ok !== null} placeholder="type the romaji" />
      <div role="status" className={ok === null ? '' : ok ? 'answer good' : 'answer bad'}>
        {ok === null ? '' : ok ? '✓ Correct' : `✗ Answer: ${card.back.join(' / ')}`}
      </div>
      {ok !== null && <SpeakButton text={card.front} />}
      <button className="primary" type="submit">{ok === null ? 'Check' : 'Next'}</button>
    </form>
  )
}
