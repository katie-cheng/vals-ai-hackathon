// Task-specific part of the verifier: the Suds Squad redesign brief's checklist and the interactions it asks for.
// grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of tasks/verifier/; only this file is per task.
// The "existing website" is environment/app/existing-site/index.html: the S13 site's facts and quote form with its copy and design stripped,
// so "preserve all existing business information and working functionality" is checked against that page.
import { attempt, checkMobileMenu, digits, freshPage, newLines, norm, squash } from "./lib.mjs";

// The business's quote endpoint, kept by the brief; the grader answers it as the deployed endpoint does.
export const HANDOFF_URLS = /\/api\/quotes(\?|$)/;
// A request that does not carry the name and email the grader typed is refused, so an empty or unwired form cannot pass.
export const HANDOFF_REPLY = (request) => {
  if (request.method() !== "POST") return null;
  const raw = request.postData() || "";
  let body = raw;
  try {
    body += "\n" + decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {}
  const ok = body.includes(QUOTE.name) && body.includes(QUOTE.email);
  const reply = ok ? { ok: true, reference: "SS-GRADER-0001" } : { error: "Tell us your name and email." };
  return { status: ok ? 201 : 400, contentType: "application/json", body: JSON.stringify(reply) };
};
export const SLOP_EXEMPT = { pulsing_dots: "brief: subtle moving particles, floating bubbles and water droplets" };

const PHONE = "8605786207";
const EMAIL = "kellen0734@gmail.com";
const SERVICES = ["Pressure Washing", "Exterior Window Cleaning", "Interior Window Cleaning", "Gutter Cleaning", "House Washing", "Driveway & Patio"];
const COMPARISONS = ["Siding", "Driveway", "Exterior Windows", "Interior Windows", "Gutters", "Patio"];
const PROCESS = [/free estimate|request/i, /schedul/i, /clean/i, /review|finished|beautiful/i];
const TRUST = ["Professional service", "Attention to detail", "Reliable scheduling", "Quality results", "Residential", "Interior and exterior"];
const PRICES = [["Small windows", "$5"], ["Large windows", "$7"], ["Large glass doors", "$20"], ["Screen cleaning", "$1"], ["Interior mirrors", "$5"]];
const TOWNS = ["Hartford", "Southington", "Cheshire", "Bristol", "Meriden", "Waterbury", "New Haven", "Middletown"];
const NAV_ITEMS = ["services", "results", "process", "why us", "pricing", "areas", "faq", "quote", "contact", "get a quote", "free quote"];
// The brief forbids inventing these; the original site has none.
const INVENTED = [/\bcertified\b/i, /\blicensed\b/i, /\binsured\b|\binsurance\b/i, /\b\d+\+?\s*years?\b/i, /testimonial/i, /★|☆|\b[1-5](\.\d)?\s*(\/\s*5|stars?|out of 5)\b/i];
const QUOTE = { name: "Test Person", phone: "860-555-0123", email: "test@example.com", address: "12 Main Street", town: "Hartford", zip: "06103" };

const fraction = (found, total) => found / total;

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const d = views.desktop.facts;
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  // Carousels show one service or comparison at a time; the desktop interaction steps through them and records their text.
  const allText = [d.text, act.carouselText?.text || ""].join("\n");
  const flat = squash(allText);
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);
  const hrefs = d.clickables.map((c) => c.href || "");

  add("name", "Business name Suds Squad shown", /suds squad/i.test(d.text) ? 1 : 0);
  add("phone", "Phone 860-578-6207 shown and callable", (digits(d.text).includes(PHONE) ? 0.5 : 0) + (hrefs.some((h) => h.startsWith("tel:") && digits(h).endsWith(PHONE)) ? 0.5 : 0));
  add("email", "Email shown and linked", (d.text.toLowerCase().includes(EMAIL) ? 0.5 : 0) + (hrefs.some((h) => h.toLowerCase() === `mailto:${EMAIL}`) ? 0.5 : 0));
  const services = SERVICES.filter((s) => flat.includes(squash(s)));
  add("services", "All six services", fraction(services.length, SERVICES.length), `missing: ${SERVICES.filter((s) => !services.includes(s)).join(", ")}`);
  const comparisons = COMPARISONS.filter((s) => flat.includes(squash(s)));
  add("before-after-subjects", "Before/after for siding, driveway, exterior and interior windows, gutters, patio", fraction(comparisons.length, COMPARISONS.length), `missing: ${COMPARISONS.filter((s) => !comparisons.includes(s)).join(", ")}`);
  fromAct("before-after-slider", "Before/after comparison is interactive (keyboard moves the divider)", "slider");
  const steps = PROCESS.filter((re) => re.test(allText));
  add("process", "Four-step process: estimate, schedule, clean, result", fraction(steps.length, 4), `${steps.length}/4`);
  const trust = TRUST.filter((s) => flat.includes(squash(s)));
  add("trust", "Trust points from the brief", fraction(trust.length, TRUST.length), `missing: ${TRUST.filter((s) => !trust.includes(s)).join(", ")}`);
  const prices = PRICES.filter(([label, price]) => flat.includes(squash(label)) && allText.includes(price));
  add("prices", "Existing window prices kept", fraction(prices.length, PRICES.length), `missing: ${PRICES.filter((p) => !prices.includes(p)).map((p) => p[0]).join(", ")}`);
  const towns = TOWNS.filter((t) => allText.includes(t));
  add("areas", "Connecticut service area and towns kept", (/connecticut/i.test(allText) ? 0.5 : 0) + 0.5 * fraction(towns.length, TOWNS.length), `towns ${towns.length}/${TOWNS.length}`);
  add("faq", "FAQ kept", /faq|frequently asked|questions/i.test(d.text) ? 1 : 0);
  const invented = INVENTED.filter((re) => re.test(allText)).map((re) => (allText.match(re) || [""])[0]);
  add("no-invented-claims", "No invented certifications, insurance, testimonials, ratings or years", invented.length ? 0 : 1, invented.join(", "));
  fromAct("quote-validation", "Empty quote request is blocked with field errors", "quoteValidation");
  fromAct("quote-submit", "A valid quote request is sent to /api/quotes and confirmed", "quoteSubmit");
  fromAct("motion", "The page moves: running animations or video", "motion");
  fromAct("reduced-motion", "Reduced-motion users see every section heading (within 1.2 s of scrolling to it)", "reducedMotion");
  fromAct("mobile-menu", "Animated mobile navigation", "mobileMenu");
  add("seo-meta", "Title names Suds Squad and a meta description exists", (/suds squad/i.test(d.title) ? 0.5 : 0) + (d.metaDescription.trim() ? 0.5 : 0), d.title);
  return items;
}

