# S13 rebuild design system (R38)

Tokens live in `src/index.css` (`@theme` and `@layer components`) and `src/lib/anim.tsx`.

## Type
- Display: Fraunces 400 for the hero and section titles (R32, R36).
- UI and body: Inter. Card and step titles 400 to 500, labels and buttons 500, body 400. Large numerals Inter 200.
- Uppercase only in the hero service ribbon and in small meta labels (Before/After chips, footer column heads, price item names).

## Colour
- Background `abyss` #04141f, flat. No gradients (R41).
- Grain (R42): a fine 110px SVG film grain, only on selected surfaces: `.grain` on Services, Process, Areas, the hero service ribbon and the footer; `.grain-light` on the light Results and Pricing sections. Why us, FAQ and Quote stay flat.
- Raised fill (R42): anything sitting on a background (header bar, panels, inputs, chips, secondary and icon buttons) uses `--raised` rgb(12 33 45 / 0.92), hover `--raised-hover`, so it covers the grain and reads as layered above it.
- Accent `cyan-300` #93bcc6 (muted sea-glass). Hover accent `cyan-200`.
- Borders: `white/10` at rest, `white/15` on controls, `cyan-300/40` for hover or selected surfaces.

## Radius
| Token | Value | Used for |
| --- | --- | --- |
| `rounded-md` | 6px | buttons, inputs, chips, options, small badges |
| `rounded-lg` | 10px | cards, panels, media frames, the scrolled header bar |
| `rounded-full` | full | circular icon buttons, dots, progress bars, the step markers |

## Components
- `.btn` + `.btn-primary` (filled accent) or `.btn-secondary` (outlined). `.btn-lg` for the hero CTA, the form submit and the mobile menu.
- `.icon-btn`: 44px circular icon button (carousel arrows, menu, share, back to top). `.icon-btn-solid` on light sections.
- `.option` / `.option-active`: selectable chips (services in the form, preferred contact, map towns). Groups of options always sit in an equal-column grid, never a ragged `flex-wrap` row (R43).
- `.surface`: functional frame (service carousel) with border `white/10`, radius 10px, `--raised` fill.
- Lists of content (Why us, Process steps, FAQ, contact links) are plain text separated by `white/10` hairline dividers, not cards (R41).

## Motion
- One easing curve everywhere: `cubic-bezier(0.16, 1, 0.3, 1)`.
- CSS transitions (hover, focus, colour): 200ms (`--default-transition-duration`).
- Framer Motion: `DUR.base` 0.4s for state changes (accordion, carousel, menu, form steps); `DUR.slow` 0.6s for opacity-only entrances; `DUR.draw` 1.2s for the map outline.
- Continuous motion only in the hero video, the service ribbon marquee and the loader ring. All of it stops under `prefers-reduced-motion`.
- Loader (R39): a text-free ring, shown for at most 400ms, then the page fades in.
