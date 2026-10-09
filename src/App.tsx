import { useEffect, useState } from 'react'
import { warmUpVoices } from './audio'
import { openDb, seedKana, type Db } from './db/db'
import { Home, type Config } from './pages/Home'
import { Lesson } from './pages/Lesson'
import { Path } from './pages/Path'
import { lessonById } from './path/course'
import { readBool, writeBool } from './settings'
import { Decks } from './pages/Decks'
import { Stats } from './pages/Stats'
import { Study } from './pages/Study'

type View = 'path' | 'lesson' | 'review' | 'study' | 'stats' | 'decks'

export default function App() {
  const [db, setDb] = useState<Db | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('path')
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [autoplay, setAutoplay] = useState(() => readBool('nihongo.autoplay', true))
  const [config, setConfig] = useState<Config>({ deck: 'hira', mode: 'flashcard' })

  useEffect(() => {
    warmUpVoices()
    openDb()
      .then(async (d) => {
        await seedKana(d)
        void navigator.storage?.persist?.()?.catch(() => {}) // best effort: stops the browser evicting progress under storage pressure
        setDb(d)
      })
      .catch((e) => setError(String(e)))
  }, [])

  const startLesson = (id: string) => { setLessonId(id); setView('lesson') }
  const inLesson = view === 'lesson' && !!lessonId && !!lessonById(lessonId) // lessons are full-screen: no tabs to wander off to

  if (error) return <main><p role="alert">Couldn't open local storage ({error}). Private browsing can block it.</p></main>
  if (!db) return <main><p>Loading…</p></main>
  return (
    <main>
      <header>
        <h1><span lang="ja">日本語</span> <small>nihongo</small></h1>
        {!inLesson && <nav aria-label="Main">
          <button aria-current={view === 'path' || view === 'lesson' ? 'page' : undefined} onClick={() => setView('path')}>Path</button>
          <button aria-current={view === 'review' || view === 'study' ? 'page' : undefined} onClick={() => setView('review')}>Review</button>
          <button aria-current={view === 'decks' ? 'page' : undefined} onClick={() => setView('decks')}>Decks</button>
          <button aria-current={view === 'stats' ? 'page' : undefined} onClick={() => setView('stats')}>Stats</button>
        </nav>}
      </header>
      {inLesson ? (
        <Lesson key={lessonId} db={db} lesson={lessonById(lessonId)!} autoplay={autoplay} onExit={() => setView('path')} onStart={startLesson} />
      ) : view === 'study' ? (
        <Study db={db} deck={config.deck} mode={config.mode} autoplay={autoplay} onExit={() => setView('review')} />
      ) : view === 'decks' ? (
        <Decks db={db} />
      ) : view === 'stats' ? (
        <Stats db={db} />
      ) : view === 'review' ? (
        <Home db={db} config={config} autoplay={autoplay} onChange={setConfig} onAutoplay={(v) => { setAutoplay(v); writeBool('nihongo.autoplay', v) }} onStart={() => setView('study')} />
      ) : (
        <Path db={db} onStart={startLesson} />
      )}
    </main>
  )
}
