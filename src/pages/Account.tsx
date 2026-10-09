import { useEffect, useState } from 'react'
import type { Db } from '../db/db'
import { lastSync, session, supabase, sync } from '../sync'

/** Sign in with an emailed code (works inside an installed app, unlike a link) and keep progress in sync across devices. */
export function Account({ db, onSynced }: { db: Db; onSynced: () => void }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined) // undefined: checking; null: signed out
  const [typed, setTyped] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ text: string; bad?: boolean } | null>(null)

  useEffect(() => {
    void session().then((s) => setEmail(s?.user.email ?? null), () => setEmail(null))
  }, [])

  const act = (f: () => Promise<void>) => async () => {
    setBusy(true)
    setStatus(null)
    try {
      await f()
    } catch (e) {
      setStatus({ text: e instanceof Error ? e.message : String(e), bad: true })
    } finally {
      setBusy(false)
    }
  }
  const syncNow = async () => {
    if (await sync(db)) onSynced()
    setStatus({ text: 'Synced.' })
  }
  const send = act(async () => {
    const { error } = await (await supabase()).auth.signInWithOtp({ email: typed.trim(), options: { emailRedirectTo: location.origin + location.pathname } })
    if (error) throw error
    setSent(true)
  })
  const verify = act(async () => {
    const { data, error } = await (await supabase()).auth.verifyOtp({ email: typed.trim(), token: code.trim(), type: 'email' })
    if (error) throw error
    setEmail(data.user?.email ?? typed.trim())
    setSent(false)
    setCode('')
    await syncNow()
  })
  const signOut = act(async () => {
    await (await supabase()).auth.signOut()
    setEmail(null)
    setStatus({ text: 'Signed out. Your progress stays on this device.' })
  })

  const last = lastSync()
  return (
    <div className="card form">
      <h2>Account and sync</h2>
      {email === undefined ? <p>…</p> : email ? (
        <>
          <p>Signed in as <strong>{email}</strong>. Progress syncs when you open and leave the app.{last && ` Last synced ${new Date(last).toLocaleString()}.`}</p>
          <div className="row2 left">
            <button className="primary" disabled={busy} onClick={() => void act(syncNow)()}>Sync now</button>
            <button disabled={busy} onClick={() => void signOut()}>Sign out</button>
          </div>
        </>
      ) : (
        <>
          <p>Sign in to keep your cards, lessons and streak on all your devices. Optional: everything works without it.</p>
          <form onSubmit={(e) => { e.preventDefault(); void (sent ? verify() : send()) }}>
            <label>
              Email
              <input type="email" required autoComplete="email" value={typed} disabled={sent} onChange={(e) => setTyped(e.target.value)} />
            </label>
            {sent && (
              <label>
                Code from the email
                <input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
              </label>
            )}
            <div className="row2 left">
              <button className="primary" disabled={busy}>{sent ? 'Sign in' : 'Email me a code'}</button>
              {sent && <button type="button" disabled={busy} onClick={() => { setSent(false); setCode('') }}>Use another email</button>}
            </div>
          </form>
        </>
      )}
      {status && <p role="status" className={status.bad ? 'bad' : ''}>{status.text}</p>}
    </div>
  )
}
