// Task-specific part of the verifier: the Pebble Pop brief (a complete React + Vite + TypeScript + Phaser 3 match-3 drop game
// with every screen, 40 levels in four chapters, three boosters, persistence and settings). grade.mjs, probe.mjs, lib.mjs and
// test.sh are shared copies of tasks/verifier/; only this file is per task. The checks drive the game the way a player would:
// they find controls by their visible label or aria-label, never by the golden reference's class names or routes.
import { attempt, freshPage, newLines } from "./lib.mjs";

const CHAPTERS = ["mossy grove", "frost hollow", "blossom creek", "autumn ridge"];
const MENU_ITEMS = [/\bplay\b/, /levels?|map/, /daily/, /shop|store/, /achievement/, /settings?|options/];

// Recorded from before any page script runs: permission prompts the brief rules out, and any audio the game produces.
const PROBES = () => {
  window.__deb = { permissions: [], audio: 0 };
  const flag = (name) => () => { window.__deb.permissions.push(name); return Promise.reject(new Error("blocked")); };
  try { if (window.Notification) { window.Notification.requestPermission = flag("notifications"); } } catch {}
  try { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition = flag("geolocation"); navigator.geolocation.watchPosition = flag("geolocation"); } } catch {}
  try { if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = flag("camera/microphone"); } catch {}
  for (const name of ["AudioContext", "webkitAudioContext"]) {
    const Orig = window[name];
    if (!Orig) continue;
    window[name] = class extends Orig { constructor(...a) { super(...a); window.__deb.audio++; } };
  }
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) { window.__deb.audio++; return play.apply(this, a); };
};

const fraction = (found, total) => found / Math.max(1, total);

/** Each item: {id, desc, score in [0,1], detail}. */
export const GATE = { minText: 20, minHeight: 400 };

export function requirements(views) {
  const pages = views.desktop.pages;
  const home = pages[0].facts;
  const allText = pages.map((p) => p.facts.text).join("\n").toLowerCase();
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);

  add("name", "Pebble Pop name shown on the first screen", /pebble\s*pop/i.test(`${home.text} ${home.title}`) ? 1 : 0);
  const labels = act.menu?.labels || [];
  fromAct("main-menu", "Main menu offers Play, Levels, Daily Challenge, Shop, Achievements and Settings", "menu");
  fromAct("phaser", "Gameplay is rendered by Phaser 3 in a canvas", "phaser");
  fromAct("level-intro", "A level introduction with level number, objective, move limit and a Start button comes before play", "levelIntro");
  fromAct("hud", "Gameplay shows level, pause, objective, moves, score and the next pebble", "hud");
  fromAct("drop", "Tapping a column drops a pebble and consumes one move", "drop");
  fromAct("double-input", "A quick double tap during the drop animation consumes only one move", "doubleInput");
  fromAct("boosters", "Hammer, Swap and Bomb booster controls with inventory counts", "boosters");
  fromAct("booster-cancel", "A selected booster can be cancelled without spending it", "boosterCancel");
  fromAct("pause", "Pause offers Resume, Restart, Settings and Exit", "pause");
  fromAct("exit-confirm", "Exiting from the pause menu asks for confirmation first", "exitConfirm");
  fromAct("forty-levels", "Level selection reaches 40 numbered levels", "levels");
  add("chapters", "Four chapters: Mossy Grove, Frost Hollow, Blossom Creek, Autumn Ridge", fraction(CHAPTERS.filter((c) => (allText + (act.levels?.text || "")).includes(c)).length, CHAPTERS.length));
  fromAct("locked-levels", "A new player sees later levels locked", "locked");
  fromAct("settings", "Settings has music, sound, vibration and language controls", "settings");
  fromAct("settings-independent", "Music and sound toggle independently and persist after reload", "settingsPersist");
  add("help-pages", "How to Play and About are available", fraction([/how to play/, /\babout\b/].filter((re) => re.test(allText) || labels.some((l) => re.test(l))).length, 2));
  fromAct("shop", "Shop sells the boosters for in-game currency and the purchase persists", "shop");
  add("no-real-money", "No real-money purchase infrastructure", /(\$|€|£)\s?\d|\b\d+(\.\d\d)?\s?(usd|eur)\b|credit card|checkout/i.test(allText) ? 0 : 1);
  fromAct("daily", "Daily Challenge screen with a way to start it", "daily");
  fromAct("achievements", "Achievements screen lists several achievements", "achievements");
  fromAct("art-formats", "Illustrations load as WebP and transparent sprites as PNG", "formats");
  fromAct("audio", "The game produces sound once the player interacts", "audio");
  fromAct("no-permissions", "No notification, location, camera or microphone permission requests", "permissions");
  fromAct("mobile-controls", "Phone gameplay controls fit the screen without overlapping", "mobileControls");
  return items;
}

