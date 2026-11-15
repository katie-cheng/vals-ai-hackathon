// Task-specific part of the verifier: the SHE Salon & Make-up Studio brief's checklist, the interactions it asks for, and what
// grade.mjs should intercept or exempt. grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of tasks/verifier/; only this file is per task.
import { attempt, digits, freshPage, norm, squash } from "./lib.mjs";

export const HANDOFF_URLS = /wa\.me|whatsapp\.com/;
// Nothing in this brief asks for a pattern that grade.mjs SLOP_CHECKS penalises.
export const SLOP_EXEMPT = {};

const PHONE_DIGITS = "7084007700";
const WA_RE = /wa\.me\/\+?917084007700|whatsapp\.com\/send\/?\?phone=\+?917084007700/;
const WA_MESSAGE = "Hello She Salon & Make-up Studio! I would like to enquire about your services and book an appointment. Please share the details.";
const SERVICES = [
  "Bridal Makeup", "Party Makeup", "Professional Makeup", "Hair Styling", "Haircuts & Hair Treatments",
  "Eyebrow Threading & Shaping", "Eyebrow Beautification", "Eyelash Services", "Skin Care & Beauty Treatments", "Tanning Services",
];
const MAP_RE = /google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps/;

const fraction = (found, total) => found / total;

/** Families of the brief's palette, as HSL ranges; colours come from rendered text, backgrounds and borders. */
const PALETTE = {
  "champagne gold": ([h, s, l]) => h >= 28 && h <= 52 && s >= 0.25 && s <= 0.8 && l >= 0.4 && l <= 0.75,
  "blush pink": ([h, s, l]) => (h >= 330 || h <= 22) && s >= 0.2 && l >= 0.75 && l <= 0.95,
  ivory: ([h, s, l]) => h >= 28 && h <= 62 && s >= 0.15 && l >= 0.93 && l < 0.995,
  "warm beige": ([h, s, l]) => h >= 22 && h <= 48 && s >= 0.12 && s <= 0.6 && l >= 0.7 && l < 0.93,
  "deep black": ([, , l]) => l <= 0.12,
};

function hsl(hex) {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const dl = max - min, s = l > 0.5 ? dl / (2 - max - min) : dl / (max + min);
  const h = max === r ? ((g - b) / dl + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / dl + 2) * 60 : ((r - g) / dl + 4) * 60;
  return [h, s, l];
}

