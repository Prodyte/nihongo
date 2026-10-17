# Nihongo

Learn Japanese in the browser, from hiragana to JLPT N2: a guided path through kana, 5,000 words, 979 kanji and N5 to N2 grammar, spaced-repetition review, and import for Anki decks (with their audio and images). Everything runs on your device and your progress is stored in your browser; an optional account syncs it across devices.

**Live:** https://prodyte.github.io/nihongo/ (installable as an app, works offline after the first visit; installed, its icon shows how many reviews are due)

## What it does

- **Welcome:** first-time setup: your level (from scratch, or a short test to skip kana or the basics).
- **Today:** one screen with the next step: due reviews first, then the next lesson; your streak, and progress on the level you're learning.
- **Learning path:** about 1,150 short lessons in sections: kana (hiragana and katakana together: one card per sound, あ with ア, asked in both scripts), first words and sentences, then **JLPT N5, N4, N3 and N2**. Each level mixes word lessons (6 words, most common first), kanji lessons (5 kanji) and, at N5, grammar lessons, each placed after the words it uses. Lessons practise with multiple choice (both directions), matching, listening (needs a Japanese voice on your device) and typing; wrong answers come back once. A daily streak; lessons unlock in order, or choose any in Settings.
- **Kanji:** stroke-order animation, meanings, on and kun readings, and course words that use each kanji; questions on meaning and on reading words written with it.
- **Pitch accent:** each word's accent drawn over its kana (a line over high morae, a mark where the pitch drops), on new words and in Lookup; about 97% of words have data.
- **Furigana:** readings over kanji you haven't had a lesson for yet (or always, or never: Settings).
- **Typing:** type the romaji for a kana; type the English for a word; or type the Japanese for an English word and watch the kana appear as you go (`mizu` becomes みず), like a Japanese keyboard. Romaji next to Japanese (on new words, answers, Lookup) goes away once the kana section is done, since it becomes a crutch; Settings can keep it always or never. A right answer passes the moment it is typed, no Check needed (an English answer that could still go on, like "hello" of "hello, good afternoon", waits for Check). One wrong letter in a longer English answer is forgiven; Japanese must be exact, so the particle は is typed `ha`, as on a Japanese keyboard. If you already have a Japanese keyboard enabled, typing kana directly works too.
- **Grammar:** 4 starter lessons (は/です, の/も, を/ます, い-adjectives) and 24 N5 lessons: これ/それ/あれ, あります/います, negatives and past tense, な-adjectives, に/へ/で/と/や/から/まで, question words, counters, が with 好き/上手/分かる, 欲しい, たい, ましょう, て-form (ください, ている, てもいい, てはいけません, sequences), comparisons, 前に/後で, から/が, でしょう, もう/まだ; then 32 N4 lessons (plain form, 〜たことがある, potential, conditionals, giving and receiving, passive, causative, honorifics and more) and 32 N3 lessons (〜ばかり, 〜ために, 〜によると, 〜べき, 〜わけ, causative-passive and more). Each opens with a short explanation, then you translate, fill the gap, build sentences from a word bank, listen, and type them. Sentences become Review cards.
- **Speaking:** say words and sentences aloud; the browser's Japanese speech recognition checks them (Chrome, Safari incl. iPad). "Can't speak now" skips speaking for a lesson; a Settings switch turns it off. The browser sends the recording to its speech service.
- **Writing:** trace kana and kanji over a guide and write them from memory with a finger, pencil or mouse, checked stroke by stroke for order, direction and shape. In kana lessons (hiragana) and kanji lessons, from the kana chart (both scripts) and from Lookup ("Practise writing"). A Settings switch turns writing exercises off.
- **Skip ahead:** a locked unit has "Test out": 15 questions over every lesson up to it; 80% marks them done, and what you missed starts as due.
- **Lookup:** search every word and kanji by kanji, kana, romaji or English; see readings, pitch accent, stroke order, your learning state and a Jisho link. "Study this" puts a word or kanji into Review before its lesson, and saved words are listed when the search box is empty. **Kanji by parts:** pick components (亻, 木, …) to find the kanji built from them.
- **Mock JLPT test (Review tab):** 30 timed questions over a whole level (N5 to N2): vocabulary, kanji, grammar and, with a Japanese voice, listening; a score per section, 60% to pass, your best score kept. It never touches your schedule.
- **Stats:** JLPT progress per level (words, kanji, grammar); cards by stage (Apprentice, Guru, Master, Burned, from how long you're expected to remember them); a 7-day forecast; an activity heatmap; leeches.
- **Path and Review work together:** finishing a lesson puts its items into the same spaced-repetition scheduler that Review uses, so what you learn on the path comes back when it is due. Replaying a lesson for practice never inflates the schedule.
- **Review:** all due cards across decks by default: the path's kana, words, kanji and sentences, and imported decks. Flashcards, type-the-answer (romaji for kana, the meaning for words), and multiple choice; a word is asked in context, its example sentence (the word marked) on the front, with the sentence's English and audio coming with the answer; grammar cards are always fill-the-gap sentences. "Practise mistakes" drills this week's misses and leeches without touching their schedule.
- **Practice hub (Review tab):** speaking drills (read aloud, say it from the English, shadowing), listening (type the word you hear, pick what a sentence means), verb conjugation (ます, ません, ました, て, た, ない), graded reading, and a kana chart. Drills use only what you've learned, and practising keeps the streak going.
- **Reading:** short N5, N4 and N3 stories with furigana, audio sentence by sentence or all at once, tap any word to look it up (and "Study this" to save it to Review), and comprehension questions.
- **Listening comprehension (Review tab):** JLPT-style: 12 two-person dialogues (shop, station, phone, office, clinic, plans) and the stories, heard with the text hidden, then questions; slow playback, and the transcript with A/B speakers afterwards. The two speakers get different voices (or pitches). Needs a Japanese voice.
- **Grammar reference:** every grammar point with its explanation and sentences (More → Grammar).
- **Sounds:** short right/wrong/complete sounds and a vibration on wrong answers (Settings switch).
- **Scheduling:** [FSRS](https://github.com/open-spaced-repetition/ts-fsrs), the algorithm modern Anki uses. 20 new cards a day.
- **Sound:** kana are spoken with your device's Japanese voice (if it has one). Imported decks play their own audio automatically, like Anki; a setting turns that off.
- **Anki import:** `.apkg` files in the latest and the older Anki formats, including cloze cards, furigana, images and audio. Imported decks study as flashcards.
- **Sync (optional):** sign in with email and password (Settings) to keep progress in step across devices, through Supabase. Without an account nothing leaves the device.
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

## Credits and licences (also on the About page)

- JLPT word lists and kanji levels: Jonathan Waller ([tanos.co.uk](http://www.tanos.co.uk/jlpt/)), CC BY, via [open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks).
- Kanji meanings and readings: [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) (EDRDG), CC BY-SA 4.0, via [kanji-data](https://github.com/davidluzgouveia/kanji-data). `src/data/jlpt/kanji.json` is shared under CC BY-SA 4.0.
- Stroke order (kanji and kana) and kanji parts: [KanjiVG](https://kanjivg.tagaini.net) by Ulrich Apel, CC BY-SA 3.0. `public/strokes.json` and `src/data/jlpt/parts.json` (built by `scripts/build_strokes.py` and `scripts/build_parts.py`) are shared under CC BY-SA 3.0.
- Pitch accent: [Kanjium](https://github.com/mifunetoshiro/kanjium) by Uros O., CC BY-SA 4.0. `public/accents.json` (built by `scripts/build_accents.py`) is shared under CC BY-SA 4.0.
- Example sentences: [Tatoeba](https://tatoeba.org), CC BY 2.0 FR. `public/examples.json` (built by `scripts/build_examples.py`) keeps each sentence's Tatoeba id.
- Word order uses frequencies from [wordfreq](https://github.com/rspeer/wordfreq) (build time only).

Pushes to `main` run lint, tests and build, then deploy to GitHub Pages (`.github/workflows/deploy.yml`).

## Layout

| Path | What |
|---|---|
| `src/data/kana.ts` | the kana tables (katakana derived from hiragana) |
| `src/path/` | course structure, starter vocabulary and grammar, exercise engine, typing (romaji to kana, answer checking), lookup, progress/streak, exercise components |
| `src/data/jlpt/`, `public/strokes.json` | generated JLPT words, kanji and stroke data (see `data/raw/README.md`) |
| `src/srs/` | scheduler wrapper around ts-fsrs |
| `src/db/` | IndexedDB layer, backup and restore |
| `src/anki/` | `.apkg` parsing, template rendering, media and sanitizing |
| `src/modes/`, `src/pages/` | study modes and screens |
