import { useMemo } from 'react'
import { Rating } from 'ts-fsrs'
import { ITEMS } from '../path/course'
import { gapFor } from '../path/lesson'
import { Choice } from '../path/ui/Choice'
import type { ModeProps } from './types'

/** Grammar cards are reviewed like Bunpro: the sentence with its grammar point blanked out, and the English as the hint. */
export function Cloze({ card, autoplay, onGrade }: ModeProps) {
  const ex = useMemo(() => gapFor(ITEMS.get(card.id)!), [card.id])
  return <Choice ex={ex} autoplay={autoplay} onDone={(missed) => onGrade(missed.length ? Rating.Again : Rating.Good)} />
}
