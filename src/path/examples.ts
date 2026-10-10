import type { Item } from './course'

export type Ex = [jp: string, en: string, tatoeba: number]
let examples: Promise<Record<string, Ex>> | null = null
/** Example sentences (Tatoeba, CC BY 2.0 FR, built by scripts/build_examples.py), fetched once and cached offline by the PWA. */
export const loadExamples = () => {
  examples ??= fetch(`${import.meta.env.BASE_URL}examples.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
  examples.catch(() => { examples = null }) // let a later card try again (e.g. back online)
  return examples
}
/** Keyed "written|reading". A starter word whose JLPT twin was merged into it (あか for 赤|あか) uses its reading when only one key has it. */
export const exampleFor = (all: Record<string, Ex>, it: Item): Ex | undefined => {
  const exact = all[`${it.written ?? it.kanji ?? ''}|${it.jp}`]
  if (exact || !it.id.startsWith('vocab:')) return exact
  const same = Object.keys(all).filter((k) => k.endsWith(`|${it.jp}`))
  return same.length === 1 ? all[same[0]] : undefined
}
