// Task-specific part of the verifier: the ZEE Beauty Saloon brief's checklist, the interactions it asks for, and what grade.mjs
// should intercept or exempt. grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of tasks/verifier/; only this file is per task.
import { attempt, checkMobileMenu, digits, freshPage, hexDistance, newLines, norm, overlayOpen, squash } from "./lib.mjs";

export const HANDOFF_URLS = /wa\.me|whatsapp\.com/;
// Nothing in this brief asks for a pattern that grade.mjs SLOP_CHECKS penalises.
export const SLOP_EXEMPT = {};

const PHONE_DIGITS = "3234325141";
const SERVICES = ["Bridal Makeup", "Party Makeup", "Hair Styling", "Haircuts", "Hair Treatments", "Facial Treatments", "Skincare", "Waxing", "Threading", "Manicure & Pedicure"];
const GALLERY_CATEGORIES = ["Makeup Inspiration", "Bridal Looks", "Hair Styling", "Beauty Treatments", "Salon Interior"];
const NAV_ITEMS = ["home", "about", "services", "gallery", "contact"];
const HEADING_FONTS = ["playfair display", "cormorant garamond", "cormorant"];
const BODY_FONTS = ["poppins", "inter"];
// The brief's palette minus pure white and near-black, which any site would contain.
const PALETTE = ["#f7dde5", "#d4af72", "#fff9f4", "#c77d91", "#292329"];
const BOOKING = { name: "Ayesha Khan", phone: "03001234567", date: "2026-12-20", time: "15:00", message: "Testing the booking form" };

const fraction = (found, total) => found / total;

/** Field kinds of the booking form, matched on type/name/id/placeholder/label/aria text. */
const FIELD_KINDS = {
  name: (f, t) => /\bname\b/.test(t) && !/service|business/.test(t),
  phone: (f, t) => f.type === "tel" || /phone|mobile|number|whatsapp/.test(t),
  service: (f, t) => /service|treatment/.test(t),
  date: (f, t) => f.type === "date" || /\bdate\b|\bday\b/.test(t),
  time: (f, t) => f.type === "time" || /\btime\b|\bslot\b/.test(t),
  message: (f, t) => f.tag === "textarea" || /message|note|request|details/.test(t),
};

