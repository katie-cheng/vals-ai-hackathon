You are working in `/app`, a Vite + React + TypeScript project with its dependencies already installed.
Build the website described in the brief below inside this project.

Delivery requirements:
- `npm run build` must succeed and write a static site to `/app/dist`. The site is served from `/app/dist` as static files at `/`, with any path that has no file extension falling back to `index.html` so client-side routes work, and opened in Chromium at desktop and phone sizes.
- Keep it a client-side Vite + React app: no Next.js, no server, no SSR. You may install any npm packages; the network is available.
- Each page in the brief's website structure has its own route, linked from the navigation, and loads directly from its URL.
- There is no backend, so the server-side parts of the brief (API endpoints, rate limiting, CAPTCHA, administration, uploads, headers) cannot be built here. Forms work on the client: validate them in the browser and hand the inquiry to a channel that exists, without claiming a reservation was confirmed.
- The owner has not provided a WhatsApp number, telephone or email yet. Do not invent them: keep them in one configuration, empty for now.
- The owner's photographs, taken from the property's Airbnb listing, are in `/app/public/photos` (house, garden, terrace, living rooms, bedrooms, bathroom, kitchen, hammam, billiards room, meals).
- Every page must load without console errors, and every image you reference must actually load.

---

# PROJECT: CHEZ L'HABITANT AMAZIGH — PREMIUM HOSPITALITY WEBSITE

Act as a senior creative director, professional UI/UX designer and experienced full-stack developer. Build a complete, production-ready website for this real Moroccan accommodation business.

The result must look like a premium website made by a talented human design agency. Absolutely avoid generic AI website aesthetics, cliché layouts, ugly typography, random gradients, excessive rounded cards and template-looking sections.

## BUSINESS INFORMATION

Business name: Gîte chez l'habitant Amazigh
Alternative listing name: Chez l'habitant AmazighTiken
Host: Mohamed and his family.
Business type: Traditional Amazigh family guesthouse / rural accommodation.

Address:
Comune rurale de Ghassate, Ouarzazate, 45022, Morocco.

GPS coordinates:
Latitude: 31.178871
Longitude: -6.813136

Google Maps:
https://www.google.com/maps?q=31.178871,-6.813136

Booking.com:
https://www.booking.com/hotel/ma/chez-l-habitant-amazightiken.fr.html

Airbnb:
https://www.airbnb.fr/rooms/956593018740086715

WhatsApp: OWNER MUST PROVIDE.
Telephone: OWNER MUST PROVIDE.
Email: OWNER MUST PROVIDE.

Never invent contact information. Create configuration fields so the owner can add these details later.

Languages spoken by the family: Arabic, French, English, Spanish and Portuguese.

## THE PROPERTY

A traditional Amazigh family home in Ghassate, near Ouarzazate, surrounded by mountains, an almond-tree oasis and beautiful natural scenery.

The host Mohamed welcomes guests together with his wife and two sons.

The property offers:
- Three bedrooms (as described on Airbnb).
- Large traditional Moroccan living room.
- Multiple sleeping arrangements.
- Private bathroom and shower.
- Kitchen access.
- Large garden.
- Outdoor terrace and mountain views.
- Traditional hammam.
- Free private parking.
- Free Wi-Fi.
- Billiards.
- Fireplace.
- Bar and coffee facilities.
- Sauna listed on accommodation platforms (availability and extra charges must be confirmed).
- Family-friendly accommodation.
- Pets accepted subject to confirmation.

Sleeping arrangements described in different listings are inconsistent. Do not advertise exact capacity or bed numbers until the owner confirms them.

## FOOD & EXPERIENCES

Make traditional Amazigh hospitality a central part of the website.

Experiences and services:
- Traditional homemade Amazigh breakfast.
- Homemade bread.
- Homemade jams from garden fruits.
- Fresh seasonal fruits and vegetables.
- Traditional Moroccan tagines.
- Lunch and dinner available on request.
- Traditional hammam experience.
- Garden and farm discovery.
- Village walks.
- Visit to the old Kasbah and local community museum.
- Authentic cultural exchange with the host family.

