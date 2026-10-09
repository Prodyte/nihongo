import { useEffect, useState } from 'react'
import type { Db } from '../db/db'
import { lastSync, session, supabase, sync } from '../sync'

/** Sign in and keep progress in sync across devices. */
export function Account({ db, onSynced }: { db: Db; onSynced: () => void }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined) // undefined: checking; null: signed out
  const [typed, setTyped] = useState('')
  const [password, setPassword] = useState('')
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
  // email + password: works inside an installed app too (sign-in links open the browser, whose storage an iPhone app doesn't share)
  const signIn = (create: boolean) => act(async () => {
    const auth = (await supabase()).auth
    const creds = { email: typed.trim(), password }
    const { data, error } = create ? await auth.signUp(creds) : await auth.signInWithPassword(creds)
    if (error) throw error
    if (!data.session) throw new Error('Account created: confirm it from the email Supabase sent, then sign in.')
    setEmail(data.user?.email ?? creds.email)
    setPassword('')
    await syncNow()
  })
  const signOut = act(async () => {
    await (await supabase()).auth.signOut()
    setEmail(null)
    onSynced() // the header's Sign in button comes back
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
          <form onSubmit={(e) => { e.preventDefault(); void signIn(false)() }}>
            <label>
              Email
              <input type="email" required autoComplete="email" value={typed} onChange={(e) => setTyped(e.target.value)} />
            </label>
            <label>
              Password
              <input type="password" required minLength={6} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <div className="row2 left">
              <button className="primary" disabled={busy}>Sign in</button>
              <button type="button" disabled={busy} onClick={(e) => { if (e.currentTarget.form?.reportValidity()) void signIn(true)() }}>Create account</button>
            </div>
          </form>
        </>
      )}
      {status && <p role="status" className={status.bad ? 'bad' : ''}>{status.text}</p>}
    </div>
  )
}
