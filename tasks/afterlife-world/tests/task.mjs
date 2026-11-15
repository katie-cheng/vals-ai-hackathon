// Task-specific part of the verifier: the AFTERLIFE brief's checklist, the interactions it asks for, and what grade.mjs
// should intercept or exempt. grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of tasks/verifier/; only this file is per task.
import { attempt, freshPage, newLines } from "./lib.mjs";

// Nothing in this brief asks for a pattern that grade.mjs SLOP_CHECKS penalises.
export const SLOP_EXEMPT = {};

const PLAYER = { name: "Wren Okafor", user: `wren_${Date.now() % 100000}`, email: "wren.okafor@example.com", password: "Lanterns#2026" };
const CHAT = `harbour lights 4471`;
const ENTER_RE = /enter|play|explore|start|join|guest|solo|continue|create|sign ?up|register|begin|wander/i;
const KINDS = {
  friend: /friend request|friends?\b/i,
  message: /messages?\b|chat/i,
  invitation: /invit/i,
  event: /events?\b/i,
  purchase: /purchase|receipt|bought/i,
  marketplace: /market ?place|market|sales?\b|sold|listing/i,
  account: /account|sign-?in|security|password/i,
};
const SHARED = {
  profile: /profile|account|display name|username/i,
  inventory: /inventory|wardrobe|backpack|items?\b/i,
  currency: /currency|coins?\b|credits?\b|gems?\b|lumens?\b|balance|gold\b|tokens?\b/i,
  friends: /friends?\b/i,
  messages: /messages?\b|chat/i,
  properties: /propert|homes?\b|house|plots?\b|land\b|real estate/i,
  purchases: /purchases?|receipts?|bought|shop|store\b|market/i,
  progress: /progress|level|xp\b|saved|gathered|achievements?|quests?/i,
};

const fraction = (found, total) => found / total;

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const pages = views.desktop.pages;
  const home = pages[0].facts;
  const allText = pages.map((p) => p.facts.text).join("\n");
  const act = (name) => (views[name]?.ok ? views[name].interactions : {});
  const d = act("desktop");
  const m = act("phone");
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, r) => add(id, desc, r?.score ?? (r?.pass ? 1 : 0), r?.detail);
  const worldText = [allText, d.world?.text || "", d.panels?.text || ""].join("\n");

  add("name", "AFTERLIFE is named on the home page", /afterlife/i.test(home.text) ? 1 : 0);
  add("seo-meta", "Title names AFTERLIFE and a meta description exists", (/afterlife/i.test(home.title) ? 0.5 : 0) + (home.metaDescription.trim() ? 0.5 : 0), home.title);
  add("no-install", "The site says it runs in the browser without installing anything", /no (installation|install|download)|nothing to (install|download)|without (installing|downloading|an? (install|download))|(in|from) (your|the|any) (web )?browser/i.test(allText) ? 1 : 0);
  const devices = [/phones?|android|iphone|mobile/i, /tablets?|ipad/i, /laptops?|desktops?|computers?|pc\b/i].filter((re) => re.test(allText));
  add("devices", "Phones, tablets and computers are all named as supported", fraction(devices.length, 3), `${devices.length}/3`);
  fromAct("enter-world", "Entering from the home page opens a full-screen 3D (WebGL) world on a computer", d.world);
  fromAct("enter-world-phone", "Entering works on a phone too", m.world);
  fromAct("keyboard-move", "Keyboard movement (WASD / arrows) moves the view", d.keyboard);
  fromAct("mouse-look", "Dragging with the mouse turns the camera", d.mouse);
  fromAct("touch-joystick", "Phone shows a virtual joystick and dragging it moves the view", m.joystick);
  fromAct("adapted-controls", "Desktop shows keyboard controls and the phone shows touch controls instead", adapted(d.world, m.world));
  fromAct("graphics-quality", "Graphics quality adapts to the device and can be changed", d.graphics);
  fromAct("permission-consent", "Notification permission is not requested on load and is requested from a control the player uses", d.consent);
  fromAct("service-worker", "A service worker is registered for notifications", d.serviceWorker);
  fromAct("notification-centre", "Notification centre with history and unread count", d.centre);
  fromAct("notification-kinds", "Friend requests, messages, invitations, events, purchases, marketplace and account updates are notification kinds", d.kinds);
  fromAct("notification-prefs", "Notification preferences per kind and a mute control", d.prefs);
  fromAct("realtime-sync", "A chat message sent in one tab appears in another open tab without a reload", d.sync);
  fromAct("purchase", "Buying something in the world changes the balance or shows a receipt", d.purchase);
  const shared = Object.entries(SHARED).filter(([, re]) => re.test(worldText)).map(([k]) => k);
  add("shared-data", "Profile, inventory, currency, friends, messages, properties, purchases and progress all exist", fraction(shared.length, 8), `missing: ${Object.keys(SHARED).filter((k) => !shared.includes(k)).join(", ")}`);
  fromAct("apk-honest", "Android APK: a working download with real version and size, or a clear statement of what is missing", d.apk);
  add("closed-delivery-honest", "Delivery while the site is closed is either real or stated as unavailable", closedDelivery(worldText) ? 1 : 0);
  return items;
}