const pass = (r) => (r?.pass ? 1 : 0);

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
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail: String(detail ?? "") });
  const has = (s) => text.includes(norm(s));

  add("name", "Business name SHE Salon & Make-up Studio shown", has("SHE Salon & Make-up Studio") ? 1 : 0);
  const h1 = d.headings.filter((h) => h.tag === "h1").map((h) => norm(h.text));
  add("hero-heading", "Hero h1 is the given headline", h1.some((h) => h.includes(norm("Beauty is an art. Let us make you the masterpiece."))) ? 1 : 0, `h1: ${h1.join(" | ").slice(0, 120)}`);
  add("hero-text", "Hero supporting text", has("Discover your beauty with expert care, professional styling, and a touch of luxury.") ? 1 : 0);
  const ctas = ["Book Your Appointment", "Explore Our Services"].filter((c) => clickTexts.some((t) => t.includes(norm(c))));
  add("hero-ctas", "Both hero CTA buttons present", fraction(ctas.length, 2), `found: ${ctas.join(", ")}`);
  add("hero-photo", "Full-screen hero with a large photograph", pass(act.heroPhoto), act.heroPhoto?.detail);
  add("cta-book", "BOOK YOUR APPOINTMENT opens WhatsApp or reaches the booking options", pass(act.ctaBook), act.ctaBook?.detail);
  add("cta-services", "EXPLORE OUR SERVICES reaches the services", pass(act.ctaServices), act.ctaServices?.detail);
  add("smooth-scroll", "In-page navigation scrolls smoothly", pass(act.smoothScroll), act.smoothScroll?.detail);

  add("about-heading", "About headline", headings.some((h) => h.includes(norm("Your beauty, our passion."))) ? 1 : 0);
  add("women-only", "Presented as a women-only salon", /women only|only for women|for women only|ladies only/.test(text) ? 1 : 0);

  const services = SERVICES.filter((s) => flat.includes(squash(s)));
  add("services", "All 10 service names", fraction(services.length, SERVICES.length), `missing: ${SERVICES.filter((s) => !services.includes(s)).join(", ")}`);
  add("service-images", "Each service card carries a loaded image", act.serviceCards ? act.serviceCards.score : 0, act.serviceCards?.detail);
  add("service-hover", "Service cards react on hover", pass(act.serviceHover), act.serviceHover?.detail);
  const prices = d.text.match(/(₹|Rs\.?|INR)\s?\d[\d,]*|\d[\d,]*\s?(\/-|rupees)/i);
  add("no-prices", "No invented prices", prices ? 0 : 1, prices?.[0] || "");

  add("gallery", "Gallery of >= 6 images covering bridal, party, hair, transformations, interiors", act.gallery ? act.gallery.score : 0, act.gallery?.detail);
  add("gallery-hover", "Gallery images react on hover", pass(act.galleryHover), act.galleryHover?.detail);

  const why = {
    "women-only": /women only|ladies only|only for women/,
    professional: /professional/,
    personalised: /personali[sz]ed|personal attention/,
    "one place": /one place|under one roof|one destination|all in one/,
    booking: /(easy|convenient|simple|quick)[a-z ]{0,30}(booking|appointment)|book[a-z ]{0,40}(whatsapp|call|phone)/,
  };
  const whyFound = Object.keys(why).filter((k) => why[k].test(text));
  add("why-us", "Why Choose Us covers the 5 points", fraction(whyFound.length, 5), `found: ${whyFound.join(", ")}`);

  add("reviews-section", "Customer review section", headings.some((h) => /review|testimonial|clients say|guests say|kind words/.test(h)) || hrefs.some((h) => /^#(reviews?|testimonials?)$/i.test(h)) ? 1 : 0);
  const labelled = /placeholder|real reviews|verified reviews|reviews (are|will be) (added|shared|published)|read (our |all )?reviews on google|reviews on google/.test(text);
  add("reviews-honest", "Reviews are verified or clearly labelled as placeholders", labelled ? 1 : 0);
  const ratings = [...d.text.matchAll(/(\d\.\d)\s*(\/\s*5|out of 5|stars?|★)/gi)].map((m) => m[1]);
  const counts = [...d.text.matchAll(/(\d[\d,]*)\+?\s*(google\s*)?(reviews|ratings)/gi)].map((m) => m[1].replace(/,/g, ""));
  const wrong = [...ratings.filter((r) => r !== "4.7"), ...counts.filter((c) => c !== "989")];
  add("rating-accurate", "Any rating shown is the supplied 4.7/5 (989 reviews)", wrong.length ? 0 : 1, wrong.join(", "));

  const addressParts = ["LaL Chauk", "6/344", "Awas Vikas Colony", "Yojna-3", "Yojna-2", "Jhusi", "Prayagraj", "Uttar Pradesh", "211019"];
  const addressFound = addressParts.filter((p) => flat.includes(squash(p)));
  add("address", "Full address shown", fraction(addressFound.length, addressParts.length), `found ${addressFound.length}/${addressParts.length}`);
  add("phone", "Phone number shown", digits(d.text).includes(PHONE_DIGITS) ? 1 : 0);
  add("click-to-call", "tel: link to the salon", hrefs.some((h) => h.startsWith("tel:") && digits(h).includes(PHONE_DIGITS)) ? 1 : 0);
  add("whatsapp-appointment", "WhatsApp appointment button in the page (besides the floating one)", pass(act.inlineWhatsapp), act.inlineWhatsapp?.detail);
  const directions = d.clickables.some((c) => MAP_RE.test(c.href) && /direction|route|navigate|get here|find us/i.test(c.text));
  add("directions", "Google Maps directions button", directions ? 1 : 0);
  add("map-embed", "Embedded Google Map", d.iframes.some((s) => MAP_RE.test(s)) ? 1 : 0, d.iframes.join(" ").slice(0, 100));
  const hours = /(opening|business|salon|working|studio) hours/i.test(d.text);
  const confirm = /(opening|business|salon|working|studio) hours[\s\S]{0,600}\b(confirm|verify)|\b(confirm|verify)[\s\S]{0,300}(hours|schedule|timings)/i.test(d.text);
  add("hours", "Opening hours with a prompt to confirm the weekly schedule", ((hours ? 1 : 0) + (confirm ? 1 : 0)) / 2);

  add("float-whatsapp", "Floating WhatsApp button fixed bottom-right (desktop, phone, every page)", ((act.floatDesktop?.score || 0) + (act.floatPhone?.score || 0)) / 2, `${act.floatDesktop?.detail || "-"} / ${act.floatPhone?.detail || "-"}`);
  add("whatsapp-message", "Floating button opens wa.me/917084007700 with the exact prefilled message", pass(act.floatDesktop?.message), act.floatDesktop?.message?.detail);

  add("footer", "Footer has name, quick links, services, contact info and copyright", act.footer ? act.footer.score : 0, act.footer?.detail);
  const socialRe = /instagram|facebook|fb\.com|tiktok|twitter\.com|x\.com\/|youtube|pinterest|linkedin/i;
  const social = d.clickables.filter((c) => socialRe.test(c.href) || socialRe.test(c.text));
  add("no-social-links", "No unverified social links", social.length ? 0 : 1, social.map((c) => c.href || c.text).slice(0, 3).join(", "));
  const claims = d.text.match(/\b\d{2,}\s*\+\s*[a-z]|\b\d+\s*\+?\s*years\b|\byears of (experience|expertise)\b|\bcertified\b|\baward[- ]winning\b|\bawards?\b|\bnumber one\b|\bno\.? ?1\b|\b#1\b|\bbest (salon|in)\b/i);
  add("no-invented-claims", "No invented experience, stats or awards", claims ? 0 : 1, claims?.[0] || "");
  const filler = d.text.match(/lorem ipsum|\bTODO\b|\bTBD\b|your (text|name|email) here|\[(insert|add|your)[^\]]*\]|coming soon/i);
  add("no-filler", "No lorem ipsum or template filler", filler ? 0 : 1, filler?.[0] || "");

  // Navigation links are counted by target, not label: the brief names no menu labels.
  const navTargets = new Set(d.clickables.filter((c) => c.inHeader && c.visible && /^(#[\w-]+|\/[\w-])/.test(c.href)).map((c) => c.href));
  add("nav", "Header navigation to the main sections", Math.min(1, navTargets.size / 5), `${navTargets.size} distinct section or page links`);
  add("links-resolve", "No dead or unresolved links", act.links ? act.links.score : 0, act.links?.detail);
  add("mobile-menu", "Collapsible menu on phones", pass(act.mobileMenu), act.mobileMenu?.detail);
  add("scroll-animations", "Tasteful scroll animations reveal content", pass(act.reveal), act.reveal?.detail);

  const h1Count = d.headings.filter((h) => h.tag === "h1").length;
  const h2Count = d.headings.filter((h) => h.tag === "h2").length;
  add("seo", "Title names the salon and place, meta description, one h1 and sectioned h2s",
    ((/she salon/i.test(d.title) ? 0.25 : 0) + (/jhusi|prayagraj/i.test(d.title) ? 0.25 : 0) + (d.metaDescription.trim().length >= 50 ? 0.25 : 0) + (h1Count === 1 && h2Count >= 5 ? 0.25 : 0)),
    `${d.title} | h1 ${h1Count}, h2 ${h2Count}`);
  add("fonts", "Serif headings and sans-serif body text", act.fonts ? act.fonts.score : 0, act.fonts?.detail);
  const paletteFound = Object.keys(PALETTE).filter((k) => d.colors.some((c) => PALETTE[k](hsl(c))));
  add("palette", "Champagne gold, blush pink, ivory, warm beige and deep black in use", fraction(paletteFound.length, 5), `found: ${paletteFound.join(", ")}`);
  add("contrast", "Text meets WCAG AA contrast", act.contrast ? act.contrast.score : 0, act.contrast?.detail);
  return items;
}

// ---- in-page helpers (page.evaluate: self-contained) ----

function heroPhoto() {
  const h1 = document.querySelector("h1");
  if (!h1) return { pass: false, detail: "no h1" };
  let hero = h1;
  for (let p = h1.parentElement; p && p !== document.body; p = p.parentElement) {
    if (p.getBoundingClientRect().height > 1.6 * innerHeight) break;
    hero = p;
  }
  const r = hero.getBoundingClientRect();
  const full = r.top + scrollY < 160 && r.bottom + scrollY >= 0.9 * innerHeight;
  const vp = innerWidth * innerHeight;
  const area = (e) => {
    const b = e.getBoundingClientRect();
    return Math.max(0, Math.min(b.right, innerWidth) - Math.max(b.left, 0)) * Math.max(0, Math.min(b.bottom, innerHeight) - Math.max(b.top, 0));
  };
  const imgs = [...hero.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth >= 600);
  const bgs = [hero, ...hero.querySelectorAll("*")].filter((e) => /url\(/.test(getComputedStyle(e).backgroundImage));
  const best = Math.max(0, ...[...imgs, ...bgs].map(area)) / vp;
  return { pass: full && best >= 0.25, detail: `hero ${Math.round(r.height)}px of ${innerHeight}px, photo covers ${Math.round(best * 100)}% of the first screen` };
}

/** Marks each service's card (nearest ancestor of its title holding an image but no other service title). */
function markServiceCards(names) {
  const n = (s) => (s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z]+/g, "");
  const keys = names.map(n);
  const titles = [...document.querySelectorAll("h2,h3,h4,h5,strong,p,span,div")].filter((e) => e.children.length === 0 || /^H\d$/.test(e.tagName));
  let withImage = 0;
  const missing = [];
  keys.forEach((k, idx) => {
    const t = titles.find((e) => n(e.innerText) === k);
    if (!t) return missing.push(names[idx]);
    for (let p = t.parentElement, depth = 0; p && p !== document.body && depth < 6; p = p.parentElement, depth++) {
      const txt = n(p.innerText);
      if (keys.some((o) => o !== k && txt.includes(o) && !k.includes(o))) break;
      const img = [...p.querySelectorAll("img")].find((i) => i.complete && i.naturalWidth > 0) || [p, ...p.querySelectorAll("*")].find((e) => /url\(/.test(getComputedStyle(e).backgroundImage));
      if (img) {
        withImage++;
        if (!document.querySelector('[data-sb="service-card"]')) p.setAttribute("data-sb", "service-card");
        return;
      }
    }
    missing.push(names[idx]);
  });
  return { withImage, missing };
}

/** Styles that a hover effect changes, for the element and its descendants. */
function hoverState(sel) {
  const root = document.querySelector(sel);
  if (!root) return null;
  return [root, ...root.querySelectorAll("*")].slice(0, 40).map((e) => {
    const c = getComputedStyle(e);
    return [c.transform, c.scale, c.translate, c.filter, c.boxShadow, c.opacity, c.backgroundColor, c.borderColor, c.color].join("|");
  }).join("\n");
}

async function checkHover(page, sel) {
  const el = page.locator(sel).first();
  if (!(await el.count())) return { pass: false, detail: `nothing matched ${sel}` };
  await el.scrollIntoViewIfNeeded();
  await page.mouse.move(2, 2);
  await page.waitForTimeout(900);
  const before = await page.evaluate(hoverState, sel);
  await el.hover({ force: true, timeout: 5000 });
  await page.waitForTimeout(900);
  const after = await page.evaluate(hoverState, sel);
  return { pass: !!before && before !== after, detail: before === after ? "no style change on hover" : "styles change on hover" };
}

function markGallery() {
  const SUBJECTS = {
    bridal: /bridal|bride|wedding/,
    party: /party|evening|festive|reception|celebration|glam/,
    hair: /hair|updo|braid|blow|curl/,
    transformation: /transformation|before|after|makeover|finished|look/,
    interior: /interior|salon|studio|lounge|chair|mirror|reception|room/,
  };
  const ok = (i) => i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().width > 40;
  let root = [...document.querySelectorAll("[id]")].find((e) => /gallery|portfolio|lookbook/i.test(e.id));
  if (!root) {
    const h = [...document.querySelectorAll("h2")].find((x) => /gallery|portfolio|lookbook/i.test(x.innerText));
    root = h && h.closest("section");
  }
  if (!root) return { score: 0, detail: "no gallery section" };
  root.setAttribute("data-sb", "gallery");
  const imgs = [...root.querySelectorAll("img")].filter(ok);
  if (imgs[0]) imgs[0].parentElement.setAttribute("data-sb", "gallery-item");
  const words = (root.innerText + " " + imgs.map((i) => i.alt).join(" ")).toLowerCase();
  const found = Object.keys(SUBJECTS).filter((k) => SUBJECTS[k].test(words));
  return { score: Math.min(1, imgs.length / 6) * 0.5 + (found.length / 5) * 0.5, detail: `${imgs.length} images; subjects ${found.join(", ")}` };
}

function inlineWhatsapp(re) {
  const rx = new RegExp(re);
  const fixed = (e) => {
    for (let p = e; p; p = p.parentElement) if (getComputedStyle(p).position === "fixed") return true;
    return false;
  };
  const links = [...document.querySelectorAll("a[href]")].filter((a) => rx.test(a.href) && !fixed(a) && !a.closest("header,nav,footer") && a.getBoundingClientRect().width > 0);
  return { pass: links.length > 0, detail: `${links.length} WhatsApp links outside the header, footer and floating button` };
}

function floatingWhatsapp(re) {
  const rx = new RegExp(re);
  const fixed = (e) => {
    for (let p = e; p; p = p.parentElement) if (getComputedStyle(p).position === "fixed") return true;
    return false;
  };
  const cands = [...document.querySelectorAll("a,button")].filter((e) => {
    const r = e.getBoundingClientRect();
    const label = (e.getAttribute("href") || "") + " " + (e.getAttribute("aria-label") || "") + " " + e.innerText;
    return /whatsapp|wa\.me/i.test(label) && fixed(e) && r.width > 0 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  });
  const corner = cands.find((e) => {
    const r = e.getBoundingClientRect();
    return (r.left + r.right) / 2 > 0.75 * innerWidth && (r.top + r.bottom) / 2 > 0.7 * innerHeight && r.bottom <= innerHeight && r.right <= innerWidth;
  });
  if (corner) corner.setAttribute("data-sb", "float-wa");
  return { found: cands.length, corner: !!corner, href: corner?.href || "", target: rx.test(corner?.href || "") };
}

function linkHealth() {
  const as = [...document.querySelectorAll("a")];
  const bad = [];
  for (const a of as) {
    const h = a.getAttribute("href");
    if (h === null || h.trim() === "" || h.trim() === "#" || /^javascript:/i.test(h)) bad.push(`${(a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 30)} -> "${h}"`);
    else if (h.startsWith("#") && !document.getElementById(decodeURIComponent(h.slice(1)))) bad.push(`${a.innerText.trim().slice(0, 30)} -> ${h}`);
  }
  return { score: bad.length ? Math.max(0, 1 - bad.length / Math.max(4, as.length)) * 0.5 : 1, detail: bad.length ? bad.slice(0, 4).join("; ") : `${as.length} links ok` };
}

function servicesTarget(names) {
  const n = (s) => (s || "").toLowerCase();
  const last = [...document.querySelectorAll("h2,h3,h4,h5,p,span,strong")].find((e) => n(e.innerText).trim() === n(names[names.length - 1]));
  if (!last) return null;
  let p = last.parentElement;
  while (p && p !== document.body && !names.every((x) => n(p.innerText).includes(n(x)))) p = p.parentElement;
  if (!p || p === document.body) return null;
  const sec = p.closest("section,[id]") || p;
  return { top: Math.round(sec.getBoundingClientRect().top), gridTop: Math.round(p.getBoundingClientRect().top), vh: innerHeight };
}

function footerInfo(args) {
  const [services, phone] = args;
  const f = document.querySelector("footer") || [...document.querySelectorAll("[role=contentinfo]")][0];
  if (!f) return { score: 0, detail: "no footer" };
  const t = f.innerText.toLowerCase();
  const parts = {
    name: /she salon/.test(t),
    links: [...f.querySelectorAll("a[href^='#'],a[href^='/']")].length >= 3,
    services: services.filter((s) => t.includes(s.toLowerCase())).length >= 3,
    contact: t.replace(/\D/g, "").includes(phone),
    copyright: /©|copyright/.test(t),
  };
  const found = Object.keys(parts).filter((k) => parts[k]);
  return { score: found.length / 5, detail: `found: ${found.join(", ")}` };
}

function fontInfo() {
  const SERIF = /cormorant|playfair|garamond|bodoni|didot|baskerville|lora|cinzel|marcellus|dm serif|prata|gilda|italiana|fraunces|merriweather|noto serif|times|georgia|bellefair|tenor|forum|cardo|crimson|spectral|gloock|bona nova|libre caslon|newsreader|instrument serif|young serif|rozha|yeseva|abhaya|tiro/;
  const SANS = /inter|poppins|montserrat|lato|jost|manrope|dm sans|work sans|nunito|open sans|roboto|helvetica|arial|outfit|raleway|figtree|karla|mulish|plus jakarta|source sans|urbanist|josefin sans|mukta|hind|system-ui|segoe/;
  const kind = (stack) => {
    const fams = stack.toLowerCase().split(",").map((s) => s.replace(/["']/g, "").trim());
    if (SERIF.test(fams[0])) return "serif";
    if (SANS.test(fams[0])) return "sans";
    const g = fams[fams.length - 1];
    return g === "serif" ? "serif" : g === "sans-serif" || g === "system-ui" ? "sans" : "other";
  };
  const heads = [...document.querySelectorAll("h1,h2")].filter((h) => h.getBoundingClientRect().width > 0);
  const serifHeads = heads.filter((h) => kind(getComputedStyle(h).fontFamily) === "serif").length;
  const counts = {};
  for (const p of document.querySelectorAll("p")) if (p.innerText.trim().length > 40) counts[getComputedStyle(p).fontFamily] = (counts[getComputedStyle(p).fontFamily] || 0) + 1;
  const body = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  const headOk = heads.length && serifHeads / heads.length >= 0.8;
  const bodyOk = kind(body) === "sans";
  return { score: ((headOk ? 1 : 0) + (bodyOk ? 1 : 0)) / 2, detail: `serif headings ${serifHeads}/${heads.length}; body ${body.split(",")[0]}` };
}

/** Text over a solid background (media behind the text is skipped); AA thresholds 4.5, or 3 for large text. */
function contrastInfo() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return [r, g, b, a];
  };
  const lum = ([r, g, b]) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  let total = 0, ok = 0;
  const fails = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (!["P", "SPAN", "A", "BUTTON", "LI", "H1", "H2", "H3", "H4", "H5", "LABEL", "DT", "DD", "STRONG", "EM", "SMALL", "TD", "TH", "FIGCAPTION", "BLOCKQUOTE", "CITE", "ADDRESS", "TIME", "DIV"].includes(el.tagName)) continue;
    if (![...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim().length > 1)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || !el.checkVisibility({ visibilityProperty: true }) || el.closest("[aria-hidden=true]")) continue;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg) continue;
    let bg = null, unknown = false;
    for (let p = el; p; p = p.parentElement) {
      const pc = getComputedStyle(p);
      if (pc.backgroundImage !== "none") { unknown = true; break; }
      if (p !== el && [...p.querySelectorAll("img,video,canvas,picture")].some((m) => !el.contains(m) && overlaps(m.getBoundingClientRect(), rect))) { unknown = true; break; }
      const b = parse(pc.backgroundColor);
      if (b && b[3] >= 0.95) { bg = b; break; }
      if (b && b[3] > 0.05) { unknown = true; break; }
    }
    if (unknown) continue;
    bg = bg || [255, 255, 255, 1];
    const a = fg[3];
    const mixed = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
    const [l1, l2] = [lum(mixed), lum(bg)].sort((x, y) => y - x);
    const ratio = (l1 + 0.05) / (l2 + 0.05);
    const size = parseFloat(cs.fontSize), large = size >= 24 || (size >= 18.6 && Number(cs.fontWeight) >= 700);
    total++;
    if (ratio >= (large ? 3 : 4.5)) ok++;
    else fails.push(`"${el.innerText.trim().slice(0, 24)}" ${ratio.toFixed(2)}`);
  }
  const share = ok / Math.max(1, total);
  return { score: share >= 0.97 ? 1 : share, detail: `${ok}/${total} pass${fails.length ? "; " + fails.slice(0, 3).join("; ") : ""}` };
}

/** Effective opacity and transform state of an element, to see scroll reveals settle. */
function revealState(i) {
  const el = document.querySelectorAll('[data-sb-reveal]')[i];
  let op = 1, moved = false;
  for (let p = el; p && p !== document.body; p = p.parentElement) {
    const c = getComputedStyle(p);
    op *= Number(c.opacity);
    if ((c.transform !== "none" && c.transform !== "matrix(1, 0, 0, 1, 0, 0)") || (c.translate !== "none" && c.translate !== "0px")) moved = true;
  }
  return `${op.toFixed(2)}|${moved}`;
}

async function clickByText(page, re) {
  const el = page.locator("a:visible, button:visible").filter({ hasText: re }).first();
  if (!(await el.count())) return false;
  await el.click({ timeout: 5000 });
  return true;
}

async function checkFloat(context, url, handoffs, withMessage) {
  const page = await freshPage(context, url);
  try {
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.waitForTimeout(1200);
    const f = await page.evaluate(floatingWhatsapp, WA_RE.source);
    const res = { ok: f.corner && f.target, detail: `${f.found} fixed WhatsApp controls, bottom-right ${f.corner}, number ${f.target}` };
    if (withMessage && f.corner) {
      const sent = handoffs.length;
      await page.locator('[data-sb="float-wa"]').click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const urls = [f.href, ...handoffs.slice(sent)].map((u) => {
        try {
          const q = new URL(u);
          return { num: WA_RE.test(u), text: q.searchParams.get("text") || "" };
        } catch {
          return { num: false, text: "" };
        }
      });
      const exact = urls.find((u) => u.num && u.text.replace(/\s+/g, " ").trim() === WA_MESSAGE);
      res.message = { pass: !!exact && handoffs.length > sent, detail: `opened ${handoffs.length > sent}; text "${urls[0].text.slice(0, 60)}"` };
    }
    for (const p of context.pages()) if (p !== page && /wa\.me|whatsapp/.test(p.url())) await p.close().catch(() => {});
    return res;
  } finally {
    await page.close();
  }
}

async function floatAcrossPages(context, url, handoffs, pages, withMessage) {
  const list = (pages?.length ? pages : [{ url }]).slice(0, 4);
  const results = [];
  for (const [i, p] of list.entries()) results.push(await attempt(() => checkFloat(context, p.url, handoffs, withMessage && i === 0)));
  const ok = results.filter((r) => r.ok).length;
  return { score: ok / list.length, message: results[0]?.message, detail: `${ok}/${list.length} pages: ${results[0]?.detail || ""}` };
}

export async function interactDesktop(context, url, handoffs, pages) {
  const out = {};
  const page = await freshPage(context, url);
  out.heroPhoto = await attempt(() => page.evaluate(heroPhoto));
  out.links = await attempt(() => page.evaluate(linkHealth));
  out.fonts = await attempt(() => page.evaluate(fontInfo));
  out.inlineWhatsapp = await attempt(() => page.evaluate(inlineWhatsapp, WA_RE.source));
  out.footer = await attempt(() => page.evaluate(footerInfo, [SERVICES, PHONE_DIGITS]));
  out.reveal = await attempt(async () => {
    const n = await page.evaluate(() => {
      const els = [...document.querySelectorAll("h2, main img, section img")].filter((e) => e.getBoundingClientRect().top > innerHeight * 1.2).slice(0, 12);
      els.forEach((e) => e.setAttribute("data-sb-reveal", ""));
      return els.length;
    });
    let changed = 0;
    for (let i = 0; i < n; i++) {
      const before = await page.evaluate(revealState, i);
      await page.locator("[data-sb-reveal]").nth(i).scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(1100);
      const after = await page.evaluate(revealState, i);
      if (before !== after && Number(after.split("|")[0]) >= 0.9) changed++;
    }
    return { pass: changed >= 2, detail: `${changed}/${n} below-the-fold headings and images animate in on scroll` };
  });
  // Scroll back gradually so lazy content above is rendered for the next checks.
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(600);
  const cards = await attempt(() => page.evaluate(markServiceCards, SERVICES));
  out.serviceCards = { score: (cards.withImage || 0) / SERVICES.length, detail: `${cards.withImage || 0}/10 with images${cards.missing?.length ? "; missing " + cards.missing.join(", ") : ""}` };
  out.serviceHover = await attempt(() => checkHover(page, '[data-sb="service-card"]'));
  out.gallery = await attempt(() => page.evaluate(markGallery));
  out.galleryHover = await attempt(() => checkHover(page, '[data-sb="gallery-item"]'));
  await page.close();

  const cPage = await freshPage(context, url);
  out.contrast = await attempt(async () => {
    // Settle every scroll reveal first so text is measured in its final state.
    const h = await cPage.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) {
      await cPage.evaluate((v) => scrollTo(0, v), y);
      await cPage.waitForTimeout(120);
    }
    await cPage.waitForTimeout(800);
    return cPage.evaluate(contrastInfo);
  });
  await cPage.close();

  const sPage = await freshPage(context, url);
  const svc = await attempt(async () => {
    const before = sPage.url();
    if (!(await clickByText(sPage, /explore our services/i))) return { pass: false, detail: "no EXPLORE OUR SERVICES control" };
    await sPage.waitForTimeout(150);
    const early = await sPage.evaluate(() => scrollY);
    await sPage.waitForTimeout(1800);
    const late = await sPage.evaluate(() => scrollY);
    const t = await sPage.evaluate(servicesTarget, SERVICES);
    const smoothCss = await sPage.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior === "smooth");
    const reached = t && ((t.top > -0.3 * t.vh && t.top < 0.5 * t.vh) || (t.gridTop > -0.3 * t.vh && t.gridTop < 0.6 * t.vh));
    const newPage = sPage.url() !== before && !sPage.url().includes("#") && t;
    return {
      pass: !!(reached || newPage),
      smooth: { pass: smoothCss || (early > 0 && early < late * 0.95), detail: `scroll-behavior ${smoothCss ? "smooth" : "auto"}; scrollY ${early} after 150ms, ${late} after 2s` },
      detail: t ? `services section top ${t.top}px, grid top ${t.gridTop}px (viewport ${t.vh})` : "services not found after click",
    };
  });
  out.ctaServices = { pass: svc.pass, detail: svc.detail };
  out.smoothScroll = svc.smooth || { pass: false, detail: svc.detail };
  await sPage.close();

  const bPage = await freshPage(context, url);
  out.ctaBook = await attempt(async () => {
    const sent = handoffs.length;
    const y0 = await bPage.evaluate(() => scrollY);
    if (!(await clickByText(bPage, /book your appointment/i))) return { pass: false, detail: "no BOOK YOUR APPOINTMENT control" };
    await bPage.waitForTimeout(2000);
    const wa = handoffs.slice(sent).some((u) => WA_RE.test(u));
    const reach = await bPage.evaluate((re) => {
      const rx = new RegExp(re);
      const fixed = (e) => { for (let p = e; p; p = p.parentElement) if (getComputedStyle(p).position === "fixed") return true; return false; };
      const shown = (e) => e.getBoundingClientRect().width > 0 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true });
      const dialog = [...document.querySelectorAll("[role=dialog],dialog[open],[aria-modal=true]")].some(shown);
      const link = [...document.querySelectorAll("a[href]")].some((a) => {
        const r = a.getBoundingClientRect();
        return (rx.test(a.href) || a.href.startsWith("tel:")) && !fixed(a) && !a.closest("header,nav") && r.top >= 0 && r.bottom <= innerHeight && r.width > 0;
      });
      return { dialog, link };
    }, WA_RE.source);
    const y1 = await bPage.evaluate(() => scrollY);
    for (const p of context.pages()) if (p !== bPage && /wa\.me|whatsapp/.test(p.url())) await p.close().catch(() => {});
    return { pass: wa || reach.dialog || (reach.link && y1 !== y0), detail: wa ? "opened WhatsApp to the salon" : `scrolled ${y0} -> ${y1}, call/WhatsApp link in view ${reach.link}, booking dialog ${reach.dialog}` };
  });
  await bPage.close();

  out.floatDesktop = await floatAcrossPages(context, url, handoffs, pages, true);
  return out;
}

