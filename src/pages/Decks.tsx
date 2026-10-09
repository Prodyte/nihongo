import { useEffect, useState } from 'react'
import { loadSql } from '../anki/sql'
import { Backup } from './Backup'
import { DECK_LINKS } from '../data/deckLinks'
import { deleteDeck, saveImport, type Db, type DeckRecord } from '../db/db'

const MAX_BYTES = 500 * 1024 * 1024 // ponytail: crude guard against memory exhaustion; stream media if bigger decks matter

export function Decks({ db }: { db: Db }) {
  const [decks, setDecks] = useState<(DeckRecord & { count: number })[]>([])
  const [status, setStatus] = useState<{ text: string; bad?: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  const [tick, setTick] = useState(0) // bump to reload the list
  const reload = () => setTick((t) => t + 1)
  useEffect(() => {
    let live = true
    void (async () => {
      const all = await db.getAll('decks')
      const withCounts = await Promise.all(all.map(async (d) => ({ ...d, count: await db.countFromIndex('cards', 'by-deck', d.id) })))
      if (live) setDecks(withCounts)
    })().catch((e) => live && setStatus({ text: `Couldn't load decks (${e}).`, bad: true }))
    return () => {
      live = false
    }
  }, [db, tick])

  async function onFile(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_BYTES) return setStatus({ text: 'That file is over 500 MB, too large to import in the browser.', bad: true })
    setBusy(true)
    setStatus({ text: `Reading ${file.name}…` })
    try {
      const { parseApkg } = await import('../anki/apkg') // lazy: jszip + zstd stay out of the main bundle
      const bytes = await file.arrayBuffer()
      setStatus({ text: `Unpacking ${file.name} (${Math.round(file.size / 1048576)} MB)…` })
      const parsed = await parseApkg(bytes, await loadSql())
      setStatus({ text: `Saving ${parsed.cards.length} cards and ${parsed.media.size} media files…` })
      const r = await saveImport(db, parsed)
      setStatus({ text: `Imported ${r.added} new, ${r.updated} refreshed${r.skipped ? `, ${r.skipped} blank skipped` : ''}.` })
      reload()
    } catch (e) {
      setStatus({ text: e instanceof Error && e.name === 'ApkgError' ? e.message : `Import failed: ${e}`, bad: true })
    } finally {
      setBusy(false)
    }
  }

  async function remove(d: DeckRecord) {
    if (!window.confirm(`Delete "${d.name}" and its review history?`)) return
    await deleteDeck(db, d.id)
    reload()
  }

  return (
    <>
    <div className="card">
      <h2>Decks</h2>
      <p>Import an Anki <code>.apkg</code> from AnkiWeb or your own collection. It's read in your browser and never uploaded.</p>
      <label>
        Import deck
        <input type="file" accept=".apkg" disabled={busy} onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = '' }} />
      </label>
      {status && <p role="status" className={status.bad ? 'bad' : ''}>{status.text}</p>}
      <ul className="decks">
        {decks.length === 0 && <li>No imported decks yet.</li>}
        {decks.map((d) => (
          <li key={d.id}>
            <span>{d.name} <small>({d.count} cards)</small></span>
            <button onClick={() => void remove(d)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
    <div className="card">
      <h2>Find decks</h2>
      <p>Download a deck's <code>.apkg</code> file, then import it above. These are the authors' own decks (not part of this app), so check each one's terms.</p>
      <ul className="decks links">
        {DECK_LINKS.map((d) => (
          <li key={d.url}>
            <a href={d.url} target="_blank" rel="noopener noreferrer">{d.name}<span aria-hidden="true"> ↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
            <small>{d.blurb}</small>
          </li>
        ))}
      </ul>
    </div>
    <Backup db={db} onRestored={reload} />
    </>
  )
}
