# Gîte chez l'habitant Amazigh

Client-side Vite + React + TypeScript site in French, English and Arabic (RTL).

- Business facts, contact channels, ratings and policies: `src/config/site.ts`. WhatsApp, phone and email are empty until the owner provides them (or set `VITE_CONTACT_WHATSAPP`, `VITE_CONTACT_PHONE`, `VITE_CONTACT_EMAIL` at build time). While empty, the site says they are pending and the inquiry form points guests to Booking.com or Airbnb messaging.
- Photographs: `public/photos`, listed in `src/config/gallery.ts`.
- Copy: `src/i18n/en.ts`, `fr.ts`, `ar.ts` (same shape, checked by TypeScript).

The inquiry form validates and sanitises input in the browser and composes a message; it stores nothing and confirms no reservation. Before enabling direct reservations, add a backend that repeats validation server-side, rate-limits the endpoint, adds bot protection, and serves the site over HTTPS with security headers.
