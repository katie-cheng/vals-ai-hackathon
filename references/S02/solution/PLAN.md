# S02 fix plan

Inputs: `../inputs/brief.md`, the reconstructed original in `../inputs/live-app`, the dossier in `../inputs/dossier`, the 48 S02 labels and
23 S01 labels in `../inputs/critiques`, `tasks/reference-rubric.md` (R1 to R25), `docs/label-analysis.md`, and the S13 / S14 / S13-ref
critiques (`references/S13/inputs/critiques`). Label numbers are SlopLabel ids. "RC n" is a rubric criterion; "R n" in the last section is a
chat critique of this rebuild (`../inputs/critiques/rebuild-chat.json`).

What is kept: all 13 routes, the course data (6 chapters, 42 lessons, quizzes, handbooks, playground presets), the demo account and its
seeded progress, localStorage persistence, and every feature (player, notes, Q&A, scratchpad, playground, quizzes, certificates, search,
bookmarks, role switch, admin roster, export, reset). Copy is kept where it says something; headings and labels are put in sentence case.

## S02 labels

Most S02 labels have no comment; the "what was flagged" column is the reading recorded in `CRITIQUES.md`.

| Label | What was flagged | Fix |
| --- | --- | --- |
| #45 | gradient text on half the hero headline ("coloring a part of the title is slop") | one colour, one weight, sentence case, no trailing full stop |
| #53, #54 | hero pill badge, sparkle icon, "Production-Grade ... • 42 Lessons" | removed; the 42 lessons and 6 chapters are stated once in the lead |
| #447 | "Resume Lesson 4": gradient and glow | flat `.btn-primary`; hover changes colour only, no scale |
| #448 | forced big "100%" (stat row 42 / 6 / 100%) | stat row removed; "Free and open source" is a sentence in the lead |
| #74, #84 | uppercase eyebrows "Engineered for student success", "Complete syllabus" | removed; the heading under each is the heading |
| #76, #78 to #83 | six feature cards, each an icon tile + title + paragraph | a definition list on a 3-column grid with hairlines: title + one sentence, no tiles, no icons, no hover lift. Titles keep the six hues of the original cards (R5) |
| #41 | "42 Lessons across 6 Structured Chapters" ("the text itself is slop") | heading is "Curriculum"; the counts live in the lead |
| #85 to #90 | emoji chapter icons | removed everywhere (`icon` dropped from `chapters.ts`); chapters are identified by title |
| #91 to #95 | "Chapter n • n Lessons • n hrs" line above the title | title first, then one meta line with commas ("Chapter 2, 3 lessons, 2.5 hrs") |
| #96 | "Key Concepts" tag pills and an amber CTA with an arrow inside the panel | concepts become one sentence ("Covers ..."); the quiz link is a plain link under the lessons |
| #97 | lesson rows: boxed, 12px text, "12m →" | plain 14px rows, "12 min", no arrow glyph, no box |
| #99, #100, #103 | gradient CTA band, pill with flame, filler paragraph | no band: a heading, one sentence about what is saved, one button |
| #101, #102 | two CTAs to the same intent | one ("Start from lesson 1"); the dashboard is in the nav |
| #104, #105 | footer tech-stack line with a pinging dot | removed (it describes the build, not the product) |
| #106, #111 | logo: gradient tile with glow, "LMS" tag, "AjinLab Platform" sub-label, wraps | one-line wordmark with a small line mark (`Logo.tsx`), used in header and footer |
| #108, #450 | footer lists with emoji and "Ch n:" prefixes ("DO NOT USE EMOJI ICONS") | plain text links; chapter titles come from the data |
| #109, #110 | pulsing streak pill; cramped right cluster (streak, role switch with "(Switch)", avatar) | header right side is search, account, menu. The streak moves to the dashboard and profile as text; the role switch moves into the account menu and the profile page |
| #112 | header row overflows (logo and search squeezed; document 149px wider than a 1440 viewport) | header fits at every width: full nav from 1280px, menu button below; search is an icon button. No overflow from 360 to 1440px |
| #113 to #118 | an icon on every nav link | text-only nav links |

## S01 labels (same brief), applied where S02 has the pattern

