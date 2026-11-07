---
target: review session
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/pawan/workspace/pers/nihongo/src/pages/Study.tsx"
target_fingerprint: "sha256:f6b3b2fc5e8f0d852733720ba51e6ab3055b6f461deb3b71e7263e101241d1a8"
target_path: /Users/pawan/workspace/pers/nihongo/src/pages/Study.tsx
timestamp: 2026-11-07T11-49-28Z
slug: src-pages-study-tsx
---
# Critique: review session (Study.tsx + modes)

Score 21/40 (Acceptable). H1 2, H2 2, H3 2, H4 2, H5 2, H6 2, H7 3, H8 3, H9 2, H10 1.

Specificity: study content is product-specific (fit kana, selective furigana, hidden-English examples, washi/shu/ai); the session shell is generic Anki. Detector: CLI clean; browser cream-palette x4 (false positive, intentional washi), low-contrast x1 (kbd "space" on primary 2.5:1, real, keyboard-only).

## Priority Issues
- [P1] Intervals unreadable for beginners (1m vs 1mo, identical Good/Easy, state invisible, a11y name "next in1m"). Fix: spelled-out units, state label, fixed hidden-text spacing. scheduler.ts:17-23, Flashcard.tsx:73.
- [P1] No undo for a grade. Fix: Undo chip + Ctrl+Z restoring previous FSRS card and deleting the review. Study.tsx:53-74.
- [P1] Session dead ends and empty ending: load error with no Exit (Study.tsx:76), complete screen counts repeats, no next step, not announced; raw exception in save error.
- [P2] Progress invisible: "N left" stalls on Again; no progress bar.
- [P2] Practice mode unlabeled; grade row floats mid-screen on Anki HTML cards (index.css:329 missing .html).

## Persona Red Flags
Alex: no 1–4 hints, no undo, no Esc. Sam: "next in1m", completion unannounced, focus lost, 🎉 read aloud, kbd 2.5:1. Casey: unrecoverable mis-taps, jumping grade row. Week-one beginner: 1m read as month, Hard misunderstood, "All caught up" on day one, pink mnemonic reads as error.

## Minor
.kanji-readings defined twice; example reflows on reveal; inconsistent wrong-answer copy across modes; loading skeleton has no Exit.
