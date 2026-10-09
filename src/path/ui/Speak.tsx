import { useEffect, useRef, useState } from 'react'
import { SpeakButton } from '../../modes/SpeakButton'
import { Icon } from '../../icons'
import { listen, saidIt, SpeechError } from '../../speech'
import { written } from '../course'
import { spokenForms, type Exercise } from '../lesson'
import { Feedback } from './Feedback'
import { Ruby } from './Ruby'

type Ex = Extract<Exercise, { type: 'speak' }>

/** Say it aloud. A mismatch shows what was heard; recognisers mishear, so "I said it right" is allowed. */
export function Speak({ ex, onDone, onSkip }: { ex: Ex; onDone: (missed: string[]) => void; onSkip: () => void }) {
  const [state, setState] = useState<'idle' | 'listening' | 'heard'>('idle')
  const [heard, setHeard] = useState<string | null>(null)
  const [result, setResult] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const stop = useRef<() => void>(() => {})
  useEffect(() => () => stop.current(), []) // leaving the exercise stops the microphone
  const sentence = ex.item.kind === 'sentence'

  function start() {
    setError(null)
    setState('listening')
    const l = listen()
    stop.current = l.stop
    l.result.then((alts) => {
      setHeard(alts[0])
      setState('heard')
      if (saidIt(alts, spokenForms(ex.item))) setResult(true)
    }, (e) => { setState('idle'); setError(e instanceof SpeechError ? e.message : String(e)) })
  }

  return (
    <div className="card">
      <p className="q">Say it in Japanese</p>
      <div className={`prompt kana${sentence ? ' sentence' : ''}`} lang="ja"><Ruby text={written(ex.item)} reading={ex.item.written && !sentence ? ex.item.jp : undefined} /></div>
      <p className="hint">{ex.item.gloss}</p>
      <SpeakButton text={ex.item.jp} />
      <div aria-live="polite" className="heard">{state === 'listening' ? 'Listening…' : heard !== null && result === null ? <>Heard: <span lang="ja">{heard}</span></> : ''}</div>
      {error && <p role="alert" className="bad">{error}</p>}
      {result === null && (
        <div className="row2">
          <button className="primary mic" disabled={state === 'listening'} onClick={start}><Icon name="mic" /> {state === 'heard' ? 'Try again' : 'Tap and speak'}</button>
          {state === 'heard' && <button onClick={() => setResult(true)}>I said it right</button>}
          {state === 'heard' && <button onClick={() => setResult(false)}>Show me</button>}
          <button onClick={() => { stop.current(); onSkip() }}>Can’t speak now</button>
        </div>
      )}
      <Feedback result={result} item={ex.item} answer={written(ex.item)} onContinue={() => onDone(result ? [] : [ex.item.id])} />
    </div>
  )
}
