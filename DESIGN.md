---
name: Nihongo
description: Learn Japanese from kana to JLPT N2, on washi paper with shu and ai ink.
colors:
  washi: "#f6f3ec"
  sumi: "#1f1c18"
  muted-ink: "#625c53"
  card-paper: "#fffdf9"
  raised: "#ffffff"
  hairline: "#e5dfd3"
  control-stroke: "#8f877a"
  shu: "#c8372d"
  shu-press: "#9b2a22"
  shu-wash: "#fbe9e5"
  on-shu: "#ffffff"
  ai: "#2f4a7a"
  ai-wash: "#e6ecf6"
  matcha: "#24723f"
  matcha-wash: "#e3f3e8"
  beni: "#b3261e"
  beni-wash: "#fbe7e6"
  kincha: "#94600f"
  night-washi: "#141312"
  night-sumi: "#efebe4"
  night-muted: "#aaa398"
  night-card: "#1e1c1a"
  night-raised: "#262321"
  night-hairline: "#36322d"
  night-control: "#78716a"
  night-shu: "#f0675a"
  night-shu-press: "#b8483e"
  night-shu-wash: "#3b2220"
  night-on-shu: "#1a0f0d"
  night-ai: "#9db4e0"
  night-ai-wash: "#222b3b"
  night-matcha: "#6bc48a"
  night-matcha-wash: "#1c2e22"
  night-beni: "#f2837a"
  night-beni-wash: "#3a1f1d"
  night-kincha: "#e3b062"
typography:
  display-kana:
    fontFamily: "system-ui, -apple-system, Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, Yu Gothic UI, sans-serif"
    fontSize: "min(6rem, 100cqi / n)"
    lineHeight: 1.1
  headline:
    fontFamily: "system-ui, -apple-system, Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, Yu Gothic UI, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  title:
    fontFamily: "system-ui, -apple-system, Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, Yu Gothic UI, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  answer:
    fontFamily: "system-ui, -apple-system, Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, Yu Gothic UI, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 600
  body:
    fontFamily: "system-ui, -apple-system, Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, Yu Gothic UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "system-ui, -apple-system, Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, Yu Gothic UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.05em"
rounded:
  control: "12px"
  card: "18px"
  badge: "16px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.6rem"
  md: "1rem"
  lg: "1.25rem"
  touch: "2.75rem"
components:
  button:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.control}"
    padding: "0.6rem 1.1rem"
    height: "2.75rem"
  button-primary:
    backgroundColor: "{colors.shu}"
    textColor: "{colors.on-shu}"
    rounded: "{rounded.control}"
    padding: "0.6rem 1.1rem"
    height: "2.75rem"
  button-big:
    backgroundColor: "{colors.shu}"
    textColor: "{colors.on-shu}"
    rounded: "{rounded.control}"
    height: "3.5rem"
  button-ghost:
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.control}"
  button-icon:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ai}"
    rounded: "{rounded.pill}"
    size: "2.75rem"
  card:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.card}"
    padding: "1.25rem"
  input:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.control}"
    padding: "0.6rem 1rem"
    height: "2.75rem"
  chip:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.7rem"
  grade-again:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.beni}"
    rounded: "{rounded.control}"
  grade-hard:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.kincha}"
    rounded: "{rounded.control}"
  grade-good:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.matcha}"
    rounded: "{rounded.control}"
  grade-easy:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ai}"
    rounded: "{rounded.control}"
  feedback-good:
    backgroundColor: "{colors.matcha-wash}"
    textColor: "{colors.matcha}"
  feedback-bad:
    backgroundColor: "{colors.beni-wash}"
    textColor: "{colors.beni}"
---

# Design System: Nihongo

## Overview

**Creative North Star: "Shu Ink on Washi"**

Nihongo looks like a well-used study notebook. A warm, off-white page (washi) holds near-black text (sumi), and red seal ink (shu) marks the one thing to do next. Indigo (ai) is the second ink, for listening, focus and example sentences. The Japanese being learned is always the largest thing on the screen. Everything else is set in the device's own system font at modest sizes, so the learner reads the character first and the interface second.

The layout is calm and single-column, built for one-handed use. On a phone, each exercise fills the screen: the prompt sits in the middle, the answers sit at the bottom within thumb reach, and the result rises as a coloured bar pinned to the bottom edge. Cards are soft paper panels with large rounded corners (18px). Buttons are small raised keys that press down when tapped. Night mode keeps the same inks on a warm charcoal page instead of switching to a cool grey.

