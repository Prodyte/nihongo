import { useEffect, useId, useState, type FormEvent } from 'react'
import { speak } from '../../audio'
import { matches } from '../../data/kana'
import { glossAnswers } from '../progress'
import { checkEnglish, checkJapanese, toKana, type Check } from '../typing'
import type { Exercise } from '../lesson'
import { Feedback } from './Feedback'

type Ex = Extract<Exercise, { type: 'type' }>

const QUESTION = { toRomaji: 'Type the romaji', toGloss: 'Type the English meaning', toJp: 'Type it in Japanese (use romaji, e.g. mizu)' }

/** Typing: kana -> romaji, word -> English, English -> Japanese with the kana appearing live as you type. */
export function Type({ ex, autoplay, onDone }: { ex: Ex; autoplay: boolean; onDone: (missed: string[]) => void }) {
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<Check | null>(null)
  const id = useId()
  const { item, dir } = ex
  const preview = dir === 'toJp' ? toKana(typed, false) : null
  const answer = dir === 'toRomaji' ? item.gloss : dir === 'toGloss' ? item.gloss : `${item.jp} (${item.romaji})`

  useEffect(() => {
    if (result && autoplay && item.kind === 'word') speak(item.jp) // after answering, hear the word
  }, [result, autoplay, item.kind, item.jp])

  function check(e: FormEvent) {
    e.preventDefault()
    if (result || !typed.trim()) return
    setResult(
      dir === 'toRomaji' ? { ok: matches(item.accepts ?? [item.romaji], typed) }
      : dir === 'toGloss' ? checkEnglish(typed, glossAnswers(item.gloss))
      : checkJapanese(typed, item.jp, { word: true }),
    )
  }

  return (
    <form className="card" onSubmit={check}>
      <label htmlFor={id} className="q">{QUESTION[dir]}</label>
      {dir === 'toJp' ? <div className="prompt gloss">{ex.prompt}</div> : <div className="prompt kana" lang="ja">{ex.prompt}</div>}
      <input id={id} autoFocus autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false} enterKeyHint="done"
        lang={dir === 'toGloss' ? 'en' : undefined} readOnly={result !== null} value={typed} aria-describedby={preview ? `${id}-kana` : undefined}
        onKeyDown={(e) => e.key === 'Enter' && e.repeat && e.preventDefault()} onChange={(e) => setTyped(e.target.value)} />
      {preview && <div id={`${id}-kana`} className="preview" lang="ja">{preview.kana}<span className="pending">{preview.pending}</span>{' '}</div>}
      {result === null && (
        <div className="row2">
          <button className="primary" type="submit" disabled={!typed.trim()}>Check</button>
          <button type="button" onClick={() => setResult({ ok: false })}>I don’t know</button>
        </div>
      )}
      <Feedback result={result && result.ok} item={item} answer={answer} note={result?.note} onContinue={() => onDone(result?.ok ? [] : [item.id])} />
    </form>
  )
}
