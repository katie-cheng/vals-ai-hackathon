// Task-specific part of the verifier: the Rocksteady Campus brief's checklist, the interactions it asks for, and what grade.mjs
// should intercept or exempt. grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of tasks/verifier/; only this file is per task.
import { assignPages, attempt, checkMobileMenu, digits, freshPage, hexDistance, newLines, norm, overlayOpen, squash } from "./lib.mjs";

export const HANDOFF_URLS = /wa\.me|whatsapp\.com/;
// Nothing in this brief asks for a pattern that grade.mjs SLOP_CHECKS penalises.
export const SLOP_EXEMPT = { big_rounding: "brief: stylish cards with subtle shadows and rounded corners" };

const PHONE = "631044361";
const WHATSAPP = "27631044361";
// Used only when the login screen does not show the demo credentials it is asked to show.
const ADMIN = { email: "admin@rocksteadycampus.co.za", password: "Rocksteady#2026" };
const HEADLINE = "BIG FLAVOUR. GENEROUS PORTIONS. REAL TOWNSHIP TASTE.";
const CMS_MARK = "CAMPUS EDIT CHECK 4471";
const HEROES = ["hero-kota", "hero-dagwood", "hero-burger", "hero-sandwich", "hero-toasties"];
const CATEGORIES = ["Kotas", "Dagwoods", "Burgers", "Rolls", "Sandwiches", "Chips & Sides", "Beverages", "Specials & Combos"];
const CATEGORY_COUNTS = { Kotas: 10, Dagwoods: 4, Burgers: 3, Rolls: 5, Sandwiches: 3, "Chips & Sides": 25 };
const ROLES = {
  about: [/about|story/],
  menu: [/menu/],
  order: [/order|checkout|cart|basket/],
  gallery: [/gallery|photos/],
  reviews: [/review/],
  login: [/log-?in|sign-?in/, /account|portal/],
  contact: [/contact/],
};
const NAV_ITEMS = ["home", "menu", "our menu", "about", "about us", "gallery", "reviews", "contact", "contact us"];
const ADMIN_AREAS = [/\borders?\b/, /\bmenu\b|\bmeals?\b/, /\breviews?\b/, /\bcustomers?\b/, /promotions?|specials|offers/, /content|pages|website/, /gallery|images|photos|media/, /reports?|sales/, /opening hours|business details|settings/];
const CHECKOUT_FIELDS = [
  ["name", "\\bname\\b"],
  ["mobile", "mobile|phone|cell|contact number"],
  ["address", "address|street"],
  ["instructions", "instruction|note|special|request"],
];
const CHECKOUT = { name: "Thabo Mokoena", mobile: "0821234567", address: "12 Vilakazi Street, Orlando West, Soweto", instructions: "Extra atchar please" };
const ADD_RE = /^\+?\s*add\b|add to (cart|order|basket)/i;
const PRICE_RE = /\bR\s?\d+(?:[.,]\d{2})?\b/g;

