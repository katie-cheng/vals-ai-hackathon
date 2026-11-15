# S06 fix plan

Each S06 critique from `../inputs/critiques/CRITIQUES.md` is mapped to one change. S05 labels (the other model's build of the same brief) join the group whose pattern they share.
The S13, S14 and S13-ref critiques and the rubric (`tasks/reference-rubric.md`, R1 to R25) are then applied as patterns.
Anything not named here stays as it is in `../inputs/live-app` (content, copy, assets, sections, routes, behaviour, the CMS).

Ambiguity flags: **[A]** = I had to interpret the critique; the interpretation is stated so Katie or Aidan can overrule it.

## Brief exceptions (the brief wins over the rubric)

Katie, in review: "prefer what the brief asks for specifically". These stay because the brief names them, even where a general rule would cut them:

| Kept | Brief wording | Rule it overrides |
| --- | --- | --- |
| Bold condensed uppercase display titles (Barlow Condensed 600), at smaller sizes than the original | "Bold typography with modern, readable fonts"; the headline is given in capitals ("BIG FLAVOUR. GENEROUS PORTIONS. REAL TOWNSHIP TASTE.") | S13-ref #461, #473, #490 (lighter, thinner titles); rubric on uppercase |
| Red filled CTAs, black/white/red palette | "Red call-to-action buttons against white and black backgrounds", "bold red branding" | S13-ref #479 (less saturated palette) |
| Rounded cards with a subtle shadow (10px radius, `shadow-sm`) | "Stylish cards with subtle shadows and rounded corners" | S13-ref #472, #501 are met by reducing the radius, not removing cards |
| Five hero photographs that crossfade, with thumbnails | "The Hero Banner must be 5 sliding images that are attached" | S13-ref #474 (lighter animation): the slide is now a crossfade |
| Two hero buttons: Order now, Explore our menu | "Prominent \"ORDER NOW\" and \"EXPLORE OUR MENU\" buttons" | S13-ref #470 (duplicate CTAs) |
| Testimonials with star ratings; promotion band; bestseller section | "Customer testimonials and ratings", "Special promotions and daily deals", "Best-selling and customer favourite meals", "Overall star rating" | S13 #255 (ratings as big numbers) |
| Footer social icons, cart icon with item count, sticky header | "Attractive footer with social media links", "a sticky navigation menu, shopping cart icon with item count, prominent Order Now buttons" | S13-ref #469 (fewer icons) |
| Hover on gallery tiles, lightbox | "responsive image grid with attractive hover effects and lightbox viewing" | S13 #262 (hover overlays) |
| Smooth scroll reveals | "Professional animations and smooth transitions", "Use subtle animations without compromising speed" | S13-ref #474: kept, opacity only |
| Gradients over photographs (hero vignette, page heroes, category tiles, menu-card photos, promo red-to-photo fade, item dialog, gallery and About photos) | Katie, in review: "the gradients are fine on this site" (rebuild critique R2) | S13-ref #463, #501; rubric on gradients |
| En dashes in "Monday – Saturday: 11:00 – 20:00" | The brief's own opening-hours text | em-dash rule (these are ranges, not asides) |
| Numbered checkout steps "1. Build your order, 2. Your details, 3. Track & enjoy" | "The ordering experience should be simple, with as few unnecessary steps as possible" (a real ordered sequence the user moves through) | S05 #458 (decorative numbering) |

## S06 and S05 labels

| Group | Critiques | Change | Files |
| --- | --- | --- | --- |
| F1 | #389, #397, #401, #406, #407 · S05 #296, #452, #456, #459, #460 | Every small uppercase eyebrow is removed, site-wide: `SectionHeading` and `PageHero` no longer take an eyebrow, the `.eyebrow` class is deleted, the hero-slide eyebrow field and all `*Eyebrow` content keys (and their CMS fields) are removed. The red dash to the left of the section eyebrow (#397) goes with it. The heading names the section. | UI.tsx, store.tsx, index.css, every page, ContentManager.tsx |
| F2 | #391 | Hero "cycles through callouts and the load-in is jumpy". The five slides now crossfade (opacity only, 700ms): all five photographs and all five copy blocks are stacked in one grid cell, so nothing mounts, slides or changes height; the first photograph is preloaded; under reduced motion the slider does not auto-advance. | Home.tsx, index.html |
| F3 | #394 **[A]** | "Subtitle feels repetitive": each slide keeps one title and one sentence; the eyebrow that restated them is gone (F1) and the trust strip under the buttons that repeated them a third time is removed (F9). Slide copy is otherwise unchanged. | Home.tsx, store.tsx |
| F4 | #395 | Two arrow controls side by side (a scroll-down arrow link next to the slide previous/next arrows): both arrow sets removed. The five thumbnails are the only slide control (each is a labelled button showing the photograph it selects). | Home.tsx |
| F5 | #396 **[A]** (no comment; the crop is the marquee) | The scrolling marquee band ("Rockville · Soweto · Est. with love · Fresh …") and the rotated vertical side label are removed: decorative repeated copy with dot separators. | Home.tsx, index.css |
| F6 | #398 | "Customise · Add · Enjoy" pill next to the menu filters removed. | Menu.tsx |
| F7 | #396, #398, #399 · S05 #294 | Dot separators: none left in the UI (footer, cart lines, option summaries, lightbox caption, admin). Lists use commas or separate lines. | all |
| F8 | #399 · S05 #294 | Repetitive footer: the "Rockville, Soweto · South Africa" line, the tagline and the footer CTA band are removed. The footer is logo, social links, navigation, contact links and copyright. The address is stated once on Home (location section) and once on Contact. | Layout.tsx, store.tsx |
| F9 | #405 · S05 #453, #455, #457, #458 | "Why Rocksteady" was three icon cards with ghost 01/02/03 numerals, an icon tile each and a caption each, beside a stats block. Now three text columns with a hairline above each (heading + one sentence), no icons, no numerals, no stats. The hero trust strip (avatars, "4.9 Local favourite", icon chips) is removed as "useless information, overuse of icons". | Home.tsx |
| F10 | #400 | Filtering the menu collapsed the grid, pulled the footer up and jumped the scroll position. The results area keeps a minimum height of one viewport, the grid no longer uses layout/scale/exit animation, and the filter bar keeps its place. `checks.py` asserts scrollY is unchanged and the footer stays out of view after filtering. | Menu.tsx |
| F11 | #408 | "VERIFIED LOCAL CUSTOMER" caption under each review removed, with the badge icon and the initial avatar. A review is stars, the quote and the name. | Home.tsx, Reviews.tsx |
| F12 | #409 **[A]** (no comment; the crop is the whole location section) | Read as the same problems as #405: eyebrow ("Come through"), icon tiles for address, hours and phone, duplicate buttons. Now a heading, one sentence, a three-row definition list (address, hours, phone) with dividers, one "Get directions" button and the map. | Home.tsx |
| F13 | #410 **[A]** (no comment; the crop is the header row) · S05 #289, #294 | Header: nav links and announcement were 10 to 11px uppercase with letter-spacing; now 14px sentence case and a 13px sentence-case announcement. "Order now" is a visible text button at every width (it no longer collapses to an icon; S05 #289), next to the cart icon with its count. The desktop link row shows from `lg`; below that a menu button opens the drawer. No label wraps from 360 to 1920px. | Layout.tsx |
| F14 | S05 #454 | Dots and pills on meal photographs: the "Featured" pill and uppercase category micro-label on `MenuCard` are removed; "Sold out" stays as a plain tag (brief: "Availability status"). Featured meals (brief: "featured meals") are still surfaced by the "Favourites only" filter on the menu and the favourites row on Home. | UI.tsx |

## S13 / S14 / S13-ref patterns

| Pattern (labels) | In S06? | Fix or reason |
| --- | --- | --- |
| Uppercase small eyebrows, tags with left-hand dots/dashes/slashes (S13 #38, #67, #75, #127, #168, #228, #258, #260, #266, #270, #281; S14 #307, #317, #322, #334, #350; S13-ref #464, #466) | Yes, about 40 across all pages, the cart, the item dialog, login and admin | F1; also the cart ("Your Campus order"), item dialog ("Made fresh for you", "Customise your meal"), login ("Welcome back"), account ("My Campus account") and admin labels. No text on the site combines uppercase with a small size; uppercase is only on display titles. |
| Pulsing dots, pulsing buttons, glow (S13 #40, #144, #230, #280; S14 #310, #347) | Yes: the pulsing `.live-dot` (route loader, admin header) | Pulse removed: the loader is a plain ring and the admin status dot is static. No glows in the original. |
| Big gap between title and subtitle; too much space under titles (S13 #46; S13-ref #495) | Mild | Heading-to-text gap is 12 to 16px, heading block to content 32 to 40px, everywhere. |
| Nav, logo, phone or button text wrapping at medium widths (S13 #51, #58, #121; S14 #374, #378, #381, #382, #304) | Yes: the original overflows by 377px on `/order` at 390px, and uppercase tracking made header labels tight | F13; `whitespace-nowrap` on every button; `/order` grid fixed (`minmax(0,1fr)`). Verified: no overflow and no wrapped header label on any route from 360 to 1440px, and 0 `broken_controls` in the grader sweep to 1920px. |
| Elements overlapping on scroll (S13 #61, #62; S14 #306, #308, #345) | Yes: the floating WhatsApp pill sat on top of the hero thumbnails and the mobile tab bar | Floating pill removed (WhatsApp stays in the footer, Contact and checkout). No scroll-linked transforms remain. |
| Marquee not spanning / marquee as decoration (S13 #73) | Yes (marquee) | F5: removed. |
| Glowing bullet dots, misaligned bullets (S13 #107) | No bullet lists in the original | n/a |
| Useless adjectives, repeated descriptions, description + bullets (S13 #126, #131, #274, #277, #264; S14 #342, #363; S13-ref #465, #486) | Yes: section intros restating the heading, footer tagline, hero strip, About stat and badge, card captions | F3, F8, F9, F11, F12; About loses the "100% Rockville heart" stat and the round "Proudly Soweto" badge; each fact is said once per page. |
| Duplicate CTAs to the same place (S13 #133, #134, #135; S13-ref #470) | Yes: footer CTA band repeated the header and hero buttons; location had three buttons; Why had its own order button | One primary action per section. Hero keeps two because the brief names both. Grader `duplicate_ctas` = 0. |
| Same card repeated many times → carousel (S13 #136) | No. The repeated cards are the 60 menu items, which the brief requires as a filterable grid | n/a |
| Bold where it should not be (S13 #139; S13-ref #467, #473) | Yes: `font-black`/`font-bold` throughout | Body and UI text is 400/500, emphasis 600. Buttons are medium weight, sentence case, 44px high, 20px side padding. Display titles stay bold (brief). |
| Inconsistent paired labels/controls (S13 #150; S13-ref #475) | Mild: filter chips on Menu, Order and Gallery had three different styles | One `.chip` / `.chip-active` style for every filter. |
| Before/after imagery mismatched (S13 #157, #170, #174, #190; S14 #327, #356) | No before/after or map graphic. Meal photographs repeat across items in the original | The same supplied photographs are kept (the brief supplies them); Home's favourites row is de-duplicated so one row never shows the same photograph twice. |
| Glow, corner gradients, shine, gradient on hover, text shadow (S13 #230, #235, #256, #262, #280; S14 #351; S13-ref #463, #468) | Yes: ghost "RSC" / "R58" / numeral text, coloured shadows under buttons, backdrop blur on sticky bars | Ghost text, coloured shadows and backdrop blur removed. Photo-legibility gradients stay (Katie R2, see exceptions). |
| Empty components, negative space (S13 #237; S14 #371; S13-ref #500) | Mild: section padding of 96 to 112px | Section padding 56/80px; no empty spacer elements. |
| Notification-looking badges for numbers; decorative numbering (S13 #239; S14 #346; S05 #458) | Yes: ghost numerals in Why cards | F9. The cart count badge is a real count (brief). |
| Layered animated lines / overlays on images (S13 #246, #292) | No | n/a |
| Big numbers without context, stat tiles (S13 #255) | Yes: About "100%", Why stats | Removed. The Reviews page average (4.8 from the listed reviews) stays: it is computed from the reviews shown beside it. |
| Hover hitbox loops, lift on hover (S13 #261, #263) | Yes: cards lifted and photos zoomed on hover | No element moves or scales on hover; hover changes colour or opacity only. Gallery tiles dim and show a view icon (brief: hover effects). |
| Overlapping text (S13 #268; S14 #369) | No | n/a |
| Blur on load-in, slide in from left, reveal from a clip line (S13 #279, #297; S14 #332; S13-ref #474) | Yes: `Reveal` used y-offset + stagger delays, drawers used springs, filter grids used layout/scale | `Reveal` is opacity only, 0.5s, no stagger. Drawer and dialog use one duration and easing. No blur, no springs, no scale. |
| Share text → icon; fewer icons (S13 #285; S14 #352; S13-ref #469) | Yes: icon tiles in Why, Location, Contact, About, Reviews, checkout, admin stats; arrows on most buttons | Icons remain only where they are the control (cart, account, menu, close, search, quantity, socials, lightbox arrows, password reveal, mobile tabs, admin navigation). One arrow remains, on the hero primary button (S13-ref #497). |
| Scroll hijack, dead buttons (S14 #338, #340) | No | Every control is exercised by `verification/tools/checks.py`. |
| Em dashes (S14 #318) | Yes: 3.3 per 1000 words on Home, more in admin | None left in copy or UI. |
| Title too big relative to text (S13-ref #461) | Yes: titles up to 96px | Hero 68px, section titles 40px, page titles 56px, card titles 20px (desktop); see DESIGN-SYSTEM.md. Weight stays (brief). |
| Words merged (S13-ref #462), misaligned toggle icon (S13-ref #471) | No | n/a |
| Corners less rounded (S13-ref #472) | Yes: 24 to 40px radii and pills | 6px controls, 10px surfaces, full only for circles (icon buttons, count badge, tracker steps). Grader `pills` and `big_rounding` = 0. |
| Overscroll shows white (S13-ref #476) | Yes: white body behind a black header and footer | `html` background is black and `overscroll-behavior: none`. |
| Hero image not ready on first paint; layout shift on reload (S13-ref #477, #485, #487) | Yes: Google Fonts swap, lazy routes replaced a short loader (CLS 0.35 on every route except Home) | Fonts self-hosted, preloaded, with metric-matched fallbacks; first hero photograph preloaded; route loader fills the viewport. CLS 0 on all eight routes at 1440 and 390px. |
| Professional polish, some capitals allowed (S13-ref #478, #488) | n/a | Capitals are used for display titles only. |
| More side padding, narrower content (S13-ref #480, #493) | Mild | Container 1200px with 20/32/48px gutters (was 1280px). |
| Tasteful sans (S13-ref #481) | Already Manrope + Barlow Condensed | Kept, self-hosted. |
| Pills duplicated by arrows (S13-ref #482) | Yes (hero) | F4. |
| Consistent grid; square elements balanced (S13-ref #483, #503, #504) | Yes: chips of uneven height, 36/40/44px icon buttons | `box_audit.py` run at 1440 and 390px; sibling boxes share width, height and padding; icon buttons are 40px. |
| Logo (S13-ref #484) | The brief supplies the logo | Kept. |
| Subtle gradients / grain / text with dividers instead of cards (S13-ref #489, #501, #502, #505) | Partly | Why, Location, Contact details and About values are text with dividers, not cards. Photo gradients kept (R2). No grain added: the original has a faint dot texture on cream sections, kept. |
| Thin sans / serif titles (S13-ref #490, #492, #496) | Conflicts with the brief | Not applied (see exceptions). |
| Photos tinted over (S13-ref #491) | Mild: 70% black over category photos | Overlays are the original's bottom-up gradients only; the upper part of each photograph is clear. |
| Hero height (S13-ref #494) | Yes: `100svh`, min 760px | Hero is content-height (about 560px desktop). |
| Arrow on hero CTA (S13-ref #497) | Yes | Kept on "Order now" in the hero only. |
| Design system (S13-ref #498) | No system in the original | `DESIGN-SYSTEM.md` + tokens in `src/index.css`. |
| Minimal loader (S13-ref #499) | Original loader had pulsing text | Text-free ring, no pulse. |
| Hero vignette (S13-ref #506) | Yes | Original vignette kept. |

## Rubric re-check of the finished site

Checked against R1 to R25 on the built site at 390, 768, 1280, 1440 and 1920px. Exceptions are the brief exceptions above. Remaining judgement calls:

- The admin CMS (a critical brief requirement) keeps its dashboard layout with navigation icons; it is a tool, not a marketing page. It received the same token pass, the eyebrow, dot, em-dash and pulse removals, and the removal of the decorative stat icon tiles.
- The demo administrator sign-in hint on `/login` is in the original public bundle and is kept so the CMS stays reachable.

## Rebuild critiques (chat review)

Recorded in `../inputs/critiques/rebuild-chat.json`.

| # | Critique | Change |
| --- | --- | --- |
| R1 | "prefer what the brief asks for specifically" | Brief exceptions table above: bold condensed uppercase titles, red CTAs, rounded cards with subtle shadows, the five-image hero, both hero buttons and the rest stay. |
| R2 | "the gradients are fine on this site" | Restored the original's gradients on the hero vignette, page heroes, category tiles, menu-card photos, promo band (red-to-photo fade), item dialog, gallery and About photographs. Ghost text stays removed. |
