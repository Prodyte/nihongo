import { useEffect, useState } from 'react'
import { ApkgError, parseApkg } from '../anki/apkg'
import { loadSql } from '../anki/sql'
import { Backup } from './Backup'
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
      const parsed = await parseApkg(await file.arrayBuffer(), await loadSql())
      if (!parsed.cards.length) throw new ApkgError('No cards found in that deck.')
      const r = await saveImport(db, parsed)
      setStatus({ text: `Imported ${r.added} new, ${r.updated} refreshed${r.skipped ? `, ${r.skipped} blank skipped` : ''}.` })
      reload()
    } catch (e) {
      setStatus({ text: e instanceof ApkgError ? e.message : `Import failed: ${e}`, bad: true })
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
    <Backup db={db} onRestored={reload} />
    </>
  )
}
