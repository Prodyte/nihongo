import { useEffect, useState } from 'react'
import { State } from 'ts-fsrs'
import { newToday, studyCards, type Db, type DeckRecord } from '../db/db'
import { DAILY_NEW, type Mode } from './Study'

export interface Config { deck: string; mode: Mode }

export function Home({ db, config, autoplay, onChange, onAutoplay, onStart }: { db: Db; config: Config; autoplay: boolean; onChange: (c: Config) => void; onAutoplay: (v: boolean) => void; onStart: () => void }) {
  const [counts, setCounts] = useState<{ due: number; fresh: number } | null>(null)
  const [imported, setImported] = useState<DeckRecord[]>([])
  useEffect(() => {
    void db.getAll('decks').then((d) => {
      setImported(d)
      if (config.deck.startsWith('anki:') && !d.some((x) => x.id === config.deck)) onChange({ ...config, deck: 'hira' }) // deleted
    })
  }, [db, config, onChange])
  useEffect(() => {
    let live = true
    void (async () => {
      const cards = await studyCards(db, config.deck, config.mode)
      const now = new Date()
      const left = Math.max(0, DAILY_NEW - (await newToday(db)))
      if (live)
        setCounts({
          due: cards.filter((c) => c.fsrs.state !== State.New && c.fsrs.due <= now).length,
          fresh: Math.min(left, cards.filter((c) => c.fsrs.state === State.New).length),
        })
    })().catch(() => live && setCounts({ due: 0, fresh: 0 }))
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
      <h2>Review today</h2>
      <p className="counts">{counts ? `${counts.due} due · ${counts.fresh} new` : '…'}</p>
      {pick('deck', 'Deck', [['hira', 'Hiragana ひらがな'], ['kata', 'Katakana カタカナ'], ['all', 'All decks'], ...imported.map((d): [string, string] => [d.id, d.name])])}
      {pick('mode', 'Mode', [['flashcard', 'Flashcards'], ['typing', 'Type the romaji'], ['quiz', 'Multiple choice']])}
      <label className="check">
        <input type="checkbox" checked={autoplay} onChange={(e) => onAutoplay(e.target.checked)} />
        Play audio automatically
      </label>
      {config.deck.startsWith('anki:') && config.mode !== 'flashcard' && <p>Imported decks work in flashcard mode.</p>}
      <button className="primary" disabled={!counts || counts.due + counts.fresh === 0} onClick={onStart}>Study</button>
    </div>
  )
}
