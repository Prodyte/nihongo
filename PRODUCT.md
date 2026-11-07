# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Installable PWA (`vite-plugin-pwa`), used on phones, tablets and desktop browsers. Mobile web, not native.

## Users

Self-taught adult beginners, starting from zero and studying alone. They come back daily for short sessions, often on a phone: clear the reviews that are due, do the next lesson, keep the streak going. Their long-term aim is to work up through the JLPT levels (N5 to N2), but there's no teacher, class or exam date setting the pace.

## Product Purpose

To take someone from no Japanese at all (hiragana) to JLPT N2 in one guided course, and keep what they learn from fading. Success means the learner returns every day, Today tells them the next step without any planning on their part, and what they learned on the path comes back for review when it's due.

## Positioning

- **Free and open source.** No paywall, no ads, source public at github.com/Prodyte/nihongo.
- **Private and on-device.** Progress lives in the browser's IndexedDB and works offline. An account is optional and only syncs between devices (Supabase); without one, nothing leaves the device.
- **One path from kana to N2.** Words, kanji, grammar, reading, listening, speaking and writing in one course, all feeding one review queue, instead of separate apps for vocabulary, kanji and grammar.
- **Serious SRS.** FSRS scheduling, as in modern Anki. The interval on each grade button is what that grade actually schedules. Anki `.apkg` decks can be imported alongside the course.

## Operating Context

- **The daily loop:** Today → due reviews → next lesson → streak. Reviews (Again/Hard/Good/Easy, keys 1–4, space to reveal) are the screen people see most.
- **Short, interruptible sessions:** one-handed on a phone, sometimes offline or where speaking aloud isn't possible ("Can't speak now").
- **Device dependencies:** listening and speaking use the browser's Japanese voice and speech recognition, which some devices lack. Those features have to degrade gracefully.
- **Practice that leaves the schedule alone:** drills, weak-spots practice, the mock JLPT test and lesson replays never change FSRS state.

## Capabilities and Constraints

- The full feature list is in `README.md` and is the reference for what exists.
- Course data is open data under CC BY / CC BY-SA, credited on the About page (`src/pages/About.tsx`). Derived data files keep their licences.
- Lesson ids are snapshot-tested: saved progress refers to them, so they must never be reshuffled.
- Imported Anki HTML is untrusted and sanitized every time it's shown.
- 20 new cards a day; lessons don't count toward that limit.
- Pushes to `main` deploy to GitHub Pages.

## Brand Commitments

- **Name:** Nihongo (日本語). Tagline: "Learn Japanese from kana to JLPT N2."
- **Assets:** the logo component (`Logo` in `src/icons.tsx`, `src/logo-paths.json`) and the app icons in `public/` (`icon.svg`, `favicon.svg`, PNG and maskable icons).
- **Voice (observed in existing copy, not yet confirmed as a rule):** plain and exact. It says what will happen and nothing more, uses British spelling ("practise", "licence"), sentence-case labels, and no hype.

## Evidence on Hand

- Course content in the repo: about 5,000 words, 979 kanji, grammar from starter level to N3/N2, graded stories, 12 listening dialogues, pitch-accent data for about 97% of words, Tatoeba example sentences.
- Open-data sources and their licences are listed in `README.md` and on the About page.
- **None on hand, so never invent any:** user counts, testimonials, reviews, pass rates, learning-outcome claims, press coverage.

## Product Principles

1. **Next step, not a menu.** The learner shouldn't have to plan. Today always points at one clear thing to do.
2. **Honest scheduling.** What the app shows (intervals, due counts, stages) matches what the scheduler actually does. Practice never quietly changes the schedule.
3. **Theirs, on their device.** Privacy and offline use come first. No tracking, ads or third-party scripts, and an account is never required.
4. **Japanese treated with care.** Kana, kanji, furigana and pitch accent are rendered correctly, marked `lang="ja"`, and never machine-translated (`translate="no"`).
5. **Gradual removal of crutches.** Romaji and furigana fade as the learner progresses, as Settings allows.

## Accessibility & Inclusion

- Required: full keyboard use (space to reveal, 1–4 to grade), screen-reader announcements for answers and results, light and dark themes, and checks with axe.
- Speaking, listening and writing exercises can each be turned off or skipped, so no one is blocked by their device, their surroundings or a disability.
