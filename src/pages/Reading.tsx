import { useEffect, useRef, useState } from 'react'
import { speak, speakAll, useJaVoice } from '../audio'
import type { Db } from '../db/db'
import { ExitButton, Icon } from '../icons'
import { SpeakButton } from '../modes/SpeakButton'
import { ITEMS, wordFor, written, type Item } from '../path/course'
import { addReviewXp } from '../path/progress'
import { displayJp, PARTICLES, readingOf, surfaceOf } from '../path/romaji'
import { STORIES, type Story } from '../path/stories'
import { Ruby } from '../path/ui/Ruby'
import { readBool, writeBool } from '../settings'
import { sfx } from '../sfx'

const WORDS = [...ITEMS.values()].filter((w) => w.kind === 'word')
const READ_KEY = 'nihongo.read'
const readSet = () => { try { return new Set<string>(JSON.parse(localStorage.getItem(READ_KEY) ?? '[]')) } catch { return new Set<string>() } }
const markRead = (id: string) => { try { localStorage.setItem(READ_KEY, JSON.stringify([...readSet(), id])) } catch { /* per device only */ } }
const sentenceText = (tokens: string[]) => displayJp(tokens.map(readingOf))

/** Graded stories: read with furigana, listen sentence by sentence, tap any word to look it up, then answer questions. */
export function Reading({ db, onExit }: { db: Db; onExit: () => void }) {
  const [open, setOpen] = useState<Story | null>(null)
  const [read] = useState(readSet)
  if (open) return <StoryView db={db} story={open} onExit={() => setOpen(null)} />
  return (
    <>
      <div className="bar"><ExitButton onClick={onExit} /></div>
      <div className="page-head">
        <h2>Reading</h2>
        <p>Short stories in Japanese you already know. Tap any word to look it up.</p>
      </div>
      <ul className="story-list">
        {STORIES.map((s) => (
          <li key={s.id}>
            <button className="tile-btn story" onClick={() => setOpen(s)}>
              <span className="tile-icon"><Icon name="book" /></span>
              <strong lang="ja"><Ruby text={s.title} /></strong>
              <small>{s.en} · N{s.level} · {s.sentences.length} sentences{read.has(s.id) ? ' · ✓ read' : ''}</small>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

function StoryView({ db, story, onExit }: { db: Db; story: Story; onExit: () => void }) {
  const voice = useJaVoice()
  const [english, setEnglish] = useState(() => readBool('nihongo.storyEnglish', false))
  const [shown, setShown] = useState<Set<number>>(new Set()) // sentences whose English is revealed
  const [playing, setPlaying] = useState<number | null>(null)
  const [word, setWord] = useState<{ item?: Item; chunk: string } | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(() => story.questions.map(() => null))
  const stop = useRef<() => void>(() => {})
  useEffect(() => () => stop.current(), [])
  const done = answers.every((a) => a !== null)
  const score = answers.filter((a, i) => a === story.questions[i].answer).length

  useEffect(() => {
    if (!done) return
    markRead(story.id)
    void addReviewXp(db, new Date(), score * 2).catch(() => {})
    sfx('done')
  }, [done, db, story.id, score])

  const playAll = () => {
    if (playing !== null) { stop.current(); return }
    stop.current = speakAll(story.sentences.map((s) => sentenceText(s.tokens)), setPlaying, () => setPlaying(null))
  }
  const lookUp = (chunk: string) => { setWord({ chunk, item: wordFor(chunk, WORDS) }); speak(readingOf(chunk)) }

  return (
    <>
      <div className="bar"><ExitButton onClick={onExit} /></div>
      <article className="card story-card">
        <header className="story-head">
          <h2 lang="ja"><Ruby text={story.title} /></h2>
          <p className="hint">{story.en}</p>
        </header>
        <div className="row2">
          {voice && <button className="primary" onClick={playAll}><Icon name={playing !== null ? 'close' : 'play'} size={20} /> {playing !== null ? 'Stop' : 'Play all'}</button>}
          <label className="check"><input type="checkbox" checked={english} onChange={(e) => { setEnglish(e.target.checked); writeBool('nihongo.storyEnglish', e.target.checked) }} /> Show English</label>
        </div>
        {word && (
          <div className="lookup-pop" role="status">
            <span lang="ja" className="jp">{word.item ? <Ruby text={written(word.item)} reading={word.item.written && word.item.jp} /> : surfaceOf(word.chunk)}</span>
            <span>{word.item ? `${word.item.jp !== surfaceOf(word.chunk) ? `${readingOf(word.chunk)} · ` : ''}${word.item.gloss}` : PARTICLES.has(word.chunk) ? 'a particle (see the grammar lessons)' : readingOf(word.chunk)}</span>
            <button className="icon-btn ghost" aria-label="Close" onClick={() => setWord(null)}><Icon name="close" size={18} /></button>
          </div>
        )}
        <ol className="story">
          {story.sentences.map((s, i) => (
            <li key={i} className={playing === i ? 'playing' : ''}>
              <p lang="ja" className="jp-line">
                {s.tokens.map((t, k) => (
                  <button key={k} className="word" onClick={() => lookUp(t)}><Ruby text={t} /></button>
                ))}。
              </p>
              <div className="line-tools">
                <SpeakButton text={sentenceText(s.tokens)} />
                {english || shown.has(i) ? <p className="en">{s.en}</p> : <button className="ghost" onClick={() => setShown(new Set([...shown, i]))}>Translate</button>}
              </div>
            </li>
          ))}
        </ol>
      </article>
      <section className="card form" aria-label="Questions">
        <h2>Did you understand?</h2>
        {story.questions.map((q, i) => (
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
        <p role="status" className="counts">{done ? `${score} of ${story.questions.length} right` : ''}</p>
        {done && <button className="primary" onClick={onExit}>Back to stories</button>}
      </section>
    </>
  )
}
