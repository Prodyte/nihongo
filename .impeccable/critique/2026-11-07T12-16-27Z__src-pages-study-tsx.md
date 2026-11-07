---
target: review session
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/Users/pawan/workspace/pers/nihongo/src/pages/Study.tsx"
target_fingerprint: "sha256:48d748368fe9a02fb0cd63cd4a9c19b7d870a0b752ddd6ef9c890ef86029b391"
target_path: /Users/pawan/workspace/pers/nihongo/src/pages/Study.tsx
timestamp: 2026-11-07T12-16-27Z
slug: src-pages-study-tsx
---
# Critique round 3: review session

Score 25/40 (Acceptable; round 2 was 26, different reviewer, plateau). H1 3, H2 3, H3 3, H4 2, H5 1, H6 3, H7 3, H8 3, H9 2, H10 2.
Detector: CLI clean; browser cream-palette x8 (false positive, washi), nested-cards x5 on .mnemonic (real; fixed: ruled section instead of a box).

## Priority Issues
- [P1] Double tap on Show answer grades an unseen card; double tap on a quiz option skips its result. Fix: arm delay on grade, Next and end-screen buttons.
- [P2] "N left" stalls on learning cards. Fix: count unseen cards, re-queued shown separately.
- [P2] Quiz/Typing misses shout and teach nothing. Fix: smaller verdict, mnemonic on a miss.
- [P2] New card not announced to screen readers. Fix: aria-describedby on Show answer.
- [P3] Practice grade row half-empty. Fix: two columns.

## Minor
Stage tag is jargon; sticky :hover on touch; "Nothing due" has no next-review time; Quiz has no prompt line; .left wraps at 200% zoom; DESIGN.md interval examples stale.
