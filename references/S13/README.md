# S13 golden reference: Suds Squad Immersive

Status: final. Katie signed off on this version as the S13 reference on 2026-11-15. It is not in Slop Arena; Katie decides that.

S13 is `muse-spark-1.3-max`'s build for the Suds Squad brief (tournament `3628161e-e393-4d07-b3a3-e5546efe4bf5`, live at https://suds-squad-immersive-ann4.arcada.app).
The reference keeps its content, assets and behaviour and fixes what the team's critiques flagged:
- the 54 original S13 SlopLabel labels;
- the S14 labels whose pattern also occurs in S13;
- Katie's 46 chat critiques of the rebuild itself (site `S13-ref`, label ids 461 to 506).

| Path | What |
| --- | --- |
| `inputs/brief.md` | the brief, verbatim |
| `inputs/live-app/` | the live S13 app reconstructed from its deployed bundle (the "before") |
| `inputs/dossier/` | live-app evidence: sections, tokens, copy, screenshots |
| `inputs/critiques/` | the original critiques (`critiques.json`, `CRITIQUES.md`) and the rebuild critiques (`rebuild-chat.json`, screenshots) |
| `solution/` | the reference site (Vite + React + TypeScript); `PLAN.md` maps every critique to its fix, `DESIGN-SYSTEM.md` holds the tokens |
| `reference.patch` | `inputs/live-app` → `solution` as one git patch (binary assets included) |
| `verification/` | brief checklist, interaction checks (`reports/checks.json`), original vs rebuild screenshots, per-critique crops, `tools/box_audit.py` |

Run the reference with Node 20:

```bash
cd references/S13/solution && npm ci && npm run build && npx vite preview
```

Reproduce it from the live app:

```bash
cp -r references/S13/inputs/live-app /tmp/s13 && cd /tmp/s13 && git apply --binary path/to/references/S13/reference.patch
```

The generalised principles behind the rebuild critiques are R18 to R25 in `tasks/reference-rubric.md`.
