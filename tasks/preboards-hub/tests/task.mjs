// Task-specific part of the verifier: the Preboards Hub brief's checklist and the interactions it asks for.
// grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of tasks/verifier/; only this file is per task.
import { attempt, newLines } from "./lib.mjs";

// The brief asks for the companion's visualiser to animate; a small animated bar or orb in it is not a decorative pulsing dot.
export const SLOP_EXEMPT = { pulsing_dots: 'brief: "AI Voice Companion" widget featuring an animated sound wave or pulsing orb visualizer' };

const STATUSES = ["Not Started", "In Progress", "Revise", "Mastered"];
const DAY = 86_400_000;
const NEW_SUBJECT = "Astronomy";
const NEW_GOAL = "Revise trigonometry identities";
const SETTINGS_DAYS = 40;

/** Spies on speech and notifications before the app loads; the fake Notification grants permission when asked. */
function installSpies() {
  window.__sb = { spoken: [], notified: [], requested: 0 };
  try {
    const syn = window.speechSynthesis;
    if (syn) {
      const speak = syn.speak.bind(syn);
      syn.speak = (u) => {
        window.__sb.spoken.push(String((u && u.text) || ""));
        try {
          speak(u);
        } catch {
          // Headless Chromium may have no voice; the call itself is what is checked.
        }
      };
    }
  } catch {
    // No speech synthesis in this browser.
  }
  class FakeNotification {
    constructor(title, opts) {
      window.__sb.notified.push(`${title} ${(opts && opts.body) || ""}`);
    }
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  FakeNotification.permission = "default";
  FakeNotification.requestPermission = (cb) => {
    window.__sb.requested++;
    FakeNotification.permission = "granted";
    if (typeof cb === "function") cb("granted");
    return Promise.resolve("granted");
  };
  Object.defineProperty(window, "Notification", { value: FakeNotification, configurable: true, writable: true });
}

async function spiedPage(context, url, clock = false) {
  const page = await context.newPage();
  await page.addInitScript(installSpies);
  if (clock) await page.clock.install();
  page.on("dialog", (d) => d.accept().catch(() => {}));
  await page.goto(url, { waitUntil: "load", timeout: 90_000 });
  if (clock) await page.clock.runFor(2500);
  else await page.waitForTimeout(2000);
  return page;
}

const spy = (page) => page.evaluate(() => ({ ...window.__sb, spoken: [...window.__sb.spoken], notified: [...window.__sb.notified] }));

/**
 * In-page: finds the deepest visible element whose text matches `anchor`, climbs to the nearest ancestor holding a control whose
 * accessible name matches `control`, and marks them data-sb-<key>="r" (region) and ="c" (control). Returns the control's name.
 */
function markNear([anchorSrc, controlSrc, key, excludeSrc]) {
  const anchor = new RegExp(anchorSrc, "i");
  const control = new RegExp(controlSrc, "i");
  const exclude = excludeSrc ? new RegExp(excludeSrc, "i") : null;
  const attr = `data-sb-${key}`;
  document.querySelectorAll(`[${attr}]`).forEach((el) => el.removeAttribute(attr));
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && el.checkVisibility({ visibilityProperty: true });
  };
  const name = (el) =>
    [el.innerText, el.getAttribute("aria-label"), el.getAttribute("title"), el.type === "submit" ? el.value : "", el.labels && el.labels[0] && el.labels[0].innerText,
      ...(el.getAttribute("aria-labelledby") || "").split(/\s+/).map((id) => (id && document.getElementById(id) ? document.getElementById(id).innerText : ""))]
      .filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const controls = (root) =>
    [...root.querySelectorAll("button,a,[role=button],[role=switch],[role=checkbox],[role=tab],input[type=checkbox],input[type=submit],label")].filter((x) => vis(x) && !x.disabled);
  const text = (el) => (el.innerText || (/^(INPUT|TEXTAREA)$/.test(el.tagName) ? el.placeholder || el.getAttribute("aria-label") : "") || "").replace(/\s+/g, " ").trim();
  const anchors = [...document.querySelectorAll("body *")].filter((el) => vis(el) && anchor.test(text(el)) && ![...el.children].some((c) => anchor.test(text(c))));
  for (const a of anchors) {
    let box = a;
    for (let i = 0; i < 9 && box && box !== document.body; i++, box = box.parentElement) {
      const c = controls(box).find((x) => control.test(name(x)) && !(exclude && exclude.test(name(x))));
      if (c) {
        box.setAttribute(attr, "r");
        c.setAttribute(attr, "c");
        return name(c).slice(0, 60);
      }
    }
  }
  return null;
}

