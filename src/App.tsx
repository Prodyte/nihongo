import { useEffect, useState } from 'react'
import { openDb, seedKana, type Db } from './db/db'
import { Home, type Config } from './pages/Home'
import { Stats } from './pages/Stats'
import { Study } from './pages/Study'

type View = 'home' | 'study' | 'stats'

export default function App() {
  const [db, setDb] = useState<Db | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('home')
  const [config, setConfig] = useState<Config>({ deck: 'hira', mode: 'flashcard' })

  useEffect(() => {
    openDb()
      .then(async (d) => {
        await seedKana(d)
        setDb(d)
      })
      .catch((e) => setError(String(e)))
  }, [])

  if (error) return <main><p role="alert">Couldn't open local storage ({error}). Private browsing can block it.</p></main>
  if (!db) return <main><p>Loading…</p></main>
  return (
    <main>
      <header>
        <h1>日本語 <small>nihongo</small></h1>
        <nav>
          <button aria-current={view === 'home'} onClick={() => setView('home')}>Study</button>
          <button aria-current={view === 'stats'} onClick={() => setView('stats')}>Stats</button>
        </nav>
      </header>
      {view === 'study' ? (
        <Study db={db} deck={config.deck} mode={config.mode} onExit={() => setView('home')} />
      ) : view === 'stats' ? (
        <Stats db={db} />
      ) : (
        <Home db={db} config={config} onChange={setConfig} onStart={() => setView('study')} />
      )}
    </main>
  )
}
