import { Fragment, useEffect, useRef, useState } from 'react'
import { speakAll, useJaVoice } from '../audio'
import type { Db } from '../db/db'
import { ExitButton, Icon } from '../icons'
import { DIALOGUES } from '../path/dialogues'
import { addReviewXp } from '../path/progress'
import { displayJp, readingOf } from '../path/romaji'
import { STORIES, type Story } from '../path/stories'
import { Ruby } from '../path/ui/Ruby'
import { SLOW } from '../settings'
import { sfx } from '../sfx'

/** Something to listen to: a dialogue (two speakers, A and B) or a story, with its questions. */
interface Track { id: string; kind: 'Dialogue' | 'Story'; title: string; scene?: string; level: 5 | 4 | 3; lines: { tokens: string[]; en: string; who?: 'A' | 'B' }[]; questions: Story['questions'] }

const TRACKS: Track[] = [
  ...DIALOGUES.map((d): Track => ({ id: `dialogue:${d.id}`, kind: 'Dialogue', title: d.title, scene: d.scene, level: d.level, lines: d.lines, questions: d.questions })),
  ...STORIES.map((s): Track => ({ id: `story:${s.id}`, kind: 'Story', title: s.en, level: s.level, lines: s.sentences, questions: s.questions })),
]
const LEVELS = [5, 4, 3] as const
const PUNCT = new Set(['、', '。', '？'])
const HEARD_KEY = 'nihongo.heard'
const heardSet = () => { try { return new Set<string>(JSON.parse(localStorage.getItem(HEARD_KEY) ?? '[]')) } catch { return new Set<string>() } }
const markHeard = (id: string) => { try { localStorage.setItem(HEARD_KEY, JSON.stringify([...heardSet(), id])) } catch { /* per device only */ } }
const spoken = (tokens: string[]) => displayJp(tokens.map(readingOf)).replace(/？。$/, '？')
const NO_VOICE = 'Needs a Japanese voice on this device (on iPhone and iPad: Settings → Accessibility → Spoken content → Voices).'