/** In-page: visible in-viewport links to sections or pages, excluding fixed corner buttons. */
function navLinksInView() {
  return [...document.querySelectorAll("a[href]")].filter((a) => {
    const h = a.getAttribute("href");
    const r = a.getBoundingClientRect();
    return /^(#[\w-]+|\/[\w-])/.test(h) && r.width > 0 && r.bottom > 0 && r.top < innerHeight && a.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  }).length;
}

/** Phone check: the nav starts collapsed and a menu toggle reveals at least 4 section or page links (3 more than before). */
async function checkMobileMenu(context, url) {
  const page = await freshPage(context, url);
  const result = await attempt(async () => {
    const before = await page.evaluate(navLinksInView);
    let toggle = page.locator("button[aria-label*='menu' i]:visible, header [aria-expanded]:visible, nav [aria-expanded]:visible, [aria-controls]:visible").first();
    if (!(await toggle.count())) toggle = page.locator("header button:visible, nav button:visible").filter({ hasNotText: /\w/ }).first();
    if (!(await toggle.count())) return { pass: false, detail: `no menu toggle found; ${before} links visible` };
    await toggle.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    const after = await page.evaluate(navLinksInView);
    return { pass: after >= 4 && after - before >= 3, detail: `section links visible ${before} -> ${after}` };
  });
  await page.close();
  return result;
}

export async function interactMobile(context, url, handoffs, pages) {
  return {
    mobileMenu: await checkMobileMenu(context, url),
    floatPhone: await floatAcrossPages(context, url, handoffs, pages, false),
  };
}
