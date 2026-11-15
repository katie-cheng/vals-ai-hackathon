# S02 golden reference: IT Beginner Platform

A de-slopped rebuild of Design Arena site S02 (`gemini-3.8-flash`, https://it-beginner-platform-jqu1.arcada.app), built the way
`references/S13` was. It keeps the original's routes, course content and features and changes what the labels, the reference rubric and
the review in chat call for. S01 (`gpt-6-astra`) answers the same brief; its labels are applied where S02 has the same pattern.

## Layout

```
inputs/brief.md                  the brief, verbatim
inputs/live-app/                 the original, reconstructed from the deployed bundle (Vite project)
inputs/dossier/                  DOSSIER.md, generated tables, live capture and screenshots of the original
inputs/critiques/                CRITIQUES.md + critiques.json (48 S02 labels, 23 S01 labels), rebuild-chat.json (review critiques)
solution/                        the rebuild (Vite project) with PLAN.md and DESIGN-SYSTEM.md
reference.patch                  git binary patch: inputs/live-app -> solution
verification/tools/              checks.py, capture.py, compare.py, crops.py, box_audit.py
verification/reports/            checks.json, box_audit.txt, grader/{original,rebuild}.json
verification/screens/            compare/{1440,390}/<route>.jpg, crops/<label id>.jpg
tools/                           reconstruct/ (decompiler), fidelity.py, dossier_capture.py, build_dossier.py, build_inputs.py
```

## Run

```bash
source ~/.nvm/nvm.sh && nvm use 20
cd references/S02/solution && npm ci && npm run build && npx vite preview --port 4303
cd references/S02/inputs/live-app && npm ci && npm run build && npx vite preview --port 4302   # the original
```

Reproduce `solution/` from the original with the patch:

```bash
cp -r references/S02/inputs/live-app /tmp/s02 && cd /tmp/s02 && git init -q && git apply --binary <repo>/references/S02/reference.patch
```

## Verification

| Check | Original | Rebuild |
| --- | --- | --- |
| `checks.py` (15 routes; console, requests, overflow and wrapping at 11 widths from 360 to 1440px, CLS, links, names, every control, forms, reduced motion) | not run: it targets the rebuild's markup | 122 of 122 pass |
| Horizontal overflow | 149px at 1440, 229px at 1280, 415px at 1024, 8px at 360 | none |
| CLS, throttled cold load, all routes | not measured | 0 |
| Third-party requests | Google Fonts, Unsplash | none |
| Slop grader, landing route (`tasks/zee-beauty-salon/tests`, slop half) | 31.3 points | 0 points |
| `box_audit.py` groups flagged at 1440 | 6 | 4, all option groups whose width follows the label |

The grader's requirements half belongs to the zee-beauty-salon brief and is not reported. It renders only `/`, so the inner routes are
covered by `checks.py` and the screenshots, not by the grader.

```bash
python verification/tools/checks.py http://localhost:4303 verification/reports/checks.json
python verification/tools/capture.py http://localhost:4303 /tmp/raw/sol        # then compare.py, crops.py
PLAYWRIGHT_MODULE_DIR=~/.cache/slopbench-verifier node tasks/zee-beauty-salon/tests/grade.mjs --dist references/S02/solution/dist --out /tmp/grade
```

## What changed

See `solution/PLAN.md` for the label-by-label mapping. In short: no eyebrows, pills, emoji, gradients, glows or pulsing; one type scale
with a 13px minimum; lists as hairline rows instead of nested cards; a header that fits at every width; one action per block; invented
admin KPIs and the any-code "verified" certificate removed; fonts self-hosted; colour kept and assigned by meaning.

## Left unfixed or open

- Confetti on quiz pass and lesson completion is removed under rubric R15 (particles), though no label flagged it.
- The rebuild's local variable names in `PlaygroundPage.tsx` state logic and `CourseContext.tsx` are still the decompiler's (`h`, `v`, `T`).
- If the fonts take more than 3 seconds, the app renders in the system font and shifts once when they arrive.
- Reviewed in chat through R8; Katie called it good enough for the golden patch. Not labelled in SlopLabel and not in the Slop Arena.

## Proposed additions to the shared rules (not applied: `tasks/reference-rubric.md` and `docs/label-analysis.md` are untouched)

1. De-slopping does not mean removing colour. Keep the original's hues and assign each one meaning; remove only gradients, glows and coloured shadows (chat R1, R5, R6).
2. Phrase-length display headings should be thin; put weight on short labels, and vary weight by role instead of setting everything semibold (chat R3, R4).
3. Icons are allowed when one set, size and stroke is used and each icon marks a state or an action (chat R2). Sharpens R8.
4. Soft motion the brief or original intends may stay: short opacity fades on things that appear (chat R7). Sharpens R15.
5. First paint must not swap fonts: self-host, preload and wait for text fonts, and measure CLS on a throttled cold load, not a warm one (chat R8). Sharpens R25.
6. Multi-route apps: every rubric criterion applies to every route, and the grader should render more than `/`. All 48 S02 labels are on the landing page, yet the same patterns repeat on the 12 inner routes.
7. A page must not present fabricated proof for arbitrary input (a "verified" certificate for any URL code), and dashboard KPIs must come from the data shown. Extends R9 and R17 to app screens.
8. Label-pattern additions: page-header "eyebrow + pill" pairs; emoji stored in data and rendered as icons; tag pills listing topics; arrow glyphs in link labels; header clusters that overflow at desktop widths.

## Harbor task

This rebuild is the oracle of `tasks/it-beginner-platform` (`solution/app` is a copy of `solution/` here, without `PLAN.md` and `DESIGN-SYSTEM.md`).
Building the task's crawler found that the header's search control was a button, unreachable by following links; it is now a link.
