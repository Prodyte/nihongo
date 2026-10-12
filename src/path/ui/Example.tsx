import { useEffect, useState } from 'react'
import { SpeakButton } from '../../modes/SpeakButton'
import type { Item } from '../course'
import { exampleFor, loadExamples, splitAround, type Ex } from '../examples'
import { readingOf } from '../romaji'
import { Ruby } from './Ruby'

/** A word in use: one short sentence with furigana (the word marked), its English and audio. Nothing for words without
 * one, or offline. `revealed: false` is a review card's front: the sentence alone, since its English and sound give the answer away. */
export function Example({ item, revealed = true }: { item: Item; revealed?: boolean }) {
  const [ex, setEx] = useState<Ex | null>(null)
  useEffect(() => {
    let live = true
    if (item.kind === 'word') loadExamples().then((all) => live && setEx(exampleFor(all, item) ?? null), () => {})
    return () => { live = false }
  }, [item])
  if (!ex) return null
  const split = splitAround(ex[0], item)
  return (
    <figure className="example">
      <p>
        <span lang="ja">{split ? <><Ruby text={split[0]} /><mark><Ruby text={split[1]} /></mark><Ruby text={split[2]} /></> : <Ruby text={ex[0]} />}</span>
        {revealed && <SpeakButton text={readingOf(ex[0])} />}
      </p>
      {revealed && <figcaption>{ex[1]}</figcaption>}
    </figure>
  )
}
