// Verb conjugation for the drills: polite and plain forms of course verbs, in kana and as written.

export const FORMS = ['masu', 'masen', 'mashita', 'te', 'ta', 'nai'] as const
export type Form = (typeof FORMS)[number]
export const FORM_LABEL: Record<Form, string> = {
  masu: 'polite (ます)', masen: 'polite negative (ません)', mashita: 'polite past (ました)', te: 'て-form', ta: 'plain past (た)', nai: 'plain negative (ない)',
}

/** Verbs ending in -iru/-eru that are godan anyway (the る is part of the stem): 帰る かえります, not かえます. By written
 * form, since readings collide: 帰る (godan) and 変える (ichidan) are both かえる; 切る (godan) and 着る (ichidan) both きる. */
const GODAN_RU = new Set(['帰る', '返る', '入る', '知る', '走る', '切る', '要る', '減る', '喋る', 'しゃべる', '滑る', '握る', '蹴る', '焦る', '限る',
  '散る', '参る', '混じる', '交じる', '練る', '茂る', '湿る', '遮る', '覆る', '嘲る', '罵る', '捻る', '翻る', '陥る', '甦る', '照る', 'いじる', '弄る', '反る'])

const I_ROW: Record<string, string> = { う: 'い', く: 'き', ぐ: 'ぎ', す: 'し', つ: 'ち', ぬ: 'に', ぶ: 'び', む: 'み', る: 'り' }
const A_ROW: Record<string, string> = { う: 'わ', く: 'か', ぐ: 'が', す: 'さ', つ: 'た', ぬ: 'な', ぶ: 'ば', む: 'ま', る: 'ら' }
const TE: Record<string, [string, string]> = { う: ['って', 'った'], つ: ['って', 'った'], る: ['って', 'った'], む: ['んで', 'んだ'], ぶ: ['んで', 'んだ'], ぬ: ['んで', 'んだ'], く: ['いて', 'いた'], ぐ: ['いで', 'いだ'], す: ['して', 'した'] }
const E_I = /[いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ]る$/

export type VerbClass = 'ichidan' | 'godan' | 'suru' | 'kuru'

/** The class of a dictionary-form verb, from its reading and (to tell 着る from 切る) its written form. */
export function verbClass(reading: string, written = reading): VerbClass | null {
  if (reading === 'する' || reading.endsWith('する')) return 'suru'
  if (reading === 'くる') return 'kuru'
  if (!/[うくぐすつぬぶむる]$/.test(reading)) return null
  if ([...GODAN_RU].some((g) => written.endsWith(g))) return 'godan' // also compounds: 裏切る, 横切る, 気に入る
  return E_I.test(reading) ? 'ichidan' : 'godan'
}

/** A verb in `form`, as kana. 行く has the irregular て/た (行って), ある the irregular negative (ない). */
export function conjugate(reading: string, form: Form, cls: VerbClass): string {
  if (cls === 'suru' || cls === 'kuru') {
    const stem = cls === 'suru' ? reading.slice(0, -2) : ''
    const [masu, te, ta, nai] = cls === 'suru' ? ['し', 'して', 'した', 'しない'] : ['き', 'きて', 'きた', 'こない']
    return stem + { masu: `${masu}ます`, masen: `${masu}ません`, mashita: `${masu}ました`, te, ta, nai }[form]
  }
  const stem = reading.slice(0, -1)
  const last = reading.slice(-1)
  if (cls === 'ichidan') return stem + { masu: 'ます', masen: 'ません', mashita: 'ました', te: 'て', ta: 'た', nai: 'ない' }[form]
  const i = stem + I_ROW[last]
  if (form === 'masu' || form === 'masen' || form === 'mashita') return i + { masu: 'ます', masen: 'ません', mashita: 'ました' }[form]
  if (form === 'nai') return reading === 'ある' ? 'ない' : stem + A_ROW[last] + 'ない'
  const [te, ta] = reading === 'いく' ? ['って', 'った'] : TE[last] // 行く: いって, not いいて
  return stem + (form === 'te' ? te : ta)
}

/**
 * The written form of a conjugated verb: the kanji part of `written` stays and the kana after it changes like the
 * reading (食べる -> 食べて, 書く -> 書いて). 来る keeps its kanji over a changing reading (来ます, 来ない).
 */
export function conjugateWritten(written: string, reading: string, form: Form, cls: VerbClass): string {
  const kana = conjugate(reading, form, cls)
  if (written === reading) return kana
  if (cls === 'kuru') return `来${kana.slice(1)}`
  // the okurigana: the longest common kana tail of written and reading
  let n = 0
  while (n < written.length && written[written.length - 1 - n] === reading[reading.length - 1 - n] && /[ぁ-ん]/.test(written[written.length - 1 - n])) n++
  const kanjiPart = written.slice(0, written.length - n)
  const readingStem = reading.slice(0, reading.length - n)
  return kana.startsWith(readingStem) ? kanjiPart + kana.slice(readingStem.length) : kana
}