/** In-page: clicks every visible "next"-style control a few times and returns the text seen along the way. */
async function stepCarousels(page) {
  const seen = new Set();
  const grab = async () => (await page.evaluate(() => document.body.innerText)).split("\n").forEach((l) => l.trim() && seen.add(l.trim()));
  await grab();
  const next = page.locator("button[aria-label*='next' i]:visible, button[aria-label*='forward' i]:visible, [role=tab]:visible");
  const n = Math.min(await next.count(), 12);
  for (let i = 0; i < n; i++) {
    const control = next.nth(i);
    const isTab = (await control.getAttribute("role")) === "tab";
    for (let k = 0; k < (isTab ? 1 : 7); k++) {
      await control.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
      await control.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(450);
      await grab();
    }
  }
  return [...seen].join("\n");
}

function sliderValue() {
  const s = [...document.querySelectorAll("[role=slider], input[type=range]")].find((e) => e.getBoundingClientRect().width > 40);
  if (!s) return null;
  return Number(s.getAttribute("aria-valuenow") ?? s.value);
}

function quoteForm() {
  const forms = [...document.querySelectorAll("form")].filter((f) => f.querySelector("input[type=email], input[type=tel], input[name*=phone i]"));
  const f = forms.sort((a, b) => b.querySelectorAll("input,select,textarea").length - a.querySelectorAll("input,select,textarea").length)[0];
  if (!f) return null;
  f.setAttribute("data-sbq", "1");
  return f.querySelectorAll("input,select,textarea").length;
}

const invalidCount = () => document.querySelectorAll("[data-sbq] :invalid, [data-sbq] [aria-invalid=true]").length;

async function fillQuote(page) {
  const form = page.locator("[data-sbq]");
  for (const [k, v] of Object.entries(QUOTE)) {
    const typed = { email: "input[type=email]", phone: "input[type=tel]" }[k];
    const field = form.locator(`[name*='${k}' i]:visible, [id*='${k}' i]:visible${typed ? `, ${typed}:visible` : ""}`).first();
    if (await field.count()) await field.fill(v, { timeout: 3000 }).catch(() => {});
  }
  // Every checkbox group gets its first box ticked and every select its first real option.
  for (const box of await form.locator("input[type=checkbox]").all()) {
    if (!(await form.locator("input[type=checkbox]:checked").count())) await box.check({ force: true, timeout: 2000 }).catch(() => {});
  }
  for (const sel of await form.locator("select").all()) {
    const values = await sel.evaluate((s) => [...s.options].map((o) => o.value).filter(Boolean));
    if (values.length) await sel.selectOption(values[Math.min(1, values.length - 1)]).catch(() => {});
  }
  const radios = await form.locator("input[type=radio]").all();
  if (radios.length && !(await form.locator("input[type=radio]:checked").count())) await radios[0].check({ force: true }).catch(() => {});
}

