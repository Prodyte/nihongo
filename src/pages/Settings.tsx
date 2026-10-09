import { useState } from 'react'
import type { Db } from '../db/db'
import { applyTheme, GOALS, readBool, readGoal, readStr, THEMES, writeBool, writeInt, writeStr, type Theme } from '../settings'
import { Backup } from './Backup'

export function Settings({ db, autoplay, onAutoplay }: { db: Db; autoplay: boolean; onAutoplay: (v: boolean) => void }) {
  const [goal, setGoal] = useState(readGoal)
  const [skipAhead, setSkipAhead] = useState(() => readBool('nihongo.skipAhead', false))
  const [theme, setTheme] = useState<Theme>(() => readStr('nihongo.theme', THEMES, 'system'))

  return (
    <>
      <div className="card form">
        <h2>Settings</h2>
        <label>
          Daily goal
          <select value={goal} onChange={(e) => { const v = Number(e.target.value); setGoal(v); writeInt('nihongo.goal', v) }}>
            {GOALS.map((x) => <option key={x} value={x}>{x} XP a day</option>)}
          </select>
        </label>
        <label>
          Theme
          <select value={theme} onChange={(e) => { const t = e.target.value as Theme; setTheme(t); writeStr('nihongo.theme', t); applyTheme(t) }}>
            <option value="system">Match my device</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={autoplay} onChange={(e) => onAutoplay(e.target.checked)} />
          Play audio automatically
        </label>
        <label className="check">
          <input type="checkbox" checked={skipAhead} onChange={(e) => { setSkipAhead(e.target.checked); writeBool('nihongo.skipAhead', e.target.checked) }} />
          Let me choose any lesson on the path
        </label>
      </div>
      <Backup db={db} onRestored={() => {}} />
    </>
  )
}
