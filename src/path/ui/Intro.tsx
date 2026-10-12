import { useEffect } from 'react'
import { speak } from '../../audio'
import { SpeakButton } from '../../modes/SpeakButton'
import { written, type Item } from '../course'
import { Example } from './Example'
import { useRomaji } from './furigana'
import { Mnemonic } from './Mnemonic'

export function Intro({ item, autoplay, onDone }: { item: Item; autoplay: boolean; onDone: (missed: string[]) => void }) {
  const romaji = useRomaji()
  // a new word always shows its reading in kana, whatever the furigana setting; romaji only while the kana are new
  const reading = [item.written && <span key="reading" lang="ja">{item.jp}</span>, romaji && item.romaji, item.kanji && <span key="kanji" lang="ja">{item.kanji}</span>].filter(Boolean)
  useEffect(() => {
    if (autoplay) speak(item.jp)
  }, [autoplay, item.jp])
  return (
    <div className="card">
      <p className="q">New {item.kind === 'kana' ? 'sound' : 'word'}</p>
      {item.kata ? (
        // a kana sound is learned in both scripts at once
        <div className="kana kana-pair" lang="ja">
          <span>{item.jp}<small lang="en">hiragana</small></span>
          <span>{item.kata}<small lang="en">katakana</small></span>
        </div>
      ) : <div className="kana" lang="ja">{written(item)}</div>}
      {item.kind === 'word' && reading.length > 0 && <div className="reading">{reading.map((r, i) => <span key={i}>{i > 0 && ' · '}{r}</span>)}</div>}
      <div className="answer">{item.gloss} <SpeakButton text={item.jp} /></div>
      <Mnemonic item={item} />
      <Example item={item} />
      <button className="primary" autoFocus onKeyDown={(e) => e.repeat && e.preventDefault()} onClick={() => onDone([])}>Got it</button>
    </div>
  )
}