export async function interactDesktop(context, url, handoffs) {
  const out = {};
  const page = await freshPage(context, url);
  out.motion = await attempt(async () => {
    const m = await page.evaluate(() => ({
      running: document.getAnimations().filter((a) => a.playState === "running").length,
      videos: [...document.querySelectorAll("video")].filter((v) => v.getBoundingClientRect().width > 100).length,
      canvases: [...document.querySelectorAll("canvas")].filter((c) => c.getBoundingClientRect().width > 100).length,
    }));
    return { pass: m.running + m.videos + m.canvases > 0, detail: `running animations ${m.running}, videos ${m.videos}, canvases ${m.canvases}` };
  });
  out.carouselText = await attempt(async () => ({ pass: true, text: await stepCarousels(page) }));
  out.slider = await attempt(async () => {
    const before = await page.evaluate(sliderValue);
    if (before === null) return { pass: false, detail: "no before/after slider ([role=slider] or range input)" };
    const s = page.locator("[role=slider]:visible, input[type=range]:visible").first();
    await s.scrollIntoViewIfNeeded();
    await s.focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(300);
    const after = await page.evaluate(sliderValue);
    return { pass: after !== before, detail: `value ${before} -> ${after}` };
  });
  await page.close();

  const quote = await freshPage(context, url);
  out.quoteValidation = await attempt(async () => {
    const fields = await quote.evaluate(quoteForm);
    if (!fields) return { pass: false, detail: "no quote form with an email or phone field" };
    const form = quote.locator("[data-sbq]");
    await form.scrollIntoViewIfNeeded();
    const before = await quote.evaluate(() => document.body.innerText);
    const sent = handoffs.length;
    await form.locator("button[type=submit], input[type=submit], button:not([type])").last().click({ timeout: 5000 });
    await quote.waitForTimeout(1000);
    const invalid = await quote.evaluate(invalidCount);
    const messages = newLines(before, await quote.evaluate(() => document.body.innerText));
    return { pass: handoffs.length === sent && (invalid > 0 || messages.length > 0), detail: `invalid fields ${invalid}, new messages ${messages.slice(0, 3).join(" | ")}` };
  });
  out.quoteSubmit = await attempt(async () => {
    if (!(await quote.locator("[data-sbq]").count())) return { pass: false, detail: "no quote form" };
    await fillQuote(quote);
    const before = await quote.evaluate(() => document.body.innerText);
    const sent = handoffs.length;
    await quote.locator("[data-sbq]").locator("button[type=submit], input[type=submit], button:not([type])").last().click({ timeout: 5000 });
    await quote.waitForTimeout(3000);
    const after = await quote.evaluate(() => document.body.innerText);
    const posted = handoffs.length > sent;
    const confirmed = after.includes("SS-GRADER-0001") || newLines(before, after).some((l) => /thank|received|request (is|was|has been)|we('ll| will) (be in touch|contact|call|follow)/i.test(l));
    const invalid = (await quote.locator("[data-sbq]").count()) ? await quote.evaluate(invalidCount) : 0;
    return { pass: posted && confirmed, score: (posted ? 0.5 : 0) + (confirmed ? 0.5 : 0), detail: `posted ${posted}, confirmed ${confirmed}, invalid fields left ${invalid}` };
  });
  await quote.close();

  out.reducedMotion = await attempt(async () => {
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(url, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(1500);
    const hidden = await page.evaluate(async () => {
      const out = [];
      for (const h of document.querySelectorAll("main h2, section h2")) {
        h.scrollIntoView({ block: "center" });
        await new Promise((r) => setTimeout(r, 1200));
        let el = h, op = 1;
        while (el) (op *= Number(getComputedStyle(el).opacity)), (el = el.parentElement);
        if (op < 0.5) out.push(h.innerText.slice(0, 40));
      }
      return out;
    });
    await page.close();
    return { pass: hidden.length === 0, detail: hidden.length ? `headings still hidden: ${hidden.join(" | ")}` : "all section headings visible" };
  });
  return out;
}

export async function interactMobile(context, url) {
  return { mobileMenu: await checkMobileMenu(context, url, NAV_ITEMS) };
}
