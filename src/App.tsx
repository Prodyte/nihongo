import { useEffect, useRef, useState } from 'react'
import { warmUpVoices } from './audio'
import { openDb, seedKana, type Db } from './db/db'
import { Icon, Logo } from './icons'
import { About } from './pages/About'
import { Account } from './pages/Account'
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
import { FURIGANA, FuriganaContext, ROMAJI, type Furigana, type Romaji } from './path/ui/furigana'
import { readBool, readStr, writeBool, writeStr } from './settings'
import { maybeSignedIn, recovery, sync, update } from './sync'

type Tab = 'today' | 'path' | 'review' | 'lookup' | 'more'
type View = Tab | 'lesson' | 'test' | 'study' | 'drill' | 'reading' | 'kana' | 'decks' | 'stats' | 'settings' | 'about' | 'grammar' | 'account'
const TABS: [Tab, string][] = [['today', 'Today'], ['path', 'Path'], ['review', 'Review'], ['lookup', 'Lookup'], ['more', 'More']]
const TAB_OF: Record<View, Tab> = { today: 'today', path: 'path', lesson: 'path', test: 'path', review: 'review', study: 'review', drill: 'review', reading: 'review', kana: 'review', lookup: 'lookup', more: 'more', decks: 'more', stats: 'more', settings: 'more', about: 'more', grammar: 'more', account: 'more' }
const KANA_LESSONS = UNITS.filter((u) => u.section === 'Kana').flatMap((u) => u.lessons)
const MORE: [View, string, string][] = [
  ['grammar', 'Grammar', 'Every grammar point with its sentences'],
  ['decks', 'Decks', 'Import Anki decks, find good ones'],
  ['stats', 'Stats', 'Your reviews and cards'],
  ['settings', 'Settings', 'Sync, theme, audio, furigana, backup'],
  ['about', 'About', 'The app on GitHub, and credits for the course data'],
]

/** Whether a media query matches, kept current (false where matchMedia is missing, as in tests). */
function useMedia(query: string) {
  const mq = typeof matchMedia === 'function' ? matchMedia(query) : null
  const [on, setOn] = useState(!!mq?.matches)
  useEffect(() => {
    if (!mq) return
    const change = () => setOn(mq.matches)
    mq.addEventListener('change', change)
    return () => mq.removeEventListener('change', change)
  }, [mq?.media]) // eslint-disable-line react-hooks/exhaustive-deps
  return on
}

