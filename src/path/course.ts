import { KANA, toKata } from '../data/kana'
import { VOCAB_UNITS } from './vocab'

/** One thing a lesson teaches. For kana, `gloss` is the romaji; for words it is the English meaning. */
export interface Item {
  id: string // 'hira:あ' | 'kata:ア' (the existing card ids) | 'vocab:<romaji-slug>'
  kind: 'kana' | 'word'
  script?: 'hira' | 'kata'
  jp: string
  gloss: string
  romaji: string
  sound: string // what it sounds like: items with the same sound can't be told apart by ear (お/を are both "o")
  kanji?: string
  note?: string // shown on the intro card
  accepts?: string[] // kana: every romaji spelling accepted when typed (shi/si, ji/di...)
}
export interface Lesson { id: string; title: string; items: string[] }
export interface Unit { id: string; title: string; blurb: string; lessons: Lesson[] }

const HIRA_BASE = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'らりるれろ', 'やゆよわをん']
const HIRA_VOICED = ['がぎぐげご', 'ざじずぜぞ', 'だぢづでど', 'ばびぶべぼ', 'ぱぴぷぺぽ']
const HIRA_COMBO_ROWS = ['きゃきゅきょ', 'しゃしゅしょ', 'ちゃちゅちょ', 'にゃにゅにょ', 'ひゃひゅひょ', 'みゃみゅみょ', 'りゃりゅりょ', 'ぎゃぎゅぎょ', 'じゃじゅじょ', 'びゃびゅびょ', 'ぴゃぴゅぴょ']

const chars = (s: string) => s.match(/.[ゃゅょ]?/gu)!
const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))

export const ITEMS = new Map<string, Item>()
const NOTES: Record<string, string> = { 'hira:を': 'Written "wo" but pronounced "o". Mostly used as a grammar particle.', 'kata:ヲ': 'Written "wo" but pronounced "o". Rare in katakana.' }
for (const k of KANA)
  ITEMS.set(k.id, { id: k.id, kind: 'kana', script: k.script, jp: k.kana, gloss: k.romaji[0], romaji: k.romaji[0], sound: k.romaji[0] === 'wo' ? 'o' : k.romaji[0], note: NOTES[k.id], accepts: k.romaji })

function kanaUnits(script: 'hira' | 'kata'): Unit[] {
  const name = script === 'hira' ? 'Hiragana' : 'Katakana'
  const conv = (s: string) => (script === 'hira' ? s : toKata(s))
  const unit = (id: string, title: string, blurb: string, groups: string[][]): Unit => ({
    id: `${script}-${id}`, title: `${name}: ${title}`, blurb,
    lessons: groups.map((g, i) => {
      const items = g.map((c) => `${script}:${conv(c)}`)
      return { id: `${script}-${id}-${i + 1}`, title: items.map((x) => x.slice(5)).join(' '), items }
    }),
  })
  return [
    unit('basic', 'the basics', 'The 46 basic sounds.', HIRA_BASE.map(chars)),
    unit('voiced', 'voiced sounds', 'Add two small marks to change the sound.', HIRA_VOICED.map(chars)),
    unit('combos', 'combined sounds', 'Small や ゆ よ blend two sounds into one.', chunk(HIRA_COMBO_ROWS.map(chars), 2).map((rows) => rows.flat())),
  ]
}

function vocabUnits(): Unit[] {
  return VOCAB_UNITS.map((u) => {
    const ids = u.words.map(([jp, romaji, en, kanji]) => {
      const id = `vocab:${romaji.replace(/'/g, '').replace(/ /g, '-')}` // ids ignore the apostrophe so they stay stable
      ITEMS.set(id, { id, kind: 'word', jp, gloss: en, romaji, sound: romaji.replace(/ /g, ''), kanji })
      return id
    })
    return { id: u.id, title: u.title, blurb: u.blurb, lessons: chunk(ids, 6).map((items, i) => ({ id: `${u.id}-${i + 1}`, title: `${u.title} ${i + 1}`, items })) }
  })
}

export const UNITS: Unit[] = [...kanaUnits('hira'), ...kanaUnits('kata'), ...vocabUnits()]
/** Every lesson in course order; a lesson unlocks when the one before it is done. */
export const LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons)
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id)
