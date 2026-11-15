# photo-fusion status

Design Arena tournament `3221e631-35de-41fb-ae3a-a3c843e5eb79`, originals S11 (muse-spark-1.3) and S12 (gpt-6.1-sol).

## Scores (local grader, `tests/grade.mjs`)

| Build | Reward | Task | Baseline | Slop points | Task checks failed |
|---|---|---|---|---|---|
| Golden (`solution/app/dist`) | 1.00 | 1.00 | 1.00 | 0 | none |
| Golden in Docker (`solve.sh` then `test.sh`) | 1.00 | 1.00 | 1.00 | 0 | none |
| S11 live | 0.65 | 0.96 | 1.00 | 30.4 | no collage layout |
| S12 live | 0.63 | 0.93 | 1.00 | 30.2 | small upload button (147x35), no running animations, downloads drop one of four photos |

Both originals do merge for real, so they lose mostly on slop: S11 on em dashes, big rounding, gradient text, dot separators,
heading accents and wrapping controls; S12 on tiny text (83% of words under 12px), heading accents, duplicate CTAs and emoji.

## How the task checks work

`tests/task.mjs` makes solid-colour 800x800 test photos in the browser, uploads them through the file input and a synthetic
file drop, and reads the colours back out of the on-screen preview and the downloaded files. Layouts are judged by where each
colour lands (side by side, stacked, rows and columns, unequal collage tiles), settings by whether the merged image changes,
the custom background by a magenta the grader picks, downloads by file signature, pixel size and the photos they contain.
Controls are found by label, so any UI wording or control type (buttons, radios, selects, sliders, collapsed panels) works.

## What the golden fixes (from the S12 SlopLabel critiques and the rubric)

- No decorative glyphs (labels 435, 438), no em dashes (443), no tiny trust badges or save notes (439, 441, 442, 446).
- No grey helper subtitles under every heading or "Make something worth sharing" tagline blocks (444, 449).
- One radius scale (8px controls, 14px cards) instead of mismatched rounded chips (434).
- One upload call to action in the hero (64px tall), real drag-and-drop on the editor and the page, keyboard-reachable reorder and remove buttons on every thumbnail as well as drag reordering.
- Canvas preview and export share one layout engine, so the download matches the preview; JPG quality slider and transparent PNG background.
- Purple gradients are kept to the hero, primary buttons and logo, as the prompt asks; no gradient text. No `SLOP_EXEMPT` was needed.

## Invented inputs

None needed: the prompt refers to no external assets. The hero example and "Try it with sample photos" use five Unsplash
photos bundled in `solution/app/public/samples/` (Unsplash License) so the site works offline.
