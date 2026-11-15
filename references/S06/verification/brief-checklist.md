## Brief requirements checklist

Status: **met**, **partly** (present, but smaller than the brief asks for), **same as original** (the rebuild inherits a limit of the arena original and does not change it).
Nothing the brief asks for was dropped. Where a critique or general rule conflicted with the brief, the brief won (Katie R1); those cases are listed under "Brief exceptions" in `../solution/PLAN.md`.
The whole app is client-side: the "database", accounts, orders and CMS edits live in `localStorage`, exactly as in the original.

| Brief section | Requirement | Status | Where / why |
| --- | --- | --- | --- |
| 1 Brand | Logo in the navigation bar, footer and login portal, not redrawn | met | `Logo` in header, footer, `/login`; the supplied image |
| 1 Brand | Red #F1001F, black, white | met | `--color-brand: #f1001f`; black header/hero/footer; white and cream sections |
| 1 Brand | Bold typography, modern readable fonts | met | Barlow Condensed 600 uppercase titles, Manrope body (brief exception: kept bold) |
| 1 Brand | Red call-to-action buttons | met | `.btn-primary` |
| 1 Brand | Cards with subtle shadows and rounded corners | met | `.card`: 10px radius, 1px border, `0 1px 2px` shadow |
| 1 Brand | Professional animations and smooth transitions | met | Opacity reveals, hero crossfade, drawer/dialog transitions |
| 2 Home | Hero with the supplied food photography; 5 sliding images | met | Five slides crossfade, with thumbnails (`checks.py`: "hero: five photographs with a control each") |
| 2 Home | Headline "BIG FLAVOUR. GENEROUS PORTIONS. REAL TOWNSHIP TASTE." + supporting text | met | Slide 1 is the `h1` |
| 2 Home | "ORDER NOW" and "EXPLORE OUR MENU" buttons | met | Both in the hero, sentence case ("Order now", "Explore our menu") |
| 2 Home | Featured categories; best-selling meals; promotions; why choose us; testimonials and ratings; location, hours, contact; footer with social links | met | One section each, in the original's order |
| 2 About | Our Story, Passion for Good Food, Commitment to Quality, Freshly Prepared Meals, Generous Portions at Affordable Prices, Our Community | met | All six topics, photographs, CMS-editable |
| 2 Menu | 8 categories with the stated counts (10 kotas, 4 dagwoods, 3 burgers, 5 rolls, 3 sandwiches, 25 chips & sides, beverages, specials) | met | 60 items; counts shown in the result heading |
| 2 Menu | Photo, name, description, ZAR price, add-ons, customisation, availability, Add to cart | met | `MenuCard` + item dialog; "Sold out" tag |
| 2 Menu | Category filters, search, featured meals | met | Chips, search field, "Favourites only" filter (the "Featured" pill on the photograph is removed: S05 #454) |
| 2 Menu | Admin: add, edit, delete, reorder categories and items, prices, photographs | met | Admin → Menu |
| 2 Order | Browse, add, quantities, customise, totals, delivery fee from admin settings, collection/delivery, name/mobile/address, instructions, summary | met | `/order`; exercised by `checks.py` |
| 2 Order | Configurable online payment, not shown as functional until configured | met | Cash on collection/delivery; card payment shown as "Not available yet" |
| 2 Order | Order confirmation, unique order number, order progress | met | Confirmation with number and tracker |
| 2 Order | Staff dashboard: accept, reject, prepare, complete | met | Admin → Orders |
| 2 Gallery | Six themes, responsive grid, hover effects, lightbox | met | Filter chips, dim + view icon on hover, lightbox with keyboard arrows |
| 2 Gallery | Admin upload, replace, delete, rearrange | met | Admin → Media / Gallery |
| 2 Reviews | Overall rating, testimonials, names and dates, five-star display, submission form | met | `/reviews`; form validation in `checks.py` |
| 2 Reviews | Moderation: approve, hide, remove | met | Admin → Reviews; submitted reviews wait for approval |
| 2 Login | Customer registration, login, password recovery, profile, saved addresses, order history, tracking | met | `/login` |
| 2 Login | Administrator login and dashboard (content, menu, orders, customers, reviews, promotions, business details, reports) | met | 11 admin views, each opened by `checks.py` |
| 2 Login | Secure authentication, role-based permissions | same as original | Client-side demo auth in `localStorage`; the demo administrator account ships in the original's public bundle |
| 2 Contact | Name, address, telephone, hours as given | met | Verbatim |
| 2 Contact | Google map at the address, Get Directions, click-to-call, WhatsApp button, enquiry form, social links | met | `/contact` |
| 2 Contact | Location permission for address help at checkout | met | "Use my current location" in delivery checkout |
| 3 UX | Responsive desktop, tablet, mobile | met | No overflow on any route from 360 to 1440px (the original overflows on `/order` up to 1100px) |
| 3 UX | Sticky navigation, cart icon with item count, prominent Order Now, mobile navigation | met | Header; "Order now" stays a text button at every width (S05 #289) |
| 3 UX | SEO-friendly, fast, optimised images | met | Title, description, Open Graph; WebP images; self-hosted fonts; preloaded hero image |
| 3 UX | Accessible and readable | met | Every control has an accessible name, focus rings, no text under 12px |
| 3 UX | Subtle animations without compromising speed | met | Opacity only; CLS 0 |
| 4 CMS | Every heading, paragraph, price, photograph, banner, gallery image, review, hours, footer and social link editable; image manager | met | Admin → Content, Media, Menu, Business; "editing page content changes the public site" in `checks.py`. The removed eyebrow, footer tagline and footer CTA fields are removed from the CMS as well |
| 5 Technical | Database for menu, customers, orders; order notifications; backup and security | same as original | `localStorage` store with a "reset website" action in the admin, as in the original |
| 5 Technical | Social media sharing and WhatsApp integration | partly | WhatsApp links (footer, contact, order update) and social profile links; no share buttons, as in the original |
| 5 Technical | ZAR throughout | met | `R` prices everywhere |
| 6 Final | Look like the supplied Homepage / Digital Menu / Admin Dashboard pictures | same as original | The pictures are not in the arena export; the original's layout is kept |