async function clickMarked(page, key, clock = false) {
  const c = page.locator(`[data-sb-${key}="c"]`).first();
  if (!(await c.count())) return false;
  await c.scrollIntoViewIfNeeded().catch(() => {});
  await c.click({ timeout: 5000 });
  if (clock) await page.clock.runFor(900);
  else await page.waitForTimeout(900);
  return true;
}

const regionText = (page, key) => page.locator(`[data-sb-${key}="r"]`).first().innerText({ timeout: 3000 }).catch(() => "");

/** In-page: the page background colour (deepest full-viewport layer that paints one), as [r, g, b]. */
function pageBackground() {
  const parse = (s) => (s.match(/rgba?\(([^)]+)\)/) || [])[1]?.split(/[ ,/]+/).filter(Boolean).map(Number);
  let best = [255, 255, 255];
  const layers = [document.documentElement, document.body];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width >= innerWidth * 0.95 && r.height >= innerHeight * 0.9 && getComputedStyle(el).position !== "fixed") layers.push(el);
    if (layers.length > 12) break;
  }
  for (const el of layers) {
    const cs = getComputedStyle(el);
    const c = parse(cs.backgroundColor);
    if (c && (c[3] ?? 1) >= 0.6) best = c.slice(0, 3);
    else if (cs.backgroundImage.includes("gradient")) {
      const g = parse(cs.backgroundImage);
      if (g && (g[3] ?? 1) >= 0.6) best = g.slice(0, 3);
    }
  }
  return best;
}
const luminance = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const hex = (c) => "#" + c.map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");

/** In-page: frosted surfaces (backdrop blur over a translucent background) and whether colours/backgrounds transition. */
function surfaces() {
  const parse = (s) => (s.match(/rgba?\(([^)]+)\)/) || [])[1]?.split(/[ ,/]+/).filter(Boolean).map(Number);
  const out = { glass: 0, blurs: [], bordered: 0, transition: false };
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width < 160 || r.height < 60) continue;
    const cs = getComputedStyle(el);
    const f = cs.backdropFilter || cs.webkitBackdropFilter || "";
    const blur = Number((f.match(/blur\(([\d.]+)px\)/) || [])[1] || 0);
    const bg = parse(cs.backgroundColor);
    if (blur >= 8 && bg && (bg[3] ?? 1) < 0.95) {
      out.glass++;
      out.blurs.push(blur);
      if (parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== "none") out.bordered++;
    }
  }
  const layers = [document.documentElement, document.body, ...document.querySelectorAll("body > * , body > * > *, main, section")].slice(0, 40);
  out.transition = layers.some((el) => {
    const cs = getComputedStyle(el);
    return /all|background|color/.test(cs.transitionProperty) && cs.transitionDuration.split(",").some((d) => parseFloat(d) > 0);
  });
  return out;
}

/** In-page: the number shown beside a "Days" label, its font size, and whether all four unit labels are on screen. */
function countdownFacts() {
  const vis = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ visibilityProperty: true });
  const own = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
  const labels = {};
  for (const el of document.querySelectorAll("body *")) {
    const t = own(el).toLowerCase().replace(/[^a-z]/g, "");
    for (const u of ["days", "hours", "minutes", "seconds"]) if ((t === u || t === u.slice(0, -1) || t === u.slice(0, 3) || t === u.slice(0, 4)) && vis(el) && !labels[u]) labels[u] = el;
  }
  let days = null;
  let size = 0;
  if (labels.days) {
    let box = labels.days.parentElement;
    for (let i = 0; i < 4 && box && days === null; i++, box = box.parentElement) {
      const num = [...box.querySelectorAll("*")].find((el) => /^\d{1,3}$/.test(own(el)) && vis(el));
      if (num) (days = Number(own(num))), (size = parseFloat(getComputedStyle(num).fontSize));
    }
  }
  const onScreen = Object.values(labels).every((el) => {
    const r = el.getBoundingClientRect();
    return r.left >= -1 && r.right <= innerWidth + 1;
  });
  return { labels: Object.keys(labels), days, size, onScreen };
}

/** Whole days from `now` to the next 27 November, for a start time anywhere in that day. */
function daysToNov27(now) {
  const d = new Date(now);
  let year = d.getFullYear();
  if (new Date(year, 10, 27, 23, 59).getTime() < now) year++;
  return [0, 23.99].map((h) => Math.floor((new Date(year, 10, 27).getTime() + h * 3_600_000 - now) / DAY));
}

