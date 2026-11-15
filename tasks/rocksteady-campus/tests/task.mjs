// Task-specific part of the verifier: the Rocksteady Campus brief's checklist and the interactions it asks for.
// grade.mjs and probe.mjs are generic across tasks; each task supplies its own task.mjs.
// The site has several routes, so the interactions open each page through its navigation link and report what they find;
// requirements() turns the home-page facts and those reports into the checklist.

const PHONE_DIGITS = ["0631044361", "27631044361"];
const CATEGORIES = ["Kotas", "Dagwoods", "Burgers", "Rolls", "Sandwiches", "Chips & Sides", "Beverages", "Specials & Combos"];
// The six About topics; the wording of the headings is free, so each is matched loosely on the page text.
const ABOUT_TOPICS = { story: /\bstory\b|\bborn\b|\bbegan\b|\bstarted\b|\bfounded\b/, passion: /passion|\blove\b/, quality: /quality/, fresh: /fresh/, portions: /(generous|portions?).{0,200}(afford|price|value)|(afford|price|value).{0,200}(generous|portions?)/, community: /community|rockville/ };
const NAV_ITEMS = ["home", "menu", "about", "about us", "gallery", "reviews", "contact", "order", "order online"];
const ADMIN_AREAS = ["orders", "menu", "reviews", "customers", "promotions", "content", "gallery", "reports"];
const BRAND_RED = "#f1001f";
const CUSTOMER = { name: "Thabo Mokoena", phone: "0721234567", email: "thabo@example.com", address: "12 Vundla Drive, Rockville, Soweto" };
// Each page: the link label that opens it, and the path to try when no such link exists.
const PAGES = {
  menu: { label: "^(our |full |the )?menu$", href: "menu", path: "/menu" },
  about: { label: "^about( us)?$", href: "about", path: "/about" },
  gallery: { label: "^gallery$", href: "gallery", path: "/gallery" },
  reviews: { label: "^reviews?$", href: "review", path: "/reviews" },
  contact: { label: "^contact( us)?$", href: "contact", path: "/contact" },
  order: { label: "^order( online| now)?$", href: "order", path: "/order" },
  login: { label: "^(log ?in|sign ?in|account|my account|portal)$", href: "login|signin|sign-in|account|portal", path: "/login" },
};

