import { useEffect } from 'react'
import type { Exercise } from '../lesson'
import { Build } from './Build'
import { Choice } from './Choice'
import { Explain } from './Explain'
import { Intro } from './Intro'
import { KanjiIntro } from './KanjiIntro'
import { Match } from './Match'
import { Speak } from './Speak'
import { Type } from './Type'
import { Write } from './Write'

/** Any exercise, by type. `step` keys it, so each new exercise starts fresh. */
export function ExerciseView({ ex, step, autoplay, onDone, onSkipSpeaking }: { ex: Exercise; step: number; autoplay: boolean; onDone: (missed: string[]) => void; onSkipSpeaking: () => void }) {
  // The focused Continue button left with the last exercise: move focus to the new question, not <body> (keyboard and
  // screen reader users start there). An exercise that focuses its own input or button (autoFocus) keeps it.
  useEffect(() => {
    if (document.activeElement && document.activeElement !== document.body) return
    const q = document.querySelector<HTMLElement>('.card > .q')
    if (!q) return
    q.tabIndex = -1
    q.focus({ preventScroll: true })
  }, [step])
  return ex.type === 'intro' ? (ex.item.kind === 'kanji' ? <KanjiIntro key={step} item={ex.item} onDone={onDone} /> : <Intro key={step} item={ex.item} autoplay={autoplay} onDone={onDone} />)
    : ex.type === 'explain' ? <Explain key={step} ex={ex} onDone={onDone} />
    : ex.type === 'build' ? <Build key={step} ex={ex} onDone={onDone} />
    : ex.type === 'match' ? <Match key={step} pairs={ex.pairs} autoplay={autoplay} onDone={onDone} />
    : ex.type === 'type' ? <Type key={step} ex={ex} autoplay={autoplay} onDone={onDone} />
    : ex.type === 'write' ? <Write key={step} ex={ex} onDone={onDone} />
    : ex.type === 'speak' ? <Speak key={step} ex={ex} onDone={onDone} onSkip={onSkipSpeaking} />
    : <Choice key={step} ex={ex} autoplay={autoplay} onDone={onDone} />
}
