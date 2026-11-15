# SlopLabel data: first look (export 2026-11-15 02:08 UTC)

Source: `data/sloplabel/export-2026-11-15T0208Z.json` (Export JSON from the SlopLabel app; live DB is `~/slopbench/sloplabel/data/sloplabel.db` on Katie's session VM).

## What's in it
- 175 element labels on 6 of 30 sites: S01 6, S02 45, S03 30, S04 45, S13 33, S30 16.
- Annotators: Ali 126 (S01–S04), katie 33 (S13), Aidan 16 (S30). No site has two annotators, so agreement can't be measured yet.
- 65/175 have comments (Ali 19/126, katie 32/33, Aidan 14/16).
- `sites.done`, `overall_verdict`, `overall_score` are empty for all 30 sites.
- Labels are positives only. Without a "site fully labeled" flag, unlabeled elements can't be treated as negatives, so check precision can't be measured from labels yet.
- 5 labels lack screenshots (4 timeouts, 1 pending); 34 have low-confidence selectors.

## Recurring patterns (independently flagged by multiple annotators)
| Pattern | Who | Labels | Mechanical? |
|---|---|---|---|
| Small uppercase letter-spaced "eyebrow" above a heading (often mono, sometimes in a pill, often with a leading dot/number) | all 3 | 41 (23%), all 6 sites | yes: caps text, ≤14px, letter-spacing>0, followed by heading |
| Pulsing/glowing dot | katie, Aidan | several | yes: small element with infinite `animation` / glow shadow (not captured in export yet) |
| `·` / `•` separators | Ali, Aidan | 20 | yes: text regex |
| Pill shapes (`rounded-full`; `borderRadius: 1.67772e+07px`) and large rounding | Ali, katie, Aidan | 25 pill | yes: radius ≥ height/2 |
| Italic / alternate-colour / different-font accent word inside a heading | Ali, Aidan | ~10 | yes: child span differing in fontStyle/color/fontFamily from heading |
| Decorative gradients (text, corner glows) | Ali, katie, Aidan | 9 | yes: `background-image` gradient, `background-clip:text` |
| Emoji used as icons | Ali | 7 on S02 | yes: emoji codepoints in icon-sized spans |
| Em dashes in copy | Aidan | 7 | yes: regex |
| Filler / redundant subtitle copy, "text itself is slop" | all 3 | many | no: judge |
| Responsive breakage (nav/button/phone text wrapping), overlapping elements on scroll, marquee not full width, empty components, duplicated CTAs | katie | ~10 | mostly yes: multi-viewport render, line counts, bbox overlap while scrolling, empty-box and duplicate-text checks |
| Fake/mismatched imagery (before/after not same scene) | katie | 4 | no: judge |

## Other observations
- Both salon sites (S03 gpt-6-astra-max, S04 kimi-k3.1-pro) independently chose Inter + Cormorant Garamond italic accents and 9–10px caps eyebrows: cross-model convergence.
- Arena: in both fully labeled pairs (S01 vs S02, S03 vs S04) the arena loser has more labels. n=2, and label counts reflect annotator effort, so not evidence yet.
- Per-model label counts are not meaningful (6 sites, one annotator each).

## Needed next
- Double-annotate a few sites; mark sites `done` when exhaustively labeled (gives negatives).
- Capture `animation-name`, `background-clip`, `font-variant` in label styles.
- Prototype the mechanical checks above and measure recall against these labels.
