import { useEffect, useState } from 'react'
import type { Exercise } from '../lesson'
import { loadStrokes } from '../strokes'
import { Feedback } from './Feedback'
import { WriteBoard } from './WriteBoard'

type Ex = Extract<Exercise, { type: 'write' }>

/** Write a kanji or kana: trace it over a guide, or from memory given its meaning (a kana: its romaji). Three or more misses count as a miss. */
export function Write({ ex, onDone }: { ex: Ex; onDone: (missed: string[]) => void }) {
  const [paths, setPaths] = useState<string[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)
  const what = ex.item.kind !== 'kana' ? 'kanji' : ex.item.script === 'kata' ? 'katakana' : 'hiragana'
  useEffect(() => {
    let live = true
    loadStrokes().then((all) => live && (all[ex.item.jp] ? setPaths(all[ex.item.jp]) : setFailed(true)), () => live && setFailed(true))
    return () => {
      live = false
    }
  }, [ex.item.jp])

  return (
    <div className="card">
      <p className="q">{ex.guide ? `Trace the ${what}, stroke by stroke` : `Write the ${what} for`}</p>
      {ex.guide ? <p className="hint">{ex.item.gloss}</p> : <div className="prompt gloss">{ex.item.gloss}</div>}
      {failed ? <p role="alert">Stroke data isn’t available offline yet. Skip this one.</p>
        : paths ? <WriteBoard key={ex.item.id} paths={paths} guide={ex.guide} onDone={(m) => setResult(m < 3)} />
        : <p>Loading…</p>}
      {result === null && <button onClick={() => (failed ? onDone([]) : setResult(false))}>{failed ? 'Skip' : 'Show me'}</button>}
      <Feedback result={result} item={ex.item} answer={ex.item.jp} onContinue={() => onDone(result ? [] : [ex.item.id])} />
    </div>
  )
}
