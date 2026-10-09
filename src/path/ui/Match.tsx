import { useMemo, useState } from 'react'
import { shuffle } from '../../modes/choices'
import type { Exercise } from '../lesson'
import { Ruby } from './Ruby'

type Pair = Extract<Exercise, { type: 'match' }>['pairs'][number]
type Pick = { side: 'jp' | 'gloss'; id: string }

/** Tap a Japanese item and its meaning to pair them. Wrong taps count as misses for both items. */
export function Match({ pairs, onDone }: { pairs: Pair[]; onDone: (missed: string[]) => void }) {
  const [jp, gloss] = useMemo(() => [shuffle(pairs, Math.random), shuffle(pairs, Math.random)], [pairs])
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set())
  const [sel, setSel] = useState<Pick | null>(null)
  const [missed, setMissed] = useState<string[]>([])
  const [note, setNote] = useState('')
  const finished = matched.size === pairs.length

  function tap(side: Pick['side'], id: string) {
    if (matched.has(id) || finished) return
    if (!sel || sel.side === side) { setSel({ side, id }); setNote(''); return }
    if (sel.id === id) { // the other half of the same pair
      setMatched(new Set([...matched, id])); setSel(null); setNote('✓ Match')
    } else {
      setMissed([...missed, sel.id, id]); setSel(null); setNote('✗ Not a match, try again')
    }
  }
  const btn = (side: Pick['side'], p: Pair) => {
    const done = matched.has(p.id)
    const on = sel?.side === side && sel.id === p.id
    return (
      <button key={`${side}${p.id}`} lang={side === 'jp' ? 'ja' : undefined} disabled={done} aria-pressed={on} className={done ? 'good' : on ? 'selected' : ''} onClick={() => tap(side, p.id)}>
        {done && '✓ '}{side === 'jp' ? <Ruby text={p.jp} reading={p.reading} /> : p.gloss}
      </button>
    )
  }
  return (
    <div className="card">
      <p className="q">Match the pairs</p>
      <div className="match">
        <div>{jp.map((p) => btn('jp', p))}</div>
        <div>{gloss.map((p) => btn('gloss', p))}</div>
      </div>
      <div role="status" className={finished ? 'feedback good' : note.startsWith('✗') ? 'feedback bad' : ''}>{finished ? '✓ All matched' : note}</div>
      {finished && <button className="primary" autoFocus onKeyDown={(e) => e.repeat && e.preventDefault()} onClick={() => onDone(missed)}>Continue</button>}
    </div>
  )
}
