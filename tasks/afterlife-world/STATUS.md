# afterlife-world status

Design Arena tournament `2a5d49ef-429e-4496-8f5a-8a23a4bf2302`, originals S09 (kimi-k3.1-pro) and S10 (claude-sonnet-5-5).

| Site | reward | task | baseline | slop | slop points |
| --- | --- | --- | --- | --- | --- |
| golden (`solution/app`, local) | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| golden (Docker: `solve.sh` then `tests/test.sh`) | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| S09 https://afterlife-nexus-9wm7.arcada.app | 0.498 | 0.458 | 0.667 | 0.512 | 14.3 |
| S10 https://afterlife-world-53em.arcada.app | 0.619 | 0.770 | 1.000 | 0.438 | 19.2 |

## What the golden fixes
- S09: almost every line of UI is tiny monospaced eyebrow text (58% tiny-text share), with coordinates and "NEXUS / WORLD 01" style labels, overused purple, a heading accent and numbered gathering markers. The golden uses one serif display face and Inter, at readable sizes, with no eyebrows.
- S10: em dashes everywhere (29.5 per 1k words), a two-colour heading accent, eyebrows, pills, a duplicate CTA, controls that break between 360 and 1100px, and a "server address" field the player has to fill in. The golden has no em dashes and uses a single CTA per job. Controls stay usable at every width.
- Neither original has a working notification centre with per-kind preferences, mute, unread count and history, or an honest Android section. The golden has all of them. It asks for browser permission only after an explanation the player opens, and it says plainly that closed-site push and the APK need infrastructure that does not exist (hosted push server and VAPID keys, FCM, signing keystore, Android SDK).
- Real-time: open tabs share one world over BroadcastChannel (the WebSocket stand-in). Chat, presence, purchases, homes and notifications all show up live. A browser-local server handles PBKDF2 password hashing, sessions and server-side validation (balance, distance to a light, friendship before DMs, plot limits).

## Invented and missing inputs
- No backend, push server, WebSocket server, Android SDK or keystore exists in the benchmark. The delivery header says so, and the golden is honest about it: there's no APK link, no fake version or size and no download counter. `/android` lists what the release needs and documents the signing process.
- World content is invented: Lantern Plaza, the market stalls, hillside/shore plots, lumens as currency, gatherable lights and the event schedule. The hero image is a screenshot of the golden's own 3D world.

## Grader notes
- In headless Chromium, `Notification.permission` is `denied`. `task.mjs` presents it as `default` and counts `requestPermission` calls, so it can check consent-gated prompting.
- Keyboard, mouse and joystick checks compare screenshots taken before and after input against the frame's own idle change, so an animated scene doesn't pass for free. S09's world didn't move under synthetic WASD or a mouse drag. It may need pointer lock or focus that a real player would grant.