/** In-page: marks the first visible control whose label matches `src` with data-deb=1; returns its label or null. */
function markControl([src, skip]) {
  const re = new RegExp(src, "i");
  const skipRe = skip ? new RegExp(skip, "i") : null;
  document.querySelectorAll("[data-deb]").forEach((e) => e.removeAttribute("data-deb"));
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 4 && r.height > 4 && s.visibility !== "hidden" && s.opacity !== "0" && !e.disabled; };
  const label = (e) => [e.innerText, e.getAttribute("aria-label"), e.getAttribute("title"), e.value, ...[...e.querySelectorAll("img[alt]")].map((i) => i.alt)].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const els = [...document.querySelectorAll("button, a[href], [role=button], [role=switch], [role=menuitem], input[type=checkbox], input[type=button], [onclick]")].filter(vis);
  const dialog = [...document.querySelectorAll("dialog[open], [role=dialog], [role=alertdialog], [aria-modal=true]")].filter(vis).pop();
  const pool = dialog ? els.filter((e) => dialog.contains(e)) : els;
  const el = pool.find((e) => re.test(label(e)) && !(skipRe && skipRe.test(label(e))));
  if (!el) return null;
  el.setAttribute("data-deb", "1");
  return label(el).slice(0, 60);
}

async function click(page, re, skip) {
  const found = await page.evaluate(markControl, [re.source, skip?.source]);
  if (!found) return null;
  // Menus that pulse forever never count as stable, and some lay a transparent panel over their buttons; a player still taps them.
  const target = page.locator("[data-deb='1']").first();
  await target.click({ timeout: 4000 }).catch(() => target.click({ force: true, timeout: 4000 })).catch(() => target.evaluate((e) => e.click())).catch(() => {});
  await page.waitForTimeout(900);
  return found;
}

const bodyText = (page) => page.evaluate(() => document.body.innerText);

/** In-page: the play area, the largest canvas or else the largest element laid out as a grid of seven or more cells or columns. */
function boardBox() {
  const canvas = bigCanvas();
  if (canvas) return canvas;
  const grids = [...document.querySelectorAll("body *")].map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ e, r }) => {
    if (getComputedStyle(e).pointerEvents === "none") return false;
    if (r.width < 200 || r.height < 200 || r.width > innerWidth * 0.95) return false;
    const kids = [...e.children].map((c) => c.getBoundingClientRect()).filter((k) => k.width > 4 && k.height > 4);
    return kids.length >= 7 && kids.every((k) => k.width * k.height < (r.width * r.height) / 5);
  });
  grids.sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
  if (!grids.length) return null;
  const { r } = grids[0];
  return { x: r.x, y: r.y, w: r.width, h: r.height };

  function bigCanvas() {
    const cs = [...document.querySelectorAll("canvas")].map((c) => ({ c, r: c.getBoundingClientRect() })).filter(({ r }) => r.width >= 200 && r.height >= 200);
    cs.sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
    return cs.length ? { x: cs[0].r.x, y: cs[0].r.y, w: cs[0].r.width, h: cs[0].r.height } : null;
  }
}