export default function App() {
  const [db, setDb] = useState<Db | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>(recovery.pending || recovery.error ? 'account' : 'today')
  const [back, setBack] = useState<View>('today') // where a lesson or review session returns to
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [testUnit, setTestUnit] = useState<string | null>(null)
  const [drill, setDrill] = useState<DrillKind>('speak-read')
  const [welcome, setWelcome] = useState(false)
  const [autoplay, setAutoplay] = useState(() => readBool('nihongo.autoplay', true))
  const [config, setConfig] = useState<Config>({ deck: 'all', mode: 'flashcard' }) // the Review tab's choice
  const [furigana, setFurigana] = useState<Furigana>(() => readStr('nihongo.furigana', FURIGANA, 'auto'))
  const [known, setKnown] = useState<ReadonlySet<string>>(new Set()) // kanji the learner has had a kanji lesson for
  const [romaji, setRomaji] = useState<Romaji>(() => readStr('nihongo.romaji', ROMAJI, 'auto'))
  const [kanaDone, setKanaDone] = useState(false) // every kana lesson done (or tested out): romaji goes, by default
  const phone = !useMedia('(min-width: 48rem)') // bottom tabs, and a top bar for the logo and account
  const sidebar = useMedia('(min-width: 64rem)') // navigation down the left, More's pages listed in it
  const [gen, setGen] = useState(0) // bumped when a background sync changes local data: screens remount and reload
  const [shown, setShown] = useState(0) // the gen on screen: it catches up on a tab, so a lesson or test isn't restarted
  const onTab = TAB_OF[view] === view
  if (onTab && shown !== gen) setShown(gen)
  const [, setTick] = useState(0)
  const rerender = () => setTick((t) => t + 1) // sign-in state changed on Settings or Account: redraw the header, keep the page and its message
  const [session, setSession] = useState<Config>(config) // what the running review studies (Today's doesn't change the Review tab)

  // The phone's back button / swipe goes back a screen instead of leaving the app. Opening a screen pushes a history
  // entry (switching tabs replaces it, so back doesn't replay every tab); leaving one with its own exit button pops it.
  const popping = useRef(false) // our own history.back(): the view is already set
  const go = (v: View) => {
    if (v === view) return
    if (TABS.some(([t]) => t === v)) history.replaceState({ view: v, pushed: history.state?.pushed }, '')
    else history.pushState({ view: v, pushed: true }, '')
    setView(v)
  }
  const leave = (v: View) => {
    if (history.state?.pushed) { popping.current = true; history.back() }
    setView(v)
  }
  useEffect(() => {
    history.replaceState({ view }, '')
    const pop = (e: PopStateEvent) => {
      if (popping.current) { popping.current = false; return }
      setView((e.state?.view as View | undefined) ?? 'today')
    }
    addEventListener('popstate', pop)
    return () => removeEventListener('popstate', pop)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- once: the first entry is the starting view

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
        // ponytail: past 5 s it finishes in the background and remounts the screens (on the next tab); fine unless the network is very slow
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
  useEffect(() => {
    update.ready = () => { const f = onTab && update.apply; if (f) { update.apply = null; f() } }
    update.ready()
  }, [onTab])
  useEffect(() => { window.scrollTo(0, 0) }, [view]) // braces: scroll methods may return a Promise, which React would take for a cleanup
  useEffect(() => {
    // refreshed on every screen change, so a finished kanji lesson drops its furigana straight away
    if (db) void getProgress(db).then((p) => {
      setKnown(new Set([...learnedItems(LESSONS, p.done)].filter((id) => id.startsWith('kanji:')).map((id) => id.slice(6))))
      setKanaDone(KANA_LESSONS.every((l) => p.done.has(l.id)))
    }, () => {})
  }, [db, view])

  const startLesson = (id: string) => { setBack(view); setLessonId(id); go('lesson') }
  const study = (from: View, c: Config) => { setSession(c); setBack(from); go('study') }
  const lesson = view === 'lesson' && lessonId ? lessonById(lessonId) : undefined
  const unit = view === 'test' ? UNITS.find((u) => u.id === testUnit) : undefined
  const focused = !!lesson || !!unit || view === 'study' || view === 'drill' || view === 'reading' || view === 'kana' // lessons and reviews are full-screen: no tabs to wander off to

  const account = maybeSignedIn()
    ? <button className="icon-btn account-btn" aria-label="Account and sync" aria-current={view === 'account' ? 'page' : undefined} onClick={() => go('account')}><Icon name="user" /></button>
    : <button className="account-btn" aria-current={view === 'account' ? 'page' : undefined} onClick={() => go('account')}>Sign in</button>

  if (error) return <main><p role="alert">Couldn't open local storage ({error}). Private browsing can block it.</p></main>
  if (!db) return <main><div className="skeleton" /><div className="skeleton tall" /></main>
  if (welcome) {
    const start = (level: StartLevel) => {
      writeBool('nihongo.onboarded', true)
      setWelcome(false)
      // skipping ahead means passing a test over everything up to there: the last kana unit, or the end of the starter section
      if (level !== 'new') { setTestUnit(level === 'kana' ? 'kana-combos' : UNITS.filter((u) => u.section === 'Starter').at(-1)!.id); go('test') }
    }
    return <main><h1 className="visually-hidden">Nihongo</h1><Welcome onDone={start} /></main>
  }
  return (
    <FuriganaContext.Provider value={{ mode: furigana, known, romaji: romaji === 'always' || (romaji === 'auto' && !kanaDone) }}>
      {!focused && phone && (
        <header className="appbar">
          <span className="brand" aria-hidden="true"><Logo /> Nihongo <small lang="ja">日本語</small></span>
          {account}
        </header>
      )}
      <main key={shown} className={focused ? 'focused' : 'with-nav'}>
        {/* full-screen lessons hide the title, but keep it for screen readers (one h1 per page) */}
        {/* one h1 for screen readers; the logo is drawn in the top bar (phones) or the side/top navigation (wider screens) */}
        <h1 className="visually-hidden">Nihongo</h1>
        {lesson ? (
          <Lesson key={lesson.id} db={db} lesson={lesson} autoplay={autoplay} onExit={() => leave(back)} onStart={setLessonId} />
        ) : unit ? (
          <TestOut key={unit.id} db={db} unit={unit} onExit={() => leave('path')} />
        ) : view === 'drill' ? (
          <Drill key={drill} db={db} kind={drill} onExit={() => leave('review')} />
        ) : view === 'reading' ? (
          <Reading db={db} onExit={() => leave('review')} />
        ) : view === 'kana' ? (
          <KanaChart db={db} onExit={() => leave('review')} />
        ) : view === 'study' ? (
          <Study db={db} deck={session.deck} mode={session.mode} autoplay={autoplay} onExit={() => leave(back)} />
        ) : view === 'review' ? (
          <Home db={db} config={config} onChange={setConfig} onStart={() => study('review', config)} onPractice={() => study('review', { ...config, deck: MISTAKES })}
            onDrill={(k) => { setDrill(k); go('drill') }} onRead={() => go('reading')} onKana={() => go('kana')} />
        ) : view === 'path' ? (
          <Path db={db} onStart={startLesson} onTest={(id) => { setTestUnit(id); go('test') }} />
        ) : view === 'lookup' ? (
          <Lookup db={db} />
        ) : view === 'decks' ? (
          <Decks db={db} />
        ) : view === 'stats' ? (
          <Stats db={db} />
        ) : view === 'settings' ? (
          <Settings db={db} autoplay={autoplay} onAutoplay={(v) => { setAutoplay(v); writeBool('nihongo.autoplay', v) }}
            furigana={furigana} onFurigana={(f) => { setFurigana(f); writeStr('nihongo.furigana', f) }}
            romaji={romaji} onRomaji={(r) => { setRomaji(r); writeStr('nihongo.romaji', r) }} onSynced={rerender} />
        ) : view === 'account' ? (
          <Account db={db} onSynced={rerender} />
        ) : view === 'grammar' ? (
          <Grammar db={db} />
        ) : view === 'about' ? (
          <About />
        ) : view === 'more' ? (
          <ul className="menu">
            {MORE.map(([v, label, blurb]) => (
              <li key={v}><button onClick={() => go(v)}><strong>{label}</strong><small>{blurb}</small></button></li>
            ))}
          </ul>
        ) : (
          <Today db={db} onReview={() => study('today', { deck: 'all', mode: 'flashcard' })} onLesson={startLesson} />
        )}
      </main>
      {!focused && (
        <nav aria-label="Main" className="tabs">
          <span className="brand" aria-hidden="true"><Logo /> Nihongo <small lang="ja">日本語</small></span>
          {TABS.filter(([t]) => !(sidebar && t === 'more')).map(([t, label]) => (
            <button key={t} className={`tab-${t}`} aria-current={TAB_OF[view] === t ? 'page' : undefined} onClick={() => go(t)}>
              <Icon name={t} />
              <span>{label}</span>
            </button>
          ))}
          {/* the sidebar lists the More pages itself */}
          {sidebar && (
            <div className="nav-more" role="group" aria-label="More">
              {MORE.map(([v, label]) => (
                <button key={v} aria-current={view === v ? 'page' : undefined} onClick={() => go(v)}>{label}</button>
              ))}
            </div>
          )}
          {!phone && account}
        </nav>
      )}
    </FuriganaContext.Provider>
  )
}