const norm = (s) => (s || "").toLowerCase().replace(/[’`]/g, "'").replace(/&/g, " and ").replace(/[^a-z0-9#'+ ]+/g, " ").replace(/\s+/g, " ").trim();
const digits = (s) => (s || "").replace(/\D/g, "");
const round = (x) => Math.round(x * 1000) / 1000;

function hexDistance(a, b) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return Math.max(...p(a).map((x, i) => Math.abs(x - p(b)[i])));
}

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const d = views.desktop.facts;
  const rendered = Object.entries(views).filter(([, v]) => v.ok);
  const act = Object.assign({}, ...rendered.map(([, v]) => v.interactions));
  const text = norm(d.text);
  const clickTexts = d.clickables.filter((c) => c.visible).map((c) => norm(c.text));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: round(Math.max(0, Math.min(1, score))), detail: String(detail).slice(0, 240) });
  const has = (s) => text.includes(norm(s));
  // An interaction report scores its `score` when it has one, else 1 for a pass; a missing report (page never opened) scores 0.
  const fromAct = (id, desc, key) => {
    const r = act[key];
    add(id, desc, r ? (r.score ?? (r.pass ? 1 : 0)) : 0, r ? r.detail : "not run");
  };

  // Home page
  add("name", "Business name shown", has("Rocksteady Campus") ? 1 : 0);
  add("headline", "Home shows the given headline", has("Big flavour. Generous portions. Real township taste.") ? 1 : 0);
  const ctas = ["order now", "explore our menu"].filter((c) => clickTexts.some((t) => t.includes(c)));
  add("hero-ctas", "Order Now and Explore Our Menu buttons", ctas.length / 2, `found: ${ctas.join(", ")}`);
  fromAct("hero-slider", "Hero banner slides through the five attached images", "heroSlider");
  fromAct("logo", "Official logo in the header and the footer", "logo");
  const cats = CATEGORIES.filter(has);
  add("home-categories", "Featured menu categories on the home page", cats.length / 4, `found ${cats.length}/8`);
  add("home-favourites", "Best-selling and customer favourite meals", /best[- ]?sell|favourite|favorite|popular/i.test(d.text) && /R\s?\d{2}/.test(d.text) ? 1 : 0);
  add("home-promotions", "Special promotions and daily deals", /special|deal|promo|combo|offer/i.test(d.text) ? 1 : 0);
  add("home-testimonials", "Customer testimonials and ratings", /review|testimonial|customers? (say|love)|rating/i.test(d.text) ? 1 : 0);
  const addressParts = ["1563 Makapane", "Rockville", "Soweto", "1818"].filter(has);
  add("address", "Business address shown", addressParts.length / 4, `found ${addressParts.length}/4`);
  add("phone", "Telephone number shown", PHONE_DIGITS.some((p) => digits(d.text).includes(p)) ? 1 : 0);
  const hours = (/11[:.]00\s*(–|-|—|to|until)\s*20[:.]00|11\s*am\s*(–|-|—|to|until)\s*8\s*pm/i.test(d.text) ? 0.5 : 0) + (/sun(day)?s?\W{0,12}closed|closed\W{0,12}(on )?sun/i.test(d.text) ? 0.5 : 0);
  add("hours", "Opening hours: Monday to Saturday 11:00 to 20:00, Sunday closed", hours);
  const socialRe = /instagram|facebook|fb\.com|tiktok|twitter\.com|x\.com\/|youtube/i;
  const social = new Set(d.clickables.filter((c) => socialRe.test(c.href)).map((c) => c.href.match(socialRe)[0].toLowerCase()));
  add("social-links", "Footer social media links", Math.min(1, social.size / 2), [...social].join(", "));
  const navLabels = ["menu", "about", "gallery", "reviews", "contact"].filter((n) => d.clickables.some((c) => c.inHeader && c.visible && norm(c.text).split(" ").includes(n)));
  add("nav-links", "Navigation links to the pages", navLabels.length / 5, `found: ${navLabels.join(", ")}`);
  fromAct("sticky-nav", "Sticky navigation", "stickyNav");
  add("seo-meta", "Title names the business and a meta description exists", (/rocksteady/i.test(d.title) ? 0.5 : 0) + (d.metaDescription.trim() ? 0.5 : 0), d.title);
  add("brand-red", "Uses the brand red #F1001F", d.colors.some((c) => hexDistance(c, BRAND_RED) <= 6) ? 1 : 0);

  // Pages and flows
  fromAct("about-topics", "About page covers the six topics", "about");
  fromAct("menu-categories", "Menu page lists the eight categories", "menuCategories");
  fromAct("menu-items", "Menu items have a price in Rand and an add-to-cart button", "menuItems");
  fromAct("menu-filter", "Menu category filter narrows the list", "menuFilter");
  fromAct("menu-search", "Menu search narrows the list", "menuSearch");
  fromAct("customise", "A meal can be customised with extras before adding", "customise");
  fromAct("cart-count", "Adding a meal updates the cart count in the header", "cartCount");
  fromAct("checkout-options", "Checkout offers collection or delivery, a cash option and an order summary", "checkoutOptions");
  fromAct("checkout-validation", "An empty checkout is not accepted", "checkoutValidation");
  fromAct("order-confirmation", "A valid order is confirmed with an order number", "orderConfirmation");
  fromAct("gallery-lightbox", "Gallery image opens in a lightbox", "lightbox");
  fromAct("reviews-page", "Reviews page shows an overall rating, reviews and a submission form", "reviews");
  fromAct("review-validation", "An empty review is not accepted", "reviewValidation");
  fromAct("contact-info", "Contact page has a Google map, directions, click-to-call, WhatsApp and an enquiry form", "contact");
  fromAct("contact-validation", "An empty enquiry is not accepted", "contactValidation");
  fromAct("login-portal", "Login portal: customer login, registration, password recovery and an administrator entry", "login");
  fromAct("login-rejects", "Wrong login details are rejected", "loginRejects");
  fromAct("admin-dashboard", "The demo administrator reaches a dashboard that manages orders, menu, content and reviews", "admin");
  fromAct("mobile-nav", "Mobile-friendly navigation", "mobileMenu");
  fromAct("mobile-order-now", "Order Now stays visible on a phone", "mobileOrderNow");
  fromAct("mobile-pages-fit", "No page overflows horizontally on a phone", "mobilePagesFit");

  // Health
  const errors = rendered.flatMap(([, v]) => v.log.consoleErrors);
  add("console-clean", "No console errors", errors.length ? 0 : 1, errors.slice(0, 2).join(" | "));
  const broken = new Set(rendered.flatMap(([, v]) => [...v.facts.brokenImages, ...v.log.failedImages]));
  add("images-load", "All images load", 1 - broken.size / 5, [...broken].slice(0, 3).join(", "));
  const overflowing = Object.entries(views).filter(([, v]) => !v.ok || v.facts.overflowX > 1).map(([name, v]) => (v.ok ? `${name} ${v.facts.overflowX}px` : `${name} failed`));
  add("no-overflow", "Home page has no horizontal overflow at any width", 1 - overflowing.length / Object.keys(views).length, overflowing.join(", "));
  return items;
}

// ---- in-page helpers (serialised into the page) ----

function findPageHref({ label, href }) {
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const links = [...document.querySelectorAll("a[href]")].filter((a) => !/^(https?:)?\/\//.test(a.getAttribute("href")) || a.origin === location.origin);
  const byLabel = links.find((a) => new RegExp(label, "i").test(norm(a.innerText || a.getAttribute("aria-label"))));
  const byHref = links.find((a) => new RegExp(`^[#/]*(${href})\\b`, "i").test(a.getAttribute("href")));
  return (byLabel || byHref)?.href || null;
}

function pageState() {
  const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const main = document.querySelector("main") || document.body;
  const text = document.body.innerText;
  const fields = [...document.querySelectorAll("input,select,textarea")].filter(visible);
  return {
    text,
    prices: (main.innerText.match(/R\s?\d{1,4}([.,]\d{2})?/g) || []).length,
    addButtons: [...main.querySelectorAll("button,a,[role=button]")].filter((b) => visible(b) && /\badd\b/i.test(`${b.innerText} ${b.getAttribute("aria-label") || ""}`)).length,
    invalid: fields.filter((f) => !f.checkValidity() || f.getAttribute("aria-invalid") === "true").length,
    alerts: [...document.querySelectorAll("[role=alert]")].filter(visible).length,
    password: fields.some((f) => f.type === "password"),
    textareas: fields.filter((f) => f.tagName === "TEXTAREA").length,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.href),
    iframes: [...document.querySelectorAll("iframe")].map((f) => f.src),
  };
}

function overlayOpen() {
  const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  if ([...document.querySelectorAll("[role=dialog],dialog[open],[aria-modal=true]")].some(visible)) return true;
  return [...document.body.querySelectorAll("*")].some((el) => {
    if (getComputedStyle(el).position !== "fixed" || !el.querySelector("img") || !visible(el)) return false;
    const r = el.getBoundingClientRect();
    return r.width * r.height >= 0.5 * innerWidth * innerHeight;
  });
}

/** The hero: distinct photographs in the block around the largest image in the first screen, and logo images in header and footer. */
function heroFacts() {
  const src = (i) => (i.currentSrc || i.src || "").split("?")[0];
  const isLogo = (i) => /logo/i.test(`${i.alt} ${i.src}`);
  const imgs = [...document.images].filter((i) => !isLogo(i));
  const inFirstScreen = imgs.filter((i) => {
    const r = i.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0 && r.width * r.height > 0.15 * innerWidth * innerHeight;
  });
  const shown = inFirstScreen.filter((i) => i.checkVisibility({ opacityProperty: true, visibilityProperty: true })).map(src);
  let block = inFirstScreen[0]?.closest("section") || inFirstScreen[0]?.parentElement;
  while (block && block.parentElement && block.parentElement !== document.body && block.getBoundingClientRect().height < 0.6 * innerHeight) block = block.parentElement;
  const inBlock = block ? [...new Set([...block.querySelectorAll("img")].filter((i) => !isLogo(i)).map(src))] : [];
  const logos = (sel) => [...document.querySelectorAll(`${sel} img`)].some((i) => isLogo(i) && i.naturalWidth > 0);
  return { shown, inBlock, headerLogo: logos("header") || logos("nav"), footerLogo: logos("footer") };
}

function headerCartCount() {
  const scope = document.querySelector("header") || document.querySelector("nav") || document.body;
  const counts = [];
  for (const el of scope.querySelectorAll("a,button,[role=button]")) {
    const label = `${el.innerText} ${el.getAttribute("aria-label") || ""} ${el.getAttribute("href") || ""} ${el.title || ""}`;
    if (!/cart|basket|bag|order/i.test(label)) continue;
    for (const m of `${el.innerText} ${el.getAttribute("aria-label") || ""}`.match(/\d+/g) || []) counts.push(Number(m));
  }
  return { found: [...scope.querySelectorAll("a,button,[role=button]")].some((el) => /cart|basket|bag/i.test(`${el.innerText} ${el.getAttribute("aria-label") || ""} ${el.title || ""}`)), count: Math.max(0, ...counts) };
}

/** Fills every visible empty text field of the form around the first phone/name field with a value that suits its kind. */
function fillFields(customer) {
  const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const describe = (f) => [f.type, f.name, f.id, f.placeholder, f.getAttribute("aria-label"), f.autocomplete, f.labels?.[0]?.innerText, f.closest("label")?.innerText, f.parentElement?.innerText?.slice(0, 80)].join(" ").toLowerCase();
  const set = (f, v) => {
    const proto = f.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(f, v);
    f.dispatchEvent(new Event("input", { bubbles: true }));
    f.dispatchEvent(new Event("change", { bubbles: true }));
    f.dispatchEvent(new Event("blur", { bubbles: true }));
  };
  const filled = [];
  const scope = document.querySelector("main") || document.body;
  for (const f of scope.querySelectorAll("input,textarea")) {
    if (!visible(f) || f.value || f.disabled || f.readOnly) continue;
    if (["hidden", "submit", "button", "checkbox", "radio", "file", "search", "range", "date", "time", "number"].includes(f.type)) continue;
    const t = describe(f);
    if (/search|promo|coupon|voucher/.test(t)) continue;
    const kind = f.type === "tel" || /phone|mobile|cell|whatsapp|\b0[67]\d\b/.test(t) ? "phone" : f.type === "email" || /e-?mail/.test(t) ? "email" : f.type === "password" ? "password" : /address|street|suburb/.test(t) ? "address" : /name/.test(t) ? "name" : "other";
    set(f, { phone: customer.phone, email: customer.email, password: "Rockville#2026", address: customer.address, name: customer.name, other: "Extra napkins please, thank you." }[kind]);
    filled.push(kind);
  }
  return filled;
}

// ---- node-side helpers ----

const newLines = (before, after) => {
  const seen = new Set(before.split("\n").map((l) => l.trim()));
  return after.split("\n").map((l) => l.trim()).filter((l) => l && !seen.has(l));
};

async function attempt(fn) {
  try {
    return await fn();
  } catch (e) {
    return { pass: false, detail: `error: ${String(e).split("\n")[0].slice(0, 200)}` };
  }
}

async function freshPage(context, url) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 90_000 });
  await page.waitForTimeout(2000);
  return page;
}

