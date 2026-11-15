# Kora reference: design system

Everything on the ten routes is built from the tokens below (`src/index.css`). If a page needs something that is
not here, the answer is to reuse one of these, not to add another.

## Type

One family, Manrope (variable, self-hosted in `public/fonts`, preloaded, with a metric-matched fallback so the swap
moves nothing). Hierarchy comes from the size steps; weight is 600 for headings, figures and
the logo, 500 for buttons, 400 for everything else. No italics, no second family, no uppercase, no letter-spaced labels.

| Role | Class | Size |
| --- | --- | --- |
| Page title | `display-xl` | 40 to 68px |
| Section title | `display-lg` | 36 to 56px |
| Sub-section title | `display-md` | 28 to 40px |
| Card title, quote | `display-sm` | 20 to 24px |
| Figure | `figure` | 20, 30 or 40px |
| Lede | `lede` | 17px |
| Body, UI, labels | | 15px |
| Meta (dates, captions) | | 14px, the smallest text on the site |

## Colour

Cream page (`cream-50`), one tinted band colour (`cream-100`), ink text (`ink-900`, `ink-700`, `ink-500`), two
dark surfaces (`ink-900`, `pine-950`) and one accent, pine green (`pine-700`), used for the primary button and
small confirmations. No gradients except the scrim that keeps the hero headline readable over the video.

## Shape

| Token | Value | Used for |
| --- | --- | --- |
| `rounded-md` | 6px | buttons, inputs, toggle groups (the segment inside a toggle group is 4px so it nests) |
| `rounded-lg` | 10px | images, video |
| circle | | icon-only buttons (menu, arrows, video, back to top) |

No pills, no card boxes: groups are separated by a 1px rule and space. No shadows.

## Layout

`container-x` (max 1280px; gutters 24px, 40px from `md`, 96px from `lg`), a 12-column grid from `lg`, and one
vertical rhythm, `section-pad` (64 to 104px). Buttons are 44px high and never wrap; filter and billing toggles are 36px.

## Controls

`btn btn-primary` (pine), `btn btn-secondary` (outline), `btn btn-light` / `btn-ghost-light` (on dark),
`icon-btn`, `text-link` (underlined), `field`. One primary action per view. An arrow icon marks actions that leave
the page for the booking form; plus and minus mark accordions; a check marks an included item. Nothing else has an icon.

## Motion

One easing, `cubic-bezier(0.22, 1, 0.36, 1)`; 200ms for hover and focus, 500ms for entrances.

| Motion | Where | Why it stays |
| --- | --- | --- |
| Fade with a 12px rise, once, in document order | sections, headings, images | the brief's "appearing animation" |
| Scroll-linked word highlight | "Most agencies sell deliverables" statement | the brief's "scrolling transition" |
| Scroll progress bar | under the header | brief |
| Client marquee, 40s, pauses on hover and focus | home | brief (reference component) |
| Count-up, constant width | stat figures | brief (reference component) |
| Route fade | every navigation | brief ("transition") |
| Loader ring, at most 400ms | first load | brief (reference preloader), reduced to no text or counter |
| Hero video with a pause button | home | original asset |

Nothing pulses, floats, tilts, scales on hover, follows the cursor or changes the scroll speed. Under
`prefers-reduced-motion` content is shown at once, the marquee and the video stop and transitions are instant.

## Texture

A fine film grain (7% opacity) on the two dark surfaces only (`grain-surface`), under the content.
