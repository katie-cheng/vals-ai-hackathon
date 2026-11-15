# SlopBench Harbor tasks

Each task gives an agent a website brief in a bare Vite + React + TypeScript project and grades the built site.
The reward combines two scores: how fully the site meets the brief, and how few of the team's human-labelled slop patterns it shows.

## Layout

```
tasks/<task>/
  instruction.md        delivery rules + the brief, verbatim
  task.toml             Harbor config (schema 1.4); the verifier runs in the agent's container (shared mode)
  environment/          Playwright base image (Node + Chromium) + the template app in /app
  solution/solve.sh     oracle: installs the golden reference from solution/app/
  solution/app/         golden reference site (source + package-lock.json)
  tests/test.sh         rebuilds /app, then runs the grader; a failed build scores 0
  tests/grade.mjs       generic: serves the build, renders five widths (390 to 1920px) plus a resize sweep, scores, writes outputs
  tests/probe.mjs       generic: in-page facts and slop-pattern counts
  tests/task.mjs        task-specific: the brief's checklist and the interactions it asks for
```

`tests/` reaches the container only after the agent finishes, and `solution/` only reaches the oracle, so the agent never sees the golden site or the checks.
When a second task is added, copy `grade.mjs` and `probe.mjs` unchanged and write a new `task.mjs`.

## Reward

`/logs/verifier/reward.json` holds `reward = gate × (requirements + slop) / 2`, plus the components.

- **gate**: the build renders a real page (at least 200 characters of text, at least 600px tall). Otherwise the reward is 0.
- **requirements**: the mean over the brief's checklist in `task.mjs`. It covers content (name, address, headings, all ten services), interactions (gallery filter, lightbox, booking validation, WhatsApp hand-off with the booking details, confirmation, mobile menu), the "do not invent" rules (no prices, testimonials, social links or invented claims), and health (no console errors, images load, no horizontal overflow on a phone).
- **slop**: every pattern in `SLOP_CHECKS` (`grade.mjs`) comes from the SlopLabel labels: eyebrows, heading accent spans, `·` separators, pills, oversized rounding, numbered markers, em dashes, emoji and dingbat icons, gradient text, pulsing dots, tiny text, duplicate calls to action within one block, and broken controls.
  Each pattern is counted at five widths (phone 390, tablet 768, laptop 1280, desktop 1440, wide 1920) and the counts are averaged.
  Broken controls are the exception: one page is narrowed from 1920 to 360px, the way a person resizes a browser, and every button, button-styled link, nav link or logo whose label wraps or overflows at some width counts once.
  A pattern costs `max(0, count − free) / per_point` slop points, so a few uses are free and every further use adds to the total instead of saturating.
  The points are summed over patterns, and `slop = 1 / (1 + points / 15)`: 0 points scores 1, 15 points scores 0.5, 45 points scores 0.25.
  Styles the brief itself asks for (glass effects, rounded corners, Lucide icons, Cormorant/Playfair headings) are not penalised.

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

| Site | reward | requirements | slop | slop points |
| --- | --- | --- | --- | --- |
| bare template | 0 | 0 | 0 | |
| S03 gpt-6-astra-max (arena 1st) | 0.59 | 0.96 | 0.22 | 53.8 |
| S04 kimi-k3.1-pro (arena 2nd) | 0.585 | 0.99 | 0.18 | 70.4 |
| golden reference (`solution/app`) | 1.00 | 1.00 | 1.00 | 0 |

S03's points come mostly from eyebrows (16.2), tiny text (12.4), heading accents (7) and em dashes (6.2); it also lacks a contact form and a Learn More on every service card.
S04's come mostly from eyebrows (29.9), pills (11.3), heading accents (7.8), tiny text (7.6), big rounding (7.1) and five buttons whose uppercase labels wrap at 360 to 480px or 1024 to 1100px; it also overflows a phone by 23px.
Both arena sites meet most of the brief, so the reward separates them from the golden site mainly on slop.
On S13 and S14, two cleaning-company sites Katie labelled, `broken_controls` flags the same nav links, phone buttons and logo she marked as wrapping at 1024 to 1180px, and `duplicate_ctas` flags the hover-revealed second quote button in each S13 service row.

## Building a golden reference

`zee-beauty-salon/solution/app` was built by hand from the brief and the SlopLabel critiques of S03/S04: Vite + React + Tailwind 4 + motion, Cormorant Garamond and Inter, as the brief suggests.
Its photos are free Unsplash/Pexels images, credited in `solution/app/photo-credits.json`, and the site says they are illustrative rather than the salon's own work.
`reference-rubric.md` holds the judgement bar a golden site must also clear beyond the grader.

For a new task:

1. Build the site against `instruction.md` and `reference-rubric.md`, or run a strong agent in the task environment and use its output as a draft.
2. Label it in SlopLabel and fix what the labels find; repeat until a round finds nothing.
3. Copy the source (with `package-lock.json`, without `node_modules`/`dist`) to `solution/app/` and confirm the grader gives it about 1 at all five widths.
4. Put it against the arena sites in the Slop Arena for blind votes.
