// Task-specific part of the verifier: the Kora brief ("copy all the animations, components and content of https://kora.framer.media/,
// with standalone pages") and the interactions it implies. grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of
// tasks/verifier/; only this file is per task. Copy is not matched word for word against the reference site: the checks cover
// its page structure, its detail pages, its motion and its contact form.
import { assignPages, attempt, checkMobileMenu, freshPage, newLines } from "./lib.mjs";

export const SLOP_EXEMPT = { pills: "brief: copy all the components of kora.framer.media, whose buttons are pills", big_rounding: "brief: copy all the components of kora.framer.media, whose cards are rounded" };

// Pages kora.framer.media has as standalone routes; services and pricing are sections there, so either a page or a home section counts.
const ROLES = {
  about: [/about/],
  work: [/cases?|work|projects|portfolio/, /case stud|our work|projects/],
  insights: [/insights?|blog|journal|articles|news/],
  contact: [/contact/],
  services: [/services?|what-we-do|solutions/],
  pricing: [/pricing|plans/],
};
const REQUIRED = ["about", "work", "insights", "contact"];
const NAV_ITEMS = ["home", "about", "services", "work", "cases", "case studies", "pricing", "insights", "blog", "contact"];

const fraction = (found, total) => found / total;

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const pages = views.desktop.pages;
  const byRole = assignPages(pages, ROLES);
  const home = pages[0].facts;
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);
  const textOf = (role) => byRole[role]?.facts?.text || "";

  add("name", "Kora brand shown", /\bkora\b/i.test(home.text) ? 1 : 0);
  add("pages", "Standalone About, Case studies, Insights and Contact pages", fraction(REQUIRED.filter((r) => byRole[r]).length, REQUIRED.length),
    Object.keys(ROLES).map((r) => `${r} ${byRole[r]?.path || "missing"}`).join(", "));
  const substantial = REQUIRED.filter((r) => textOf(r).length >= 600);
  add("pages-have-content", "Each standalone page has its own content (600+ characters)", fraction(substantial.length, REQUIRED.length), substantial.join(", "));
  const distinct = new Set(REQUIRED.map((r) => textOf(r).slice(0, 400)).filter(Boolean)).size;
  add("pages-distinct", "Standalone pages are not copies of one another", byRole.about ? fraction(distinct, REQUIRED.filter((r) => byRole[r]).length || 1) : 0);
  const homeSections = [/services?|what we do|how we help/i, /case|work|results|clients/i, /pricing|plans|engagement/i, /testimonial|said|review/i, /faq|questions/i, /insight|article|journal/i];
  const found = homeSections.filter((re) => re.test(home.text));
  add("home-sections", "Home covers services, case studies, pricing, testimonials, FAQ and insights", fraction(found.length, homeSections.length), `${found.length}/${homeSections.length}`);
  fromAct("case-study-detail", "A case study opens its own detail page", "caseDetail");
  fromAct("insight-detail", "An insight opens its own article page", "insightDetail");
  fromAct("deep-links", "Every page loads directly from its URL", "deepLinks");
  fromAct("reveal-motion", "Sections animate in as they scroll into view", "revealMotion");
  fromAct("faq-toggle", "FAQ items expand", "faq");
  const contact = byRole.contact?.facts;
  const fields = contact?.fields || [];
  add("contact-form", "Contact page has a form with email and message", (fields.some((f) => f.type === "email" || /email/i.test(`${f.name} ${f.id} ${f.label}`)) ? 0.5 : 0) + (fields.some((f) => f.tag === "textarea") ? 0.5 : 0));
  fromAct("contact-validation", "Empty contact form is blocked with a message", "contactValidation");
  const headerTexts = home.clickables.filter((c) => c.inHeader && c.visible).map((c) => (c.text || "").toLowerCase());
  const navFound = ["about", "work|case", "insight|blog", "contact|book|call|talk|get in touch"].filter((n) => headerTexts.some((t) => new RegExp(n).test(t)));
  add("nav", "Header links to the standalone pages", fraction(navFound.length, 4), `found: ${navFound.join(", ")}`);
  fromAct("mobile-menu", "Mobile menu", "mobileMenu");
  add("seo-meta", "Title names Kora and a meta description exists", (/kora/i.test(home.title) ? 0.5 : 0) + (home.metaDescription.trim() ? 0.5 : 0), home.title);
  return items;
}

