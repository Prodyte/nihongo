import { useEffect, useState } from 'react'
import type { Db } from '../db/db'
import { SpeakButton } from '../modes/SpeakButton'
import { ITEMS, LESSONS, written } from '../path/course'
import { getProgress } from '../path/progress'
import { JaText } from '../path/ui/JaText'
import { Ruby } from '../path/ui/Ruby'

const GRAMMAR = LESSONS.filter((l) => l.explain)
const LEVEL = (id: string) => (id.startsWith('n5-') ? 'N5' : id.startsWith('n4-') ? 'N4' : id.startsWith('n3-') ? 'N3' : 'First steps')

/** Every grammar point in the course: its explanation and all its sentences, to look back at any time (like Bunpro's grammar pages). */
export function Grammar({ db }: { db: Db }) {
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())
  const [q, setQ] = useState('')
  useEffect(() => {
    void getProgress(db).then((p) => setDone(p.done), () => {})
  }, [db])
  const match = (l: (typeof GRAMMAR)[number]) => !q.trim() || `${l.title} ${l.explain!.title} ${l.explain!.body.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase())
  const shown = GRAMMAR.filter(match)

  return (
    <div className="card form">
      <h2>Grammar</h2>
      <label>
        Find a grammar point
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="て-form, past, より…" autoCapitalize="none" />
      </label>
      <p role="status" className="hint">{done.size ? `${GRAMMAR.filter((l) => done.has(l.id)).length} of ${GRAMMAR.length} learned` : `${GRAMMAR.length} grammar points`}{q.trim() ? ` · ${shown.length} shown` : ''}</p>
      {['First steps', 'N5', 'N4', 'N3'].map((level) => {
        const here = shown.filter((l) => LEVEL(l.id) === level)
        if (!here.length) return null
        return (
          <section key={level} className="grammar-level">
            <h3>{level}</h3>
            <ul className="results">
              {here.map((l) => (
                <li key={l.id}>
                  <details>
                    <summary>
                      <span className="gloss"><JaText text={l.explain!.title} /></span>
                      <span className="tags">{done.has(l.id) ? <span className="tag guru">Learned</span> : <span className="tag">Not yet</span>}</span>
                    </summary>
                    <div className="explain-body">
                      {l.explain!.body.map((p, i) => <p key={i}><JaText text={p} /></p>)}
                      <ul className="examples">
                        {l.items.map((id) => ITEMS.get(id)!).map((it) => (
                          <li key={it.id}>
                            <div className="jpline"><span className="jp" lang="ja"><Ruby text={written(it)} /></span><SpeakButton text={it.jp} /></div>
                            <small>{it.romaji}</small>
                            <small>{it.gloss}</small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