/** In-page: a subject row (smallest element holding a subject name and exactly one status word) and its status. */
function subjectRow([name, statuses]) {
  const want = name ? new RegExp(`\\b${name}\\b`, "i") : /\b(math|maths|mathematics|physics|chemistry|biology|english|history)\b/i;
  const status = (t) => statuses.filter((s) => t.toLowerCase().includes(s.toLowerCase()));
  document.querySelectorAll("[data-sb-status]").forEach((el) => el.removeAttribute("data-sb-status"));
  const els = [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().width > 0 && want.test(el.innerText || "") && status(el.innerText || "").length === 1);
  const row = els.find((el) => !els.some((o) => o !== el && el.contains(o)));
  if (!row) return null;
  const s = status(row.innerText)[0];
  const badge = [...row.querySelectorAll("*")].reverse().find((el) => (el.innerText || "").trim().toLowerCase() === s.toLowerCase());
  const target = badge ? badge.closest("button,[role=button],a,select") || badge : null;
  if (target) target.setAttribute("data-sb-status", "c");
  return { name: (row.innerText.match(want) || [""])[0], status: s, clickable: !!target };
}

/** In-page: for the row holding `text`, whether it is struck through, its checkbox state, and whether the strike animates. */
function goalFacts(text) {
  const rows = [...document.querySelectorAll("body *")].filter((el) => (el.innerText || "").includes(text) && el.getBoundingClientRect().width > 0);
  const leaf = rows.find((el) => ![...el.children].some((c) => (c.innerText || "").includes(text)));
  if (!leaf) return { found: false };
  let struck = false;
  let animated = false;
  for (let el = leaf, i = 0; el && i < 4; el = el.parentElement, i++) {
    const cs = getComputedStyle(el);
    if (cs.textDecorationLine.includes("line-through") || /^(S|DEL|STRIKE)$/.test(el.tagName)) struck = true;
    if (cs.animationName !== "none" || cs.transitionDuration.split(",").some((d) => parseFloat(d) > 0)) animated = true;
    for (const pseudo of ["::before", "::after"]) {
      const ps = getComputedStyle(el, pseudo);
      if (ps.content === "none") continue;
      if (ps.transitionDuration.split(",").some((d) => parseFloat(d) > 0) || ps.animationName !== "none") animated = true;
      const w = parseFloat(ps.width);
      const h = parseFloat(ps.height);
      const shown = parseFloat(ps.opacity) > 0 && ps.visibility !== "hidden" && !/^matrix\(0,|^matrix\([^,]+,[^,]+,[^,]+, 0,/.test(ps.transform);
      const paints = shown && (!/rgba\(0, 0, 0, 0\)|transparent/.test(ps.backgroundColor) || ps.borderTopStyle !== "none");
      if (i < 2 && paints && h > 0 && h <= 4 && w >= 0.6 * el.getBoundingClientRect().width) struck = true;
    }
  }
  for (const d of leaf.querySelectorAll("*")) if (getComputedStyle(d).textDecorationLine.includes("line-through")) struck = true;
  let row = leaf;
  while (row.parentElement && !row.querySelector("input[type=checkbox],[role=checkbox],button")) row = row.parentElement;
  document.querySelectorAll("[data-sb-goal]").forEach((el) => el.removeAttribute("data-sb-goal"));
  const box = row.querySelector("input[type=checkbox],[role=checkbox]") || [...row.querySelectorAll("button")].find((b) => !/delete|remove|trash|edit/i.test((b.getAttribute("aria-label") || "") + b.innerText));
  if (box) box.setAttribute("data-sb-goal", "c");
  const doneClass = [leaf, ...(() => { const up = []; for (let el = leaf.parentElement, i = 0; el && i < 4; el = el.parentElement, i++) up.push(el); return up; })()].some((el) => /\b(done|completed?|checked|is-done)\b/i.test(el.className?.baseVal ?? el.className ?? ""));
  const checked = box ? box.checked === true || box.getAttribute("aria-checked") === "true" || box.getAttribute("aria-pressed") === "true" || doneClass : doneClass;
  return { found: true, struck, animated, checked, hasBox: !!box };
}

const percents = (t) => (t.match(/\b\d{1,3}\s?%/g) || []).join(" ");
const findField = (page, re, exclude) =>
  page.locator("input:visible:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=date]):not([type=time]):not([type=datetime-local]), textarea:visible").evaluateAll((els, [src, ex]) => {
    const re = new RegExp(src, "i");
    const no = ex ? new RegExp(ex, "i") : null;
    const describe = (f) => [f.placeholder, f.name, f.id, f.getAttribute("aria-label"), f.labels?.[0]?.innerText, f.closest("form")?.innerText].join(" ");
    document.querySelectorAll("[data-sb-field]").forEach((el) => el.removeAttribute("data-sb-field"));
    const f = els.find((x) => re.test(describe(x)) && !(no && no.test([x.placeholder, x.getAttribute("aria-label"), x.labels?.[0]?.innerText].join(" "))));
    if (f) f.setAttribute("data-sb-field", "1");
    return !!f;
  }, [re.source, exclude?.source]);

async function submitField(page, value, buttonRe) {
  const f = page.locator("[data-sb-field]").first();
  await f.scrollIntoViewIfNeeded().catch(() => {});
  await f.fill(value, { timeout: 4000 });
  const before = await page.evaluate(() => document.body.innerText);
  await f.press("Enter");
  await page.waitForTimeout(800);
  if ((await page.evaluate(() => document.body.innerText)).split(value).length > before.split(value).length) return true;
  const add = await page.evaluate(([src]) => {
    const f = document.querySelector("[data-sb-field]");
    let box = f;
    for (let i = 0; i < 4 && box; i++, box = box.parentElement) {
      const b = [...box.querySelectorAll("button,[role=button],input[type=submit]")].find((x) => new RegExp(src, "i").test(x.innerText + " " + (x.getAttribute("aria-label") || "") + " " + (x.value || "")));
      if (b) return b.setAttribute("data-sb-add", "1"), true;
    }
    return false;
  }, [buttonRe.source]);
  if (!add) return false;
  await page.locator("[data-sb-add]").first().click({ timeout: 4000 });
  await page.waitForTimeout(800);
  return (await page.evaluate(() => document.body.innerText)).split(value).length > before.split(value).length;
}

const POMO_READY = ["^\\s*25\\s*:\\s*00\\s*$", "^\\s*(start|play|resume|begin)|start (timer|focus|session)", "pomo"];
/** Marks a 25:00 timer with a Start button, first returning a persisted timer to focus mode and resetting it if needed. */
async function pomoReady(p) {
  if (await p.evaluate(markNear, POMO_READY)) return true;
  for (const [src, key] of [["^\\s*(focus|study|work|pomodoro)\\b", "focusmode"], ["reset|restart", "reset"]]) {
    if (await p.evaluate(markNear, ["^\\s*\\d{1,2}\\s*:\\s*\\d{2}\\s*$", src, key, "break"])) await clickMarked(p, key, true).catch(() => {});
    if (await p.evaluate(markNear, POMO_READY)) return true;
  }
  return false;
}

/** Marks the add field matching `re`, first clicking an "Add ..." button in that card when the field is collapsed behind one. */
async function field(page, re, exclude) {
  if (await findField(page, re, exclude)) return true;
  const opened = await page.evaluate(markNear, [re.source, "^\\s*(\\+\\s*)?(add|new)\\b", "opener", exclude?.source]);
  if (!opened) return false;
  await clickMarked(page, "opener").catch(() => {});
  return findField(page, re, exclude);
}

/** Days shown after the settings modal sets the countdown `SETTINGS_DAYS` days ahead at 10:30. */
async function setCountdown(page) {
  const opened = await page.evaluate(markNear, ["(countdown|exam|days|preboard|target)", "setting|change|edit|set (the )?(date|target)|customi|adjust|configure|date", "settings", "dark|light|theme|notif|remind"]);
  if (!opened) return { score: 0, detail: "no settings control near the countdown" };
  await clickMarked(page, "settings");
  const dates = page.locator("input[type=datetime-local]:visible, input[type=date]:visible");
  if (!(await dates.count())) return { score: 0, detail: `"${opened}" opened no date field` };
  const modal = await page.evaluate(() => [...document.querySelectorAll("[role=dialog],dialog[open],[aria-modal=true]")].some((d) => d.getBoundingClientRect().width > 0) ||
    [...document.querySelectorAll("input[type=date],input[type=datetime-local]")].some((i) => { for (let el = i; el; el = el.parentElement) if (getComputedStyle(el).position === "fixed") return true; return false; }));
  const t = new Date(Date.now() + SETTINGS_DAYS * DAY);
  const p = (n) => String(n).padStart(2, "0");
  const day = `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
  const input = dates.first();
  const type = await input.getAttribute("type");
  await input.fill(type === "date" ? day : `${day}T10:30`);
  const time = page.locator("input[type=time]:visible");
  if (type === "date" && (await time.count())) await time.first().fill("10:30").catch(() => {});
  const save = page.locator(":is([role=dialog],dialog,[aria-modal=true],form,body) :is(button,input[type=submit]):visible").filter({ hasText: /save|apply|update|set|done|confirm|ok\b/i }).last();
  if (await save.count()) await save.click({ timeout: 4000 });
  else await input.press("Enter");
  await page.waitForTimeout(1200);
  const after = await page.evaluate(countdownFacts);
  const ok = after.days !== null && Math.abs(after.days - (SETTINGS_DAYS - 0.5)) <= 1;
  return { score: (modal ? 0.25 : 0) + (ok ? 0.75 : 0), detail: `"${opened}" -> ${modal ? "modal" : "inline form"}; set ${day} 10:30; days now ${after.days}` };
}

export async function interactDesktop(context, url) {
  const out = {};
  const page = await spiedPage(context, url);
  const loadSpy = await spy(page);

  out.glass = await attempt(async () => {
    const s = await page.evaluate(surfaces);
    return { score: Math.min(1, s.glass / 3) * (s.bordered >= Math.min(3, s.glass) ? 1 : 0.75), detail: `${s.glass} frosted surfaces (blur ${[...new Set(s.blurs)].join(",")}px), ${s.bordered} with border or shadow` };
  });
  out.font = await attempt(async () => {
    const f = await page.evaluate(() => {
      const fams = [...document.querySelectorAll("h1,h2,h3,p,button,li,span")].slice(0, 200).map((el) => getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim());
      const uses = fams.filter((x) => /plus jakarta|inter\b/i.test(x)).length / Math.max(1, fams.length);
      const loaded = [...document.fonts].some((ff) => /plus jakarta|inter\b/i.test(ff.family) && ff.status === "loaded");
      return { uses, loaded, first: fams[0] };
    });
    return { score: (f.uses >= 0.8 ? 0.5 : f.uses * 0.5) + (f.loaded ? 0.5 : 0), detail: `${Math.round(f.uses * 100)}% of text in Plus Jakarta Sans or Inter, font loaded ${f.loaded}` };
  });

  let darkAfter = null;
  out.theme = await attempt(async () => {
    const a = await page.evaluate(pageBackground);
    const found = await page.evaluate(markNear, [".", "dark|light|theme|night|day mode", "theme"]);
    if (!found) return { score: 0, detail: `no theme toggle; background ${hex(a)}` };
    const trans = (await page.evaluate(surfaces)).transition;
    await clickMarked(page, "theme");
    await page.waitForTimeout(800);
    const b = await page.evaluate(pageBackground);
    const changed = Math.abs(luminance(a) - luminance(b)) > 0.3;
    const [dark, light] = luminance(a) < luminance(b) ? [a, b] : [b, a];
    darkAfter = luminance(b) < 0.5;
    const slate = Math.max(...dark.map((x, i) => Math.abs(x - [15, 23, 42][i]))) <= 24;
    const chroma = Math.max(...light) - Math.min(...light);
    const soft = luminance(light) >= 0.8 && chroma <= 24 ? (luminance(light) < 0.99 ? 1 : 0.5) : 0;
    const score = changed ? 0.25 + (slate ? 0.25 : luminance(dark) < 0.12 ? 0.1 : 0) + soft * 0.25 + (trans ? 0.25 : 0) : 0;
    return { score, detail: `"${found}": ${hex(a)} -> ${hex(b)}; dark ${hex(dark)}, light ${hex(light)}, transition ${trans}` };
  });

  let countdownDays = null;
  out.countdown = await attempt(async () => {
    const c = await page.evaluate(countdownFacts);
    const t1 = await page.evaluate(() => document.body.innerText);
    await page.waitForTimeout(2200);
    const t2 = await page.evaluate(() => document.body.innerText);
    const ticks = t1 !== t2;
    const want = daysToNov27(Date.now());
    const right = c.days !== null && c.days >= want[0] - 1 && c.days <= want[1];
    return {
      score: (c.labels.length / 4) * 0.25 + (ticks ? 0.25 : 0) + (right ? 0.3 : 0) + (c.size >= 40 ? 0.2 : 0),
      detail: `labels ${c.labels.join(",")}; ticking ${ticks}; days ${c.days} (27 Nov is ${want[0]}..${want[1]}); digits ${c.size}px`,
    };
  });
  out.countdownSettings = await attempt(async () => {
    const r = await setCountdown(page);
    countdownDays = (await page.evaluate(countdownFacts)).days;
    return r;
  });

  let subject = null;
  out.statusCycle = await attempt(async () => {
    const first = await page.evaluate(subjectRow, [null, STATUSES]);
    if (!first) return { score: 0, detail: "no subject row with a status badge" };
    const seen = new Set([first.status]);
    let now = first;
    for (let i = 0; i < 4 && now?.clickable; i++) {
      await page.locator("[data-sb-status]").first().click({ timeout: 4000 });
      await page.waitForTimeout(500);
      now = await page.evaluate(subjectRow, [first.name, STATUSES]);
      if (now) seen.add(now.status);
    }
    // Leave it one step on from where it started, to check it survives a reload.
    await page.locator("[data-sb-status]").first().click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(500);
    subject = await page.evaluate(subjectRow, [first.name, STATUSES]);
    return { score: seen.size / 4, detail: `${first.name}: ${[...seen].join(" -> ")}` };
  });
  out.subjectAddDelete = await attempt(async () => {
    if (!(await field(page, /subject|course|exam|topic/, /goal|task|todo|ask|question|message/))) return { score: 0, detail: "no subject input" };
    const added = await submitField(page, NEW_SUBJECT, /add|\+|create|save/);
    if (!added) return { score: 0, detail: "adding a subject did not show it" };
    const del = await page.evaluate(markNear, [`^${NEW_SUBJECT}`, "delete|remove|trash|^[×✕✖x]$", "delsub"]);
    if (!del) return { score: 0.5, detail: "added; no delete control on its row" };
    await page.locator('[data-sb-delsub="r"]').first().hover().catch(() => {});
    await clickMarked(page, "delsub");
    await page.waitForTimeout(700);
    const gone = await page.evaluate((n) => {
      const row = document.querySelector('[data-sb-delsub="r"]');
      return !row || !row.isConnected || !row.innerText.includes(n);
    }, NEW_SUBJECT);
    return { score: gone ? 1 : 0.5, detail: `added; "${del}" ${gone ? "removed it" : "left it"}` };
  });

  out.goals = await attempt(async () => {
    if (!(await field(page, /goal|task|todo|to-do|checklist/, /subject|ask|question|message/))) return { score: 0, detail: "no goal input" };
    const added = await submitField(page, NEW_GOAL, /add|\+|create|save/);
    if (!added) return { score: 0, detail: "adding a goal did not show it" };
    const pctBefore = percents(await page.evaluate(() => document.body.innerText));
    const before = await page.evaluate(goalFacts, NEW_GOAL);
    if (!before.hasBox) return { score: 0.25, detail: "added; no checkbox on the goal" };
    await page.locator("[data-sb-goal]").first().click({ timeout: 4000 });
    await page.waitForTimeout(900);
    const after = await page.evaluate(goalFacts, NEW_GOAL);
    const pctAfter = percents(await page.evaluate(() => document.body.innerText));
    const bar = await page.evaluate(() => !!document.querySelector("[role=progressbar], progress"));
    const moved = pctBefore !== pctAfter && pctAfter !== "";
    const score = 0.25 + (after.struck && !before.struck ? 0.25 : 0) + (after.animated ? 0.1 : 0) + (moved ? 0.25 : 0) + (bar || moved ? 0.15 : 0);
    return { score, detail: `added; checked ${after.checked}; struck ${before.struck} -> ${after.struck}, animated ${after.animated}; percent "${pctBefore}" -> "${pctAfter}"; bar ${bar}` };
  });

  out.quoteShuffle = await attempt(async () => {
    const found =
      (await page.evaluate(markNear, ["(motivation|quote|inspiration)", "shuffle|new quote|another|next|refresh|random|inspire|more", "quote"])) ||
      (await page.evaluate(() => {
        const c = [...document.querySelectorAll("button,[role=button],a")].find(
          (b) => b.getBoundingClientRect().width > 0 && /(shuffle|new|another|next|refresh|random).{0,24}(quote|motivation)/i.test([b.innerText, b.getAttribute("aria-label"), b.title].join(" ")),
        );
        if (!c) return "";
        document.querySelectorAll("[data-sb-quote]").forEach((el) => el.removeAttribute("data-sb-quote"));
        c.setAttribute("data-sb-quote", "c");
        c.parentElement.setAttribute("data-sb-quote", "r");
        return (c.getAttribute("aria-label") || c.innerText || c.title).slice(0, 60);
      }));
    if (!found) return { pass: false, detail: "no shuffle control by the quote" };
    const quoteText = () =>
      page.evaluate(() => {
        let el = document.querySelector('[data-sb-quote="r"]');
        while (el && el.parentElement && el !== document.body && (el.innerText || "").replace(/\s+/g, " ").trim().length < 60) el = el.parentElement;
        return el ? el.innerText : "";
      });
    const before = await quoteText();
    for (let i = 0; i < 3; i++) {
      await clickMarked(page, "quote");
      if ((await quoteText()) !== before) return { pass: true, detail: `"${found}" changed the quote` };
    }
    return { pass: false, detail: `"${found}" left the quote unchanged` };
  });

  out.companion = await attempt(async () => {
    const label = await page.evaluate(() => /voice companion/i.test(document.body.innerText));
    const found = await page.evaluate(markNear, ["(voice companion|ai companion|study companion|companion|assistant)", "motivat|tip|summary|countdown|status|inspire|quote|speak|talk|read|ask|send|go\\b", "voice", "dark|light|theme|notif"]);
    if (!found) return { score: label ? 0.25 : 0, detail: "no companion action" };
    const anim = () =>
      page.evaluate(() => {
        const r = document.querySelector('[data-sb-voice="r"]');
        if (!r) return false;
        return !!r.querySelector("canvas") || [r, ...r.querySelectorAll("*")].some((el) => getComputedStyle(el).animationName !== "none" && el.getBoundingClientRect().width > 0);
      });
    const idle = await anim();
    const before = (await spy(page)).spoken.length;
    await clickMarked(page, "voice");
    await page.waitForTimeout(300);
    const busy = await anim();
    let spoken = (await spy(page)).spoken;
    let how = `"${found}"`;
    if (spoken.length <= before) {
      const input = page.locator('[data-sb-voice="r"] :is(input:not([type=checkbox]):not([type=range]), textarea):visible').first();
      if (await input.count()) {
        await input.fill("How many days until my exam?");
        await input.press("Enter");
        await page.waitForTimeout(800);
        spoken = (await spy(page)).spoken;
        how = "typed question";
      }
    }
    const spoke = spoken.length > before && spoken.at(-1).length > 10;
    return {
      score: (label ? 0.25 : 0) + 0.25 + (spoke ? 0.25 : 0) + (idle || busy ? 0.25 : 0),
      detail: `label ${label}; ${how} spoke ${spoke ? `"${spoken.at(-1).slice(0, 60)}"` : "nothing"}; visualiser animated ${idle || busy}`,
    };
  });

  out.notifyPermission = await attempt(async () => {
    if (loadSpy.requested) return { pass: true, detail: "requested on load" };
    const tried = [];
    for (let i = 0; i < 3; i++) {
      const skip = ["test|send|dismiss", ...tried.map((n) => `^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)].join("|");
      const found = await page.evaluate(markNear, [".", "notif|remind|alert|bell", "notify", skip]);
      if (!found) break;
      tried.push(found);
      await clickMarked(page, "notify").catch(() => {});
      await page.waitForTimeout(600);
      if ((await spy(page)).requested > 0) return { pass: true, detail: `"${tried.join('" then "')}" requested permission` };
    }
    if (!tried.length) return { pass: false, detail: "no notification toggle" };
    return { pass: false, detail: `"${tried.join('", "')}" did not request permission` };
  });

  out.persistence = await attempt(async () => {
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(2000);
    const checks = [];
    if (darkAfter !== null) checks.push(["theme", luminance(await page.evaluate(pageBackground)) < 0.5 === darkAfter]);
    if (countdownDays !== null) checks.push(["countdown date", (await page.evaluate(countdownFacts)).days === countdownDays]);
    if (subject) checks.push(["subject status", (await page.evaluate(subjectRow, [subject.name, STATUSES]))?.status === subject.status]);
    const g = await page.evaluate(goalFacts, NEW_GOAL);
    checks.push(["goal", g.found && (g.checked || g.struck)]);
    const kept = checks.filter(([, ok]) => ok).map(([k]) => k);
    return { score: kept.length / 4, detail: `kept after reload: ${kept.join(", ") || "nothing"}; lost: ${checks.filter(([, ok]) => !ok).map(([k]) => k).join(", ") || "none"}` };
  });
  await page.close();

  out.pomodoro = await attempt(async () => {
    const p = await spiedPage(context, url, true);
    try {
      const time = async () => ((await regionText(p, "pomo")).match(/\b(\d{1,2})\s*:\s*(\d{2})\b/) || [""])[0].replace(/\s/g, "");
      if (!(await pomoReady(p))) return { score: 0, detail: "no 25:00 timer with a Start button" };
      const got = [];
      await clickMarked(p, "pomo", true);
      await p.clock.runFor(2500);
      const running = await time();
      if (running !== "25:00") got.push("start");
      const pause = await p.evaluate(markNear, ["^\\s*\\d{1,2}\\s*:\\s*\\d{2}\\s*$", "^\\s*(pause|stop)", "pause"]);
      if (pause) {
        await clickMarked(p, "pause", true);
        const a = await time();
        await p.clock.runFor(2500);
        if (a === (await time()) && a !== "25:00") got.push("pause");
      }
      if (await p.evaluate(markNear, ["^\\s*\\d{1,2}\\s*:\\s*\\d{2}\\s*$", "reset|restart", "reset"])) {
        await clickMarked(p, "reset", true);
        if ((await time()) === "25:00") got.push("reset");
      }
      const mode = await p.evaluate(markNear, ["^\\s*25\\s*:\\s*00\\s*$", "break|short|rest|mode", "mode", "start|reset|pause"]);
      if (mode) {
        await clickMarked(p, "mode", true);
        if (/^0?5:00$/.test(await time())) got.push("mode");
      }
      return { score: got.length / 4, detail: `${got.join(", ") || "nothing"} worked (running showed ${running})` };
    } finally {
      await p.close();
    }
  });

  out.sessionAlerts = await attempt(async () => {
    const p = await spiedPage(context, url, true);
    try {
      if (!(await pomoReady(p))) return { score: 0, detail: "no 25:00 timer with a Start button" };
      const alerted = async (before, s0) => {
        const s = await spy(p);
        const lines = newLines(before, await p.evaluate(() => document.body.innerText)).filter((l) => /break|session|complete|finish|done|over|time|focus|study|great|well/i.test(l) && !/^\d/.test(l));
        return s.notified.length > s0.notified.length || s.spoken.length > s0.spoken.length || lines.length > 0;
      };
      await clickMarked(p, "pomo", true);
      let before = await p.evaluate(() => document.body.innerText);
      let s0 = await spy(p);
      await p.clock.runFor(25 * 60_000 + 3000);
      const focusEnd = await alerted(before, s0);
      // A break that waits for its own Start is started, as a user would.
      const t = ((await regionText(p, "pomo")).match(/\b\d{1,2}\s*:\s*\d{2}\b/) || [""])[0];
      await p.clock.runFor(2000);
      if (t === ((await regionText(p, "pomo")).match(/\b\d{1,2}\s*:\s*\d{2}\b/) || [""])[0]) {
        await p.evaluate(markNear, ["^\\s*\\d{1,2}\\s*:\\s*\\d{2}\\s*$", "^\\s*(start|play|resume|begin)|start (break|timer)", "pomo"]);
        await clickMarked(p, "pomo", true);
      }
      before = await p.evaluate(() => document.body.innerText);
      s0 = await spy(p);
      await p.clock.runFor(5 * 60_000 + 3000);
      const breakEnd = await alerted(before, s0);
      return { score: (focusEnd ? 0.5 : 0) + (breakEnd ? 0.5 : 0), detail: `alert when the study session ended ${focusEnd}, when the break ended ${breakEnd}` };
    } finally {
      await p.close();
    }
  });
  return out;
}