| S01 label | Pattern | In S02 | Fix |
| --- | --- | --- | --- |
| #14, #412, #414, #418, #437, #440 | small uppercase eyebrows | the eyebrow + pill pair above the h1 on all 9 inner pages ("Student Dashboard / Active Learner", "Curriculum Catalog / 6 Chapters • 42 Lessons", ...), "Chapter n" lines above titles | all removed; each page starts with its h1 |
| #15, #436 | filler subtitle under a title | sub-lines under each page h1 | one lead sentence per page, kept only where it gives a fact (pass mark, what is filtered, how a certificate is earned) |
| #411, #429 | uppercase mono tags, tags without state | "LMS", "Live Evaluation", "Isolated Sandbox", "Gold Seal Accreditation", "AjinLab Accredited", "Verified", uppercase role tags | removed; `.badge` is used only for passed / needs review, earned / locked, correct / incorrect, role |
| #413, #418 | dot in front of a title | status dot in the player chip, "Live Preview" dot, traffic-light dots on the code card | removed |
| #415 | forced big numbers | dashboard stat tiles, profile stat tiles, admin tiles | dashboard and profile figures become a sentence and a 4-row list (values keep the original tile colours, R5). Admin tiles: see "Left out" |
| #416, #422, #10 | icon overuse, decorative glyphs | icons on every dashboard card title, tab, button and link; sparkles | icons only for state and action (R2 below) |
| #420, #425 | eyebrow + repeated subtitles in one card, useless captions | dashboard "Resume Your Lecture" card, hero code-card captions | resume panel: one meta line, title, description, one button |
| #431 | uppercase label with dot separator | "•" and "|" separators across pages | commas or separate lines; no "•", "|", "→" or "—" in UI copy |
| #432, #445 | text too small for its container | 10 to 12px text nearly everywhere (15% of landing words under 12px) | 13px minimum; body 14 to 16px; buttons 14px in 40px |
| #11, #13, #427 | no S02 equivalent | | not applied (see `CRITIQUES.md`) |

## S13 / S14 / S13-ref patterns

