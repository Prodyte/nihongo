---
target: review session
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/pawan/workspace/pers/nihongo/src/pages/Study.tsx"
target_fingerprint: "sha256:cdd2ecef86c024c51bf558e44409dc012f86465365a0287c46f0d5c73a7ecbb0"
target_path: /Users/pawan/workspace/pers/nihongo/src/pages/Study.tsx
timestamp: 2026-11-07T12-02-29Z
slug: src-pages-study-tsx
---
# Critique round 2: review session

Score 26/40 (Acceptable, up from 21). H1 3, H2 3, H3 3, H4 2, H5 3, H6 3, H7 2, H8 3, H9 3, H10 1.
Detector: CLI clean; browser cream-palette x6 light (false positive, documented washi), dark clean.

## Priority Issues
- [P1] Practice shows four grades with two outcomes. Fix: Again / Got it in practice. Flashcard.tsx:71-78.
- [P1] No grading help; front never says what to recall. Fix: per-kind prompt line; beginner caption on grades that fades. Flashcard.tsx:50,71.
- [P2] End screen sends nowhere; Done at top on phones. Fix: next review time, actions at the bottom; next lesson later. Study.tsx:129-140.
- [P2] Quiz: Next floats mid-screen above reserved padding; no 1-4 keys. index.css:342, Quiz.tsx.
- [P2] Mnemonic outweighs the answer, never fades, shu-wash reads as error in dark. Flashcard.tsx:62,66, index.css:252.

## Minor
Esc exits from a typing field; .kanji-readings breaks inside readings; Undo grey on end screen vs indigo in bar; straight apostrophes; nested .answer-slot; 一 example duplicates the kanji.
