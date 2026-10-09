import { useState } from 'react'
import { BackupError, exportBackup, importBackup } from '../db/backup'
import type { Db } from '../db/db'

const MAX_BYTES = 100 * 1024 * 1024

export function Backup({ db, onRestored }: { db: Db; onRestored: () => void }) {
  const [status, setStatus] = useState<{ text: string; bad?: boolean } | null>(null)

  async function download() {
    try {
      const url = URL.createObjectURL(new Blob([await exportBackup(db)], { type: 'application/json' }))
      const a = Object.assign(document.createElement('a'), { href: url, download: `nihongo-backup-${new Date().toISOString().slice(0, 10)}.json` })
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000) // revoking immediately can cancel the download in Safari/Firefox
      setStatus({ text: 'Backup downloaded.' })
    } catch (e) {
      setStatus({ text: `Export failed: ${e}`, bad: true })
    }
  }

  async function restore(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_BYTES) return setStatus({ text: 'That file is over 100 MB, too large to be a backup.', bad: true })
    if (!window.confirm('Restoring replaces all current progress (cards, lessons, streak) with the backup. Backups made before the learning path have no lesson progress, so restoring one resets it. Continue?')) return
    try {
      const r = await importBackup(db, await file.text())
      setStatus({ text: `Restored ${r.cards} cards and ${r.reviews} reviews.` })
      onRestored()
    } catch (e) {
      setStatus({ text: e instanceof BackupError ? e.message : `Restore failed: ${e}`, bad: true })
    }
  }

  return (
    <div className="card">
      <h2>Backup</h2>
      <p>Your progress lives only in this browser. Clearing site data erases it, so download a backup now and then. Images and audio of imported decks aren't included; re-import the <code>.apkg</code> to restore them.</p>
      <button onClick={() => void download()}>Download backup</button>
      <label>
        Restore from backup
        <input type="file" accept=".json,application/json" onChange={(e) => { void restore(e.target.files?.[0]); e.target.value = '' }} />
      </label>
      {status && <p role="status" className={status.bad ? 'bad' : ''}>{status.text}</p>}
    </div>
  )
}