/** In-page: the largest visible canvas, which a Phaser game draws into. */
function bigCanvas() {
  const cs = [...document.querySelectorAll("canvas")].map((c) => ({ c, r: c.getBoundingClientRect() })).filter(({ r }) => r.width >= 200 && r.height >= 200);
  cs.sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
  if (!cs.length) return null;
  const { r } = cs[0];
  return { x: r.x, y: r.y, w: r.width, h: r.height };
}

function movesLeft(text) {
  const m = text.match(/moves?(?:\s+left)?\s*[:\n ]\s*(\d+)/i) || text.match(/(\d+)\s*\n?\s*moves?\b(?!\s*limit)/i);
  return m ? Number(m[1]) : null;
}

/** From the home page, follows Play (and the level introduction's Start) until a game board with a move counter is on screen. */
async function openGame(page) {
  const steps = [];
  let intro = null;
  // A level introduction can show a board preview and the move limit; it is not the game while a Start control is up.
  const inGame = async () => !!(await page.evaluate(boardBox)) && movesLeft(await bodyText(page)) !== null
    && !(await page.evaluate(markControl, [/^(▶\s*)?(start|begin)\b/.source]));
  for (let i = 0; i < 4; i++) {
    if (await inGame()) return { steps, intro };
    const before = await bodyText(page);
    const label = i === 0
      ? await click(page, /^(▶\s*)?play\b|play now|start game|^start/, /daily|how to/)
      : (await click(page, /^(▶\s*)?(start|begin|go)\b/, /daily|how to/)) || (await click(page, /^(▶\s*)?play\b/, /daily|how to/));
    if (!label) break;
    await page.waitForTimeout(1500);
    steps.push(label);
    if (!intro && !(await inGame())) intro = before === (await bodyText(page)) ? null : await bodyText(page);
  }
  return (await inGame()) ? { steps, intro } : null;
}

/** Clicks the canvas column by column (top of the jar first, then lower) until the move counter drops; returns that point. */
async function dropSomewhere(page, box, skipX = null) {
  const before = movesLeft(await bodyText(page));
  // Inside the jar first; some games take the tap on a strip just above the jar's columns.
  for (const fy of [0.5, 0.3, 0.7, 0.02, -0.05]) {
    for (let col = 0; col < 7; col++) {
      const x = box.x + box.w * (0.2 + (0.6 * col) / 6);
      if (skipX !== null && Math.abs(x - skipX) < box.w * 0.05) continue;
      const y = box.y + box.h * fy;
      await page.mouse.click(x, y);
      await page.waitForTimeout(2500);
      const after = movesLeft(await bodyText(page));
      if (after !== null && before !== null && after < before) return { x, y, before, after };
    }
  }
  return { before, after: movesLeft(await bodyText(page)) };
}

/** Opens the first screen and waits past a splash: taps "tap to start" style prompts until a Play control shows. */
async function openHome(context, url) {
  const page = await freshPage(context, url);
  await passSplash(page);
  return page;
}

async function passSplash(page) {
  for (let i = 0; i < 10; i++) {
    const label = await page.evaluate(markControl, [/^(▶\s*)?play\b|tap to|click to|press (any|to)|tap anywhere|touch to/.source]);
    if (label && !/tap|click|press|touch/i.test(label)) break;
    if (label) await click(page, /tap to|click to|press (any|to)|tap anywhere|touch to/);
    else if (i === 5) await page.mouse.click(page.viewportSize().width / 2, page.viewportSize().height / 2);
    await page.waitForTimeout(800);
  }
}

/** Reloads the page and, when the reload lands back on the first screen, returns to the screen `re` opens. */
async function reopen(page, re, ready) {
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(2500);
  if (await ready()) return;
  await passSplash(page);
  await click(page, re);
  await page.waitForTimeout(800);
}

async function gamePage(context, url) {
  const page = await openHome(context, url);
  const game = await openGame(page).catch(() => null);
  return { page, game };
}

