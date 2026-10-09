import { useState } from 'react'
import { Icon, Logo, type IconName } from '../icons'

export type StartLevel = 'new' | 'kana' | 'basics'
const LEVELS: [StartLevel, string, string][] = [
  ['new', 'I’m new to Japanese', 'Start with hiragana, the first alphabet.'],
  ['kana', 'I can read hiragana and katakana', 'Take a short test and skip ahead to words.'],
  ['basics', 'I know some basic words and grammar', 'Take a short test and skip to JLPT N5.'],
]
const FEATURES: [IconName, string, string][] = [
  ['path', 'A path from zero to JLPT N3', 'Kana, 3,400 words, 600 kanji and grammar, in short lessons.'],
  ['review', 'Reviews that stick', 'Spaced repetition brings each word back just before you’d forget it.'],
  ['mic', 'Speak, listen, read and write', 'Practise out loud, read short stories, and write kanji by hand.'],
]

/** First run: what the app is, where you're starting from, and . */
export function Welcome({ onDone }: { onDone: (level: StartLevel) => void }) {
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState<StartLevel>('new')
  return (
    <div className="welcome">
      <div className="dots" aria-hidden="true">{[0, 1].map((i) => <span key={i} className={i === step ? 'on' : ''} />)}</div>
      {step === 0 && (
        <section className="welcome-step">
          <Logo size={72} />
          <h2>Learn Japanese,<br />one small step a day</h2>
          <ul className="features">
            {FEATURES.map(([icon, title, text]) => (
              <li key={title}><span className="tile-icon"><Icon name={icon} /></span><div><strong>{title}</strong><small>{text}</small></div></li>
            ))}
          </ul>
          <button className="primary big" autoFocus onClick={() => setStep(1)}>Get started</button>
          <p className="hint">Free, no account. Your progress stays on this device.</p>
        </section>
      )}
      {step === 1 && (
        <section className="welcome-step">
          <h2>How much Japanese do you know?</h2>
          <div className="choices" role="radiogroup" aria-label="Your level">
            {LEVELS.map(([v, title, text]) => (
              <button key={v} role="radio" aria-checked={level === v} className={level === v ? 'choice on' : 'choice'} onClick={() => setLevel(v)}>
                <strong>{title}</strong><small>{text}</small>
              </button>
            ))}
          </div>
          <button className="primary big" onClick={() => onDone(level)}>{level === 'new' ? 'Start learning' : 'Start the test'}</button>
        </section>
      )}
    </div>
  )
}