Do not assume all meals and activities are included in the accommodation price.

## REPUTATION

Booking.com information:
Overall rating: 9.4/10.
Number of reviews: 51.
Staff: 9.8.
Value for money: 9.6.
Comfort: 9.4.
Location: 9.3.
Facilities: 9.2.
Cleanliness: 9.1.
Wi-Fi: 7.5.
Use ratings only with proper attribution and make them easy to update.

## BOOKING POLICIES

Published listing information:
Check-in: 10:00–21:00.
Check-out: 09:00–18:00.
Children welcome.
Pets allowed according to listing.
Parties prohibited.
Cancellation depends on booking conditions.

Confirm all policies with the owner before enabling direct reservations.

## DESIGN DIRECTION

Create an elegant, editorial, authentic Amazigh hospitality brand.

Colors:
- Sand: #D8C2A0
- Terracotta: #A65F3F
- Olive: #46513A
- Cream: #F7F1E7
- Dark brown: #30271F

Typography:
Use sophisticated professional typography with excellent readability. Consider combinations such as Cormorant Garamond for editorial headings and DM Sans for body text. Use proper Arabic typography when Arabic is selected.

Design inspiration:
Luxury Moroccan riads, boutique countryside hotels, traditional Kasbah architecture and premium travel magazines.

Use immersive photography, beautiful compositions, subtle animations, generous whitespace, excellent spacing and strong visual hierarchy.

Do not use generic AI-generated stock imagery as a substitute for actual property photographs. Build the gallery structure for the owner's original photographs.

## WEBSITE STRUCTURE

1. Homepage: cinematic hero, business introduction, location and booking CTA.
2. Our Story: Mohamed, his family and Amazigh traditions.
3. Accommodation: rooms, sleeping arrangements and facilities.
4. Gastronomy: homemade breakfast and traditional cuisine.
5. Experiences: hammam, garden, village and cultural activities.
6. Gallery: property photography.
7. Location: interactive map and directions.
8. Contact & Reservations: WhatsApp, contact details and booking inquiry form.

Full French, English and Arabic translations. Arabic must support proper RTL layouts.

## FUNCTIONALITY

- WhatsApp booking button using an owner-configurable phone number.
- Reservation inquiry form.
- Arrival and departure date selection.
- Guest count selection.
- Booking confirmation through the owner's chosen communication channel.
- Contact details managed from one configuration.
- Responsive mobile navigation.
- Functional map and directions.
- SEO optimization for Ouarzazate, Ghassate, Moroccan guesthouses and Amazigh hospitality.
- Accessible and fast-loading pages.

Do not falsely claim real-time availability or confirmed reservations without a working booking system.

## SECURITY & COST CONTROL

Follow production-grade security:
- Server-side input validation and sanitization.
- Protection against XSS, CSRF, SQL injection and spam.
- Rate limiting on every public API and form endpoint.
- CAPTCHA or equivalent bot protection.
- Secure authentication and authorization for administration.
- Never expose API keys or secrets in frontend code.
- Secure file uploads with strict type and size restrictions.
- HTTPS, secure headers and safe error handling.
- Data minimization and protection of guest information.
- API quotas, caching, request throttling and spending limits.
- Avoid unnecessary paid APIs and dependencies.
- No public exposure of admin endpoints or private customer data.

## DEVELOPMENT EXPECTATIONS

Before coding, inspect the project and available tools. Acquire relevant skills for professional web design, frontend development, accessibility, SEO, performance and application security.

Build the complete working product, not just a landing page or mockup.

Test all routes, buttons, forms, languages, mobile layouts and security protections.

Deliver clean, maintainable, production-ready code with a polished final result.

**FINAL GOAL:** Create a distinctive premium Moroccan hospitality website that makes visitors want to discover Ghassate, meet Mohamed's family and experience authentic Amazigh hospitality.
