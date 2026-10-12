import { useEffect, useId, useState, type FormEvent } from 'react'
import { speak } from '../../audio'
import { SpeakButton } from '../../modes/SpeakButton'
import { matches } from '../../data/kana'
import { glossAnswers } from '../progress'
import { displayJp, readingOf } from '../romaji'
import { checkEnglish, checkJapanese, mayGrow, toKana, type Check } from '../typing'
import type { Exercise } from '../lesson'
import { Feedback } from './Feedback'
import { Ruby } from './Ruby'
import { fit } from './furigana'

type Ex = Extract<Exercise, { type: 'type' }>

const QUESTION = { toRomaji: 'Type the romaji', toGloss: 'Type the English meaning', toJp: 'Type it in Japanese (in romaji)', toReading: 'How is it read? Type it in romaji', dictation: 'Type what you hear (in romaji)', conjugate: 'Conjugate it (type in romaji)' }
const SENTENCE_QUESTION = 'Type the sentence in Japanese (use romaji; particles as written: は = ha, を = wo)'

/** Typing: kana -> romaji, word -> English, English -> Japanese with the kana appearing live as you type. */
export function Type({ ex, autoplay, onDone }: { ex: Ex; autoplay: boolean; onDone: (missed: string[]) => void }) {
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<Check | null>(null)
  const id = useId()
  const { item, dir } = ex
  const japanese = dir === 'toJp' || dir === 'toReading' || dir === 'dictation' || dir === 'conjugate'
  const preview = japanese ? toKana(typed, false) : null
  const answer = japanese ? item.jp : item.gloss // the detail line under it adds the reading and the meaning

  useEffect(() => {
    if (dir === 'dictation') speak(item.jp) // dictation: the sound is the question
  }, [dir, item.jp])
  useEffect(() => {
    if (result && autoplay && item.kind === 'word' && dir !== 'dictation') speak(item.jp) // after answering, hear the word
  }, [result, autoplay, item.kind, item.jp, dir])

  const grade = (t: string): Check =>
    dir === 'toRomaji' ? { ok: matches(item.accepts ?? [item.romaji], t) }
    : dir === 'toGloss' ? checkEnglish(t, glossAnswers(item.gloss))
    : item.kind === 'sentence' && dir === 'toJp' ? checkJapanese(t, item.jp, { tokens: item.tokens?.map(readingOf), alts: item.alts?.map((a) => displayJp(a.map(readingOf))) })
    : checkJapanese(t, item.jp, { word: true })

  function check(e: FormEvent) {
    e.preventDefault()
    if (result || !typed.trim()) return
    setResult(grade(typed))
  }
  // a right answer passes as soon as it is typed; English waits for Check when it could be half of what is meant
  // (a forgiven typo, or "hello" of "hello, good afternoon": the next space would press Continue)
  function change(t: string) {
    setTyped(t)
    const r = grade(t)
    if (r.ok && !(dir === 'toGloss' && (r.note || mayGrow(t, glossAnswers(item.gloss))))) setResult(r)
  }

  return (
    <form className="card" onSubmit={check}>
      <label htmlFor={id} className="q">{item.kind === 'sentence' ? SENTENCE_QUESTION : QUESTION[dir]}</label>
      {dir === 'dictation' ? <SpeakButton text={item.jp} />
        : dir === 'conjugate' ? <><div className="prompt kana" lang="ja" style={fit(ex.prompt, ex.promptReading)}><Ruby text={ex.prompt} reading={ex.promptReading !== ex.prompt ? ex.promptReading : undefined} /></div><p className="form-label">→ {ex.label}</p></>
        : dir === 'toJp' ? <div className="prompt gloss">{ex.prompt}</div>
        : <div className="prompt kana" lang="ja" style={fit(ex.prompt, item.jp)}>{dir === 'toReading' ? ex.prompt /* no furigana: the reading is the question */ : <Ruby text={ex.prompt} reading={item.written && item.jp} />}</div>}
      <input id={id} autoFocus autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false} enterKeyHint="done"
        lang={dir === 'toGloss' ? 'en' : undefined} readOnly={result !== null} value={typed} aria-describedby={preview ? `${id}-kana` : undefined}
        onKeyDown={(e) => e.key === 'Enter' && e.repeat && e.preventDefault()} onChange={(e) => change(e.target.value)} />
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
