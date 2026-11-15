// Task-specific part of the verifier: the 3D Build Revolution brief (premium minimal glass theme with muted colours, cursor-driven
// drag, drop and resize, scroll animation, options for roof, windows, walls, floor, height and paint, a submittable
// personal-customisation prompt and sample reviews at the bottom). grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies
// of tasks/verifier/; only this file is per task. Every check reads the rendered DOM; none compares against the golden site.
import { attempt, checkMobileMenu, freshPage, newLines } from "./lib.mjs";

export const SLOP_EXEMPT = {};

const NAV_ITEMS = ["home", "configurator", "configure", "customize", "customise", "design", "process", "how it works", "projects", "your brief", "brief",
  "custom request", "submit a brief", "reviews", "testimonials", "clients", "contact", "send a brief", "get started", "start designing",
  "start a project", "about", "work", "gallery", "features"];
const OPTIONS = { roof: /\broofs?\b/i, windows: /\bwindows?\b/i, walls: /\bwalls?\b|fa[cç]ade|cladding/i, floor: /\bfloors?\b|flooring/i, height: /\bheight\b|storeys?|stories|floors? count|levels?/i, paint: /\bpaint\b|colou?rs?\b|finish/i };

/** Scrolls through the page once so scroll-reveal content is shown, then returns to the top. */
async function revealAll(page) {
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } scrollTo(0, 0); });
  await page.waitForTimeout(600);
}

/** In-page: the group of controls labelled by `re` (a heading, legend or label naming the option, with at least two choices near it). */
async function findGroups(src) {
  const re = new RegExp(src, "i");
  const sized = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const shown = (el) => sized(el) && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const ctrlSel = "input:not([type=hidden]):not([type=text]):not([type=email]):not([type=search]),select,button,[role=radio],[role=slider],[role=option],[role=tab],[aria-pressed]";
  const labels = [...document.querySelectorAll("h2,h3,h4,h5,h6,legend,label,[role=heading],[class*=label i],[class*=title i]")]
    .filter((el) => sized(el) && el.checkVisibility({ visibilityProperty: true }) && re.test(el.innerText || "") && (el.innerText || "").trim().length <= 40);
  const groups = [];
  for (const l of labels.slice(0, 8)) {
    // Bring the label on screen first so scroll-reveal content has faded in.
    if (!shown(l)) { l.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 900)); }
    if (!shown(l)) continue;
    let box = l.parentElement;
    for (let i = 0; i < 4 && box && box !== document.body; i++, box = box.parentElement) {
      const ctrls = [...box.querySelectorAll(ctrlSel)].filter(shown);
      const choices = ctrls.reduce((n, c) => n + (c.tagName === "SELECT" ? c.options.length : c.type === "range" || c.getAttribute("role") === "slider" ? 2 : 1), 0);
      if (choices >= 2) { groups.push({ label: l.innerText.trim().slice(0, 30), choices, ctrls: ctrls.length }); break; }
    }
    if (groups.length) break;
  }
  return groups;
}

/** In-page: a signature of every large visual (inline SVG markup, 2D canvas pixels, image sources, styled boxes) to detect a redraw. */
function visualSignature() {
  const big = (el) => { const r = el.getBoundingClientRect(); return r.width * r.height >= 40_000; };
  const parts = [];
  for (const svg of document.querySelectorAll("svg")) if (big(svg)) parts.push(svg.innerHTML.length + ":" + svg.innerHTML.replace(/\s+/g, "").slice(0, 20000));
  for (const c of document.querySelectorAll("canvas")) if (big(c)) { try { parts.push(c.toDataURL().slice(-4000)); } catch { parts.push("x"); } }
  for (const img of document.querySelectorAll("img")) if (big(img)) parts.push(img.currentSrc);
  for (const el of document.querySelectorAll("main *")) {
    if (!big(el) || el.querySelector("input,select,button")) continue;
    const s = getComputedStyle(el);
    parts.push(s.backgroundColor + s.backgroundImage.slice(0, 200) + s.filter + Math.round(el.getBoundingClientRect().height));
  }
  return parts.join("|");
}

