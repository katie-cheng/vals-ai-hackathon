# Reference rubric

The bar a golden reference site has to clear, generalised from Katie's SlopLabel critiques.
Use it as a checklist while building a reference and as the review sheet before blessing one.
The grader in `tests/grade.mjs` scores some criteria automatically; the rest need a reviewer at phone and desktop widths and at the awkward widths in between (about 900 to 1180px).

Source: Katie's 130 labels (124 with comments) in `data/sloplabel/sloplabel-2026-11-15T0713Z.json` on branch `devin/1794726836-sloplabel-review-fixes`, covering S01, S02, S05, S06, S13 and S14.
Numbers in brackets are label ids, so every criterion can be traced back to the comment that motivated it.
Criteria that Ali and Aidan independently flagged as well are marked "all three" (see `docs/label-analysis.md`).

The brief always wins: if it asks for something listed here (a footer that repeats contact details, glass, Lucide icons), that is not slop.

## Typography and labels

**R1. No small uppercase eyebrows.**
A small, letter-spaced, uppercase (often mono) label above a heading is the single most flagged pattern; make it the title, fold it into the copy, or cut it.
"My main gripe is the combo of uppercase and small font as an eyebrow." All three. [38 67 75 127 168 228 258 260 266 270 281 307 317 334 350 389 397 401 406 407 408 412 414 418 425 431 437 440 452 456 459 460]
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
"Text feels way too small relative to the button size"; S01's overall verdict was "fonts are too small". [139 432 445]
Grader: `tiny_text_share` catches absolute tiny text, not text that is small relative to its box.

## Decoration

**R5. Nothing pulses.**
No pulsing or flashing dots, rings or buttons. "Pulsing dot animation DO NOT DO THIS." [38 40 144 310 347]
Grader: `pulsing_dots` catches dots up to 20px; pulsing buttons and rings are not checked yet.

**R6. No glows, sheens or decorative gradients.**
No glowing buttons or numbers, shine on cards, gradient corners or edges, or gradients that appear on hover. All three. [230 235 256 262 280 351 447]
Grader: `gradient_text` only.

**R7. Tags and badges only for real state.**
Metadata does not get its own pill, step numbers must not look like notification badges, and tags in one place share one size. [38 228 239 346 411 429]
Grader: `pills` partly.

**R8. Icons only where they carry meaning, and never emoji.**
An icon on every list item or card is "overuse of icons"; emoji used as icons are the worst case. [285 352 405 416 422 450 453 457]
Grader: `emoji_icons`; icon density is not checked.

**R9. No showcase numbers.**
Big highlighted figures and stats that mean nothing without context feel forced. [255 415 448]
Not automated.

## Content and layout

**R10. Every line earns its place.**
No filler captions or taglines, no subtitle that repeats the title, and no description followed by bullets that say it again.
"Not everything needs a caption." All three. [38 126 131 264 274 342 363 394 405 420 425 436 453]
Not automated (judge).

**R11. Say each thing once.**
One call to action per intent per block, and no information repeated in neighbouring sections unless the brief asks for it. [133 134 135 277 284 287 399]
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
No fading each item in from the side, blur-in, text rising from a visible baseline, choppy cycling, overlays that load before their image, or layout jumps when filtering. [279 292 297 332 391 400]
Not automated (judge, ideally from a screen recording).

**R16. Every interaction is real and stable.**
Every control does something, scroll is never hijacked, hover effects do not flicker or loop, and paired states behave the same way. [150 261 263 338 340 395 427]
Partly automatable: click every button and check that something changed.

## Imagery

**R17. Images tell the truth.**
Before and after shots show the same scene, genuinely dirty then clean and aligned; no tinted copies standing in for "before"; and a promised visual such as a map is actually there.
"Models should be checking the images they're putting in visually." [157 170 174 190 268 327 356]
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
