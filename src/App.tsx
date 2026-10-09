import { useEffect, useState } from 'react'
import { warmUpVoices } from './audio'
import { openDb, seedKana, type Db } from './db/db'
import { Icon, Logo } from './icons'
import { Account } from './pages/Account'
import { Credits } from './pages/Credits'
import { Decks } from './pages/Decks'
import { Drill } from './pages/Drill'
import { KanaChart } from './pages/KanaChart'
import { Reading } from './pages/Reading'
import type { DrillKind } from './path/drills'
import { Grammar } from './pages/Grammar'
import { Home, type Config } from './pages/Home'
import { Lesson } from './pages/Lesson'
import { Lookup } from './pages/Lookup'
import { Path } from './pages/Path'
import { Settings } from './pages/Settings'
import { Stats } from './pages/Stats'
import { MISTAKES, Study } from './pages/Study'
import { TestOut } from './pages/TestOut'
import { Today } from './pages/Today'
import { Welcome, type StartLevel } from './pages/Welcome'
import { lessonById, LESSONS, UNITS } from './path/course'
import { getProgress, learnedItems } from './path/progress'
import { FURIGANA, FuriganaContext, type Furigana } from './path/ui/furigana'
import { readBool, readStr, writeBool, writeStr } from './settings'
import { maybeSignedIn, sync } from './sync'

type Tab = 'today' | 'path' | 'review' | 'lookup' | 'more'
type View = Tab | 'lesson' | 'test' | 'study' | 'drill' | 'reading' | 'kana' | 'decks' | 'stats' | 'settings' | 'credits' | 'grammar' | 'account'
const TABS: [Tab, string][] = [['today', 'Today'], ['path', 'Path'], ['review', 'Review'], ['lookup', 'Lookup'], ['more', 'More']]
const TAB_OF: Record<View, Tab> = { today: 'today', path: 'path', lesson: 'path', test: 'path', review: 'review', study: 'review', drill: 'review', reading: 'review', kana: 'review', lookup: 'lookup', more: 'more', decks: 'more', stats: 'more', settings: 'more', credits: 'more', grammar: 'more', account: 'more' }
const MORE: [View, string, string][] = [
  ['grammar', 'Grammar', 'Every grammar point with its sentences'],
  ['decks', 'Decks', 'Import Anki decks, find good ones'],
  ['stats', 'Stats', 'Your reviews and cards'],
  ['settings', 'Settings', 'Sync, theme, audio, furigana, backup'],
  ['credits', 'Credits', 'Where the course data comes from'],
]

