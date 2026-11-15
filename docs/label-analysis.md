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
Katie critiqued the S13 golden-reference rebuild (`references/S13/`) after the 54 original labels had been applied. These 46 labels (R1–R46, SlopLabel ids 461–506) are stored as their own site `S13-ref` so they don't mix with the original S13/S14 labels. Several restate patterns above for a cleaner page, which means the pattern was still visible after the first fix pass. New or broadened patterns:

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
| Cramped side padding (content close to viewport edges) | R20, R33 | yes: container padding / content inset at each width |
| Characterful/wide grotesk body font where a neutral sans (Inter-like) reads more professional | R21 | partly: computed body font-family vs a neutral-sans allowlist; taste call otherwise |
| Redundant navigation: pill/tab row plus prev/next arrows for the same carousel | R22 | yes: a tab/pill group and prev/next buttons controlling the same panel |
| Inconsistent layout grid: every section picks its own column ratio, gutter and alignment | R23 | yes: column edges and gutters across sections should snap to one shared grid |
| Logo is a stock icon (e.g. Lucide droplet) in a filled rounded tile rather than a designed mark | R24 | partly: logo svg matches an icon-library glyph |
| Same point repeated across sections (service list in hero copy + chips + section; "free estimate" and contact details in every section) | R26 | partly: repeated-phrase / n-gram overlap across sections |
| Oversized vertical spacing: hero taller than the viewport with little in it, and large gaps between a section title and its content | R34, R35 | yes: hero height > viewport while content fills < ~50%; title-block margin-bottom > ~1.5× heading font-size |
| Icon reduction has limits: a directional arrow on the single primary CTA is fine (contrast with R9 decorative icons) | R37 | partial: count icons per CTA; flag only non-directional or repeated ones |
| No coherent design system: many distinct border-radius values, button paddings, surface styles and transition durations across one page | R38 | yes: count distinct computed border-radius / transition-duration / button padding values across visible elements |
| Loaders are fine when minimal: no text/branding, simple ring, very short, fades into the page (contrast with S13 #-era branded preloaders cut in R14) | R39 | yes: loader overlay visible > ~600ms, or contains text |
| Zigzag/alternating timeline: half the width empty per row and right-aligned body text on the left cards | R40 | yes: timeline items alternating columns, or text-align:right on multi-line paragraphs |
| Card-for-everything: every list item boxed in a bordered/filled card; plain text with dividers reads cleaner. Texture (grain) preferred over gradients for depth | R41 | yes: count sibling elements with border+background+radius holding only a heading and a paragraph |
| Texture applied everywhere / too coarse; translucent panels letting background texture bleed through so nothing reads as layered | R42 | partly: grain tile size and coverage share; panels over textured backgrounds with fill alpha < ~0.85 |
| Ragged chip/tag clouds: bordered boxes of content width wrapping in uneven rows instead of an aligned grid | R43 | yes: sibling bordered boxes in a wrapping row with differing widths / unaligned left edges across rows |
| Unbalanced boxes: paired/sibling square elements with different sizes or padding (e.g. BEFORE vs AFTER chips, 36px vs 44px circular buttons) | R44 | yes: group bordered/filled siblings; flag width/height/padding spread > 2px; flag circular controls of differing diameters (see `box_audit.py`) |
| Framing everything: maps/illustrations put in a bordered panel for no reason | R45 | partly: bordered container whose only child is an svg/canvas/img illustration |
| Flat overlay on hero media reads cheap; a vignette (darker edges, clear centre) focuses the image while keeping text legible | R46 | partly: hero media overlay with uniform alpha and no radial falloff |
| Dark/colour overlay tinting content photos (product imagery should show true colour) | R31 | yes: semi-opaque element stacked over an img with no text on it |
| Hierarchy from heavy weights instead of contrast: large titles should be light (thin sans), with weight kept for small UI text (extends R1/R13) | R30, R32, R36 | yes: computed font-weight of large headings vs body; a regular-weight serif for the hero and section titles is fine (R32, R36) |
| Flat everything reads unfinished: very subtle tonal background gradients are fine; the slop is glow, gradient text and saturated blobs (refines R3/R18) | R29 | yes: flag gradients by colour distance between stops and by text/blob use, not gradients as such |
| Exception: uppercase + icons are acceptable in a decorative service ribbon (the "no small caps / fewer icons" rules apply to labels and content, not this band) | R28 | scope note for the eyebrow and icon checks |
| Media placeholder that differs from the media (a still photo that swaps to an unrelated video) | R27 | yes: compare the poster/placeholder to the video's first frame |
| Layout shift on load/reload (font swap reflow, slide-in entrances, late state restyle, media without reserved space) | R25 | yes: CLS via PerformanceObserver, plus element movement during the first seconds |
| Hero image missing on first paint (waits for JS/video poster) | R17 | yes: hero image request start and paint time vs first contentful paint |

## Rebuild critiques (sites `S02-ref` and `S06-ref`, katie via chat, 2026-11-15)
Katie reviewed the S02 (It Beginner) and S06 (Rocksteady Campus) golden rebuilds the same way (`references/S02/`, `references/S06/`; SlopLabel ids 507–514 for `S02-ref` R1–R8 and 515–516 for `S06-ref` R1–R2). Unlike the S13 round, most of these are corrections of over-application: applying R1–R25 strictly had removed things that were not slop. They are calibration patterns, mostly about thresholds.

| Pattern | Labels | Mechanical? |
|---|---|---|
| Over-corrected palette: de-slopping flattened the site to greys; colour that carries brand, category or status meaning must stay | S02-ref R1, R5, R6 | partly: chroma of the accent palette vs the original; share of coloured surfaces |
| Icons are fine when consistent (one set, one size, one stroke) and used only where needed, not banned outright | S02-ref R2 | yes: distinct icon sizes/stroke widths; icons per fact row |
| Too little weight contrast: one or two weights across the whole type scale reads flat; vary weight by role | S02-ref R3 | yes: count of distinct computed font-weights in use |
| Over-emphasised hero phrase: a whole phrase-length h1 set bold; large display titles should be thin | S02-ref R4 | yes: hero h1 size > ~48px at weight ≥ 600 |
| Motion the brief asks for (soft animations) is fine when short and opacity-only; strictness should not strip it | S02-ref R7 | yes: duration ≤ ~0.5s, no translate/stagger beyond a few items |
| Layout shift on reload: text loads in and moves (font swap, late entrances) | S02-ref R8 | yes: CLS on a throttled cold load per route |
| Brief precedence: when the brief names a treatment (gradient overlays, uppercase headline, bold type, cards with shadows and radius, a slider) keep it and execute it well | S06-ref R1, R2 | no: reviewer compares brief wording with page |

## Label patterns from the S02, S06 and S30 reference builds
Patterns the three sessions found while applying the labels and the rubric, drawn from the original labels (ids in brackets) rather than new chat critiques.

| Pattern | Labels | Mechanical? |
|---|---|---|
| Labelled pattern recurs site-wide outside the labelled element (mono subtitles, pulsing dots, `·` separators, odd radii, icon tiles on every section); fixing only the labelled instance leaves most of the slop in place (S30 scored 19 points after every label was addressed) | S30 171, 188, 224, 238, 240, 248, 249, 267 | yes: per-pattern counts on every route, expect 0 after a fix |
| Monospace or second-family small text (eyebrows, subtitles, nav labels) as an "engineered" look | S30 171, 224, 249, 267 | yes: computed font-family of text ≤ 14px vs the body family |
| Inconsistent corner radii across cards, buttons and tiles | S30 188, 238, 240, 248 | yes: count distinct computed border-radius values |
| Floating stat/KPI card over an image, not anchored to the image or the layout, often with a drifting animation | S30 348 | yes: absolutely positioned element with a number overlapping an `<img>` |
| Primary CTA collapses to a bare icon at narrow widths | S05 289 | yes: button text node empty below a breakpoint |
| Two differently styled arrow/pager controls side by side for one carousel | S06 395 | yes: ≥ 2 sibling button groups controlling the same panel |
| Filter or search causes the page to jump (content height collapses, scroll resets) | S06 400 | yes: bounding-box diff of untouched elements and `scrollY` before/after the control |
| Fact rows (hours, location, contact, "why us") rendered as a card with an icon each; repetitive captions added for fullness | S06 405; S05 453, 457 | yes: icons per fact row; sibling cards each holding only an icon + one line |
| Forced "big numbers" used as design, not as facts | S02 448 | yes: numeric-only elements > 32px that are not prices or dates |
| Grader false positive: long FAQ questions wrapping inside their button are not broken controls | (S30 FAQ) | fixed in the shared verifier (commit 1403cc4) |

## Other observations
- Both salon sites (S03 gpt-6-astra-max, S04 kimi-k3.1-pro) independently chose Inter + Cormorant Garamond italic accents and 9–10px caps eyebrows: cross-model convergence.
- Arena: in both fully labeled pairs (S01 vs S02, S03 vs S04) the arena loser has more labels. n=2, and label counts reflect annotator effort, so not evidence yet.
- Per-model label counts are not meaningful (6 sites, one annotator each).

## Needed next
- Double-annotate a few sites; mark sites `done` when exhaustively labeled (gives negatives).
- Capture `animation-name`, `background-clip`, `font-variant` in label styles.
- Prototype the mechanical checks above and measure recall against these labels.
