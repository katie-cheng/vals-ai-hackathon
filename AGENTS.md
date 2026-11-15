# SlopBench — agent guide

SlopBench measures how much "AI slop" frontier models produce when they build websites. A model gets a website brief, builds the site, and a grader scores the result for slop: generic, templated, decorative-without-purpose design and broken or fake content. It is being built for the Vals AI hackathon (team org `hackathon-what-does-the-fox-say-c2f1ff2066`). Demos are Sunday 2 PM.

Read `MEMORY.md` before starting work and add to it when you make or learn a decision (see "Shared memory" below).

## Deliverables (hackathon requirements)
- GitHub repo with the tasks and a README explaining how to run them. The first paragraph of the README must be written by a human.
- Tasks in [Harbor format](https://docs.harborframework.com/tasks/overview), uploaded to Valkyrie with `valkyrie dataset push`.
- Results: frontier model scores in the README, graphs plus tables.
- Optional: traces, a Valkyrie run ID, and a concrete failure mode the benchmark exposes.

## Tooling
```bash
uv tool install valkyrie-cli
valkyrie login                                   # only if not signed in
valkyrie org use hackathon-what-does-the-fox-say-c2f1ff2066
valkyrie dataset push slopbench/<dataset> ./tasks --tag v1
valkyrie run start --agent claude_code-v1.0.0 \
  --dataset slopbench/<dataset>@v1 \
  --model anthropic/claude-sonnet-4-6 --provider modal \
  -s ANTHROPIC_API_KEY anthropic-api-key --concurrency 1 --connect
valkyrie tui                                     # watch runs; whole team sees them
```
Built-in harnesses: Claude Code (`claude_code-v1.0.0`), Codex (`codex-v1.0.0`), mini-SWE-agent. Docs: https://docs.valkyrie.vals.ai/

## What exists
| Path | What |
| --- | --- |
| `data/website-prompts-db/` | 1 shared system prompt + 26 scenario briefs (verbatim), 191 extracted requirements, as SQLite/JSON/JSONL/CSV. Rebuild with `python3 build_db.py`. |
| `docs/sessions.md` | Summary of the Devin sessions so far. |
| `docs/grader-design.md` | Grader and classifier design notes (from the Claude discussion). |

Not in this repo yet (lives on Katie's Devin VM, session `15f198f597984f9c828909d1906a42ad`): mirrors and screenshots of 30 Design Arena sites, a critique sheet (S01–S30), a draft Playwright verifier, one example Harbor task (ZEE salon prompt), and the **SlopLabel** annotation tool (in progress).

### Prompt set
26 briefs in 8 categories: portfolios/personal, company/local business, landing pages, rebuild-style (heavily specified), dashboards/data, interactive apps/3D/games, general. Each has `task_id` (e.g. `07-indian-restaurant`), `specificity` (vague <15 words, moderate <60, heavy), named `libraries`, and a `requirements` checklist usable for a brief-fulfillment score. The system prompt asks for **one self-contained HTML file** rendered in a sandboxed iframe (CDN Tailwind/Three.js/D3/Recharts allowed), no console errors, responsive 360px→desktop, no lorem ipsum.

### Design Arena reference sites
Source: https://www.designarena.ai/leaderboard?section=website&board=webapps
- Each "webapps" entry is a model run as a coding agent that builds a Vite + React/TS app deployed to `*.arcada.app`.
- `GET /api/voteNew/tournament/{id}` returns the prompt and a `previewUrl` per generation; `code` is `null`, so source isn't exposed.
- Deployed bundles are lightly minified and carry `data-source-loc="src/components/X.tsx:42:6"` on most elements (26 of 30 builds; preboards-hub, both lifeos, and one jcql lack them). This gives component-level attribution without source.
- 15 featured tournaments = 30 sites mirrored.

### SlopLabel (annotation tool, in progress)
Inspired by https://github.com/cerealbox39/ui-editor. FastAPI server hosts the mirrored sites at `/s/S01/` etc. and injects a plain-JS overlay.
- Hover shows component name and file:line; `↑`/`↓` climbs the component tree; falls back to CSS selectors when tags are missing.
- Each label: verdict (slop / not slop / unsure), severity 1–3, free-text indicator tags (no pre-filled taxonomy), comment, plus site/model/viewport, selector, component chain, text, bbox, key computed styles, and an element crop.
- Storage: SQLite. Export to JSON/CSV.

## Grader architecture (planned)
Score the **rendered** page (Playwright, computed styles), not source. Layers:
1. **Deterministic DOM checks.** Gradient text, `backdrop-filter` share, generic font allowlist, emoji-as-icons, Lucide-only icons, repeated CTAs, numbered "01 / LABEL" eyebrows, fake stats/testimonials, console errors, dead buttons/links, mobile overflow, contrast (axe). Each check fires on specific elements, so it localizes for free.
2. **Interaction checks.** Forms validate, filters/lightboxes/tabs work.
3. **VLM judge with a rubric.** One yes/no question per criterion on screenshots with numbered element marks, returning element IDs and evidence. Prefer pairwise comparisons; use judges from more than one lab.
4. **Brief fulfillment.** Score against the prompt's `requirements` list so an empty page can't win.
5. **Cross-brief sameness.** Embedding and DOM-structure similarity of one model's outputs across different briefs. Needs no labels.
6. **Trained classifier** (optional, timeboxed). See `docs/grader-design.md`.

Harbor task layout: `instruction.md` = brief, `environment/` = build image, `tests/` = verifier that serves the build, runs Playwright, writes a 0–1 reward.

## Working rules
- **Human critiques define the slop indicators.** Don't score, rank, or invent a taxonomy of sites ahead of the team's own labels. A previous session was stopped for doing this.
- Propose a plan and wait for a decision before building anything big.
- Split train and test by generator model and by brief, never by random page.
- Never commit API keys; Valkyrie secrets are passed with `-s NAME secret-name`.

## Shared memory
`MEMORY.md` is the team's shared memory for both humans and agents. Append one-line entries under the right heading with `[who; YYYY-MM-DD]`. Record decisions, gotchas, and open questions. Don't record task status. Remove entries once they're no longer true.
