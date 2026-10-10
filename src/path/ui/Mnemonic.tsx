import type { Item } from '../course'
import { memoFor } from '../mnemonic'

export function Mnemonic({ item }: { item: Item }) {
  const memo = memoFor(item)
  if (!memo) return null
  return (
    <p className="mnemonic">
      <span className="label">{memo.label}:</span>{' '}
      {memo.pieces.map(([c, m], i) => (
        <span key={c}>{i > 0 && ' + '}<span lang="ja">{c}</span>{m && <> {m}</>}</span>
      ))}
    </p>
  )
}
