import { useContext } from 'react'
import { FuriganaContext } from './furigana'

const KANJI = /[㐀-鿿々]/g

/** A word written with kanji, with its reading above it as furigana when the setting says so. Put it inside lang="ja". */
export function Ruby({ text, reading }: { text: string; reading?: string }) {
  const { mode, known } = useContext(FuriganaContext)
  const unknown = (text.match(KANJI) ?? []).some((c) => !known.has(c))
  const show = !!reading && reading !== text && (mode === 'always' || (mode === 'auto' && unknown))
  return show ? <ruby>{text}<rt>{reading}</rt></ruby> : <>{text}</>
}
