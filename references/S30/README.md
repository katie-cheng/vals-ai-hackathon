# S30 golden reference: Kora Growth Agency

S30 is `muse-spark-1.3-max`'s build for the S29/S30 brief ("copy all the animations, components and content of https://kora.framer.media/,
with standalone pages"), live at https://kora-growth-agency-br48.arcada.app. The reference keeps its content, routes, assets and motion
and fixes what Aidan's 59 SlopLabel labels flagged, applied to every instance of each pattern. S29 has no labels.

It was built in two passes. The first (F1 to F15 in `solution/PLAN.md`) fixed the labelled patterns. The second, the
audit pass, checked that result against the 59 labels again, every rule R1 to R25 in `tasks/reference-rubric.md` and
the S13, S14 and S13-ref labels as patterns, and rewrote the pages and shared components to close the gaps (pills,
large radii, bold, shadows, dot grids, clipped word reveals, parallax, hover lifts, magnetic buttons, custom
cursor, Lenis, numbered markers, plan badges). Content, routes, images and video are the original's. Where the brief
asks for something a rule would remove (results figures, appearing and scrolling animation, marquee, preloader),
the brief wins; PLAN.md lists each exception.

| Path | What |
| --- | --- |
| `inputs/brief.md` | the brief, verbatim |
| `inputs/live-app/` | the live S30 app reconstructed from its deployed bundle (the "before") |
| `inputs/critiques/` | Aidan's 59 labels (`critiques.json`, `CRITIQUES.md`), built by `tools/build_inputs.py` |
| `solution/` | the reference site (Vite + React + Tailwind 4 + Motion); `PLAN.md` maps every label, rubric rule and S13/S14 pattern to its fix, `DESIGN-SYSTEM.md` is the token set |
| `reference.patch` | `inputs/live-app` → `solution` as one git patch |
| `verification/` | reports, before/after screenshots and the tools that produce them (below) |
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

## Verification

Serve both builds (`npx vite preview --port 4330` in `inputs/live-app`, `--port 4331` in `solution`), then from
`verification/tools`:

| Tool | Output | Result |
| --- | --- | --- |
| `checks.py` | `reports/checks.json` | 20 of 20: 10 routes at 1440 and 390px, no console errors, no overflow, no middot, em dash, animated dot or monospace text, deep links resolve |
| `interactions.py` | `reports/interactions.json` | 25 of 25: no failed requests and no overflow on 10 routes at 9 widths from 360 to 1440px, no wrapped control, accessible names, CLS 0, every control, the three-step contact form (invalid and valid), reduced motion |
| `box_audit.py` | `reports/box-audit.json` | 0 uneven sibling groups at 1440 and 390px |
| `pages.py` | `pages/<route>-<width>.jpg` | full-page original and solution side by side, 10 routes at 1440 and 390px |
| `compare.py` | `before-after/ba-*.png` | six section crops at 1440px |
| `crops.py` | `crops/<label id>.jpg` | one before/after per label, at the 934px width the labels were made at |
| `tasks/zee-beauty-salon/tests/grade.mjs` | `reports/grade-*.json` | slop points: original 54.56, F1 to F15 solution 19.32, this solution 0 |

The grader's brief-requirements half is written for another brief and does not apply; only its slop half is reported.
The SlopLabel export's context screenshots for the 24 case-study labels are blank, so `crops.py` renders those
"before" sides from `inputs/live-app` at the label's scroll position.

## Notes for the shared rules

Not edited here (other sessions are working on the same files); proposed for `tasks/reference-rubric.md` and
`docs/label-analysis.md`:

- Fix the pattern, not the instance. S30's labels say "would remove elements of this pattern entirely", yet a pass
  that only follows the labels leaves the same pattern in unlabelled places (92 pills and 43 large radii were left
  after all 59 labels were fixed). A reference should be checked by counting each pattern in the source.
- "Radius unification" (#316, #324, #326, and "weird radius" on most of the section-tag labels) is R19 seen from the other side:
  the complaint is a radius that matches nothing else, so the fix is fewer radii, not matching one odd value.
- "Different font from the website" on small labels, tags and logo (S30 #171, #299 to #301) belongs under R18: a
  second family or a mono face on small text reads as generated even when it is not uppercase.
- A floating stat card laid over a photo (#348) is R9 and R14 together and could be named in R9.
- Clone briefs ("copy this reference 100%") need a stated order of precedence: brief content and named behaviour
  first, rubric second. PLAN.md's brief-exception table is one way to record it.
- The grader's `broken_controls` counts accordion questions that wrap on phones. Long FAQ questions wrap
  legitimately; the check could exempt full-width disclosure buttons or only count them when a short label wraps.

## Differences from an independent reconstruction

Before the scope changed, the audit session had rebuilt the live app from the bundle on its own. It was not
swapped in. Compared with `inputs/live-app` here: same files, routes and assets; the independent one type-checks (`tsc -b`),
has an unminified `index.css`, and its rendered DOM and page heights were compared with the deployment on every
route at 1440 and 390px (identical). That comparison was not run on `inputs/live-app`. Two things worth knowing about the deployment itself: deep links return 404 (the
host has no SPA fallback), and its Lucide build names the fingerprint icon `fingerprint-pattern`.
