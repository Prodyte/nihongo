import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react'
import { Rating, State, type Grade } from 'ts-fsrs'
import { speak } from '../audio'
import { BUILTIN_DECKS, cardFront } from '../db/db'
import { ITEMS } from '../path/course'
import { Example } from '../path/ui/Example'
import { Mnemonic } from '../path/ui/Mnemonic'
import { Ruby } from '../path/ui/Ruby'
import { fit } from '../path/ui/furigana'
import { intervals } from '../srs/scheduler'
import { SpeakButton } from './SpeakButton'
import type { ModeProps } from './types'

// imported Anki cards only: their renderer (and its HTML sanitiser) loads when the first one is shown
const Html = lazy(() => import('../anki/media').then((m) => ({ default: m.Html })))

const GRADES: [Grade, string, string][] = [[Rating.Again, 'Again', 'again'], [Rating.Hard, 'Hard', 'hard'], [Rating.Good, 'Good', 'good-g'], [Rating.Easy, 'Easy', 'easy']]
// practice never reschedules, so only two outcomes are real: see it again in this session, or not
const PRACTICE: [Grade, string, string][] = [[Rating.Again, 'Again', 'again'], [Rating.Good, 'Got it', 'good-g']]

export function Flashcard({ db, card, autoplay, onGrade, practice }: ModeProps) {
  const [shown, setShown] = useState(false)
  const [next] = useState(() => intervals(card.fsrs))
  const slot = useRef<HTMLDivElement>(null)
  const kanji = card.deck === BUILTIN_DECKS.kanji.id ? ITEMS.get(card.id) : undefined // readings and an example word on the back
  const example = kanji?.examples?.[0] && ITEMS.get(kanji.examples[0])
  const item = ITEMS.get(card.id)
  const grades = practice ? PRACTICE : GRADES
  const id = useId()
  // what to recall, said on the front: a beginner self-grading needs to know what "remembered" means here
  const ask = card.html ? null : card.deck === 'kana' ? 'Say the sound' : kanji ? 'Its meaning and readings?' : 'What does it mean?'
  // memory aids are a crutch: shown while a card is new or just forgotten, then they fade (practice drills weak cards: always)
  const hint = practice || card.fsrs.reps < 3 || card.fsrs.state === State.Relearning
  // Move focus to the revealed answer, not a grade button: a held Enter would auto-repeat onto it and grade by accident.
  useEffect(() => {
    if (shown) slot.current?.focus()
  }, [shown])
  useEffect(() => {
    if (shown && autoplay && !card.html) speak(example ? example.jp : card.reading ?? card.front) // say it once the answer is revealed (a kanji: its example word)
  }, [shown, autoplay, card.html, card.front, card.reading, example])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return // leave browser shortcuts (Cmd+1 switches tabs) alone
      if (!shown && (e.key === ' ' || e.key === 'Enter')) {
        if (!(e.target instanceof HTMLButtonElement)) setShown(true) // a focused button handles its own click
      }
      else if (shown && e.key.length === 1 && e.key >= '1' && e.key <= String(grades.length)) onGrade(grades[Number(e.key) - 1][0])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown, onGrade, grades])

  return (
    <div className="card">
      {ask && !shown && <p className="q" id={`${id}q`}>{ask}</p>}
      {card.html ? (
        <Suspense fallback={<div className="skeleton" />}><Html db={db} deck={card.deck} html={shown ? card.back[0] : card.front} autoplay={autoplay} /></Suspense>
      ) : (
        <div className="kana" id={`${id}k`} lang="ja" style={fit(cardFront(card), card.reading)}><Ruby text={cardFront(card)} reading={card.reading} /></div>
      )}
      {/* a word is asked in context: its sentence on the front, the sentence's English and sound with the answer */}
      {item && <Example item={item} revealed={shown} />}
      <div className="answer-slot" tabIndex={-1} ref={slot}>
        <div className="answer-slot" aria-live="polite">{/* announce the answer, not the grade buttons */}
          {shown && (
            <>
              {card.reading && <div className="reading" lang="ja">{card.reading}</div>}
              {kanji ? (
                <>
                  <div className="answer">{kanji.gloss}</div>
                  {hint && <Mnemonic item={kanji} />}
                  <p className="kanji-readings" lang="ja">{[kanji.on?.length && `音 ${kanji.on.join('・')}`, kanji.kun?.length && `訓 ${kanji.kun.join('・')}`].filter(Boolean).join('　')}</p>
                  {example && <p className="kanji-example"><span lang="ja"><Ruby text={example.written ?? example.kanji ?? example.jp} reading={example.written ?? example.kanji ? example.jp : undefined} /></span> {example.gloss} <SpeakButton text={example.jp} /></p>}
                </>
              ) : !card.html && <><div className="answer">{card.back[0]} <SpeakButton text={card.reading ?? card.front} /></div>{item && hint && <Mnemonic item={item} />}</>}
            </>
          )}
        </div>
        {shown && (
          <div className="grades">
            {grades.map(([g, label, cls], i) => (
              // the name is spelled out whole: a hidden ", next in " beside the interval lost its space ("next in1 min")
              <button key={label} className={cls} onClick={() => onGrade(g)} aria-label={practice ? label : `${label}, next in ${next[g]}`}>
                <span>{label}<kbd>{i + 1}</kbd></span>{!practice && <small>{next[g]}</small>}
              </button>
            ))}
          </div>
        )}
        {shown && !practice && card.fsrs.reps < 3 && <p className="note">Again if you forgot, Good if you remembered.</p>}
      </div>
      {!shown && <button className="primary" autoFocus aria-describedby={card.html ? undefined : `${ask ? `${id}q ` : ''}${id}k`} onClick={() => setShown(true)}>Show answer <kbd aria-hidden="true">space</kbd></button>}
    </div>
  )
}
