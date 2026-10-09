import { createContext } from 'react'

export const FURIGANA = ['auto', 'always', 'never'] as const
export type Furigana = (typeof FURIGANA)[number]
/** auto: readings over kanji the learner hasn't had a kanji lesson for yet. `known` holds those kanji characters. */
export const FuriganaContext = createContext<{ mode: Furigana; known: ReadonlySet<string> }>({ mode: 'auto', known: new Set() })
