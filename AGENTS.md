# SlopBench — agent guide

SlopBench measures how much "AI slop" frontier models produce when they build websites. A model gets a website brief, builds the site, and a grader scores the result for slop: generic, templated, decorative-without-purpose design and broken or fake content. It is being built for the Vals AI hackathon (team org `hackathon-what-does-the-fox-say-c2f1ff2066`). Demos are Sunday 2 PM.

Read `MEMORY.md` before starting work and add to it when you make or learn a decision (see "Shared memory" below).

## Deliverables (hackathon requirements)
- GitHub repo with the tasks and a README explaining how to run them. The first paragraph of the README must be written by a human.
- Tasks in [Harbor format](https://docs.harborframework.com/tasks/overview), uploaded to Valkyrie with `valkyrie dataset push`.
- Results: frontier model scores in the README, graphs plus tables.
- Optional: traces, a Valkyrie run ID, and a concrete failure mode the benchmark exposes.

## Repo and workflow
GitHub: `katie-cheng/vals-ai-hackathon` (default branch `devin/1794696598-game-engine`; it replaced the old Total Benchmark Island code). Work on a branch and open a PR; don't push to the default branch directly. Large captures (`data/snapshots/{yc,ai,dev,web}/`), model artifacts (`*.pkl`, `*.npz`), `reports/` and `data/yc/yc-oss-all.json` (downloaded on demand by `scripts/scrape_yc.py`) are git-ignored.

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
| `docs/label-analysis.md` | Analysis of the team's SlopLabel annotations (eyebrows are the top pattern). |
| `arena/` | Slop Arena: blind pairwise "which is sloppier?" voting app (see below). |
| `scripts/scrape_*.py`, `render_lib.py`, `render_modal.py` | Capture pipelines: Design Arena (`scrape_ai.py`), YC (`scrape_yc.py`), other web references (`scrape_web.py`, or `render_modal.py` on Modal). |
| `scripts/slop_model/` | Screenshot slop model (see below). |
| `data/snapshots/heldout/` | Frozen renders of the 10 held-out Design Arena sites. |
| `data/testset.json`, `data/web/` | Frozen stratified test set and the reference-site candidate lists. |

Not in this repo yet (on Katie's Devin VM, session `15f198f597984f9c828909d1906a42ad`): mirrors and screenshots of 30 Design Arena sites, a critique sheet (S01–S30), a draft Playwright verifier, one example Harbor task (ZEE salon prompt), and the **SlopLabel** annotation tool (in progress).

### Prompt set
26 briefs in 8 categories: portfolios/personal, company/local business, landing pages, rebuild-style (heavily specified), dashboards/data, interactive apps/3D/games, general. Each has `task_id` (e.g. `07-indian-restaurant`), `specificity` (vague <15 words, moderate <60, heavy), named `libraries`, and a `requirements` checklist usable for a brief-fulfillment score. The shared `system_prompt.txt` currently asks for **one self-contained HTML file** rendered in a sandboxed iframe. That is outdated: tasks are **multi-file React apps** (like the Design Arena webapps), so the system prompt must be rewritten. Keep its other requirements: no console errors, responsive 360px→desktop, working controls, no lorem ipsum.

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
Score the **rendered** page (Playwright, computed styles), not source. **Make checks mechanical wherever possible.** Each recurring human-label tag becomes a deterministic DOM check if it can be detected mechanically; otherwise it becomes a judge rubric question. Layers:
1. **Deterministic DOM checks.** Gradient text, `backdrop-filter` share, generic font allowlist, emoji-as-icons, Lucide-only icons, repeated CTAs, numbered "01 / LABEL" eyebrows, fake stats/testimonials, console errors, dead buttons/links, mobile overflow, contrast (axe). Each check fires on specific elements, so it localizes for free.
2. **Interaction checks.** Forms validate, filters/lightboxes/tabs work.
3. **VLM judge with a rubric.** One yes/no question per criterion on screenshots with numbered element marks, returning element IDs and evidence. Prefer pairwise comparisons; use judges from more than one lab.
4. **Brief fulfillment.** Score against the prompt's `requirements` list so an empty page can't win.
5. **Cross-brief sameness.** Embedding and DOM-structure similarity of one model's outputs across different briefs. Needs no labels.
6. **Trained classifier** (optional, timeboxed). See `docs/grader-design.md`.

Design Arena votes ("A beat B") are a weak signal, not ground truth. Use them to sanity-check our scores, and to fit per-check weights with P(A≻B)=σ(wᵀ(f(B)−f(A))) over DOM-check outputs, controlling for broken or brief-ignoring sites. A near-zero or wrong-sign weight flags a check to drop.

Harbor task layout: `instruction.md` = brief, `environment/` = Node/Vite React build image, `tests/` = verifier that serves the build, runs Playwright, writes a 0–1 reward.

## Working rules
- **Human critiques define the slop indicators.** Don't score, rank, or invent a taxonomy of sites ahead of the team's own labels. A previous session was stopped for doing this.
- Propose a plan and wait for a decision before building anything big.
- Split train and test by generator model and by brief, never by random page.
- Never commit API keys; Valkyrie secrets are passed with `-s NAME secret-name`.

## Shared memory
`MEMORY.md` is the team's shared memory for both humans and agents. Append one-line entries under the right heading with `[who; YYYY-MM-DD]`. Record decisions, gotchas, and open questions. Don't record task status. Remove entries once they're no longer true.

## Dev / held-out split
`data/splits.json` splits the 30 Design Arena sites by tournament: 20 dev, 10 held-out (S09–S12, S17–S20, S27–S28; includes 4 models absent from dev). Build and tune graders on dev only. Don't read held-out labels/comments or tune checks while looking at held-out sites; just run frozen graders on them and report metrics. Frozen held-out renders (desktop 1440×900 and mobile 390×844, full-page PNG + rendered HTML) are in `data/snapshots/heldout/`, made by `scripts/snapshot_sites.py`.

## Slop Arena (pairwise votes)
App: https://slop-arena--wtj4qv7i.preview.devinapps.com (code in `arena/app.py`, served from Ali's session `3dc261cee00b4a5ea9c21e19dc95ff29`; votes in `~/slopbench-arena-data/arena.db` on that VM, export at `/api/export`).
- **Votes:** left/right = that site is sloppier; "both slop" / "neither slop" are ties (0.5 in Bradley–Terry and in model training); skip. Results page fits a Bradley–Terry slop score per site and per model/source.
- **Site pool:** Design Arena sites (`data/snapshots/{dev,heldout}`), YC homepages (`data/snapshots/yc/{pre2022,current}`; pre2022 = Internet Archive snapshot nearest 2021-07-01), Lovable showcase/templates, and web references (`data/snapshots/web/{curated-top,osm-local,personal-sites}`).
- **Picker order:** (1) frozen test-set pairs from `data/testset.json` until each has `TEST_VOTERS`=2 votes; (2) otherwise a category by `CATEGORY_WEIGHTS` (same_prompt 0.15, arena_cross 0.2, arena_vs_web 0.35, web_web 0.3), favouring sites this voter has seen least and avoiding repeats within their last 4 pairs. `SPLIT_WEIGHTS` downweights pre-2022 YC to 0.1 (team found too many old sites).
- **"Stop showing"** puts a site in the `removed` table: it disappears from pairs, results and exports (undo on the Results page). Broken captures (bot checks, 404s, blank pages) were removed under voter `devin-audit`.

## Screenshot slop model and expanded test set
- `scripts/slop_model/`: crops (`prep_crops.py`) → frozen SigLIP features on Modal CPU (`embed_modal.py`) → pairwise Bradley–Terry probe (`train_probe.py`, `eval_probe.py`); `report.py` renders held-out predictions. Ties ("both"/"neither") train as p=0.5.
- Extra reference captures in `data/snapshots/web/<source>/` (git-ignored): `curated-top` (hand-picked top-company sites, `data/web/curated_top.tsv`), `osm-local` (independent local businesses from OpenStreetMap city extracts, `scripts/osm_businesses.py`), `personal-sites` (personalsit.es). Render with `modal run scripts/render_modal.py` (~30x faster than the VM).
- `data/testset.json` is the frozen stratified test set (62 sites, 8 types, includes the 10 held-out Design Arena sites) plus planned pairs; built by `scripts/build_testset.py` (refuses to overwrite without `--force`) using SigLIP zero-shot types (`data/models/site_types.json`) corrected by `data/web/type_overrides.json`. Its sites are excluded from training and the arena serves its pairs first until each has 2 votes.

## Credentials
Never commit keys. Modal: the `modal` CLI/SDK reads `~/.modal.toml` (profile `aliahmad`, set up with `modal token set ... --profile=aliahmad --activate`) or the env vars `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET`; code should rely on those, not hard-coded tokens. `.env` and `.modal.toml` are git-ignored. Ali's personal workspace can't run GPUs (no payment method) and has a workspace spend limit; if jobs fail with "exceeded its spend limit", ask Ali to raise it in the Modal dashboard. CPU containers are enough: rendering ~300 sites takes ~3 min, embedding all crops ~$1.50.