const fraction = (found, total) => found / total;

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const pages = views.desktop.pages;
  const byRole = assignPages(pages, ROLES);
  const home = pages[0].facts;
  const page = (role) => byRole[role]?.facts;
  const textOf = (role) => page(role)?.text || "";
  const allText = pages.map((p) => p.facts.text).join("\n");
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);
  const share = (text, patterns) => patterns.filter((re) => re.test(text));

  add("name", "Business name shown", /rocksteady campus/i.test(home.text) ? 1 : 0);
  const h1 = home.headings.filter((h) => h.tag === "h1").map((h) => norm(h.text));
  add("hero-headline", "Hero h1 is the given headline", h1.some((h) => h.includes(norm(HEADLINE))) ? 1 : 0, `h1: ${h1.join(" | ").slice(0, 120)}`);
  const clickTexts = home.clickables.filter((c) => c.visible).map((c) => norm(c.text));
  const ctas = ["Order Now", "Explore Our Menu"].filter((c) => clickTexts.some((t) => t.includes(norm(c))));
  add("hero-ctas", "ORDER NOW and EXPLORE OUR MENU buttons", fraction(ctas.length, 2), `found: ${ctas.join(", ")}`);
  fromAct("hero-slider", "Hero uses the five attached banner images", "heroImages");
  fromAct("logo", "Attached logo in the header and footer", "logo");

  const roles = Object.keys(ROLES);
  add("pages", "About, Menu, Order, Gallery, Reviews, Login and Contact pages", fraction(roles.filter((r) => byRole[r]).length, roles.length),
    roles.map((r) => `${r} ${byRole[r]?.path || "missing"}`).join(", "));
  const homeSections = share(home.text, [
    new RegExp(CATEGORIES.slice(0, 5).join("|"), "i"), /best[- ]?sell|favourite|popular/i, /promo|special|deal|offer/i, /why/i, /review|testimonial/i, /makapane/i,
  ]);
  add("home-sections", "Home: categories, favourites, deals, why us, testimonials, location", fraction(homeSections.length, 6), `${homeSections.length}/6`);
  const about = share(textOf("about"), [/our story/i, /passion/i, /quality/i, /fresh/i, /generous|affordable/i, /community|rockville/i]);
  add("about-sections", "About: story, passion, quality, fresh, generous portions, community", fraction(about.length, 6), `${about.length}/6 on ${byRole.about?.path || "no about page"}`);

  const menuFlat = squash(textOf("menu"));
  const categories = CATEGORIES.filter((c) => menuFlat.includes(squash(c)));
  add("menu-categories", "Menu has all eight categories", fraction(categories.length, CATEGORIES.length), `missing: ${CATEGORIES.filter((c) => !categories.includes(c)).join(", ")}`);
  fromAct("menu-counts", "10 Kotas, 4 Dagwoods, 3 Burgers, 5 Rolls, 3 Sandwiches, 25 Chips & Sides", "menuCounts");
  fromAct("menu-filter", "Category filters change the menu", "menuFilter");
  fromAct("menu-search", "Menu search narrows the items", "menuSearch");
  const menuText = textOf("menu");
  const prices = (menuText.match(PRICE_RE) || []).length;
  const details = [prices >= 20, /add-?ons?|extras?|customi[sz]/i.test(menuText), /available|sold out|in stock|unavailable/i.test(menuText)];
  add("menu-details", "Items show ZAR prices, add-ons or customisation, and availability", fraction(details.filter(Boolean).length, 3), `prices ${prices}, extras ${details[1]}, availability ${details[2]}`);

  fromAct("cart-add", "Adding a meal updates the cart count", "cartAdd");
  fromAct("cart-quantity", "Quantity can be increased and the total updates", "cartQuantity");
  fromAct("checkout-fields", "Checkout: name, mobile, address, instructions, collection/delivery, cash, delivery fee", "checkoutFields");
  fromAct("payment-honest", "Online payment is not presented as working", "paymentHonest");
  fromAct("order-placed", "Placing an order shows an order number", "orderPlaced");
  fromAct("order-progress", "The order shows its progress", "orderProgress");

  fromAct("gallery-lightbox", "Clicking a gallery image opens a lightbox", "lightbox");
  const reviews = textOf("reviews");
  const reviewFacts = [/\b[0-5][.,]\d\b|out of 5|\/\s?5\b/i.test(reviews), /\b(20\d\d|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\b/i.test(reviews),
    (page("reviews")?.fields || []).some((f) => f.tag === "textarea") || !!act.reviewSubmit?.form];
  add("reviews-page", "Reviews: overall rating, dated reviews, submission form", fraction(reviewFacts.filter(Boolean).length, 3), `rating ${reviewFacts[0]}, dates ${reviewFacts[1]}, form ${reviewFacts[2]}`);
  fromAct("review-submit", "Submitting a review is acknowledged", "reviewSubmit");

  const login = textOf("login");
  const loginFacts = [/customer/i.test(login) && /admin/i.test(login), /forgot|reset/i.test(login), /register|create (an )?account|sign up/i.test(login)];
  add("login-portal", "Login: customer and admin access, password recovery, registration", fraction(loginFacts.filter(Boolean).length, 3), `two roles ${loginFacts[0]}, recovery ${loginFacts[1]}, register ${loginFacts[2]}`);
  fromAct("admin-dashboard", "Admin login opens a dashboard covering orders, menu, reviews, content", "admin");
  fromAct("cms-edit", "Editing the hero headline in the admin changes the home page", "cms");

  const contact = page("contact");
  const contactText = contact?.text || "";
  const contactFacts = [
    ["1563 Makapane Street", "Rockville", "Soweto", "1818"].every((s) => contactText.includes(s)),
    digits(contactText).includes(PHONE),
    /11[:h]00\s*(–|-|—|to)\s*20[:h]00/i.test(contactText),
    /sunday[^\n]{0,20}closed/i.test(contactText),
  ];
  add("contact-details", "Contact page: address, phone, Mon-Sat 11:00-20:00, Sunday closed", fraction(contactFacts.filter(Boolean).length, 4), contactFacts.join(", "));
  const hrefs = pages.flatMap((p) => p.facts.clickables.map((c) => c.href));
  const mapRe = /google\.[a-z.]+\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps|openstreetmap|maps\.apple/;
  add("map", "Map of the restaurant on the contact page", (contact?.iframes || []).some((s) => mapRe.test(s)) ? 1 : (contact?.clickables || []).some((c) => mapRe.test(c.href)) ? 0.5 : 0);
  add("directions", "Get Directions button", (contact?.clickables || []).some((c) => /direction/i.test(c.text) && /maps|goo\.gl/.test(c.href)) ? 1 : 0);
  add("click-to-call", "tel: link to the restaurant", hrefs.some((h) => h.startsWith("tel:") && digits(h).includes(PHONE)) ? 1 : 0);
  add("whatsapp", "WhatsApp contact link", hrefs.some((h) => /wa\.me|whatsapp\.com/.test(h) && digits(h).includes(WHATSAPP)) ? 1 : 0);
  add("contact-form", "Contact enquiry form", (contact?.fields || []).some((f) => f.tag === "textarea") ? 1 : 0);
  const socialRe = /instagram|facebook|fb\.com|tiktok|twitter\.com|x\.com\/|youtube/i;
  add("social-links", "Social media links", hrefs.some((h) => socialRe.test(h)) ? 1 : 0);
  fromAct("location-assist", "Checkout offers to use the customer's location", "locationAssist");

  const headerTexts = home.clickables.filter((c) => c.inHeader && c.visible).map((c) => norm(c.text));
  const navFound = ["home", "menu", "about", "gallery", "reviews", "contact", "order"].filter((n) => headerTexts.some((t) => t.includes(n)));
  add("nav", "Header links to every page plus Order Now", fraction(navFound.length, 7), `found: ${navFound.join(", ")}`);
  fromAct("mobile-menu", "Hamburger menu on mobile", "mobileMenu");
  add("palette", "Uses the brand red #F1001F", home.colors.some((c) => hexDistance(c, "#f1001f") <= 8) ? 1 : 0);
  add("seo-meta", "Title names Rocksteady Campus and a meta description exists", (/rocksteady/i.test(home.title) ? 0.5 : 0) + (home.metaDescription.trim() ? 0.5 : 0), home.title);
  return items;
}