/** Changes the option group named by `src`: picks an unselected choice, another select option, or moves a slider. */
async function changeOption(page, src) {
  return page.evaluate((src) => {
    const re = new RegExp(src, "i");
    const shown = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const labels = [...document.querySelectorAll("h2,h3,h4,h5,h6,legend,label,[role=heading],[class*=label i],[class*=title i]")]
      .filter((el) => shown(el) && re.test(el.innerText || "") && (el.innerText || "").trim().length <= 40);
    for (const l of labels) {
      let box = l.parentElement;
      for (let i = 0; i < 4 && box && box !== document.body; i++, box = box.parentElement) {
        const radios = [...box.querySelectorAll("input[type=radio]:not(:checked),input[type=checkbox]")].filter((r) => !r.disabled);
        const buttons = [...box.querySelectorAll("button,[role=radio],[aria-pressed]")].filter((b) => shown(b) && b.getAttribute("aria-pressed") !== "true" && b.getAttribute("aria-checked") !== "true" && !/reset|add|remove|delete|submit|send/i.test(b.innerText || ""));
        const select = box.querySelector("select");
        const range = box.querySelector("input[type=range]:not(:disabled)");
        if (radios.length) { const r = radios[radios.length - 1]; r.click(); return `radio ${r.value || r.name}`; }
        if (select && select.options.length > 1) { select.selectedIndex = (select.selectedIndex + 1) % select.options.length; select.dispatchEvent(new Event("change", { bubbles: true })); return "select"; }
        if (range) {
          const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
          const v = Number(range.value) === Number(range.max) ? range.min : range.max;
          set.call(range, v); range.dispatchEvent(new Event("input", { bubbles: true })); range.dispatchEvent(new Event("change", { bubbles: true }));
          return `range to ${v}`;
        }
        if (buttons.length >= 2) { buttons[buttons.length - 1].click(); return `button ${buttons[buttons.length - 1].innerText.trim().slice(0, 20)}`; }
      }
    }
    return null;
  }, src);
}

/** In-page: visible elements whose cursor says they can be dragged or resized; each is tagged with data-deb-target for later lookup. */
function cursorTargets() {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const cur = getComputedStyle(el).cursor;
    if (!/grab|move|resize|url\(/.test(cur) && el.getAttribute("draggable") !== "true") continue;
    // Only the element that sets the cursor, not descendants that inherit it.
    if (el.parentElement && getComputedStyle(el.parentElement).cursor === cur && el.getAttribute("draggable") !== "true") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    el.dataset.debTarget = String(out.length);
    out.push({ i: out.length, cur: el.getAttribute("draggable") === "true" && !/grab|move|resize/.test(cur) ? "draggable" : cur.replace(/url\([^)]*\)/, "url"), w: r.width, h: r.height, tag: el.tagName });
  }
  return out;
}