/** Opens a page of the site: follows its navigation link from the home page, else tries the usual path. */
async function openPage(context, base, name) {
  const page = await freshPage(context, base);
  const href = await page.evaluate(findPageHref, PAGES[name]);
  await page.goto(href || new URL(PAGES[name].path, base).href, { waitUntil: "load", timeout: 90_000 });
  await page.waitForTimeout(1500);
  // Scroll once through the page so scroll-triggered reveals have fired before anything is read.
  const { height, step } = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, step: innerHeight }));
  for (let y = 0; y < Math.min(height, 20_000); y += step / 2) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  return page;
}

const clickable = (page, re, scope = "body") => page.locator(`${scope} button:visible, ${scope} a:visible, ${scope} [role=button]:visible, ${scope} [role=tab]:visible, ${scope} input[type=submit]:visible`).filter({ hasText: re });

/** Clicks the submit control of the first visible form in main (or the last button that reads like one) and reports what changed. */
async function submitForm(page, re) {
  const before = await page.evaluate(pageState);
  let submit = page.locator("main form:visible button[type=submit]:visible, main form:visible input[type=submit]:visible").last();
  if (!(await submit.count())) submit = clickable(page, re, "main").last();
  if (!(await submit.count())) return null;
  await submit.scrollIntoViewIfNeeded();
  await submit.click({ timeout: 5000 });
  await page.waitForTimeout(1500);
  const after = await page.evaluate(pageState);
  return { before, after, added: newLines(before.text, after.text) };
}

