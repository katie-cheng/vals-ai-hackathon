
## 5. Brief requirements checklist

Status: **met**, **partly** (a smaller version of what the brief asks for), or **dropped** (removed on purpose because of a critique, which is named). The brief asks for far more animation than a usual business site. Katie's R3 (no glows/gradients) and R14 (simpler, lighter animation) rank above it, so this reference keeps the content and functionality and trades away decorative motion.

| Brief section | Requirement | Status | Where / why |
| --- | --- | --- | --- |
| 1 Hero | Full-screen cinematic background of exterior cleaning | met | `hero-wash.mp4` video over a preloaded photo (R17) |
| 1 Hero | Large typography that animates into position | met | Headline lines fade and rise in |
| 1 Hero | Words appearing individually | dropped | R14 (and F30 / S14 #332): the headline animates as whole lines |
| 1 Hero | Spray, droplets, sunlight, particles, parallax, cursor-reactive droplets | dropped | R14, R3 |
| 1 Hero | Animated CTA buttons, dramatic transition into the next section | partly | Hover colour transitions, a soft hero fade (R18) and the service ribbon with uppercase labels and icons (R28) |
| 2 Cleaning effects | Water, foam, sparkle, dirt disappearing | partly | Shown by the before/after slider (dirt disappears as you drag) and the service photos and video; decorative effects dropped (R14) |
| 3 Before/after | Siding, driveways, exterior and interior windows, gutters, patios | met | Six comparisons with geometry-matched images (F13; illustrative, flagged [A]) |
| 3 Before/after | Interactive slider | met | Drag, click and keyboard (checks.py) |
| 4 Services | Pressure washing, exterior windows, interior windows, gutters, house washing, driveway/patio | met | All six in the service switcher (F10 [A]) |
| 4 Services | Per-service custom animation | dropped | R14; each service keeps its photo/video and copy |
| 5 Scroll | Sections animate into view, progressive text reveal | met | Short fade/slide reveals |
| 5 Scroll | Horizontal service showcase | met | Service switcher with swipe |
| 5 Scroll | Animated number counters | dropped | #255/#256 (stat tiles removed); Katie to confirm |
| 5 Scroll | Moving graphic connecting sections | met | Scroll-filled process line |
| 5 Scroll | Parallax, zoom, sticky changing content, sections transitioning into each other | dropped | R14 |
| 6 Backgrounds | Moving water textures, animated gradients, bubbles, particles, cursor effects | dropped | R3, R14; the hero video and window-cleaning video stay as moving photography |
| 7 Navigation | Animated nav bar and mobile navigation | met | Header hides/shows on scroll; animated menu panel |
| 7 Navigation | Magnetic / cursor-responsive buttons | dropped | R14 |
| 7 Navigation | Animated arrows, moving underlines | partly | Hover transitions only |
| 8 Process | Four steps (estimate, schedule, clean, review) | met | Copy kept verbatim |
| 8 Process | Steps connected by an animated line | met | Line fills on scroll |
| 9 Trust | Professional service, detail, scheduling, quality, residential, interior and exterior windows | met | Six cards |
| 9 Trust | No invented certifications, insurance, testimonials, ratings, years | met | None present |
| 10 Contact | Interactive form fields, focus states, success and error messages, responsive | met | checks.py: empty submit blocked, non-CT ZIP rejected, valid request succeeds |
| 10 Contact | Submissions go to the configured email | partly | Same client-side behaviour as the live app (no backend in either); real delivery needs the business's endpoint |
| 10 Contact | Animated background, moving typography | dropped | R8 (outlined background text), R14 |
| 11 Footer | Large typography, navigation links, share, quote button | partly | Footer heading reduced (R1); duplicate quote button removed (R10) |
| 11 Footer | Moving background, water effects | dropped | R14 |
| 12 Technical | Framer Motion, CSS keyframes, SVG animation | met | Framer Motion, SVG map, CSS marquee |
| 12 Technical | Respect reduced motion | met | `MotionConfig reducedMotion="user"` plus CSS; checks.py |
| 12 Technical | No lag, broken layouts or slow loading | met | No overflow 360–1440 px; no console errors or failed requests |
| Final | Preserve all business information and working functionality | met | Phone, email, towns, prices, FAQ and quote flow kept |
| Final | Substantially more animation than a typical business site | dropped | R14: Katie's critique ranks above the brief for this reference |