/** In-page: every image the page references (img, srcset, picture sources, CSS backgrounds), loaded or not. */
function imageRefs() {
  const refs = new Set();
  const srcset = (s) => (s || "").split(",").map((x) => x.trim().split(" ")[0]).filter(Boolean);
  for (const img of document.images) [img.currentSrc, img.src, ...srcset(img.srcset)].forEach((r) => r && refs.add(r));
  for (const s of document.querySelectorAll("source")) srcset(s.srcset).forEach((r) => refs.add(r));
  for (const el of document.querySelectorAll("*")) {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== "none") for (const m of bg.matchAll(/url\(["']?([^"')]+)/g)) refs.add(m[1]);
  }
  return [...refs];
}

/** In-page: whether the header and the footer each show the attached logo (by file name, or an image whose alt names the brand). */
function logoPlaces() {
  const isLogo = (img) => /rocksteady-logo/i.test(img.currentSrc || img.src) || /rocksteady/i.test(img.alt || "");
  const shown = (root) => !!root && [...root.querySelectorAll("img")].some((i) => isLogo(i) && i.getBoundingClientRect().width > 0);
  return { header: shown(document.querySelector("header")) || shown(document.querySelector("nav")), footer: shown(document.querySelector("footer")) };
}

/** In-page: visible add-to-cart controls outside the header and nav. */
function countAdds(source) {
  const re = new RegExp(source, "i");
  return [...document.querySelectorAll("button,a,[role=button]")].filter((el) => {
    const r = el.getBoundingClientRect();
    const label = (el.innerText || el.getAttribute("aria-label") || "").trim();
    return r.width > 0 && r.height > 0 && re.test(label) && !el.closest("header,nav") && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  }).length;
}

/** In-page: add-to-cart controls under a category heading, for menus that list every category as a section instead of filtering. */
function countInSection([category, others, source]) {
  const re = new RegExp(source, "i");
  const key = (s) => (s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z]+/g, "");
  const isHeading = (el, name) => /^H[1-4]$/.test(el.tagName) && key(el.innerText).startsWith(key(name));
  const heading = [...document.querySelectorAll("h1,h2,h3,h4")].find((h) => isHeading(h, category));
  if (!heading) return null;
  let box = heading.parentElement;
  const adds = (root) => [...root.querySelectorAll("button,a,[role=button]")].filter((b) => re.test((b.innerText || b.getAttribute("aria-label") || "").trim()));
  while (box && box !== document.body && adds(box).length === 0) box = box.parentElement;
  if (!box || box === document.body) return null;
  const otherHeading = [...box.querySelectorAll("h1,h2,h3,h4")].some((h) => others.some((o) => isHeading(h, o)));
  return otherHeading ? null : adds(box).length;
}

/** In-page: marks the first visible field matching each [kind, regex source] with data-sbf, and lists the kinds found. */
function markFields(specs) {
  const describe = (f) =>
    [f.type, f.name, f.id, f.placeholder, f.getAttribute("aria-label"), f.labels?.[0]?.innerText, f.closest("label")?.innerText].join(" ").toLowerCase();
  const fields = [...document.querySelectorAll("input,textarea,select")].filter(
    (f) => !["hidden", "submit", "button", "checkbox", "radio"].includes(f.type) && f.getBoundingClientRect().width > 0,
  );
  const found = [];
  for (const [kind, source] of specs) {
    const f = fields.find((x) => !x.hasAttribute("data-sbf") && new RegExp(source).test(describe(x)));
    if (f) f.setAttribute("data-sbf", kind), found.push(kind);
  }
  return found;
}

/** In-page: numbers shown on the header's cart control (a link or button that names a cart, basket, bag or order). */
function cartCount() {
  const els = [...document.querySelectorAll("header a, header button, nav a, nav button")].filter((el) =>
    /cart|basket|bag|order/i.test([el.getAttribute("aria-label"), el.getAttribute("href"), el.innerText, el.className].join(" ")),
  );
  return els.map((el) => Number((el.innerText.match(/\d+/) || ["0"])[0])).reduce((a, b) => Math.max(a, b), 0);
}

async function clickText(page, re, scope = "body") {
  const target = page.locator(`${scope} :is(button,a,[role=button],[role=tab],label):visible`).filter({ hasText: re }).first();
  if (!(await target.count())) return false;
  await target.click({ timeout: 5000 });
  await page.waitForTimeout(900);
  return true;
}

async function fillMarked(page, values) {
  const filled = [];
  for (const [kind, value] of Object.entries(values)) {
    const f = page.locator(`[data-sbf="${kind}"]`);
    if (!(await f.count())) continue;
    try {
      if ((await f.evaluate((el) => el.tagName)) === "SELECT") await f.selectOption({ index: 1 }, { timeout: 3000 });
      else await f.fill(value, { timeout: 3000 });
      filled.push(kind);
    } catch {
      // A field that refuses input stays unfilled; the checks below report what happened.
    }
  }
  return filled;
}

async function addFirstItem(page) {
  const add = page.locator(":is(main, body) :is(button,a,[role=button]):visible").filter({ hasText: ADD_RE }).first();
  if (!(await add.count())) return false;
  await add.scrollIntoViewIfNeeded();
  await add.click({ timeout: 5000 });
  await page.waitForTimeout(900);
  // Meals with customisation open a dialog first; confirm it with its add button. A cart drawer that opens on add is left alone.
  if ((await openDialog(page)) && !(await cartOpen(page))) {
    const confirm = (await openDialog(page)).locator("button:visible").filter({ hasText: /add to (cart|bag|order|basket)|^\s*add\b|confirm|done/i }).last();
    if (await confirm.count()) await confirm.click({ timeout: 5000 });
    await page.waitForTimeout(900);
  }
  return true;
}

async function openDialog(page) {
  const dialog = page.locator("[role=dialog]:visible, dialog[open], [aria-modal=true]:visible").last();
  return (await dialog.count()) ? dialog : null;
}

/** The cart is showing, as a drawer or dialog, when an open dialog mentions checkout or a subtotal. */
async function cartOpen(page) {
  const dialog = await openDialog(page);
  return !!dialog && /checkout|check out|subtotal/i.test(await dialog.innerText());
}

export async function interactDesktop(context, url, handoffs, pages) {
  const byRole = assignPages(pages, ROLES);
  const out = {};
  const missing = (role) => ({ pass: false, detail: `no ${role} page found` });

  const home = await freshPage(context, url);
  out.heroImages = await attempt(async () => {
    const refs = new Set();
    for (let i = 0; i < 3; i++) {
      (await home.evaluate(imageRefs)).forEach((r) => refs.add(r));
      await home.waitForTimeout(3500);
    }
    const found = HEROES.filter((h) => [...refs].some((r) => r.includes(h)));
    return { score: found.length / HEROES.length, detail: `found: ${found.join(", ") || "none"}` };
  });
  out.logo = await attempt(async () => {
    const at = await home.evaluate(logoPlaces);
    return { score: (at.header ? 0.5 : 0) + (at.footer ? 0.5 : 0), detail: `header ${at.header}, footer ${at.footer}` };
  });
  await home.close();

  const menuPage = byRole.menu;
  if (!menuPage) Object.assign(out, { menuCounts: missing("menu"), menuFilter: missing("menu"), menuSearch: missing("menu") });
  else {
    const menu = await freshPage(context, menuPage.url);
    const total = await menu.evaluate(countAdds, ADD_RE.source);
    const counts = {};
    let filtered = false;
    out.menuCounts = await attempt(async () => {
      for (const category of Object.keys(CATEGORY_COUNTS)) {
        // \s also covers the non-breaking spaces some menus put around "&"; a count badge can follow the label with no space ("Sides25").
        const words = category.split(" ").map((w) => (w === "&" ? "(&|and)" : w)).join("\\s+");
        const filter = menu.locator(":is(button,[role=tab],a):visible").filter({ hasText: new RegExp(`^\\s*${words}(?![a-z])`, "i") }).first();
        let n = null;
        if (await filter.count()) {
          await filter.click({ timeout: 5000 });
          await menu.waitForTimeout(900);
          n = await menu.evaluate(countAdds, ADD_RE.source);
          if (n !== total) filtered = true;
          else n = null;
        }
        if (n === null) n = await menu.evaluate(countInSection, [category, CATEGORIES.filter((c) => c !== category), ADD_RE.source]);
        counts[category] = n;
      }
      const right = Object.entries(CATEGORY_COUNTS).filter(([c, want]) => counts[c] === want).length;
      return { score: right / Object.keys(CATEGORY_COUNTS).length, detail: Object.entries(counts).map(([c, n]) => `${c} ${n ?? "?"}/${CATEGORY_COUNTS[c]}`).join(", ") };
    });
    out.menuFilter = { pass: filtered, detail: filtered ? `a category filter narrowed ${total} items` : `no category filter changed the ${total} items` };
    out.menuSearch = await attempt(async () => {
      const page = await freshPage(context, menuPage.url);
      const box = page.locator("input[type=search]:visible, input[placeholder*='search' i]:visible, input[aria-label*='search' i]:visible").first();
      if (!(await box.count())) return (await page.close(), { pass: false, detail: "no search box on the menu page" });
      const before = await page.evaluate(countAdds, ADD_RE.source);
      await box.fill("dagwood");
      await page.waitForTimeout(1000);
      const after = await page.evaluate(countAdds, ADD_RE.source);
      await page.close();
      return { pass: after > 0 && after < before, detail: `"dagwood": ${before} -> ${after} items` };
    });
    await menu.close();
  }

  // One page carries the order from the menu through checkout, since carts often live only in memory.
  if (!menuPage) Object.assign(out, { cartAdd: missing("menu"), cartQuantity: missing("menu"), checkoutFields: missing("menu"), orderPlaced: missing("menu") });
  else {
    const page = await freshPage(context, menuPage.url);
    out.cartAdd = await attempt(async () => {
      const before = await page.evaluate(cartCount);
      if (!(await addFirstItem(page))) return { pass: false, detail: "no add-to-cart button on the menu page" };
      const after = await page.evaluate(cartCount);
      return { pass: after > before, detail: `header cart count ${before} -> ${after}` };
    });
    out.cartQuantity = await attempt(async () => {
      const icon = page.locator(":is(header,nav) :is(a,button):visible").filter({ has: page.locator("[aria-label*='cart' i], svg") }).filter({ hasText: /^\s*\d*\s*$/ });
      const labelled = page
        .locator(["cart", "basket", "bag"].map((w) => `:is(header,nav) :is(a,button)[aria-label*='${w}' i]:visible`).concat(":is(header,nav) a[href*='cart']:visible").join(", "))
        .first();
      let opened = await cartOpen(page);
      if (!opened) opened = (await clickText(page, /cart|basket|view order|your order/i, "header")) || (await clickText(page, /view cart|checkout|view order/i));
      if (!opened && (await labelled.count())) opened = !!(await labelled.click({ timeout: 5000 }).then(() => true).catch(() => false));
      if (!opened && (await icon.count()) === 1) opened = !!(await icon.click({ timeout: 5000 }).then(() => true).catch(() => false));
      await page.waitForTimeout(900);
      if (!opened && byRole.order) {
        await page.goto(byRole.order.url, { waitUntil: "load" });
        await page.waitForTimeout(1500);
      }
      const scope = (await openDialog(page)) || page.locator("body");
      const totals = async () => (await scope.innerText()).match(/\bR\s?\d+(?:[.,]\d{2})?\b/g)?.join(" ") || "";
      const before = await totals();
      const plus = scope.locator("button:visible").filter({ hasText: /^\s*\+\s*$/ }).or(scope.locator("button[aria-label*='increase' i]:visible, button[aria-label*='plus' i]:visible, button[aria-label*='add one' i]:visible")).first();
      if (!(await plus.count())) return { pass: false, detail: "no + quantity button in the cart" };
      await plus.click({ timeout: 5000 });
      await page.waitForTimeout(900);
      const after = await totals();
      return { pass: after !== before, detail: `totals ${before.slice(0, 60)} -> ${after.slice(0, 60)}` };
    });
    let orderText = "";
    out.checkoutFields = await attempt(async () => {
      await clickText(page, /^\s*(checkout|check out|proceed|continue to checkout|go to checkout)\b/i);
      await page.waitForTimeout(800);
      const kinds = await page.evaluate(markFields, CHECKOUT_FIELDS);
      orderText = await page.evaluate(() => document.body.innerText);
      const fee = /delivery (fee|cost|charge)|delivery[^\n]{0,24}\bR\s?\d+/i.test(orderText);
      const facts = { fields: kinds.length / CHECKOUT_FIELDS.length, collection: /collect/i.test(orderText) && /deliver/i.test(orderText), cash: /cash/i.test(orderText), fee };
      const score = (facts.fields + facts.collection + facts.cash + facts.fee) / 4;
      return { score, detail: `fields ${kinds.join(",") || "none"}; collection/delivery ${facts.collection}; cash ${facts.cash}; delivery fee ${facts.fee}` };
    });
    out.paymentHonest = await attempt(async () => {
      const online = /card|online payment|payfast|yoco|ozow|snapscan|eft/i.test(orderText);
      const marked = /coming soon|not (yet )?(available|enabled|configured|connected)|unavailable|disabled/i.test(orderText);
      return { pass: !online || marked, detail: `online payment mentioned ${online}, marked unavailable ${marked}` };
    });
    out.locationAssist = { pass: /use (my |your )?(current )?location|locate me|detect (my )?location|share (my |your )?location/i.test(orderText), detail: orderText ? "" : "checkout not reached" };
    out.orderPlaced = await attempt(async () => {
      await clickText(page, /^\s*(collect|collection|pick ?up)/i);
      await clickText(page, /cash/i);
      await page.evaluate(markFields, CHECKOUT_FIELDS);
      const filled = await fillMarked(page, CHECKOUT);
      const before = await page.evaluate(() => document.body.innerText);
      if (!(await clickText(page, /place\b[^\n]{0,20}\border\b|confirm (my )?order|submit (my )?order|complete (my )?order|send (my )?order/i)))
        return { pass: false, detail: `filled ${filled.join(",") || "nothing"}; no place-order button` };
      await page.waitForTimeout(1500);
      const fresh = newLines(before, await page.evaluate(() => document.body.innerText));
      // An order number either follows a label ("Order #1042", "Order no. RC-1042") or stands on its own line ("RC-2792F38F", "RSC-2611-2727");
      // a standalone price such as "R100" is not one.
      const labelled = /order[^\n]{0,24}(#|no\.?|number|id|ref)[^\n]{0,6}[A-Z]{0,5}-?\d{3,}|#\s?[A-Z]{0,5}-?\d{3,}/i;
      const standalone = /^#?\s?[A-Z]{1,6}(?:[-\s]?[A-Z0-9]{2,12}){1,3}$/;
      const number = fresh.find((l) => labelled.test(l) || (standalone.test(l) && /\d/.test(l) && !/^R\s?\d+(?:[.,]\d{2})?$/.test(l)));
      const progress = fresh.find((l) => /received|accepted|preparing|being prepared|ready|completed|pending|on its way/i.test(l));
      out.orderProgress = { pass: !!progress, detail: progress || "no order status after placing" };
      return { pass: !!number, detail: `filled ${filled.join(",")}; ${number || "no order number"}` };
    });
    out.orderProgress ??= { pass: false, detail: "order not placed" };
    await page.close();
  }

  if (!byRole.gallery) out.lightbox = missing("gallery");
  else {
    const page = await freshPage(context, byRole.gallery.url);
    out.lightbox = await attempt(async () => {
      const img = page.locator("main img:visible").first();
      if (!(await img.count())) return { pass: false, detail: "no visible gallery image" };
      const before = await page.evaluate(overlayOpen);
      await img.scrollIntoViewIfNeeded();
      await img.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(1000);
      const after = await page.evaluate(overlayOpen);
      return { pass: !before && after, detail: `overlay before ${before}, after ${after}` };
    });
    await page.close();
  }

  if (!byRole.reviews) out.reviewSubmit = missing("reviews");
  else {
    const page = await freshPage(context, byRole.reviews.url);
    out.reviewSubmit = await attempt(async () => {
      const specs = [["name", "\\bname\\b"], ["comment", "review|comment|message|experience|textarea"]];
      let kinds = await page.evaluate(markFields, specs);
      // Many review forms sit behind a button that opens them.
      if (!kinds.includes("comment") && (await clickText(page, /share your experience|write a review|leave a review|add a review|review us|rate us/i))) kinds = await page.evaluate(markFields, specs);
      if (!kinds.includes("comment")) return { pass: false, form: false, detail: "no review form" };
      // A forced click on a star behind a modal's backdrop would land on the backdrop and close the form, so look inside the open dialog.
      const scope = (await openDialog(page)) || page.locator("body");
      const star = scope.locator("button[aria-label*='5 star' i]:visible, button[aria-label*='five' i]:visible, label[for*='5']:visible, input[type=radio][value='5']").first();
      if (await star.count()) await star.click({ force: true, timeout: 3000 }).catch(() => {});
      await fillMarked(page, { name: "Lerato Dlamini", comment: "Generous kota and friendly service. Will be back." });
      const before = await page.evaluate(() => document.body.innerText);
      const submitRe = /submit|post|send|leave (a )?review|add review|share/i;
      const submitted = (await clickText(page, submitRe, "[role=dialog]")) || (await clickText(page, submitRe, "form"));
      if (!submitted) return { pass: false, form: true, detail: "no submit button in the review form" };
      await page.waitForTimeout(1200);
      const message = newLines(before, await page.evaluate(() => document.body.innerText)).find((l) => /thank|pending|moderat|submitted|received|approved/i.test(l));
      return { pass: !!message, form: true, detail: message || "no acknowledgement" };
    });
    await page.close();
  }

  // Admin last: the CMS check edits stored content, and nothing after it should see that edit.
  const adminPage = pages.find((p) => /admin|dashboard|designer/.test(p.path)) || byRole.login;
  if (!adminPage) Object.assign(out, { admin: missing("login"), cms: missing("login") });
  else {
    const page = await freshPage(context, adminPage.url);
    out.admin = await attempt(async () => {
      const areas = async () => {
        const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
        return { text, n: ADMIN_AREAS.filter((re) => re.test(text)).length };
      };
      const before = await areas();
      await clickText(page, /^\s*(admin|administrator|staff|designer)\b/i);
      const email = page.locator("input[type=email]:visible, input[name*='email' i]:visible, input[placeholder*='email' i]:visible").first();
      const password = page.locator("input[type=password]:visible").first();
      if ((await email.count()) && (await password.count())) {
        // The instruction asks for the demo administrator's email and password to be shown on the login screen.
        const shown = await page.evaluate(() => document.body.innerText);
        const emails = shown.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) || [];
        const shownEmail = emails.find((e) => /admin/i.test(e));
        const afterEmail = shownEmail ? shown.slice(shown.indexOf(shownEmail)) : shown;
        const shownPassword = afterEmail.match(/password\s*:\s*(\S{6,})/i)?.[1];
        await email.fill(shownEmail || ADMIN.email);
        await password.fill(shownPassword || ADMIN.password);
        await password.press("Enter");
        await page.waitForTimeout(1500);
      }
      await clickText(page, /open (the )?(designer|admin|dashboard)|go to dashboard|enter dashboard/i);
      await page.waitForTimeout(800);
      const after = await areas();
      // A login page can name a few management areas too, so the dashboard must either say so or show clearly more of them.
      const inside = !(await page.locator("input[type=password]:visible").count()) && (/dashboard|log ?out|sign ?out|overview|workspace/.test(after.text) || after.n >= before.n + 2);
      return { score: inside ? Math.min(1, after.n / 6) : 0, detail: `${inside ? "dashboard" : "still at login"}; ${after.n}/${ADMIN_AREAS.length} management areas` };
    });
    out.cms = await attempt(async () => {
      if (!out.admin.score) return { pass: false, detail: "admin dashboard not reached" };
      const findHeadline = () =>
        page.evaluate((needle) => {
          const editable = [...document.querySelectorAll("input,textarea,[contenteditable=true]")];
          const el = editable.find((e) => (e.value ?? e.innerText ?? "").toLowerCase().includes(needle) && e.getBoundingClientRect().width > 0);
          if (el) el.setAttribute("data-sbf", "headline");
          return !!el;
        }, "big flavour");
      let found = await findHeadline();
      for (const re of [/content|pages?|website|homepage|home/i, /hero|banner/i, /text|cms|edit/i]) {
        if (found) break;
        const tabs = page.locator("main :is(button,a,[role=tab]):visible, aside :is(button,a,[role=tab]):visible, nav :is(button,a,[role=tab]):visible").filter({ hasText: re });
        for (let i = 0; i < Math.min(3, await tabs.count()) && !found; i++) {
          await tabs.nth(i).click({ timeout: 3000 }).catch(() => {});
          await page.waitForTimeout(700);
          found = await findHeadline();
        }
      }
      if (!found) return { pass: false, detail: "no editable field holding the hero headline" };
      await page.locator('[data-sbf="headline"]').fill(CMS_MARK);
      await page.locator('[data-sbf="headline"]').press("Tab");
      await clickText(page, /^\s*(save|update|publish|apply)\b/i);
      await page.waitForTimeout(800);
      await page.goto(url, { waitUntil: "load" });
      await page.waitForTimeout(2000);
      const shown = (await page.evaluate(() => document.body.innerText)).includes(CMS_MARK);
      return { score: shown ? 1 : 0.5, detail: shown ? "edited headline shows on the home page" : "headline field edited, but the home page did not change" };
    });
    await page.close();
  }
  return out;
}

export async function interactMobile(context, url) {
  return { mobileMenu: await checkMobileMenu(context, url, NAV_ITEMS) };
}
