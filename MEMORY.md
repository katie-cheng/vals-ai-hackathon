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

## Facts and gotchas
- Design Arena webapp entries are Vite+React builds on `*.arcada.app`; source is not exposed (`code: null`), but bundles carry `data-source-loc` component tags [Katie; 2026-11-14]
- 4 of the 30 mirrored arena sites lack `data-source-loc` tags (preboards-hub, both lifeos, one jcql); SlopLabel falls back to CSS selectors there [Katie; 2026-11-14]
- Cross-origin pages can't be inspected from an overlay; SlopLabel serves local mirrors instead [Katie; 2026-11-14]
- `katie-cheng/vals-ai-hackathon` is a different project (Total Benchmark Island), not SlopBench [Aidan; 2026-11-14]
- Hackathon README must start with a one-paragraph, entirely human-written overview [Aidan; 2026-11-14]

## Open questions
- How to use Design Arena votes: sanity-check hit rate, fit per-check weights via logistic regression on DOM-feature differences (controlling for broken/brief-ignoring sites), optionally pretrain the probe. Blocked on how many tournaments/votes the arena API exposes [Ali; 2026-11-14]
- Do we use the 26 prompt-db briefs, the Design Arena tournament prompts, or both? [Ali; 2026-11-14]
- Which frontier models and harnesses go in the results table? [Ali; 2026-11-14]
- Is the trained classifier worth building before demos, or only the judge plus DOM checks? [Ali; 2026-11-14]
- SlopLabel Export JSON: `styles` is a dict; Tailwind `rounded-full` shows as borderRadius `1.67772e+07px`; `sites.done`/overall fields unused so far (export 2026-11-15)
- Eyebrow labels (small caps, letter-spaced text above headings) are the most-flagged pattern, by all three annotators: see docs/label-analysis.md
- Held-out sites (data/splits.json): grade them only with frozen graders; never tune on them
- Arcada sites never reach Playwright `networkidle` (animations/polling); use `wait_until="load"` plus a fixed wait
- Pairwise "which is sloppier" votes (Slop Arena) are the main evaluation signal for graders; YC pre-2022 archived homepages serve as human-made reference sites
- The session VM has 2 CPUs: run Playwright scrapes sequentially with ≤2 workers
- Modal (profile `aliahmad`): GPU functions fail with "add a payment method"; CPU containers work (SigLIP so400m embeds ~1.8k crops in ~5 min with 30 parallel cpu=8 containers). [2026-11-14]