/** Finds a home control matching `re`, follows it and returns the resulting screen's text. */
async function openScreen(context, url, re) {
  const page = await openHome(context, url);
  const label = await click(page, re);
  if (!label) { await page.close(); return null; }
  await page.waitForTimeout(800);
  return { page, label };
}

function boosterCounts(text) {
  return Object.fromEntries(["hammer", "swap", "bomb"].map((b) => {
    const m = text.match(new RegExp(`${b}\\D{0,12}(\\d+)|(\\d+)\\D{0,6}${b}`, "i"));
    return [b, m ? Number(m[1] ?? m[2]) : null];
  }));
}

/** In-page: visible booster controls' labels (text, aria-label or image alt naming hammer, swap or bomb). */
function boosterLabels() {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight; };
  const label = (e) => [e.innerText, e.getAttribute("aria-label"), e.getAttribute("title"), ...[...e.querySelectorAll("img[alt]")].map((i) => i.alt)].filter(Boolean).join(" ");
  return [...document.querySelectorAll("button, [role=button]")].filter(vis).map(label).filter((l) => /hammer|swap|bomb/i.test(l));
}

/** In-page: a pressed or selected state on any control naming the booster. */
function boosterSelected(name) {
  return [...document.querySelectorAll("button, [role=button]")].some((e) => {
    const l = `${e.innerText} ${e.getAttribute("aria-label") || ""}`;
    return new RegExp(name, "i").test(l) && (e.getAttribute("aria-pressed") === "true" || e.getAttribute("aria-checked") === "true" || /selected|active/i.test(e.className));
  });
}

