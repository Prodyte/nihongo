import { useEffect, useState } from 'react'
import { State } from 'ts-fsrs'
import { speak } from '../audio'
import { toKata } from '../data/kana'
import type { Db } from '../db/db'
import { ExitButton } from '../icons'
import { kanaToRomaji } from '../path/romaji'

// The gojūon table: rows of five, with gaps where a sound doesn't exist (yi, ye, wu...).
const BASE = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'や_ゆ_よ', 'らりるれろ', 'わ___を', 'ん____']
const VOICED = ['がぎぐげご', 'ざじずぜぞ', 'だぢづでど', 'ばびぶべぼ', 'ぱぴぷぺぽ']
const COMBO = ['きゃきゅきょ', 'しゃしゅしょ', 'ちゃちゅちょ', 'にゃにゅにょ', 'ひゃひゅひょ', 'みゃみゅみょ', 'りゃりゅりょ', 'ぎゃぎゅぎょ', 'じゃじゅじょ', 'びゃびゅびょ', 'ぴゃぴゅぴょ']
const cells = (row: string) => row.match(/_|.[ゃゅょ]?/gu)!

/** Every hiragana or katakana: tap one to hear it. Ones you've learned are marked. */
export function KanaChart({ db, onExit }: { db: Db; onExit: () => void }) {
  const [script, setScript] = useState<'hira' | 'kata'>('hira')
  const [known, setKnown] = useState<Set<string>>(new Set())
  useEffect(() => {
    void db.getAll('cards').then((cs) => setKnown(new Set(cs.filter((c) => (c.deck === 'hira' || c.deck === 'kata') && c.fsrs.state !== State.New).map((c) => c.front))), () => {})
  }, [db])
  const conv = (k: string) => (script === 'hira' ? k : toKata(k))
  const table = (rows: string[], cols: number, label: string) => (
    <section className="kana-block" aria-label={label}>
      <h3 className="section-title">{label}</h3>
      <div className="kana-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {rows.flatMap((r) => cells(r)).map((k, i) =>
          k === '_' ? <span key={i} /> : (
            <button key={i} className={`kana-cell${known.has(conv(k)) ? ' known' : ''}`} onClick={() => speak(conv(k))} aria-label={`${conv(k)} ${kanaToRomaji(k)}${known.has(conv(k)) ? ', learned' : ''}`}>
              <span lang="ja">{conv(k)}</span><small>{kanaToRomaji(k)}</small>
            </button>
          ))}
      </div>
    </section>
  )
  return (
    <>
      <div className="bar"><ExitButton onClick={onExit} /></div>
      <div className="page-head">
        <h2>Kana chart</h2>
        <p>Tap a character to hear it. Green ones you’ve learned.</p>
      </div>
      <div className="segmented" role="tablist" aria-label="Script">
        {(['hira', 'kata'] as const).map((s) => (
          <button key={s} role="tab" aria-selected={script === s} onClick={() => setScript(s)}>{s === 'hira' ? 'Hiragana ひらがな' : 'Katakana カタカナ'}</button>
        ))}
      </div>
      <div className="card">
        {table(BASE, 5, 'Basic sounds')}
        {table(VOICED, 5, 'Voiced sounds')}
        {table(COMBO, 3, 'Combined sounds')}
      </div>
    </>
  )
}