Colour carries meaning, not decoration. Shu means "act here", matcha means right, beni means wrong, kincha (gold) marks earned things and "Hard", and ai marks listening, focus and "Easy". The app has no imagery, gradients or illustration. Its personality comes from the paper, the inks and the size of the Japanese text.

**Key Characteristics:**
- A warm paper ground (washi) in both themes. Never cool grey.
- One action colour (shu). Its rarity is what makes the next step obvious.
- Japanese text scales to fill its container; everything else is set at a modest size.
- Raised controls that press like keys, with touch targets of at least 2.75rem.
- Phone-first layout: thumb-zone answers, a pinned result bar, bottom tabs.

## Colors

Two inks (shu and ai) and three semantic washes on a warm paper ground. Each colour has a matching night value that keeps its role.

### Primary
- **Shu Vermilion** (`shu`): The next step and the primary button: Today's next lesson, "Show answer", Continue, the active tab, the streak, progress bars. Pressed state is `shu-press`. Text on it is `on-shu`. Its tint `shu-wash` backs the active tab icon and due-review counts.

### Secondary
- **Ai Indigo** (`ai`): Keyboard focus rings, the speak and listen buttons, example sentences (with `ai-wash` behind them), selected options, kanji badges, the forecast bars, and the "Easy" grade.

### Tertiary
- **Matcha Green** (`matcha`, wash `matcha-wash`): Correct answers, finished lessons, a met daily goal, the "Good" grade.
- **Beni Red** (`beni`, wash `beni-wash`): Wrong answers, the "Again" grade, errors.
- **Kincha Gold** (`kincha`): XP, grammar badges, the "Hard" grade.

### Neutral
- **Washi Paper** (`washi`): The page background.
- **Card Paper** (`card-paper`): Cards and the bottom tab bar. A shade lighter than the page.
- **Raised White** (`raised`): Buttons, inputs, list rows. The lightest surface.
- **Sumi Ink** (`sumi`): Body text and headings.
- **Muted Ink** (`muted-ink`): Secondary text, hints, furigana (ruby), counts.
- **Hairline** (`hairline`): Card borders, dividers, button ledges, empty progress tracks.
- **Control Stroke** (`control-stroke`): Input borders and button borders on hover.

### Named Rules
**The One Seal Rule.** Shu marks the single next action on a screen. A second shu button on the same screen breaks the "next step, not a menu" promise. Secondary actions use the default raised button or the ghost button.

**The Meaning-Only Color Rule.** Matcha, beni, kincha and ai always mean the same thing everywhere (right, wrong, earned/hard, focus/easy). They're never used as decoration, and never as the only signal: ✓/✗ marks and text labels always come with them.

**The Three-Place Night Rule.** Night values are declared in three places in `src/index.css`: `prefers-color-scheme: dark` guarded by `:root:not([data-theme="light"])`, and `:root[data-theme="dark"]`. Every new token or per-theme override goes in all three.

## Typography

**Display Font:** the system UI font, followed by Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP and Yu Gothic UI, then sans-serif
**Body Font:** the same stack

**Character:** a single system sans for both scripts. Using the platform's native Japanese gothic keeps kana and kanji crisp, correctly proportioned and quick to load offline, with no web fonts to download.

### Hierarchy
- **Display Kana** (regular weight, up to 6rem, or 7rem from 48rem wide, line-height 1.1): The character or word being studied. Its size is fitted to the card's width (`min(var(--max), 100cqi / var(--n))`, with `--n` set by `fit()`), so a long word shrinks instead of wrapping.
- **Prompt** (600, 2rem, or 2.4rem on tablet): An English prompt to translate. Sentence prompts use 1.6rem at line-height 1.5.
- **Headline** (700, 1.6–1.8rem): Today's greeting and the lesson-complete title.
- **Title** (700, 1.3rem, -0.01em): Card headings (`h2`).
- **Answer** (600, 1.6rem): The revealed answer on a flashcard. The reading below it is 1.2rem in muted ink.
- **Body** (400, 1rem, line-height 1.45; 1.55 in grammar explanations): Everything else.
- **Label** (600, 0.75rem, 0.05–0.08em tracking, uppercase): Tile captions on the lesson-complete card and grammar level headings only.
- **Ruby** (0.45em of its base, muted ink): Furigana over kanji.

### Named Rules
**The Japanese Leads Rule.** On a study screen, the Japanese is the largest text. No interface label is ever larger than the kana or kanji being learned.