export async function interactDesktop(context, url) {
  await context.addInitScript(PROBES);
  const imageTypes = new Set();
  context.on("response", (r) => {
    const t = r.headers()["content-type"] || "";
    const u = r.url().toLowerCase().split("?")[0];
    if (/image\/webp/.test(t) || u.endsWith(".webp")) imageTypes.add("webp");
    if (/image\/png/.test(t) || u.endsWith(".png")) imageTypes.add("png");
  });
  const out = {};

  out.menu = await attempt(async () => {
    const page = await openHome(context, url);
    const labels = await page.evaluate(() => [...document.querySelectorAll("a, button, [role=button]")].filter((e) => e.getBoundingClientRect().width > 4).map((e) => `${e.innerText} ${e.getAttribute("aria-label") || ""}`.replace(/\s+/g, " ").trim().toLowerCase()));
    await page.close();
    const found = MENU_ITEMS.filter((re) => labels.some((l) => re.test(l)));
    return { score: fraction(found.length, MENU_ITEMS.length), detail: `${found.length}/${MENU_ITEMS.length}`, labels };
  });

  out.levelIntro = await attempt(async () => {
    const page = await openHome(context, url);
    const game = await openGame(page);
    await page.close();
    if (!game) return { pass: false, detail: "Play never reached a game board with a move counter" };
    const t = game.intro || "";
    const parts = [/level\s*\d+/i.test(t), /objective|goal|collect|clear|target/i.test(t), /moves?/i.test(t), game.steps.slice(1).some((s) => /start|play|begin|go/i.test(s))];
    return { score: fraction(parts.filter(Boolean).length, 4), detail: `steps: ${game.steps.join(" > ")}; intro parts ${parts.map(Number).join("")}` };
  });

  {
    const { page, game } = await gamePage(context, url);
    try {
      out.phaser = await attempt(async () => {
        if (!game) return { pass: false, detail: "no game screen" };
        if (!(await page.evaluate(bigCanvas))) return { pass: false, detail: "the game board is not drawn in a canvas" };
        const srcs = await page.evaluate(() => [...document.scripts].map((s) => s.src).filter(Boolean));
        let found = await page.evaluate(() => !!(window.Phaser || window.__PHASER_GAME__ || window.game?.scene));
        for (const s of srcs) if (!found) found = /Phaser v|Phaser\.Game|phaser3|PHASER/.test(await (await page.request.get(s)).text());
        return { pass: found, detail: found ? "Phaser found in the game bundle" : `no Phaser in ${srcs.length} scripts` };
      });
      const text = game ? await bodyText(page) : "";
      out.hud = await attempt(async () => {
        if (!game) return { pass: false, detail: "no game screen" };
        const pause = await page.evaluate(markControl, [/pause|menu|❚❚|ii\b/.source]);
        const parts = { level: /\b(level|lvl?\.?)\s*\d+/i.test(text), pause: !!pause, objective: /\d+\s*\/\s*\d+|collect|clear|goal|objective/i.test(text), moves: movesLeft(text) !== null, score: /score/i.test(text), next: /next/i.test(text) };
        const ok = Object.entries(parts).filter(([, v]) => v).map(([k]) => k);
        return { score: fraction(ok.length, 6), detail: `found ${ok.join(", ")}` };
      });
      const box = game ? await page.evaluate(boardBox) : null;
      let first = null;
      out.drop = await attempt(async () => {
        if (!box) return { pass: false, detail: "no game board" };
        const clip = { x: box.x, y: box.y, width: box.w, height: box.h };
        const shotBefore = await page.screenshot({ clip });
        first = await dropSomewhere(page, box);
        const changed = !(await page.screenshot({ clip })).equals(shotBefore);
        const one = first.x !== undefined && first.before - first.after === 1;
        return { score: (one ? 0.7 : 0) + (changed ? 0.3 : 0), detail: `moves ${first.before} -> ${first.after}, canvas ${changed ? "redrawn" : "unchanged"}` };
      });
      out.doubleInput = await attempt(async () => {
        if (!first?.x) return { pass: false, detail: "no successful drop to repeat" };
        const before = movesLeft(await bodyText(page));
        const x = first.x + (first.x > box.x + box.w / 2 ? -1 : 1) * box.w * 0.2;
        await page.mouse.click(x, first.y);
        await page.mouse.click(x, first.y);
        await page.waitForTimeout(3000);
        const after = movesLeft(await bodyText(page));
        return { pass: before - after === 1, detail: `double tap: moves ${before} -> ${after}` };
      });
      out.boosters = await attempt(async () => {
        if (!game) return { pass: false, detail: "no game screen" };
        const found = await page.evaluate(boosterLabels);
        const kinds = ["hammer", "swap", "bomb"].filter((k) => found.some((l) => new RegExp(k, "i").test(l)));
        const counts = boosterCounts(found.join("\n"));
        const counted = kinds.filter((k) => counts[k] !== null);
        return { score: (kinds.length + counted.length) / 6, detail: `controls ${kinds.join(", ")}; counts ${JSON.stringify(counts)}` };
      });
      out.boosterCancel = await attempt(async () => {
        if (!game) return { pass: false, detail: "no game screen" };
        const before = await bodyText(page);
        const countBefore = boosterCounts((await page.evaluate(boosterLabels)).join("\n")).hammer;
        if (!(await click(page, /hammer/))) return { pass: false, detail: "no hammer control" };
        const selected = (await page.evaluate(boosterSelected, "hammer")) || newLines(before, await bodyText(page)).length > 0;
        let cancelled = await click(page, /cancel/);
        if (!cancelled) { await page.keyboard.press("Escape"); await page.waitForTimeout(600); }
        if (await page.evaluate(boosterSelected, "hammer")) { cancelled = await click(page, /hammer/); }
        const stillSelected = await page.evaluate(boosterSelected, "hammer");
        const countAfter = boosterCounts((await page.evaluate(boosterLabels)).join("\n")).hammer;
        const kept = countBefore !== null && countAfter === countBefore;
        return { score: (selected ? 0.4 : 0) + (!stillSelected && selected ? 0.3 : 0) + (kept ? 0.3 : 0), detail: `selected ${selected}, deselected ${!stillSelected}, count ${countBefore} -> ${countAfter}` };
      });
      out.pause = await attempt(async () => {
        if (!game) return { pass: false, detail: "no game screen" };
        const before = await bodyText(page);
        if (!(await click(page, /pause|menu|❚❚/))) return { pass: false, detail: "no pause control" };
        const added = newLines(before, await bodyText(page)).join("\n");
        const labels = await page.evaluate(() => [...document.querySelectorAll("button, a, [role=button]")].map((e) => `${e.innerText} ${e.getAttribute("aria-label") || ""}`).join("\n"));
        const parts = [/resume|continue/i, /restart|retry/i, /settings?|options/i, /exit|quit|leave|home|map/i].filter((re) => re.test(added) || re.test(labels));
        return { score: fraction(parts.length, 4), detail: `pause shows ${parts.length}/4 (${added.slice(0, 80).replace(/\n/g, " | ")})` };
      });
      out.exitConfirm = await attempt(async () => {
        if (!game) return { pass: false, detail: "no game screen" };
        const path = await page.evaluate(() => location.href);
        const before = await bodyText(page);
        const label = await click(page, /exit|quit|leave/);
        if (!label) return { pass: false, detail: "no exit control in the pause menu" };
        const stayed = (await page.evaluate(() => location.href)) === path && !!(await page.evaluate(boardBox));
        const asked = newLines(before, await bodyText(page)).some((l) => /sure|confirm|lose|progress|\?/i.test(l));
        return { pass: stayed && asked, detail: `after "${label}": ${stayed ? "still in game" : "left the game"}, ${asked ? "asked to confirm" : "no confirmation"}` };
      });
      out.audio = await attempt(async () => {
        const n = await page.evaluate(() => window.__deb?.audio || 0);
        return { pass: n > 0, detail: `${n} audio contexts or media plays` };
      });
      out.permissions = await attempt(async () => {
        const asked = await page.evaluate(() => window.__deb?.permissions || []);
        return { pass: asked.length === 0, detail: asked.length ? `requested ${[...new Set(asked)].join(", ")}` : "none requested" };
      });
    } finally {
      await page.close();
    }
  }

  out.levels = await attempt(async () => {
    const page = await openHome(context, url);
    try {
      const nums = new Set();
      let text = "";
      const collect = async () => {
        const found = await page.evaluate(() => [...document.querySelectorAll("button, a, [role=button], [role=gridcell], [aria-label]")].flatMap((e) => {
          const t = (e.innerText || "").trim();
          const out = [];
          if (/^\d{1,2}$/.test(t.split("\n")[0])) out.push(Number(t.split("\n")[0]));
          const m = (e.getAttribute("aria-label") || "").match(/level\s*(\d{1,2})\b/i);
          if (m) out.push(Number(m[1]));
          return out;
        }));
        found.filter((n) => n >= 1 && n <= 40).forEach((n) => nums.add(n));
        text += "\n" + (await bodyText(page)).toLowerCase();
      };
      if (!(await click(page, /^(levels?|level select|world map|map)\b/))) return { pass: false, detail: "no Levels control" };
      await collect();
      const start = page.url();
      for (const chapter of [...CHAPTERS, /next chapter|next/]) {
        const re = chapter instanceof RegExp ? chapter : new RegExp(chapter);
        if (await click(page, re)) { await collect(); for (let i = 0; i < 4 && (await click(page, /next chapter|next/)); i++) await collect(); if (page.url() !== start) { await page.goto(start, { waitUntil: "load" }); await page.waitForTimeout(1500); } }
      }
      return { score: fraction(nums.size, 40), detail: `${nums.size} distinct level numbers`, text };
    } finally {
      await page.close();
    }
  });

  out.locked = await attempt(async () => {
    const page = await openHome(context, url);
    try {
      if (!(await click(page, /^(levels?|level select|world map|map)\b/))) return { pass: false, detail: "no Levels control" };
      const n = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => /lock/i.test(`${e.getAttribute("aria-label") || ""} ${e.getAttribute("alt") || ""} ${e.getAttribute("title") || ""} ${typeof e.className === "string" ? e.className : ""}`) || (e.disabled && /\d/.test(e.innerText || "")) || (e.children.length === 0 && /\blocked\b/i.test(e.innerText || ""))).length);
      return { pass: n > 0, detail: `${n} locked markers` };
    } finally {
      await page.close();
    }
  });

  out.settings = await attempt(async () => {
    const s = await openScreen(context, url, /^settings?\b|options|⚙/);
    if (!s) return { pass: false, detail: "no settings control" };
    const t = (await bodyText(s.page)).toLowerCase();
    await s.page.close();
    const parts = ["music", "sound", "vibrat", "language"].filter((w) => t.includes(w));
    return { score: fraction(parts.length, 4), detail: `found ${parts.join(", ")}` };
  });

  out.settingsPersist = await attempt(async () => {
    const s = await openScreen(context, url, /^settings?\b|options|⚙/);
    if (!s) return { pass: false, detail: "no settings control" };
    const { page } = s;
    try {
      const state = () => page.evaluate(() => {
        const toggles = [...document.querySelectorAll("input[type=checkbox], [role=switch], [role=checkbox], button[aria-pressed], button[aria-checked], button")];
        const own = (e) => `${e.getAttribute("aria-label") || ""} ${document.getElementById(e.getAttribute("aria-labelledby") || "")?.innerText || ""} ${e.labels ? [...e.labels].map((x) => x.innerText).join(" ") : ""} ${e.tagName === "BUTTON" ? e.innerText : ""}`;
        const row = (e) => { let r = e.parentElement; while (r && r.parentElement && r.parentElement.querySelectorAll("button, input, [role=switch]").length <= 1) r = r.parentElement; return r?.innerText || ""; };
        const find = (re, not) => toggles.find((e) => re.test(own(e)) && !not.test(own(e))) || toggles.find((e) => re.test(row(e)) && !not.test(row(e)));
        const read = (e) => (e ? `${e.checked ?? ""}|${e.getAttribute("aria-checked") || ""}|${e.getAttribute("aria-pressed") || ""}|${e.innerText}|${e.className}` : null);
        const music = find(/music/i, /sound effects|^\s*sound/i);
        const sound = find(/sound|sfx|effects/i, /music/i);
        document.querySelectorAll("[data-deb]").forEach((e) => e.removeAttribute("data-deb"));
        music?.setAttribute("data-deb", "music");
        return { music: read(music), sound: read(sound) };
      });
      const before = await state();
      if (!before.music) return { pass: false, detail: "no music toggle" };
      await page.locator("[data-deb=music]").click({ timeout: 5000 });
      await page.waitForTimeout(600);
      const after = await state();
      await reopen(page, /^settings?\b|options|⚙/, async () => !!(await state()).music);
      const reloaded = await state();
      const toggled = after.music !== before.music;
      const independent = toggled && after.sound === before.sound;
      const persisted = toggled && reloaded.music === after.music;
      return { score: (toggled ? 0.4 : 0) + (independent ? 0.3 : 0) + (persisted ? 0.3 : 0), detail: `music toggled ${toggled}, sound unchanged ${independent}, kept after reload ${persisted}` };
    } finally {
      await page.close();
    }
  });

  out.shop = await attempt(async () => {
    const s = await openScreen(context, url, /^(shop|store)\b/);
    if (!s) return { pass: false, detail: "no shop control" };
    const { page } = s;
    try {
      const store = () => page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));
      const before = await bodyText(page);
      const stored0 = await store();
      const lists = ["hammer", "swap", "bomb"].filter((b) => new RegExp(b, "i").test(before));
      const bought = await click(page, /buy|purchase|\b\d{2,4}\b/, /back|home|close/);
      const after = await bodyText(page);
      const stored1 = await store();
      const changed = bought && after !== before;
      await reopen(page, /^(shop|store)\b/, async () => /hammer|swap|bomb/i.test(await bodyText(page)));
      const reloaded = await bodyText(page);
      const kept = stored1 !== stored0 && (await store()) === stored1;
      // The shop's own numbers (prices, balance, owned counts), compared line by line so a toast or a reordered header does not count.
      const numbers = (t) => t.split("\n").filter((l) => /\d/.test(l) && l.length < 60).map((l) => l.trim()).sort().join("|");
      const owned = (t) => JSON.stringify(boosterCounts(t));
      const persisted = changed && (kept || (Object.values(boosterCounts(after)).some((n) => n !== null) ? owned(reloaded) === owned(after) && owned(after) !== owned(before) : numbers(reloaded) === numbers(after)));
      return { score: lists.length / 6 + (changed ? 0.25 : 0) + (persisted ? 0.25 : 0), detail: `lists ${lists.join(", ")}; bought via "${bought}": ${changed ? "counts changed" : "nothing changed"}, kept after reload ${persisted}` };
    } finally {
      await page.close();
    }
  });

  out.daily = await attempt(async () => {
    const s = await openScreen(context, url, /daily/);
    if (!s) return { pass: false, detail: "no daily challenge control" };
    const t = await bodyText(s.page);
    const start = await s.page.evaluate(markControl, [/^(▶\s*)?(start|play|begin)\b/.source]);
    await s.page.close();
    return { score: (/daily/i.test(t) ? 0.5 : 0) + (start ? 0.5 : 0), detail: `start control ${start || "missing"}` };
  });

  out.achievements = await attempt(async () => {
    const s = await openScreen(context, url, /achievement|trophies|awards/);
    if (!s) return { pass: false, detail: "no achievements control" };
    const t = await bodyText(s.page);
    const progress = (t.match(/\d+\s*(\/|of)\s*\d+/g) || []).length + (await s.page.locator("[role=progressbar], progress").count());
    await s.page.close();
    return { pass: progress >= 3, detail: `${progress} progress counters or bars` };
  });

  out.formats = { score: (imageTypes.has("webp") ? 0.5 : 0) + (imageTypes.has("png") ? 0.5 : 0), detail: `loaded ${[...imageTypes].join(", ") || "no webp or png"}` };
  return out;
}

