# S13 fix plan (written before any code change)

Each S13 critique from `../inputs/critiques/CRITIQUES.md` is mapped to one planned change. Critiques that describe the same
pattern are grouped; matching S14 labels are listed under the group they join. Anything not named here stays as it is in
`../inputs/live-app` (layout, copy, assets, animation, behaviour). Commits that implement a group are titled `fix F<n> (#ids): ...`.
Verdicts are in `../verification/REPORT.md`.

Ambiguity flags: **[A]** = I had to interpret the critique; the interpretation is stated so Katie can overrule it.

| Group | Critiques | Planned change | Files |
| --- | --- | --- | --- |
| F1 | #38, #40 · S14 #310, #347 | Remove the hero pill badge "Free estimates · All of Connecticut" and its pinging dot (Katie: "i would just cut"). "Free" is already on the primary CTA and in Pricing. | Hero.tsx |
| F2 | #46 | The gap is the invisible second headline line: `bg-clip-text text-transparent` sits on the parent while each word is a transformed inline-block, so the gradient never paints. Paint the gradient on each word so "in its best light." is visible and the gap disappears. | Hero.tsx |
| F3 | #51, #58, #121 · S14 #374, #378, #381, #382 | Header never wraps: show the full link row only from `xl` (1280 px), use the existing menu button below that, `whitespace-nowrap` on logo, phone and CTA, and hide the phone pill when the row is too narrow for it (phone stays in the menu panel). | Header.tsx |
| F4 | #61, #62 | Hero feature chips use a faster scroll transform (`-220px`) than the CTA row (`-140px`) and slide over it. Give chips and CTAs the same transform so they never overlap. | Hero.tsx |
| F5 | #73 | The marquee is wrapped in a `scale 0.92 → 1` scroll transform, so it stops short of both edges. Remove the scale so it spans the full width. | Hero.tsx |
| F6 | #67, #75, #127, #168, #228, #258, #260, #266, #270, #281 · S14 #307, #317, #322, #334, #350 | Small uppercase eyebrows. Remove the numbered section eyebrows ("01 / Cleaning services" … with their dash marks); the h2 already names each section. Service rows: the service name becomes the h3 (#75: "should just be the title"). Process tag pills, the before/after category eyebrow, "Connecticut only", "Representative service towns" and the quote-panel kicker are removed. Labels that must stay (price card names, form field labels, contact card keys) become normal-case text. | Services, BeforeAfter, Process, Trust, PricingAreas, Faq, Quote, Footer |
| F7 | #107, #131, #297 · S14 #342 | Service rows carry a headline, a description and four bullets that repeat it. Keep name + description + price note; drop the bullet list (facts that only appear in a bullet are folded into the description). This also removes the glowing, misaligned dots (#107) and the left-to-right list entrance (#297). Other left-slide entrances of the same kind become plain fade-ups. | Services.tsx, data/content.ts |
| F8 | #126 | Remove the eyebrow badge laid over each service image ("Concrete, pavers and stubborn grime"). | Services.tsx |
| F9 | #133, #134, #135 | Remove the CTA overlaid on each service image; keep the one in the text column. | Services.tsx |
| F10 | #136 **[A]** · S14 #338, #340 | "The same card format is repeated so many times… there should just be a carousel." Read as the six full-height service rows. Show services as one row with a service switcher: tabs for the six names plus working previous/next buttons, swipe on touch, no scroll hijacking. All six services and their copy stay reachable. | Services.tsx |
| F11 | #144 | Remove the pulse ring and scale loop on the slider handle (and the pulsing icon in the "Drag to reveal" hint, same pattern). | BeforeAfter.tsx |
| F12 | #150 | "Before" and "After" labels behave differently when the divider passes over them. Render both above the image layers so neither is ever covered. | BeforeAfter.tsx |
| F13 | #157, #170, #174, #190 · S14 #327 | Before/after pairs are different photos (siding panels, concrete joints and windows don't line up) or the same photo with a dark filter. Make every "before" from its own "after" image: same pixels, with dirt from the original "before" photo (algae, lichen, spotting, leaves) composited on top, so the geometry matches exactly and only the dirt changes. Interior windows and patio get real grime instead of a filter; gutters get the same treatment because they have the same mismatch. The images stay labelled illustrative. **[A]** Katie's #190 asks for "a real image… before and after a cleaning"; only the business can supply real job photos, so this is flagged. | public/images, BeforeAfter.tsx, data/content.ts, tools/make_befores.py |
| F14 | #230, #239 · S14 #346 | Process markers: replace the glowing gradient icon tile with a white notification-style badge by a plain numbered circle (no glow, no badge). | Process.tsx |
| F15 | #235 | Remove the blurred gradient blob in the corner of each process card. | Process.tsx |
| F16 | #237 | Remove the empty spacer column; place each card with grid column classes instead. | Process.tsx |
| F17 | #246 | The moving dashed line is drawn on top of the scroll-filled line. Draw it underneath. | Process.tsx |
| F18 | #255, #256, #258 | Remove the stat tiles ("6 cleaning specialties", "1 statewide service area", …): big numbers without context, top-edge shine, uppercase labels. The facts are already stated in Services/Process/Areas. | Trust.tsx |
| F19 | #261, #263 | Trust cards: the hover lift moves the element that owns the hover, so the hitbox slides away and the animation loops. Keep the hover target still (outer wrapper) and move only the inner card. | Trust.tsx, lib/anim.tsx |
| F20 | #262 · S14 #351 | Remove the gradient that slides up on hover in trust cards. | Trust.tsx |
| F21 | #264 · S14 #363, #369, #371 | Custom estimates card: drop the eyebrow and fold the bold "Your estimate is free…" line into the paragraph, leaving title, one paragraph and the CTA. | PricingAreas.tsx |
| F22 | #268 | Map town labels sit on top of other dots. Show the label for the selected town only, offset away from neighbouring dots, with a halo. Town chips stay as the full list. | PricingAreas.tsx |
| F23 | #274, #277 | Map card title "Connecticut service map" + subtitle repeat each other and the paragraph beside the map. Remove both captions (the SVG keeps its accessible label) and the footnote under the map, which repeats "Do not see your town?". | PricingAreas.tsx |
| F24 | #279 | Remove the blur from the shared `Reveal` entrance (fade-up stays). Applies site-wide because every section uses the same component. | lib/anim.tsx |
| F25 | #280 | Remove the glowing gradient hairline along the top edge of the quote form panel. | Quote.tsx |
| F26 | #284, #287 | Footer repeats the name and tagline. Keep the description under the footer logo; the bottom bar keeps only the copyright line and back-to-top. | Footer.tsx |
| F27 | #285 | "Share this website" becomes an icon button with an accessible label and tooltip. | Footer.tsx |
| F28 | #292 | Remove the spray-canvas overlay drawn over the pressure-washing image (it also shows before the image loads). | Services.tsx |
| F29 | S14 #318 | Replace em dashes in visible copy (service eyebrows go away with F6; the town confirmation line and FAQ answers get commas or full stops). | data/content.ts, PricingAreas.tsx |
| F31 | #139 | Before/after tab labels ("House Siding" …) drop from black (900) weight to medium. | BeforeAfter.tsx |
| F30 | S14 #332 **[A]** | S13 headlines reveal word by word out of a clip mask (`overflow-hidden` per word). Same pattern as S14's "animates up from a bottom line". Keep the per-word stagger but fade/rise without the clip mask. | lib/anim.tsx, Hero.tsx |

