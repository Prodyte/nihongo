import type { Item } from '../course'
import { memoFor } from '../mnemonic'

export function Mnemonic({ item }: { item: Item }) {
  const memo = memoFor(item)
  if (!memo) return null
  return (
    <div className="mnemonic">
      {memo.story?.split('\n').map((line) => <p key={line}>{line}</p>) /* a kana sound's hint: one line per script */}
      {memo.pieces.length > 0 && (
        <p>
          <span className="label">{memo.label}:</span>{' '}
          {memo.pieces.map(([c, m], i) => (
            <span key={c}>{i > 0 && ' + '}<span lang="ja">{c}</span>{m && <> {m}</>}</span>
          ))}
        </p>
      )}
    </div>
  )
}
