# chez-amazigh status

Design Arena tournament `d7aa0332-ab63-4633-b425-65a215d554e0`: Gîte chez l'habitant Amazigh, a family guesthouse in Ghassate near Ouarzazate.

## Scores (final `tests/task.mjs`)

| Build | reward | requirements | task | baseline | slop points |
|---|---|---|---|---|---|
| Golden `solution/app` (Docker: `solve.sh` then `test.sh`) | 1.00 | 1.00 | 1.00 | 1.00 | 0 |
| S27 claude-sonnet-5-5 (live URL) | 0.5165 | 0.902 | 0.9255 | 0.5333 | 99.5 |
| S28 claude-opus-4-8 (mirrored dist) | 0.5968 | 0.8733 | 0.8653 | 1.00 | 31.8 |

S27 has no photographs (hero and gallery are empty), no WhatsApp button, CSP console errors, overflow at phone widths, French nav links on Arabic pages, and many broken controls and tiny text. S28 has no alternative listing name, a contact form with no submit button ("contact details will be available soon"), no WhatsApp channel, and em dashes and duplicate CTAs.

## What the golden fixes
- Eight standalone routes: `/`, `/story`, `/accommodation`, `/gastronomy`, `/experiences`, `/gallery`, `/location`, `/contact`. Each loads directly and has a full FR/EN/AR translation, with real Arabic RTL (`dir=rtl`, Noto Naskh/Sans Arabic, mirrored layout).
- All business facts are in `src/config/site.ts`: address, GPS, Booking.com/Airbnb links, and the Booking.com ratings with attribution. WhatsApp, phone and email are empty `VITE_CONTACT_*` fields, so no contact details are invented.
- The inquiry form has arrival/departure dates, a guest stepper, a reply channel, a honeypot field and client-side validation that rejects past or out-of-order dates. Its confirmation step says plainly that this is not a reservation. It hands off to WhatsApp or email only once those are configured; until then it falls back to Booking.com/Airbnb.
- 22 real property photographs (taken from the Airbnb listing) with a filterable gallery and a keyboard-operable lightbox. There is an OpenStreetMap embed plus Google Maps directions.
- No exact capacity or bed counts. Sauna and pets are shown as "to confirm", meals as "on request", and policies carry a confirmation caveat before direct reservations.
- Editorial palette (sand/terracotta/olive/cream/brown), Cormorant Garamond + DM Sans, square corners, no gradients, no eyebrows or emoji. Includes lodging JSON-LD, sitemap and robots.

## Invented inputs
- No contact data was invented. Photos are the property's own Airbnb listing photos, copied into `environment/app/public/photos` and announced in the delivery header.
- Captions and the editorial copy (story, gastronomy, experiences) are paraphrases of the brief and the Airbnb description. No new facts were added: no prices, no capacity, no names besides Mohamed.

## Shared verifier notes
- `checkMobileMenu` in `lib.mjs` counts nav-labelled links anywhere in the first phone viewport. It does not require them to be inside the header or on-screen horizontally, so on S28 it reported "6 nav links already visible" even though S28 has a hamburger. That is a possible false negative for originals; it doesn't affect the golden.