function fieldText(f) {
  return norm([f.type, f.name, f.id, f.placeholder, f.aria, f.label].join(" "));
}

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const d = views.desktop.facts;
  const rendered = Object.entries(views).filter(([, v]) => v.ok);
  const act = Object.assign({}, ...rendered.map(([, v]) => v.interactions));
  const text = norm(d.text);
  const flat = squash(d.text);
  const visibleClickables = d.clickables.filter((c) => c.visible);
  const clickTexts = visibleClickables.map((c) => norm(c.text));
  const hrefs = d.clickables.map((c) => c.href);
  const headings = d.headings.map((h) => norm(h.text));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const has = (s) => text.includes(norm(s));

  add("name", "Business name shown", has("ZEE Beauty Saloon") ? 1 : 0);
  const addressParts = ["Shop #2", "Mian Mir Market", "Main Bazar", "Moughal Shadi Hall", "Sahowari Mughalpura"];
  const addressFound = addressParts.filter(has);
  add("address", "Full verified address shown", fraction(addressFound.length, addressParts.length), `found ${addressFound.length}/${addressParts.length}`);
  add("phone", "Phone number shown", digits(d.text).includes(PHONE_DIGITS) ? 1 : 0);
  add("hours", "Listed hours 11 AM - 8 PM shown", /11(:00)?\s*a\.?m\.?\s*(–|-|—|to)\s*8(:00)?\s*p\.?m\.?/i.test(d.text) ? 1 : 0);
  const h1 = d.headings.filter((h) => h.tag === "h1").map((h) => norm(h.text));
  add("hero-heading", "Hero h1 is the given heading", h1.some((h) => h.includes(norm("Your Beauty, Your Confidence, Our Passion."))) ? 1 : 0, `h1: ${h1.join(" | ").slice(0, 120)}`);
  add("hero-text", "Hero supporting text", has("Discover a beautiful experience where elegance meets care") ? 1 : 0);
  const ctas = ["Explore Our Services", "Book Your Appointment"].filter((c) => clickTexts.some((t) => t.includes(norm(c))));
  add("hero-ctas", "Hero buttons present", fraction(ctas.length, 2), `found: ${ctas.join(", ")}`);
  add("about-heading", "About heading", headings.some((h) => h.includes(norm("Welcome to ZEE Beauty Saloon"))) ? 1 : 0);
  const services = SERVICES.filter((s) => flat.includes(squash(s)));
  add("services", "All 10 service categories", fraction(services.length, SERVICES.length), `missing: ${SERVICES.filter((s) => !services.includes(s)).join(", ")}`);
  const learnMore = clickTexts.filter((t) => t.includes("learn more")).length;
  const book = clickTexts.filter((t) => /\bbook\b/.test(t)).length;
  add("service-card-buttons", "Learn More + Book buttons on each service card", (Math.min(1, learnMore / 10) + Math.min(1, book / 10)) / 2, `learn more ${learnMore}, book ${book}`);
  const categories = GALLERY_CATEGORIES.filter((c) => clickTexts.includes(norm(c)));
  add("gallery-categories", "Gallery category filters", fraction(categories.length, GALLERY_CATEGORIES.length), `found: ${categories.join(", ")}`);
  add("gallery-filter", "Filtering changes the gallery", act.galleryFilter?.pass ? 1 : 0, act.galleryFilter?.detail);
  add("gallery-lightbox", "Clicking a gallery image opens a lightbox", act.lightbox?.pass ? 1 : 0, act.lightbox?.detail);

  const kinds = Object.keys(FIELD_KINDS).filter((k) => d.fields.some((f) => FIELD_KINDS[k](f, fieldText(f))));
  add("booking-fields", "Booking form has the 6 fields", fraction(kinds.length, 6), `found: ${kinds.join(", ")}`);
  add("booking-validation", "Empty booking is blocked with validation", act.bookingValidation?.pass ? 1 : 0, act.bookingValidation?.detail);
  add("booking-whatsapp", "Booking sends details to wa.me/923234325141", act.bookingWhatsapp?.pass ? 1 : 0, act.bookingWhatsapp?.detail);
  add("booking-confirmation", "Booking shows a confirmation message", act.bookingConfirmation?.pass ? 1 : 0, act.bookingConfirmation?.detail);
  add("whatsapp-link", "WhatsApp contact link", hrefs.some((h) => /wa\.me\/\+?923234325141|whatsapp\.com\/send\?phone=\+?923234325141/.test(h)) ? 1 : 0);
  add("contact-heading", "Contact heading", headings.some((h) => h.includes(norm("Visit ZEE Beauty Saloon"))) ? 1 : 0);
  add("click-to-call", "tel: link to the salon", hrefs.some((h) => h.startsWith("tel:") && digits(h).includes(PHONE_DIGITS)) ? 1 : 0);
  const mapRe = /google\.[a-z.]+\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps|openstreetmap|maps\.apple/;
  add("map", "Map embed or directions link", d.iframes.some((s) => mapRe.test(s)) || hrefs.some((h) => mapRe.test(h)) ? 1 : 0);
  add("contact-form", "Contact form besides booking", d.forms >= 2 || d.fields.filter((f) => f.tag === "textarea").length >= 2 ? 1 : 0, `forms ${d.forms}`);
  // Menu labels are compared without digits, since menus are often numbered ("01 Home").
  const headerTexts = d.clickables.filter((c) => c.inHeader && c.visible).map((c) => norm(c.text).replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim());
  const navFound = NAV_ITEMS.filter((n) => headerTexts.includes(n));
  const bookNow = headerTexts.some((t) => t.includes("book now"));
  add("nav", "Sticky nav menu + Book Now", fraction(navFound.length + (bookNow ? 1 : 0), NAV_ITEMS.length + 1), `found: ${navFound.join(", ")}${bookNow ? ", book now" : ""}`);
  add("mobile-menu", "Hamburger menu on mobile", act.mobileMenu?.pass ? 1 : 0, act.mobileMenu?.detail);
  add("copyright", "Footer copyright", /©|copyright/i.test(d.text) ? 1 : 0);

  const ld = d.ldjson.join(" ");
  add("structured-data", "LocalBusiness structured data with the phone", /BeautySalon|HairSalon|DaySpa|HealthAndBeautyBusiness|LocalBusiness/.test(ld) && digits(ld).includes(PHONE_DIGITS) ? 1 : 0);
  add("seo-meta", "Title names the salon and a meta description exists", (/zee/i.test(d.title) ? 0.5 : 0) + (d.metaDescription.trim() ? 0.5 : 0), d.title);
  const h1Font = d.headings.find((h) => h.tag === "h1")?.font?.toLowerCase() || "";
  const bodyFont = Object.entries(d.bodyFonts).sort((a, b) => b[1] - a[1])[0]?.[0]?.toLowerCase() || "";
  add("fonts", "Playfair/Cormorant headings, Poppins/Inter body", ((HEADING_FONTS.includes(h1Font) ? 1 : 0) + (BODY_FONTS.includes(bodyFont) ? 1 : 0)) / 2, `h1 ${h1Font}, body ${bodyFont}`);
  const paletteFound = PALETTE.filter((p) => d.colors.some((c) => hexDistance(c, p) <= 6));
  add("palette", "Uses the brief's palette", Math.min(1, paletteFound.length / 3), `found: ${paletteFound.join(", ")}`);

  // The brief forbids inventing these; a hit means fabricated content.
  const prices = d.text.match(/(Rs\.?|PKR|₨)\s?\d[\d,]*|\$\s?\d+/);
  add("no-prices", "No invented prices", prices ? 0 : 1, prices?.[0] || "");
  const testimonials = d.text.match(/testimonial|what (our )?(clients|customers|guests) (say|are saying)|★★★|happy clients/i);
  add("no-testimonials", "No invented testimonials or ratings", testimonials ? 0 : 1, testimonials?.[0] || "");
  const socialRe = /instagram|facebook|fb\.com|tiktok|twitter\.com|x\.com\/|youtube|pinterest/i;
  const social = d.clickables.filter((c) => socialRe.test(c.href) || socialRe.test(c.text));
  add("no-social-links", "No unverified social links", social.length ? 0 : 1, social.map((c) => c.href || c.text).slice(0, 3).join(", "));
  const claims = d.text.match(/\b\d{2,}\s*\+|\byears of (experience|expertise)\b|\bcertified\b|\baward[- ]winning\b|\bawards?\b/i);
  add("no-invented-claims", "No invented experience, stats or awards", claims ? 0 : 1, claims?.[0] || "");
  return items;
}

