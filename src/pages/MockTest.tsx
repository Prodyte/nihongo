import { useEffect, useState } from 'react'
import { useJaVoice } from '../audio'
import { ExitButton } from '../icons'
import { ITEMS } from '../path/course'
import { buildMock, MOCK_MINUTES, MOCK_PASS, MOCK_QUESTIONS, mockBestKey, type MockLevel, type MockQuestion } from '../path/mock'
import { ExerciseView } from '../path/ui/ExerciseView'
import { Ruby } from '../path/ui/Ruby'
import { readInt, writeInt } from '../settings'
import { sfx } from '../sfx'

const clock = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }

/** A timed mock JLPT exam over a whole level. Practice only: it saves its best score and nothing else (no cards, lessons or XP). */
export function MockTest({ level, onExit }: { level: MockLevel; onExit: () => void }) {
  const voice = useJaVoice()
  const [best] = useState(() => readInt(mockBestKey(level), -1)) // before this attempt
  const [qs, setQs] = useState<MockQuestion[] | null>(null)
  const [end, setEnd] = useState(0) // the deadline (ms)
  const [now, setNow] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([]) // right or wrong, in question order
  const done = !!qs && (answers.length >= qs.length || now >= end)
  const right = qs ? qs.map((_, i) => !!answers[i]) : []
  const pct = qs ? Math.round((100 * right.filter(Boolean).length) / qs.length) : 0

  useEffect(() => {
    if (!qs || done) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [qs, done])
  useEffect(() => {
    if (!done) return
    if (pct > best) writeInt(mockBestKey(level), pct)
    sfx(pct >= MOCK_PASS * 100 ? 'done' : 'wrong')
  }, [done, pct, best, level])

  const start = () => {
    const t = Date.now()
    setQs(buildMock(level, ITEMS, voice))
    setNow(t)
    setEnd(t + MOCK_MINUTES * 60_000)
  }

  if (!qs) return (
    <>
      <ExitButton onClick={onExit} />
      <div className="card mock">
        <h2>Mock JLPT N{level}</h2>
        <p>{MOCK_QUESTIONS} questions in {MOCK_MINUTES} minutes over the whole level, learned or not: vocabulary, kanji, grammar{voice ? ' and listening' : ''}. {MOCK_PASS * 100}% passes.</p>
        {!voice && <p className="hint">There’s no Japanese voice on this device, so no listening section.</p>}
        <p className="hint">Practice only: your reviews and lessons don’t change.</p>
        {best >= 0 && <p className="counts">Your best: {best}%</p>}
        <button className="primary big" autoFocus onClick={start}>Start</button>
      </div>
    </>
  )

  if (done) {
    const sections = [...new Set(qs.map((q) => q.section))].map((s) => {
      const mine = qs.flatMap((q, i) => (q.section === s ? [right[i]] : []))
      return { s, right: mine.filter(Boolean).length, of: mine.length }
    })
    const missed = qs.filter((_, i) => !right[i])
    return (
      <div className="card mock">
        <h2>{pct >= MOCK_PASS * 100 ? 'Passed 🎉' : 'Not this time'}</h2>
        <p className="counts">{pct}% · {right.filter(Boolean).length} of {qs.length} right · {MOCK_PASS * 100}% to pass</p>
        {answers.length < qs.length && <p>Time’s up: unanswered questions count as wrong.</p>}
        <p className="hint">{pct > best ? `A new best for N${level}.` : `Your best: ${best}%`}</p>
        <dl className="mock-sections">
          {sections.map((x) => <div key={x.s}><dt>{x.s}</dt><dd>{x.right} / {x.of}</dd></div>)}
        </dl>
        {missed.length > 0 && (
          <>
            <h3>To go over</h3>
            <ul className="mock-missed">
              {missed.map(({ ex }) => (
                <li key={ex.item.id}>
                  <span lang="ja"><Ruby text={ex.type === 'listen' ? ex.item.jp : ex.prompt} /></span>{/* listening: what was heard, then how it is written */}
                  <strong lang={ex.answer === ex.item.gloss ? undefined : 'ja'}><Ruby text={ex.answer} reading={ex.readings?.[ex.answer]} /></strong>
                  {ex.answer !== ex.item.gloss && <small>{ex.item.gloss}</small>}
                </li>
              ))}
            </ul>
          </>
        )}
        <button className="primary" autoFocus onClick={onExit}>Done</button>
      </div>
    )
  }

  const left = end - now
  const q = qs[answers.length]
  const answer = (missed: string[]) => setAnswers((a) => [...a, missed.length === 0])
  return (
    <div className="lesson">
      <div className="bar">
        <ExitButton onClick={onExit} />
        <progress max={qs.length} value={answers.length} aria-label="Test progress" />
        <span className="mock-timer" role="timer">{clock(left)}<span className="visually-hidden"> left</span></span>
      </div>
      {/* the countdown is announced twice, not every second */}
      <p className="visually-hidden" aria-live="polite">{left <= 60_000 ? '1 minute left' : left <= 5 * 60_000 ? '5 minutes left' : ''}</p>
      <p className="hint test-label">Mock N{level} · {q.section} · {answers.length + 1} of {qs.length}</p>
      <ExerciseView ex={q.ex} step={answers.length} autoplay={false} onDone={answer} onSkipSpeaking={() => answer([])} />
    </div>
  )
}
