import type React from 'react'
import { Logo } from '../icons'

const SOURCES: [name: string, url: string, what: string, licence: string][] = [
  ['JLPT lists by Jonathan Waller', 'http://www.tanos.co.uk/jlpt/', 'N5–N3 words and kanji levels', 'CC BY'],
  ['open-anki-jlpt-decks', 'https://github.com/jamsinclair/open-anki-jlpt-decks', 'the word lists in CSV form', 'MIT'],
  ['KANJIDIC2 (EDRDG)', 'https://www.edrdg.org/wiki/index.php/KANJIDIC_Project', 'kanji meanings and readings', 'CC BY-SA 4.0'],
  ['kanji-data', 'https://github.com/davidluzgouveia/kanji-data', 'KANJIDIC and the levels in JSON form', 'MIT'],
  ['KanjiVG by Ulrich Apel', 'https://kanjivg.tagaini.net', 'kanji stroke order and parts', 'CC BY-SA 3.0'],
  ['wordfreq', 'https://github.com/rspeer/wordfreq', 'used to order words most frequent first', 'CC BY-SA 4.0'],
]

const REPO = 'https://github.com/Prodyte/nihongo'

const External = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
)

/** About the app: what it is, its source on GitHub, and where the course data comes from. */
export function About() {
  return (
    <>
      <div className="card form about">
        <div className="about-head">
          <Logo size={48} />
          <div>
            <h2>Nihongo <small lang="ja">日本語</small></h2>
            <p className="hint left">Learn Japanese from kana to JLPT N3</p>
          </div>
        </div>
        <p>A free, open-source app with lessons, spaced-repetition reviews, kanji stroke order, reading and speaking practice. It works offline, and your progress stays on your device unless you sign in to sync it.</p>
        <ul className="decks links">
          <li><External href={REPO}>Source code on GitHub</External><small>Prodyte/nihongo · see how it works, or suggest a change</small></li>
          <li><External href={`${REPO}/issues`}>Report a problem or ask for a feature</External><small>GitHub issues</small></li>
        </ul>
      </div>
      <div className="card form">
        <h2>Credits</h2>
        <p>The kana lessons, starter words, grammar lessons and app are written for this app. The JLPT course is built from open data:</p>
        <ul className="decks links">
          {SOURCES.map(([name, url, what, licence]) => (
            <li key={url}>
              <External href={url}>{name}</External>
              <small>{what} · {licence}</small>
            </li>
          ))}
        </ul>
        <p><small>The generated kanji data is shared under CC BY-SA 4.0, the stroke data under CC BY-SA 3.0, and the word data under CC BY, like their sources. The JLPT publishes no official vocabulary or kanji lists; these are the widely used community lists. Changes: entries were cleaned and shortened, and words are reordered by frequency.</small></p>
      </div>
    </>
  )
}