/** Marks the gallery (the ancestor of a category filter that holds >= 4 images) with data-sb="gallery". */
function markGallery(categories) {
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const filters = [...document.querySelectorAll("button,[role=tab],[role=button],a")].filter((b) => categories.includes(norm(b.innerText)));
  for (const f of filters) {
    let p = f.parentElement;
    while (p && p !== document.body && p.querySelectorAll("img").length < 4) p = p.parentElement;
    if (p && p !== document.body) {
      p.setAttribute("data-sb", "gallery");
      return norm(f.innerText);
    }
  }
  const byId = [...document.querySelectorAll("[id]")].find((e) => /gallery/i.test(e.id));
  if (byId) byId.setAttribute("data-sb", "gallery");
  return null;
}

function galleryImages() {
  const g = document.querySelector('[data-sb="gallery"]');
  if (!g) return [];
  return [...g.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 0 && i.checkVisibility({ opacityProperty: true })).map((i) => i.currentSrc || i.src);
}

/** Marks the booking form (the form around the phone field, else its nearest ancestor with >= 4 fields) and its fields. */
function markBooking() {
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const describe = (f) => norm([f.type, f.name, f.id, f.placeholder, f.getAttribute("aria-label"), f.labels?.[0]?.innerText, f.closest("label")?.innerText].join(" "));
  const kinds = {
    name: (f, t) => /\bname\b/.test(t) && !/service|business/.test(t),
    phone: (f, t) => f.type === "tel" || /phone|mobile|number|whatsapp/.test(t),
    service: (f, t) => /service|treatment/.test(t),
    date: (f, t) => f.type === "date" || /\bdate\b|\bday\b/.test(t),
    time: (f, t) => f.type === "time" || /\btime\b|\bslot\b/.test(t),
    message: (f, t) => f.tagName === "TEXTAREA" || /message|note|request|details/.test(t),
  };
  const fields = (root) => [...root.querySelectorAll("input,select,textarea")].filter((f) => !["hidden", "submit", "button", "checkbox", "radio"].includes(f.type));
  const phone = fields(document).find((f) => kinds.phone(f, describe(f)));
  if (!phone) return { found: false };
  let scope = phone.closest("form");
  if (!scope) {
    scope = phone.parentElement;
    while (scope && scope !== document.body && fields(scope).length < 4) scope = scope.parentElement;
  }
  scope.setAttribute("data-sb", "booking");
  const marked = [];
  for (const [kind, match] of Object.entries(kinds)) {
    const f = fields(scope).find((x) => !x.hasAttribute("data-sbf") && match(x, describe(x)));
    if (f) {
      f.setAttribute("data-sbf", kind);
      marked.push(kind);
    }
  }
  const buttons = [...scope.querySelectorAll("button,input[type=submit],[role=button]")].filter((b) => b.getBoundingClientRect().width > 0);
  const submit = buttons.find((b) => b.type === "submit") || buttons.reverse().find((b) => /book|send|request|submit|whatsapp|confirm/i.test(b.innerText || b.value));
  if (submit) submit.setAttribute("data-sb", "booking-submit");
  return { found: true, marked, submit: !!submit };
}

