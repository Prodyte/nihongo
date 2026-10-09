import { useEffect, useState } from 'react'
import { reviewCounts, type Db, type DeckRecord } from '../db/db'
import type { Mode } from './Study'

export interface Config { deck: string; mode: Mode }

export function Home({ db, config, onChange, onStart }: { db: Db; config: Config; onChange: (c: Config) => void; onStart: () => void }) {
  const [counts, setCounts] = useState<{ due: number; fresh: number } | null>(null)
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

  const pick = <K extends keyof Config>(k: K, label: string, opts: [Config[K], string][]) => (
    <label>
      {label}
      <select value={config[k]} onChange={(e) => onChange({ ...config, [k]: e.target.value })}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
  return (
    <div className="card">
      <h2>Review</h2>
      <p className="counts">{counts ? `${counts.due} due · ${counts.fresh} new` : '…'}</p>
      {pick('deck', 'Deck', [['all', 'All decks'], ['hira', 'Hiragana ひらがな'], ['kata', 'Katakana カタカナ'], ...imported.map((d): [string, string] => [d.id, d.name])])}
      {pick('mode', 'Mode', [['flashcard', 'Flashcards'], ['typing', 'Type the romaji'], ['quiz', 'Multiple choice']])}
      {config.deck.startsWith('anki:') && config.mode !== 'flashcard' && <p>Imported decks work in flashcard mode.</p>}
      <button className="primary" disabled={!counts || counts.due + counts.fresh === 0} onClick={onStart}>Study</button>
    </div>
  )
}
