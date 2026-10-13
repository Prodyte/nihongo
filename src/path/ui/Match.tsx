import { useMemo, useState, type CSSProperties } from 'react'
import { speak } from '../../audio'
import { SpeakButton } from '../../modes/SpeakButton'
import { shuffle } from '../../modes/choices'
import { sfx } from '../../sfx'
import { ITEMS } from '../course'
import type { Exercise } from '../lesson'
import { charWidth } from './furigana'
import { Ruby } from './Ruby'

type Pair = Extract<Exercise, { type: 'match' }>['pairs'][number]
type Pick = { side: 'jp' | 'gloss'; id: string }

/** What a matched pair sounds like; nothing for a lone kanji (it has several readings). */
const soundOf = (id: string) => { const it = ITEMS.get(id); return it && it.kind !== 'kanji' ? it.jp : null }

/** Tap a Japanese item and its meaning to pair them. Wrong taps count as misses for both items. The last match can be heard again. */
export function Match({ pairs, autoplay, onDone }: { pairs: Pair[]; autoplay: boolean; onDone: (missed: string[]) => void }) {
  const [jp, gloss] = useMemo(() => [shuffle(pairs, Math.random), shuffle(pairs, Math.random)], [pairs])
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set())
  const [sel, setSel] = useState<Pick | null>(null)
  const [missed, setMissed] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [sound, setSound] = useState<string | null>(null)
  const finished = matched.size === pairs.length

  function tap(side: Pick['side'], id: string) {
    if (matched.has(id) || finished) return
    if (!sel || sel.side === side) { setSel({ side, id }); setNote(''); setSound(null); return }
    if (sel.id === id) { // the other half of the same pair
      setMatched(new Set([...matched, id])); setSel(null); setNote('✓ Match'); sfx(matched.size + 1 === pairs.length ? 'done' : 'right')
      setSound(soundOf(id))
      if (autoplay && soundOf(id)) speak(soundOf(id)!)
    } else {
      setMissed([...missed, sel.id, id]); setSel(null); setNote('✗ Not a match, try again'); sfx('wrong'); setSound(null)
    }
  }
  const btn = (side: Pick['side'], p: Pair) => {
    const done = matched.has(p.id)
    const on = sel?.side === side && sel.id === p.id
    return (
      <button key={`${side}${p.id}`} lang={side === 'jp' ? 'ja' : undefined} disabled={done} aria-pressed={on} className={done ? 'good' : on ? 'selected' : ''} onClick={() => tap(side, p.id)}>
        {done && <span className="mark">✓ </span>}{side === 'jp' ? <Ruby text={p.jp} reading={p.reading} /> : p.gloss}
      </button>
    )
  }
  return (
    <div className="card">
      <p className="q">Match the pairs</p>
      <div className="match" style={{ '--n': Math.max(...pairs.map((p) => charWidth(p.jp, p.reading))) } as CSSProperties}> {/* one size for every word */}
        <div>{jp.map((p) => btn('jp', p))}</div>
        <div>{gloss.map((p) => btn('gloss', p))}</div>
      </div>
      <div className={finished ? 'feedback inline good' : note.startsWith('✗') ? 'feedback inline bad' : ''}>
        <div className="feedback-head"><div role="status">{finished ? '✓ All matched' : note}</div>{sound && <SpeakButton text={sound} />}</div>
      </div>
      {finished && <button className="primary" autoFocus onKeyDown={(e) => e.repeat && e.preventDefault()} onClick={() => onDone(missed)}>Continue</button>}
    </div>
  )
}
