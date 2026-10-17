import { Fragment, useEffect, useState } from 'react'
import { State } from 'ts-fsrs'
import { speak } from '../audio'
import { toKata } from '../data/kana'
import type { Db } from '../db/db'
import { ExitButton } from '../icons'
import { kanaToRomaji } from '../path/romaji'
import { WritePractice } from '../path/ui/WritePractice'

// The gojūon table: rows of five, with gaps where a sound doesn't exist (yi, ye, wu...).
const BASE = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'や_ゆ_よ', 'らりるれろ', 'わ___を', 'ん____']
const VOICED = ['がぎぐげご', 'ざじずぜぞ', 'だぢづでど', 'ばびぶべぼ', 'ぱぴぷぺぽ']
const COMBO = ['きゃきゅきょ', 'しゃしゅしょ', 'ちゃちゅちょ', 'にゃにゅにょ', 'ひゃひゅひょ', 'みゃみゅみょ', 'りゃりゅりょ', 'ぎゃぎゅぎょ', 'じゃじゅじょ', 'びゃびゅびょ', 'ぴゃぴゅぴょ']
const cells = (row: string) => row.match(/_|.[ゃゅょ]?/gu)!

/** Every hiragana or katakana: tap one to hear it and see how it is written (a combined sound: only hear it). Ones you've learned are marked. */
export function KanaChart({ db, onExit }: { db: Db; onExit: () => void }) {
  const [script, setScript] = useState<'hira' | 'kata'>('hira')
  const [known, setKnown] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<string | null>(null) // the hiragana whose writing panel shows, under its row
  useEffect(() => {
    void db.getAll('cards').then((cs) => setKnown(new Set(cs.filter((c) => c.deck === 'kana' && c.fsrs.state !== State.New).map((c) => c.front))), () => {})
  }, [db])
  const conv = (k: string) => (script === 'hira' ? k : toKata(k))
  const table = (rows: string[], cols: number, label: string) => (
    <section className="kana-block" aria-label={label}>
      <h3 className="section-title">{label}</h3>
      <div className="kana-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {rows.map((r) => (
          <Fragment key={r}>
            {cells(r).map((k, i) =>
              k === '_' ? <span key={i} /> : (
                <button key={i} className={`kana-cell${known.has(k) ? ' known' : ''}`} aria-expanded={k.length === 1 ? open === k : undefined}
                  onClick={() => { speak(conv(k)); if (k.length === 1) setOpen(open === k ? null : k) }} aria-label={`${conv(k)} ${kanaToRomaji(k)}${known.has(k) ? ', learned' : ''}`}>
                  <span lang="ja">{conv(k)}</span><small>{kanaToRomaji(k)}</small>
                </button>
              ))}
            {open && cells(r).includes(open) && <div className="detail" style={{ gridColumn: '1 / -1' }}><WritePractice key={conv(open)} char={conv(open)} /></div>}
          </Fragment>
        ))}
      </div>
    </section>
  )
  return (
    <>
      <div className="bar"><ExitButton onClick={onExit} /></div>
      <div className="page-head">
        <h2>Kana chart</h2>
        <p>Tap a character to hear it and practise writing it. Green ones you’ve learned.</p>
      </div>
      <div className="segmented" role="tablist" aria-label="Script">
        {(['hira', 'kata'] as const).map((s) => (
          <button key={s} role="tab" aria-selected={script === s} onClick={() => setScript(s)}>{s === 'hira' ? 'Hiragana' : 'Katakana'} <small lang="ja">{s === 'hira' ? 'ひらがな' : 'カタカナ'}</small></button>
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
