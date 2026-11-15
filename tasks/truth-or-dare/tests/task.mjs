// Task-specific part of the verifier: the Truth or Dare mobile brief's checklist, checked by playing one round.
// grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of tasks/verifier/; only this file is per task.
// The grader plays both phones as two tabs of one phone-sized browser context (instruction.md states this contract): tab A
// creates a room, tab B joins it with the room ID (and passcode, if the build asks for one), tab B spins, the picked player
// chooses dare, the other writes it, the picked player sees it, then chat, a dropped connection and the brief's widths.
import { attempt, newLines } from "./lib.mjs";

const NAMES = ["Maya", "Leo"];
const PASS = "4821";
const DARE = "Sing the chorus of the last song you listened to";
const WIDTHS = [[320, 700], [360, 740], [375, 812], [390, 844], [430, 932], [768, 1024], [1024, 768], [1440, 900]];
const CHAT_MESSAGES = 14;

export function requirements(views) {
  const d = views.desktop.facts;
  const act = views.phone?.ok ? views.phone.interactions : {};
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc) => add(id, desc, act[id]?.score ?? (act[id]?.pass ? 1 : 0), act[id]?.detail ?? (views.phone?.ok ? "not reached" : "phone view failed"));

  add("title", "Page title names Truth or Dare", /truth\s*(or|\/|&)\s*dare/i.test(d.title) ? 1 : 0, d.title);
  fromAct("create-room", "One phone creates a room and is shown its room ID");
  fromAct("join-room", "A second phone joins that room; both phones show both player names");
  fromAct("top-bar", "Top of the game screen: game logo or name, room ID and round number");
  fromAct("vertical-layout", "Player 1 above the bottle, spin button below it, player 2 below that, on one phone screen");
  fromAct("bottle-central", "Large, centred bottle with free space around it");
  fromAct("calm-at-rest", "Nothing animates on a loop on the start or game screen");
  fromAct("button-transitions", "Buttons transition in 150-200 ms");
  fromAct("spin-rotations", "The bottle turns at least two full rotations");
  fromAct("spin-easing", "The spin accelerates, decelerates and makes a small stopping movement");
  fromAct("spin-sync", "Both phones end at the same angle, pointing along a player axis");
  fromAct("selected-player", "Exactly one phone gets the truth-or-dare choice and both phones name the same picked player");
  fromAct("one-step-per-screen", "Choosing and writing the question are separate screens");
  fromAct("stage-transition", "Moving to the next stage animates");
  fromAct("question-entry", "The other player gets a question-entry screen for the chosen dare");
  fromAct("question-keyboard", "With the keyboard open (short viewport), the question's submit button stays visible");
  fromAct("challenge-shown", "The picked player is shown the dare");
  fromAct("refresh-persist", "Refreshing the picked player's phone keeps the game where it was");
  fromAct("next-round", "Finishing the dare starts round 2");
  fromAct("chat-sheet", "Chat opens as a bottom sheet 75-95% of the screen tall, anchored to the bottom");
  fromAct("chat-open-motion", "The chat sheet slides or fades open rather than appearing at once");
  fromAct("chat-controls", "Chat sheet: close button at the top, scrollable messages, input fixed at the bottom");
  fromAct("chat-autoscroll", "Chat scrolls to the newest message");
  fromAct("chat-sync", "A message sent on one phone reaches the other");
  fromAct("chat-keyboard", "With the keyboard open, the chat input and send button stay visible");
  fromAct("chat-close", "Closing the chat uncovers the game");
  fromAct("mobile-inputs", "Inputs are at least 44px tall, 16px text, and labelled");
  fromAct("offline", "A dropped connection is shown to the player");
  fromAct("focused-board", "The game screen stays focused: at most 8 controls");
  fromAct("responsive", "Game screen at 320-1440px: no horizontal scroll, clipped or overlapping buttons, bottle and controls on screen");
  return items;
}

// ---- in-page helpers (each is passed to page.evaluate, so it must be self-contained) ----

/** Tags the visible input or textarea whose label, aria-label, placeholder, name or id matches `src` (and not `avoid`). */
function tagField([src, avoid, tag]) {
  const re = new RegExp(src, "i"), no = avoid ? new RegExp(avoid, "i") : null;
  const shown = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  for (const el of document.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]),textarea")) {
    if (!shown(el) || el.disabled || el.readOnly) continue;
    const labels = [...(el.labels || [])].map((l) => l.innerText);
    const by = (el.getAttribute("aria-labelledby") || "").split(" ").map((id) => document.getElementById(id)?.innerText || "");
    const text = [...labels, ...by, el.getAttribute("aria-label"), el.placeholder, el.name, el.id, el.type === "password" ? "passcode" : ""].join(" ");
    if (re.test(text) && !(no && no.test(text))) {
      document.querySelectorAll(`[data-tod="${tag}"]`).forEach((x) => x.removeAttribute("data-tod"));
      el.setAttribute("data-tod", tag);
      return true;
    }
  }
  return false;
}

