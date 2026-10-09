import { useState } from 'react'
import type { Db } from '../db/db'
import { applyTheme, readBool, readSpeed, readStr, SPEEDS, THEMES, writeBool, writeInt, writeStr, type Theme } from '../settings'
import { FURIGANA, type Furigana } from '../path/ui/furigana'
import { canRecognise } from '../speech'
import { Backup } from './Backup'

export function Settings({ db, autoplay, onAutoplay, furigana, onFurigana }: { db: Db; autoplay: boolean; onAutoplay: (v: boolean) => void; furigana: Furigana; onFurigana: (f: Furigana) => void }) {
  const [skipAhead, setSkipAhead] = useState(() => readBool('nihongo.skipAhead', false))
  const [sounds, setSounds] = useState(() => readBool('nihongo.sfx', true))
  const [speed, setSpeed] = useState(readSpeed)
  const [speaking, setSpeaking] = useState(() => readBool('nihongo.speaking', true))
  const [writing, setWriting] = useState(() => readBool('nihongo.writing', true))
  const [theme, setTheme] = useState<Theme>(() => readStr('nihongo.theme', THEMES, 'system'))

  return (
    <>
      <div className="card form">
        <h2>Settings</h2>
        <label>
          Theme
          <select value={theme} onChange={(e) => { const t = e.target.value as Theme; setTheme(t); writeStr('nihongo.theme', t); applyTheme(t) }}>
            <option value="system">Match my device</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label>
          Furigana (readings over kanji)
          <select value={furigana} onChange={(e) => onFurigana(e.target.value as Furigana)}>
            {FURIGANA.map((f) => <option key={f} value={f}>{{ auto: 'Over kanji I haven’t learned yet', always: 'Always', never: 'Never' }[f]}</option>)}
          </select>
        </label>
        <label>
          Speech speed
          <select value={speed} onChange={(e) => { setSpeed(Number(e.target.value)); writeInt('nihongo.rate', Number(e.target.value)) }}>
            {SPEEDS.map((r) => <option key={r} value={r}>{{ 100: 'Normal', 80: 'A little slower', 60: 'Slow' }[r]}</option>)}
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={autoplay} onChange={(e) => onAutoplay(e.target.checked)} />
          Play audio automatically
        </label>
        <label className="check">
          <input type="checkbox" checked={sounds} onChange={(e) => { setSounds(e.target.checked); writeBool('nihongo.sfx', e.target.checked) }} />
          Sound effects and vibration
        </label>
        <label className="check">
          <input type="checkbox" checked={writing} onChange={(e) => { setWriting(e.target.checked); writeBool('nihongo.writing', e.target.checked) }} />
          Kanji writing exercises (finger, pencil or mouse)
        </label>
        {canRecognise() && (
          <label className="check">
            <input type="checkbox" checked={speaking} onChange={(e) => { setSpeaking(e.target.checked); writeBool('nihongo.speaking', e.target.checked) }} />
            <span>Speaking exercises <small className="hint">(your browser sends the recording to its speech service, e.g. Google or Apple)</small></span>
          </label>
        )}
        <label className="check">
          <input type="checkbox" checked={skipAhead} onChange={(e) => { setSkipAhead(e.target.checked); writeBool('nihongo.skipAhead', e.target.checked) }} />
          Let me choose any lesson on the path
        </label>
      </div>
      <Backup db={db} onRestored={() => {}} />
    </>
  )
}
