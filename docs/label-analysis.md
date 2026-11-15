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

## Rebuild critiques (site `S13-ref`, katie via chat, 2026-11-15)
Katie critiqued the S13 golden-reference rebuild (`references/S13/`) after the 54 original labels had been applied. These 25 labels (R1–R25, SlopLabel ids 461–485) are stored as their own site `S13-ref` so they don't mix with the original S13/S14 labels. Several restate patterns above for a cleaner page, which means the pattern was still visible after the first fix pass. New or broadened patterns:

| Pattern | Labels | Mechanical? |
|---|---|---|
| Headings too large/heavy relative to their subtitle; whole phrases emphasised | R1, R13 | yes: heading/subtitle font-size ratio and weight; share of text ≥600 weight |
| Any gradient or glow at all (backgrounds, logo tile, map halo), not just text/corner glows | R3, R6 | yes: `background-image` gradient, coloured `box-shadow`/`filter: blur`/`drop-shadow` |
| Small uppercase labels anywhere (scroll cue, logo sub-line, marquee), not only eyebrows | R4, R6 | yes: caps text ≤14px or letter-spacing>0 |
| Useless helper text ("Scroll to explore") | R5 | yes: text regex |
| Bold, over-padded buttons | R7 | yes: button font-weight ≥600, padding vs font size |
| Text shadow / outlined decorative background text | R8 | yes: `text-shadow`, `-webkit-text-stroke` |
| Heavy decorative icon use (icon next to every label, button, chip) | R9 | yes: icon count per section / per CTA |
| Duplicate CTAs to the same destination | R10 | yes: count links per `href` |
| Animated control misaligned in a state change (FAQ + → × off-centre) | R11 | yes: icon/container centre offset after toggling |
| Excessive corner rounding everywhere (beyond pills) | R12 | yes: radius ≥ 12px on cards/buttons |
| Heavy, stacked animation (preloader, smooth-scroll hijack, particles, parallax, magnetic/tilt, per-word reveals, looping effects) | R14 | partly: count of infinite animations, rAF canvases, scroll-linked transforms |
| Calibration (R18): after R3/R4 stripped every gradient and caps label, the page read as unpolished. Subtle functional gradients (image-to-section fades, faint tonal bands) and a few small-caps meta labels are fine; the slop is decorative glows/gradient text and caps eyebrows on every section | R18 | thresholds, not presence |
| Paired labels styled inconsistently (Before vs After), blurred overlays | R15 |
| Light page background exposed on overscroll of a dark site | R16 | yes: `html` background vs body; `overscroll-behavior` | yes: sibling label style diff; `backdrop-filter` |
| Neon accent palette (saturated cyan on navy) | R19 | yes: accent colour saturation/lightness |
| Cramped side padding (content close to viewport edges) | R20 | yes: container padding / content inset at each width |
| Characterful/wide grotesk body font where a neutral sans (Inter-like) reads more professional | R21 | partly: computed body font-family vs a neutral-sans allowlist; taste call otherwise |
| Redundant navigation: pill/tab row plus prev/next arrows for the same carousel | R22 | yes: a tab/pill group and prev/next buttons controlling the same panel |
| Inconsistent layout grid: every section picks its own column ratio, gutter and alignment | R23 | yes: column edges and gutters across sections should snap to one shared grid |
| Logo is a stock icon (e.g. Lucide droplet) in a filled rounded tile rather than a designed mark | R24 | partly: logo svg matches an icon-library glyph |
| Layout shift on load/reload (font swap reflow, slide-in entrances, late state restyle, media without reserved space) | R25 | yes: CLS via PerformanceObserver, plus element movement during the first seconds |
| Hero image missing on first paint (waits for JS/video poster) | R17 | yes: hero image request start and paint time vs first contentful paint |

## Other observations
- Both salon sites (S03 gpt-6-astra-max, S04 kimi-k3.1-pro) independently chose Inter + Cormorant Garamond italic accents and 9–10px caps eyebrows: cross-model convergence.
- Arena: in both fully labeled pairs (S01 vs S02, S03 vs S04) the arena loser has more labels. n=2, and label counts reflect annotator effort, so not evidence yet.
- Per-model label counts are not meaningful (6 sites, one annotator each).

## Needed next
- Double-annotate a few sites; mark sites `done` when exhaustively labeled (gives negatives).
- Capture `animation-name`, `background-clip`, `font-variant` in label styles.
- Prototype the mechanical checks above and measure recall against these labels.
