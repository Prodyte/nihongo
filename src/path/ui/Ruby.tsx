import { useContext } from 'react'
import { furiganaParts } from '../romaji'
import { FuriganaContext } from './furigana'

const KANJI = /[\p{Script=Han}々]/gu

/**
 * Japanese with furigana when the setting says so. Put it inside lang="ja". Either a word and its whole reading
 * (時間 + じかん), or text marked up per kanji run (学校[がっこう]に 行[い]きます), as sentences are.
 */
export function Ruby({ text, reading }: { text: string; reading?: string }) {
  const { mode, known } = useContext(FuriganaContext)
  const show = (kanji: string, r: string | undefined) => !!r && r !== kanji && (mode === 'always' || (mode === 'auto' && (kanji.match(KANJI) ?? []).some((c) => !known.has(c))))
  if (text.includes('[')) return <>{furiganaParts(text).map((p, i) => (typeof p === 'string' ? p : show(p[0], p[1]) ? <ruby key={i}>{p[0]}<rt>{p[1]}</rt></ruby> : p[0]))}</>
  return show(text, reading) ? <ruby>{text}<rt>{reading}</rt></ruby> : <>{text}</>
}
