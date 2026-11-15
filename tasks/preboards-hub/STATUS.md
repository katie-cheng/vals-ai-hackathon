# preboards-hub: status

Brief: Design Arena tournament `7b9d98db-4206-4d31-9dd7-4bcee3c673e4`, "Preboards Hub" glassmorphism study and exam countdown dashboard (S21 `gpt-6-astra`, S22 `claude-opus-5-5`). Neither site has SlopLabel labels or an overall comment yet, so the golden follows `tasks/reference-rubric.md` and the shared slop checks.

## Scores (local grader, `tests/grade.mjs`)

| Site | reward | requirements | task | slop | slop points |
|---|---|---|---|---|---|
| golden `solution/app` (`--dist`) | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| golden in Docker (`solve.sh` then `test.sh`) | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| S21 gpt-6-astra (live URL) | 0.590 | 0.875 | 0.853 | 0.306 | 34.1 |
| S22 claude-opus-5-5 (live URL) | 0.657 | 1.000 | 1.000 | 0.313 | 32.9 |

S21 misses frosted glass (no `backdrop-filter` anywhere), never labels the widget "AI Voice Companion", and none of its reminder controls call `Notification.requestPermission`. Both originals lose most points on slop: S21 has 74% of its copy under 12px and 16 uppercase eyebrows; S22 has emoji icons, about 13 em dashes per 1000 words, 12 eyebrows, dot separators and pills.

## What the golden fixes

- No eyebrows, emoji, em dashes, dot separators, gradient text, pills or numbered markers; body copy is 13px and up; radii stay at 8 to 16px.
- One label per action: subject rows are a single button (name plus status) so repeated statuses are not repeated CTAs.
- Countdown units are plain numbers (no zero padding, which reads as 01/02 markers), large on desktop and two by two on phones.
- All brief features work and persist: theme, exam date and name, subjects and statuses, goals (with optional due time), focus count, Pomodoro state and fired milestones in `localStorage`.
- The voice companion answers from local study data (countdown, goals, revise list, Pomodoro) and reads replies with `window.speechSynthesis`; visual toasts back up every system notification.

`SLOP_EXEMPT`: `pulsing_dots`, because the brief asks for an "AI Voice Companion" widget featuring an animated sound wave or pulsing orb visualizer.

## Invented inputs

None needed: the brief references no external assets. Starter subjects, goals and quotes are sample content. Tailwind and Plus Jakarta Sans are bundled through npm instead of CDNs (the delivery header says so) because the verifier runs offline.

## task.mjs notes

Checks are generic (no golden selectors): a collapsed "Add ..." form is opened before looking for the input, a strike line drawn by a pseudo-element counts as strikethrough, a persisted Pomodoro is returned to focus mode before the session-alert check, and the quote and notification checks try labelled icon buttons and up to three reminder controls.
