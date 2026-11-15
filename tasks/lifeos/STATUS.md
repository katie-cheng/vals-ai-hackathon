# LifeOS: status

Design Arena tournament `1325b0c3-5226-4e25-8ff2-d9036d2aa46a`. Original builds: S07 (qwen3.8-max), S08 (claude-sonnet-5-5).

## Scores (local grader, `tests/grade.mjs`)

| Site | reward | requirements | task | baseline | slop | slop points |
|---|---|---|---|---|---|---|
| Golden (`solution/app`, local dist) | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.0 |
| Golden in Docker (`solve.sh` then `test.sh`) | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.0 |
| S07 https://lifeos-productivity-1hlc.arcada.app | 0.516 | 0.882 | 0.879 | 0.933 | 0.150 | 85.3 |
| S08 https://lifeos-e6jj.arcada.app | 0.593 | 0.938 | 0.934 | 1.000 | 0.249 | 45.3 |

S07 loses mostly on slop (61 `·` dot separators, uppercase eyebrows, 12 emoji icons, 36% tiny text, 27 duplicate CTAs) plus a habit toggle that changes nothing, notes that are not saved, no pin control and no clear-data button. S08 loses on slop (59 pills, 13 duplicate CTAs) plus no pin/delete control reachable on notes and a status filter that grows the list.

## What the golden reference does

Vite + React + TypeScript, client-side only, path routes (`/`, `/tasks`, `/habits`, `/calendar`, `/focus`, `/notes`, `/analytics`, `/settings`), one localStorage document (`lifeos:data:v1`) seeded with dated-relative sample data on first launch so overdue/today/upcoming states are always current. Chart.js (bundled) for the overview and six analytics charts, Lucide icons, bundled Inter. Off-white #F8F9FB, white cards with 12px radius, 8px controls, soft shadows, indigo accent, light and dark themes.

Fixes relative to the originals and the rubric: no dot-separator or eyebrow tics, no emoji icons, no pills, no repeated identical CTAs in grids (habit "done today" is a labelled checkbox plus a status line), body text at 13px or larger, an accessible modal/confirm dialog with focus handling, toasts in an `aria-live` region, a real off-canvas mobile drawer (hidden from assistive tech when closed), every button wired, a prefers-reduced-motion block.

## Invented inputs

None: the brief references no external repo, site or asset. The sample tasks, habits (the five the brief names), focus sessions and notes are written for this reference.

## Shared verifier issues

`lib.mjs` `checkMobileMenu` counts nav links that are translated off-canvas to the left (`right < 0`) as visible, because `navVisible` only checks `width`, `bottom` and `top`. Both originals use a standard translateX(-100%) drawer (links at x = -274..-19 at 390px) and fail `mobile-menu` with "8 nav links already visible". The golden passes because its closed drawer is also `visibility: hidden`. Adding `r.right > 0 && r.left < innerWidth` would fix it.