/** JLPT-style listening: hear a dialogue or a story without its text, answer questions, then read along. */
export function Listening({ db, onExit }: { db: Db; onExit: () => void }) {
  const voice = useJaVoice()
  const [open, setOpen] = useState<Track | null>(null)
  const [heard] = useState(heardSet)
  if (open) return <ListenView db={db} track={open} onExit={() => setOpen(null)} />
  return (
    <>
      <div className="bar"><ExitButton onClick={onExit} /></div>
      <div className="page-head">
        <h2>Listening</h2>
        <p>Dialogues and stories, heard without the text, like the JLPT listening section. Answer the questions, then read along.</p>
      </div>
      {!voice && <p className="hint">{NO_VOICE}</p>}
      {LEVELS.map((level) => (
        <section key={level} aria-labelledby={`listen-n${level}`}>
          <h3 className="section-title" id={`listen-n${level}`}>N{level}</h3>
          <ul className="story-list">
            {TRACKS.filter((t) => t.level === level).map((t) => (
              <li key={t.id}>
                <button className="tile-btn story" disabled={!voice} onClick={() => setOpen(t)}>
                  <span className="tile-icon"><Icon name={t.kind === 'Dialogue' ? 'speaker' : 'book'} /></span>
                  <strong>{t.title}</strong>
                  <small>{t.kind} · {t.lines.length} lines · {t.questions.length} questions{heard.has(t.id) ? ' · ✓ done' : ''}</small>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}

function ListenView({ db, track, onExit }: { db: Db; track: Track; onExit: () => void }) {
  const voice = useJaVoice()
  const [slow, setSlow] = useState(false)
  const [playing, setPlaying] = useState<number | null>(null)
  const [played, setPlayed] = useState(false)
  const [text, setText] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>(() => track.questions.map(() => null))
  const stop = useRef<() => void>(() => {})
  useEffect(() => () => stop.current(), [])
  const done = answers.every((a) => a !== null)
  const score = answers.filter((a, i) => a === track.questions[i].answer).length

  useEffect(() => {
    if (!done) return
    markHeard(track.id)
    void addReviewXp(db, new Date(), score * 2).catch(() => {}) // practice keeps the streak going, as Reading does
    sfx('done')
  }, [done, db, track.id, score])

  /** Play lines from..to, each in its speaker's voice. */
  const play = (from: number, to = track.lines.length, slowly = slow) => {
    stop.current()
    const lines = track.lines.slice(from, to)
    setPlayed(true)
    stop.current = speakAll(lines.map((l) => spoken(l.tokens)), (i) => setPlaying(from + i), () => setPlaying(null), {
      speed: slowly ? SLOW : undefined,
      speakers: track.kind === 'Dialogue' ? lines.map((l) => (l.who === 'B' ? 1 : 0)) : undefined,
    })
  }
  const toggleSlow = () => {
    setSlow(!slow)
    if (playing !== null) play(playing, undefined, !slow) // carry on from this line at the new speed
  }

  return (
    <>
      <div className="bar"><ExitButton onClick={onExit} /></div>
      <article className="card story-card listen-card" aria-labelledby="listen-title">
        <header className="story-head">
          <p className="eyebrow">{track.kind} · N{track.level}</p>
          <h2 id="listen-title">{track.title}</h2>
          {track.scene && <p className="hint">{track.scene}</p>}
        </header>
        {!voice && <p className="hint">{NO_VOICE}</p>}
        <div className="row2">
          <button className="primary" autoFocus onClick={() => (playing !== null ? stop.current() : play(0))}>
            <Icon name={playing !== null ? 'close' : 'play'} size={20} /> {playing !== null ? 'Stop' : played ? 'Play again' : 'Play'}
          </button>
          <button aria-pressed={slow} onClick={toggleSlow}><Icon name="turtle" size={20} /> Slow</button>
        </div>
        <p className="hint">{playing !== null ? `Line ${playing + 1} of ${track.lines.length}` : `${track.lines.length} lines`}</p>
        {text && (
          <ol id="listen-text" className="story transcript" aria-label="Text">
            {track.lines.map((l, i) => (
              <li key={i} className={playing === i ? 'playing' : ''}>
                <div className="said">
                  {l.who && <strong className="who"><span className="visually-hidden">Speaker </span>{l.who}</strong>}
                  <p lang="ja" className="jp-line">
                    {l.tokens.map((t, k) => <Fragment key={k}>{PUNCT.has(t) ? t : <Ruby text={t} />}</Fragment>)}{l.tokens.at(-1) === '？' ? '' : '。'}
                  </p>
                </div>
                <div className="line-tools">
                  {voice && <button className="icon-btn" aria-label={`Play line ${i + 1}`} onClick={() => play(i, i + 1)}><Icon name="speaker" /></button>}
                  <p className="en">{l.en}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </article>
      <section className="card form" aria-label="Questions">
        <h2>Did you understand?</h2>
        {track.questions.map((q, i) => (
          <fieldset key={i} className="question">
            <legend>{q.q}</legend>
            <div className="grid wide">
              {q.options.map((o, k) => {
                const a = answers[i]
                const cls = a === null ? '' : k === q.answer ? 'good' : k === a ? 'bad' : ''
                return <button key={k} disabled={a !== null} className={cls} onClick={() => { setAnswers(answers.map((x, j) => (j === i ? k : x))); sfx(k === q.answer ? 'right' : 'wrong') }}>{a !== null && (k === q.answer ? '✓ ' : k === a ? '✗ ' : '')}{o}</button>
              })}
            </div>
          </fieldset>
        ))}
        <p role="status" className="counts">{done ? `${score} of ${track.questions.length} right` : ''}</p>
        {done && (
          <div className="row2 left">
            <button aria-expanded={text} aria-controls="listen-text" onClick={() => setText(!text)}>{text ? 'Hide text' : 'Show text'}</button>
            <button className="primary" onClick={onExit}>Back to listening</button>
          </div>
        )}
      </section>
    </>
  )
}
