# truth-or-dare: status

Design Arena webapps tournament `6ec52011-a188-455f-b698-6c9c1370e722` (S19 qwen3.8-max, S20 minimax-m3). Both sites are in the held-out split; SlopLabel has no labels or overall comments for them, so the golden reference follows the brief and `tasks/reference-rubric.md`.

## Scores (local grader, `tests/grade.mjs`)

| Build | Reward | Requirements | Task | Slop points | Gate |
| --- | --- | --- | --- | --- | --- |
| Golden (`solution/app`) | 1.00 | 1.00 | 1.00 (31/31) | 0 | 1 |
| Starter stand-in (`environment/app`) | 0.76 | 0.53 | 0.48 | 0 | 1 |
| S19 qwen3.8-max (live URL) | 0.00 | 0 | 0 | 0 | 0 |
| S20 minimax-m3 (live URL) | 0.22 | 0.15 | 0.07 | 35.6 | 1 |

- S19: its start screen has under 200 characters of text, so the shared gate (`text >= 200`) zeroes it before any check runs.
- S20: keeps the player identity in `localStorage`, so the second tab reopens the first player's waiting room and can never join; most of the round is not reached. Its slop points come from em dashes (50 per 1k words) and tiny text (42% of text).
- The starter is unstyled on purpose: it plays a round but has a small bottle, a linear spin, no button transitions, no chat sheet and no refresh persistence.

## What `tests/task.mjs` checks

Two tabs of one phone-sized context play a whole round: create a room with a passcode, join it by the room ID on screen, spin (the bottle's rotation is sampled on both tabs: total turn, acceleration, deceleration, final settle, same final angle), the picked player chooses Dare on its own screen, the other writes it on a separate screen, the picked player sees it, survives a refresh, and finishes into round 2. Then the chat sheet (80-90% height, close at top, scrollable list, input at the bottom, autoscroll, sync to the other tab, short 470px viewport for the keyboard, closes fully), a connection drop (`context.setOffline`), input sizes and labels, and the eight widths from the brief (no overflow, clipped text, overlapping buttons, bottle/spin/players on the first screen).

## What the golden reference fixes

- One vertical screen: logo, room ID and round on top; player 1, the bottle on an empty table, the spin button and player 2; chat and leave in a bottom bar. No dashboard panels, no hero copy, no badges or stats.
- Bottle spin with the Web Animations API from a shared `{from, to, startedAt, duration}` stored in the room, so both tabs land on the same angle; ease-in start, 4-5 turns, slow-down, small overshoot and settle; reduced-motion honoured.
- Truth-or-dare on separate screens per stage, each focusing its heading; 180ms button transitions, 240ms stage fades, no looping animation at rest.
- Chat as an 86dvh dialog sheet with backdrop, Escape and close button, `visualViewport` keyboard inset, fixed composer and autoscroll.
- Per-tab identity in `sessionStorage`, so refresh keeps the seat and game; offline banner and moves blocked while offline; subscriptions cleaned up.
- Rubric: no eyebrows, separator dots, em dashes, pills, gradients, emoji or pulsing dots; 16px inputs with visible labels.

## Invented inputs

The earlier game the brief optimises is not published. `environment/app/src` is a neutral unstyled stand-in with only the rules and flow (create/join a room with a passcode, spin, choose, write, show, chat) and a `localStorage` + `BroadcastChannel` "server" (`server.ts`). The delivery header says the two phones are two tabs and that each tab must be its own player. The room passcode is part of the stand-in, matching both original builds.
