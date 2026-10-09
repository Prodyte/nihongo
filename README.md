# Nihongo

Learn Japanese in the browser: a guided path from hiragana and katakana to your first 144 words and phrases, spaced-repetition review, and import for Anki decks (with their audio and images). Everything runs on your device. There is no account and no server, and your progress is stored in your browser.

**Live:** https://prodyte.github.io/nihongo/ (installable as an app, works offline after the first visit)

## What it does

- **Learning path:** 64 short lessons in 14 units: hiragana (basic, voiced, combined sounds), katakana, then starter vocabulary (greetings, numbers, family, food, places, time, verbs, adjectives). Each lesson introduces a few items, then practises them with multiple choice (both directions), matching pairs, and listening (needs a Japanese voice on your device). Wrong answers come back once. You earn XP, keep a daily streak and work towards a daily goal. Lessons unlock in order; "Let me choose any lesson" lets you skip ahead.
- **Path and Review work together:** finishing a lesson puts its items into the same spaced-repetition scheduler that Review uses, so what you learn on the path comes back when it is due. Replaying a lesson for practice never inflates the schedule.
- **Review:** 104 hiragana and 104 katakana cards plus the words you have learned. Flashcards, type-the-answer, and multiple choice.
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

The starter vocabulary (`src/path/vocab.ts`) is written for this app. Tests check every romaji against its kana and that no two words share a spelling or meaning, but they can't judge a translation, so corrections are welcome.

Pushes to `main` run lint, tests and build, then deploy to GitHub Pages (`.github/workflows/deploy.yml`).

## Layout

| Path | What |
|---|---|
| `src/data/kana.ts` | the kana tables (katakana derived from hiragana) |
| `src/path/` | course data and vocabulary, exercise engine, progress/XP/streak, exercise components |
| `src/srs/` | scheduler wrapper around ts-fsrs |
| `src/db/` | IndexedDB layer, backup and restore |
| `src/anki/` | `.apkg` parsing, template rendering, media and sanitizing |
| `src/modes/`, `src/pages/` | study modes and screens |