function adapted(desktop, phone) {
  if (!desktop?.pass || !phone?.pass) return { pass: false, detail: "world did not open on both" };
  const keys = /\bwasd\b|\bw\s*a\s*s\s*d\b|arrow keys|keyboard/i;
  const ok = [keys.test(desktop.text) || desktop.keyHints, phone.touchUi, !phone.keyHints];
  return { score: fraction(ok.filter(Boolean).length, 3), detail: `desktop keys ${ok[0]}, phone touch ui ${ok[1]}, phone hides keys ${ok[2]}` };
}

function closedDelivery(text) {
  const closed = /(closed|not open|isn't open|is not open|in the background|offline|when (the )?(site|website|tab|app|afterlife) (is )?(closed|not open))/i;
  const status = /not (yet )?(available|connected|configured|set up|supported)|unavailable|requires?|needs?|missing|until/i;
  return text.split(/\n|(?<=\.)\s/).some((s) => /notif|push/i.test(s) && closed.test(s) && status.test(s));
}

/** In-page: the largest visible canvas, its share of the viewport, and whether it renders WebGL. */
function canvasInfo() {
  const cs = [...document.querySelectorAll("canvas")].map((c) => {
    const r = c.getBoundingClientRect();
    return { c, area: Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) };
  }).sort((a, b) => b.area - a.area);
  if (!cs.length) return { share: 0, webgl: false };
  const c = cs[0].c;
  let webgl = false;
  try {
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = true;
  }
  return { share: cs[0].area / (innerWidth * innerHeight), webgl };
}

const visibleText = (page) => page.evaluate(() => document.body.innerText);

/** Fills whatever name/email/password fields are showing and submits, until a large canvas fills the screen. */
async function enterWorld(page, url) {
  await page.goto(url, { waitUntil: "load", timeout: 90_000 });
  await page.waitForTimeout(2000);
  const entry = page.locator("a:visible, button:visible").filter({ hasText: ENTER_RE }).first();
  if (await entry.count()) {
    await entry.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2500);
  }
  for (let i = 0; i < 4; i++) {
    const info = await page.evaluate(canvasInfo);
    const fields = page.locator("input:visible:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=range])");
    const hasForm = (await fields.count()) > 0 && (await page.locator("input[type=password]:visible").count()) + (await fields.count()) > 0;
    const dialogForm = await page.evaluate(() => [...document.querySelectorAll("input[type=password], input[name*=name i], input[placeholder*=name i]")].some((f) => f.getBoundingClientRect().width > 0));
    if (info.share >= 0.6 && info.webgl && !dialogForm) return info;
    if (hasForm || dialogForm) {
      for (let f = 0; f < (await fields.count()); f++) {
        const el = fields.nth(f);
        const desc = (await el.evaluate((x) => [x.type, x.name, x.id, x.placeholder, x.getAttribute("aria-label"), x.labels?.[0]?.innerText].join(" "))).toLowerCase();
        if (/search|chat|message|say/.test(desc)) continue;
        const value = /password/.test(desc) ? PLAYER.password : /mail/.test(desc) ? PLAYER.email : /user|handle|login/.test(desc) ? PLAYER.user : PLAYER.name;
        if (!(await el.inputValue().catch(() => ""))) await el.fill(value).catch(() => {});
      }
    }
    const go = page.locator("button:visible, [role=button]:visible, input[type=submit]:visible").filter({ hasText: ENTER_RE }).last();
    if (await go.count()) await go.click({ timeout: 5000 }).catch(() => {});
    else await page.keyboard.press("Enter").catch(() => {});
    await page.waitForTimeout(4000);
  }
  return page.evaluate(canvasInfo);
}

