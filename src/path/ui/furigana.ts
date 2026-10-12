import { createContext, useContext, type CSSProperties } from 'react'
import { furiganaParts } from '../romaji'

export const FURIGANA = ['auto', 'always', 'never'] as const
export type Furigana = (typeof FURIGANA)[number]
/** auto: readings over kanji the learner hasn't had a kanji lesson for yet. `known` holds those kanji characters.
 * `romaji`: whether to show romaji next to Japanese (by default only until the kana are learned: it is a crutch after that). */
export const FuriganaContext = createContext<{ mode: Furigana; known: ReadonlySet<string>; romaji: boolean }>({ mode: 'auto', known: new Set(), romaji: true })
export const useRomaji = () => useContext(FuriganaContext).romaji

export const ROMAJI = ['auto', 'always', 'never'] as const
export type Romaji = (typeof ROMAJI)[number]

/** How many characters wide Japanese is (furigana over a kanji can be wider than the kanji). */
export const charWidth = (text: string, reading?: string) => Math.max(1, text.includes('[')
  ? furiganaParts(text).reduce((w, p) => w + (typeof p === 'string' ? [...p].length : Math.max([...p[0]].length, [...p[1]].length / 2)), 0)
  : Math.max([...text].length, [...(reading ?? '')].length / 2))

/** Style for big Japanese: its width in characters (--n), so CSS can shrink it to fit one line: おやすみなさい in one line, not three. */
export const fit = (text: string, reading?: string) => ({ '--n': charWidth(text, reading) }) as CSSProperties
