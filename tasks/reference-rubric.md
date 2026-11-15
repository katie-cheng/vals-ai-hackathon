# Reference rubric

The bar a golden reference site has to clear, generalised from Katie's SlopLabel critiques.
Use it as a checklist while building a reference and as the review sheet before blessing one.
The grader in `tests/grade.mjs` scores some criteria automatically; the rest need a reviewer at phone and desktop widths and at the awkward widths in between (about 900 to 1180px).

Source: Katie's 130 labels (124 with comments) in `data/sloplabel/sloplabel-2026-11-15T0713Z.json` on branch `devin/1794726836-sloplabel-review-fixes`, covering S01, S02, S05, S06, S13 and S14.
R18 to R25 (and the extra ids on earlier criteria) come from Katie's 46 chat critiques of the S13 golden rebuild, label ids 461 to 506 under site `S13-ref` in the same export.
Numbers in brackets are label ids, so every criterion can be traced back to the comment that motivated it.
Criteria that Ali and Aidan independently flagged as well are marked "all three" (see `docs/label-analysis.md`).

The brief always wins: if it asks for something listed here (a footer that repeats contact details, glass, Lucide icons), that is not slop.

## Typography and labels

**R1. No small uppercase eyebrows.**
A small, letter-spaced, uppercase (often mono) label above a heading is the single most flagged pattern; make it the title, fold it into the copy, or cut it.
"My main gripe is the combo of uppercase and small font as an eyebrow." All three. [38 67 75 127 168 228 258 260 266 270 281 307 317 334 350 389 397 401 406 407 408 412 414 418 425 431 437 440 452 456 459 460 464 466]
Exception: uppercase is fine on true meta labels that are not headings, such as a service ribbon or Before/After chips [478 488].
Grader: `eyebrows`.

**R2. No marks in front of titles and labels.**
No leading dots, dashes, slashes or `01 /` numbering on headings, labels or list items.
"Having left hand symbols like dots, dashes, and slashes also are major indicators of ai slop." [67 322 334 350 397 413 418 454 458]
Grader: `numbered_markers` covers numbers; leading dots and dashes are not checked yet.

**R3. No separator and dash tics.**
No `·` or `•` strung between phrases and no em dashes in copy. All three. [38 318 397 398 431]
Grader: `dot_separators`, `em_dashes_per_1k_words`.

**R4. Type is sized and weighted for its container.**
Text should not look tiny inside its button or card, and bold is for emphasis, not decoration.
"Text feels way too small relative to the button size"; S01's overall verdict was "fonts are too small". [139 432 445 467 473]
Grader: `tiny_text_share` catches absolute tiny text, not text that is small relative to its box.

## Decoration

**R5. Nothing pulses.**
No pulsing or flashing dots, rings or buttons. "Pulsing dot animation DO NOT DO THIS." [38 40 144 310 347]
Grader: `pulsing_dots` catches dots up to 20px; pulsing buttons and rings are not checked yet.

**R6. No glows, sheens or decorative gradients.**
No glowing buttons or numbers, shine on cards, gradient corners or edges, or gradients that appear on hover. All three. [230 235 256 262 280 351 447 463 466 473]
Grader: `gradient_text` only.

**R7. Tags and badges only for real state.**
Metadata does not get its own pill, step numbers must not look like notification badges, and tags in one place share one size. [38 228 239 346 411 429]
Grader: `pills` partly.

**R8. Icons only where they carry meaning, and never emoji.**
An icon on every list item or card is "overuse of icons"; emoji used as icons are the worst case. [285 352 405 416 422 450 453 457 469]
Grader: `emoji_icons`; icon density is not checked.

**R9. No showcase numbers.**
Big highlighted figures and stats that mean nothing without context feel forced. [255 415 448]
Not automated.

## Content and layout

**R10. Every line earns its place.**
No filler captions or taglines, no subtitle that repeats the title, and no description followed by bullets that say it again.
"Not everything needs a caption." All three. [38 126 131 264 274 342 363 394 405 420 425 436 453 465]
Not automated (judge).

**R11. Say each thing once.**
One call to action per intent per block, and no information repeated in neighbouring sections unless the brief asks for it. [133 134 135 277 284 287 399 470 482 486]
The same goes for controls: if arrows already move through a set, a row of pills that does the same job is redundant [482].
Grader: `duplicate_ctas` (the same CTA text twice within one block, including hover-revealed copies; header, nav and footer skipped); repeated information is not checked.

**R12. Length, spacing and alignment are deliberate.**
Long runs of identical cards should be consolidated, gaps between a heading and its subtitle stay tight, nothing is left as an empty box, and bullets and labels line up with what they belong to. [46 107 136 228 237 369 371 457]
Not automated; empty visible boxes are easy to detect.

