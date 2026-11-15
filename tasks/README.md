# SlopBench Harbor tasks

Each task gives an agent a website brief in a bare Vite + React + TypeScript project and grades the built site.
The reward combines task-agnostic scores, which use the same checks and thresholds for every task, with task-specific scores from the brief's own checklist.

## Layout

```
tasks/verifier/         shared verifier, canonical copy (not a task: no task.toml)
  grade.mjs             serves the build, renders five widths (390 to 1920px) plus a resize sweep, scores, writes outputs
  probe.mjs             in-page facts and slop-pattern counts
  lib.mjs               helpers for task.mjs files (text matching, page roles, interaction attempts, mobile-menu check)
  test.sh               rebuilds /app, then runs the grader; a failed build scores 0
tasks/sync-verifier.sh  copies tasks/verifier/ into every task's tests/ (--check reports stale copies)
tasks/<task>/
  instruction.md        delivery rules + the brief, verbatim
  task.toml             Harbor config (schema 1.4); the verifier runs in the agent's container (shared mode)
  environment/          Playwright base image (Node + Chromium) + the template app in /app
  solution/solve.sh     oracle: installs the golden reference from solution/app/
  solution/app/         golden reference site (source + package-lock.json)
  tests/                copies of grade.mjs, probe.mjs, lib.mjs and test.sh, plus this task's own task.mjs
```

Harbor ships only a task's own `tests/` to the container, so every task carries a copy of the shared verifier.
Edit `tasks/verifier/`, never a task's copy, then run `tasks/sync-verifier.sh`.
`tests/` reaches the container only after the agent finishes, and `solution/` only reaches the oracle, so the agent never sees the golden site or the checks.

A task's `tests/task.mjs` exports:

- `requirements(views)` (required): the brief's checklist, a list of `{id, desc, score, detail}` with scores from 0 to 1. `views.<width>.pages` holds `{path, labels, facts}` for every page, home first, and `views.<width>.facts` is the home page's.
- `interactDesktop(context, url, handoffs, pages)` and `interactMobile(context, url, handoffs, pages)` (optional): the interactions the brief asks for, run at 1440 and 390px; `pages` lists `{url, path, labels}`, and `lib.mjs` `assignPages` maps them to roles such as menu or contact. Their results reach `requirements` as `views.desktop.interactions` and `views.phone.interactions`.
- `HANDOFF_URLS` (optional): a regex for outbound hand-offs the brief asks for (a WhatsApp booking, a mailto form service); matching requests are recorded in `handoffs` and blocked.
- `SLOP_EXEMPT` (optional): slop check ids the brief explicitly asks for, each mapped to the brief's words, e.g. `{ pulsing_dots: "brief: subtle moving particles" }`. An exempt check is still measured and reported but costs no points; an unknown id stops the grader.

## Reward

`/logs/verifier/reward.json` holds `reward = gate × (requirements + slop) / 2`, plus the components.

| Field | Scope | What it is |
| --- | --- | --- |
| `gate` | agnostic | the build renders a real page (at least 200 characters of text, at least 600px tall); otherwise the reward is 0 |
| `slop` | agnostic | the human-labelled slop patterns below, minus any the brief exempts |
| `baseline` | agnostic | mean of the checks every site must pass: no console errors, images load, no horizontal overflow at any width |
| `task` | task-specific | mean of the brief's checklist in `task.mjs` |
| `requirements` | both | mean over the task and baseline items together; this is what enters the reward |

- **task**: for zee-beauty-salon it covers content (name, address, headings, all ten services), interactions (gallery filter, lightbox, booking validation, WhatsApp hand-off with the booking details, confirmation, mobile menu), the brief's design spec (fonts, palette) and its "do not invent" rules (no prices, testimonials, social links or invented claims).
- **slop**: every pattern in `SLOP_CHECKS` (`grade.mjs`) comes from the SlopLabel labels: eyebrows, heading accent spans, `·` separators, pills, oversized rounding, numbered markers, em dashes, emoji and dingbat icons, gradient text, pulsing dots, tiny text, duplicate calls to action within one block, and broken controls.
  Each pattern is counted at five widths (phone 390, tablet 768, laptop 1280, desktop 1440, wide 1920) and the counts are averaged.
  A multi-page site is graded on every page: the home page plus up to 11 same-origin pages it links to (in-page `#section` anchors are not pages, `#/route` hash routes are).
  Counts add up across pages, except that the header, nav and footer are counted only on the home page, since they repeat on every page; rates (em dashes, tiny text) are pooled over all pages.
  Broken controls are measured differently: every page is narrowed from 1920 to 360px, the way a person resizes a browser, and every button, button-styled link, nav link or logo whose label wraps or overflows at some width counts once.
  A pattern costs `max(0, count − free) / per_point` slop points, so a few uses are free and every further use adds to the total instead of saturating.
  The points are summed over patterns, and `slop = 1 / (1 + points / 15)`: 0 points scores 1, 15 points scores 0.5, 45 points scores 0.25.
  A pattern the brief itself asks for is not slop: the task lists it in `SLOP_EXEMPT` and it costs nothing (the cleaning-company brief behind S13 and S14 asks for floating particles, so its task would exempt `pulsing_dots`).
  Counts are not normalised by page length: a padded page would dilute them, and every model gets the same brief, so lengths are comparable within a task.

