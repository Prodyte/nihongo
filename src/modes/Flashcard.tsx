import { useEffect, useRef, useState } from 'react'
import { Rating, type Grade } from 'ts-fsrs'
import { Html } from '../anki/media'
import { speak } from '../audio'
import { BUILTIN_DECKS } from '../db/db'
import { ITEMS } from '../path/course'
import { Mnemonic } from '../path/ui/Mnemonic'
import { Ruby } from '../path/ui/Ruby'
import { intervals } from '../srs/scheduler'
import { SpeakButton } from './SpeakButton'
import type { ModeProps } from './types'

const GRADES: [Grade, string, string][] = [[Rating.Again, 'Again', 'again'], [Rating.Hard, 'Hard', 'hard'], [Rating.Good, 'Good', 'good-g'], [Rating.Easy, 'Easy', 'easy']]

export function Flashcard({ db, card, autoplay, onGrade }: ModeProps) {
  const [shown, setShown] = useState(false)
  const [next] = useState(() => intervals(card.fsrs))
  const slot = useRef<HTMLDivElement>(null)
  const kanji = card.deck === BUILTIN_DECKS.kanji.id ? ITEMS.get(card.id) : undefined // readings and an example word on the back
  const example = kanji?.examples?.[0] && ITEMS.get(kanji.examples[0])
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
      else if (shown && e.key.length === 1 && '1234'.includes(e.key)) onGrade(GRADES[Number(e.key) - 1][0])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown, onGrade])

  return (
    <div className="card">
      {card.html ? (
        <Html db={db} deck={card.deck} html={shown ? card.back[0] : card.front} autoplay={autoplay} />
      ) : (
        <div className="kana" lang="ja"><Ruby text={card.front} reading={card.reading} /></div>
      )}
      <div className="answer-slot" aria-live="polite" tabIndex={-1} ref={slot}>
        {shown && (
          <>
            {card.reading && <div className="reading" lang="ja">{card.reading}</div>}
            {kanji ? (
              <>
                <div className="answer">{kanji.gloss}</div>
                <Mnemonic item={kanji} />
                <p className="kanji-readings" lang="ja">{[kanji.on?.length && `音 ${kanji.on.join('・')}`, kanji.kun?.length && `訓 ${kanji.kun.join('・')}`].filter(Boolean).join('　')}</p>
                {example && <p className="kanji-example"><span lang="ja"><Ruby text={example.written ?? example.kanji ?? example.jp} reading={example.written ?? example.kanji ? example.jp : undefined} /></span> {example.gloss} <SpeakButton text={example.jp} /></p>}
              </>
            ) : !card.html && <><div className="answer">{card.back[0]} <SpeakButton text={card.reading ?? card.front} /></div>{ITEMS.get(card.id) && <Mnemonic item={ITEMS.get(card.id)!} />}</>}
            <div className="grades">
              {GRADES.map(([g, label, cls]) => (
                <button key={label} className={cls} onClick={() => onGrade(g)}>{label}<small aria-label={`next in ${next[g]}`}>{next[g]}</small></button>
              ))}
            </div>
          </>
        )}
      </div>
      {!shown && <button className="primary" autoFocus onClick={() => setShown(true)}>Show answer <kbd aria-hidden="true">space</kbd></button>}
    </div>
  )
}
