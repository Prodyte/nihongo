import { useEffect, useMemo, useState } from 'react'
import type { Card } from 'ts-fsrs'
import { toKata } from '../data/kana'
import type { Db } from '../db/db'
import { ITEMS, written, type Item } from '../path/course'
import { ENTRIES, MAX, search } from '../path/lookup'
import { stage } from '../srs/stages'
import { loadStrokes } from '../path/strokes'
import { Strokes } from '../path/ui/Strokes'
import { WriteBoard } from '../path/ui/WriteBoard'

export function Lookup({ db }: { db: Db }) {
  const [query, setQuery] = useState('')
  const [cards, setCards] = useState<Map<string, Card>>(new Map())
  useEffect(() => {
    void db.getAll('cards').then((all) => setCards(new Map(all.map((c) => [c.id, c.fsrs]))), () => {})
  }, [db])
  const results = useMemo(() => search(query), [query])

  return (
    <div className="card form">
      <h2>Lookup</h2>
      <label>
        Search words and kanji
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="日, taberu, たべる, eat…" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </label>
      <p role="status" className="hint">{query.trim() ? (results.length ? `${results.length === MAX ? `First ${MAX}` : results.length} result${results.length === 1 ? '' : 's'}` : 'Nothing found in the course.') : `${ENTRIES.length} words and kanji from kana to N3.`}</p>
      <ul className="results">
        {results.map((it) => {
          const card = cards.get(it.id)
          const st = card && (stage(card) ?? 'New')
          return (
            <li key={it.id}>
              <details>
                <summary>
                  <span className="jp" lang="ja">{it.written ?? it.kanji ?? it.jp}</span>
                  {it.kind === 'word' && (it.written ?? it.kanji) && <span lang="ja"> {it.jp}</span>}
                  <span className="gloss"> {it.gloss}</span>
                  <span className="tags">
                    {it.kind === 'kanji' && <span className="tag">kanji</span>}
                    {it.level && <span className="tag">N{it.level}</span>}
                    {st && <span className={`tag ${st.toLowerCase()}`}>{st}</span>}
                  </span>
                </summary>
                {it.kind === 'kanji' ? <KanjiDetail it={it} /> : <p className="hint">{it.romaji}</p>}
                <a href={`https://jisho.org/search/${encodeURIComponent((it.written ?? it.kanji ?? written(it)) + (it.kind === 'kanji' ? ' #kanji' : ''))}`} target="_blank" rel="noopener noreferrer">
                  Jisho<span aria-hidden="true"> ↗</span><span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </details>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function KanjiDetail({ it }: { it: Item }) {
  const examples = (it.examples ?? []).flatMap((id) => ITEMS.get(id) ?? [])
  const [practice, setPractice] = useState<{ paths: string[]; guide: boolean; round: number } | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const start = (guide: boolean) => {
    setDone(null)
    void loadStrokes().then((all) => all[it.jp] && setPractice((p) => ({ paths: all[it.jp], guide, round: (p?.round ?? 0) + 1 })), () => {})
  }
  return (
    <div className="detail">
      {practice ? (
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
          <Strokes char={it.jp} />
          <button onClick={() => start(true)}>Practise writing</button>
        </>
      )}
      <p lang="ja">{[...(it.on ?? []).map(toKata), ...(it.kun ?? [])].join('、')}</p>
      {examples.map((w) => <p key={w.id}><span lang="ja">{w.written ?? w.kanji ?? w.jp} {w.jp}</span> {w.gloss}</p>)}
      <p className="hint">{it.strokes} strokes</p>
    </div>
  )
}
