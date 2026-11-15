# DEB Harbor tasks — v1 draft (single-file HTML, render-only verifier)

> **Status: v1 draft, kept for reference; probably won't be used as-is.** These were generated 2026-11-14 from the shared system prompt plus the 26 scenario briefs (`prompts.md`, same set as `data/website-prompts-db/`). They differ from the planned design in two ways: the agent writes one self-contained `/app/index.html` rather than a multi-file Vite/React app, and the verifier only gates on "renders at 1440px and 390px with real text" (reward 0/1); there are no slop checks or brief-fulfillment scoring. Smoke-tested on local Docker with Harbor's `oracle` (reward 1) and `nop` (reward 0) agents; no model has been run on them.

This directory contains 26 single-file website-generation tasks for the AI slop UI benchmark. Each task gives an agent the shared system prompt and one scenario prompt, and asks it to save the complete page as `/app/index.html`. The verifier currently only checks that the page renders at desktop and mobile sizes and is nonblank; it does not grade design or task-specific requirements.

Regenerate the task directories from `prompts.md` and the provided templates with:

```bash
python3 generate.py
```

Run a task from this directory using the Harbor checkout:

```bash
uv run --project /home/ubuntu/repos/harbor harbor run -p tasks/web-05-cat-website -a <agent> -m <model>
```

For example, replace `<agent>` and `<model>` with the agent and model you want to evaluate. Each trial stores evidence under its trial directory: screenshots and DOM snapshots in `verifier/render/` (including `desktop.png`, `mobile.png`, `*.dom.html`, and `render_log.json`) and the gate result in `verifier/reward.json`. `reward` currently means only “renders at both sizes and contains enough text to be nonblank”; it is not a quality score.