function bookingBlocked() {
  const scope = document.querySelector('[data-sb="booking"]');
  return [...scope.querySelectorAll("input,select,textarea")].some((f) => !f.checkValidity() || f.getAttribute("aria-invalid") === "true");
}

async function fill(page, kind, value) {
  const f = page.locator(`[data-sbf="${kind}"]`);
  if (!(await f.count())) return false;
  try {
    if ((await f.evaluate((el) => el.tagName)) === "SELECT") await f.selectOption({ index: 1 }, { timeout: 3000 });
    else await f.fill(value, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

export async function interactDesktop(context, url, handoffs) {
  const page = await freshPage(context, url);
  const out = {};
  const target = await page.evaluate(markGallery, GALLERY_CATEGORIES.map((c) => c.toLowerCase()));
  out.galleryFilter = await attempt(async () => {
    if (!target) return { pass: false, detail: "no gallery category filter found" };
    const gallery = page.locator('[data-sb="gallery"]');
    await gallery.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const before = await page.evaluate(galleryImages);
    const pick = GALLERY_CATEGORIES.find((c) => c.toLowerCase() !== target && c !== "Hair Styling") || GALLERY_CATEGORIES[1];
    await gallery.locator("button,[role=tab],[role=button],a").filter({ hasText: new RegExp(`^\\s*${pick}\\s*$`, "i") }).first().click({ timeout: 5000 });
    await page.waitForTimeout(1200);
    const after = await page.evaluate(galleryImages);
    const changed = before.length !== after.length || before.some((s, i) => s !== after[i]);
    return { pass: changed, detail: `clicked "${pick}": ${before.length} -> ${after.length} visible images` };
  });
  out.lightbox = await attempt(async () => {
    const img = page.locator('[data-sb="gallery"] img:visible').first();
    if (!(await img.count())) return { pass: false, detail: "no visible gallery image" };
    const before = await page.evaluate(overlayOpen);
    await img.scrollIntoViewIfNeeded();
    await img.click({ force: true, timeout: 5000 });
    await page.waitForTimeout(1000);
    const after = await page.evaluate(overlayOpen);
    await page.keyboard.press("Escape");
    return { pass: !before && after, detail: `overlay before ${before}, after ${after}` };
  });
  await page.close();

  // Validation and submission each get a fresh page so one cannot leak state into the other.
  const vPage = await freshPage(context, url);
  out.bookingValidation = await attempt(async () => {
    const info = await vPage.evaluate(markBooking);
    if (!info.found || !info.submit) return { pass: false, detail: `booking form ${info.found ? "has no submit button" : "not found"}` };
    const sent = handoffs.length;
    const textBefore = await vPage.evaluate(() => document.body.innerText);
    await vPage.locator('[data-sb="booking-submit"]').scrollIntoViewIfNeeded();
    await vPage.locator('[data-sb="booking-submit"]').click({ force: true, timeout: 5000 });
    await vPage.waitForTimeout(1000);
    const blocked = await vPage.evaluate(bookingBlocked);
    const message = newLines(textBefore, await vPage.evaluate(() => document.body.innerText)).find((l) => /required|please|enter|valid|missing|fill/i.test(l));
    const leaked = handoffs.length > sent;
    return { pass: !leaked && (blocked || !!message), detail: `opened whatsapp ${leaked}, invalid fields ${blocked}, message ${message || "-"}` };
  });
  await vPage.close();

  const sPage = await freshPage(context, url);
  const submission = await attempt(async () => {
    const info = await sPage.evaluate(markBooking);
    if (!info.found || !info.submit) return { pass: false, detail: "booking form not found" };
    const filled = [];
    for (const kind of ["name", "phone", "service", "date", "time", "message"]) if (await fill(sPage, kind, BOOKING[kind] || "Bridal Makeup")) filled.push(kind);
    const sent = handoffs.length;
    const textBefore = await sPage.evaluate(() => document.body.innerText);
    await sPage.locator('[data-sb="booking-submit"]').click({ force: true, timeout: 5000 });
    await sPage.waitForTimeout(1500);
    if (handoffs.length === sent) {
      // Some flows show a review step with its own "send on WhatsApp" button.
      const next = sPage.locator("button:visible, a:visible").filter({ hasText: /whatsapp/i }).first();
      if (await next.count()) {
        await next.click({ force: true, timeout: 5000 }).catch(() => {});
        await sPage.waitForTimeout(1500);
      }
    }
    const urls = handoffs.slice(sent).map((u) => decodeURIComponent(u.replace(/\+/g, " ")));
    const withDetails = urls.find((u) => u.includes("923234325141") && u.includes(BOOKING.name.split(" ")[0]));
    const confirmation = newLines(textBefore, await sPage.evaluate(() => document.body.innerText)).find((l) => /thank|request|sent|received|whatsapp|confirm|almost|success/i.test(l));
    return { pass: !!withDetails, confirmation, detail: `filled ${filled.join(",")}; whatsapp ${withDetails ? withDetails.slice(0, 120) : urls[0]?.slice(0, 80) || "not opened"}` };
  });
  out.bookingWhatsapp = { pass: submission.pass, detail: submission.detail };
  out.bookingConfirmation = { pass: !!submission.confirmation, detail: submission.confirmation || "no new confirmation text" };
  await sPage.close();
  return out;
}

export async function interactMobile(context, url) {
  return { mobileMenu: await checkMobileMenu(context, url, NAV_ITEMS) };
}
