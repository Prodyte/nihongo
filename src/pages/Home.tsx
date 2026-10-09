import { useEffect, useState } from 'react'
import { State } from 'ts-fsrs'
import { getCards, newToday, type Db } from '../db/db'
import { DAILY_NEW, type Mode } from './Study'

export interface Config { deck: string; mode: Mode }

export function Home({ db, config, onChange, onStart }: { db: Db; config: Config; onChange: (c: Config) => void; onStart: () => void }) {
  const [counts, setCounts] = useState<{ due: number; fresh: number } | null>(null)
  useEffect(() => {
    void (async () => {
      const cards = await getCards(db, config.deck)
      const now = new Date()
      const left = Math.max(0, DAILY_NEW - (await newToday(db)))
      setCounts({
        due: cards.filter((c) => c.fsrs.state !== State.New && c.fsrs.due <= now).length,
        fresh: Math.min(left, cards.filter((c) => c.fsrs.state === State.New).length),
      })
    })()
  }, [db, config.deck])

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
      <h2>Today</h2>
      <p className="counts">{counts ? `${counts.due} due · ${counts.fresh} new` : '…'}</p>
      {pick('deck', 'Deck', [['hira', 'Hiragana ひらがな'], ['kata', 'Katakana カタカナ'], ['all', 'Both']])}
      {pick('mode', 'Mode', [['flashcard', 'Flashcards'], ['typing', 'Type the romaji'], ['quiz', 'Multiple choice']])}
      <button className="primary" disabled={!counts || counts.due + counts.fresh === 0} onClick={onStart}>Study</button>
    </div>
  )
}
