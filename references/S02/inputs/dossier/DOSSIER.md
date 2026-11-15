# S02 dossier: the original site, before any change

Site: "It Beginner Platform", `gemini-3.8-flash`, Design Arena tournament `05097c11-f54e-4ad4-928e-a1236623eecc`,
generation `b7b1997c-8b91-40ea-bc3f-96f2a21da06d`, placement 2, live at https://it-beginner-platform-jqu1.arcada.app.
Brief: `../brief.md`. Generated tables (per-route metrics, class inventory, verbatim copy): `DOSSIER-generated.md`.
Raw capture: `live-capture.json`. Full-page screenshots of the live site: `screens/1440`, `screens/390`.

## How `../live-app` was reconstructed

1. Downloaded the deployed `index.html`, `assets/index-D1sQl4GE.js` (minified bundle), `assets/index-AU77lSmg.css` and `favicon.svg`.
2. `tools/reconstruct/decompile.mjs` (Babel) turns the bundle's `jsx()` calls back into JSX, undoes statement-level minification,
   renames the minified top-level bindings with `names.json`, and splits the code into files using the `data-source-loc` attributes
   the build left on its elements. Local variable names inside components stay minified (`h`, `v`, `T`).
3. The app was assembled as a Vite + React 19 + React Router 7 + Tailwind 4 project (`lucide-react` pinned to 0.577.0, the version whose
   icon paths match the bundle; `canvas-confetti`). Four type annotations were added so `tsc` passes.
4. The Design Arena recording and analytics scripts injected into the deployed HTML are left out.

Fidelity (`tools/fidelity.py`, live vs `vite preview` of `live-app`, 13 routes at 1440 and 390px): the normalised `#root` DOM is identical on
every route except the lesson player, whose timer differs by a second between captures. Mean pixel difference is 0.000 to 0.002 on static
routes. Known differences: the rebuilt Tailwind CSS is 60.7 kB against 62.2 kB deployed (serialisation and unused utilities).

## What the site is

A single-page learning platform for the AjinLab "IT Beginner" course, with all data in the bundle and state in `localStorage`
(`itb_progress`, `itb_notes`, `itb_certificates`, `itb_quiz_attempts`, ...). It ships a demo account (Alex Chen, 3 of 42 lessons done,
a 5-day streak, 3 bookmarks, 2 notes, 1 certificate) and a student/admin role switch.

| Route | Component | Content and behaviour |
| --- | --- | --- |
| `/` | `LandingPage` | hero (pill, gradient headline, 3 CTAs, stat row, code card with a "Run JS" button), 6 feature cards, syllabus accordion (6 chapters), CTA band |
| `/dashboard` | `DashboardPage` | 4 stat tiles, resume card, 6 chapter cards with progress, bookmarks, recent notes, cheatsheets card |
| `/courses` | `CoursesPage` | chapter filter, 6 chapter cards with 42 lesson cards, bookmark toggle, quiz and certificate links |
| `/lesson/:id` | `LessonPlayerPage` | simulated video player (timer, seek, speed, mute, theater, shortcuts), chapter list, tabs: overview, scratchpad, notes, Q&A, transcript |
| `/playground` | `PlaygroundPage` | HTML/CSS/JS editor, sandboxed iframe preview, console, presets, save, export |
| `/search` | `SearchPage` | keyword, chapter and status filters over the 42 lessons |
| `/quizzes`, `/quiz/:chapterId` | `QuizzesPage`, `QuizDetailPage` | 6 quizzes; answer, submit, score, explanations, retake; passing issues a certificate and fires confetti |
| `/certificates`, `/certificate/:code` | `CertificatesPage`, `CertificateDetailPage` | earned list, per-chapter progress; printable certificate (renders for any code) |
| `/resources` | `ResourcesPage` | 4 handbooks with copyable snippets |
| `/admin` | `AdminPage` | 5 hard-coded KPI tiles, roster of 6 mock students, role toggle, filter |
| `/profile` | `ProfilePage` | account, 4 stat tiles, role switch, JSON export, reset with confirm |

Shell: sticky `Navbar` (logo tile + "LMS" tag, search box, 6 icon links, streak pill, role switch, avatar menu) and a 4-column `Footer`.
Deep links return 404 on the Arcada host; routes are reachable only by in-app navigation.

## Design tokens observed

- Fonts: the HTML loads Cinzel, Inter and JetBrains Mono from Google Fonts. Inter is the body face, Cinzel is used only on the certificate.
- Type sizes by use (1440px, all routes): 12px is the most common size on every route, then 10 to 11px; headings 24 to 60px.
  15% of the landing page's words are set below 12px. Weights: `font-bold` / `extrabold` / `black` on 180+ elements.
- Colour: page `#0b0f19`, surfaces slate-900 / 950, text slate-100 to 400. Accents by meaning: sky (primary), indigo (with sky in gradients),
  emerald (done), amber (quizzes, certificates, streak), purple (admin), rose (errors).
- Radii: 8px (`rounded-lg`), 12px, 16px, 24px (`rounded-3xl` sections) and full pills.
- Effects: gradient text in the hero, gradient buttons, bands and progress bars, a blurred glow blob behind the hero, coloured shadows,
  `backdrop-blur` on the header and code card.
- Motion: `animate-pulse` (streak flame in the header and dashboard, player status dot), `animate-ping` (footer dot), `hover:scale-105` /
  `hover:translate-y` on buttons and cards, confetti. `animate-in fade-in` is on four elements but the CSS has no keyframes for it, so it never runs.
- Emoji: one per chapter (rendered wherever a chapter is listed), in the footer lists, handbook titles, quiz result, instructor badge and streak tag.

## Problems measured on the original

- The header row does not fit: document width is 1589px in a 1440px viewport, 1509px at 1280px, 1439px at 1024px, and 368px at 360px.
- Slop grader (landing route): 31.3 points (emoji 16, dot separators 7.5, tiny text 2.6, broken controls 2, gradient text 1, heading accent 1, pulsing dots 0.6, pills 0.3, rounding 0.3).
- 48 SlopLabel labels, all on `/`: header (10), hero (5), features (8), syllabus (15), CTA band (5), footer (5). See `../critiques/CRITIQUES.md`.
