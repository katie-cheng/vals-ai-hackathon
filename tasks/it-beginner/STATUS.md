# it-beginner: status

Design Arena tournament `05097c11-f54e-4ad4-928e-a1236623eecc`. The prompt asks to improve or reconstruct
https://github.com/AjinLab/it-beginner-website and make it production-ready.

## Scores (local grader, `tests/grade.mjs`)

| site | reward | requirements | task | slop pts |
|---|---:|---:|---:|---:|
| golden (`solution/app`) | 1.00 | 1.00 | 1.00 | 0 |
| S01 gpt-6-astra (mirrored dist) | 0.41 | 0.69 | 0.62 | 94 |
| S02 gemini-3.8-flash (mirrored dist) | 0.36 | 0.62 | 0.57 | 129 |

Docker (`solution/solve.sh` then `tests/test.sh` in the task image): reward 1.00, task 1.00, slop 0 (an earlier 0.97 run predates the quiz-check fix).

S01 is missing a dashboard, search, sign-in/register and an admin area; its lesson page has no player or notes.
S02 is missing search and auth pages and loses most of its slop score to broken controls at phone widths,
pulsing dots, tiny text and gradient text.

## Golden reference

Starts from the de-slopped S02 rebuild in `references/S02/solution`, then:

- adds real client-side accounts (`/login`, `/register`, localStorage), shows the source repo's demo admin
  credentials (`admin@itbeginner.com` / `admin123`) on the sign-in screen and gates `/admin` on the admin role,
- replaces the role-switch toggle with sign-in/sign-out, and the admin page lists only real registered accounts,
- removes seeded fake learner activity (progress, notes, discussions, streaks, avatars from Unsplash),
- keeps the source's 6 chapters / 42 lessons, quizzes, playground, search, resources, certificates and profile,
- fixes from review: exports full lesson progress and snippets, previews the selected snippet, and only opens
  JavaScript references in the lesson scratchpad.

## Inputs

- Existing site: the real GitHub repo was fetched and copied to `environment/app/existing-site/`. Nothing invented.
- The source's lesson videos are not in the repo, so the lesson player shows a placeholder (stated in the header).
- The source's Express/SQLite backend becomes browser storage (stated in the delivery header).

## Shared verifier

No shared-verifier changes. `tasks/sync-verifier.sh --check` passes.
