# S13 "Suds Squad Immersive": live-app dossier

Source of truth: https://suds-squad-immersive-ann4.arcada.app (Design Arena tournament `3628161e-e393-4d07-b3a3-e5546efe4bf5`, model `muse-spark-1.3-max`).
Nothing here is guessed: everything comes from the deployed bundle or from a browser driving the live site.

## How it was captured
1. Downloaded the deployed `index.html`, JS bundle (`/assets/index-CjKIEJn9.js`), CSS bundle (`/assets/index-9DVO-iZV.css`), every image and video the bundle references, and the favicon.
2. Converted the bundle's `jsx()` calls back to JSX, renamed the minified bindings from what they are used for (icon names from their lucide ids, `motion`/`useScroll` from framer-motion, etc.), and split the code into the files named by its `data-source-loc` attributes. Result: `../live-app/`, a runnable Vite + React + TS + Tailwind v4 project.
3. Checked fidelity: per-section screenshots of `../live-app` (vite preview) against the live site at 1440 and 390 px differ by a mean of <1/255 per pixel everywhere except the Services section, which contains a random particle canvas.
4. Drove the live site with Playwright at 1440, 1280, 1024, 768 and 390 px (`../../tools/dossier_capture.py`) to record header behaviour, per-section components, fonts, sizes, colours, radii and verbatim copy (`live-capture.json`, rendered as `DOSSIER-generated.md`).
5. Section screenshots of the live site: `screens/1440/*.jpg`, `screens/390/*.jpg` (`full.jpg` is the whole page).

Deviations from the original deployment, all in `../live-app`:
- Videos re-encoded (1080p, 28 MB → 1280/960 px, 2.3 MB) to keep the repo small; same clips and durations, no audio (the hero video is muted on the site).
- The bundle posts the quote form to `POST /api/quotes` on Arcada's backend, which isn't public. `server/quotes.ts` is a Vite dev/preview middleware that uses the same validation rules and error messages as the live endpoint (taken from its 400 responses) and appends accepted requests to `.data/quotes.jsonl`. It doesn't send email.
- Design Arena's injected recording/analytics scripts are not reproduced.
- The `data-source-loc` attributes are not kept in the JSX; the file split follows them instead.

## Stack (from the bundle)
React 18 · framer-motion (`motion`, `useScroll`, `useTransform`, `useSpring`, `useMotionValue`, `useInView`, `AnimatePresence`) · Lenis smooth scroll (`lerp: 0.09`; in-page anchor clicks use `scrollTo(target, { offset: -70, duration: 1.4 })`) · lucide-react icons · Tailwind v4.

## Structure
`App.tsx` renders `Preloader` → `ScrollProgress` → `Header` → `main` (`Hero` `#top`, `Services` `#services`, `BeforeAfter` `#results`, `Process` `#process`, `Trust` `#why-us`, `PricingAreas` `#pricing` + `#areas`, `Faq` `#faq`, `Quote` `#quote`) → `Footer`.
Shared building blocks live in `lib/anim.tsx` (`SplitWords` word-mask headline reveal, `Reveal` blur fade-up, `Magnetic` buttons, `Tilt` 3D cards, `CountUp`) and `lib/fx.tsx` (`Bubbles`, `DropletsFx`, `Gleams`, `ParticleCanvas`, `SprayCanvas`, `ScrollProgress`, `WaveDivider`).
All copy and data are in `data/content.ts`: 6 services, 6 before/after comparisons, 4 process steps, 6 trust items, 4 stats, 5 prices, 17 representative towns, 10 FAQs, and the contact details (`860-578-6207`, `kellen0734@gmail.com`).

