# Nihongo

Learn Japanese in the browser, from hiragana to JLPT N3: a guided path through kana, 3,400 words, 612 kanji and N5 grammar, spaced-repetition review, and import for Anki decks (with their audio and images). Everything runs on your device. There is no account and no server, and your progress is stored in your browser.

**Live:** https://prodyte.github.io/nihongo/ (installable as an app, works offline after the first visit)

## What it does

- **Welcome:** first-time setup: your level (from scratch, or a short test to skip kana or the basics) and a daily goal.
- **Today:** one screen with the next step: due reviews first, then the next lesson; streak, daily goal, and progress on the level you're learning.
- **Learning path:** about 750 short lessons in sections: kana (hiragana, katakana), first words and sentences, then **JLPT N5, N4 and N3**. Each level mixes word lessons (6 words, most common first), kanji lessons (5 kanji) and, at N5, grammar lessons, each placed after the words it uses. Lessons practise with multiple choice (both directions), matching, listening (needs a Japanese voice on your device) and typing; wrong answers come back once. XP, a daily streak and a daily goal; lessons unlock in order, or choose any in Settings.
- **Kanji:** stroke-order animation, meanings, on and kun readings, and course words that use each kanji; questions on meaning and on reading words written with it.
- **Furigana:** readings over kanji you haven't had a lesson for yet (or always, or never: Settings).
- **Typing:** type the romaji for a kana; type the English for a word; or type the Japanese for an English word and watch the kana appear as you go (`mizu` becomes みず), like a Japanese keyboard. One wrong letter in a longer English answer is forgiven; Japanese must be exact, so the particle は is typed `ha`, as on a Japanese keyboard. If you already have a Japanese keyboard enabled, typing kana directly works too.
- **Grammar:** 4 starter lessons (は/です, の/も, を/ます, い-adjectives) and 24 N5 lessons: これ/それ/あれ, あります/います, negatives and past tense, な-adjectives, に/へ/で/と/や/から/まで, question words, counters, が with 好き/上手/分かる, 欲しい, たい, ましょう, て-form (ください, ている, てもいい, てはいけません, sequences), comparisons, 前に/後で, から/が, でしょう, もう/まだ. Each opens with a short explanation, then you translate, fill the gap, build sentences from a word bank, listen, and type them. Sentences become Review cards.
- **Speaking:** say words and sentences aloud; the browser's Japanese speech recognition checks them (Chrome, Safari incl. iPad). "Can't speak now" skips speaking for a lesson; a Settings switch turns it off. The browser sends the recording to its speech service.
- **Kanji writing:** trace kanji over a guide and write them from memory with a finger, pencil or mouse, checked stroke by stroke for order, direction and shape. In kanji lessons and from Lookup ("Practise writing").
- **Skip ahead:** a locked unit has "Test out": 15 questions over every lesson up to it; 80% marks them done (no XP), and what you missed starts as due.
- **Lookup:** search every word and kanji by kanji, kana, romaji or English; see readings, stroke order, your learning state and a Jisho link.
- **Stats:** JLPT progress per level (words, kanji, grammar); cards by stage (Apprentice, Guru, Master, Burned, from how long you're expected to remember them); a 7-day forecast; an activity heatmap; leeches.
- **Path and Review work together:** finishing a lesson puts its items into the same spaced-repetition scheduler that Review uses, so what you learn on the path comes back when it is due. Replaying a lesson for practice never inflates the schedule.
- **Review:** all due cards across decks by default: the path's kana, words, kanji and sentences, and imported decks. Flashcards, type-the-answer (romaji for kana, the meaning for words), and multiple choice; grammar cards are always fill-the-gap sentences. "Practise mistakes" drills this week's misses and leeches without touching their schedule.
- **Practice hub (Review tab):** speaking drills (read aloud, say it from the English, shadowing), listening (type the word you hear, pick what a sentence means), verb conjugation (ます, ません, ました, て, た, ない), graded reading, and a kana chart. Drills use only what you've learned; each right answer earns 1 XP.
- **Reading:** short N5 stories with furigana, audio sentence by sentence or all at once, tap any word to look it up, and comprehension questions.
- **Grammar reference:** every grammar point with its explanation and sentences (More → Grammar).
- **Sounds:** short right/wrong/complete sounds and a vibration on wrong answers (Settings switch).
- **Scheduling:** [FSRS](https://github.com/open-spaced-repetition/ts-fsrs), the algorithm modern Anki uses. 20 new cards a day.
- **Sound:** kana are spoken with your device's Japanese voice (if it has one). Imported decks play their own audio automatically, like Anki; a setting turns that off.
- **Anki import:** `.apkg` files in the latest and the older Anki formats, including cloze cards, furigana, images and audio. Imported decks study as flashcards.
- **Backup:** download your progress as JSON and restore it later. Imported decks' images and audio aren't in the backup; re-import the `.apkg`.
- **Accessible:** keyboard shortcuts (space to reveal, 1-4 to grade), screen-reader announcements, light and dark themes, checked with axe.

## Importing decks

Download a deck's `.apkg` and use **Decks → Import deck**. The app links to a few free decks with audio on the Decks page; they are their authors' work and aren't part of this repository, so check each deck's terms.

Imported HTML is untrusted: it is sanitized every time it is shown (scripts, styles, forms, remote images and links are removed). Decks that depend on their own scripts or CSS therefore look plainer than in Anki. Your scheduling history from Anki is not imported; every card starts as new.

## Development

```sh
npm install
npm run dev      # local dev server
npm test         # unit and integration tests (vitest)
npm run lint
npm run build    # type-check and build to dist/
```

To check the importer against a real deck: `REAL_APKG=/path/to/deck.apkg npm test -- real`.

The starter vocabulary (`src/path/vocab.ts`) and the grammar (`src/path/grammar.ts`, `src/path/grammarN5.ts`) are written for this app. Tests check every romaji against its kana, that every sentence word is a course word taught before its lesson, that furigana match the word readings, and that nothing is duplicated, but they can't judge a translation or an explanation, so corrections are welcome.

The JLPT words, kanji and stroke order come from open data, cleaned by `scripts/build_course_data.py` and `scripts/build_strokes.py`; sources, licences and how to rebuild are in `data/raw/README.md`. Lesson ids are snapshot-tested: saved progress refers to them, so a data change must not reshuffle existing lessons.

## Credits and licences

- JLPT word lists and kanji levels: Jonathan Waller ([tanos.co.uk](http://www.tanos.co.uk/jlpt/)), CC BY, via [open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks).
- Kanji meanings and readings: [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) (EDRDG), CC BY-SA 4.0, via [kanji-data](https://github.com/davidluzgouveia/kanji-data). `src/data/jlpt/kanji.json` is shared under CC BY-SA 4.0.
- Stroke order: [KanjiVG](https://kanjivg.tagaini.net) by Ulrich Apel, CC BY-SA 3.0. `public/strokes.json` is shared under CC BY-SA 3.0.
- Word order uses frequencies from [wordfreq](https://github.com/rspeer/wordfreq) (build time only).

Pushes to `main` run lint, tests and build, then deploy to GitHub Pages (`.github/workflows/deploy.yml`).

## Layout

| Path | What |
|---|---|
| `src/data/kana.ts` | the kana tables (katakana derived from hiragana) |
| `src/path/` | course structure, starter vocabulary and grammar, exercise engine, typing (romaji to kana, answer checking), lookup, progress/XP/streak, exercise components |
| `src/data/jlpt/`, `public/strokes.json` | generated JLPT words, kanji and stroke data (see `data/raw/README.md`) |
| `src/srs/` | scheduler wrapper around ts-fsrs |
| `src/db/` | IndexedDB layer, backup and restore |
| `src/anki/` | `.apkg` parsing, template rendering, media and sanitizing |
| `src/modes/`, `src/pages/` | study modes and screens |
