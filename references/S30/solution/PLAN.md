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