/** Scrolls a tagged target into view and returns its centre and box, or null when it is gone or hidden. */
async function locate(page, i) {
  const loc = page.locator(`[data-deb-target="${i}"]`).first();
  if (!(await loc.count())) return null;
  await loc.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(200);
  const r = await loc.boundingBox();
  return r && r.width ? { ...r, x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
}

const boxesNear = ([x, y]) => [...document.querySelectorAll("body *")].filter((el) => {
  const r = el.getBoundingClientRect();
  return r.width >= 20 && r.width * r.height <= 900_000 && r.left - 40 <= x && x <= r.right + 40 && r.top - 40 <= y && y <= r.bottom + 40;
}).map((el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(","); }).join("|");

async function dragBy(page, x, y, dx, dy) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(50);
  for (let i = 1; i <= 8; i++) { await page.mouse.move(x + (dx * i) / 8, y + (dy * i) / 8); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.waitForTimeout(300);
}

export async function interactDesktop(context, url) {
  const out = {};

  out.options = await attempt(async () => {
    const page = await freshPage(context, url);
    await revealAll(page);
    const found = {};
    for (const [k, re] of Object.entries(OPTIONS)) found[k] = (await page.evaluate(findGroups, re.source))[0] ?? null;
    await page.close();
    const ok = Object.entries(found).filter(([, g]) => g);
    return { pass: ok.length === 6, score: ok.length / 6, detail: Object.entries(found).map(([k, g]) => `${k} ${g ? `"${g.label}" ${g.choices} choices` : "missing"}`).join(", ") };
  });

  out.options_update_model = await attempt(async () => {
    const page = await freshPage(context, url);
    const res = [];
    for (const [k, re] of Object.entries(OPTIONS)) {
      const before = await page.evaluate(visualSignature);
      const how = await changeOption(page, re.source);
      await page.waitForTimeout(700);
      const changed = how && before !== (await page.evaluate(visualSignature));
      res.push([k, changed, how]);
    }
    await page.close();
    const n = res.filter((r) => r[1]).length;
    return { pass: n === 6, score: n / 6, detail: res.map(([k, c, h]) => `${k} ${h ? (c ? "redraws" : `${h}: no visual change`) : "no control"}`).join(", ") };
  });

  out.drag_move = await attempt(async () => {
    const page = await freshPage(context, url);
    const targets = (await page.evaluate(cursorTargets)).filter((t) => /grab|move|draggable/.test(t.cur) && t.w <= 400 && t.h <= 400);
    const tried = [];
    for (const t of targets.slice(0, 10)) {
      const at = await locate(page, t.i);
      if (!at || at.y < 0 || at.y > 900) continue;
      await dragBy(page, at.x, at.y, 60, -40);
      const now = await locate(page, t.i);
      const moved = now ? Math.hypot(now.x - at.x, now.y - at.y) : 0;
      tried.push(`${t.tag} ${Math.round(moved)}px`);
      if (moved >= 20) { await page.close(); return { pass: true, detail: `dragged a ${t.tag} (${t.cur}) by 60,-40: it followed ${Math.round(moved)}px` }; }
    }
    await page.close();
    return { pass: false, detail: targets.length ? `no draggable element followed the pointer (${tried.join(", ")})` : "no element with a grab/move cursor or draggable=true" };
  });

  out.drop_adds = await attempt(async () => {
    const page = await freshPage(context, url);
    const sources = (await page.evaluate(cursorTargets)).filter((t) => /grab|move|draggable/.test(t.cur) && t.w <= 300 && t.h <= 120);
    // Elements that set a grab/move cursor themselves (not inherited, not parts of an SVG drawing), or are draggable.
    const movable = () => page.evaluate(() => [...document.querySelectorAll("body *")].filter((el) => el.getAttribute("draggable") === "true" ||
      (!el.ownerSVGElement && /grab|move/.test(getComputedStyle(el).cursor) && getComputedStyle(el.parentElement).cursor !== getComputedStyle(el).cursor)).length);
    const tried = [];
    for (const s of sources.slice(0, 6)) {
      const now = await locate(page, s.i);
      if (!now) continue;
      // Drop onto the board the movable items live on (the smallest large on-screen box holding them), else just below the source.
      const board = await page.evaluate((i) => {
        const src = document.querySelector(`[data-deb-target="${i}"]`);
        const sets = (el) => !el.ownerSVGElement && /grab|move/.test(getComputedStyle(el).cursor) && getComputedStyle(el.parentElement).cursor !== getComputedStyle(el).cursor;
        const movable = [...document.querySelectorAll("body *")].filter((el) => (sets(el) || el.getAttribute("draggable") === "true") && !src.contains(el) && !el.contains(src));
        const boxes = [...document.querySelectorAll("body *")].map((el) => [el, el.getBoundingClientRect()])
          .filter(([el, r]) => !el.ownerSVGElement && r.width * r.height >= 30_000 && r.top >= 0 && r.bottom <= innerHeight && !el.contains(src) && movable.some((m) => m !== el && el.contains(m)))
          .sort((a, b) => a[1].width * a[1].height - b[1].width * b[1].height);
        const r = boxes[0]?.[1];
        return r ? [r.x + r.width / 2, r.y + r.height * 0.6] : null;
      }, s.i);
      const [tx, ty] = board ?? [now.x, now.y + 160];
      const before = await movable();
      await dragBy(page, now.x, now.y, tx - now.x, ty - now.y);
      await page.waitForTimeout(400);
      const after = await movable();
      tried.push(`${s.tag} to ${board ? "board" : "below"} ${before}->${after}`);
      if (after > before) { await page.close(); return { pass: true, detail: `dropping a ${s.tag} added a movable element (${before} -> ${after})` }; }
    }
    await page.close();
    return { pass: false, detail: `${sources.length} small draggable sources; none added an element when dropped (${tried.join(", ")})` };
  });

  out.drag_resize = await attempt(async () => {
    const page = await freshPage(context, url);
    const handles = (await page.evaluate(cursorTargets)).filter((t) => /resize/.test(t.cur) && t.w <= 80 && t.h <= 80);
    for (const h of handles.slice(0, 8)) {
      const now = await locate(page, h.i);
      if (!now) continue;
      const before = await page.evaluate(boxesNear, [now.x, now.y]);
      const [dx, dy] = /^(ew|col|e|w)-/.test(h.cur) ? [40, 0] : /^(ns|row|n|s)-/.test(h.cur) ? [0, -40] : /^(nesw|ne|sw)-/.test(h.cur) ? [40, -40] : [40, 40];
      await dragBy(page, now.x, now.y, dx, dy);
      const sizes = (s) => s.split("|").map((b) => b.split(",").slice(2).join(","));
      const after = await page.evaluate(boxesNear, [now.x, now.y]);
      const grown = sizes(after).filter((x) => !sizes(before).includes(x)).length;
      if (grown) { await page.close(); return { pass: true, detail: `dragging a ${h.cur} handle resized ${grown} boxes` }; }
    }
    // A plain size slider adjusts sizes too, but not by direct manipulation.
    const slider = await page.locator("input[type=range]").count();
    await page.close();
    return { pass: false, score: slider ? 0.4 : 0, detail: `${handles.length} resize handles, none resized anything${slider ? "; size sliders only" : ""}` };
  });

  out.cursors = await attempt(async () => {
    const page = await freshPage(context, url);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    const kinds = [...new Set((await page.evaluate(cursorTargets)).map((t) => t.cur.replace(/^(n|s|e|w|ne|nw|se|sw|nesw|nwse|ew|ns|col|row)-resize$/, "resize")))];
    await page.close();
    return { pass: kinds.length >= 2, score: Math.min(1, kinds.length / 2), detail: kinds.length ? `cursor kinds: ${kinds.join(", ")}` : "no drag, move or resize cursors anywhere" };
  });

  out.scroll_motion = await attempt(async () => {
    const page = await freshPage(context, url);
    const read = () => page.evaluate(() => [...document.querySelectorAll("main h2, main h3, main p, main li, main article, main img, section > div")]
      .filter((el) => el.getBoundingClientRect().top + scrollY > innerHeight * 1.2).slice(0, 120)
      .map((el) => { const s = getComputedStyle(el); return `${s.opacity}|${s.transform}|${s.clipPath}|${s.translate}|${s.scale}`; }));
    const before = await read();
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
    await page.waitForTimeout(1200);
    const after = await read();
    await page.close();
    const changed = before.filter((b, i) => b !== after[i]).length;
    return { pass: changed >= 3, score: Math.min(1, changed / 3), detail: `${changed} of ${before.length} below-fold elements changed opacity or transform when scrolled into view` };
  });

  out.prompt_form = await attempt(async () => {
    const page = await freshPage(context, url);
    const form = page.locator("form").filter({ has: page.locator("textarea") }).first();
    if (!(await form.count())) { await page.close(); return { pass: false, detail: "no form with a free-text prompt field" }; }
    await form.scrollIntoViewIfNeeded();
    const submit = form.locator("button[type=submit], input[type=submit], button:not([type])").last();
    const text0 = await page.evaluate(() => document.body.innerText);
    await submit.click({ timeout: 5000 });
    await page.waitForTimeout(800);
    const blocked = await page.evaluate(() => {
      const f = [...document.querySelectorAll("form")].find((x) => x.querySelector("textarea"));
      return !!f && (!!f.querySelector("[aria-invalid=true], :invalid") || /required|please|enter|invalid/i.test(f.innerText));
    });
    const emptyAdded = newLines(text0, await page.evaluate(() => document.body.innerText)).join(" ");
    const falseSuccess = /\b(thank|received|submitted|sent\b|success)/i.test(emptyAdded);
    const blockedMsg = blocked || /required|please|enter|invalid|at least|minimum/i.test(emptyAdded);
    for (const inp of await form.locator("input:visible").all()) {
      const t = ((await inp.getAttribute("type")) || "text").toLowerCase();
      if (["checkbox", "radio", "submit", "button", "hidden", "range", "file", "color"].includes(t)) continue;
      const hint = ((await inp.getAttribute("name")) || "") + ((await inp.getAttribute("id")) || "") + ((await inp.getAttribute("placeholder")) || "");
      await inp.fill(t === "number" ? "2" : t === "email" || /mail/i.test(hint) ? "ana.ruiz@example.com" : t === "tel" || /phone|tel/i.test(hint) ? "+44 20 7946 0000" : "Ana Ruiz");
    }
    for (const sel of await form.locator("select:visible").all()) { const n = await sel.locator("option").count(); if (n > 1) await sel.selectOption({ index: 1 }); }
    for (const ta of await form.locator("textarea:visible").all()) await ta.fill("A two-storey house with a flat roof, a south-facing terrace and a study under the eaves with one large window.");
    const text1 = await page.evaluate(() => document.body.innerText);
    await submit.click({ timeout: 5000 });
    const done = /thank|received|submitted|sent|on its way|we('| wi)ll be in touch|reply/i;
    let added = "";
    // Allow a simulated network delay ("Sending...") before the confirmation appears.
    for (let t = 0; t < 6 && !done.test(added); t++) {
      await page.waitForTimeout(1000);
      added = newLines(text1, await page.evaluate(() => document.body.innerText)).join(" ");
    }
    const ok = done.test(added);
    await page.close();
    const score = (ok ? 0.7 : 0) + (blockedMsg && !falseSuccess ? 0.3 : 0);
    return { pass: score >= 0.99, score, detail: `empty submit ${blockedMsg && !falseSuccess ? "blocked with a message" : "not validated"}; filled submit ${ok ? `confirmed: "${added.slice(0, 80)}"` : "showed no confirmation"}` };
  });

  out.reviews = await attempt(async () => {
    const page = await freshPage(context, url);
    const r = await page.evaluate(() => {
      const H = document.documentElement.scrollHeight;
      // A heading naming the reviews, else a section labelled as reviews by its id, class or aria-label.
      const head = [...document.querySelectorAll("h1,h2,h3")].find((h) => /review|testimonial|clients? say|customers? say|what (people|homeowners) say|kind words/i.test(h.innerText))
        ?? [...document.querySelectorAll("section, [role=region]")].find((el) => /review|testimonial/i.test(`${el.id} ${el.className} ${el.getAttribute("aria-label") || ""}`) && el.getBoundingClientRect().height > 0);
      if (!head) return null;
      const top = head.getBoundingClientRect().top + scrollY;
      let sec = /^H[1-3]$/.test(head.tagName) ? head.parentElement : head;
      while (sec && sec.parentElement !== document.body && sec.getBoundingClientRect().height < 300) sec = sec.parentElement;
      const items = [...(sec || document.body).querySelectorAll("blockquote, li, article, figure, [class*=review i], [class*=testimonial i]")]
        .filter((el) => (el.innerText || "").trim().length >= 60 && !el.querySelector("blockquote, li, article, figure"));
      return { pos: top / H, items: items.length };
    });
    await page.close();
    if (!r) return { pass: false, detail: "no reviews or testimonials heading" };
    const score = (r.pos >= 0.6 ? 0.5 : 0) + Math.min(0.5, (r.items / 3) * 0.5);
    return { pass: score >= 0.99, score, detail: `reviews heading at ${Math.round(r.pos * 100)}% of the page, ${r.items} reviews` };
  });

  out.glass = await attempt(async () => {
    const page = await freshPage(context, url);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    const n = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((el) => {
      const s = getComputedStyle(el), r = el.getBoundingClientRect();
      const f = s.backdropFilter || s.webkitBackdropFilter || "";
      const a = (s.backgroundColor.match(/rgba?\(([^)]+)\)/)?.[1].split(/[ ,/]+/).filter(Boolean)[3]) ?? "1";
      return /blur\((?!0px)/.test(f) && Number(a) < 0.95 && r.width >= 200 && r.height >= 60;
    }).length);
    await page.close();
    return { pass: n >= 3, score: Math.min(1, n / 3), detail: `${n} translucent blurred (glass) panels` };
  });

  out.muted_palette = await attempt(async () => {
    const page = await freshPage(context, url);
    const r = await page.evaluate(() => {
      const sat = (c) => {
        const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
        const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); if (a < 0.3) return null;
        const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, l = (mx + mn) / 2;
        return { s: mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1)), l };
      };
      let total = 0, vivid = 0;
      for (const el of document.querySelectorAll("body *")) {
        const rc = el.getBoundingClientRect(); if (!rc.width || !el.checkVisibility()) continue;
        const own = el.children.length ? 0 : 1;
        const s = getComputedStyle(el);
        for (const [c, w] of [[s.backgroundColor, rc.width * rc.height], [s.color, own * Math.min(rc.width * rc.height, 40000)]]) {
          const v = sat(c); if (!v) continue;
          total += w; if (v.s > 0.6 && v.l > 0.2 && v.l < 0.8) vivid += w;
        }
      }
      return total ? vivid / total : 0;
    });
    await page.close();
    return { pass: r <= 0.05, score: r <= 0.05 ? 1 : r <= 0.15 ? 0.5 : 0, detail: `${(r * 100).toFixed(1)}% of coloured area is vivid (saturation > 60%)` };
  });

  return out;
}

