import { useEffect, useState } from 'react'
import { useJaVoice } from '../audio'
import { reviewCounts, type Db, type DeckRecord } from '../db/db'
import { Icon, type IconName } from '../icons'
import { DRILL_TITLE, learnedForDrills, verbsIn, type DrillKind } from '../path/drills'
import { canRecognise } from '../speech'
import { mistakes, nextDue, until } from '../srs/stages'
import type { Mode } from './Study'

export interface Config { deck: string; mode: Mode }

interface Tile { key: string; icon: IconName; title: string; blurb: string; go: () => void; off?: string; count?: string }

/** Review: the spaced-repetition queue first, then practice modes for what you've learned. */
export function Home({ db, config, onChange, onStart, onPractice, onDrill, onRead, onKana }: {
  db: Db; config: Config; onChange: (c: Config) => void; onStart: () => void; onPractice: () => void; onDrill: (k: DrillKind) => void; onRead: () => void; onKana: () => void
}) {
  const voice = useJaVoice()
  const [loaded, setLoaded] = useState<{ key: string; due: number; fresh: number } | null>(null)
  const key = `${config.deck}|${config.mode}`
  const counts = loaded?.key === key ? loaded : null // a different deck: never show the previous deck's numbers while loading
  const [info, setInfo] = useState<{ next: string | null; mistakes: number; words: number; verbs: number }>({ next: null, mistakes: 0, words: 0, verbs: 0 })
  const [imported, setImported] = useState<DeckRecord[]>([])
  useEffect(() => {
    void db.getAll('decks').then((d) => {
      setImported(d)
      if (config.deck.startsWith('anki:') && !d.some((x) => x.id === config.deck)) onChange({ ...config, deck: 'all' }) // deleted
    })
  }, [db, config, onChange])
  useEffect(() => {
    let live = true
    void reviewCounts(db, config.deck, config.mode).then((c) => live && setLoaded({ key, ...c }), () => live && setLoaded({ key, due: 0, fresh: 0 }))
    return () => {
      live = false
    }
  }, [db, config.deck, config.mode, key])
  useEffect(() => {
    let live = true
    void Promise.all([db.getAll('cards'), db.getAll('reviews'), learnedForDrills(db)]).then(([cards, reviews, items]) => {
      const now = new Date()
      const next = nextDue(cards, now)
      if (live) setInfo({ next: next && until(next, now), mistakes: mistakes(reviews, cards, now).size, words: items.length, verbs: verbsIn(items).length })
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
  const total = counts ? counts.due + counts.fresh : 0
  const listen = canRecognise()
  const needWords = info.words < 4 ? 'Learn a few words on the path first' : undefined
  const drill = (k: DrillKind, icon: IconName, blurb: string, off?: string): Tile => ({ key: k, icon, title: DRILL_TITLE[k], blurb, go: () => onDrill(k), off: off ?? needWords })
  const tiles: Tile[] = [
    drill('speak-read', 'mic', 'See it, say it. Your browser checks your pronunciation.', listen ? undefined : 'Needs speech recognition (Chrome or Safari)'),
    drill('speak-recall', 'mic', 'See the English, say the Japanese from memory.', listen ? undefined : 'Needs speech recognition (Chrome or Safari)'),
    drill('shadow', 'repeat', 'Hear it, then repeat it the same way. Great for accent.', !listen ? 'Needs speech recognition (Chrome or Safari)' : !voice ? 'Needs a Japanese voice on this device' : undefined),
    drill('listen', 'speaker', 'Type the word you hear; pick what a sentence means.', voice ? undefined : 'Needs a Japanese voice on this device'),
    drill('conjugate', 'shuffle', 'ます, ません, ました, て, た and ない forms of your verbs.', info.verbs < 3 ? 'Learn a few verbs on the path first' : undefined),
    { key: 'read', icon: 'book', title: 'Reading', blurb: 'Short stories with audio, furigana and tap-to-look-up.', go: onRead },
    { key: 'kana', icon: 'grid', title: 'Kana chart', blurb: 'Every hiragana and katakana, with sound.', go: onKana },
  ]

  return (
    <>
      <div className="page-head">
        <h2>Review</h2>
        <p>Keep what you’ve learned, and practise using it.</p>
      </div>
      <section className="card review-hero" aria-label="Spaced repetition">
        <div className="due">
          {counts && total === 0 ? <span className="big-number done" aria-hidden="true"><Icon name="check" size={44} /></span> : <strong className="big-number">{counts ? total : '–'}</strong>}
          <div>
            <p className="counts">{counts ? `${counts.due} due · ${counts.fresh} new` : '…'}</p>
            <p className="hint left">{total ? 'Cards come back just before you would forget them.' : `All caught up.${info.next ? ` Next review ${info.next}.` : ''}`}</p>
          </div>
        </div>
        <div className="row2 left">
          {total > 0 && <button className="primary big" onClick={onStart}>Study</button>}
          {info.mistakes > 0 && <button className="big" onClick={onPractice}>Practise mistakes ({info.mistakes})</button>}
        </div>
        <details className="options">
          <summary>Deck and mode</summary>
          {pick('deck', 'Deck', [['all', 'All decks'], ['hira', 'Hiragana ひらがな'], ['kata', 'Katakana カタカナ'], ...imported.map((d): [string, string] => [d.id, d.name])])}
          {pick('mode', 'Mode', [['flashcard', 'Flashcards'], ['typing', 'Type the answer'], ['quiz', 'Multiple choice']])}
          {config.deck.startsWith('anki:') && config.mode !== 'flashcard' && <p className="hint left">Imported decks work in flashcard mode.</p>}
        </details>
      </section>
      <h3 className="section-title">Practice</h3>
      <ul className="tiles-grid">
        {tiles.map((t) => (
          <li key={t.key}>
            <button className="tile-btn" disabled={!!t.off} onClick={t.go}>
              <span className="tile-icon"><Icon name={t.icon} /></span>
              <strong>{t.title}</strong>
              <small>{t.off ?? t.blurb}</small>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