| Pattern (source) | In S02? | Fix |
| --- | --- | --- |
| Titles too big and too bold, whole phrases emphasised (S13 chat R1) | yes: `font-black` / `font-extrabold` on 26 landing elements | type scale in `DESIGN-SYSTEM.md`; display headings thin (R3, R4 below) |
| No gradients or glows anywhere (S13 chat R3; S13 #230, #256, #262, #280; S14) | yes: hero glow blob, gradient buttons, CTA band, logo tile, progress bars, certificate seal, player backdrop, coloured shadows | all removed; fills are flat |
| No uppercase labelling, even for small UI text (S13 chat R4) | yes | no `uppercase` or letter-spaced text left |
| Pulsing dots (S13 #38, #40, #144) | yes: flame, footer dot, player chip dot | removed |
| Numbered markers "01 / 02" (S13, S14) | partly: numbered circles on lesson rows and quiz questions | plain numbers in the text ("1. question"), an ordinal column in lesson lists where order matters |
| Pills and large rounding (S13, S14) | yes: `rounded-full` chips, `rounded-2xl` / `3xl` cards | 6px and 10px radii only |
| Frames only where functional; text with dividers instead of cards (S13 chat R41, R45; RC22) | yes: every list is a grid of bordered cards, chapters are cards holding cards | lists are hairline rows; frames kept for the player, editors, table, menus, dialogs, resume panel, certificate |
| Shared grid and consistent box sizes (S13 chat R23, R43; `box_audit.py`) | yes: 7xl / 5xl / 4xl containers, uneven card heights | one container, 12-column grid, audit in `verification/reports/box_audit.txt` |
| Controls wrap or overflow at some width (S13 #51, #58, #121; S14) | yes: header overflows at 1024 to 1440px, two controls break at 360 to 390px | `.btn`, `.option`, `.badge` never wrap; checked at 11 widths |
| Duplicate CTAs in one block (S13 #61, #62) | yes: three hero CTAs, two CTA-band buttons, "Watch" beside every linked lesson title, "Syllabus" + "View chapter" | one primary action per block, others are text links to a different intent |
| Hover effects that move, scale or flicker (S13 #261 to #263) | yes: `hover:scale-105`, `hover:translate-y` | hover changes colour only |
| Layout shifts on state change (S13 chat R25; RC14) | yes: toasts push content down, copy/bookmark labels change width | messages have reserved space, toggles have fixed widths; CLS 0 |
| Split-word or word-by-word title animation (S13 chat R2) | no | |
| Marquee, before/after slider, map, quote form patterns (S13) | no such sections | |
| Invented stats and testimonials (S13, S14) | partly: admin KPI tiles (see "Left out") | |
| Images tell the truth (RC17) | yes: Unsplash portraits as avatars of demo users | initials avatars (`Avatar.tsx`); no third-party requests remain |
| Layout shift on reload as content loads in (S13 chat R25; RC25) | yes: Google Fonts swap in after first paint | self-hosted, preloaded, awaited (R8 below) |

## Rubric check of the rebuild (RC1 to RC25)

| RC | Result | Note |
| --- | --- | --- |
| 1 eyebrows | pass | none |
| 2 marks before titles | pass | no dots, dashes or icons before headings |
| 3 separators and dashes | pass | no "•", "·", "|", "→" or "—" in UI copy (transcript and note data keep their own punctuation) |
| 4 type sized for container | pass | 13px minimum |
| 5 nothing pulses | pass | no infinite animation on any route (check) |
| 6 no glows or gradients | pass | no gradient, blur or coloured shadow is applied to any element |
| 7 badges for real state | pass | passed, earned, locked, correct, role |
| 8 icons carry meaning, no emoji | pass | see DESIGN-SYSTEM "Icons". Emoji also removed from the course data shown in the UI (handbook titles, preset code output) |
| 9 no showcase numbers | pass | figures are the learner's own progress, in text |
| 10 every line earns its place | pass | |
| 11 say each thing once | pass | "42 lessons, 6 chapters" appears once per page |
| 12 length, spacing, alignment | pass | leads max 44rem, 12-column grid |
| 13 controls never wrap | pass | check at 11 widths |
| 14 motion never breaks layout | pass | opacity-only fades |
| 15 calm entrances | pass | no page-load entrance; confetti removed (particles), see "Left out" |
| 16 interactions real and stable | pass | 122 checks; fake certificate page fixed (below) |
| 17 images tell the truth | pass | no photos |
| 18 hierarchy from a type system | pass | |
| 19 one design system | pass | `DESIGN-SYSTEM.md` |
| 20 boxes balanced, on a grid | pass | remaining audit entries are option groups whose width follows the label (equal height and padding) |
| 21 space follows content | pass | |
| 22 frames only where they do a job | pass | |
| 23 depth without gradients | pass | two surface tones and hairlines |
| 24 restraint, not blankness | pass | colour by meaning, syntax-coloured code, real data on every page |
| 25 stable first paint | pass | CLS 0 on a throttled cold load of every route |

## Behaviour fixes found while rebuilding

- `/certificate/<any code>` rendered a certificate for "Full-Stack Web Development & Engineering" with a "Verified Credential" seal and a made-up public URL for any code. It now shows the certificate only if that code was earned in this browser, and "Certificate not found" otherwise. Links that pointed at made-up codes (`ITB-CH1-CRED`, `-PASS`, `-CERT`) now use the real code.
- The lesson autoplayed on open and ticked progress; it now starts paused at the saved position.
- Quiz submit was disabled until every question was answered, with the reason only in the button label. It now validates on submit, marks each unanswered question and scrolls to the first.
- Notes, questions and replies ignored empty input silently; they now show a field error.
- Admin "Toggle Role" worked in student view; it is disabled until admin view is on.
- `/resources#html-css` and the other footer anchors did nothing; the hash now selects the handbook. `/courses#chapter-n` scrolls to the chapter.
- Menus and dialogs close on Escape and outside click, move focus in, and have roles and names. The seek bar is a real range input. Shortcut keys no longer fire while a control has focus. The mute button (there is no audio) and its shortcut were removed.

## Left out, and why

- Admin KPI tiles ("1,480 students", "18,420 completions", "89.2% pass rate", "+12% this week"): hard-coded numbers that do not match the six-row roster. Replaced by one sentence computed from the roster (RC9, invented claims).
- Confetti on quiz pass and lesson completion: particles (RC15). No label asked for its removal; offered back in chat (R7).
- "Public Verification URL: itbeginner.com/certificate/..." and "Verified" seals: the app has no verification service.
- The brief is one sentence and names no style, so no brief-over-rubric exception was needed.

## Round 2: critiques of the rebuild in chat (2026-11-15)

| # | Critique | Change |
| --- | --- | --- |
| R1 | "the new palette is too muted" | accent and state colours back to the original's sky / emerald / amber / rose values; current nav item tinted |
| R2 | "you can still use icons just make sure they are more consistent and only used when needed" | one Lucide set, 16px / 1.75 stroke in buttons and badges, on state and action only |
| R3 | "vary font weight a lot more" | weights now span 400 to 650 by role: item titles, buttons and names 600, section titles 650, labels 500 |
| R4 | "hero titles should generally be thinner to combat over emphasizing a whole phrase" | hero h1 and landing h2s at 400, inner-page h1 at 500 |
| R5 | "add back the colors" | the original's hues by meaning: amber quizzes and certificates, emerald completion, purple admin, indigo and syntax colours in code, language colours in the playground, coloured figures |
| R6 | "i take it back, de-slopping doesnt mean removing colors" | read as confirming R5; gradients and glows stay out (#45, #99, #447) |
| R7 | "you can bring back soft animations if that is what the spec asked for" | the brief asks for none; the original's intended fade-ins (classes present, keyframes missing) are implemented as a 200ms opacity fade on menus, panels, dialogs and messages |
| R8 | "there is layout shift on reload where the text loads in and shifts" | fonts self-hosted, preloaded and awaited before first paint; player position restored in initial state. CLS 0 |