## Design tokens
- Fonts: Archivo (variable width/weight, body and display; weights 400–900, mostly 900 for labels and buttons), Fraunces (serif, `.font-serif-d`, weight 600 for section headings). Loaded from Google Fonts.
- Colours: page `#04141f` (`--color-abyss`); deep panels `#06283d`; light sections (`#results`, `#pricing`) `#f5fafd` with `#04141f` text; accents Tailwind cyan-200/300/400 and sky-400/500; body text `sky-100` at 70–75% opacity; errors rose-300.
- Type scale (1440 px): hero h1 99.2 px (`lg:text-[6.2rem]`, 13.5vw on mobile), section h2 60 px (`sm:text-6xl`) or 48 px, h3 serif 36 px, body 15–15.5 px, small labels 11–13 px, uppercase with 0.16–0.35em tracking.
- Radii: pills (`rounded-full`) for buttons/chips/labels, 16 px inputs/icon tiles, 24–32 px cards and media frames.
- Surfaces: `.glass` (white 7% + 18 px backdrop blur + white 14% border), `.glass-strong` (#06283d 55% + 22 px blur), glow shadows like `shadow-[0_12px_36px_-8px_rgba(34,211,238,.9)]`.
- Breakpoints: Tailwind defaults (sm 640, md 768, lg 1024, xl 1280). Desktop nav appears at `lg`; at 1024 px its links wrap onto two lines (see header table in `DOSSIER-generated.md`).
- Reduced motion: a `prefers-reduced-motion` media query cuts CSS animation/transition time to 0.01 ms; `REDUCED` in `lib/anim.tsx` disables Lenis, the preloader and the JS-driven effects.

## Behaviour by section (desktop unless noted)
- **Preloader**: full-screen droplet/percentage loader (~1.6 s), page scroll locked until it ends.
- **Header**: fixed; transparent until scrolled, then blurred dark bar; scroll progress bar on top. Logo, 7 anchor links, phone pill, "Get a free quote" magnetic button. Below `lg`: menu button opening a full-screen panel.
- **Hero**: looping muted video (`hero-wash.mp4`, poster `hero-house.jpg`) with scroll parallax/zoom, particle canvas, bubbles, gleams, mouse-parallax floating cards (desktop). Pill badge with a pinging dot, two-line h1 (line 2 is meant to show as shimmering gradient text but renders invisible; see critique #46), lead paragraph, two CTAs, three feature chips that move up faster than the CTAs while scrolling, "Scroll to explore" cue, and a scaled marquee of service names along the bottom edge.
- **Services**: heading block, then 6 alternating image/text rows. Each image has a hover tilt, an animated "visual" overlay (spray canvas or droplets), an eyebrow badge and a CTA; each text column has a numbered uppercase eyebrow, serif headline, description, 4 glowing-dot bullets sliding in from the left, a price note and the same CTA again.
- **Before/after** (`#results`, light): tabs for the 6 comparisons, drag/keyboard slider (pulsing handle, "Before"/"After" labels, idle auto-sweep animation), category eyebrow + description, prev/next buttons and dots. Interior windows and patio use one photo with a CSS filter as the "before".
- **Process**: 4 alternating steps on a vertical track with a scroll-filled gradient line and a moving dashed line on top; each step has a gradient glowing icon tile with a white number badge, and a glass card with a tag pill, title and text.
- **Trust** (`#why-us`): faint background video (`window-clean.mp4`), 4 count-up stat tiles, 6 tilt cards with hover gradient.
- **Pricing** (light): intro, a dark "Custom estimates" card, 5 price cards with hover lift/rotate.
- **Areas**: SVG Connecticut outline that draws itself in, 17 clickable town dots (labels for the selected town and every 4th town), town chips that select the same state, a confirmation line, CTA.
- **FAQ**: 10-item accordion (first open), contact card.
- **Quote**: contact cards plus form (name, phone, email, address, town, ZIP restricted to 06xxx, services multi-select, stories, preferred contact, notes, honeypot), inline validation, success panel with reference number.
- **Footer**: large CTA band, logo + description, share button (Web Share API / copy link), nav and contact columns, bottom bar repeating the name and tagline, back-to-top.

Mobile (390 px): single column; header shows logo, phone icon and menu button; hero cards and chips hidden; service rows stack image above text; the spray canvas overlay renders on the service images.