**The Unbroken Word Rule.** Japanese never breaks inside a word. Use `word-break: keep-all; overflow-wrap: anywhere` so lines break at the spaces after particles, and fit single words to their container instead of wrapping them. Every Japanese run carries `lang="ja"`.

**The Tabular Count Rule.** Counts, streaks, scores and due numbers use `font-variant-numeric: tabular-nums`, so they don't jitter as they change.

## Layout

- **Width:** single column. `main` is at most 34rem wide on phones, 42rem on tablets (from 48rem) and 46rem on desktop (from 64rem). Page gutters are 1rem, widened by the safe-area insets.
- **Navigation:** phones get a sticky top bar (logo, account) and five bottom tabs. Tablets (≥48rem) get one top bar holding the brand, the tabs and the account button. Desktops (≥64rem) get a 15rem sidebar with a secondary "More" group, and the account button sits fixed at the top right.
- **Focused screens** (lessons, reviews): the tabs are hidden (`main.focused`). On phones, `.lesson` fills the viewport height (`100dvh`): the prompt is centred with `margin-block: auto`, answers and the primary button sit at the bottom, and the card reserves 11rem at the bottom so the result bar never covers the answers.
- **Spacing rhythm:** rem-based and tight. 0.5–0.6rem between sibling controls, 1rem between card contents and between stacked cards, 1.25rem card padding.
- **Grids:** answer choices use 2 columns (1 for long answers), stats tiles use 4 columns (2 below 400px), and the four grade buttons use 4 columns (2×2 below 360px).
- **Touch:** every control is at least 2.75rem tall. Choice buttons are 3.5rem, or 3.75rem in a phone lesson. The primary lesson button is 3.5rem and full width.

## Elevation & Depth

Depth is mostly tonal: page (washi), card (card paper) and control (raised white) get progressively lighter, separated by hairline borders. In light mode, cards add a faint two-layer warm shadow. Night mode drops shadows entirely and relies on the tonal steps.

### Shadow Vocabulary
- **Paper lift** (`box-shadow: 0 1px 2px rgb(60 40 20 / .06), 0 4px 14px rgb(60 40 20 / .06)`): Cards, light mode only. `--shadow` is `none` at night.
- **Key ledge** (`box-shadow: 0 2px 0 var(--line)`): Every default button. When pressed it drops to `0 0 0` and the button moves down 2px.
- **Seal ledge** (`box-shadow: 0 3px 0 var(--accent-press)`): The primary button. When pressed the button moves down 3px.
- **Frosted bar** (`backdrop-filter: blur(12px)` over a 85–92% surface): The phone top bar and bottom tabs only. It's switched off in the desktop sidebar, where it would trap the fixed account button.

### Named Rules
**The Pressable Key Rule.** The ledge shadow is a physical signal, not decoration: it exists only on things you can press, and it collapses when pressed. Cards, chips and tiles never get a ledge.

## Shapes

Soft and paper-like. Cards are 18px (`--radius`). Controls, inputs, example blocks and tiles are 12px (`--radius-s`). Lesson badges and review counts are 16px squircles. Chips, tags, icon buttons, progress bars and the streak badge are full pills or circles. Borders are 1px hairlines on surfaces, 1.5px on controls, and 2px on choice and grade buttons, which carry semantic colour. The only exception is the example sentence block, which has a 3px ai rule down its left edge and squared corners on that side.

## Components

### Buttons
Tactile, quiet keys. You can see them press.
- **Shape:** gently rounded (12px). At least 2.75rem tall. 500 weight, or 650 on primary.
- **Default:** raised white, hairline border (1.5px), key ledge. On hover the border darkens to the control stroke. When pressed it moves down 2px and the ledge disappears.
- **Primary:** shu fill with white text and the seal ledge. On hover it brightens slightly (`brightness(1.04)`); when pressed it moves down 3px.
- **Big:** 3.5rem tall at 1.1rem, for the main call to action on Today and in lessons.
- **Ghost:** no fill, border or ledge, in muted ink. For Skip and "Can't speak now".
- **Icon:** a 2.75rem circle with an ai icon (speak, slow, account).
- **Disabled:** 50% opacity, with no hover or press effect.
- **Focus:** a 3px ai outline, offset 2px, on every focusable element.

