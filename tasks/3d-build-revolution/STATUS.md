# 3d-build-revolution status

The brief is the one Design Arena tournament 7fc12f84 gave S23 (qwen3.8-max) and S24 (muse-spark-1.2): a minimal premium glass redesign of the 3D BUILD REVOLUTION house-configurator site, kept verbatim.
It asks for "cursors from everywhere", drag, drop and resize, scroll animations, roof/windows/walls/floor/height/paint options, a customisation-prompt form and fake reviews.
The delivery header lets the cursors be simulated and the prompt form work on the client, because the benchmark has no backend or multiplayer server.

| Site | reward | requirements | task | slop | slop points |
| --- | --- | --- | --- | --- | --- |
| S23 qwen3.8-max (live URL) | 0.43 | 0.70 | 0.64 | 0.17 | 75.2 |
| S24 muse-spark-1.2 (live URL) | 0.37 | 0.58 | 0.49 | 0.16 | 80.7 |
| golden reference (`solution/app`) | 1.00 | 1.00 | 1.00 | 1.00 | 0 |

The golden site also scores 1.00 in the Docker image (`solution/solve.sh` then `tests/test.sh`).

S23 has a real configurator, a working brief form and a reviews section, but nothing can be dragged, dropped or resized (it only has size sliders, and no grab, move or resize cursors), it has one glass panel, and its phone controls are under 24px.
Its points come mostly from eyebrows (19.4), pills (16.5), dot separators (11.4), tiny text (8.1) and numbered markers (7.5).
S24 is mostly a landing page: it has no labelled option groups, no prompt form, no reviews and no working phone menu.
Its points come mostly from dot separators (17.7), eyebrows (16.3), pills (15.9), em dashes (8.1), tiny text (6.3) and heading accents (6).
No SlopLabel labels exist for S23 or S24, so the golden site was built against `tasks/reference-rubric.md` and the shared checks.

## What the golden site does
- A light, muted stone palette with frosted glass panels, one serif display face and Inter, no eyebrows, pills, gradients or emoji icons.
- An SVG 3D house you can rotate by dragging or with the arrow keys, redrawn from the configuration: roof form, pitch and covering; window style and frame colour; wall material; floor finish; storeys and storey height, width and depth; paint colour.
- A front-elevation editor: drag a window or door from the palette onto the wall, drag openings to move them, drag a corner handle to resize them, and drag the wall edges to change width and height. Openings can also be added, moved and resized from the keyboard.
- Simulated collaborators: named cursors that drift in from the edges of the screen (a toggle stops them; they stay still under reduced motion).
- Scroll reveals and a hero model that turns as you scroll.
- A brief form (name, email, prompt, optional attached design summary) with validation and a stored confirmation reference.
- Six sample reviews at the bottom, marked as written for the presentation.

## Invented inputs
The prompt starts "Is it done? I need to make changes to the website", but there is no earlier site to give the agent, since each arena model built its own.
`environment/app/existing-site/index.html` is a plain, unstyled stand-in holding only the facts the prompt gives (name, tagline, a 3D house builder, a contact line), and the delivery header says so.