/** Follows the first same-origin link one level below `listPath` and checks the detail page renders its own h1 or h2. */
async function openDetail(context, listUrl, listPath) {
  if (!listUrl) return { pass: false, detail: "no list page" };
  const page = await freshPage(context, listUrl);
  try {
    const base = listPath.replace(/\/$/, "");
    const href = await page.evaluate((base) => {
      const a = [...document.querySelectorAll("main a[href], a[href]")].find((a) => {
        const u = new URL(a.href, location.href);
        const key = u.hash.length > 2 && u.hash.startsWith("#/") ? u.pathname + u.hash : u.pathname;
        return u.origin === location.origin && key.startsWith(base + "/") && key.length > base.length + 1;
      });
      return a?.href || null;
    }, base);
    if (!href) return { pass: false, detail: `no link below ${base}/` };
    await page.goto(href, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({ path: location.hash.length > 2 && location.hash.startsWith("#/") ? location.pathname + location.hash : location.pathname, h: document.querySelector("h1,h2,h3,[role=heading]")?.innerText?.trim() || "", len: document.body.innerText.length }));
    return { pass: r.path !== listPath && !!r.h && r.len > 600, detail: `${r.path}: "${r.h.slice(0, 60)}", ${r.len} chars` };
  } finally {
    await page.close();
  }
}

export async function interactDesktop(context, url, handoffs, pages) {
  const byRole = assignPages(pages, ROLES);
  const out = {};
  out.caseDetail = await attempt(() => openDetail(context, byRole.work?.url, byRole.work?.path || ""));
  out.insightDetail = await attempt(() => openDetail(context, byRole.insights?.url, byRole.insights?.path || ""));
  out.deepLinks = await attempt(async () => {
    const bad = [];
    for (const p of pages.slice(1)) {
      const page = await context.newPage();
      const res = await page.goto(p.url, { waitUntil: "load", timeout: 60_000 }).catch(() => null);
      await page.waitForTimeout(800);
      const len = await page.evaluate(() => document.body.innerText.length).catch(() => 0);
      if (!res || !res.ok() || len < 200) bad.push(p.path);
      await page.close();
    }
    return { pass: bad.length === 0, score: pages.length > 1 ? 1 - bad.length / (pages.length - 1) : 0, detail: bad.length ? `broken: ${bad.join(", ")}` : `${pages.length - 1} pages` };
  });
  out.revealMotion = await attempt(async () => {
    const page = await freshPage(context, url);
    const changed = await page.evaluate(async () => {
      const style = (el) => { const s = getComputedStyle(el); return `${s.opacity}|${s.transform}|${s.clipPath}`; };
      const below = [...document.querySelectorAll("main *, section *")].filter((el) => el.getBoundingClientRect().top > innerHeight * 1.2 && el.children.length < 8).slice(0, 1500);
      const before = new Map(below.map((el) => [el, style(el)]));
      let moved = 0;
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.6) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 300));
      }
      await new Promise((r) => setTimeout(r, 1200));
      for (const [el, s] of before) if (style(el) !== s) moved++;
      return moved;
    });
    await page.close();
    return { pass: changed >= 5, detail: `${changed} elements changed opacity, transform or clip while scrolling into view` };
  });
  out.faq = await attempt(async () => {
    const candidates = [byRole.contact?.url, url].filter(Boolean);
    for (const u of candidates) {
      const page = await freshPage(context, u);
      const toggle = page.locator("[aria-expanded=false]:visible, summary:visible, button:visible").filter({ hasText: /\?\s*$/ }).first();
      if (await toggle.count()) {
        const before = await page.evaluate(() => document.body.innerText);
        await toggle.scrollIntoViewIfNeeded();
        await toggle.click({ timeout: 5000 });
        await page.waitForTimeout(900);
        const added = newLines(before, await page.evaluate(() => document.body.innerText));
        await page.close();
        return { pass: added.length > 0, detail: `${new URL(u).pathname}: ${added.length} new lines` };
      }
      await page.close();
    }
    return { pass: false, detail: "no collapsed FAQ question found" };
  });
  out.contactValidation = await attempt(async () => {
    if (!byRole.contact) return { pass: false, detail: "no contact page" };
    const page = await freshPage(context, byRole.contact.url);
    const form = page.locator("form:has(textarea)").first();
    if (!(await form.count())) return (await page.close(), { pass: false, detail: "no form with a message field" });
    await form.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => document.body.innerText);
    await form.locator("button[type=submit], input[type=submit], button:not([type])").last().click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    const invalid = await page.evaluate(() => document.querySelectorAll("form :invalid, form [aria-invalid=true]").length);
    const added = newLines(before, await page.evaluate(() => document.body.innerText));
    const claimsSent = added.some((l) => /thank|sent|received|success/i.test(l));
    await page.close();
    return { pass: (invalid > 0 || added.length > 0) && !claimsSent, detail: `invalid fields ${invalid}, new lines ${added.slice(0, 2).join(" | ")}` };
  });
  return out;
}

export async function interactMobile(context, url) {
  return { mobileMenu: await checkMobileMenu(context, url, NAV_ITEMS) };
}
