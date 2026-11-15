# SlopBench shared memory

Team: Ali, Katie, Aidan. Append one-line entries as `- text [who; YYYY-MM-DD]`. Keep it current; delete what stops being true.

## Decisions
- Project name is SlopBench; goal is grading frontier models' frontend output for "slop" [Ali; 2026-11-14]
- Tasks use Harbor format and run on Valkyrie (org `hackathon-what-does-the-fox-say-c2f1ff2066`) [Aidan; 2026-11-14]
- The slop indicator taxonomy comes from human critiques/labels, not from an agent's own scoring [Katie; 2026-11-14]
- Annotation labels are stored in SQLite (SlopLabel tool) [Katie; 2026-11-14]
- Grade the rendered DOM/screenshots, not source code [Ali; 2026-11-14]
- Harbor tasks are multi-file React apps (matching Design Arena webapps), not single HTML files; `system_prompt.txt` from the prompt DB must be rewritten to match [Ali; 2026-11-14]
- Make grader checks mechanical (deterministic DOM/computed-style) wherever possible; use the VLM judge only for what can't be detected mechanically [Ali; 2026-11-14]
- Layered grader: deterministic DOM checks + rubric VLM judge + brief-fulfillment score; trained classifier is optional and gets cut first if time is short [Ali; 2026-11-14]

- First trained grader is a screenshot model (frozen SigLIP features + one pairwise Bradley–Terry layer, `scripts/slop_model/`), built before the mechanical checks; mechanical checks + fitted weights come next and get compared against it [Ali; 2026-11-14]
- "Both slop" / "neither slop" votes count as ties (0.5) in training, not dropped [Ali; 2026-11-14]
- Benchmark slop number: average P(model's site sloppier than reference site) over a fixed real-world reference pool ("sloppier than X% of real sites"), reported next to a separate brief-fulfillment score [Ali; 2026-11-14]
- Test set covers 8 website types, not just Design Arena briefs: `data/testset.json` (frozen; includes the 10 held-out arena sites); its sites are excluded from training [Ali; 2026-11-14]
- Show pre-2022 YC sites rarely (picker weight 0.1) and prefer modern (2024+) YC homepages [Ali; 2026-11-14]
- Top-company sites (`data/web/curated_top.tsv`) are a high-quality anchor; treat them as likely-clean, not proven clean [Ali; 2026-11-14]
- Focus shifted from the classifier to a few Harbor tasks, each with a golden reference site: it is the oracle `solution/`, the labelled arena originals are negative controls, and the verifier must separate them. Never grade by similarity to the golden site [Ali; 2026-11-15]
- A golden site must also clear `tasks/reference-rubric.md` (17 criteria taken from Katie's SlopLabel comments, each traced to label ids); where the brief asks for something the rubric flags, the brief wins [Ali; 2026-11-15]

## Facts and gotchas
- Design Arena webapp entries are Vite+React builds on `*.arcada.app`; source is not exposed (`code: null`), but bundles carry `data-source-loc` component tags [Katie; 2026-11-14]
- 4 of the 30 mirrored arena sites lack `data-source-loc` tags (preboards-hub, both lifeos, one jcql); SlopLabel falls back to CSS selectors there [Katie; 2026-11-14]
- Cross-origin pages can't be inspected from an overlay; SlopLabel serves local mirrors instead [Katie; 2026-11-14]
- `katie-cheng/vals-ai-hackathon` is the SlopBench repo; the old Total Benchmark Island code was removed [Ali; 2026-11-15]
- Hackathon README must start with a one-paragraph, entirely human-written overview [Aidan; 2026-11-14]

## Open questions
- How to use Design Arena votes: sanity-check hit rate, fit per-check weights via logistic regression on DOM-feature differences (controlling for broken/brief-ignoring sites), optionally pretrain the probe. Blocked on how many tournaments/votes the arena API exposes [Ali; 2026-11-14]
- Do we use the 26 prompt-db briefs, the Design Arena tournament prompts, or both? [Ali; 2026-11-14]
- Which frontier models and harnesses go in the results table? [Ali; 2026-11-14]
- SlopLabel Export JSON: `styles` is a dict; Tailwind `rounded-full` shows as borderRadius `1.67772e+07px`; `sites.done`/overall fields unused so far (export 2026-11-15)
- Eyebrow labels (small caps, letter-spaced text above headings) are the most-flagged pattern, by all three annotators: see docs/label-analysis.md
- Held-out sites (data/splits.json): grade them only with frozen graders; never tune on them
- Arcada sites never reach Playwright `networkidle` (animations/polling); use `wait_until="load"` plus a fixed wait
- Pairwise "which is sloppier" votes (Slop Arena) are the main evaluation signal for graders; YC pre-2022 archived homepages serve as human-made reference sites
- The session VM has 2 CPUs: run Playwright scrapes sequentially with ≤2 workers
- Modal (profile `aliahmad`) has a workspace spend limit separate from credits; "exceeded its spend limit" means Ali must raise it in the dashboard [2026-11-15]
- Modal (profile `aliahmad`): GPU functions fail with "add a payment method"; CPU containers work (SigLIP so400m embeds ~1.8k crops in ~5 min with 30 parallel cpu=8 containers). [2026-11-14]
- Voters differ in tie use (Ali answers both/neither ~20% of the time, Aidan ~2%), so raw agreement rates understate agreement; compare side-picking votes only [2026-11-14]
- SigLIP zero-shot website-type tags are rough (many YC startups tagged "game"/"portfolio"); hand-correct via `data/web/type_overrides.json` before using them [2026-11-14]
- Many headless captures of real sites are bot-check / "you have been blocked" / 404 pages; inspect a contact sheet (`scripts/testset_sheet.py`) before adding captures to a set [2026-11-14]
- Screenshot model on unseen sites agrees with human votes ~70–73% vs 63% for a source-only baseline (grouped CV, ~530 votes); human-human agreement on side-picking votes ~71% from very few pairs [2026-11-14]
