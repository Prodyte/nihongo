import { useEffect, useState } from 'react'
import { SpeakButton } from '../../modes/SpeakButton'
import type { Item } from '../course'
import { exampleFor, loadExamples, type Ex } from '../examples'
import { readingOf } from '../romaji'
import { Ruby } from './Ruby'

/** A word in use: one short sentence with furigana, its English and audio. Nothing for words without one, or offline. */
export function Example({ item }: { item: Item }) {
  const [ex, setEx] = useState<Ex | null>(null)
  useEffect(() => {
    let live = true
    if (item.kind === 'word') loadExamples().then((all) => live && setEx(exampleFor(all, item) ?? null), () => {})
    return () => { live = false }
  }, [item])
  if (!ex) return null
  return (
    <figure className="example">
      <p><span lang="ja"><Ruby text={ex[0]} /></span><SpeakButton text={readingOf(ex[0])} /></p>
      <figcaption>{ex[1]}</figcaption>
    </figure>
  )
}
