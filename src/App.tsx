import { useEffect, useState } from 'react'
import { warmUpVoices } from './audio'
import { openDb, seedKana, type Db } from './db/db'
import { Icon } from './icons'
import { Decks } from './pages/Decks'
import { Home, type Config } from './pages/Home'
import { Lesson } from './pages/Lesson'
import { Path } from './pages/Path'
import { Settings } from './pages/Settings'
import { Stats } from './pages/Stats'
import { Study } from './pages/Study'
import { Today } from './pages/Today'
import { lessonById } from './path/course'
import { readBool, writeBool } from './settings'

type Tab = 'today' | 'path' | 'review' | 'more'
type View = Tab | 'lesson' | 'study' | 'decks' | 'stats' | 'settings'
const TABS: [Tab, string][] = [['today', 'Today'], ['path', 'Path'], ['review', 'Review'], ['more', 'More']]
const TAB_OF: Record<View, Tab> = { today: 'today', path: 'path', lesson: 'path', review: 'review', study: 'review', more: 'more', decks: 'more', stats: 'more', settings: 'more' }
const MORE: [View, string, string][] = [
  ['decks', 'Decks', 'Import Anki decks, find good ones'],
  ['stats', 'Stats', 'Your reviews and cards'],
  ['settings', 'Settings', 'Daily goal, theme, audio, backup'],
]

export default function App() {
  const [db, setDb] = useState<Db | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('today')
  const [back, setBack] = useState<View>('today') // where a lesson or review session returns to
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [autoplay, setAutoplay] = useState(() => readBool('nihongo.autoplay', true))
  const [config, setConfig] = useState<Config>({ deck: 'all', mode: 'flashcard' }) // the Review tab's choice
  const [session, setSession] = useState<Config>(config) // what the running review studies (Today's doesn't change the Review tab)

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
  useEffect(() => { window.scrollTo(0, 0) }, [view]) // braces: scroll methods may return a Promise, which React would take for a cleanup

  const startLesson = (id: string) => { setBack(view); setLessonId(id); setView('lesson') }
  const study = (from: View, c: Config) => { setSession(c); setBack(from); setView('study') }
  const lesson = view === 'lesson' && lessonId ? lessonById(lessonId) : undefined
  const focused = !!lesson || view === 'study' // lessons and reviews are full-screen: no tabs to wander off to

  if (error) return <main><p role="alert">Couldn't open local storage ({error}). Private browsing can block it.</p></main>
  if (!db) return <main><p>Loading…</p></main>
  return (
    <>
      <main className={focused ? 'focused' : ''}>
        {!focused && <header><h1><span lang="ja">日本語</span> <small>nihongo</small></h1></header>}
        {lesson ? (
          <Lesson key={lesson.id} db={db} lesson={lesson} autoplay={autoplay} onExit={() => setView(back)} onStart={setLessonId} />
        ) : view === 'study' ? (
          <Study db={db} deck={session.deck} mode={session.mode} autoplay={autoplay} onExit={() => setView(back)} />
        ) : view === 'review' ? (
          <Home db={db} config={config} onChange={setConfig} onStart={() => study('review', config)} />
        ) : view === 'path' ? (
          <Path db={db} onStart={startLesson} />
        ) : view === 'decks' ? (
          <Decks db={db} />
        ) : view === 'stats' ? (
          <Stats db={db} />
        ) : view === 'settings' ? (
          <Settings db={db} autoplay={autoplay} onAutoplay={(v) => { setAutoplay(v); writeBool('nihongo.autoplay', v) }} />
        ) : view === 'more' ? (
          <ul className="menu">
            {MORE.map(([v, label, blurb]) => (
              <li key={v}><button onClick={() => setView(v)}><strong>{label}</strong><small>{blurb}</small></button></li>
            ))}
          </ul>
        ) : (
          <Today db={db} onReview={() => study('today', { deck: 'all', mode: 'flashcard' })} onLesson={startLesson} />
        )}
      </main>
      {!focused && (
        <nav aria-label="Main" className="tabs">
          {TABS.map(([t, label]) => (
            <button key={t} aria-current={TAB_OF[view] === t ? 'page' : undefined} onClick={() => setView(t)}>
              <Icon name={t} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  )
}
