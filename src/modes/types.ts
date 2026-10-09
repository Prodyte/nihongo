import type { Grade } from 'ts-fsrs'
import type { Db, StoredCard } from '../db/db'

export interface ModeProps {
  db: Db
  card: StoredCard
  pool: StoredCard[] // all cards in the session's deck, for quiz distractors
  onGrade: (g: Grade) => void
}
