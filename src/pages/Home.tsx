import { useEffect, useState } from 'react'
import { useJaVoice } from '../audio'
import { BUILTIN_DECKS, reviewCounts, studyCards, weakSpotReviews, type Db, type DeckRecord, type StoredCard } from '../db/db'
import { Icon, type IconName } from '../icons'
import { DRILL_TITLE, learnedForDrills, verbsIn, type DrillKind } from '../path/drills'
import { canRecognise } from '../speech'
import { MOCK_LEVELS, mockBestKey, type MockLevel } from '../path/mock'
import { readInt } from '../settings'
import { Ruby } from '../path/ui/Ruby'
import { nextDue, until, weakSpots } from '../srs/stages'
import type { Mode } from './Study'

export interface Config { deck: string; mode: Mode }

/** The path's decks, listed before their first card exists (the kanji deck starts with the first kanji lesson). */
const BUILT_IN = [BUILTIN_DECKS.word, BUILTIN_DECKS.kanji, BUILTIN_DECKS.sentence].map((d): [string, string] => [d.id, d.name])

interface Tile { key: string; icon: IconName; title: string; blurb: string; go: () => void; off?: string; count?: string }

/** Review: the spaced-repetition queue first, then practice modes for what you've learned. */
export function Home({ db, config, onChange, onStart, onPractice, onDrill, onRead, onKana, onMock, onListen }: {
  db: Db; config: Config; onChange: (c: Config) => void; onStart: () => void; onPractice: () => void; onDrill: (k: DrillKind) => void; onRead: () => void; onKana: () => void; onMock?: (level: MockLevel) => void; onListen?: () => void
}) {
  const voice = useJaVoice()
  const [loaded, setLoaded] = useState<{ key: string; due: number; fresh: number; empty?: boolean } | null>(null)
  const key = `${config.deck}|${config.mode}`
  const counts = loaded?.key === key ? loaded : null // a different deck: never show the previous deck's numbers while loading
  const [info, setInfo] = useState<{ next: string | null; weak: { card: StoredCard; why: string }[]; words: number; verbs: number }>({ next: null, weak: [], words: 0, verbs: 0 })
  const [imported, setImported] = useState<DeckRecord[]>([])
  useEffect(() => {
    void db.getAll('decks').then((d) => {
      setImported(d)
      if (config.deck.startsWith('anki:') && !d.some((x) => x.id === config.deck)) onChange({ ...config, deck: 'all' }) // deleted
    })
  }, [db, config, onChange])
  useEffect(() => {
    let live = true
    const empty = BUILT_IN.some(([id]) => id === config.deck) ? db.countFromIndex('cards', 'by-deck', config.deck).then((n) => n === 0) : Promise.resolve(false)
    void Promise.all([reviewCounts(db, config.deck, config.mode), empty]).then(([c, e]) => live && setLoaded({ key, ...c, empty: e }), () => live && setLoaded({ key, due: 0, fresh: 0 }))
    return () => {
      live = false
    }
  }, [db, config.deck, config.mode, key])
  useEffect(() => {
    let live = true
    // studyCards: the same cards a weak-spots session can show
    const now = new Date()
    void (async () => {
      const cards = await studyCards(db, 'all', config.mode)
      const [reviews, items] = await Promise.all([weakSpotReviews(db, cards, now), learnedForDrills(db)])
      const next = nextDue(cards, now)
      if (live) setInfo({ next: next && until(next, now), weak: weakSpots(reviews, cards, now).flatMap((w) => { const card = cards.find((c) => c.id === w.id); return card ? [{ card, why: w.why }] : [] }), words: items.length, verbs: verbsIn(items).length })
    })().catch(() => {})
    return () => {
      live = false
    }
  }, [db, config.mode])

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
    ...(onListen ? [{ key: 'listening', icon: 'speaker', title: 'Listening comprehension', blurb: 'JLPT-style dialogues and stories: hear them, answer, then read along.', go: onListen, off: voice ? undefined : 'Needs a Japanese voice on this device' } satisfies Tile] : []),
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
            <p className="hint left">{total ? 'Cards come back just before you would forget them.' : counts?.empty ? 'No cards here yet: they arrive as you finish lessons on the path.' : `All caught up.${info.next ? ` Next review ${info.next}.` : ''}`}</p>
          </div>
        </div>
        {total > 0 && <div className="row2 left"><button className="primary big" onClick={onStart}>Study</button></div>}
        <details className="options">
          <summary>Deck and mode</summary>
          {pick('deck', 'Deck', [['all', 'All decks'], ['kana', 'Kana かな カナ'], ...BUILT_IN, ...imported.filter((d) => !BUILT_IN.some(([id]) => id === d.id)).map((d): [string, string] => [d.id, d.name])])}
          {pick('mode', 'Mode', [['flashcard', 'Flashcards'], ['typing', 'Type the answer'], ['quiz', 'Multiple choice']])}
          {config.deck.startsWith('anki:') && config.mode !== 'flashcard' && <p className="hint left">Imported decks work in flashcard mode.</p>}
        </details>
      </section>
      {info.weak.length > 0 && (
        <section className="card weak" aria-labelledby="weak-title">
          <h3 id="weak-title">Weak spots</h3>
          <p className="hint left">The cards you’ve missed most lately. Practising them doesn’t change their schedule.</p>
          <ul>
            {info.weak.slice(0, 5).map(({ card, why }) => (
              <li key={card.id}>
                <span className="jp" lang="ja">{card.html ? card.front.replace(/<[^>]*>/g, '').slice(0, 20) : <Ruby text={card.front} reading={card.reading} />}</span>
                <span className="gloss">{card.html ? '' : card.back[0]}</span>
                <small>{why}</small>
              </li>
            ))}
          </ul>
          <button className="big" onClick={onPractice}>Practise weak spots ({info.weak.length})</button>
        </section>
      )}
      <h3 className="section-title">Practice</h3>
      <ul className="tiles-grid">
        {tiles.map((t) => (
          <li key={t.key}>
            <button className="tile-btn" disabled={!!t.off} onClick={t.go}>
              <span className="tile-icon"><Icon name={t.icon} /></span>
              <strong>{t.title}</strong>
              {t.off ? <small className="why"><Icon name="lock" size={14} />{t.off}</small> : <small>{t.blurb}</small>}
            </button>
          </li>
        ))}
      </ul>
      {onMock && (
        <section className="card mock-entry" aria-labelledby="mock-title">
          <h3 id="mock-title">Mock JLPT test</h3>
          <p className="hint left">A timed exam over a whole level, learned or not. Practice only: nothing is scheduled.</p>
          <div className="row2 left">
            {MOCK_LEVELS.map((l) => {
              const best = readInt(mockBestKey(l), -1)
              return <button key={l} onClick={() => onMock(l)} aria-label={`Mock N${l}${best >= 0 ? `, best ${best}%` : ''}`}>N{l}{best >= 0 && <small>Best {best}%</small>}</button>
            })}
          </div>
        </section>
      )}
    </>
  )
}