export async function interactMobile(context, url) {
  return {
    mobileControls: await attempt(async () => {
      const page = await openHome(context, url);
      try {
        const game = await openGame(page);
        if (!game) return { pass: false, detail: "Play never reached a game board on the phone" };
        const r = await page.evaluate(() => {
          const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 4 && b.height > 4 && s.visibility !== "hidden" && s.opacity !== "0"; };
          const els = [...document.querySelectorAll("button, a[href], [role=button]")].filter(vis).filter((e) => !e.parentElement.closest("button, a[href], [role=button]"));
          const boxes = els.map((e) => ({ e, b: e.getBoundingClientRect() })).filter(({ b }) => b.top < innerHeight);
          const outside = boxes.filter(({ b }) => b.left < -1 || b.right > innerWidth + 1 || b.bottom > innerHeight + 1).length;
          let overlaps = 0;
          for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i].b, c = boxes[j].b;
            const w = Math.min(a.right, c.right) - Math.max(a.left, c.left), h = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
            if (w > 0 && h > 0 && w * h > 0.2 * Math.min(a.width * a.height, c.width * c.height)) overlaps++;
          }
          return { n: boxes.length, outside, overlaps };
        });
        const board = await page.evaluate(boardBox);
        r.canvasFits = !!board && board.x >= -1 && board.x + board.w <= page.viewportSize().width + 1;
        return { score: (r.overlaps === 0 ? 0.5 : 0) + (r.outside === 0 ? 0.25 : 0) + (r.canvasFits ? 0.25 : 0), detail: `${r.n} controls, ${r.overlaps} overlapping, ${r.outside} off screen, board fits ${r.canvasFits}` };
      } finally {
        await page.close();
      }
    }),
  };
}
