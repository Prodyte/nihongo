import { useEffect, useRef, useState } from 'react'
import { speak, speakAll, useJaVoice } from '../audio'
import type { Db, StoredCard } from '../db/db'
import { ExitButton, Icon } from '../icons'
import { SpeakButton } from '../modes/SpeakButton'
import { contentChunks, GRAMMAR_CHUNKS, ITEMS, wordFor, written, type Item } from '../path/course'
import { addReviewXp } from '../path/progress'
import { displayJp, PARTICLES, readingOf, surfaceOf } from '../path/romaji'
import { STORIES, type Story } from '../path/stories'
import { Ruby } from '../path/ui/Ruby'
import { readBool, writeBool } from '../settings'
import { sfx } from '../sfx'
import { Study } from './Lookup'

const WORDS = [...ITEMS.values()].filter((w) => w.kind === 'word')
const READ_KEY = 'nihongo.read'
const LEVELS = [5, 4, 3] as const
const readSet = () => { try { return new Set<string>(JSON.parse(localStorage.getItem(READ_KEY) ?? '[]')) } catch { return new Set<string>() } }
const markRead = (id: string) => { try { localStorage.setItem(READ_KEY, JSON.stringify([...readSet(), id])) } catch { /* per device only */ } }
const sentenceText = (tokens: string[]) => displayJp(tokens.map(readingOf))

/** Graded stories: read with furigana, listen sentence by sentence, tap any word to look it up (and save it for Review), then answer questions. */
export function Reading({ db, onExit }: { db: Db; onExit: () => void }) {
  const [open, setOpen] = useState<Story | null>(null)
  const read = readSet() // read each render: a story finished just now shows as read on return
  if (open) return <StoryView db={db} story={open} onExit={() => setOpen(null)} />
  return (
    <>
      <div className="bar"><ExitButton onClick={onExit} /></div>
      <div className="page-head">
        <h2>Reading</h2>
        <p>Short stories in Japanese you already know. Tap any word to look it up.</p>
      </div>
      {LEVELS.map((level) => (
        <section key={level} aria-labelledby={`stories-n${level}`}>
          <h3 className="section-title" id={`stories-n${level}`}>N{level}</h3>
          <ul className="story-list">
            {STORIES.filter((s) => s.level === level).map((s) => (
              <li key={s.id}>
                <button className="tile-btn story" onClick={() => setOpen(s)}>
                  <span className="tile-icon"><Icon name="book" /></span>
                  <strong lang="ja"><Ruby text={s.title} /></strong>
                  <small>{s.en} · {s.sentences.length} sentences{read.has(s.id) ? ' · ✓ read' : ''}</small>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}

function StoryView({ db, story, onExit }: { db: Db; story: Story; onExit: () => void }) {
  const voice = useJaVoice()
  const [english, setEnglish] = useState(() => readBool('nihongo.storyEnglish', false))
  const [shown, setShown] = useState<Set<number>>(new Set()) // sentences whose English is revealed
  const [playing, setPlaying] = useState<number | null>(null)
  const [word, setWord] = useState<{ item?: Item; chunk: string } | null>(null)
  const [card, setCard] = useState<{ id: string; card?: StoredCard } | null>(null) // the looked-up word's card, for Study this
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
  const lookUp = (chunk: string) => {
    // a particle, ending or counter is only ever the word spelled and read just like it (つもり, 二人): は is not 歯 (tooth),
    // せいで not 巣 (nest), 十分 (じゅっぷん) not じゅうぶん (enough)
    const item = PARTICLES.has(chunk) ? undefined : contentChunks([chunk]).length ? wordFor(chunk, WORDS)
      : WORDS.find((w) => written(w) === surfaceOf(chunk) && w.jp === readingOf(chunk))
    setWord({ chunk, item })
    speak(readingOf(chunk))
    if (item) void db.get('cards', item.id).then((c) => setCard({ id: item.id, card: c }), () => {})
  }

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
            <span>{word.item ? `${word.item.jp !== surfaceOf(word.chunk) ? `${readingOf(word.chunk)} · ` : ''}${word.item.gloss}` : PARTICLES.has(word.chunk) ? 'a particle (see the grammar lessons)' : GRAMMAR_CHUNKS.has(surfaceOf(word.chunk)) ? 'grammar (see the grammar lessons)' : readingOf(word.chunk)}</span>
            <button className="icon-btn ghost" aria-label="Close" onClick={() => setWord(null)}><Icon name="close" size={18} /></button>
            {word.item && card?.id === word.item.id && <Study db={db} it={word.item} card={card.card} onCard={(id, c) => setCard({ id, card: c })} />}
          </div>
        )}
        <ol className="story">
          {story.sentences.map((s, i) => (
            <li key={i} className={playing === i ? 'playing' : ''}>
              <p lang="ja" className="jp-line">
                {s.tokens.slice(0, -1).map((t, k) => (
                  <button key={k} className="word" onClick={() => lookUp(t)}><Ruby text={t} /></button>
                ))}
                <span className="last"><button className="word" onClick={() => lookUp(s.tokens.at(-1)!)}><Ruby text={s.tokens.at(-1)!} /></button>。</span>
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