## Responsive integrity

**R13. Controls never wrap.**
Buttons, nav links, phone numbers and the logo stay on one line at every width; when they stop fitting, the nav collapses into a menu button or the extra item hides.
"Do not wrap parts of the nav when the viewport gets too small, it looks super messy." [51 58 121 304 374 378 381 382]
Grader: `broken_controls`, a resize sweep from 1920 to 360px that counts each control whose label wraps or spills out of its box; it reproduces these labels on S13 and S14 at 1024 to 1180px.

## Motion and interaction

**R14. Motion never breaks the layout.**
Parallax layers never slide over other content, a section never covers the one above while scrolling, layered lines keep a sensible order, and full-bleed strips such as marquees really span the page. [61 62 73 246 292 306 308 345]
Not automated; bounding-box overlap while scrolling could be checked.

**R15. Entrances are calm and in order.**
No fading each item in from the side, blur-in, text rising from a visible baseline, choppy cycling, overlays that load before their image, or layout jumps when filtering. [279 292 297 332 391 400 474]
Keep the total amount of motion low: short fades on scroll, no parallax, particles, magnetic or tilt effects, or word-by-word title reveals [474].
Not automated (judge, ideally from a screen recording).

**R16. Every interaction is real and stable.**
Every control does something, scroll is never hijacked, hover effects do not flicker or loop, and paired states behave the same way. [150 261 263 338 340 395 427]
Partly automatable: click every button and check that something changed.

## Imagery

**R17. Images tell the truth.**
Before and after shots show the same scene, genuinely dirty then clean and aligned; no tinted copies standing in for "before"; and a promised visual such as a map is actually there.
"Models should be checking the images they're putting in visually." [157 170 174 190 268 327 356 491]
No colour or dark overlay on content photos; they show at true colour [491].
Not automated (human or vision-model review).

## zee-beauty-salon golden: review against this rubric

| Criterion | Result | Evidence |
| --- | --- | --- |
| R1 to R3, R5 | pass | grader slop points 0 at all five widths |
| R4 | pass | body 17px, buttons 15px, no text under 14px |
| R6 | pass | hero glow blobs removed; no gradients on buttons, cards or hovers |
| R7 | pass | no pills or badges; radii 4 to 8px |
| R8 | pass | icons only on contact details and action buttons; per-item icons removed from "Why choose ZEE" |
| R9 | pass | no figures or stats |
| R10 | pass | filler subtitle under "Why choose ZEE" removed; remaining intros carry information (prices pending, photos illustrative, how booking works) |
| R11 | pass | hero hours card removed; the footer repeats contact details because the brief asks for them |
| R12 | pass | no empty boxes; ten services in one grid, two featured |
| R11 grader | pass | `duplicate_ctas` 0 at all five widths |
| R13 | pass | `broken_controls` 0 across the 1920 to 360px sweep; a separate check at 320px also passes |
| R14, R15 | pass | fade-up and bottom-edge clip reveals only; no overlaps in the five-width screenshots |
| R16 | pass | grader interactions pass (filter, lightbox, validation, WhatsApp hand-off, mobile menu) |
| R17 | pass | stock photos chosen and checked by eye, credited in `solution/app/photo-credits.json`, and labelled as illustrative on the page |

## From the S13 rebuild review

Katie reviewed the S13 golden rebuild in chat and left 46 more critiques (SlopLabel site `S13-ref`, label ids 461 to 506, also in `references/S13/inputs/critiques/rebuild-chat.json`).
Many sharpened the criteria above (their ids are added there); the rest generalise into these.
They are about what a site needs beyond "no slop": with every decoration stripped the page read as bland, and the fixes were a consistent system, not more effects.

**R18. Hierarchy comes from a type system, not from size and bold.**
Titles sit modestly above their subtitles, and they do not blow up whole phrases that are not important.
Use one display face for the hero, section and card titles (a serif worked) and one neutral sans for body and UI (Inter or similar); large text is light or regular, bold is rare, and nothing has a text shadow.
Check the words themselves too: split-word animations can drop the spaces ("in its best light" rendered as one word). [461 462 467 468 473 481 490 492 496 500]
Partly automatable: count weights 600 and up, `text-shadow`, title to body size ratio, and families in use.

**R19. One small design system, used everywhere.**
Two or three modest radii (about 6px for controls, 10px for cards, full circles for round buttons), one button system with modest padding, one size for all circular controls, one easing curve and two or three durations.
Glyphs stay centred in their controls in every state (a plus rotating into an X must not drift). [467 471 472 498]
Automatable: count distinct radii, button styles, transition durations and easings on the rendered page (S13: 6 durations to 1, 7 button styles to 3).