Not applied:
- S14 #352 "overuse of icons" has no specific S13 element; flagged for Katie rather than applied site-wide.
- S14 #304, #306, #308, #345 and the empty S14 labels: no matching S13 pattern (see CRITIQUES.md).
- S14 #356 ("there is no map just points"): S13 has the same failure. Its outline and town dots stay at opacity 0 because their `whileInView` reveal never fires. They now animate in on mount and the decorative radial glow behind the map is removed (R3).

Brief guard: the brief asks for unusually heavy animation, before/after comparisons, animated services, process, trust, pricing, service area, FAQ and a working quote form. Hero video, parallax, particles, bubbles, marquee, magnetic buttons, tilt cards, scroll progress, map drawing, slider and accordion all stay; `../verification/REPORT.md` checks every brief requirement.

## Round 2: Katie's critiques of the rebuild (chat, 2026-11-15)

Logged as site `S13-ref` (separate from the original S13/S14 labels). Verbatim comments are in `../inputs/critiques/rebuild-chat.json`.

| ID | Critique (short) | Change | Commit |
| --- | --- | --- | --- |
| R1 | Titles too big/heavy vs subtitles | Section h2 ~2.6rem medium serif, hero h1 4.4rem semibold; subtitles up to 17px | round 2 |
| R2 | "in its best light" words merged | `HeroWords` keeps spaces (later: whole-line fade) | 15b83be, round 2 |
| R3 | No gradients/glows | All gradient backgrounds/text, glow shadows, blur blobs, radial map glow removed | round 2, map commit |
| R4 | No small uppercase labels | All uppercase/letter-spaced labels to sentence case, body font | round 2 |
| R5 | Remove "Scroll to explore" | Removed | round 2 |
| R6 | Logo: no uppercase sub-label, no glowing gradient | Flat tile, "The Suds Squad / Connecticut" | round 2 |
| R7 | Buttons too padded, bold | Smaller padding, medium weight | round 3 |
| R8 | Text shadow | No text/box shadows; outlined "Free quote" background text removed | round 3 |
| R9 | Fewer icons | Only functional icons kept (menu/close, prev/next, slider, FAQ toggle, share, back to top, spinner, checkbox tick) | round 3 |
| R10 | Duplicate CTAs | Quote CTA kept in header, hero, mobile menu and the form; service/pricing/process/footer duplicates and hero call button removed | round 3 |
| R11 | FAQ X off-centre | Lucide `Plus` rotated 45° with no scale; measured centre offset 0px | round 3 |
| R12 | Corners too round | Cards/panels `rounded-lg`, buttons/chips `rounded-md` | round 3 |
| R13 | Bold overused | font-black/extrabold/bold to medium; semibold only for h1 and logo | round 3 |
| R14 | Animations heavier than needed | No preloader, Lenis, particles, bubbles, droplets, gleams, mouse/scroll parallax, magnetic buttons, tilt cards, word-by-word reveals, floating chips, looping service effects, hover lifts or moving dashed lines. Kept: hero video, marquee, short fade/slide reveals, scroll-filled process line, panel/FAQ/form transitions | round 4 |
| R16 | White shows on overscroll | `html` gets the navy background and `overscroll-behavior: none` (no bounce past top/bottom) | round 4 |
| R15 | Before/after labels and slider inconsistent | "After" label styled like "Before"; handle and hint use the same dark chip; no backdrop blur | round 4 |

Brief tension: the brief asks for unusually heavy animation. R14 deliberately trades that for restraint; the remaining motion still covers the brief's hero video, marquee, scroll reveals, before/after slider and animated process line.
