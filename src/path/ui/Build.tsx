import { useState } from 'react'
import { SpeakButton } from '../../modes/SpeakButton'
import type { Exercise } from '../lesson'
import { Feedback } from './Feedback'

type Ex = Extract<Exercise, { type: 'build' }>

const same = (a: string[], b: string[]) => a.length === b.length && a.every((t, i) => t === b[i])

/** Word bank: tap chunks to build the sentence in order; tap a chosen chunk to take it back. */
export function Build({ ex, onDone }: { ex: Ex; onDone: (missed: string[]) => void }) {
  const [picked, setPicked] = useState<number[]>([]) // indexes into the bank, in the order tapped
  const [result, setResult] = useState<boolean | null>(null)
  const words = picked.map((i) => ex.bank[i])
  const locked = result !== null

  return (
    <div className="card">
      <p className="q">Build the sentence</p>
      <div className="prompt gloss">{ex.item.gloss}</div>
      <div className="chips answer-row" role="group" aria-label="Your sentence">
        {words.length === 0 && <span className="placeholder">Tap the words below</span>}
        {picked.map((bankIndex, n) => (
          <button key={bankIndex} type="button" lang="ja" disabled={locked} aria-label={`${ex.bank[bankIndex]}, remove`} onClick={() => setPicked(picked.filter((_, k) => k !== n))}>
            {ex.bank[bankIndex]}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="Word bank">
        {ex.bank.map((t, i) => (
          <button key={i} type="button" lang="ja" className={picked.includes(i) ? 'used' : ''} disabled={locked || picked.includes(i)} onClick={() => setPicked([...picked, i])}>{t}</button>
        ))}
      </div>
      <div className="visually-hidden" role="status">{result === null ? `Your sentence: ${words.join(' ') || 'empty'}` : ''}</div>
      {!locked && (
        <div className="row2">
          <button className="primary" type="button" disabled={words.length === 0} onClick={() => setResult([ex.answer, ...ex.alts].some((a) => same(a, words)))}>Check</button>
          <button type="button" disabled={words.length === 0} onClick={() => setPicked([])}>Start again</button>
        </div>
      )}
      <Feedback result={result} item={ex.item} answer={ex.item.jp} onContinue={() => onDone(result ? [] : [ex.item.id])} />
      {locked && <SpeakButton text={ex.item.jp} />}
    </div>
  )
}
