# S30 fix plan

Each S30 label in `../inputs/critiques/CRITIQUES.md` (59, all by Aidan) maps to one fix group below. Labels that describe the same
pattern are grouped, and a group is applied everywhere the pattern occurs, not only on the labelled element ("would remove elements of
this pattern entirely"). Anything not named here stays as it is in `../inputs/live-app` (routes, layout, copy, assets, animation).

**[A]** marks an interpretation Aidan can overrule.

| Group | Labels | Change | Files |
| --- | --- | --- | --- |
| F1 | #188 #238 #240 #248 #267 #269 #286 #290 #293 #295 #298 #302 #309 #312 #313 #335 #337 #341 #343 #353 #354 #355 #359 | Delete `SectionTag` (pill, pulsing dot, 11px tracked uppercase) from every page and remove the component. The heading that follows already names each section. | motion.tsx, all pages |
| F2 | #171 #311 #358 | Nav: logo is plain "kora" (no green dot, no second font); the mobile menu drops its `01`–`06` mono prefixes. #311 and #358 have no comment and are read as part of #171. **[A]** | Nav.tsx |
| F3 | #183 #257 | Hero: "machines." uses the headline font (no Instrument Serif italic) and sits on the same line as "revenue" at desktop width. `serif-accent` is removed site-wide so no other heading mixes fonts. #257 has no comment. | Home.tsx, all pages |
| F4 | #211 #213 #215 #216 | Case-study meta "LEDGERLY · 2025" becomes "Ledgerly, 2025". | Work.tsx |
| F5 | #224 #249 #275 #282 #305 #333 #339 | Remove the "Free 30-min call · No pitch · Actionable teardown" line under every CTA. | shared.tsx |
| F6 | #231 #252 #276 #283 #303 | Remove the `CTASection` subtitle (the `copy` prop, incl. "We took X from stuck to scaling"); "Want results like this?" moves down into the space. | shared.tsx, Work.tsx, pages |
| F7 | #217 | Remove the CTA gradient glow and dot grid; also every blurred decorative glow in page heroes. | shared.tsx, all pages |
| F8 | #232 #236 #278 #357 #360 | Remove the footer "Booking Q1 2027 — 3 spots left" pill. #236 has no comment. | Footer.tsx |
| F9 | #233 #234 | Remove the footer tagline; hello@kora.agency sits under the logo. #234 has no comment. | Footer.tsx |
| F10 | #299 #300 #301 | Service tags on case studies use the body font weight and size like the rest of the site. | Work.tsx |
| F11 | #316 #324 #326 | Pricing comparison cards use `rounded-[22px]`, the radius of the "Talk me through the math" pill. | Pricing.tsx |
| F12 | #343 | About: wider gap between the story image and "Our story", and no parallax shift, so the image never overlaps the text. | About.tsx |
| F13 | #348 | About: remove the floating "6+ years compounding client growth" card and its float animation. | About.tsx, index.css |
| F14 | #224 #231 #232 #233 #252 #276 #303 (em dash and `·` parts) | No `·` or em dash anywhere in visible copy or UI: paired dashes become parentheses or commas, `Phase 1 — X` becomes `Phase 1: X`. | content.tsx, all pages |
| F15 | #188 #224 #249 (monofont parts) | No tracked-uppercase micro-labels anywhere: remaining small labels become sentence case at normal tracking. | all pages |

Follow-up from Aidan in chat after the first pass: "Make the font a bit thinner". Every weight drops one step
(800 to 700, 700 to 600, 600 to 500).

## Audit pass

A second pass over the reference above, against (a) the 59 labels again, (b) every criterion R1 to R25 in
`tasks/reference-rubric.md`, and (c) the S13, S14 and S13-ref labels read as patterns. F1 to F15 fixed the labelled
elements and left the rest of the build as generated, so the patterns the rubric names were still there in volume
(counts in the source of the F1 to F15 solution):

| Pattern | Count before | After | Rule |
| --- | --- | --- | --- |
| `rounded-full` pills | 92 | 0 (icon-only buttons are circles) | R7 |
| radii of 22px and more | 43 | 0 | R7, R19 |
| bold, semibold, extrabold | 167 | 0 bold; 600 on headings and figures only | R4, R18 |
| glow and long shadows | 22 | 0 | R6 |
| dot-grid backgrounds | 17 | 0 | R6, R23 |
| gradients | 12 | 1 (scrim over the hero video) | R6 |
| word-by-word clipped heading reveals (`SplitText`) | 37 | 0 | R15 |
| scroll parallax transforms | 26 | 1 (the brief's scroll-linked statement) | R14 |
| hover lifts, zooms and tilts | 33 | 0 | R16 |
| magnetic buttons | 3 | 0 | R16 |
| custom cursor, Lenis smooth scroll | 1, 1 | 0 | R16 |
| counter preloader with text | 1 | plain ring, 400ms at most | R25 |
| "Most popular", "Best for validation", "Featured:" badges | 3 | 0 | R7 |
| `01` to `04` numbered markers (small and watermark) | 8 | 0 | R2 |

Fixing these in place meant rewriting the markup of every page, so the pages and shared components were rewritten
on the same stack, routes, copy, images and video. Grader slop points: live app 54.56, F1 to F15 solution 19.32,
this solution 0.

### Fix groups added by the audit

| Group | Rule | Change |
| --- | --- | --- |
| A1 | R1, R2, R5 | No eyebrow, tag, dot or number in front of any heading or list item. Process steps, service lists and the mobile menu are plain text in order. |
| A2 | R4, R18, R19 | One family (Manrope, self-hosted with a metric-matched fallback), three weights, a fixed set of sizes, 14px minimum. Logo is text. See `DESIGN-SYSTEM.md`. |
| A3 | R7, R19, R20, R22 | Radii are 6px (controls) and 10px (images). Cards, pills and chips became text separated by rules on a 12-column grid; boxes that remain (buttons, fields, toggles) are equal in size within a group (`box_audit.py`). |
| A4 | R6, R23 | No glow, sheen, blur blob, dot grid, gradient text or gradient border. Depth comes from two flat dark surfaces with a 7% grain under the content. |
| A5 | R14, R15, R16 | Entrances are one fade with a 12px rise, once, in document order. Removed: clipped word reveals, parallax, hover lift and zoom, magnetic buttons, custom cursor, Lenis. `prefers-reduced-motion` shows everything at once and stops the marquee and video. |
| A6 | R10, R11 | One CTA band per page with one button; the header keeps "Book a call". Removed: second CTA buttons that led to the same place, section subtitles that restated the heading, the giant footer wordmark, the footer "Socials" links (all four went to /contact) and the "Privacy" and "Terms" text that was not a link. |
| A7 | R7, R9, R10 | No plan badges and no "Featured:" prefix. The hero loses its avatar stack with five stars and "Trusted by 120+ growth-stage teams" (the 120+ figure is in the results row) and its "Scroll" cue (S13-ref #465). The figures that stay are the agency's stated results, each with its label (brief content, see exceptions). |
| A8 | R12, R13, R21 | No control wraps from 360 to 1920px (grader sweep and `interactions.py`); section padding is one scale; headings sit close to their content. |
| A9 | R25 | CLS 0 on every route at 390 and 1440px: fonts preloaded, image and video boxes reserved, count-up starts at a number as wide as its final value, `overscroll-behavior: none`. |
| A10 | R16 | Contact form validates each step and confirms; filters, accordions, billing toggle, testimonial arrows, video pause and back-to-top are checked in `interactions.py`. Related articles never repeat (PR #13, cherry-picked). |

### Every S30 label

"Now" is the state in this solution; the crop shows the labelled element in the original and the same place here.

| Label | Comment | Group | Now | Evidence |
| --- | --- | --- | --- | --- |
| #171 | Pulsating dot, different fonts, use of · , monofont | F2 | Logo is the word "kora" in the site font; menu links have no number prefixes (A2). | [crop](../verification/crops/171.jpg) |
| #183 | Machines is not aligned with the rest of a text, different font | F3 | One family site-wide (Manrope); the hero headline is one weight, one colour, with "machines." set inline (A2). | [crop](../verification/crops/183.jpg) |
| #188 | pulsating dot and case studies (vibecode pattern), vibecoded-esque font, weird edge radius | F1 F15 | No section tag anywhere; each section opens with its heading (A1). No uppercase, tracked or monospace text (checks.py, grader eyebrows 0). | [crop](../verification/crops/188.jpg) |
| #211 | Use of · symbol | F4 | Case meta reads "Fintech, 2025" in body text. | [crop](../verification/crops/211.jpg) |
| #213 | Use of · symbol | F4 | Case meta reads "Fintech, 2025" in body text. | [crop](../verification/crops/213.jpg) |
| #215 | Use of · symbol | F4 | Case meta reads "Fintech, 2025" in body text. | [crop](../verification/crops/215.jpg) |
| #216 | Use of x · symbol | F4 | Case meta reads "Fintech, 2025" in body text. | [crop](../verification/crops/216.jpg) |
| #217 | Ugly gradient, symbolic of AI usage | F7 | CTA is a flat dark band; no gradient, glow or dot grid anywhere (A4). | [crop](../verification/crops/217.jpg) |
| #224 | Monofont subtitle, representative of heavy AI usage, use of · , | F5 F14 F15 | The line under the CTA buttons is gone. No middot or em dash in any visible text (checks.py). No uppercase, tracked or monospace text (checks.py, grader eyebrows 0). | [crop](../verification/crops/224.jpg) |
| #231 | Subtitle could be excluded, use of em dash, could be taken off, and the your story could be pushed down | F6 F14 | The CTA is a heading and one button; no subtitle (A6). No middot or em dash in any visible text (checks.py). | [crop](../verification/crops/231.jpg) |
| #232 | symbolic of ai format, usage of em dash, the pulsating dot, rough edges | F8 F14 | No footer badge. No middot or em dash in any visible text (checks.py). | [crop](../verification/crops/232.jpg) |
| #233 | Em dash, redundant subtitle text. Would recommend removing, and pushing the hello@kora.agency below the kor... | F9 F14 | No footer tagline; hello@kora.agency sits under the logo. No middot or em dash in any visible text (checks.py). | [crop](../verification/crops/233.jpg) |
| #234 | (no comment) | F9 | No footer tagline; hello@kora.agency sits under the logo. | [crop](../verification/crops/234.jpg) |
| #236 | (no comment) | F8 | No footer badge. | [crop](../verification/crops/236.jpg) |
| #238 | Pulsating dot, weird radius element, slop font -> would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/238.jpg) |
| #240 | Pulsating dot, weird radius element, slop font -> would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/240.jpg) |
| #248 | Pulsating dot, weird radius element, slop font -> would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/248.jpg) |
| #249 | Usage of · monofont beard -> would remove entirely | F5 F15 | The line under the CTA buttons is gone. No uppercase, tracked or monospace text (checks.py, grader eyebrows 0). | [crop](../verification/crops/249.jpg) |
| #252 | Unnecessary subtitle, would remove this and push the "Want results like this?" down. Em dash usage | F6 F14 | The CTA is a heading and one button; no subtitle (A6). No middot or em dash in any visible text (checks.py). | [crop](../verification/crops/252.jpg) |
| #257 | (no comment) | F3 | One family site-wide (Manrope); the hero headline is one weight, one colour, with "machines." set inline (A2). | [crop](../verification/crops/257.jpg) |
| #267 | Usage of pulsating dot and monofont, would remove elements of this pattern entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/267.jpg) |
| #269 | Pulsating dot, weird radius, results, would remove elements like this entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/269.jpg) |
| #275 | Usage of · monofont beard -> would remove entirely | F5 | The line under the CTA buttons is gone. | [crop](../verification/crops/275.jpg) |
| #276 | Usage of em dash, unnecessary subtitle, would remove this and push Want Results Like This? | F6 F14 | The CTA is a heading and one button; no subtitle (A6). No middot or em dash in any visible text (checks.py). | [crop](../verification/crops/276.jpg) |
| #278 | Usage of pulsating dot, weird radius element, em dash, would remove elements of this pattern entirely | F8 | No footer badge. | [crop](../verification/crops/278.jpg) |
| #282 | Usage of · monofont beard -> would remove entirely | F5 | The line under the CTA buttons is gone. | [crop](../verification/crops/282.jpg) |
| #283 | Would remove this, and push Want results like this down in lieu | F6 | The CTA is a heading and one button; no subtitle (A6). | [crop](../verification/crops/283.jpg) |
| #286 | Pulsating dot, monofont, weird radius element that doesn't match other radii, would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/286.jpg) |
| #290 | Pulsating dot, radius, that doesn't match the other radii, nonunified font, would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/290.jpg) |
| #293 | Pulsating dot, radius, that doesn't match the other radii, nonunified font, would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/293.jpg) |
| #295 | (no comment) | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/295.jpg) |
| #298 | Pulsating dot, non-matching fonts, unmatched radii -> would remove element entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/298.jpg) |
| #299 | Fonts don't match the rest of the website, would change to unify the font | F10 | Services are listed as plain body text in the case facts list; no tags (A3). | [crop](../verification/crops/299.jpg) |
| #300 | Fonts don't match the rest of the website, would change to unify the fonts | F10 | Services are listed as plain body text in the case facts list; no tags (A3). | [crop](../verification/crops/300.jpg) |
| #301 | Fonts don't match the rest of the website, would change to unify the fonts | F10 | Services are listed as plain body text in the case facts list; no tags (A3). | [crop](../verification/crops/301.jpg) |
| #302 | Pulsating dot, radius, that doesn't match the other radii, nonunified font, would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/302.jpg) |
| #303 | Would remove this subtitle, use of em dash, would push want results like this element down | F6 F14 | The CTA is a heading and one button; no subtitle (A6). No middot or em dash in any visible text (checks.py). | [crop](../verification/crops/303.jpg) |
| #305 | Usage of · symbol, monofont beard -> would remove entirely, symbolic of slop | F5 | The line under the CTA buttons is gone. | [crop](../verification/crops/305.jpg) |
| #309 | Pulsating dot, differing radius from the rest of the elements, different font from website, would remove en... | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/309.jpg) |
| #311 | (no comment) | F2 | Logo is the word "kora" in the site font; menu links have no number prefixes (A2). | [crop](../verification/crops/311.jpg) |
| #312 | Pulsating dot, differing radius from the rest of the elements, different font from website, would remove en... | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/312.jpg) |
| #313 | Pulsating dot, differing radius from the rest of the elements, different font from website, would remove en... | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/313.jpg) |
| #316 | Elements radius don't match the "talk me through the math" radius, radius unification needed | F11 | The comparison is a three-row table with rules, no boxes; the only radii left are 6px controls and 10px images (A3). | [crop](../verification/crops/316.jpg) |
| #324 | Elements radius don't match the "talk me through the math" radius, radius unification needed | F11 | The comparison is a three-row table with rules, no boxes; the only radii left are 6px controls and 10px images (A3). | [crop](../verification/crops/324.jpg) |
| #326 | Elements radius don't match the "talk me through the math" radius, radius unification needed | F11 | The comparison is a three-row table with rules, no boxes; the only radii left are 6px controls and 10px images (A3). | [crop](../verification/crops/326.jpg) |
| #333 | Usage of · , monofont beard, would remove entirely | F5 | The line under the CTA buttons is gone. | [crop](../verification/crops/333.jpg) |
| #335 | Pulsating dot, different radii from the rest of the elements, would remove this entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/335.jpg) |
| #337 | Would remove the pulsating dot element, different radius from the rest of the elements, different font -> w... | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/337.jpg) |
| #339 | Monofont beard, would remove entirely | F5 | The line under the CTA buttons is gone. | [crop](../verification/crops/339.jpg) |
| #341 | Pulsating dot, different font, different radius compared to the website, would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/341.jpg) |
| #343 | Not enough space between the image, would expect the same amount of px spacing as the rest of the elements ... | F1 F12 | No section tag anywhere; each section opens with its heading (A1). Story text sits beside or below the image with the standard grid gap; no parallax (A5). | [crop](../verification/crops/343.jpg) |
| #348 | Would remove floating element entirely, isn't inside the image behind it, weird floating animation not visi... | F13 | No floating card; the three figures are a plain row under the story text. | [crop](../verification/crops/348.jpg) |
| #353 | Pulsating dot, different font, different radius compared to the website, would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/353.jpg) |
| #354 | Pulsating dot, different font, different radius compared to the website, would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/354.jpg) |
| #355 | Pulsating dot, different font, different radius compared to the website, would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/355.jpg) |
| #357 | Pulsating dot, different font, different radius compared to the website, would remove entirely | F8 | No footer badge. | [crop](../verification/crops/357.jpg) |
| #358 | (no comment) | F2 | Logo is the word "kora" in the site font; menu links have no number prefixes (A2). | [crop](../verification/crops/358.jpg) |
| #359 | Pulsating dot, different font, different radius compared to the website, would remove entirely | F1 | No section tag anywhere; each section opens with its heading (A1). | [crop](../verification/crops/359.jpg) |
| #360 | Pulsating dot, different font, different radius compared to the website, would remove entirely | F8 | No footer badge. | [crop](../verification/crops/360.jpg) |

### Rubric R1 to R25

| Rule | Result | Evidence |
| --- | --- | --- |
| R1 eyebrows | pass | grader `eyebrows` 0; `checks.py` finds no uppercase tracked text |
| R2 marks before titles | pass | grader `numbered_markers` 0; no dots, bars or icons before headings |
| R3 separators and dashes | pass | `checks.py`: 0 middots, 0 em dashes on 10 routes at 2 widths |
| R4 type sized for its container | pass | 15px body and UI, 17px lede, 14px minimum |
| R5 nothing pulses | pass | `checks.py` `animated_dots` 0; the only loops are the client marquee and the loader ring |
| R6 glows and gradients | pass | no shadows; one gradient, the hero video scrim |
| R7 tags and badges | pass | grader `pills` 0, `big_rounding` 0; no plan badge |
| R8 icons | pass | arrows on actions, plus and minus on accordions, checks on plan features, menu and video controls; value and service icons removed |
| R9 showcase numbers | brief exception | see below |
| R10 every line earns its place | pass | CTA subtitles, footnotes, footer tagline and section restatements removed |
| R11 say each thing once | pass | grader `duplicate_ctas` 0 |
| R12 deliberate length, spacing, alignment | pass | 12-column grid, `box_audit.py` 0 uneven groups at 1440 and 390px |
| R13 controls never wrap | pass | grader `broken_controls` 0 over 20 widths; `interactions.py` at 9 widths |
| R14 motion never breaks layout | pass | no parallax; no overlaps in `verification/pages` |
| R15 calm entrances | pass with brief exception | one fade-rise; the scroll-linked statement stays (below) |
| R16 real, stable interactions | pass | `interactions.py` 25 of 25 |
| R17 images tell the truth | pass | the original's photos, uncropped subjects, no tint; portraits are the original's |
| R18 type system | pass | `DESIGN-SYSTEM.md`, Type |
| R19 one small design system | pass | `DESIGN-SYSTEM.md`; one easing, two radii, four button styles |
| R20 balanced boxes on a grid | pass | `reports/box-audit.json` |
| R21 space follows content | pass | one section padding; no empty panels |
| R22 frames only where they do a job | pass | frames on controls and media only |
| R23 texture, not gradients | pass | grain on the two dark surfaces, under the content |
| R24 restraint, not blankness | pass | video hero, photography, dark bands, marquee, count-up kept |
| R25 stable first paint | pass | CLS 0 (`interactions.py`); loader has no text and ends within 400ms |

### S13, S14 and S13-ref patterns

| Pattern (labels) | In the F1 to F15 solution? | Fix |
| --- | --- | --- |
| Uppercase or mono eyebrow, tag or label (S13 #38 #67 #75 #127 #168 #228 #258 #260 #266 #270 #281; S14 #307 #317 #334 #350; ref #464 #466) | no (F1, F15) | none needed |
| Pulsing dot or button (S13 #40 #144; S14 #310 #347) | no (F1) | none needed |
| Dot, glowing bullet or mark left of an item (S13 #107; S14 #322) | yes: dots between the marquee names | A1 |
| Notification-style number badges (S13 #239; S14 #346) | yes: `01` to `04` on the process steps, small and as a watermark | A1 |
| Em dash (S14 #318) | no (F14) | none needed |
| Glow, shine, corner gradient, gradient on hover (S13 #230 #235 #256 #262 #280; S14 #351; ref #463 #468 #473) | yes: 22 coloured and long shadows on cards and buttons, 17 dot grids | A4 |
| Blur-in and slide-in-from-left entrances (S13 #279 #297); text rising from a clipped baseline (S14 #332) | yes: `SplitText` clipped rise on 37 headings | A5 |
| Scroll makes layers collide or cover each other (S13 #61 #62 #268; S14 #306 #308 #345) | yes: parallax on hero, images and cards | A5 |
| Scroll hijack (S14 #340) | yes: Lenis | A5 |
| Hover animation that jumps or restarts (S13 #261 #263) | yes: magnetic buttons, 28 hover lifts and zooms | A5 |
| Controls and nav that wrap (S13 #51 #58 #121; S14 #304 #374 #378 #381 #382) | yes: an FAQ question wraps at 390 and 360px | A8 |
| Dead controls (S14 #338) | yes: footer "Socials" links all go to /contact; "Privacy" and "Terms" are not links | A6 |
| Duplicate CTAs (S13 #133 #134 #135; ref #470) | yes: two buttons in every CTA band, repeated "Book" buttons | A6 |
| Repeated or useless captions and subtitles (S13 #126 #131 #264 #274 #277 #284 #287; S14 #342 #363; ref #465 #486) | partly (F5, F6, F9) | A6 |
| Forced big numbers (S13 #255) | yes | brief exception; decoration around them removed (A7) |
| Bold overuse, bold in buttons, oversized titles (S13 #139; ref #461 #467 #473 #490) | yes | A2 |
| Too much rounding (ref #472); pills duplicating other controls (ref #482) | yes | A3 |
| Icon overuse (S14 #352; ref #469) | yes: icon tiles on values, service deliverables and contact options | A3, R8 |
| Empty components, large negative space, uneven gaps (S13 #46 #237; S14 #371; ref #494 #495 #500) | yes: section padding up to 136px and titles up to 120px | A8 |
| Inconsistent grid, unbalanced boxes (ref #483 #503 #504) | yes | A3 |
| No design system (ref #498) | yes | A2, `DESIGN-SYSTEM.md` |
| Loader with text; layout shift; late hero (ref #477 #485 #487 #499) | yes: counter preloader, font swap shift | A9 |
| Overscroll shows another colour (ref #476) | yes | A9 |
| Cards where dividers would do; gradient instead of texture; grain over content (ref #501 #502 #505) | yes | A3, A4 |
| Tinted images (ref #491) | yes: gradient overlays on nine photos | A4 |
| Narrow gutters (ref #480 #493) | yes: 20px, 32px from 768px | 24px, 40px from 768px, 96px from 1024px |
| Arrow on the primary CTA (ref #497) | already there | kept |
| Too-neon palette (ref #479); generic sans (ref #481) | palette is muted already; Inter is replaced by Manrope | A2 |
| Images that do not show what they claim, before/after pairs, maps (S13 #150 #157 #170 #174 #190 #292; S14 #327 #356; ref #475 #505) | does not apply: no before/after, map or illustrative-claim imagery | none |
| Scroller cut off before the page edge (S13 #73) | no: the marquee is full-bleed | none |
| Carousel instead of a long repeated list (S13 #136) | does not apply: lists are short | none |
| Katie's later asks for S13 (serif hero title, subtle gradients, uppercase ribbon, detailed logo: ref #478 #484 #488 #489 #492 #496 #506) | S13-specific taste calls, and Aidan's S30 labels ask for the opposite here (one font, no mark) | not applied; the hero scrim is the one vignette |

### Brief exceptions

The brief asks to copy the reference's "animations, transition, interactions", "the appearing animation and
scrolling transition", "all the components and content", and standalone pages. Where that meets a rubric rule the
brief wins, in the calmest form that still does what it asks:

| Rule | Kept because of the brief | Limited to |
| --- | --- | --- |
| R9 | The results figures (pipeline, engagements, return, case-study metrics, testimonial metrics) are the reference's content. | Plain figures with a label; no cards, icons or glow. The floating "6+ years" card stays removed (#348). |
| R15, R14 | Appearing animation on scroll; one scroll-linked transition (the statement whose words darken as it passes). | One entrance style; no element moves over another. |
| R5 | Client logo marquee and count-up are reference components. | Marquee is slow, pauses on hover and focus, stops under reduced motion; count-up runs once at constant width. |
| R25 | The reference has a preloader and page transitions. | A ring with no text for at most 400ms; a 200ms route fade. |
| R10 | All reference sections and pages stay, including ones a stricter edit would merge. | Each says its thing once. |

### Left unfixed

Nothing from the labels. Not copied from the reference site itself: the brief's "100%" copy of kora.framer.media is
judged against the arena original's interpretation, as in F1 to F15; this pass did not add reference components
the original lacks.
