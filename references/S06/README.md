# S06 golden reference: Rocksteady Campus

Status: first complete version, waiting for Katie's or Aidan's review. It is not in Slop Arena; Katie decides that.

S06 is `kimi-k3.1-pro`'s build for the Rocksteady Campus brief (tournament `104e4bb6-f582-4005-ade0-55d4a41ccf30`, live at https://rocksteady-campus-oj1m.arcada.app): a township takeaway's ordering site with eight pages, a customer portal and an admin CMS.
The reference keeps its content, assets, routes and behaviour and fixes what the team's critiques and rules flag:
- the 16 S06 SlopLabel labels;
- the 12 S05 labels (`gpt-6-astra-max`, same brief) wherever the same pattern occurs in S06;
- every S13, S14 and S13-ref critique as a pattern, the rubric (`tasks/reference-rubric.md`, R1 to R25) and `docs/label-analysis.md`;
- the review critiques made in chat (`inputs/critiques/rebuild-chat.json`).

Where the brief asks for something a general rule flags, the brief wins (Katie: "prefer what the brief asks for specifically"). Those cases are listed under "Brief exceptions" in `solution/PLAN.md`.

| Path | What |
| --- | --- |
| `inputs/brief.md` | the brief, verbatim |
| `inputs/live-app/` | the live S06 app reconstructed from its deployed bundle (the "before") |
| `inputs/dossier/` | live-app evidence: structure, tokens, behaviour (`DOSSIER.md`), per-route measurements (`DOSSIER-generated.md`, `live-capture.json`), screenshots |
| `inputs/critiques/` | the S06, S05, S13, S14 and S13-ref critiques (`critiques.json`, `CRITIQUES.md`) and the rebuild critiques (`rebuild-chat.json`) |
| `solution/` | the reference site (Vite + React + TypeScript); `PLAN.md` maps every critique and pattern to its fix, `DESIGN-SYSTEM.md` holds the tokens |
| `reference.patch` | `inputs/live-app` → `solution` as one git patch (binary assets included) |
| `verification/` | brief checklist, interaction checks, grader output, box audit (`reports/`), original vs rebuild screenshots and per-critique crops (`screens/`), the tools that made them (`tools/`) |
| `tools/` | bundle decompiler, dossier capture, critique export, and the one-off class codemod used to start the rebuild |

The Harbor task built from this reference is `tasks/rocksteady-campus/` (its oracle solution is `solution/` here). Its full grader (`tasks/rocksteady-campus/tests/grade.mjs`, S06 brief requirements plus slop) scores the rebuild at reward 1.0 (requirements 1.0, 0 slop points) and the original at 0.70 (requirements 0.997, 21.84 slop points); outputs are in `verification/reports/task-grader/`.

Run the reference with Node 20:

```bash
cd references/S06/solution && npm ci && npm run build && npx vite preview
```

Reproduce it from the live app:

```bash
cp -r references/S06/inputs/live-app /tmp/s06 && cd /tmp/s06 && git apply --binary path/to/references/S06/reference.patch
```

## Verification results

| Check | Original (`inputs/live-app`) | Reference (`solution`) |
| --- | --- | --- |
| `verification/tools/checks.py` (console, requests, overflow 360 to 1440px, links and controls, hero, CLS, menu filters and search, cart and checkout, gallery, forms, accounts and admin, reduced motion) | 40 / 46 (`reports/checks-original.json`) | 47 / 47 (`reports/checks.json`) |
| Grader slop half (`tasks/zee-beauty-salon/tests/grade.mjs`, home page, 5 widths + resize sweep) | 21.84 points, slop score 0.407 | 0 points, slop score 1.0 |
| `verification/tools/box_audit.py`, 8 routes at 1440 and 390px | not run | only the filter chips differ in width (their labels differ in length); one size and radius for every square control |

The grader's brief-requirements half is written for the ZEE salon brief and does not apply here.
The six original failures are: horizontal overflow on `/order` up to 1100px, CLS of about 0.35 on every lazy route, "Order now" missing from the phone header (S05 #289), and three checks that are diagnostic only on the original because they were written against the rebuild's markup (accessible names, the hero thumbnail controls, the `#categories` in-page link).

The admin CMS is reachable with the demo administrator account that ships in the original's public bundle (`src/lib/store.tsx`, `login`). It is not a secret, and there is no backend behind it.

## Left as in the original

- Client-side only: accounts, orders, the "database" and CMS edits live in `localStorage`; authentication is a demo.
- Footer social links point to the platforms' home pages (the brief gives no handles).
- Meal photographs repeat across the 60 menu items: the brief's attachments are the only photographs.
- No social share buttons (the brief asks for "social media sharing"); WhatsApp links are present.

## Proposed additions to the shared rules

Not applied to `tasks/reference-rubric.md` or `docs/label-analysis.md` from this branch (sibling sessions are editing in parallel); proposed here and in the PR description.

Rubric candidates:
1. **Filtering must not move the page.** Changing a filter, tab or search term must not change the scroll position, collapse the results area below its previous height or pull the footer into view. Reserve a minimum height for results and do not animate layout on filter. (S06 #400)
2. **One control per carousel.** A slider gets one way to move through it. Do not combine previous/next arrows with thumbnails or dots, and do not put an unrelated arrow (scroll-down) next to them. (S06 #395; extends S13-ref #482)
3. **Rotating heroes crossfade in place.** If a hero cycles through slides, every slide occupies the same box, only opacity changes, the first slide's image is preloaded, and it does not auto-advance under reduced motion. (S06 #391)
4. **The primary CTA keeps its label at every width.** Do not collapse the header's main action to an icon on narrow screens; hide secondary navigation first. (S05 #289)
5. **Facts are text, not icon cards.** Address, hours, phone and "why us" points are a heading and a sentence or a definition list with dividers; no icon tile, numeral and caption per fact. (S06 #405, #409; S05 #453, #455, #457, #458)
6. **No trust captions on testimonials.** "Verified customer" lines, badge icons and initial avatars under a review add nothing a name does not. (S06 #408)
7. **No decorative marquee or rotated side label.** Scrolling bands and vertical text that repeat the brand line are decoration. (S06 #396)
8. **Route loaders fill the viewport.** A lazy-route placeholder shorter than the page it replaces causes layout shift when the footer jumps. (S06 CLS 0.35; extends S13-ref #485)
9. **Brief precedence.** When a brief names a treatment (bold type, a slider, cards with shadows), keep it and apply the rules to how it is executed (size, weight, consistency), not to whether it exists. (Katie, S06 R1)

Label-pattern additions for `docs/label-analysis.md`:
- "Filter causes layout shift / scroll jump" (S06 #400): a behaviour pattern, detectable mechanically by recording `scrollY` and the footer position before and after a filter click.
- "Competing arrow controls" (S06 #395).
- "Trust caption under testimonial" (S06 #408).
- "CTA collapses to icon when narrow" (S05 #289): detectable in the resize sweep by tracking the primary CTA's text across widths.
- "Empty-comment labels on whole sections" (S06 #396, #409, #410; S05 #296, #455): three of the five sit on icon-heavy or eyebrow-led blocks, which supports reading them as the same patterns.
