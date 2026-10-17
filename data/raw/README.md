# Raw course data

`scripts/build_course_data.py` turns these files into `src/data/jlpt/{words,kanji}.json` (cleaned, ordered most frequent
first). Edit the rules or `OVERRIDES` in the script, not the generated JSON.

| File | Source | Licence |
|---|---|---|
| `jlpt-n5.csv`, `jlpt-n4.csv`, `jlpt-n3.csv`, `jlpt-n2.csv` | [jamsinclair/open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks) (`src/`), from Jonathan Waller's JLPT lists at [tanos.co.uk](http://www.tanos.co.uk/jlpt/) | Repository MIT; lists by Jonathan Waller, CC BY |
| `kanji-n5-n2.json` | The N5–N2 subset of [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) `kanji.json` (fields trimmed) | Repository MIT; meanings and readings from [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) by the EDRDG, CC BY-SA 4.0; levels from Jonathan Waller, CC BY |

Stroke order: `scripts/build_strokes.py` reads a [KanjiVG](https://kanjivg.tagaini.net) release zip (r20260714,
`kanjivg-20260714-main.zip` from https://github.com/KanjiVG/kanjivg/releases/download/r20260714/kanjivg-20260714-main.zip,
SHA-256 `b5df6cd2bc249dd49b8041eb99e38ba9f8dc6b9ea57962a80084b4a315d1a7fc`; by Ulrich Apel, CC BY-SA 3.0; not committed) and writes `public/strokes.json`: the
stroke paths, in drawing order, of each course kanji and of every hiragana and katakana in `src/data/kana.ts` (basic,
voiced, the small ゃゅょ of combined sounds and the small vowels of loanword sounds; a combined sound is two of these and has no
entry of its own). A kana missing from KanjiVG is skipped with a note, except the basic 46 in each script. That file is shared under
CC BY-SA 3.0.

Pitch accent: `scripts/build_accents.py` reads `accents.txt` from [Kanjium](https://github.com/mifunetoshiro/kanjium)
(`data/source_files/raw/accents.txt` at commit `9ebca4589565c696e7c39e089e2e928ad65f678c`, SHA-256
`8bd0dd127dab32ceec94cb03ab1ba6b68858ea73421dfa1731af2f373deb4f20`; by Uros O., CC BY-SA 4.0; not committed) and writes
`public/accents.json`: each course word's downstep position(s). That file is shared under CC BY-SA 4.0.

The build script also reads word frequencies from [wordfreq](https://github.com/rspeer/wordfreq) (data CC BY-SA 4.0) to
order words. Only the order is used; no wordfreq data is shipped.

The JLPT publishes no official word or kanji lists. These lists are the community standard, not the official exam syllabus.

**Licence of the generated files:** `src/data/jlpt/kanji.json` is derived from KANJIDIC2 and is therefore released under
CC BY-SA 4.0. `src/data/jlpt/words.json` is derived from Jonathan Waller's lists (CC BY).
