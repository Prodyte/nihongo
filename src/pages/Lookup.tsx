import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toKata } from '../data/kana'
import type { Db, StoredCard } from '../db/db'
import { ITEMS, written, type Item } from '../path/course'
import { byParts, ENTRIES, MAX, PARTS, search } from '../path/lookup'
import { setSaved } from '../path/progress'
import { stage } from '../srs/stages'
import { loadStrokes } from '../path/strokes'
import { Example } from '../path/ui/Example'
import { useRomaji } from '../path/ui/furigana'
import { Mnemonic } from '../path/ui/Mnemonic'
import { Pitch } from '../path/ui/Pitch'
import { Strokes } from '../path/ui/Strokes'
import { WriteBoard } from '../path/ui/WriteBoard'

export function Lookup({ db }: { db: Db }) {
  const romaji = useRomaji()
  const [query, setQuery] = useState('')
  const [cards, setCards] = useState<Map<string, StoredCard>>(new Map())
  const [saved, setSavedIds] = useState<string[]>([]) // newest first; one unsaved this visit stays listed, so its row (and focus) stays put
  const [byPart, setByPart] = useState(false)
  const [sel, setSel] = useState<string[]>([])
  useEffect(() => {
    void db.getAll('cards').then((all) => {
      setCards(new Map(all.map((c) => [c.id, c])))
      setSavedIds(all.filter((c) => (c.saved ?? 0) > 0).sort((a, b) => b.saved! - a.saved!).map((c) => c.id))
    }, () => {})
  }, [db])
  const q = useDeferredValue(query) // typing stays responsive while the list catches up
  const results = useMemo(() => search(q), [q])
  const parts = useMemo(() => byParts(sel), [sel])
  const onCard = (id: string, card: StoredCard | undefined) => {
    setCards((m) => { const n = new Map(m); if (card) n.set(id, card); else n.delete(id); return n })
    if ((card?.saved ?? 0) > 0) setSavedIds((s) => (s.includes(id) ? s : [id, ...s]))
  }
  const list = byPart ? parts.kanji : q.trim() ? results : saved.flatMap((id) => ITEMS.get(id) ?? [])

  return (
    <div className="card form">
      <h2>Lookup</h2>
      <div className="row2 left">
        <button aria-pressed={byPart} onClick={() => setByPart(!byPart)}>Kanji by parts</button>
        {byPart && <button onClick={() => setSel([])} aria-disabled={!sel.length}>Clear parts</button> /* not disabled: that would drop keyboard focus */}
      </div>
      {byPart ? (
        <div className="chips parts" role="group" aria-label="Parts">
          {PARTS.map(([p, name]) => {
            const on = sel.includes(p)
            return <button key={p} lang="ja" aria-pressed={on} aria-label={name ? `${p} ${name}` : p} title={name} disabled={!on && !parts.open.has(p)} onClick={() => setSel(on ? sel.filter((x) => x !== p) : [...sel, p])}>{p}</button>
          })}
        </div>
      ) : (
        <label>
          Search words and kanji
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="日, taberu, たべる, eat…" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        </label>
      )}
      <p role="status" className="hint">{byPart ? (sel.length ? `${parts.kanji.length} kanji with ${sel.join(' + ')}` : 'Pick parts to find the kanji made of them.')
        : q.trim() ? (results.length ? `${results.length === MAX ? `First ${MAX}` : results.length} result${results.length === 1 ? '' : 's'}` : 'Nothing found in the course.') : `${ENTRIES.length} words and kanji from kana to N2.`}</p>
      {!byPart && !q.trim() && saved.length > 0 && <h3>Saved words</h3>}
      <ul className="results">
        {list.map((it) => {
          const card = cards.get(it.id)
          const st = card && (stage(card.fsrs) ?? 'New')
          return (
            <li key={it.id}>
              <Details summary={<>
                <span className="jp" lang="ja">{it.written ?? it.kanji ?? it.jp}</span>
                {it.kind === 'word' && (it.written ?? it.kanji) && <span lang="ja"> {it.jp}</span>}
                <span className="gloss"> {it.gloss}</span>
                <span className="tags">
                  {it.kind === 'kanji' && <span className="tag">kanji</span>}
                  {it.level && <span className="tag">N{it.level}</span>}
                  {st && <span className={`tag ${st.toLowerCase()}`}>{st}</span>}
                </span>
              </>}>
                <Study db={db} it={it} card={card} onCard={onCard} />
                {it.kind === 'kanji' ? <KanjiDetail it={it} /> : <><Pitch item={it} />{romaji && <p className="hint">{it.romaji}</p>}<Mnemonic item={it} /><Example item={it} /></>}
                <a href={`https://jisho.org/search/${encodeURIComponent((it.written ?? it.kanji ?? written(it)) + (it.kind === 'kanji' ? ' #kanji' : ''))}`} target="_blank" rel="noopener noreferrer">
                  Jisho<span aria-hidden="true">{'\u00a0↗'}</span><span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </Details>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** "Study this": saves the item and makes its card now (so it comes up in Review); unsaving keeps a card already reviewed. */
export function Study({ db, it, card, onCard }: { db: Db; it: Item; card?: StoredCard; onCard: (id: string, c: StoredCard | undefined) => void }) {
  const on = (card?.saved ?? 0) > 0
  const toggle = () => void setSaved(db, it, !on).then((c) => onCard(it.id, c), () => {}) // a double tap asks for the same state twice: harmless
  return (
    <div className="row2 left">
      <button aria-pressed={on} onClick={toggle}>{on ? 'Studying' : 'Study this'}</button>
      {!on && (card?.saved ?? 0) < 0 && card!.fsrs.reps > 0 && <p className="hint" role="status">Still in Review: you have studied it, so its progress is kept.</p>}
    </div>
  )
}

/** A <details> whose body renders only while open: a closed row costs nothing (no example fetch, stroke SVG or buttons). */
function Details({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <details onToggle={(e) => setOpen(e.currentTarget.open)}><summary>{summary}</summary>{open && children}</details>
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
      <Mnemonic item={it} />
      {examples.map((w) => <p key={w.id}><span lang="ja">{w.written ?? w.kanji ?? w.jp} {w.jp}</span> {w.gloss}</p>)}
      <p className="hint">{it.strokes} strokes</p>
    </div>
  )
}
