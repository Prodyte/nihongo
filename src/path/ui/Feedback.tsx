import { toKata } from '../../data/kana'
import { useEffect } from 'react'
import { sfx } from '../../sfx'
import { written, type Item } from '../course'
import { Ruby } from './Ruby'

/** The result in a bar pinned to the bottom (its text is always mounted so screen readers announce changes), with Continue. */
export function Feedback({ result, item, answer, note, onContinue }: { result: boolean | null; item: Item; answer: string; note?: string; onContinue: () => void }) {
  useEffect(() => {
    if (result !== null) sfx(result ? 'right' : 'wrong')
  }, [result])
  return (
    <div className={result === null ? '' : result ? 'feedback good' : 'feedback bad'}>
      <div role="status">
        {result === null ? '' : (
          <>
            <div>{result ? '✓ Correct' : <>✗ Correct answer: <Ruby text={answer} /></>}</div>
            {note && <div>{note}</div>}
            <small>
              <span lang="ja"><Ruby text={written(item)} />{item.written && ` ${item.jp}`}</span>{' '}
              {item.kind === 'kana' ? '= ' : item.kind === 'kanji' ? <span lang="ja">({[...(item.on ?? []).map(toKata), ...(item.kun ?? [])].join('、')}) </span> : `(${item.romaji}) `}
              {item.gloss}
              {item.kanji && <> · <span lang="ja">{item.kanji}</span></>}
            </small>
          </>
        )}
      </div>
      {result !== null && (
        // a held Enter would auto-repeat onto this button and skip the next exercise
        <button className="primary" autoFocus onKeyDown={(e) => e.repeat && e.preventDefault()} onClick={onContinue}>Continue</button>
      )}
    </div>
  )
}