export default function App() {
  const [db, setDb] = useState<Db | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('today')
  const [back, setBack] = useState<View>('today') // where a lesson or review session returns to
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [testUnit, setTestUnit] = useState<string | null>(null)
  const [drill, setDrill] = useState<DrillKind>('speak-read')
  const [welcome, setWelcome] = useState(false)
  const [autoplay, setAutoplay] = useState(() => readBool('nihongo.autoplay', true))
  const [config, setConfig] = useState<Config>({ deck: 'all', mode: 'flashcard' }) // the Review tab's choice
  const [furigana, setFurigana] = useState<Furigana>(() => readStr('nihongo.furigana', FURIGANA, 'auto'))
  const [known, setKnown] = useState<ReadonlySet<string>>(new Set()) // kanji the learner has had a kanji lesson for
  const [gen, setGen] = useState(0) // bumped when sync or a restore changes local data: screens remount and reload
  const [session, setSession] = useState<Config>(config) // what the running review studies (Today's doesn't change the Review tab)

  useEffect(() => {
    warmUpVoices()
    openDb()
      .then(async (d) => {
        await seedKana(d)
        // first run: show the welcome flow, unless this device already has progress (an existing learner)
        if (!readBool('nihongo.onboarded', false)) {
          const fresh = (await d.count('lessons')) === 0 && (await d.count('reviews')) === 0
          if (fresh) setWelcome(true)
          else writeBool('nihongo.onboarded', true)
        }
        void navigator.storage?.persist?.()?.catch(() => {}) // best effort: stops the browser evicting progress under storage pressure
        // signed in: pull other devices' progress before the first screen, so nobody starts a lesson on stale data
        // ponytail: past 5 s it finishes in the background and remounts the screens; fine unless the network is very slow
        if (maybeSignedIn()) {
          const pulled = sync(d).then((c) => { if (c) setGen((g) => g + 1) }, () => {})
          await Promise.race([pulled, new Promise((r) => setTimeout(r, 5000))])
        }
        setDb(d)
      })
      .catch((e) => setError(String(e)))
  }, [])
  useEffect(() => {
    // leaving the app (switching tabs or apps) pushes what was just studied; nobody is mid-answer then
    const away = () => { if (db && document.visibilityState === 'hidden' && maybeSignedIn()) void sync(db).catch(() => {}) }
    document.addEventListener('visibilitychange', away)
    return () => document.removeEventListener('visibilitychange', away)
  }, [db])
  useEffect(() => { window.scrollTo(0, 0) }, [view]) // braces: scroll methods may return a Promise, which React would take for a cleanup
  useEffect(() => {
    // refreshed on every screen change, so a finished kanji lesson drops its furigana straight away
    if (db) void getProgress(db).then((p) => setKnown(new Set([...learnedItems(LESSONS, p.done)].filter((id) => id.startsWith('kanji:')).map((id) => id.slice(6)))), () => {})
  }, [db, view])

  const startLesson = (id: string) => { setBack(view); setLessonId(id); setView('lesson') }
  const study = (from: View, c: Config) => { setSession(c); setBack(from); setView('study') }
  const lesson = view === 'lesson' && lessonId ? lessonById(lessonId) : undefined
  const unit = view === 'test' ? UNITS.find((u) => u.id === testUnit) : undefined
  const focused = !!lesson || !!unit || view === 'study' || view === 'drill' || view === 'reading' || view === 'kana' // lessons and reviews are full-screen: no tabs to wander off to

  if (error) return <main><p role="alert">Couldn't open local storage ({error}). Private browsing can block it.</p></main>
  if (!db) return <main><div className="skeleton" /><div className="skeleton tall" /></main>
  if (welcome) {
    const start = (level: StartLevel) => {
      writeBool('nihongo.onboarded', true)
      setWelcome(false)
      // skipping ahead means passing a test over everything up to there: the last kana unit, or the end of the starter section
      if (level !== 'new') { setTestUnit(level === 'kana' ? 'kata-combos' : UNITS.filter((u) => u.section === 'Starter').at(-1)!.id); setView('test') }
    }
    return <main><h1 className="visually-hidden">Nihongo</h1><Welcome onDone={start} /></main>
  }
  return (
    <FuriganaContext.Provider value={{ mode: furigana, known }}>
      <main key={gen} className={focused ? 'focused' : ''}>
        {/* full-screen lessons hide the title, but keep it for screen readers (one h1 per page) */}
        <header className={focused ? 'visually-hidden' : 'brand'}>
          <h1><Logo /> Nihongo <small lang="ja">日本語</small></h1>
          {!focused && view !== 'account' && (maybeSignedIn()
            ? <button className="icon-btn account-btn" aria-label="Account and sync" onClick={() => setView('account')}><Icon name="user" /></button>
            : <button className="account-btn" onClick={() => setView('account')}>Sign in</button>)}
        </header>
        {lesson ? (
          <Lesson key={lesson.id} db={db} lesson={lesson} autoplay={autoplay} onExit={() => setView(back)} onStart={setLessonId} />
        ) : unit ? (
          <TestOut key={unit.id} db={db} unit={unit} onExit={() => setView('path')} />
        ) : view === 'drill' ? (
          <Drill key={drill} db={db} kind={drill} onExit={() => setView('review')} />
        ) : view === 'reading' ? (
          <Reading db={db} onExit={() => setView('review')} />
        ) : view === 'kana' ? (
          <KanaChart db={db} onExit={() => setView('review')} />
        ) : view === 'study' ? (
          <Study db={db} deck={session.deck} mode={session.mode} autoplay={autoplay} onExit={() => setView(back)} />
        ) : view === 'review' ? (
          <Home db={db} config={config} onChange={setConfig} onStart={() => study('review', config)} onPractice={() => study('review', { ...config, deck: MISTAKES })}
            onDrill={(k) => { setDrill(k); setView('drill') }} onRead={() => setView('reading')} onKana={() => setView('kana')} />
        ) : view === 'path' ? (
          <Path db={db} onStart={startLesson} onTest={(id) => { setTestUnit(id); setView('test') }} />
        ) : view === 'lookup' ? (
          <Lookup db={db} />
        ) : view === 'decks' ? (
          <Decks db={db} />
        ) : view === 'stats' ? (
          <Stats db={db} />
        ) : view === 'settings' ? (
          <Settings db={db} autoplay={autoplay} onAutoplay={(v) => { setAutoplay(v); writeBool('nihongo.autoplay', v) }}
            furigana={furigana} onFurigana={(f) => { setFurigana(f); writeStr('nihongo.furigana', f) }} onSynced={() => setGen((g) => g + 1)} />
        ) : view === 'account' ? (
          <Account db={db} onSynced={() => setGen((g) => g + 1)} />
        ) : view === 'grammar' ? (
          <Grammar db={db} />
        ) : view === 'credits' ? (
          <Credits />
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
    </FuriganaContext.Provider>
  )
}
