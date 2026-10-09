import { useEffect, useState } from 'react'
import { speak } from '../../audio'
import { SpeakButton } from '../../modes/SpeakButton'
import type { Exercise } from '../lesson'
import { Feedback } from './Feedback'

type Ex = Extract<Exercise, { type: 'choice' | 'listen' }>

/** Multiple choice, in both directions, and the listening variant (hear it, pick the Japanese). */
export function Choice({ ex, autoplay, onDone }: { ex: Ex; autoplay: boolean; onDone: (missed: string[]) => void }) {
  const [picked, setPicked] = useState<string | null>(null)
  const listening = ex.type === 'listen'
  const toGloss = ex.type === 'choice' && ex.dir === 'toGloss'
  const kana = ex.item.kind === 'kana'
  const answered = picked !== null
  const prompt = ex.type === 'choice' ? ex.prompt : ''

  useEffect(() => {
    if (listening) speak(ex.item.jp) // say it on arrival; the replay button is on screen
  }, [listening, ex.item.jp])
  useEffect(() => {
    if (answered && autoplay && !listening) speak(ex.item.jp) // after answering, hear the word (listening already played it)
  }, [answered, autoplay, listening, ex.item.jp])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (answered || e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || !'1234'.includes(e.key)) return
      const o = ex.options[Number(e.key) - 1]
      if (o !== undefined) setPicked(o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, ex.options])

  const question = listening ? 'Tap what you hear'
    : toGloss ? (kana ? 'What sound is this?' : 'What does this mean?')
    : kana ? `Which one is “${prompt}”?` : `How do you say “${prompt}”?`
  const right = ex.answer

  return (
    <div className="card">
      <p className="q">{question}</p>
      {listening ? (
        <SpeakButton text={ex.item.jp} />
      ) : toGloss ? (
        <div className="prompt kana" lang="ja">{prompt}</div>
      ) : (
        <div className="prompt gloss">{prompt}</div>
      )}
      <div className="grid" role="group" aria-label="Answers">
        {ex.options.map((o, i) => (
          <button key={o} lang={toGloss ? undefined : 'ja'} disabled={answered} onClick={() => setPicked(o)}
            className={`${toGloss ? '' : 'jp-option'} ${!answered ? '' : o === right ? 'good' : o === picked ? 'bad' : ''}`}>
            {answered && (o === right ? '✓ ' : o === picked ? '✗ ' : '')}{o} {!answered && <kbd aria-hidden="true">{i + 1}</kbd>}
          </button>
        ))}
      </div>
      <Feedback result={answered ? picked === right : null} item={ex.item} answer={right} onContinue={() => onDone(picked === right ? [] : [ex.item.id])} />
    </div>
  )
}