### Grade Buttons (signature)
The four FSRS grades sit in one row (2×2 below 360px): **Again** (beni), **Hard** (kincha), **Good** (matcha), **Easy** (ai). Each is a raised key with its colour in the label and in a 2px border mixed 45% with the hairline. Below the label, the next interval appears in small text, units spelled out (0.75rem: "10 min", "4 days", "2 months"), with a visually hidden ", next in" for screen readers. During weak-spots practice the interval is hidden, because practice doesn't reschedule. Keys 1–4 grade. A `kbd` hint shows only on fine pointers.

### Choice Grid
Two columns of equal-height 3.5rem buttons with 2px borders. A Japanese option shrinks to fit its button instead of wrapping. After answering, the right option turns matcha-washed and a wrong pick turns beni-washed, with a ✓/✗ in the top-left corner so the label doesn't move.

### Feedback Bar (signature)
The result of an exercise rises from the bottom edge (180ms `rise`, switched off under reduced motion). It has a 2px top border in matcha (right) or beni (wrong) over the matching wash, the verdict at 1.1rem 650, the correct answer and a memory hint in small text, and a full-width Continue button. Continue ignores taps for its first 300ms, so a double tap on an answer can't skip the result. In a right result, Continue turns matcha.

### Cards / Containers
- **Corner style:** 18px.
- **Background:** card paper on washi.
- **Shadow:** paper lift in light mode, none at night.
- **Border:** 1px hairline.
- **Padding:** 1.25rem, 1rem gap, contents centred (`.card.form` aligns them to the left edge instead).

### Inputs / Fields
- **Style:** raised white, a 1.5px control-stroke border, 12px radius. Answer inputs are centred at 1.3rem. Search is left-aligned at 1.1rem.
- **Focus:** the border turns ai, plus the 3px ai focus outline.
- **Kana preview:** typed romaji appears above the input as kana at 1.6rem. Characters still being converted show at 60% opacity.

### Chips and Tags
Pill chips with a hairline border on card paper, 650 weight, tabular numbers (streak and counts on Today). Tags are smaller pills (0.75rem) whose border and text take the learning-stage colour.

### Navigation
On phones, five bottom tabs with an icon over a 0.75rem label in muted ink. The active tab is shu at 650, and its icon sits in a shu-wash pill. On tablet and desktop the tabs lie horizontally (icon then label), and the active tab gets a shu-wash fill with text mixed 75% shu into sumi, because plain shu on its wash is under 4.5:1.

### Example Sentence
An ai-washed block with a 3px ai left rule. The target word is marked in shu at 700. The sentence is 1.15rem, its English below it in muted ink, and the speak buttons are pinned to the right edge.

### Mnemonic Chip
A quiet full-width aid set off by a hairline rule above it (no fill, no box: a card inside the card was the detector's nested-cards hit), sumi text at 0.95rem with balanced wrapping, under a meaning; its Japanese parts are 1.15em at 600. It is not shu-washed: next to the Again button a pink panel read as an error. In review it is a fading crutch, shown while a card is new (fewer than 3 reviews), relearning, or in weak-spots practice.

## Do's and Don'ts

### Do:
- **Do** use the CSS custom properties in `src/index.css` (`--accent`, `--indigo`, `--good`, `--bad`, `--gold`, `--line`, `--muted`, `--radius`, `--radius-s`) instead of raw values, and declare any new token in all three theme blocks.
- **Do** fit large Japanese to its container with `fit()` and `100cqi / var(--n)` instead of letting it wrap.
- **Do** keep every control at least 2.75rem tall, and put a phone lesson's answers and primary button at the bottom, within thumb reach.
- **Do** give every motion a `prefers-reduced-motion` fallback, using `--dur-1` (120ms, press and hover), `--dur-2` (220ms, things arriving) and `--ease-out`.
- **Do** pair every semantic colour with a text or ✓/✗ signal.
- **Do** check contrast on tints: when shu or ai text sits on its own wash, mix it toward sumi, as the active tab does.

### Don't:
- **Don't** put more than one shu primary button on a screen.
- **Don't** dim white text on shu. Muted text on a primary button fails contrast, which is why lesson rows keep `on-shu` at full strength.
- **Don't** add web fonts, images or third-party assets the app would need to fetch. The app must stay fully usable offline.
- **Don't** give cards, chips or tiles the pressable ledge shadow. It belongs to things you can press.
- **Don't** follow the Stats stage colours as a pattern. Apprentice/Guru/Master use hard-coded one-off hexes with a night brightness filter, outside the token set.
