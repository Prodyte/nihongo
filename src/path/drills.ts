// Practice drills built from what the learner has already learned on the path.
import { shuffle } from '../modes/choices'
import { conjugate, conjugateWritten, FORM_LABEL, FORMS, verbClass, type Form } from './conjugate'
import type { Db } from '../db/db'
import { ITEMS, LESSONS, written, type Item } from './course'
import type { Exercise } from './lesson'
import { getProgress, learnedItems } from './progress'
import { kanaToRomaji } from './romaji'

export const DRILL_SIZE = 10

/** Words and sentences the learner has met (kana are drilled by the path and Review). */
export const drillable = (learned: Iterable<Item>) => [...learned].filter((i) => i.kind === 'word' || i.kind === 'sentence')

/** Say it aloud: read Japanese, say it from the English, or repeat it after hearing it (shadowing). */
export function speakingDrill(items: Item[], mode: 'read' | 'recall' | 'shadow', rand: () => number = Math.random): Exercise[] {
  return shuffle(items, rand).slice(0, DRILL_SIZE).map((item) => ({ type: 'speak', item, mode }))
}

/** Listening: hear a word and type it; hear a sentence and pick what it means. */
export function listeningDrill(items: Item[], rand: () => number = Math.random): Exercise[] {
  const sentences = items.filter((i) => i.kind === 'sentence')
  return shuffle(items, rand).slice(0, DRILL_SIZE).map((item): Exercise => {
    if (item.kind === 'word') return { type: 'type', item, dir: 'dictation', prompt: '' }
    const wrong = shuffle(sentences.filter((s) => s.gloss !== item.gloss), rand).slice(0, 3).map((s) => s.gloss)
    return { type: 'choice', item, dir: 'hearMeaning', prompt: '', options: shuffle([item.gloss, ...wrong], rand), answer: item.gloss }
  }).filter((e) => !('options' in e) || e.options.length >= 2)
}

/** The verbs among learned words (glossed "to …", with a dictionary-form ending). */
export const verbsIn = (items: Item[]) => items.filter((i) => i.kind === 'word' && /^to /.test(i.gloss) && verbClass(i.jp, written(i)))

/** Conjugation: a verb you know, a form to put it in, typed in romaji (the kana appear as you type). */
export function conjugationDrill(verbs: Item[], rand: () => number = Math.random): Exercise[] {
  return shuffle(verbs, rand).slice(0, DRILL_SIZE).map((v, i): Exercise => {
    const form: Form = FORMS[Math.floor(rand() * FORMS.length) % FORMS.length] ?? FORMS[i % FORMS.length]
    const cls = verbClass(v.jp, written(v))!
    const kana = conjugate(v.jp, form, cls)
    const shown = conjugateWritten(written(v), v.jp, form, cls)
    const item: Item = { id: `conj:${v.id}:${form}`, kind: 'word', jp: kana, ...(shown !== kana && { written: shown }), gloss: `${v.gloss} (${FORM_LABEL[form]})`, romaji: kanaToRomaji(kana), sound: kanaToRomaji(kana) }
    return { type: 'type', item, dir: 'conjugate', prompt: written(v), promptReading: v.jp, label: FORM_LABEL[form] }
  })
}

export type DrillKind = 'speak-read' | 'speak-recall' | 'shadow' | 'listen' | 'conjugate'
export const DRILL_TITLE: Record<DrillKind, string> = {
  'speak-read': 'Read aloud', 'speak-recall': 'Say it in Japanese', shadow: 'Shadowing', listen: 'Listening', conjugate: 'Verb conjugation',
}

/** What the learner has met on the path, as items. */
export async function learnedForDrills(db: Db) {
  const p = await getProgress(db)
  return drillable([...learnedItems(LESSONS, p.done)].flatMap((id) => ITEMS.get(id) ?? []))
}

export function buildDrill(kind: DrillKind, items: ReturnType<typeof drillable>): Exercise[] {
  if (kind === 'listen') return listeningDrill(items)
  if (kind === 'conjugate') return conjugationDrill(verbsIn(items))
  return speakingDrill(items, kind === 'speak-read' ? 'read' : kind === 'speak-recall' ? 'recall' : 'shadow')
}

