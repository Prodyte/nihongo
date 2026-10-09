# Raw course data

`scripts/build_course_data.py` turns these files into `src/data/jlpt/{words,kanji}.json` (cleaned, ordered most frequent
first). Edit the rules or `OVERRIDES` in the script, not the generated JSON.

| File | Source | Licence |
|---|---|---|
| `jlpt-n5.csv`, `jlpt-n4.csv`, `jlpt-n3.csv` | [jamsinclair/open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks) (`src/`), from Jonathan Waller's JLPT lists at [tanos.co.uk](http://www.tanos.co.uk/jlpt/) | Repository MIT; lists by Jonathan Waller, CC BY |
| `kanji-n5-n3.json` | The N5–N3 subset of [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) `kanji.json` (fields trimmed) | Repository MIT; meanings and readings from [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) by the EDRDG, CC BY-SA 4.0; levels from Jonathan Waller, CC BY |

Stroke order: `scripts/build_strokes.py` reads a [KanjiVG](https://kanjivg.tagaini.net) release zip (r20260714,
`kanjivg-20260714-main.zip`, by Ulrich Apel, CC BY-SA 3.0; not committed) and writes `public/strokes.json`: each
course kanji's stroke paths in drawing order. That file is shared under CC BY-SA 3.0.

The build script also reads word frequencies from [wordfreq](https://github.com/rspeer/wordfreq) (data CC BY-SA 4.0) to
order words. Only the order is used; no wordfreq data is shipped.

The JLPT publishes no official word or kanji lists. These lists are the community standard, not the official exam syllabus.

**Licence of the generated files:** `src/data/jlpt/kanji.json` is derived from KANJIDIC2 and is therefore released under
CC BY-SA 4.0. `src/data/jlpt/words.json` is derived from Jonathan Waller's lists (CC BY).
