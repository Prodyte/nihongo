import { useEffect, useState } from 'react'
import { openDb, seedKana, type Db } from './db/db'
import { Home, type Config } from './pages/Home'
import { Decks } from './pages/Decks'
import { Stats } from './pages/Stats'
import { Study } from './pages/Study'

type View = 'home' | 'study' | 'stats' | 'decks'

export default function App() {
  const [db, setDb] = useState<Db | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('home')
  const [config, setConfig] = useState<Config>({ deck: 'hira', mode: 'flashcard' })

  useEffect(() => {
    openDb()
      .then(async (d) => {
        await seedKana(d)
        void navigator.storage?.persist?.()?.catch(() => {}) // best effort: stops the browser evicting progress under storage pressure
        setDb(d)
      })
      .catch((e) => setError(String(e)))
  }, [])

  if (error) return <main><p role="alert">Couldn't open local storage ({error}). Private browsing can block it.</p></main>
  if (!db) return <main><p>Loading…</p></main>
  return (
    <main>
      <header>
        <h1><span lang="ja">日本語</span> <small>nihongo</small></h1>
        <nav aria-label="Main">
          <button aria-current={view === 'home' || view === 'study' ? 'page' : undefined} onClick={() => setView('home')}>Study</button>
          <button aria-current={view === 'decks' ? 'page' : undefined} onClick={() => setView('decks')}>Decks</button>
          <button aria-current={view === 'stats' ? 'page' : undefined} onClick={() => setView('stats')}>Stats</button>
        </nav>
      </header>
      {view === 'study' ? (
        <Study db={db} deck={config.deck} mode={config.mode} onExit={() => setView('home')} />
      ) : view === 'decks' ? (
        <Decks db={db} />
      ) : view === 'stats' ? (
        <Stats db={db} />
      ) : (
        <Home db={db} config={config} onChange={setConfig} onStart={() => setView('study')} />
      )}
    </main>
  )
}
