import { useState } from 'react'
import { loadStrokes } from '../strokes'
import { Strokes } from './Strokes'
import { WriteBoard } from './WriteBoard'

/** A character's stroke order, then "Practise writing": trace it, or write it from memory, as often as you like. Key it by `char`. */
export function WritePractice({ char }: { char: string }) {
  const [practice, setPractice] = useState<{ paths: string[]; guide: boolean; round: number } | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const start = (guide: boolean) => {
    setDone(null)
    void loadStrokes().then((all) => all[char] && setPractice((p) => ({ paths: all[char], guide, round: (p?.round ?? 0) + 1 })), () => {})
  }
  return practice ? (
    <>
      <WriteBoard key={practice.round} paths={practice.paths} guide={practice.guide} onDone={(m) => setDone(m ? `Done, with ${m} miss${m === 1 ? '' : 'es'}.` : 'Perfect!')} />
      {done && <p role="status">{done}</p>}
      <div className="row2">
        <button onClick={() => start(true)}>Trace again</button>
        <button onClick={() => start(false)}>From memory</button>
      </div>
    </>
  ) : (
    <>
      <Strokes char={char} />
      <button onClick={() => start(true)}>Practise writing</button>
    </>
  )
}
