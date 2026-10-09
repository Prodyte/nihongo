import { written, type Item } from '../course'

/** Result line (always mounted so screen readers announce changes) plus a Continue button once answered. */
export function Feedback({ result, item, answer, note, onContinue }: { result: boolean | null; item: Item; answer: string; note?: string; onContinue: () => void }) {
  return (
    <>
      <div role="status" className={result === null ? '' : result ? 'feedback good' : 'feedback bad'}>
        {result === null ? '' : (
          <>
            <div>{result ? '✓ Correct' : `✗ Correct answer: ${answer}`}</div>
            {note && <div>{note}</div>}
            <small>
              <span lang="ja">{written(item)}{item.written && ` ${item.jp}`}</span> {item.kind === 'kana' ? '= ' : `(${item.romaji}) `}
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
    </>
  )
}
