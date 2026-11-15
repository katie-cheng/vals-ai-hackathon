# S06 "Rocksteady Campus": live-app dossier

Source of truth: https://rocksteady-campus-oj1m.arcada.app (Design Arena tournament `104e4bb6-f582-4005-ade0-55d4a41ccf30`, model `kimi-k3.1-pro`).
Nothing here is guessed: everything comes from the deployed bundle or from a browser driving the live site.

## How it was captured
1. Downloaded the deployed `index.html`, the entry bundle (`/assets/index-BbgvWssR.js`), the CSS bundle (`/assets/index-iO6dNovt.css`), the lazy route chunks (`Menu`, `About`, `Gallery`, `Reviews`, `Contact`, `Order`, `Portal`, `Admin`, `OrderTracker` and the shared icon chunks), every image the bundle references, the favicon and `robots.txt`.
2. Converted the bundles' `jsx()` calls back to JSX (`../../tools/decompile/dec.mjs`), renamed minified bindings from what they are used for (`names.json`: lucide icons from their ids, `motion`/`AnimatePresence` from framer-motion, react-router exports, the store's functions), and split the code into the files named by its `data-source-loc` attributes. Local variables inside components keep their minified one-letter names. Result: `../live-app/`, a runnable Vite project.
3. Checked fidelity: full-page screenshots of `../live-app` (vite preview) against the live site at 1440 and 390px are pixel-identical on every route except the hero slider (timing) and the Google Maps iframe.
4. Drove the live site with Playwright at 1440, 1280, 1024, 768 and 390px (`../../tools/dossier_capture.py`) to record header behaviour and, per route and section, components, fonts, sizes, colours, radii, small-uppercase text and verbatim copy (`live-capture.json`, rendered as `DOSSIER-generated.md` by `../../tools/build_dossier.py`).
5. Screenshots of the live site: `screens/1440/*.jpg`, `screens/390/*.jpg` (one per route, plus `home-NN-*.jpg` per home section and `header.jpg`).

Deviations from the original deployment, all in `../live-app`:
- Design Arena's injected recording/analytics scripts are not reproduced.
- The `data-source-loc` attributes are not kept in the JSX; the file split follows them instead.
- Fonts load from Google Fonts, as in the original.

## Stack (from the bundle)
React 19, react-router 7 (lazy routes), framer-motion 12, lucide-react, Tailwind v4. No backend: every feature runs in the browser.

## Structure
- `App.tsx`: `StoreProvider` → router. `Layout` wraps `/`, `/menu`, `/about`, `/gallery`, `/reviews`, `/contact`, `/order`, `/login`; `/admin` has its own shell; `*` is a not-found page. All pages except Home are lazy chunks behind a loader.
- `lib/store.tsx`: seed data (60 menu items in 8 categories, 5 hero slides, reviews, gallery, promotions, business settings, all page copy as `content` keys) and the store. State persists in `localStorage` (`rocksteady-campus-data-v3`, `-cart-v2`, `-session-v2`).
- `components/Layout.tsx`: announcement strip, header, mobile drawer, bottom tab bar (mobile), cart drawer, item customisation dialog, footer, floating WhatsApp pill, toasts.
- `components/UI.tsx`: `Logo`, `Reveal`, `SectionHeading` (eyebrow + title + text), `PageHero`, `MenuCard`, `Stars`, `EmptyState`.
- `pages/`: `Home`, `Menu`, `About`, `Gallery`, `Reviews`, `Contact`, `Order` (browse → details → confirmation with tracker), `Portal` (customer and administrator sign-in, registration, recovery, account), `Admin` (11 views: dashboard, orders, menu, page content, media, gallery, reviews, customers, promotions, business settings and reports).
- Accounts are client-side. The administrator account is a fixed demo login compiled into the public bundle; customer accounts are stored in `localStorage`.

## Design tokens (original)
- Fonts: Barlow Condensed 700 to 900 uppercase for titles (72 to 96px section and page titles, 88px hero), Manrope 400 to 800 for everything else. Google Fonts.
- Colours: brand red `#f1001f`, black, white, cream `#f6f4ef`.
- Small text: 9 to 11px uppercase with letter-spacing for the announcement strip, nav links, eyebrows, buttons, chips, badges and captions (on Home at 1440px: 8 of 8 header text nodes, 7 under 12px).
- Radii: pills (`rounded-full`) for buttons, chips and badges; 16 to 40px on cards, photographs and panels.
- Decoration: ghost 288px text ("RSC", "R58", 01/02/03), gradients over photographs, backdrop blur on sticky bars, a scrolling marquee band, a rotated side label, a pulsing `.live-dot` (route loader, admin header), a floating WhatsApp pill.
- Motion: `Reveal` fades up with staggered delays; cards lift and photographs zoom on hover; grids use framer-motion `layout` animation when filtered; drawers use springs; the hero swaps slides by mounting and unmounting.

## Behaviour
- **Header**: sticky. Desktop nav from 1280px; a menu button below that. Under 768px "Order now" disappears and only a bag icon remains, with a bottom tab bar.
- **Home**: hero slider (5 slides, auto-advance, previous/next arrows, thumbnails, a separate scroll-down arrow), marquee, categories, favourites, promotion, "Why Rocksteady" icon cards, reviews, location with map, footer CTA band.
- **Menu**: search, category chips, favourites toggle; cards open the customisation dialog; filtering animates the grid and moves the page (label #400).
- **Order**: three steps; delivery/collection, delivery fee and minimum from settings, promo codes, geolocation pin, cash payment only (card shown as not configured); confirmation with an order number and a live tracker. Overflows horizontally at 1100px and below (`verification/reports/checks-original.json`).
- **Gallery**: category chips, hover overlay, lightbox with keyboard arrows.
- **Reviews**: average and distribution, sort, submission form (reviews wait for moderation).
- **Contact**: details, Google map, directions, call, WhatsApp, enquiry form.
- **Admin**: everything above is editable; edits appear on the public pages immediately.

Per-route measurements are in `DOSSIER-generated.md`.
