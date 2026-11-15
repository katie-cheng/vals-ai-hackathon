# S06 rebuild design system

Tokens live in `src/index.css` (`@theme` and `@layer components`) and `src/components/UI.tsx` (`EASE`, `DUR`, `Reveal`, `SectionHeading`, `PageHero`, `MenuCard`).
The palette, typefaces, bold uppercase titles, red buttons and rounded shadowed cards are the brief's; this file fixes their values so every page uses the same ones.

## Type
- Display: Barlow Condensed 600, uppercase, for titles only (brief: "bold typography").
- UI and body: Manrope. Body 400, labels and buttons 500, emphasis 600. Nothing heavier.
- Both are self-hosted (`public/fonts`), preloaded, with metric-matched fallback faces so the swap does not move the page.
- No text under 12px. No uppercase or letter-spacing outside display titles.

| Class | Size (mobile / sm / lg) | Used for |
| --- | --- | --- |
| hero title | 44 / 60 / 68px, line-height 1 | home hero slides |
| `.page-title` | 36 / 48 / 56px | `PageHero` h1 |
| `.display-title` | 30 / 36 / 40px | section h2 (`SectionHeading`) |
| `.card-title` | 20px | card and column h3 |
| `.lead` | 15px / 28px line | section intro, body |
| UI | 14px (13px in chips, small buttons, field labels) | controls |

## Colour
- `brand` #f1001f, hover `brand-dark` #c90019. Used for primary buttons, the cart count, the promo band, focus rings, links on hover and star ratings.
- Black #000 (header, hero, footer, reviews band), white, `cream` #f6f4ef (page background, alternating sections, with a faint dot texture `.paper-texture` kept from the original).
- Text: #0a0a0a on light, `neutral-600` for secondary; white, `white/80` and `white/70` on dark.
- Borders: `black/10` (dividers, chips), `black/15` (fields), `black/[.07]` (cards), `white/10` to `white/40` on dark.
- Gradients only over photographs, for legibility (kept from the original, Katie R2): `.hero-vignette`, `PageHero`, category tiles, `MenuCard` photo, promo band, item dialog, gallery tiles, About photographs. No glows, no gradient text, no gradient on hover.

## Radius
| Token | Value | Used for |
| --- | --- | --- |
| `rounded-md` | 6px | buttons, inputs, chips, tags, thumbnails |
| `rounded-lg` | 10px | cards, photographs, panels, dialogs, map |
| `rounded-full` | circle | icon buttons, cart count, tracker step markers, spinner |

## Elevation
- `.card`: 1px `black/[.07]` border + `0 1px 2px rgba(0,0,0,.05)` (brief: "rounded cards with subtle shadows").
- `shadow-sm` on floating controls; one larger `shadow` on the cart drawer and dialogs. No coloured shadows.

## Layout
- `.container-site`: max 1200px, gutters 20 / 32 / 48px.
- `.section`: 56px vertical padding, 80px from `sm`.
- 12-column grid; splits are 5/7 or 7/5; card grids 2 / 3 / 4 columns with 16 to 24px gaps.
- Heading to intro 12 to 16px; heading block to content 32 to 40px.
- Text-with-dividers (`.rule-list`) instead of icon cards for facts: Why Rocksteady, location, contact details, About values.

## Controls
- `.btn-primary` (red), `.btn-dark`, `.btn-outline`, `.btn-white`: 44px high, 20px side padding, 6px radius, 14px medium, sentence case, never wraps. `.btn-sm` is 36px.
- `.icon-btn`: 40px circle.
- `.chip` / `.chip-active`: 36px, 6px radius; every filter on Menu, Order and Gallery. Active is black. Uses `aria-pressed`.
- `.field` + `.field-label`: 14px, 6px radius, black border on focus; errors are text with `role="alert"`.
- Focus: 2px brand outline, 2px offset, on every interactive element.
- Icons (Lucide) only where the icon is the control or a state: cart, account, menu, close, search, favourite, quantity, socials, lightbox arrows, password reveal, mobile tab bar, admin navigation. One arrow on the hero primary button.

## Motion
- Easing `cubic-bezier(0.16, 1, 0.3, 1)`; durations 200ms (hover, colour), 300ms (`DUR.base`: drawer, dialog), 500ms (`DUR.slow`: `Reveal`), 700ms (hero crossfade).
- `Reveal`: opacity only, once, no stagger, no offset.
- Hero: five stacked slides crossfade every few seconds; nothing changes size. Thumbnails select a slide.
- Hover changes colour or opacity; nothing lifts, scales or glows.
- No looping animation except the loader ring.
- `prefers-reduced-motion`: reveals render visible, the hero does not auto-advance, transitions are cut.