export async function interactMobile(context, url) {
  const page = await spiedPage(context, url);
  const c = await page.evaluate(countdownFacts);
  await page.close();
  return { phoneCountdown: { pass: c.labels.length === 4 && c.onScreen, detail: `labels ${c.labels.join(",")} on screen ${c.onScreen}, digits ${c.size}px` } };
}

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const home = views.desktop.facts;
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);

  add("name", "Named Preboards Hub", /preboards? hub/i.test(home.text + " " + home.title) ? 1 : 0, home.title);
  fromAct("theme", "Dark/light toggle: slate #0f172a dark, soft gray light, smooth transition", "theme");
  fromAct("glass", "Frosted glass cards (backdrop blur, translucent fill, border or shadow)", "glass");
  fromAct("font", "Plus Jakarta Sans or Inter, loaded", "font");
  fromAct("countdown", "Large live countdown in days, hours, minutes, seconds to 27 November", "countdown");
  fromAct("countdown-settings", "Settings modal changes the target date and time", "countdownSettings");
  const subjects = ["math", "physics"].filter((s) => new RegExp(`\\b${s}`, "i").test(home.text));
  const statuses = STATUSES.filter((s) => home.text.toLowerCase().includes(s.toLowerCase()));
  add("subjects", "Exam subjects (e.g. Math, Physics) with status badges", (subjects.length / 2) * 0.5 + (statuses.length ? 0.5 : 0), `subjects ${subjects.join(",")}; statuses shown ${statuses.join(", ")}`);
  fromAct("status-cycle", "Clicking a badge cycles Not Started, In Progress, Revise, Mastered", "statusCycle");
  fromAct("subject-add-delete", "Subjects can be added and deleted", "subjectAddDelete");
  fromAct("goals", "Goals: add, check off with strikethrough, progress percentage", "goals");
  fromAct("pomodoro", "25/5 Pomodoro with Start, Pause, Reset and mode toggle", "pomodoro");
  fromAct("quote", "Random study quote with a shuffle button", "quoteShuffle");
  fromAct("companion", "AI Voice Companion: visualiser, quick actions or input, speaks with speechSynthesis", "companion");
  fromAct("notify-permission", "Notification permission requested on load or by a toggle", "notifyPermission");
  fromAct("session-alerts", "Alert when a study session and its break end", "sessionAlerts");
  fromAct("persistence", "Theme, countdown date, subject statuses and goals survive a reload", "persistence");
  fromAct("phone-countdown", "Countdown fits a phone screen", "phoneCountdown");
  return items;
}
