You are working in `/app`, a Vite + React + TypeScript project with its dependencies already installed.
Build the game described in the brief below inside this project.

Delivery requirements:
- `npm run build` must succeed and write a static site to `/app/dist`. The site is served from `/app/dist` as static files at `/`, with any path that has no file extension falling back to `index.html` so client-side routes work, and opened in Chromium at desktop and phone sizes.
- Keep it a client-side Vite + React app: no Next.js, no server, no SSR. Add Phaser 3 and any other npm packages you need; the network is available.
- There is no backend. Progress, currency, boosters and settings live in the browser (`localStorage`).
- The first screen (the splash leading to the main menu) must link to the game's screens, and every screen must load without console errors. Every image and sound you reference must actually load.
- Generate the artwork and sounds yourself (for example as SVG rendered to PNG/WebP, or synthesized audio); no screenshots of other games.

---

# PEBBLE POP — COMPLETE GAME DEVELOPMENT PROMPT
Build a complete, production-quality 2D casual puzzle game called **Pebble Pop** using React, Vite, TypeScript and Phaser 3. This must be a fully playable, polished game—not a static UI prototype. Implement every screen, gameplay mechanic, asset, animation, progression system and interaction.
## 1. GAMEPLAY & CORE MECHANICS
Pebble Pop is a relaxing color-matching game where players drop illustrated colorful pebbles into a transparent glass jar.
Core rules:
- 7 columns × 8 rows grid.
- Seven standard pebble varieties.
- Tap a valid column to drop the current pebble.
- Match 3 or more identical orthogonally connected pebbles to clear them.
- Diagonal matches do not count.
- Cleared pebbles award points and create space.
- Automatically detect and resolve cascading matches.
- Each successful drop consumes one move.
- Show the next pebble preview.
- Complete level objectives within the move limit.
- Detect full columns and invalid moves correctly.
- Prevent accidental double inputs during animations.
Use deterministic grid-based logic, not unpredictable physics. The jar should look like a physical glass container, but gameplay must remain reliable and predictable.
Implement a proper game state machine:
READY → DROPPING → MATCHING → CLEARING → CASCADING → READY.
Support LEVEL\_COMPLETE, LEVEL\_FAILED and PAUSED states. Never allow input during incompatible animation states.
## 2. ORIGINAL ARTWORK & ASSET GENERATION
Create a distinctive handcrafted woodland aesthetic. Use warm forest greens, amber, river blues, natural textures, illustrated foliage and beautiful organic details.
Avoid generic mobile-game templates, excessive gradients, emoji substitutes and repetitive AI-style card layouts.
Generate original, reusable assets:
**Pebble sprites:**
- Orange leaf
- Blue swirl
- Purple flower
- Green leaf
- Red blossom
- Yellow sun
- Pink flower
Each variety needs a distinct illustration, color palette and recognizable appearance.
**Special sprites:**
- Frozen pebble
- Stone obstacle
- Flower obstacle
- Crystal
- Golden star
- Lock
- Power-up icons
**Environment assets:**
- Forest, river and waterfall backgrounds.
- Trees, flowers, bushes, rocks and foliage.
- Wooden signs, bridges and lanterns.
- Separate foreground and background layers.
**UI assets:**
- Original logo and app icon.
- Buttons with normal, pressed and disabled states.
- Parchment panels and wooden elements.
- Level nodes, stars, medals and reward icons.
- Counters, progress bars, navigation icons and popups.
**Effects and animations:**
- Falling and bouncing pebbles.
- Match and clearing effects.
- Sparkles, leaves and particle bursts.
- Combo effects and score popups.
- Star celebrations and transitions.
Generate actual image assets and transparent spritesheets where appropriate. Organize assets into reusable, clearly named files. Never use screenshots of the reference UI as game assets.
## 3. COMPLETE SCREEN IMPLEMENTATION
Every screen must be functional and connected to real application state.
**Splash Screen:** Animated logo, floating pebbles and smooth transition.
**Main Menu:** Beautiful woodland illustration, Play, Levels, Daily Challenge, Shop, achievements and settings.
**World Map:** Four illustrated chapters with winding paths, bridges, rivers, decorative objects and level markers.
**Level Selection:** Numbered nodes, completed stars, locked states, current-level highlight and chapter navigation.
**Level Introduction:** Level number, objectives, move limit, pebble illustrations and Start button.
**Gameplay:**
- Level number and pause button.
- Objective counters.
- Remaining moves and score.
- Large central transparent jar.
- Individually rendered interactive pebble grid.
- Current and next pebble previews.
- Three functional power-up controls.
- Beautiful glass reflections, wooden base and rope details.
**Pause:** Resume, restart, settings and exit with confirmation dialogs.
**Level Complete:** Animated stars, final score, earned rewards, best score, Next Level, Replay and Home.
**Level Failed:** Failure explanation, retry and level selection.
**Settings:** Functional music, sound, vibration and language controls. Include How to Play and About.
**Shop:** Simple in-game currency and booster rewards. No real-money purchase infrastructure.
## 4. 40-LEVEL PROGRESSION
Build four chapters containing ten individually configured levels each.
**Chapter 1 — Mossy Grove (1–10)**
- Introduce basic matching.
- Gradually increase target quantities.
- Teach cascades and strategic placement.
**Chapter 2 — Frost Hollow (11–20)**
- Introduce frozen pebbles.
- Adjacent matches unlock frozen pieces.
- Introduce restricted spaces.
**Chapter 3 — Blossom Creek (21–30)**
- Introduce flower obstacles.
- Clear surrounding pebbles to remove obstacles.
- Introduce mixed objectives.
**Chapter 4 — Autumn Ridge (31–40)**
- Introduce stone obstacles.
- More demanding combinations.
- Multiple objectives and tighter move limits.
Every level must have its own data configuration:
- Initial board.
- Available pebble types.
- Objectives and target quantities.
- Move limit.
- Obstacles.
- Difficulty.
- Three-star score thresholds.
- Rewards.
Use reusable level configuration files, not hardcoded individual screens. Make layouts deterministic and testable. Ensure every level is solvable and difficulty increases progressively.
Unlock levels and chapters through actual completion. Display earned stars and saved progress.
## 5. POWER-UPS
Implement three fully functional boosters:
**Hammer:** Remove one selected pebble or permitted obstacle.
**Swap:** Exchange two adjacent pebbles.
**Bomb:** Clear a small surrounding area.
Each needs an original sprite, inventory counter, selection state, animation, cancellation and correct inventory deduction. Award boosters through progression and rewards.
## 6. SCORING & GAME LOGIC
Implement separate, reusable modules for:
- Board generation.
- Pebble placement.
- Match detection.
- Connected-component resolution.
- Clearing and cascading.
- Obstacle handling.
- Objective tracking.
- Move management.
- Scoring and star calculation.
- Booster inventory.
- Level completion and failure.
Ensure counters update accurately, cascades resolve correctly, and impossible board states have a recovery mechanism.
## 7. ANIMATION & AUDIO
Create polished micro-interactions:
- Pebbles fall with subtle bounce.
- Matching pieces pulse before disappearing.
- Cascades receive stronger visual emphasis.
- Counters animate when values change.
- Progress bars update smoothly.
- Stars appear sequentially.
- Buttons have responsive touch states.
- Panels use restrained transitions.
- Foliage has subtle ambient movement.
Add original or properly licensed sounds for dropping, matching, combos, boosters, buttons and level completion. Include optional relaxing background music. Music and sound must have independent settings.
## 8. TECHNICAL REQUIREMENTS
Use React + Vite + TypeScript and Phaser 3.
- Separate React UI from Phaser gameplay.
- Mobile-first portrait design.
- Responsive desktop presentation.
- Reusable components and centralized state.
- Structured level data and asset directories.
- Save progress using localStorage.
- Persist unlocked levels, stars, best scores, currency, boosters and settings.
- Restore progress after reload.
- No backend dependency.
- No sensitive permissions.
- No notification functionality.
- No unnecessary export/import or backup systems.
Use WebP for backgrounds and illustrations where appropriate, PNG for transparent sprites when necessary.
## 9. FINAL QUALITY STANDARD
Test all 40 levels, navigation routes, gameplay states, power-ups and progression.
Verify match detection, cascading, move limits, objectives, scoring, stars, unlocking, restart, persistence and settings.
Ensure:
- No dead buttons.
- No broken navigation.
- No impossible levels.
- No overlapping mobile controls.
- No missing assets.
- No placeholder artwork.
- No unfinished screens.
- No fake functionality.
**Priority:** Deliver a complete, genuinely playable casual game with original handcrafted artwork, beautiful environmental illustrations, satisfying matching mechanics and carefully balanced levels. Every screen must be implemented, every interaction must work, and every visual asset must be intentionally designed. Quality of execution matters more than unnecessary feature count.
