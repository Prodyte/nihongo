import { toKata } from '../../data/kana'
import { useEffect } from 'react'
import { sfx } from '../../sfx'
import { SpeakButton } from '../../modes/SpeakButton'
import { ITEMS, written, type Item } from '../course'
import { hintFor } from '../mnemonic'
import { useRomaji } from './furigana'
import { Ruby } from './Ruby'

/** The result in a bar pinned to the bottom (its text is always mounted so screen readers announce changes), with the
 * word's sound (unless the exercise already shows it; a lone kanji has several readings) and Continue. */
export function Feedback({ result, item, answer, note, audio = true, onContinue }: { result: boolean | null; item: Item; answer: string; note?: string; audio?: boolean; onContinue: () => void }) {
  const romaji = useRomaji()
  useEffect(() => {
    if (result !== null) sfx(result ? 'right' : 'wrong')
  }, [result])
  return (
    <div className={result === null ? '' : result ? 'feedback good' : 'feedback bad'}>
      <div className="feedback-head">
        <div role="status">
          {result === null ? '' : (
            <>
              <div className="keep">{result ? '✓ Correct' : <>✗ Correct answer: <Ruby text={answer} /></>}</div>
              {note && <div>{note}</div>}
              <small>
                <span lang="ja"><Ruby text={item.kind === 'kana' ? [ITEMS.get(item.id)?.jp, ITEMS.get(item.id)?.kata].join(' ') : written(item)} />{item.written && ` ${item.jp}`}</span>{' '}
                {item.kind === 'kana' ? '= ' : item.kind === 'kanji' ? <span lang="ja">({[...(item.on ?? []).map(toKata), ...(item.kun ?? [])].join('、')}) </span> : romaji ? `(${item.romaji}) ` : ''}
                {item.gloss}
                {item.kanji && <> · <span lang="ja">{item.kanji}</span></>}
              </small>
              {!result && hintFor(item) && <small className="memo-hint">Remember: {hintFor(item)}</small>}
            </>
          )}
        </div>
        {result !== null && audio && item.kind !== 'kanji' && <SpeakButton text={item.jp} />}
      </div>
      {result !== null && (
        // a held Enter would auto-repeat onto this button and skip the next exercise
        <button className="primary" autoFocus onKeyDown={(e) => e.repeat && e.preventDefault()} onClick={onContinue}>Continue</button>
      )}
    </div>
  )
}
