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
  return ex.type === 'intro' ? (ex.item.kind === 'kanji' ? <KanjiIntro key={step} item={ex.item} onDone={onDone} /> : <Intro key={step} item={ex.item} autoplay={autoplay} onDone={onDone} />)
    : ex.type === 'explain' ? <Explain key={step} ex={ex} onDone={onDone} />
    : ex.type === 'build' ? <Build key={step} ex={ex} onDone={onDone} />
    : ex.type === 'match' ? <Match key={step} pairs={ex.pairs} onDone={onDone} />
    : ex.type === 'type' ? <Type key={step} ex={ex} autoplay={autoplay} onDone={onDone} />
    : ex.type === 'write' ? <Write key={step} ex={ex} onDone={onDone} />
    : ex.type === 'speak' ? <Speak key={step} ex={ex} onDone={onDone} onSkip={onSkipSpeaking} />
    : <Choice key={step} ex={ex} autoplay={autoplay} onDone={onDone} />
}