`details.json` lists every check with its value, score and example elements, along with console errors and the outcome of each interaction.
The verifier also saves screenshots at every width (full-page for phone and desktop) and rendered HTML for phone and desktop, so the site can be regraded or judged later without rerunning the agent.

## Running the grader locally

```bash
npm install --prefix ~/.cache/slopbench-verifier playwright@1.64.1
npx --prefix ~/.cache/slopbench-verifier playwright install chromium
export PLAYWRIGHT_MODULE_DIR=~/.cache/slopbench-verifier
node tasks/zee-beauty-salon/tests/grade.mjs --url https://zee-beauty-saloon-xnfr.arcada.app --out reports/grade/S03
node tasks/zee-beauty-salon/tests/grade.mjs --dist path/to/dist --out reports/grade/mine
```

## zee-beauty-salon status

| Site | reward | task | baseline | slop | slop points |
| --- | --- | --- | --- | --- | --- |
| bare template | 0 | 0 | 0 | 0 | |
| S03 gpt-6-astra-max (arena 1st) | 0.60 | 0.96 | 1.00 | 0.24 | 47.6 |
| S04 kimi-k3.1-pro (arena 2nd) | 0.585 | 1.00 | 0.93 | 0.18 | 70.4 |
| golden reference (`solution/app`) | 1.00 | 1.00 | 1.00 | 1.00 | 0 |

S03's points come mostly from eyebrows (16.2), tiny text (12.4) and heading accents (7); its em dashes are all in hidden `<select>` options, which are not counted as copy. It also lacks a contact form and a Learn More on every service card.
S04's come mostly from eyebrows (29.9), pills (11.3), heading accents (7.8), tiny text (7.6), big rounding (7.1) and five buttons whose uppercase labels wrap at 360 to 480px or 1024 to 1100px; it also overflows a phone by 23px.
Both arena sites meet most of the brief, so the reward separates them from the golden site mainly on slop.
On the task-agnostic scores alone, S13 and S14 (two cleaning-company sites Katie labelled, which have no task yet) get slop 0.07 (214 points) and 0.14 (94 points); S13 drops to 0.12 (110 points) once its brief's floating particles are exempt from `pulsing_dots`.
On those two sites, `broken_controls` flags the same nav links, phone buttons and logo she marked as wrapping at 1024 to 1180px, and `duplicate_ctas` flags the hover-revealed second quote button in each S13 service row.

## rocksteady-campus status

The brief is the one tournament 104e4bb6 gave S05 and S06 (Rocksteady Campus, a Soweto takeaway: menu, cart and checkout, reviews, login, an admin CMS), kept verbatim.
The delivery header above it asks for a client-side build that keeps its data in localStorage, shows online payment as unavailable, and seeds an admin account the grader logs in with.
It attaches S06's logo and five hero banners; the brief's three reference screenshots are not available.
There is no golden reference yet, so `solution/app/` is missing and the oracle fails until it is built.

| Site | reward | task | baseline | slop | slop points |
| --- | --- | --- | --- | --- | --- |
| S05 gpt-6-astra-max | 0.62 | 0.93 | 1.00 | 0.30 | 34.9 |

S05's points come mostly from eyebrows (15.3) and tiny text (11.0, 57% of its text).
It misses the fifth hero banner, item availability on the menu, social links and a use-my-location option at checkout.

## Building a golden reference

`zee-beauty-salon/solution/app` was built by hand from the brief and the SlopLabel critiques of S03/S04: Vite + React + Tailwind 4 + motion, Cormorant Garamond and Inter, as the brief suggests.
Its photos are free Unsplash/Pexels images, credited in `solution/app/photo-credits.json`, and the site says they are illustrative rather than the salon's own work.
`reference-rubric.md` holds the judgement bar a golden site must also clear beyond the grader.

For a new task:

1. Build the site against `instruction.md` and `reference-rubric.md`, or run a strong agent in the task environment and use its output as a draft.
2. Label it in SlopLabel and fix what the labels find; repeat until a round finds nothing.
3. Copy the source (with `package-lock.json`, without `node_modules`/`dist`) to `solution/app/` and confirm the grader gives it about 1 at all five widths.
4. Put it against the arena sites in the Slop Arena for blind votes.