**R20. Boxes are balanced and on a grid.**
Sections share one column grid with consistent splits.
Sibling chips, options and cards have equal widths and heights in equal columns, never a ragged `flex-wrap` row; paired elements (Before and After labels) are identical; content inside sibling cards lines up (prices on one baseline). [475 483 500 503 504]
Automatable: `references/S13/verification/tools/box_audit.py` groups bordered or filled siblings and flags any group whose widths, heights or padding differ by more than 2px.

**R21. Space follows the content.**
Generous side margins, wider when there is less content; a hero only as tall as what it holds; tight gaps between a title and its content; no layout that leaves half a section empty, such as a zigzag timeline with cards pushed to the right. [480 493 494 495 500]
Partly automatable: content width and side margins at 1440px, the gap between heading and next block, empty columns.

**R22. Frames only where they do a job.**
A card or box is for something functional (a carousel, a slider, a form, a price list).
Lists of points, steps, FAQs and contact details read better as text with dividers, and a map or illustration does not need a box around it. [501 505]
Partly automatable: bordered containers holding only text, or only one svg or img.

**R23. Depth from texture and layering, not gradients.**
Backgrounds are flat; if a section needs depth, a fine grain on a few chosen surfaces works better than gradients, and the grain should be small.
Anything sitting on a textured background has a near-opaque fill so it reads as raised and the grain does not show through.
A vignette on hero media is fine. Colours are muted, not neon. [463 479 489 501 502 506]
Partly automatable: count gradient backgrounds, saturation of the accent colour, and translucent fills over textured sections.

**R24. Polish is restraint, not blankness.**
Removing every eyebrow, gradient and icon can leave a site generic; a few purposeful details bring back the finish: a detailed line logo instead of a stock icon in a tile, an arrow on the primary call to action, uppercase on a ribbon of services. [466 478 484 488 497]
Not automated (judge).

**R25. The first paint is stable and on-message.**
No layout shift on load (reserve image space with skeletons, preload fonts with size-matched fallbacks); hero media shows its own first frame right away instead of an unrelated poster; a loader, if any, has no text, is a simple ring, lasts under half a second and fades the page in; overscrolling never shows white. [476 477 485 487 499]
Automatable: CLS, time to hero image, loader duration, `overscroll-behavior` and the root background colour.

## S13 golden: review against this rubric

Grader slop numbers from `tasks/zee-beauty-salon/tests/grade.mjs` (the slop half is generic; the requirements half is zee-specific and not meaningful here): the live S13 app scores 214.3 slop points (pulsing dots 103.8, eyebrows 32.5, pills 18.9, numbered markers 14.5, big rounding 11.7, broken controls 9); the reference scores 17.5.

| Criterion | Result | Evidence |
| --- | --- | --- |
| R1 | pass with Katie's exception | `eyebrows` 7.5 points, all from the uppercase service ribbon, which Katie asked to keep [488] |
| R2 | open | `numbered_markers` 5 points: the `01` to `05` counters on the Services and Before/After pagers and the faint `01` numeral on the service card; not flagged in Katie's review |
| R3, R5, R6 | pass | `dot_separators`, `em_dashes`, `pulsing_dots`, `gradient_text` all 0; no glows; the only gradient is the hero vignette (R23) |
| R4, R18 | pass | Fraunces regular for hero, section and card titles, Inter for body and UI; medium weight only on small UI text; no text shadows |
| R7 | pass | `pills` 0, `big_rounding` 0 |
| R8 | pass | icons only on controls, contact links and the service ribbon [488] |
| R9 | pass | no stats |
| R10, R11 | pass | repeated copy cut [486]; one CTA per destination [470]; `duplicate_ctas` 0 |
| R11 grader note | false positive | `heading_accents` 5 points come from the price units ("$5 each"), not a heading accent |
| R12, R20, R21 | pass | 12-column grid; `box_audit.py` finds no uneven sibling groups at 1440 or 390px; price baselines aligned |
| R13 | pass | `broken_controls` 0 across the 1920 to 360px sweep |
| R14, R15 | pass | fade-only entrances, no parallax or particles [474] |
| R16 | pass | `verification/reports/checks.json`: menu, service carousel and swipe, slider (keyboard, drag, click), FAQ, map, share, quote form validation |
| R17 | pass | Before/After pairs are distinct dirty and clean images of the same scene; the map is drawn; photos at true colour |
| R19 | pass | `solution/DESIGN-SYSTEM.md`; one transition duration and easing, three button styles, radii 6 and 10px plus circles |
| R22, R23 | pass | text with dividers for Why us, Process, FAQ and contacts; grain on chosen sections only, near-opaque raised fills |
| R24 | pass | line-art logo, CTA arrow, ribbon |
| R25 | pass | CLS 0 at 1440 and 390px; text-free loader gone in about 0.5s; `overscroll-behavior: none` |
