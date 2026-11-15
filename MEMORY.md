# SlopBench shared memory

Team: Ali, Katie, Aidan. Append one-line entries as `- text [who; YYYY-MM-DD]`. Keep it current; delete what stops being true.

## Decisions
- Project name is SlopBench; goal is grading frontier models' frontend output for "slop" [Ali; 2026-11-14]
- Tasks use Harbor format and run on Valkyrie (org `hackathon-what-does-the-fox-say-c2f1ff2066`) [Aidan; 2026-11-14]
- The slop indicator taxonomy comes from human critiques/labels, not from an agent's own scoring [Katie; 2026-11-14]
- Annotation labels are stored in SQLite (SlopLabel tool) [Katie; 2026-11-14]
- Grade the rendered DOM/screenshots, not source code [Ali; 2026-11-14]
- Layered grader: deterministic DOM checks + rubric VLM judge + brief-fulfillment score; trained classifier is optional and gets cut first if time is short [Ali; 2026-11-14]

## Facts and gotchas
- Design Arena webapp entries are Vite+React builds on `*.arcada.app`; source is not exposed (`code: null`), but bundles carry `data-source-loc` component tags [Katie; 2026-11-14]
- 4 of the 30 mirrored arena sites lack `data-source-loc` tags (preboards-hub, both lifeos, one jcql); SlopLabel falls back to CSS selectors there [Katie; 2026-11-14]
- Cross-origin pages can't be inspected from an overlay; SlopLabel serves local mirrors instead [Katie; 2026-11-14]
- `katie-cheng/vals-ai-hackathon` is a different project (Total Benchmark Island), not SlopBench [Aidan; 2026-11-14]
- Hackathon README must start with a one-paragraph, entirely human-written overview [Aidan; 2026-11-14]

## Open questions
- Output format: our system prompt asks for a single HTML file, but Design Arena references are multi-file Vite/React apps. Which format do the Harbor tasks use? [Ali; 2026-11-14]
- Do we use the 26 prompt-db briefs, the Design Arena tournament prompts, or both? [Ali; 2026-11-14]
- Which frontier models and harnesses go in the results table? [Ali; 2026-11-14]
- Is the trained classifier worth building before demos, or only the judge plus DOM checks? [Ali; 2026-11-14]
