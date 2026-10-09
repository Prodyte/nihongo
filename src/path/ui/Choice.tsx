import { useEffect, useState } from 'react'
import { speak } from '../../audio'
import { SpeakButton } from '../../modes/SpeakButton'
import type { Exercise } from '../lesson'
import { Feedback } from './Feedback'
import { Ruby } from './Ruby'

type Ex = Extract<Exercise, { type: 'choice' | 'listen' }>

/** Multiple choice, in both directions, and the listening variant (hear it, pick the Japanese). */
export function Choice({ ex, autoplay, onDone }: { ex: Ex; autoplay: boolean; onDone: (missed: string[]) => void }) {
  const [picked, setPicked] = useState<string | null>(null)
  const listening = ex.type === 'listen'
  const toGloss = ex.type === 'choice' && ex.dir === 'toGloss'
  const toReading = ex.type === 'choice' && ex.dir === 'toReading'
  const kana = ex.item.kind === 'kana'
  const answered = picked !== null
  const prompt = ex.type === 'choice' ? ex.prompt : ''
  const fill = ex.type === 'choice' && ex.dir === 'fill'
  const wide = ex.item.kind === 'sentence' && !fill // whole sentences as options need the full width

  useEffect(() => {
    if (listening) speak(ex.item.jp) // say it on arrival; the replay button is on screen
  }, [listening, ex.item.jp])
  useEffect(() => {
    if (answered && autoplay && !listening && ex.item.kind !== 'kanji') speak(ex.item.jp) // after answering, hear the word (listening already played it; a lone kanji has several readings)
  }, [answered, autoplay, listening, ex.item.jp, ex.item.kind])
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
    : fill ? 'Which word completes the sentence?'
    : toReading ? 'How is this read?'
    : ex.item.kind === 'kanji' && toGloss ? 'What does this kanji mean?'
    : toGloss ? (kana ? 'What sound is this?' : 'What does this mean?')
    : kana ? `Which one is “${prompt}”?` : ex.item.kind === 'kanji' ? `Which kanji means “${prompt}”?` : `How do you say “${prompt}”?`
  const right = ex.answer

  return (
    <div className="card">
      <p className="q">{question}</p>
      {listening ? (
        <SpeakButton text={ex.item.jp} />
      ) : toReading ? (
        <div className="prompt kana" lang="ja">{prompt}</div>
      ) : toGloss || fill ? (
        <div className={`prompt kana${ex.item.kind === 'sentence' ? ' sentence' : ''}`} lang="ja">{toGloss ? <Ruby text={prompt} reading={ex.item.written && ex.item.jp} /> : prompt}</div>
      ) : (
        <div className="prompt gloss">{prompt}</div>
      )}
      {fill && ex.type === 'choice' && <p className="hint">{ex.hint}</p>}
      <div className={wide ? 'grid wide' : 'grid'} role="group" aria-label="Answers">
        {ex.options.map((o, i) => (
          <button key={o} lang={toGloss ? undefined : 'ja'} disabled={answered} onClick={() => setPicked(o)}
            className={`${toGloss ? '' : 'jp-option'} ${!answered ? '' : o === right ? 'good' : o === picked ? 'bad' : ''}`}>
            {answered && (o === right ? '✓ ' : o === picked ? '✗ ' : '')}<Ruby text={o} reading={ex.readings?.[o]} /> {!answered && <kbd aria-hidden="true">{i + 1}</kbd>}
          </button>
        ))}
      </div>
      <Feedback result={answered ? picked === right : null} item={ex.item} answer={right} onContinue={() => onDone(picked === right ? [] : [ex.item.id])} />
    </div>
  )
}
