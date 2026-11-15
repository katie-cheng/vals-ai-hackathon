# Session summaries

## 1. Create Prompt Database (Aidan)
https://app.devin.ai/sessions/e2c1cc5fafb44128a51a814dd5ff9d4b

- **Input:** the hackathon setup instructions (Valkyrie CLI, Harbor format, submission requirements) and a file with one system prompt and 26 website-generation briefs.
- **Output:** `data/website-prompts-db/`. It contains the system prompt, the fill-in template, and all 26 briefs verbatim, with category, title, entity, word count, specificity, and named libraries. There is also a checklist of 191 explicit requirements, e.g. #7 Saffron Courtyard lists its address, 4.7★ from 1,204 reviews, five menu sections, rupee prices, and a reservation form. Formats: SQLite, JSON, JSONL, CSV. `build_db.py` (stdlib only) rebuilds them.
- **Not done:** nothing pushed to a repo. Devin offered to turn each brief into a Harbor task graded against its checklist.

## 2. Identify AI Slop UI Indicators (Katie), still running
https://app.devin.ai/sessions/15f198f597984f9c828909d1906a42ad

- **Goal:** find the slop indicators to grade on, using very sloppy Design Arena webapps as examples, and turn them into Harbor tasks.
- **Findings:**
  - Arena webapps are agent-built Vite+React apps on `*.arcada.app`.
  - The API exposes the prompt and preview URL but not the source.
  - Bundles keep `data-source-loc` component tags.
  - Pulled 15 featured tournaments (30 sites) with model, placement, and prompt; mirrored the bundles and took desktop, full-page, and mobile screenshots.
- **Early static signals (unvalidated):**
  - `backdrop-blur` glassmorphism almost everywhere
  - heavy gradient use and gradient text
  - Lucide icons in 27/30 sites
  - the same few fonts (Manrope, DM Sans, Inter, Cormorant)
  - emoji used as icons (71 in one site)
- **Harbor plan:**
  - `instruction.md` is the arena prompt.
  - The environment is a Node/Vite image.
  - The `tests/` verifier serves the build, drives it with Playwright, and writes a 0–1 reward.
  - Checks come in three tiers: deterministic DOM, interaction, and a VLM rubric. Each critique becomes one check or rubric line.
- **Artifacts:** `critique_sheet.csv` / `.md` (S01–S30 with URL, model, placement, prompt, plus empty `slop_score_1to5` and `critique` columns), a draft verifier script, and an example Harbor task from the ZEE salon prompt.
- **Course correction:** Katie stopped Devin from scoring sites before she had given her own critiques. Rule: her critiques define the indicators.
- **Current work:** building **SlopLabel**, a ui-editor-style overlay for labeling individual components as slop / not slop with severity, tags, and a comment, stored in SQLite. See AGENTS.md.

## 3. Grader and classifier discussion with Claude (Ali)
Screenshots shared in Devin session https://app.devin.ai/sessions/3dc261cee00b4a5ea9c21e19dc95ff29. Distilled in `docs/grader-design.md`.
