# S02 rebuild design system

Tokens live in `src/index.css` (`@theme` + `@layer components`). Pages use the component classes below, not one-off values.

## Type

| Role | Family | Size / line | Weight | Used for |
| --- | --- | --- | --- | --- |
| Display | Inter Variable | 36/40px (48/53px from 640px) | 400 | hero h1 |
| Display 2 | Inter Variable | 30/36px | 400 | landing section h2 |
| Page title `.page-title` | Inter Variable | 28/36px | 500 | h1 on every inner page |
| Section title `.section-title` | Inter Variable | 20/28px | 650 | h2 inside a page |
| Item title `.item-title` | Inter Variable | 16/24px | 600 | row and list titles |
| Lead `.lead` | Inter Variable | 16/26px (18px in the hero) | 400 | one paragraph under a title, max 44rem |
| Body | Inter Variable | 14 to 16px | 400 | descriptions |
| Meta `.meta` | Inter Variable | 13/20px | 400 | counts, dates, durations |
| Control | Inter Variable | 14/20px | 600 buttons, 500 nav, labels and badges | buttons, nav, options |
| Code | JetBrains Mono | 13/21px | 400 | code, timers, serial codes |
| Certificate | Cinzel | 18 to 48px | 600 | certificate page only (original asset) |

Rules: 13px is the smallest size anywhere (the original used 10 to 12px for most text). No uppercase, no letter-spaced labels.
Phrase-length display headings are thin (400) so a whole sentence is not shouted; weight goes to short labels (R3, R4).
Fonts are self-hosted in `public/fonts`, preloaded, and awaited before first paint (R8).

## Colour

| Token | Value | Meaning |
| --- | --- | --- |
| `page` | `#0b0f19` | page background (original) |
| `raised` / `raised-hover` | `#0f172a` / `#1e293b` | functional frames, hover |
| `line` / `line-strong` | slate-400 at 16% / 32% | hairlines, control borders |
| `ink` / `ink-2` / `ink-3` | `#f1f5f9` / `#cbd5e1` / `#94a3b8` | text: primary, secondary, meta |
| `accent` | `#38bdf8` | primary action, links, current nav, selection |
| `ok` | `#34d399` | completion: progress done, completed, passed, earned |
| `quiz` (= `warn`) | `#fbbf24` | quizzes and certificates, bookmarks |
| `admin` | `#c084fc` | admin role and admin-only actions, instructor |
| `indigo`, `orange`, `bad` | `#818cf8`, `#fdba74`, `#fb7185` | code keywords, HTML tab, errors and destructive actions |

Every hue is the original's, used for the meaning the original gave it (R1, R5, R6). Colour is always flat: no gradients, glows, coloured shadows or blur.

## Shape, spacing, grid

- Radius: 6px controls and badges, 10px frames, full only for avatars, the play button and progress tracks.
- Container `.container-page`: max 72rem, gutters 20 / 32 / 48px. Pages `.page`: 40px top, 64px bottom. Two-column pages use a 12-column grid with a 32px gap (4 + 8, or 8 + 4).
- Frames `.surface` only where the frame is functional: the code card, player, editor, preview, console, table, menus, dialogs, notices, the dashboard resume panel and the certificate. Lists are `.rows` (hairline-separated text rows), not cards.

## Controls

| Class | Spec |
| --- | --- |
| `.btn` | 40px high, 16px inline padding, 6px radius, 14px/600, never wraps. `.btn-sm` is 32px. |
| `.btn-primary` / `.btn-quiz` / `.btn-admin` | solid accent / amber / purple with dark text |
| `.btn-secondary` | raised fill, strong hairline |
| `.icon-btn` | 40px square, icon 20px |
| `.option` | 36px high filter, tab or segment; selected = accent border and 16% accent fill (`aria-pressed` / `aria-selected`) |
| `.field` | 40px high input/select, strong hairline, accent border on focus, `bad` border when invalid |
| `.badge` | 24px high, 13px/500, outline; real state only (passed, earned, locked, correct, role) |
| `.link` | accent text, underline on hover; `.link-quiz`, `.link-admin` recolour it |

Toggle buttons (bookmark, mark as done, copy, upvote) have a fixed width so the label change does not move anything.

## Icons

One set (Lucide), one stroke (1.75), 16px in buttons and badges, 20px in icon buttons. Used only for state (check, lock, bookmark, correct/incorrect) and for actions (play, run, save, export, print, copy, reset, upvote, search, menu, chevrons). No icon tiles, no emoji, no icons on nav links, feature titles or chapter rows (R2).

## Motion

- Colour, border and background transitions: 200ms, `cubic-bezier(0.16, 1, 0.3, 1)`. Progress width: 400ms.
- `.fade-in`: 200ms opacity fade when a menu, panel, tab panel, dialog or message appears (R7). Opacity only.
- Nothing loops, nothing moves on hover, no entrance animation on page load. `prefers-reduced-motion` cuts everything to 0.01ms.
