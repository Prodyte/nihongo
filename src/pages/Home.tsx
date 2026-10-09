import { useEffect, useState } from 'react'
import { reviewCounts, type Db, type DeckRecord } from '../db/db'
import { mistakes, nextDue, until } from '../srs/stages'
import type { Mode } from './Study'

export interface Config { deck: string; mode: Mode }

export function Home({ db, config, onChange, onStart, onPractice }: { db: Db; config: Config; onChange: (c: Config) => void; onStart: () => void; onPractice: () => void }) {
  const [counts, setCounts] = useState<{ due: number; fresh: number } | null>(null)
  const [info, setInfo] = useState<{ next: string | null; mistakes: number }>({ next: null, mistakes: 0 })
  const [imported, setImported] = useState<DeckRecord[]>([])
  useEffect(() => {
    void db.getAll('decks').then((d) => {
      setImported(d)
      if (config.deck.startsWith('anki:') && !d.some((x) => x.id === config.deck)) onChange({ ...config, deck: 'all' }) // deleted
    })
  }, [db, config, onChange])
  useEffect(() => {
    let live = true
    void reviewCounts(db, config.deck, config.mode).then((c) => live && setCounts(c), () => live && setCounts({ due: 0, fresh: 0 }))
    return () => {
      live = false
    }
  }, [db, config.deck, config.mode])
  useEffect(() => {
    let live = true
    void Promise.all([db.getAll('cards'), db.getAll('reviews')]).then(([cards, reviews]) => {
      const now = new Date()
      const next = nextDue(cards, now)
      if (live) setInfo({ next: next && until(next, now), mistakes: mistakes(reviews, cards, now).size })
    }, () => {})
    return () => {
      live = false
    }
  }, [db])

  const pick = <K extends keyof Config>(k: K, label: string, opts: [Config[K], string][]) => (
    <label>
      {label}
      <select value={config[k]} onChange={(e) => onChange({ ...config, [k]: e.target.value })}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
  return (
    <div className="card form">
      <h2>Review</h2>
      <p className="counts">{counts ? `${counts.due} due · ${counts.fresh} new` : '…'}</p>
      {counts && counts.due + counts.fresh === 0 && <p>All caught up.{info.next && ` Next review ${info.next}.`}</p>}
      {pick('deck', 'Deck', [['all', 'All decks'], ['hira', 'Hiragana ひらがな'], ['kata', 'Katakana カタカナ'], ...imported.map((d): [string, string] => [d.id, d.name])])}
      {pick('mode', 'Mode', [['flashcard', 'Flashcards'], ['typing', 'Type the answer'], ['quiz', 'Multiple choice']])}
      {config.deck.startsWith('anki:') && config.mode !== 'flashcard' && <p>Imported decks work in flashcard mode.</p>}
      <div className="row2">
        {counts && counts.due + counts.fresh > 0 && <button className="primary" onClick={onStart}>Study</button>}
        {info.mistakes > 0 && <button onClick={onPractice}>Practise mistakes ({info.mistakes})</button>}
      </div>
    </div>
  )
}
