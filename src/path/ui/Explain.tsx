import { SpeakButton } from '../../modes/SpeakButton'
import type { Exercise } from '../lesson'
import { JaText } from './JaText'

type Ex = Extract<Exercise, { type: 'explain' }>

/** A grammar lesson's opening card: the rule in a few sentences, then two example sentences with reading and meaning. */
export function Explain({ ex, onDone }: { ex: Ex; onDone: (missed: string[]) => void }) {
  return (
    <div className="card explain">
      <h2><JaText text={ex.title} /></h2>
      {ex.body.map((p) => <p key={p}><JaText text={p} /></p>)}
      <ul className="examples">
        {ex.examples.map((it) => (
          <li key={it.id}>
            <span className="jp" lang="ja">{it.jp}</span> <SpeakButton text={it.jp} />
            <small>{it.romaji}</small>
            <small>{it.gloss}</small>
          </li>
        ))}
      </ul>
      <button className="primary" autoFocus onKeyDown={(e) => e.repeat && e.preventDefault()} onClick={() => onDone([])}>Got it</button>
    </div>
  )
}