export async function interactMobile(context, url) {
  const out = {};
  out.mobile_menu = await attempt(() => checkMobileMenu(context, url, NAV_ITEMS));
  out.mobile_options = await attempt(async () => {
    const page = await freshPage(context, url);
    await revealAll(page);
    const found = [];
    for (const [k, re] of Object.entries(OPTIONS)) if ((await page.evaluate(findGroups, re.source)).length) found.push(k);
    const small = await page.evaluate(() => [...document.querySelectorAll("main input[type=radio], main input[type=range], main select, main button, main [role=radio]")].filter((el) => {
      const t = el.type === "radio" ? el.closest("label") || el : el; const r = t.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24);
    }).length);
    await page.close();
    const score = (found.length / 6) * (small ? 0.5 : 1);
    return { pass: found.length === 6 && !small, score, detail: `${found.length}/6 option groups on a phone, ${small} controls under 24px` };
  });
  return out;
}

export function requirements(views) {
  const home = views.desktop.pages[0].facts;
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);
  const text = home.text || "";
  add("brand", "3D Build Revolution name and its Design, Build, Live Better line", (/3d build revolution/i.test(text) ? 0.5 : 0) + (/design/i.test(text) && /build/i.test(text) && /live better/i.test(text) ? 0.5 : 0));
  fromAct("options", "Labelled options for roof, windows, walls, floor, height and paint", "options");
  fromAct("options-update-model", "Changing each option redraws the house", "options_update_model");
  fromAct("drag-move", "Elements can be dragged with the pointer", "drag_move");
  fromAct("drag-drop", "Dropping an item adds it to the design", "drop_adds");
  fromAct("resize", "Sizes adjust by dragging a resize handle", "drag_resize");
  fromAct("cursors", "Distinct drag, move and resize cursors", "cursors");
  fromAct("scroll-motion", "Sections animate as they scroll into view", "scroll_motion");
  fromAct("prompt-form", "Personal customisation prompt can be submitted, with validation", "prompt_form");
  fromAct("reviews", "Sample reviews at the bottom of the page", "reviews");
  fromAct("glass", "Glass theme: translucent blurred panels", "glass");
  fromAct("muted-palette", "Vibrant colours reduced", "muted_palette");
  fromAct("mobile-menu", "Navigation collapses into a working phone menu", "mobile_menu");
  fromAct("mobile-options", "All option groups usable on a phone", "mobile_options");
  return items;
}