const SUCCESS = /thank|received|sent|submitted|success|confirmed|we('| wi)ll (be in touch|get back)|pending (approval|moderation)/i;
const ERROR = /required|please|enter |valid|missing|fill|at least|select|choose|must|cannot|incorrect|wrong|not (found|recogni)|could ?n.t|unable|no account|try again/i;

/** An empty form passes when the submit is blocked (invalid fields, an alert or an error line) and nothing reads like success. */
async function emptySubmitBlocked(page, re) {
  const r = await submitForm(page, re);
  if (!r) return { pass: false, detail: "no form submit control found" };
  const message = r.added.find((l) => ERROR.test(l));
  const success = r.added.find((l) => SUCCESS.test(l) && !ERROR.test(l));
  return { pass: !success && (r.after.invalid > 0 || r.after.alerts > 0 || !!message), detail: `invalid fields ${r.after.invalid}, alerts ${r.after.alerts}, message ${message || "-"}, success ${success || "-"}` };
}

export async function interactDesktop(context, url) {
  const out = {};

  // Home: hero slider, logo, sticky navigation.
  const home = await freshPage(context, url);
  out.heroSlider = await attempt(async () => {
    const seen = new Set();
    let inBlock = [];
    for (let i = 0; i < 14; i++) {
      const f = await home.evaluate(heroFacts);
      f.shown.forEach((s) => seen.add(s));
      if (f.inBlock.length > inBlock.length) inBlock = f.inBlock;
      await home.waitForTimeout(1000);
    }
    const count = Math.max(seen.size, inBlock.length);
    return { pass: count >= 5 && seen.size >= 2, score: (Math.min(5, count) / 5 + (seen.size >= 2 ? 1 : 0)) / 2, detail: `${inBlock.length} photographs in the hero, ${seen.size} shown in turn over 14s` };
  });
  out.logo = await attempt(async () => {
    const f = await home.evaluate(heroFacts);
    return { pass: f.headerLogo && f.footerLogo, score: ((f.headerLogo ? 1 : 0) + (f.footerLogo ? 1 : 0)) / 2, detail: `header ${f.headerLogo}, footer ${f.footerLogo}` };
  });
  out.stickyNav = await attempt(async () => {
    await home.evaluate(() => window.scrollTo(0, 1600));
    await home.waitForTimeout(800);
    const stuck = await home.evaluate(() => {
      const top = document.elementsFromPoint(innerWidth / 2, 24).find((el) => el.closest("header,nav"));
      return !!top && scrollY > 800;
    });
    return { pass: stuck, detail: `navigation at the top of the viewport after scrolling: ${stuck}` };
  });
  await home.close();

  const about = await openPage(context, url, "about");
  out.about = await attempt(async () => {
    const text = norm((await about.evaluate(pageState)).text);
    const found = Object.keys(ABOUT_TOPICS).filter((t) => ABOUT_TOPICS[t].test(text));
    return { pass: found.length === 6, score: found.length / 6, detail: `found ${found.length}/6: ${found.join(", ")}` };
  });
  await about.close();

  // Menu: categories, items, filter, search.
  const menu = await openPage(context, url, "menu");
  const menuStart = await menu.evaluate(pageState);
  out.menuCategories = await attempt(async () => {
    const text = norm(menuStart.text);
    const found = CATEGORIES.filter((c) => text.includes(norm(c)));
    return { pass: found.length === 8, score: found.length / 8, detail: `found ${found.length}/8` };
  });
  out.menuItems = { pass: menuStart.prices >= 20 && menuStart.addButtons >= 20, score: (Math.min(1, menuStart.prices / 20) + Math.min(1, menuStart.addButtons / 20)) / 2, detail: `${menuStart.prices} prices, ${menuStart.addButtons} add buttons` };
  out.menuFilter = await attempt(async () => {
    const filter = clickable(menu, /^\s*Burgers(\s*\(?\d+\)?)?\s*$/i, "main").first();
    if (!(await filter.count())) return { pass: false, detail: "no Burgers category control on the menu page" };
    await filter.click({ timeout: 5000 });
    await menu.waitForTimeout(1200);
    const after = await menu.evaluate(pageState);
    const inView = await menu.evaluate(() => /burger/i.test([...document.querySelectorAll("main h1,main h2,main h3,main h4")].filter((h) => h.getBoundingClientRect().top < innerHeight && h.getBoundingClientRect().bottom > 0).map((h) => h.innerText).join(" ")));
    // Uber Eats style menus either filter the list or jump to the category's section; both count.
    const narrowed = after.prices > 0 && after.prices < menuStart.prices;
    return { pass: narrowed || inView, detail: `prices ${menuStart.prices} -> ${after.prices}, burger heading in view ${inView}` };
  });
  await menu.close();
  const search = await openPage(context, url, "menu");
  out.menuSearch = await attempt(async () => {
    const input = search.locator("main input[type=search]:visible, main input[placeholder*='earch' i]:visible, main input[aria-label*='earch' i]:visible, input[placeholder*='earch' i]:visible").first();
    if (!(await input.count())) return { pass: false, detail: "no search field on the menu page" };
    await input.fill("dagwood");
    await search.waitForTimeout(1200);
    const after = await search.evaluate(pageState);
    return { pass: after.prices > 0 && after.prices < menuStart.prices, detail: `"dagwood": prices ${menuStart.prices} -> ${after.prices}` };
  });
  await search.close();

  // Ordering: add a meal, cart count, checkout validation, confirmation. One page throughout, so in-memory carts survive.
  const shop = await openPage(context, url, "menu");
  const countBefore = await shop.evaluate(headerCartCount);
  await attempt(async () => {
    const addBtn = shop.locator("main button:visible, main a:visible").filter({ hasText: /\badd\b/i }).or(shop.locator("main button[aria-label*='add' i]:visible")).first();
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click({ timeout: 5000 });
    await shop.waitForTimeout(1200);
    const dialog = shop.locator("[role=dialog]:visible, dialog[open], [aria-modal=true]:visible").last();
    if (await dialog.count()) {
      const options = await dialog.locator("input[type=checkbox], input[type=radio], [role=checkbox], [role=radio], [role=switch], select, textarea").count();
      const stepper = await dialog.locator("button[aria-label*='ncrease' i], button[aria-label*='quantity' i]").count();
      out.customise = { pass: options > 0, detail: `dialog with ${options} option controls, quantity control ${stepper > 0}` };
      await dialog.locator("button:visible").filter({ hasText: /\badd\b/i }).last().click({ timeout: 5000 });
      await shop.waitForTimeout(1200);
    } else out.customise = { pass: false, detail: "adding a meal opened no customisation dialog" };
  });
  out.customise ||= { pass: false, detail: "no add-to-cart button found on the menu page" };
  out.cartCount = await attempt(async () => {
    const after = await shop.evaluate(headerCartCount);
    return { pass: after.found && after.count > countBefore.count, score: ((after.found ? 1 : 0) + (after.count > countBefore.count ? 1 : 0)) / 2, detail: `cart control ${after.found}, count ${countBefore.count} -> ${after.count}` };
  });
  const checkoutReport = await attempt(async () => {
    const checkout = () => clickable(shop, /check ?out/i).first();
    if (!(await checkout().count())) {
      const cart = shop.locator("header button:visible, header a:visible").filter({ has: shop.locator("svg") }).and(shop.locator("[aria-label*='cart' i], [aria-label*='basket' i], [aria-label*='bag' i], [href*='cart' i], [title*='cart' i]")).first();
      if (await cart.count()) await cart.click({ timeout: 5000 });
      await shop.waitForTimeout(1000);
    }
    if (await checkout().count()) await checkout().click({ timeout: 5000 });
    else {
      const href = await shop.evaluate(findPageHref, PAGES.order);
      const link = shop.locator(`a[href="${new URL(href || "/order", url).pathname}"]:visible`).first();
      if (await link.count()) await link.click({ timeout: 5000 });
    }
    await shop.waitForTimeout(1500);
    // Some checkouts sit behind one more "checkout" step on the order page.
    const s = await shop.evaluate(pageState);
    if (!/name/i.test(s.text) && (await checkout().count())) {
      await checkout().click({ timeout: 5000 });
      await shop.waitForTimeout(1500);
    }
    const state = await shop.evaluate(pageState);
    const parts = { collection: /collect|pick[- ]?up/i.test(state.text), delivery: /deliver/i.test(state.text), cash: /cash/i.test(state.text), subtotal: /subtotal/i.test(state.text), total: /\btotal\b/i.test(state.text) && /R\s?\d/.test(state.text) };
    const ok = Object.values(parts).filter(Boolean).length;
    return { pass: ok === 5, score: ok / 5, detail: Object.entries(parts).map(([k, v]) => `${k} ${v}`).join(", ") };
  });
  out.checkoutOptions = checkoutReport;
  const ORDER_NUMBER = /(#\s?[A-Z0-9-]*\d{3,}|\b[A-Z]{2,5}[- ]?\d{3,}[A-Z0-9-]*\b)/;
  const SUBMIT_ORDER = /place (my |your )?order|confirm( order)?|submit order|complete order|send order|pay/i;
  out.checkoutValidation = await attempt(async () => {
    const r = await submitForm(shop, SUBMIT_ORDER);
    if (!r) return { pass: false, detail: "no place-order control found" };
    const confirmed = r.added.find((l) => /confirm|thank|received|placed/i.test(l) && ORDER_NUMBER.test(r.added.join(" ")));
    const message = r.added.find((l) => ERROR.test(l));
    return { pass: !confirmed && (r.after.invalid > 0 || r.after.alerts > 0 || !!message), detail: `invalid fields ${r.after.invalid}, alerts ${r.after.alerts}, message ${message || "-"}` };
  });
  out.orderConfirmation = await attempt(async () => {
    const filled = await shop.evaluate(fillFields, CUSTOMER);
    await shop.waitForTimeout(400);
    const r = await submitForm(shop, SUBMIT_ORDER);
    if (!r) return { pass: false, detail: "no place-order control found" };
    const number = r.added.join(" \n ").match(ORDER_NUMBER)?.[0];
    const confirmed = r.added.find((l) => /confirm|thank|received|placed|on its way|preparing/i.test(l));
    return { pass: !!number && !!confirmed, score: ((number ? 1 : 0) + (confirmed ? 1 : 0)) / 2, detail: `filled ${filled.join(",")}; order number ${number || "-"}; ${confirmed || "no confirmation text"}` };
  });
  await shop.close();

  const gallery = await openPage(context, url, "gallery");
  out.lightbox = await attempt(async () => {
    const before = await gallery.evaluate(overlayOpen);
    const index = await gallery.evaluate(() => [...document.querySelectorAll("main img")].findIndex((i) => i.getBoundingClientRect().width >= 150 && i.checkVisibility() && !i.closest("header,footer")));
    if (index < 0) return { pass: false, detail: "no gallery image found" };
    const img = gallery.locator("main img").nth(index);
    await img.scrollIntoViewIfNeeded();
    await img.click({ force: true, timeout: 5000 });
    await gallery.waitForTimeout(1000);
    const after = await gallery.evaluate(overlayOpen);
    return { pass: !before && after, detail: `overlay before ${before}, after ${after}` };
  });
  await gallery.close();

  const reviews = await openPage(context, url, "reviews");
  out.reviews = await attempt(async () => {
    const s = await reviews.evaluate(pageState);
    const stars = await reviews.evaluate(() => document.querySelectorAll("main svg[class*='star' i], main [aria-label*='star' i], main [aria-label*='out of 5' i]").length + (document.body.innerText.match(/★/g) || []).length);
    const parts = { rating: /\b[1-5][.,]\d\b/.test(s.text), stars: stars >= 5, form: s.textareas > 0, dates: /\b(20\d\d|\d+ (day|week|month|year)s? ago)\b/i.test(s.text) };
    const ok = Object.values(parts).filter(Boolean).length;
    return { pass: ok === 4, score: ok / 4, detail: Object.entries(parts).map(([k, v]) => `${k} ${v}`).join(", ") };
  });
  out.reviewValidation = await attempt(() => emptySubmitBlocked(reviews, /submit|send|post|share|leave/i));
  await reviews.close();

  const contact = await openPage(context, url, "contact");
  out.contact = await attempt(async () => {
    const s = await contact.evaluate(pageState);
    const mapRe = /google\.[a-z.]+\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps/i;
    const parts = {
      map: s.iframes.some((f) => mapRe.test(f)),
      directions: s.hrefs.some((h) => mapRe.test(h)),
      call: s.hrefs.some((h) => /^tel:/i.test(h) && PHONE_DIGITS.some((p) => digits(h).includes(p))),
      whatsapp: s.hrefs.some((h) => /wa\.me|whatsapp\.com/i.test(h)),
      form: s.textareas > 0,
    };
    const ok = Object.values(parts).filter(Boolean).length;
    return { pass: ok === 5, score: ok / 5, detail: Object.entries(parts).map(([k, v]) => `${k} ${v}`).join(", ") };
  });
  out.contactValidation = await attempt(() => emptySubmitBlocked(contact, /send|submit|enquir/i));
  await contact.close();

  // Login portal and the demo administrator.
  const login = await openPage(context, url, "login");
  out.login = await attempt(async () => {
    const s = await login.evaluate(pageState);
    const parts = { password: s.password, register: /register|sign ?up|create (an |your )?account/i.test(s.text), recovery: /forgot|reset|recover/i.test(s.text), admin: /admin|staff/i.test(s.text) };
    const ok = Object.values(parts).filter(Boolean).length;
    return { pass: ok === 4, score: ok / 4, detail: Object.entries(parts).map(([k, v]) => `${k} ${v}`).join(", ") };
  });
  const signIn = async (page, email, password) => {
    const before = await page.evaluate(pageState);
    await page.locator("input[type=email]:visible, input[name*='mail' i]:visible, input[type=text]:visible").first().fill(email);
    await page.locator("input[type=password]:visible").first().fill(password);
    await page.locator("input[type=password]:visible").first().press("Enter");
    await page.waitForTimeout(1500);
    const after = await page.evaluate(pageState);
    return { after, added: newLines(before.text, after.text) };
  };
  out.loginRejects = await attempt(async () => {
    const r = await signIn(login, "nobody@example.com", "wrong-password-1");
    const message = r.added.find((l) => ERROR.test(l) || /invalid|incorrect|match/i.test(l));
    return { pass: r.after.password && (!!message || r.after.alerts > 0 || r.after.invalid > 0), detail: `still on the login form ${r.after.password}, message ${message || "-"}` };
  });
  out.admin = await attempt(async () => {
    const tab = clickable(login, /admin|staff/i).first();
    if (await tab.count()) await tab.click({ timeout: 5000 });
    await login.waitForTimeout(800);
    const creds = await login.evaluate(() => {
      const text = document.body.innerText;
      const email = text.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) || [];
      const marked = [...document.querySelectorAll("strong,b,code,kbd,samp,mark")].map((e) => e.innerText.trim());
      const after = [...text.matchAll(/password\s*[:=]?\s*([^\s,;]{6,})/gi)].map((m) => m[1]);
      return { email, passwords: [...new Set([...marked, ...after])].filter((t) => t && !t.includes("@") && !/\s/.test(t) && t.length >= 6) };
    });
    if (!creds.email.length || !creds.passwords.length) return { pass: false, detail: "no demo administrator email and password shown on the administrator login screen" };
    for (const email of creds.email.slice(0, 2)) {
      for (const password of creds.passwords.slice(0, 3)) {
        if (!(await login.locator("input[type=password]:visible").count())) break;
        await signIn(login, email, password);
      }
    }
    const s = await login.evaluate(pageState);
    const text = norm(s.text);
    const areas = ADMIN_AREAS.filter((a) => text.includes(a));
    const inside = !s.password && /dashboard|admin/i.test(s.text);
    return { pass: inside && areas.length >= 6, score: inside ? Math.min(1, areas.length / 6) : 0, detail: `signed in ${inside}; areas: ${areas.join(", ")}` };
  });
  await login.close();
  return out;
}

export async function interactMobile(context, url) {
  const out = {};
  const page = await freshPage(context, url);
  const navVisible = (items) =>
    [...document.querySelectorAll("a,button")].filter((el) => {
      const r = el.getBoundingClientRect();
      const label = (el.innerText || "").toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();
      return items.includes(label) && r.width > 0 && r.bottom > 0 && r.top < innerHeight && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    }).length;
  out.mobileOrderNow = await attempt(async () => {
    const shown = await page.evaluate(() =>
      [...document.querySelectorAll("a,button")].some((el) => {
        const r = el.getBoundingClientRect();
        return /order now/i.test(el.innerText || "") && r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
      }));
    return { pass: shown, detail: `"Order now" readable in the first phone screen: ${shown}` };
  });
  out.mobileMenu = await attempt(async () => {
    const before = await page.evaluate(navVisible, NAV_ITEMS);
    // A bottom tab bar that already shows the pages is a mobile navigation too.
    if (before >= 4) return { pass: true, detail: `${before} page links visible without a toggle` };
    let toggle = page.locator("button[aria-label*='menu' i]:visible, button[aria-label*='navigation' i]:visible, header [aria-expanded]:visible, header [aria-controls]:visible").first();
    if (!(await toggle.count())) toggle = page.locator("header button:visible, nav button:visible").filter({ hasNotText: /\w/ }).last();
    if (!(await toggle.count())) return { pass: false, detail: "no menu toggle found" };
    await toggle.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    const after = await page.evaluate(navVisible, NAV_ITEMS);
    return { pass: after >= 4, detail: `page links visible ${before} -> ${after}` };
  });
  await page.close();
  out.mobilePagesFit = await attempt(async () => {
    const over = [];
    for (const name of Object.keys(PAGES)) {
      const p = await openPage(context, url, name);
      const o = (await p.evaluate(pageState)).overflowX;
      if (o > 1) over.push(`${name} ${o}px`);
      await p.close();
    }
    return { pass: !over.length, score: 1 - over.length / Object.keys(PAGES).length, detail: over.join(", ") || "all pages fit" };
  });
  return out;
}
