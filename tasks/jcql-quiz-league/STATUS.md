# jcql-quiz-league status

Design Arena tournament `9361f114-1137-4016-8e30-b5502f25340b`: a scoreboard plus an operator page for JCQL (Jagadish Chandra Quiz League) at the Jagadish Abas hostel.

## Scores (local grader, `tests/grade.mjs`)

| Build | reward | requirements | task | baseline | slop | slop points |
| --- | --- | --- | --- | --- | --- | --- |
| Golden `solution/app` (local and in Docker via `solve.sh` + `test.sh`) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 0 |
| S25 gpt-6-astra (live URL) | 0.58 | 1.00 | 1.00 | 1.00 | 0.16 | 78.7 |
| S26 muse-spark-1.3-max (live URL) | 0.46 | 0.74 | 0.69 | 1.00 | 0.19 | 63.4 |

S25 is functionally complete; it loses on slop (uppercase eyebrows, numbered round markers, em dashes, emoji icons, tiny text, heading accents). S26 also has a pulsing live dot, gradient text and big rounding, does not mark its sample teams, its scoring deck has no per-team score field the grader can set, and its edit and delete controls are unlabelled icon buttons.

## What the golden fixes

- Dark, quiet scoreboard in Fraunces and Inter with one brass accent; no eyebrows, em dashes, dot separators, numbered markers, emoji, gradients, glows or pulses; body text at 15px or larger (SlopLabel 417, 419, 421, 424, 426, 428, 430 on S25).
- Rows are always sorted high to low with shared ranks for equal scores, animated on reorder, with a proportional bar and a short score delta after each change.
- Operator page (`/operator`, linked from the scoreboard): add teams with an uploaded logo (resized to 256px and kept in `localStorage`, monogram fallback), edit name and logo, remove with confirmation, plus and minus by a chosen step or type a score, round label, undo, JSON backup download and restore, reset scores, clear sample teams.
- Sample league is labelled as sample data; changes reach an open scoreboard tab through the `storage` event; works from 360px, with a full screen button for the projector on wider screens.

## Invented inputs

- No team list or logos exist, so the sample league is invented: Night Owls 140, Room 214 125, Second Floor East 125, The Crescographs 110, Mess Hall Regulars 90, Wireless Wave 70, round "Round 4 of 6". Logos are generated monograms until the operator uploads real ones.
- The prompt asks for one HTML file; the delivery header keeps the benchmark's multi-file client-side React build and states the localStorage and two-tab constraints.
- Test fixtures in `tests/task.mjs`: teams "Quiz Team Alpha 41", "Quiz Team Bravo 52", "Quiz Team Charlie 63", "Quiz Team Delta 74", "Quiz Team Echo 85" and a solid rgb(200, 40, 120) PNG logo.