/** Mean absolute pixel difference (0-255) between two PNG screenshots, decoded in a scratch page. */
async function diff(context, a, b) {
  const p = await context.newPage();
  const v = await p.evaluate(async ([x, y]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${s}`; });
    const [ia, ib] = await Promise.all([load(x), load(y)]);
    const w = 160, h = Math.round((160 * ia.height) / ia.width);
    const px = (img) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.drawImage(img, 0, 0, w, h); return g.getImageData(0, 0, w, h).data; };
    const da = px(ia), db = px(ib);
    let s = 0;
    for (let i = 0; i < da.length; i += 4) s += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
    return s / ((da.length / 4) * 3);
  }, [a.toString("base64"), b.toString("base64")]);
  await p.close();
  return v;
}

/** How much an action changes the frame, against how much the frame changes on its own over the same time. */
async function motion(context, page, act, ms = 1500) {
  const shot = () => page.screenshot({ type: "png" });
  const s0 = await shot();
  await page.waitForTimeout(ms);
  const s1 = await shot();
  await act();
  const s2 = await shot();
  const idle = await diff(context, s0, s1);
  const moved = await diff(context, s1, s2);
  return { idle, moved, pass: moved > Math.max(2, idle * 2 + 1), detail: `frame change idle ${idle.toFixed(1)}, after input ${moved.toFixed(1)}` };
}

const KEY_HINT = /\bwasd\b|\bw\s*a\s*s\s*d\b|arrow keys|\bshift\b.*\b(run|sprint)\b/i;

/** In-page: a visible on-screen joystick or touch pad, by label, class or id. */
function joystickBox() {
  const els = [...document.querySelectorAll("[aria-label], [class], [id]")].filter((el) => {
    const label = [el.getAttribute("aria-label"), typeof el.className === "string" ? el.className : "", el.id].join(" ");
    const r = el.getBoundingClientRect();
    return /joystick|thumb-?stick|\bstick\b|virtual-?pad|dpad|nipple/i.test(label) && r.width >= 40 && r.height >= 40 && r.top > innerHeight * 0.35 && el.checkVisibility({ opacityProperty: true });
  });
  const pick = els.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)[0];
  if (!pick) return null;
  const r = pick.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
}

/** Clicks the first visible control whose label or aria-label matches, preferring controls inside an open panel or dialog. */
async function openControl(page, re) {
  const clickMatch = async (scope) => {
    const loc = page.locator(scope).filter({ visible: true });
    const labels = await loc.evaluateAll((els) => els.map((x) => `${x.innerText} ${x.getAttribute("aria-label") || ""} ${x.getAttribute("title") || ""}`)).catch(() => []);
    const i = labels.findIndex((l) => re.test(l));
    if (i < 0) return false;
    await loc.nth(i).click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(800);
    return true;
  };
  const sel = "button, a, [role=button], [role=tab]";
  try {
    if (await clickMatch(`:is([role=dialog], dialog[open], [aria-modal=true]) :is(${sel})`)) return true;
    if (await clickMatch(sel)) return true;
    const menu = page.locator("button[aria-label*='menu' i]:visible").first();
    if (await menu.count()) {
      await menu.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(600);
      return await clickMatch(sel);
    }
  } catch {
    return false;
  }
  return false;
}

async function closePanels(page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
}

// Headless Chromium reports notification permission as "denied"; present it as a fresh browser that has not been asked yet.
const PERMISSION_SPY = () => {
  window.__permissionCalls = 0;
  if (window.Notification) {
    Object.defineProperty(Notification, "permission", { configurable: true, get: () => "default" });
    Notification.requestPermission = () => ((window.__permissionCalls += 1), Promise.resolve("default"));
  }
  if (navigator.permissions?.query) {
    const query = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (d) => (d?.name === "notifications" ? Promise.resolve({ state: "prompt", onchange: null, addEventListener() {}, removeEventListener() {} }) : query(d));
  }
  if (navigator.permissions?.request) navigator.permissions.request = () => ((window.__permissionCalls += 1), Promise.resolve({ state: "prompt" }));
};

export async function interactDesktop(context, url) {
  const out = {};
  await context.addInitScript(PERMISSION_SPY);
  const page = await context.newPage();
  const info = await enterWorld(page, url);
  const worldText = await visibleText(page);
  const keyHints = KEY_HINT.test(worldText);
  out.world = { pass: info.share >= 0.6 && info.webgl, text: worldText, keyHints, detail: `canvas covers ${Math.round(info.share * 100)}% of the screen, webgl ${info.webgl}` };
  if (!out.world.pass) return out;
  const loadCalls = await page.evaluate(() => window.__permissionCalls);

  out.keyboard = await attempt(async () => {
    await page.mouse.click(Math.round(page.viewportSize().width / 2), Math.round(page.viewportSize().height * 0.45));
    await page.waitForTimeout(300);
    return motion(context, page, async () => {
      await page.keyboard.down("KeyW");
      await page.waitForTimeout(1500);
      await page.keyboard.up("KeyW");
      await page.keyboard.down("KeyD");
      await page.waitForTimeout(500);
      await page.keyboard.up("KeyD");
    });
  });
  out.mouse = await attempt(async () => {
    const { width, height } = page.viewportSize();
    return motion(context, page, async () => {
      await page.mouse.move(width / 2, height * 0.45);
      await page.mouse.down();
      for (let i = 1; i <= 10; i++) await page.mouse.move(width / 2 + i * 30, height * 0.45, { steps: 2 });
      await page.mouse.up();
      await page.waitForTimeout(400);
    });
  });

  out.serviceWorker = await attempt(async () => {
    const n = await page.evaluate(async () => (navigator.serviceWorker ? (await navigator.serviceWorker.getRegistrations()).length : 0));
    return { pass: n > 0, detail: `${n} service worker registrations` };
  });

  const panelTexts = [];
  out.centre = await attempt(async () => {
    const opened = await openControl(page, /notif|alerts?\b|inbox|bell/i);
    if (!opened) return { pass: false, detail: "no notifications control" };
    const t = await visibleText(page);
    panelTexts.push(t);
    const facts = [/history|recent|earlier|all notifications|nothing yet|no notifications|inbox/i.test(t), /unread|mark (all )?(as )?read|\b\d+ new\b/i.test(t)];
    return { score: fraction(facts.filter(Boolean).length, 2), detail: `history ${facts[0]}, unread ${facts[1]}` };
  });
  out.prefs = await attempt(async () => {
    await openControl(page, /preferences|settings|manage/i);
    const t = await visibleText(page);
    panelTexts.push(t);
    const toggles = await page.locator("input[type=checkbox]:visible, [role=switch]:visible").count();
    const mute = /\bmute|do not disturb|quiet hours|pause notifications|snooze/i.test(t);
    const facts = [toggles >= 4, mute];
    return { score: fraction(facts.filter(Boolean).length, 2), detail: `toggles ${toggles}, mute ${mute}` };
  });
  out.consent = await attempt(async () => {
    const before = await page.evaluate(() => window.__permissionCalls);
    let after = before;
    for (const re of [/(turn on|enable|allow|get|receive).{0,20}(browser |push |desktop )?notif|notif.{0,20}(on|enable|allow)|push/i, /continue|allow|yes|enable|turn on|confirm/i]) {
      const btn = page.locator("button:visible, [role=button]:visible, [role=switch]:visible").filter({ hasText: re }).first();
      if (await btn.count()) {
        await btn.click({ timeout: 4000 }).catch(() => {});
        await page.waitForTimeout(1000);
        after = await page.evaluate(() => window.__permissionCalls);
        if (after > before) break;
      }
    }
    const facts = [loadCalls === 0, after > before];
    return { score: fraction(facts.filter(Boolean).length, 2), detail: `requests before any click ${loadCalls}, after the player turned notifications on ${after - before}` };
  });
  out.kinds = await attempt(async () => {
    const t = panelTexts.join("\n");
    const found = Object.entries(KINDS).filter(([, re]) => re.test(t)).map(([k]) => k);
    return { score: fraction(found.length, 7), detail: `missing: ${Object.keys(KINDS).filter((k) => !found.includes(k)).join(", ") || "none"}` };
  });
  await closePanels(page);

  out.graphics = await attempt(async () => {
    await openControl(page, /settings|options|graphics|gear/i);
    const t = await visibleText(page);
    panelTexts.push(t);
    const facts = [/graphics|quality|performance|render/i.test(t), /\b(low|medium|high|auto(matic)?)\b/i.test(t)];
    return { score: fraction(facts.filter(Boolean).length, 2), detail: `graphics ${facts[0]}, levels ${facts[1]}` };
  });
  await closePanels(page);

  out.purchase = await attempt(async () => {
    const opened = await openControl(page, /market|shop|store|exchange|wardrobe/i);
    if (!opened) return { pass: false, detail: "no market control" };
    const before = await visibleText(page);
    panelTexts.push(before);
    const buyable = page.locator("button:visible:not([role=tab]):not([disabled]), [role=button]:visible");
    const buy = (await buyable.filter({ hasText: /\bbuy\b|get for/i }).count()) ? buyable.filter({ hasText: /\bbuy\b|get for/i }).first() : buyable.filter({ hasText: /purchase/i }).first();
    if (!(await buy.count())) return { pass: false, detail: "no buy button" };
    await buy.click({ timeout: 4000 });
    await page.waitForTimeout(1500);
    const confirm = page.locator("[role=dialog] button:visible, dialog button:visible").filter({ hasText: /confirm|buy|purchase|yes/i }).first();
    if (await confirm.count()) await confirm.click().catch(() => {}), await page.waitForTimeout(1500);
    const after = await visibleText(page);
    const fresh = newLines(before, after).join(" ");
    const pass = /bought|purchased|receipt|added to|owned|in your inventory|thanks/i.test(fresh);
    return { pass, detail: fresh.slice(0, 160) || "nothing changed" };
  });
  await closePanels(page);
  for (const re of [/inventory|backpack|bag/i, /friends?/i, /homes?|propert|plots?/i, /events?/i]) {
    if (await openControl(page, re)) panelTexts.push(await visibleText(page).catch(() => ""));
    await closePanels(page);
  }
  out.panels = { pass: true, text: panelTexts.join("\n") };

  out.sync = await attempt(async () => {
    const other = await context.newPage();
    const info2 = await enterWorld(other, url);
    if (info2.share < 0.6) return { pass: false, detail: "second tab did not open the world" };
    const field = async (p) => {
      let f = p.locator("input:visible, textarea:visible").filter({ hasNot: p.locator("[type=checkbox]") });
      const pick = async () => {
        const n = await f.count();
        for (let i = 0; i < n; i++) {
          const desc = await f.nth(i).evaluate((x) => [x.name, x.id, x.placeholder, x.getAttribute("aria-label"), x.labels?.[0]?.innerText].join(" "));
          if (/chat|message|say|type/i.test(desc)) return f.nth(i);
        }
        return null;
      };
      let found = await pick();
      if (!found && (await openControl(p, /chat|messages?/i))) (f = p.locator("input:visible, textarea:visible")), (found = await pick());
      return found;
    };
    const input = await field(page);
    if (!input) return { pass: false, detail: "no chat input" };
    await field(other);
    await input.fill(CHAT);
    await input.press("Enter");
    let seen = false;
    for (let i = 0; i < 8 && !seen; i++) await page.waitForTimeout(1000), (seen = (await visibleText(other)).toLowerCase().includes(CHAT));
    await other.close();
    return { pass: seen, detail: seen ? "the message reached the other tab" : "the other tab did not show the message" };
  });

  out.apk = await attempt(() => apkCheck(context, url));
  await page.close();
  return out;
}

/** An APK link must download a real file whose size is shown; without one, the page must say what is missing. */
async function apkCheck(context, url) {
  const page = await freshPage(context, url);
  const androidLink = page.locator("a:visible").filter({ hasText: /android|apk/i }).first();
  if (await androidLink.count()) {
    const href = await androidLink.getAttribute("href");
    if (href && !/\.apk(\?|$)/i.test(href) && !href.startsWith("http")) await androidLink.click().catch(() => {}), await page.waitForTimeout(2000);
  }
  const text = await visibleText(page);
  const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => /\.apk(\?|$)/i.test(h)));
  const counter = /\b[\d,.]+\s*[kKmM]?\+?\s*(downloads|installs)\b/.test(text);
  await page.close();
  if (!/android|apk/i.test(text)) return { pass: false, detail: "no Android app section" };
  if (hrefs.length) {
    const r = await context.request.get(hrefs[0]).catch(() => null);
    const bytes = r && r.ok() ? (await r.body()).length : 0;
    const zip = bytes > 100_000;
    const sized = /\b\d+(\.\d+)?\s?(MB|KB|MiB)\b/i.test(text) && /\bv?\d+\.\d+(\.\d+)?\b/.test(text);
    const facts = [zip, sized, !counter];
    return { score: fraction(facts.filter(Boolean).length, 3), detail: `APK ${hrefs[0].slice(-60)}: ${bytes} bytes, version and size shown ${sized}, download counter ${counter}` };
  }
  const honest = /(no|not)\b.{0,40}(apk|android app|release|download)|not (yet )?(available|built|signed|published)|coming|unavailable|requires?|needs?/i.test(text);
  const signing = /keystore|signing key|signed release|sign(ed|ing)? (the|an?|its) (apk|release)|apksigner/i.test(text);
  const facts = [honest, signing, !counter];
  return { score: fraction(facts.filter(Boolean).length, 3), detail: `no APK link; says what is missing ${honest}, signing process ${signing}, download counter ${counter}` };
}

export async function interactMobile(context, url) {
  const out = {};
  const page = await context.newPage();
  const info = await enterWorld(page, url);
  const text = await visibleText(page);
  const stick = await page.evaluate(joystickBox);
  out.world = { pass: info.share >= 0.6 && info.webgl, text, keyHints: KEY_HINT.test(text), touchUi: !!stick || /joystick|drag to move|touch to move|tap to move/i.test(text), detail: `canvas ${Math.round(info.share * 100)}%, joystick ${!!stick}` };
  if (!out.world.pass) return out;
  out.joystick = await attempt(async () => {
    const { width, height } = page.viewportSize();
    const at = stick || { x: width * 0.2, y: height * 0.82, w: 100 };
    const cdp = await context.newCDPSession(page);
    const touch = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
    const r = await motion(context, page, async () => {
      await touch("touchStart", at.x, at.y);
      for (let i = 1; i <= 8; i++) await touch("touchMove", at.x, at.y - (i * at.w) / 14), await page.waitForTimeout(40);
      await page.waitForTimeout(1500);
      await touch("touchEnd");
      await page.waitForTimeout(300);
    });
    return { score: (stick ? 0.5 : 0) + (r.pass ? 0.5 : 0), detail: `joystick ${!!stick}; ${r.detail}` };
  });
  await page.close();
  return out;
}
