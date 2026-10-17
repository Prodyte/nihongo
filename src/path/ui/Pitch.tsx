import { useEffect, useState } from 'react'
import type { Item } from '../course'
import { accentFor, isHigh, loadAccents, morae, pattern } from '../accents'

const nth = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`

/** A word's pitch accent over its kana: a line over the high morae and a drop mark after the accent; a flat (heiban)
 * line runs on past the word. One drawing per accent the word has; nothing for words without data, or offline. */
export function Pitch({ item }: { item: Item }) {
  const [got, setGot] = useState<{ item: Item; drops?: number[] } | null>(null) // tagged with its item: a new word never shows the last one's
  useEffect(() => {
    let live = true
    if (item.kind === 'word') loadAccents().then((all) => live && setGot({ item, drops: accentFor(all, item) }), () => {})
    return () => { live = false }
  }, [item])
  const drops = got?.item === item ? got.drops : undefined
  if (!drops?.length) return null
  const ms = morae(item.jp)
  return (
    <div className="pitch">
      {drops.map((d) => {
        const p = pattern(d, ms.length)
        const label = `pitch: ${p}, ${d === 0 ? 'no drop' : `drops after the ${p === 'odaka' ? 'last' : nth(d)} mora`}`
        return (
          <span key={d} role="img" aria-label={label} title={label} lang="ja">
            {ms.map((m, i) => <span key={i} className={[isHigh(i, d) && 'hi', i + 1 === d && 'drop'].filter(Boolean).join(' ') || undefined}>{m}</span>)}
            {d === 0 && <span className="hi tail" />}
          </span>
        )
      })}
    </div>
  )
}
