import { useEffect, useState, type FormEvent } from 'react'
import { Rating } from 'ts-fsrs'
import { speak } from '../audio'
import { sfx } from '../sfx'
import { matches } from '../data/kana'
import { checkEnglish, mayGrow, type Check } from '../path/typing'
import { ITEMS } from '../path/course'
import { Example } from '../path/ui/Example'
import { Ruby } from '../path/ui/Ruby'
import { SpeakButton } from './SpeakButton'
import type { ModeProps } from './types'

const KANA_DECKS = new Set(['hira', 'kata'])

/** Kana cards: type the romaji (exact). Word cards: type the English meaning (a one-letter slip is forgiven, with a note). */
export function Typing({ card, autoplay, onGrade }: ModeProps) {
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<Check | null>(null)
  const kana = KANA_DECKS.has(card.deck)
  const sound = card.reading ?? card.front
  useEffect(() => {
    if (result !== null && autoplay) speak(sound) // only after answering: the sound gives away the romaji
  }, [result, autoplay, sound])
  const grade = (t: string): Check => (kana ? { ok: matches(card.back, t) } : checkEnglish(t, card.back))
  const answer = (r: Check) => {
    setResult(r)
    sfx(r.ok ? 'right' : 'wrong')
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (result === null) answer(grade(typed))
    else onGrade(result.ok ? Rating.Good : Rating.Again)
  }
  // a right answer passes as soon as it is typed; English waits for Check when it could be half of what is meant
  const change = (t: string) => {
    setTyped(t)
    const r = grade(t)
    if (r.ok && !r.note && (kana || !mayGrow(t, card.back))) answer(r)
  }
  return (
    <form className="card" onSubmit={submit}>
      <div className="kana" lang="ja"><Ruby text={card.front} reading={card.reading} /></div>
      {ITEMS.get(card.id) && <Example item={ITEMS.get(card.id)!} revealed={result !== null} />}
      <input autoFocus autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck={false} aria-label={kana ? 'romaji answer' : 'English meaning'}
        onKeyDown={(e) => e.key === 'Enter' && e.repeat && e.preventDefault()} lang={kana ? undefined : 'en'}
        value={typed} onChange={(e) => change(e.target.value)} readOnly={result !== null} placeholder={kana ? 'type the romaji' : 'type the meaning'} />
      <div role="status" className={result === null ? '' : result.ok ? 'answer good' : 'answer bad'}>
        {result === null ? '' : <>
          {result.ok ? '✓ Correct' : `✗ Answer: ${kana ? card.back.join(' / ') : card.back[0]}`}
          {result.note && <small> {result.note}</small>}
          {card.reading && <div className="reading" lang="ja">{card.reading}</div>}
        </>}
      </div>
      {result !== null && <SpeakButton text={sound} />}
      <button className="primary" type="submit">{result === null ? 'Check' : 'Next'}</button>
    </form>
  )
}
