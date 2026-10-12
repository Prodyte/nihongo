import { createContext, useContext } from 'react'

export const FURIGANA = ['auto', 'always', 'never'] as const
export type Furigana = (typeof FURIGANA)[number]
/** auto: readings over kanji the learner hasn't had a kanji lesson for yet. `known` holds those kanji characters.
 * `romaji`: whether to show romaji next to Japanese (by default only until the kana are learned: it is a crutch after that). */
export const FuriganaContext = createContext<{ mode: Furigana; known: ReadonlySet<string>; romaji: boolean }>({ mode: 'auto', known: new Set(), romaji: true })
export const useRomaji = () => useContext(FuriganaContext).romaji

export const ROMAJI = ['auto', 'always', 'never'] as const
export type Romaji = (typeof ROMAJI)[number]
