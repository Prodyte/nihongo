import { useEffect } from 'react'
import { speak } from '../../audio'
import { SpeakButton } from '../../modes/SpeakButton'
import { written, type Item } from '../course'
import { Mnemonic } from './Mnemonic'

export function Intro({ item, autoplay, onDone }: { item: Item; autoplay: boolean; onDone: (missed: string[]) => void }) {
  useEffect(() => {
    if (autoplay) speak(item.jp)
  }, [autoplay, item.jp])
  return (
    <div className="card">
      <p className="q">New {item.kind === 'kana' ? 'character' : 'word'}</p>
      <div className="kana" lang="ja">{written(item)}</div>
      {/* a new word always shows its reading, whatever the furigana setting */}
      {item.kind === 'word' && <div className="reading">{item.written && <><span lang="ja">{item.jp}</span> · </>}{item.romaji}{item.kanji && <> · <span lang="ja">{item.kanji}</span></>}</div>}
      <div className="answer">{item.gloss} <SpeakButton text={item.jp} /></div>
      <Mnemonic item={item} />
      <button className="primary" autoFocus onKeyDown={(e) => e.repeat && e.preventDefault()} onClick={() => onDone([])}>Got it</button>
    </div>
  )
}