/** Size, text size and labelling of the tagged field. */
function fieldMetrics(tag) {
  const el = document.querySelector(`[data-tod="${tag}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const label = (el.labels && el.labels.length) || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") ? 1 : el.placeholder ? 0.5 : 0;
  return { tag, height: Math.round(r.height), font: parseFloat(getComputedStyle(el).fontSize), label };
}

/** Visible, enabled buttons (and button-like links) whose label matches `src`, tagged `tag`; returns how many. */
function tagButtons([src, tag]) {
  const re = new RegExp(src, "i");
  document.querySelectorAll(`[data-todb="${tag}"]`).forEach((x) => x.removeAttribute("data-todb"));
  let n = 0;
  for (const el of document.querySelectorAll("button,[role=button],a,input[type=submit]")) {
    const r = el.getBoundingClientRect();
    if (!r.width || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) || el.disabled || el.getAttribute("aria-disabled") === "true") continue;
    const label = ((el.innerText || el.value || "") + " " + (el.getAttribute("aria-label") || "")).replace(/\s+/g, " ").trim();
    if (re.test(label)) el.setAttribute("data-todb", tag), n++;
  }
  return n;
}

/** Rotation candidates around the bottle: elements named "bottle", else the largest picture; plus ancestors and descendants. */
function bottleProbe(mode) {
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 8 && r.height > 8 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  };
  const area = (el) => el.getBoundingClientRect().width * el.getBoundingClientRect().height;
  const named = [...document.querySelectorAll("[class*=bottle i],[id*=bottle i],[data-testid*=bottle i],[aria-label*=bottle i],img[alt*=bottle i]")].filter(
    (el) => shown(el) && !el.closest("button,a"),
  );
  const pictures = [...document.querySelectorAll("svg,img,canvas")].filter((el) => shown(el) && !el.closest("button,a") && area(el) > 2500);
  const pool = named.length ? named : pictures;
  const bottle = pool.sort((a, b) => area(b) - area(a))[0];
  if (!bottle) return null;
  if (mode === "rect") {
    // The bottle's footprint is its largest named or pictured box; a rotating child can be narrower than its container.
    const box = [bottle, ...bottle.querySelectorAll("*")].filter(shown).sort((a, b) => area(b) - area(a))[0].getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height, top: box.top, bottom: box.bottom, left: box.left, right: box.right };
  }
  const cands = [bottle];
  for (let p = bottle.parentElement, i = 0; p && i < 3; p = p.parentElement, i++) cands.push(p);
  cands.push(...[...bottle.querySelectorAll("*")].slice(0, 60));
  return cands;
}

function angleOf(el) {
  const t = getComputedStyle(el).transform;
  if (t && t !== "none") {
    const m = t.match(/matrix(3d)?\(([^)]+)\)/);
    if (m) {
      const v = m[2].split(",").map(Number);
      return (Math.atan2(v[1], v[0]) * 180) / Math.PI;
    }
  }
  const tr = el.transform?.baseVal?.consolidate?.();
  if (tr) return (Math.atan2(tr.matrix.b, tr.matrix.a) * 180) / Math.PI;
  const rot = getComputedStyle(el).rotate;
  if (rot && rot !== "none") return parseFloat(rot) || 0;
  return 0;
}

/** Samples the rotation of every candidate each frame until it has been still for 1.2 s after moving (or `cap` ms). */
async function traceSpin([probeSrc, angleSrc, cap]) {
  const probe = new Function(`return (${probeSrc})`)(), angle = new Function(`return (${angleSrc})`)();
  const cands = probe("cands");
  if (!cands) return null;
  const t0 = performance.now();
  const last = cands.map(angle), total = cands.map(() => 0), traces = cands.map(() => []);
  let movedAt = 0, lastMove = 0;
  while (performance.now() - t0 < cap) {
    await new Promise((r) => requestAnimationFrame(() => r()));
    const t = performance.now() - t0;
    cands.forEach((el, i) => {
      const a = angle(el);
      const dl = ((a - last[i] + 540) % 360) - 180;
      last[i] = a;
      total[i] += dl;
      traces[i].push([Math.round(t), total[i], a]);
      if (Math.abs(dl) > 0.05) (lastMove = t), movedAt || (movedAt = t);
    });
    if (movedAt && t - lastMove > 1200) break;
  }
  const best = traces.map((tr) => Math.max(...tr.map((x) => Math.abs(x[1])))).reduce((bi, v, i, arr) => (v > arr[bi] ? i : bi), 0);
  const tr = traces[best];
  return { trace: tr.map((x) => [x[0], Math.round(x[1] * 10) / 10]), final: tr.length ? ((tr[tr.length - 1][2] % 360) + 360) % 360 : 0 };
}

/** Smallest visible element whose own text contains `name`, as a rect. */
function rectOfText(name) {
  let best = null;
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("[role=dialog],dialog,[aria-modal=true]")) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ");
    if (!own.includes(name) || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const r = el.getBoundingClientRect();
    if (r.width && (!best || r.width * r.height < best.width * best.height)) best = r;
  }
  return best && { top: best.top, bottom: best.bottom, left: best.left, right: best.right, width: best.width, height: best.height, cy: best.top + best.height / 2 };
}

/** The open chat sheet: a dialog, or the largest fixed or absolute layer holding a text input. */
function sheetRect() {
  const shown = (el) => el.getBoundingClientRect().height > 40 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  let sheet = [...document.querySelectorAll("[role=dialog],dialog[open],[aria-modal=true]")].filter(shown).sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
  if (!sheet) {
    sheet = [...document.querySelectorAll("body *")]
      .filter((el) => ["fixed", "absolute"].includes(getComputedStyle(el).position) && shown(el) && el.querySelector("input,textarea"))
      .sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
  }
  if (!sheet) return null;
  // A full-screen layer holding the sheet counts as the sheet's box only when nothing smaller inside it has a surface.
  const inner = [...sheet.querySelectorAll("*")].filter((el) => {
    const cs = getComputedStyle(el);
    return shown(el) && el.querySelector("input,textarea") && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && el.getBoundingClientRect().height < sheet.getBoundingClientRect().height - 4;
  }).sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
  const box = (inner && sheet.getBoundingClientRect().height >= innerHeight - 2 ? inner : sheet);
  box.setAttribute("data-tod-sheet", "1");
  const r = box.getBoundingClientRect();
  const close = [...box.querySelectorAll("button,[role=button]")].find((b) => /close|dismiss|done|back|×|✕|✖/i.test((b.innerText || "") + " " + (b.getAttribute("aria-label") || "")));
  if (close) close.setAttribute("data-tod-close", "1");
  const input = [...box.querySelectorAll("input,textarea")].filter((i) => i.getBoundingClientRect().height > 0).pop();
  if (input) input.setAttribute("data-tod-msg", "1");
  const scroller = [...box.querySelectorAll("*")].find((el) => /auto|scroll/.test(getComputedStyle(el).overflowY) && el.clientHeight > 80);
  if (scroller) scroller.setAttribute("data-tod-scroll", "1");
  const ir = input?.getBoundingClientRect(), cr = close?.getBoundingClientRect();
  return {
    top: r.top, bottom: r.bottom, height: r.height, vh: innerHeight, transform: getComputedStyle(box).transform, opacity: getComputedStyle(box).opacity,
    closeTop: cr ? cr.top - r.top : null, inputBottomGap: ir ? r.bottom - ir.bottom : null, scroller: !!scroller,
  };
}

/** The share of the viewport the open sheet still covers (0 once closed). */
function sheetCover() {
  const el = document.querySelector("[data-tod-sheet]");
  if (!el || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return 0;
  const r = el.getBoundingClientRect();
  return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / innerHeight;
}

function inView(sel) {
  const el = document.querySelector(sel);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.top < -1 || r.bottom > innerHeight + 1 || r.width === 0) return false;
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
}

/** Buttons that overlap each other, clip their label or leave the viewport, plus horizontal overflow. */
function layoutFaults() {
  const out = [];
  if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`horizontal scroll ${document.documentElement.scrollWidth}px`);
  const btns = [...document.querySelectorAll("button,[role=button],a")].filter((b) => {
    const r = b.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && b.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !b.closest("[inert],[aria-hidden=true]");
  });
  const label = (b) => (b.innerText || b.getAttribute("aria-label") || "").trim().slice(0, 20);
  for (const b of btns) {
    const r = b.getBoundingClientRect();
    if (r.left < -1 || r.right > innerWidth + 1) out.push(`off screen: ${label(b)}`);
    if (b.scrollWidth > b.clientWidth + 2 && getComputedStyle(b).overflow !== "visible") out.push(`clipped: ${label(b)}`);
  }
  for (let i = 0; i < btns.length; i++)
    for (let j = i + 1; j < btns.length; j++) {
      if (btns[i].contains(btns[j]) || btns[j].contains(btns[i])) continue;
      const a = btns[i].getBoundingClientRect(), b = btns[j].getBoundingClientRect();
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w > 2 && h > 2) out.push(`overlap: ${label(btns[i])} / ${label(btns[j])}`);
    }
  return out;
}

const infiniteAnimations = () =>
  document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity && a.effect.target?.getBoundingClientRect?.().width > 0).length;

// ---- driver ----

const text = (page) => page.evaluate(() => document.body.innerText);
const fill = async (page, src, avoid, value, metrics) => {
  if (!(await page.evaluate(tagField, [src, avoid, "f"]))) return false;
  const m = await page.evaluate(fieldMetrics, "f");
  if (m && metrics) metrics.push({ ...m, field: src.slice(0, 16) });
  await page.locator("[data-tod=f]").fill(value, { timeout: 3000 });
  return true;
};
const click = async (page, src, { last = false } = {}) => {
  if (!(await page.evaluate(tagButtons, [src, "b"]))) return false;
  const loc = page.locator("[data-todb=b]");
  await (last ? loc.last() : loc.first()).click({ timeout: 4000 });
  return true;
};
/** Submits the form holding the last filled field, else clicks the button matching `src`. */
const submit = async (page, src) => {
  const button = page.locator("form:has([data-tod=f]) button[type=submit], form:has([data-tod=f]) button:not([type]), form:has([data-tod=f]) input[type=submit]").filter({ visible: true });
  if (await button.count()) return button.last().click({ timeout: 4000 });
  if (await click(page, src, { last: true })) return;
  if (await page.locator("[data-tod=f]").count()) await page.locator("[data-tod=f]").press("Enter", { timeout: 3000 }).catch(() => {});
};

const NAME = "\\bname\\b|nick|player|who";
const PASSCODE = "pass|pin|secret|password";
const ROOM = "room|code|\\bid\\b";
const STOP = new Set(["ROOM", "CODE", "TRUTH", "DARE", "PLAYER", "PLAYERS", "JOIN", "COPY", "ROUND", "WAITING", "CHAT", "LEAVE", "SHARE", "INVITE", "CREATE", "SPIN", "BOTTLE", "PASSCODE", "LINK", "OPEN", "SEAT", "READY", "MAYA", "LEO", "HOST", "GUEST", "MENU", "BACK", "START", "GAME", "TWO", "ONE"]);

function roomCandidates(t, href, base) {
  const out = [];
  const u = new URL(href);
  const tail = (u.pathname.replace(new URL(base).pathname, "/").split("/").filter(Boolean).pop() || "") + "";
  for (const m of t.matchAll(/\b[A-Z0-9][A-Z0-9-]{2,10}[A-Z0-9]\b/g)) {
    const tok = m[0];
    if (STOP.has(tok) || /^\d{1,3}$/.test(tok) || tok === PASS) continue;
    if (!out.includes(tok)) out.push(tok);
  }
  for (const v of [...u.searchParams.values(), tail, decodeURIComponent(u.hash.slice(1))]) if (/^[A-Za-z0-9-]{4,12}$/.test(v) && !out.includes(v)) out.unshift(v);
  return out.slice(0, 6);
}

async function enterLobby(page, url, mode, metrics, room) {
  await page.goto(url, { waitUntil: "load", timeout: 90_000 });
  await page.waitForTimeout(1200);
  await click(page, mode === "create" ? "create|host|new (room|game)|start" : "join|enter (a )?room|have a code");
  await page.waitForTimeout(700);
  if (room) await fill(page, ROOM, "name|pass|pin", room, metrics);
  await fill(page, NAME, ROOM.replace("|\\bid\\b", "") + "|" + PASSCODE, NAMES[mode === "create" ? 0 : 1], metrics);
  await fill(page, PASSCODE, null, PASS, metrics);
  await submit(page, mode === "create" ? "create|start|continue|next|host|open" : "join|enter|continue|next|go");
  await page.waitForTimeout(1500);
}

function analyseSpin(res) {
  if (!res || res.trace.length < 5) return null;
  const tr = res.trace;
  const sign = Math.sign(tr[tr.length - 1][1]) || 1;
  const pts = tr.map(([t, a]) => [t, a * sign]);
  const total = Math.max(...pts.map((p) => p[1]));
  const moving = pts.filter((p, i) => i && Math.abs(p[1] - pts[i - 1][1]) > 0.05);
  if (!moving.length) return { total: 0 };
  const start = moving[0][0] - 20, end = moving[moving.length - 1][0];
  const at = (t) => {
    let best = pts[0];
    for (const p of pts) if (p[0] <= t) best = p;
    return best[1];
  };
  const W = 150;
  const vel = [];
  for (let t = start; t + W <= end; t += 50) vel.push((at(t + W) - at(t)) / W);
  const peak = Math.max(...vel);
  const first = vel[0] ?? 0;
  const tailV = vel.slice(-Math.max(2, Math.round(vel.length * 0.08)));
  const iMax = pts.findIndex((p) => p[1] === total);
  const final = pts[pts.length - 1][1];
  return {
    total: Math.round(total), duration: Math.round(end - start), accel: first < 0.7 * peak, decel: Math.max(...tailV.map(Math.abs)) < 0.25 * peak,
    settle: total - final >= 0.5 && iMax < pts.length - 1, peak: Math.round(peak * 1000), first: Math.round(first * 1000),
  };
}

export async function interactMobile(context, url) {
  const out = {};
  const metrics = [];
  const [a, b] = [await context.newPage(), await context.newPage()];
  const errors = [];
  for (const p of [a, b]) p.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  // A connection drop, the inputs seen so far and the brief's widths are checked however far the round got.
  const done = async () => {
    await a.bringToFront();
    out["offline"] = await attempt(async () => {
      const before = await text(a);
      await context.setOffline(true);
      await a.waitForTimeout(1500);
      const lines = newLines(before, await text(a));
      await context.setOffline(false);
      await a.waitForTimeout(1200);
      const shown = lines.filter((l) => /offline|connection|connect|internet|network/i.test(l));
      return { pass: shown.length > 0, detail: shown.length ? shown[0].slice(0, 80) : "nothing shown while offline" };
    });

    out["mobile-inputs"] = await attempt(async () => {
      const chat = await a.evaluate(() => {
        const el = document.querySelector("[data-tod-msg]");
        if (!el) return null;
        el.setAttribute("data-tod", "c");
        return true;
      });
      if (chat) {
        await click(a, "chat|message");
        await a.waitForTimeout(600);
        const m = await a.evaluate(fieldMetrics, "c");
        if (m) metrics.push({ ...m, field: "chat" });
        await a.keyboard.press("Escape");
        const close = a.locator("[data-tod-close]");
        if (await a.evaluate(sheetCover)) await close.first().click({ timeout: 3000 }).catch(() => {});
        await a.waitForTimeout(500);
      }
      if (!metrics.length) return { pass: false, detail: "no inputs measured" };
      const score = metrics.reduce((s, m) => s + ((m.height >= 44 ? 1 : 0) + (m.font >= 16 ? 1 : 0) + m.label) / 3, 0) / metrics.length;
      const bad = metrics.filter((m) => m.height < 44 || m.font < 16 || m.label < 1).map((m) => `${m.field}: ${m.height}px tall, ${m.font}px text, label ${m.label}`);
      return { pass: score >= 0.999, score, detail: bad.length ? bad.slice(0, 4).join("; ") : `${metrics.length} inputs fine` };
    });

    out["responsive"] = await attempt(async () => {
      const faults = [];
      let good = 0;
      for (const [w, h] of WIDTHS) {
        await a.setViewportSize({ width: w, height: h });
        await a.waitForTimeout(350);
        const f = await a.evaluate(layoutFaults);
        const r = await board(a);
        const onScreen = !!(r.bottle && r.spin && r.p1 && r.p2) && r.bottle.left >= -1 && r.bottle.right <= w + 1 && r.spin.bottom <= h + 1;
        if (!onScreen) f.push("bottle, spin button or a player not on the first screen");
        if (f.length) faults.push(`${w}px: ${f.slice(0, 3).join(", ")}`);
        else good++;
      }
      await a.setViewportSize({ width: 390, height: 844 });
      return { pass: good === WIDTHS.length, score: good / WIDTHS.length, detail: faults.length ? faults.slice(0, 4).join(" | ") : "all widths clean" };
    });
    if (errors.length) out.pageErrors = errors.slice(0, 5);
    delete out.calmHome;
    delete out.sheetEarly;
    delete out.sheet;
    await Promise.all([a.close(), b.close()]);
    return out;
  };

  // Lobby: create on A, join on B with each room-ID candidate until A shows B's name.
  let room = null;
  out["create-room"] = await attempt(async () => {
    await enterLobby(a, url, "create", metrics);
    const t = await text(a);
    out.calmHome = await a.evaluate(infiniteAnimations);
    const cands = roomCandidates(t, a.url(), url);
    for (const c of cands) {
      await enterLobby(b, url, "join", metrics, c);
      if ((await a.evaluate(() => document.body.textContent)).includes(NAMES[1])) {
        room = c;
        break;
      }
    }
    if (!room && a.url() !== url && a.url().replace(/\/$/, "") !== url.replace(/\/$/, "")) {
      // An invite link instead of a typed code.
      await b.goto(a.url(), { waitUntil: "load" });
      await b.waitForTimeout(1200);
      await fill(b, NAME, PASSCODE, NAMES[1], metrics);
      await fill(b, PASSCODE, null, PASS, metrics);
      if (await b.locator("[data-tod=f]").count()) await submit(b, "join|enter|continue|next|go");
      await b.waitForTimeout(1500);
      if ((await a.evaluate(() => document.body.textContent)).includes(NAMES[1])) room = new URL(a.url()).pathname.split("/").pop() || "link";
    }
    return { pass: !!room, detail: room ? `room ${room}` : `no room ID found among: ${cands.join(", ")}` };
  });
  if (!room) return done();
  out["join-room"] = await attempt(async () => {
    const [ta, tb] = [await text(a), await text(b)];
    const seen = [ta, tb].map((t) => NAMES.filter((n) => t.includes(n)).length);
    return { pass: seen[0] === 2 && seen[1] === 2, score: (seen[0] + seen[1]) / 4, detail: `names on A ${seen[0]}/2, on B ${seen[1]}/2` };
  });
  await a.bringToFront();

  const board = async (page) => {
    const vh = page.viewportSize().height;
    const r = await page.evaluate(([n1, n2, probeSrc]) => {
      const probe = new Function(`return (${probeSrc})`)();
      const rect = (n) => {
        let best = null;
        for (const el of document.querySelectorAll("body *")) {
          if (el.closest("[role=dialog],dialog,[aria-modal=true]")) continue;
          const own = [...el.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join(" ");
          if (!own.includes(n) || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
          const q = el.getBoundingClientRect();
          if (q.width && (!best || q.width * q.height < best.width * best.height)) best = q;
        }
        return best && { top: best.top, bottom: best.bottom, cy: best.top + best.height / 2 };
      };
      const spin = [...document.querySelectorAll("button,[role=button]")].find((x) => /spin/i.test(x.innerText || x.getAttribute("aria-label") || "") && x.getBoundingClientRect().width > 0);
      const s = spin?.getBoundingClientRect();
      return { p1: rect(n1), p2: rect(n2), bottle: probe("rect"), spin: s && { top: s.top, bottom: s.bottom, cy: s.top + s.height / 2 } };
    }, [NAMES[0], NAMES[1], bottleProbe.toString()]);
    return { ...r, vh };
  };

  out["top-bar"] = await attempt(async () => {
    const r = await a.evaluate((room) => {
      const top = innerHeight * 0.2;
      const find = (re) =>
        [...document.querySelectorAll("body *")].some((el) => {
          const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ");
          const q = el.getBoundingClientRect();
          return re.test(own) && q.width > 0 && q.top < top && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
        });
      const roundText = [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().top < top && el.checkVisibility()).map((el) => el.innerText).join("\n");
      return {
        logo: find(/truth|dare/i) || [...document.querySelectorAll("img,svg")].some((i) => i.getBoundingClientRect().top < top && i.getBoundingClientRect().width > 8),
        room: find(new RegExp(room.replace(/[^A-Za-z0-9]/g, ".?"), "i")),
        round: /round\s*:?\s*#?\s*1\b|\br(ound)?\s*1\s*(\/|of)/i.test(roundText),
      };
    }, room);
    const n = [r.logo, r.room, r.round].filter(Boolean).length;
    return { pass: n === 3, score: n / 3, detail: `logo ${r.logo}, room ID ${r.room}, round 1 ${r.round}` };
  });

  out["vertical-layout"] = await attempt(async () => {
    const r = await board(a);
    if (!r.p1 || !r.p2 || !r.bottle || !r.spin) return { pass: false, detail: `found: p1 ${!!r.p1}, p2 ${!!r.p2}, bottle ${!!r.bottle}, spin ${!!r.spin}` };
    const by = r.bottle.top + r.bottle.height / 2;
    const checks = { p1Above: r.p1.cy < r.bottle.top + 4, p2Below: r.p2.cy > r.bottle.bottom - 4, spinBetween: r.spin.cy > by && r.spin.cy < r.p2.cy, fits: Math.max(r.p2.bottom, r.spin.bottom) <= r.vh + 1 && r.p1.top >= 0 };
    const n = Object.values(checks).filter(Boolean).length;
    return { pass: n === 4, score: n / 4, detail: JSON.stringify(checks) };
  });

  out["bottle-central"] = await attempt(async () => {
    const r = await a.evaluate((probeSrc) => {
      const box = new Function(`return (${probeSrc})`)()("rect");
      if (!box) return null;
      const clash = [...document.querySelectorAll("button,a,input,h1,h2,h3,p,li,label")].filter((el) => {
        const q = el.getBoundingClientRect();
        if (!q.width || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) || el.closest("[inert],[aria-hidden=true]")) return false;
        const w = Math.min(q.right, box.right) - Math.max(q.left, box.left), h = Math.min(q.bottom, box.bottom) - Math.max(q.top, box.top);
        return w > 4 && h > 4;
      }).length;
      return { size: Math.max(box.width, box.height), offset: Math.abs(box.left + box.width / 2 - innerWidth / 2), vw: innerWidth, clash };
    }, bottleProbe.toString());
    if (!r) return { pass: false, detail: "no bottle illustration found" };
    const checks = { large: r.size >= 0.45 * r.vw, centred: r.offset <= 0.08 * r.vw, clear: r.clash === 0 };
    const n = Object.values(checks).filter(Boolean).length;
    return { pass: n === 3, score: n / 3, detail: `${JSON.stringify(checks)} size ${Math.round(r.size)}px, ${r.clash} elements over it` };
  });

  out["button-transitions"] = await attempt(async () => {
    const durations = await a.evaluate(() =>
      [...document.querySelectorAll("button")].filter((x) => x.getBoundingClientRect().width > 0).map((x) => {
        const cs = getComputedStyle(x);
        const ds = cs.transitionDuration.split(",").map((s) => parseFloat(s) * (s.includes("ms") ? 1 : 1000));
        const props = cs.transitionProperty.split(",").map((s) => s.trim());
        return Math.max(...ds.filter((_, i) => props[i % props.length] !== "none"), 0);
      }),
    );
    const ok = durations.filter((ms) => ms >= 140 && ms <= 210).length;
    return { pass: durations.length > 0 && ok === durations.length, score: durations.length ? ok / durations.length : 0, detail: `durations ms: ${durations.join(", ")}` };
  });

  out["calm-at-rest"] = await attempt(async () => {
    const n = await a.evaluate(infiniteAnimations);
    return { pass: n === 0 && out.calmHome === 0, score: (n === 0 ? 0.5 : 0) + (out.calmHome === 0 ? 0.5 : 0), detail: `looping animations: start screen ${out.calmHome}, game screen ${n}` };
  });

  out["focused-board"] = await attempt(async () => {
    const n = await a.evaluate(
      () => [...document.querySelectorAll("button,a,[role=button],input,select")].filter((el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !el.closest("[inert],[aria-hidden=true]")).length,
    );
    return { pass: n <= 8, detail: `${n} visible controls` };
  });

  // Spin from B while both phones record the bottle's rotation.
  const beforeA = await text(a), beforeB = await text(b);
  const traces = Promise.all([a, b].map((p) => p.evaluate(traceSpin, [bottleProbe.toString(), angleOf.toString(), 11000]).catch(() => null)));
  await b.waitForTimeout(150);
  const spun = await click(b, "spin").catch(() => false);
  const [ra, rb] = await traces;
  const sa = analyseSpin(ra), sb = analyseSpin(rb);
  out["spin-rotations"] = { pass: spun && !!sa && sa.total >= 720, score: spun && sa ? Math.min(1, sa.total / 720) : 0, detail: spun ? `turned ${sa?.total ?? 0} deg over ${sa?.duration ?? 0} ms` : "no spin button" };
  out["spin-easing"] = sa?.total
    ? { pass: sa.accel && sa.decel && sa.settle, score: [sa.accel, sa.decel, sa.settle].filter(Boolean).length / 3, detail: `accelerates ${sa.accel} (start ${sa.first} vs peak ${sa.peak} deg/s), decelerates ${sa.decel}, settles ${sa.settle}` }
    : { pass: false, detail: "no rotation measured" };
  out["spin-sync"] = await attempt(async () => {
    if (!ra || !rb || !sa?.total) return { pass: false, detail: "no rotation measured" };
    const diff = Math.abs(((ra.final - rb.final + 540) % 360) - 180);
    const axis = Math.min(ra.final % 90, 90 - (ra.final % 90));
    return { pass: diff <= 6 && axis <= 12, score: (diff <= 6 ? 0.5 : 0) + (axis <= 12 ? 0.5 : 0), detail: `final A ${Math.round(ra.final)}, B ${Math.round(rb.final)} deg` };
  });

  // The picked phone is the one offering truth or dare.
  let picked = null, other = null;
  out["selected-player"] = await attempt(async () => {
    for (let i = 0; i < 12 && !picked; i++) {
      const offers = [];
      for (const p of [a, b]) offers.push((await p.evaluate(tagButtons, ["^\\s*truth\\b.{0,24}$", "t"])) > 0 && (await p.evaluate(tagButtons, ["^\\s*dare\\b.{0,24}$", "d"])) > 0);
      if (offers[0] !== offers[1]) [picked, other] = offers[0] ? [a, b] : [b, a];
      else if (offers[0]) return { pass: false, detail: "both phones offer truth or dare" };
      else await a.waitForTimeout(500);
    }
    if (!picked) return { pass: false, detail: "no phone offers truth or dare after the spin" };
    const name = NAMES[picked === a ? 0 : 1];
    const fresh = [newLines(beforeA, await text(a)), newLines(beforeB, await text(b))];
    const named = fresh.map((lines) => lines.some((l) => l.includes(name)) || lines.some((l) => /\byou\b/i.test(l)));
    // The other phone must name the picked player; the picked phone may say "you".
    const otherNames = fresh[picked === a ? 1 : 0].some((l) => l.includes(name));
    return { pass: otherNames && named.every(Boolean), score: 0.5 + (otherNames ? 0.5 : 0), detail: `picked ${name}; other phone names them ${otherNames}` };
  });
  if (!picked) return done();
  const pickedName = NAMES[picked === a ? 0 : 1];

  const entryVisible = (page) =>
    page.evaluate(() =>
      [...document.querySelectorAll("textarea,input[type=text],input:not([type])")].some((el) => {
        const t = [...(el.labels || [])].map((l) => l.innerText).join(" ") + (el.placeholder || "") + (el.getAttribute("aria-label") || "") + el.name;
        return el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !/message|chat/i.test(t) && !el.closest("[role=dialog],dialog,[aria-modal=true],[inert]");
      }),
    );
  const choiceVisible = (page) => page.evaluate(tagButtons, ["^\\s*(truth|dare)\\b.{0,24}$", "x"]).then((n) => n > 0);
  const stepScreens = [!(await entryVisible(picked)) && !(await entryVisible(other))];

  out["stage-transition"] = await attempt(async () => {
    await picked.locator("[data-todb=d]").first().click({ timeout: 4000 });
    const anims = await picked.evaluate(async () => {
      let max = 0;
      for (let i = 0; i < 6; i++) {
        max = Math.max(max, document.getAnimations().filter((x) => x.playState === "running").length);
        await new Promise((r) => setTimeout(r, 40));
      }
      return max;
    });
    return { pass: anims > 0, detail: `${anims} running animations or transitions after choosing` };
  });

  out["question-entry"] = await attempt(async () => {
    await other.bringToFront();
    for (let i = 0; i < 10 && !(await entryVisible(other)); i++) await other.waitForTimeout(400);
    stepScreens.push(!(await choiceVisible(other)));
    const ok = await other.evaluate(tagField, ["dare|question|truth|challenge|ask|write|type", "message|chat|name|pass|room", "f"]);
    if (!ok) return { pass: false, detail: "no question-entry field on the other phone" };
    const m = await other.evaluate(fieldMetrics, "f");
    metrics.push({ ...m, field: "question" });
    return { pass: true, detail: "entry field shown" };
  });
  out["one-step-per-screen"] = { pass: stepScreens.every(Boolean), score: stepScreens.filter(Boolean).length / 2, detail: `choice screen has no entry field: ${stepScreens[0]}, entry screen has no choice buttons: ${stepScreens[1]}` };
  if (!out["question-entry"].pass) return done();

  out["question-keyboard"] = await attempt(async () => {
    await other.setViewportSize({ width: 390, height: 470 });
    await other.locator("[data-tod=f]").focus();
    await other.locator("[data-tod=f]").fill(DARE);
    await other.waitForTimeout(700);
    const tagged = await other.evaluate(() => {
      const f = document.querySelector("[data-tod=f]");
      const btn = f.form?.querySelector("button[type=submit],button:not([type]),input[type=submit]") ||
        [...document.querySelectorAll("button")].find((x) => /send|submit|ask|done|confirm|dare|question/i.test(x.innerText) && x.getBoundingClientRect().width > 0);
      if (btn) btn.setAttribute("data-tod-submit", "1");
      return !!btn;
    });
    const visible = tagged && (await other.evaluate(inView, "[data-tod-submit]"));
    return { pass: visible, detail: tagged ? `submit visible with 470px viewport: ${visible}` : "no submit button" };
  });
  await other.setViewportSize({ width: 390, height: 844 });

  out["challenge-shown"] = await attempt(async () => {
    const sub = other.locator("[data-tod-submit]");
    if (await sub.count()) await sub.first().click({ timeout: 4000 });
    else await other.locator("[data-tod=f]").press("Enter");
    await picked.bringToFront();
    for (let i = 0; i < 10; i++) {
      if ((await text(picked)).includes(DARE)) return { pass: true, detail: "dare shown to the picked player" };
      await picked.waitForTimeout(400);
    }
    return { pass: false, detail: "the written dare never appeared on the picked phone" };
  });

  out["refresh-persist"] = await attempt(async () => {
    await picked.reload({ waitUntil: "load" });
    await picked.waitForTimeout(1800);
    const t = await text(picked);
    const lobby = (await picked.evaluate(tagButtons, ["^\\s*(create|join)\\b", "l"])) > 0;
    return { pass: t.includes(DARE) && !lobby, score: (t.includes(DARE) ? 0.5 : 0) + (lobby ? 0 : 0.5), detail: `dare still shown ${t.includes(DARE)}, back at the start screen ${lobby}` };
  });

  out["next-round"] = await attempt(async () => {
    const clicked = await click(picked, "done|complete|answered|next|finish|continue|did it|end turn");
    await picked.waitForTimeout(1200);
    const round2 = async (p) => /round\s*:?\s*#?\s*2\b|\br(ound)?\s*2\s*(\/|of)/i.test(await text(p));
    const [r1, r2] = [await round2(a), await round2(b)];
    return { pass: clicked && r1 && r2, score: (r1 ? 0.5 : 0) + (r2 ? 0.5 : 0), detail: `done button ${clicked}, round 2 on A ${r1}, on B ${r2}` };
  });

  // Chat on A.
  await a.bringToFront();
  out["chat-sheet"] = await attempt(async () => {
    if (!(await click(a, "chat|message"))) return { pass: false, detail: "no chat button" };
    await a.waitForTimeout(40);
    const early = await a.evaluate(sheetRect);
    await a.waitForTimeout(700);
    const r = await a.evaluate(sheetRect);
    if (!r) return { pass: false, detail: "no chat sheet opened" };
    out.sheetEarly = early;
    out.sheet = r;
    const share = r.height / r.vh;
    const size = share >= 0.75 && share <= 0.95, anchored = Math.abs(r.bottom - r.vh) <= 2;
    return { pass: size && anchored, score: (size ? 0.5 : 0) + (anchored ? 0.5 : 0), detail: `${Math.round(share * 100)}% of the screen, bottom gap ${Math.round(r.vh - r.bottom)}px` };
  });
  if (!out.sheet) return done();
  out["chat-open-motion"] = (() => {
    const e = out.sheetEarly, r = out.sheet;
    const moved = !e || e.top - r.top > 8 || e.transform !== r.transform || Number(e.opacity) < Number(r.opacity) - 0.05;
    return { pass: moved, detail: e ? `40ms after opening: top ${Math.round(e.top)} vs ${Math.round(r.top)}, opacity ${e.opacity}` : "sheet not yet present 40ms after the click" };
  })();

  out["chat-autoscroll"] = await attempt(async () => {
    const input = a.locator("[data-tod-msg]");
    if (!(await input.count())) return { pass: false, detail: "no message input" };
    for (let i = 1; i <= CHAT_MESSAGES; i++) {
      await input.fill(`Chat line ${i} from ${NAMES[0]}`);
      await input.press("Enter");
      await a.waitForTimeout(120);
    }
    await a.waitForTimeout(800);
    const r = await a.evaluate((last) => {
      const s = document.querySelector("[data-tod-scroll]");
      const msg = [...document.querySelectorAll("[data-tod-sheet] *")].find((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.includes(last)));
      const m = msg?.getBoundingClientRect(), b = s?.getBoundingClientRect();
      return { overflow: s ? s.scrollHeight > s.clientHeight : false, atEnd: s ? s.scrollTop + s.clientHeight >= s.scrollHeight - 6 : false, lastVisible: !!(m && b && m.bottom <= b.bottom + 2 && m.top >= b.top - 2) };
    }, `Chat line ${CHAT_MESSAGES} from`);
    return { pass: r.overflow && r.atEnd && r.lastVisible, score: [r.overflow, r.atEnd, r.lastVisible].filter(Boolean).length / 3, detail: JSON.stringify(r) };
  });

  out["chat-controls"] = await attempt(async () => {
    const r = await a.evaluate(sheetRect);
    const checks = { closeAtTop: r.closeTop !== null && r.closeTop <= Math.max(80, r.height * 0.15), scrollable: r.scroller, inputAtBottom: r.inputBottomGap !== null && r.inputBottomGap <= 90 };
    const n = Object.values(checks).filter(Boolean).length;
    return { pass: n === 3, score: n / 3, detail: JSON.stringify(checks) };
  });

  out["chat-sync"] = await attempt(async () => {
    await b.waitForTimeout(500);
    const got = await b.evaluate((m) => document.body.textContent.includes(m), `Chat line ${CHAT_MESSAGES} from`);
    return { pass: got, detail: got ? "message reached the other phone" : "message not on the other phone" };
  });

  out["chat-keyboard"] = await attempt(async () => {
    await a.setViewportSize({ width: 390, height: 470 });
    await a.locator("[data-tod-msg]").focus();
    await a.waitForTimeout(600);
    const send = await a.evaluate(() => {
      const sheet = document.querySelector("[data-tod-sheet]");
      const btn = [...sheet.querySelectorAll("button,input[type=submit]")].filter((x) => !x.hasAttribute("data-tod-close") && x.getBoundingClientRect().width > 0).pop();
      if (btn) btn.setAttribute("data-tod-send", "1");
      return !!btn;
    });
    const input = await a.evaluate(inView, "[data-tod-msg]");
    const button = send && (await a.evaluate(inView, "[data-tod-send]"));
    const closeShown = await a.evaluate(inView, "[data-tod-close]");
    return { pass: input && button && closeShown, score: [input, button, closeShown].filter(Boolean).length / 3, detail: `470px viewport: input ${input}, send ${button}, close ${closeShown}` };
  });
  await a.setViewportSize({ width: 390, height: 844 });
  await a.waitForTimeout(300);

  out["chat-close"] = await attempt(async () => {
    const close = a.locator("[data-tod-close]");
    if (!(await close.count())) return { pass: false, detail: "no close button" };
    await close.first().click({ timeout: 4000 });
    await a.waitForTimeout(800);
    const cover = await a.evaluate(sheetCover);
    const spin = await a.evaluate(tagButtons, ["spin", "s"]);
    return { pass: cover < 0.1 && spin > 0, score: (cover < 0.1 ? 0.5 : 0) + (spin > 0 ? 0.5 : 0), detail: `sheet covers ${Math.round(cover * 100)}% after closing, spin button reachable ${spin > 0}` };
  });

  return done();
}
