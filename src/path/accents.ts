import type { Item } from './course'

let accents: Promise<Record<string, number[]>> | null = null
/** Pitch accents of course words (Kanjium, CC BY-SA 4.0, built by scripts/build_accents.py), fetched once and cached offline by the PWA. */
export const loadAccents = () => {
  accents ??= fetch(`${import.meta.env.BASE_URL}accents.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
  accents.catch(() => { accents = null }) // let a later card try again (e.g. back online)
  return accents
}
/** A word's downstep positions, most common first (0: no drop, n: drops after the n-th mora). Keyed "written|reading" like examples.json. */
export const accentFor = (all: Record<string, number[]>, it: Item): number[] | undefined =>
  it.kind === 'word' ? all[`${it.written ?? it.kanji ?? ''}|${it.jp}`] : undefined

/** Kana split into morae: a small ゃ/ゅ/ょ (or ァ, ィ...) joins the kana before it; っ, ー and ん are morae of their own. */
export const morae = (kana: string) => kana.match(/.[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]?/gu) ?? []

export type Pattern = 'heiban' | 'atamadaka' | 'nakadaka' | 'odaka'
export const pattern = (drop: number, count: number): Pattern => (drop === 0 ? 'heiban' : drop === 1 ? 'atamadaka' : drop >= count ? 'odaka' : 'nakadaka')
/** Is mora i (from 0) high? Tokyo pitch: the first mora is low unless the accent is on it; the rest are high up to the drop. */
export const isHigh = (i: number, drop: number) => (drop === 1 ? i === 0 : i > 0 && (drop === 0 || i < drop))
