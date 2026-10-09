const SOURCES: [name: string, url: string, what: string, licence: string][] = [
  ['JLPT lists by Jonathan Waller', 'http://www.tanos.co.uk/jlpt/', 'N5–N3 words and kanji levels', 'CC BY'],
  ['open-anki-jlpt-decks', 'https://github.com/jamsinclair/open-anki-jlpt-decks', 'the word lists in CSV form', 'MIT'],
  ['KANJIDIC2 (EDRDG)', 'https://www.edrdg.org/wiki/index.php/KANJIDIC_Project', 'kanji meanings and readings', 'CC BY-SA 4.0'],
  ['kanji-data', 'https://github.com/davidluzgouveia/kanji-data', 'KANJIDIC and the levels in JSON form', 'MIT'],
  ['wordfreq', 'https://github.com/rspeer/wordfreq', 'used to order words most frequent first', 'CC BY-SA 4.0'],
]

export function Credits() {
  return (
    <div className="card form">
      <h2>Credits</h2>
      <p>The kana lessons, starter words, grammar lessons and app are written for this app. The JLPT course is built from open data:</p>
      <ul className="decks links">
        {SOURCES.map(([name, url, what, licence]) => (
          <li key={url}>
            <a href={url} target="_blank" rel="noopener noreferrer">{name}<span aria-hidden="true"> ↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
            <small>{what} · {licence}</small>
          </li>
        ))}
      </ul>
      <p><small>The generated kanji data is shared under CC BY-SA 4.0 and the word data under CC BY, like their sources. The JLPT publishes no official vocabulary or kanji lists; these are the widely used community lists. Changes: entries were cleaned and shortened, and words are reordered by frequency.</small></p>
    </div>
  )
}
