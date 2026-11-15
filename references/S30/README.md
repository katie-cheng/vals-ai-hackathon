# S30 golden reference: Kora Growth Agency

S30 is `muse-spark-1.3-max`'s build for the S29/S30 brief ("copy all the animations, components and content of https://kora.framer.media/,
with standalone pages"), live at https://kora-growth-agency-br48.arcada.app. The reference keeps its content, routes, assets and motion
and fixes what Aidan's 59 SlopLabel labels flagged, applied to every instance of each pattern. S29 has no labels.

| Path | What |
| --- | --- |
| `inputs/brief.md` | the brief, verbatim |
| `inputs/live-app/` | the live S30 app reconstructed from its deployed bundle (the "before") |
| `inputs/critiques/` | Aidan's 59 labels (`critiques.json`, `CRITIQUES.md`), built by `tools/build_inputs.py` |
| `solution/` | the reference site (Vite + React + Tailwind 4 + Motion + Lenis); `PLAN.md` maps every label to its fix |
| `reference.patch` | `inputs/live-app` → `solution` as one git patch |
| `verification/` | route checks (`reports/checks.json`), before/after screenshots, and the tools that produce them |
| `tools/` | `decomp.mjs` + `names.json` (bundle to source), `build_inputs.py` |

Run the reference with Node 20 or later:

```bash
cd references/S30/solution && npm ci && npm run build && npx vite preview
```

Reproduce it from the live app:

```bash
cp -r references/S30/inputs/live-app /tmp/s30 && cd /tmp/s30 && git apply --binary path/to/references/S30/reference.patch
```

`npm run build` does not type-check. `tsc --noEmit` reports errors because the decompiled code is untyped JavaScript in `.tsx` files.
The app uses `BrowserRouter`, so a static host needs an `index.html` fallback for deep links.
