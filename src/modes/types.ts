import type { Grade } from 'ts-fsrs'
import type { StoredCard } from '../db/db'

export interface ModeProps {
  card: StoredCard
  pool: StoredCard[] // all cards in the session's deck, for quiz distractors
  onGrade: (g: Grade) => void
}
