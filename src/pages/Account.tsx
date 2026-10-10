import { useEffect, useState } from 'react'
import type { Db } from '../db/db'
import { Icon } from '../icons'
import { lastSync, session, supabase, sync } from '../sync'

/** Sign in and keep progress in sync across devices. */
export function Account({ db, onSynced }: { db: Db; onSynced: () => void }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined) // undefined: checking; null: signed out
  const [typed, setTyped] = useState('')
  const [password, setPassword] = useState('')
  const [create, setCreate] = useState(false)
  const [show, setShow] = useState(false)
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
  const submit = act(async () => {
    const auth = (await supabase()).auth
    const creds = { email: typed.trim(), password }
    const { data, error } = create ? await auth.signUp({ ...creds, options: { emailRedirectTo: location.origin + location.pathname } }) : await auth.signInWithPassword(creds)
    if (error) throw error
    if (!data.session) {
      setCreate(false)
      setStatus({ text: `Almost done: open the link we emailed to ${creds.email}, then sign in here.` })
      return
    }
    setPassword('')
    setEmail(data.user?.email ?? creds.email)
    onSynced() // the header shows the account icon
    await syncNow()
  })
  const signOut = act(async () => {
    await (await supabase()).auth.signOut()
    setEmail(null)
    onSynced() // the header's Sign in button comes back
    setStatus({ text: 'Signed out. Your progress stays on this device.' })
  })

  const last = lastSync()
  if (email === undefined) return <div className="card account" aria-busy="true"><div className="skeleton" /></div>
  return (
    <div className="card account">
      <span className="account-icon" aria-hidden="true"><Icon name="user" size={28} /></span>
      {email ? (
        <>
          <h2>Account and sync</h2>
          <p className="hint">Signed in as <strong>{email}</strong></p>
          <p className="hint">Progress syncs when you open and leave the app.{last && <><br />Last synced {new Date(last).toLocaleString()}.</>}</p>
          <button className="primary big" disabled={busy} onClick={() => void act(syncNow)()}>{busy ? 'Syncing…' : 'Sync now'}</button>
          <button className="link-btn" disabled={busy} onClick={() => void signOut()}>Sign out</button>
        </>
      ) : (
        <>
          <h2>{create ? 'Create your account' : 'Sign in'}</h2>
          <p className="hint">Keep your cards, lessons and streak on all your devices. Optional: everything works without an account.</p>
          <form onSubmit={(e) => { e.preventDefault(); void submit() }}>
            <label>
              Email
              <input type="email" required autoComplete="email" value={typed} onChange={(e) => setTyped(e.target.value)} />
            </label>
            <div className="field">
              <label htmlFor="account-password">Password</label>
              <span className="password">
                <input id="account-password" type={show ? 'text' : 'password'} required minLength={6} autoComplete={create ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={create ? 'password-hint' : undefined} />
                <button type="button" aria-pressed={show} aria-label="Show password" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
              </span>
              {create && <small id="password-hint" className="hint left">At least 6 characters.</small>}
            </div>
            <button className="primary big" disabled={busy}>{busy ? 'One moment…' : create ? 'Create account' : 'Sign in'}</button>
          </form>
          <p className="hint">
            {create ? 'Already have an account? ' : 'New here? '}
            <button className="link-btn" onClick={() => { setCreate(!create); setStatus(null) }}>{create ? 'Sign in' : 'Create an account'}</button>
          </p>
        </>
      )}
      {status && <p role="status" className={status.bad ? 'bad' : 'note'}>{status.text}</p>}
    </div>
  )
}
