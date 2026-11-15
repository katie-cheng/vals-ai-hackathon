// Task-specific part of the verifier: the JCQL brief (a scoreboard plus an operator page where teams and logos are added, always
// sorted high to low) and the interactions it implies. grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of
// tasks/verifier/; only this file is per task. Teams are found by the names the checks give them, never by the golden site's markup.
import zlib from "node:zlib";
import { assignPages, attempt, freshPage, newLines } from "./lib.mjs";

// Nothing in this brief asks for a pattern that grade.mjs SLOP_CHECKS penalises.
export const SLOP_EXEMPT = {};

const ROLES = { operator: [/operator|admin|control|manage|host|quiz-?master|desk|console|dashboard/] };
// Scores low enough that these teams sit below the sample league, away from any podium for the top three.
const TEAMS = { a: ["Quiz Team Alpha 41", 10], b: ["Quiz Team Bravo 52", 30], c: ["Quiz Team Charlie 63", 20] };
const RAISED = 40;
const RENAMED = "Quiz Team Delta 74";
const PHONE_TEAM = "Quiz Team Echo 85";
const LOGO_RGB = [200, 40, 120];
const SYNC_WAIT = 2500;

/** A solid-colour PNG, so the scoreboard's copy of the uploaded logo can be recognised by its pixels. */
function solidPng(size, [r, g, b]) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const x of buf) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, sum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: size }, () => [r, g, b]).flat())]);
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
const LOGO = { name: "team-logo.png", mimeType: "image/png", buffer: solidPng(120, LOGO_RGB) };

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

  add("name", "Scoreboard names JCQL and the Jagadish Chandra Quiz League", (/\bJCQL\b/.test(home.text) ? 0.5 : 0) + (/jagadish chandra quiz league/i.test(home.text) ? 0.5 : 0));
  add("hostel", "Scoreboard names the hostel, Jagadish Abas", /jagadish abas/i.test(home.text) ? 1 : 0);
  add("seo-meta", "Title names JCQL and a meta description exists", (/jcql|jagadish chandra/i.test(home.title) ? 0.5 : 0) + (home.metaDescription.trim() ? 0.5 : 0), home.title);
  add("operator-page", "A separate operator page is linked from the scoreboard", byRole.operator ? 1 : 0, byRole.operator?.path || pages.map((p) => p.path).join(", "));
  fromAct("sample-league", "A fresh browser shows at least four sample teams with scores, marked as sample data", "sample");
  fromAct("operator-form", "The operator page has a team name field and a logo image upload", "form");
  fromAct("empty-name", "Adding a team with no name is refused with a message", "emptyName");
  fromAct("add-team", "A team added on the operator page shows on the scoreboard", "added");
  fromAct("logo-shown", "The uploaded logo shows next to the team on the scoreboard", "logo");
  fromAct("live-sync", "An open scoreboard tab shows operator changes without a reload", "liveSync");
  fromAct("sorted", "Teams are listed by score, highest first", "sorted");
  fromAct("re-sort", "Changing a score on the operator page re-sorts the scoreboard", "resort");
  fromAct("persists", "Teams, logos and scores survive a reload", "persists");
  fromAct("edit-team", "A team can be renamed on the operator page", "edit");
  fromAct("delete-team", "A team can be removed on the operator page", "remove");
  fromAct("phone-operator", "The operator page works on a phone", "phoneAdd");
  return items;
}

/** In-page: visible elements whose text is a team's score (a number of 10 or more, or a number with "pts"/"points"). */
function sampleFacts() {
  const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const scores = [...document.querySelectorAll("body *")].filter((el) => {
    if (el.children.length || !visible(el)) return false;
    const t = (el.innerText || "").trim();
    return /^-?\d{2,5}$/.test(t) || /^-?\d{1,5}\s*(pts?|points)$/i.test(t);
  });
  return { scores: scores.length, marked: /\b(sample|demo|example|practice)\b/i.test(document.body.innerText) };
}

/**
 * In-page: page-relative top and left of the smallest visible element showing each name (exact text first), or null.
 * With `exact`, only an element whose whole text is the name counts, so an activity line such as "Removed X" does not.
 */
function positions([names, exact]) {
  const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const all = [...document.querySelectorAll("body *")].filter((el) => !el.closest("[role=dialog],dialog,[aria-modal=true]"));
  return names.map((name) => {
    const own = (el) => (el.innerText || "").trim();
    // An activity-log line ("Team X, points awarded, just now") records history rather than showing the team.
    const logLine = (e) => {
      for (let a = e.parentElement, n = 0; a && n < 3; a = a.parentElement, n++) {
        const t = own(a);
        if (t.length < 200 && /\bjust now\b|\b\d+\s*(s|secs?|m|mins?|h|hrs?|hours?|minutes?)\s+ago\b|\b(awarded|deducted|renamed|removed|deleted)\b/i.test(t)) return true;
      }
      return !!e.closest("[role=log]");
    };
    const el = all.find((e) => visible(e) && own(e) === name && !(exact && logLine(e))) || (!exact && all.filter((e) => visible(e) && own(e).includes(name)).sort((x, y) => own(x).length - own(y).length)[0]);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + scrollY, left: r.left + scrollX };
  });
}

/** In-page: whether an image near the team's name (img or CSS background, up to five ancestors up) shows the uploaded colour. */
async function logoNear([name, rgb]) {
  const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const label = [...document.querySelectorAll("body *")].find((e) => visible(e) && (e.innerText || "").trim() === name);
  if (!label) return { found: false, detail: "team name not on the page" };
  const sample = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = Math.max(1, img.naturalWidth || 64);
        c.height = Math.max(1, img.naturalHeight || 64);
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, c.width, c.height);
        try {
          resolve([...ctx.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data].slice(0, 3));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  let box = label;
  for (let i = 0; i < 6 && box; i++, box = box.parentElement) {
    const sources = [...box.querySelectorAll("img")].filter(visible).map((img) => img.currentSrc || img.src);
    for (const el of [box, ...box.querySelectorAll("*")]) {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none" && visible(el)) for (const m of bg.matchAll(/url\(["']?([^"')]+)/g)) sources.push(m[1]);
    }
    for (const src of sources) {
      const px = await sample(src);
      if (px && px.every((v, k) => Math.abs(v - rgb[k]) <= 40)) return { found: true, detail: `logo pixel ${px.join(",")}` };
    }
    if (sources.length) return { found: false, detail: `nearest images do not show the uploaded logo (${sources.length})` };
  }
  return { found: false, detail: "no image near the team name" };
}

/** In-page: marks the operator row holding `name` (the closest ancestor of its label with a control) with data-sbrow. */
function markRow([name, mark]) {
  document.querySelectorAll(`[data-sbrow="${mark}"]`).forEach((el) => el.removeAttribute("data-sbrow"));
  const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const own = (el) => (el.innerText || el.value || "").trim();
  const all = [...document.querySelectorAll("body *")].filter(visible);
  const label = all.find((e) => own(e) === name && !e.matches("input,textarea")) || all.filter((e) => own(e).includes(name)).sort((x, y) => own(x).length - own(y).length)[0];
  let box = label;
  while (box && box !== document.body && !box.querySelector("button,input,[role=button]")) box = box.parentElement;
  if (!box || box === document.body) return false;
  box.setAttribute("data-sbrow", mark);
  return true;
}

/** In-page: marks the visible team-name field with data-sbf="name", and its form's logo upload and score fields. */
function markAddFields() {
  document.querySelectorAll("[data-sbf]").forEach((el) => el.removeAttribute("data-sbf"));
  const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const describe = (f) =>
    [f.name, f.id, f.placeholder, f.getAttribute("aria-label"), f.labels?.[0]?.innerText, f.closest("label")?.innerText].join(" ").toLowerCase();
  const candidates = [...document.querySelectorAll("input:not([type]),input[type=text]")].filter(
    (f) =>
      visible(f) &&
      !f.value &&
      /team|name/.test(describe(f)) &&
      !/search|find|filter|round|pin|motto|tag ?line|slogan|member|captain|league/.test(describe(f)) &&
      !(/code/.test(describe(f)) && !/name/.test(describe(f))),
  );
  // The full add-team form keeps its logo upload close to the name field, unlike a quick-add box beside it.
  const isImage = (f) => !/json|csv|text/.test(f.accept || "") && /image|png|jpe?g|svg|webp|^$/.test(f.accept || "");
  const toFile = (f) => {
    let n = 0;
    for (let el = f.parentElement; el && el !== document.body; el = el.parentElement, n++)
      if ([...el.querySelectorAll("input[type=file]")].some(isImage)) return n;
    return Infinity;
  };
  // A field behind an open modal cannot be typed into by the operator.
  const covered = (f) => {
    f.scrollIntoView({ block: "center" });
    const r = f.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && !f.contains(hit) && !hit.contains(f);
  };
  const name = candidates.map((f) => [covered(f) ? 1 : 0, toFile(f), f]).sort((x, y) => x[0] - y[0] || x[1] - y[1])[0]?.[2];
  if (!name) return {};
  name.setAttribute("data-sbf", "name");
  // The form, dialog or section around the name field, widened until it holds a file input.
  let scope = name.closest("form,[role=dialog],dialog") || name.parentElement;
  while (scope && scope !== document.body && ![...scope.querySelectorAll("input[type=file]")].some(isImage)) scope = scope.parentElement;
  const file = [...(scope || document).querySelectorAll("input[type=file]")].find(isImage);
  if (file) file.setAttribute("data-sbf", "logo");
  const form = name.closest("form,[role=dialog],dialog") || scope || document.body;
  const score = [...form.querySelectorAll("input[type=number],input")].find((f) => visible(f) && f !== name && /score|points/.test(describe(f)) && f.type !== "file");
  if (score) score.setAttribute("data-sbf", "score");
  return { name: true, logo: !!file, score: !!score, accept: file?.accept || "" };
}

const unlocked = new WeakSet();
/** Operator pages may sit behind a PIN or password shown on the lock screen (the instruction asks for that). */
async function unlock(page) {
  const lock = page.locator("input[type=password]:visible");
  if (!(await lock.count())) return;
  const text = await page.evaluate(() => document.body.innerText);
  const code = text.match(/(?:pin|password|passcode|code)\b[^\n]{0,40}?\b([A-Za-z0-9#@!]*\d[A-Za-z0-9#@!]*)\b/i)?.[1] || text.match(/\b\d{4,8}\b/)?.[0];
  if (!code) return;
  await lock.first().click();
  if ((await lock.count()) > 1) await page.keyboard.type(code, { delay: 60 });
  else await lock.first().fill(code);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  const enter = page.locator("button:visible").filter({ hasText: /unlock|enter|log ?in|sign ?in|continue|open/i }).first();
  if ((await page.locator("input[type=password]:visible").count()) && (await enter.count())) await enter.click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(1000);
  unlocked.add(page);
}

async function openOperator(context, url) {
  const page = await freshPage(context, url);
  page.on("dialog", (d) => d.accept(d.type() === "prompt" ? String(page.promptValue ?? "") : undefined).catch(() => {}));
  await unlock(page);
  return page;
}

/** Finds the add-team form, opening it with an "Add team" button when it is hidden. */
async function findAddForm(page) {
  let f = await page.evaluate(markAddFields);
  if (f.name && f.logo) return f;
  // Operator consoles often keep the team list on its own tab.
  const tab = page.locator(":is(button,a,[role=tab]):visible").filter({ hasText: /^\s*(manage |edit )?teams?\s*$/i }).first();
  if (await tab.count()) {
    await tab.click({ timeout: 5000 });
    await page.waitForTimeout(800);
    f = await page.evaluate(markAddFields);
    if (f.name && f.logo) return f;
  }
  const opener = page.locator(":is(button,a,[role=button]):visible").filter({ hasText: /^\s*(\+\s*)?(add|new|create|register)\b[^\n]{0,12}\bteams?\b|^\s*\+\s*$/i }).first();
  // A quick-add name field without a logo upload may sit beside the full add-team form; prefer the full form.
  if ((!f.name || !f.logo) && (await opener.count())) {
    const quick = f;
    await opener.click({ timeout: 5000 });
    await page.waitForTimeout(900);
    f = await page.evaluate(markAddFields);
    if (!f.name && quick.name) f = await page.evaluate(markAddFields);
  }
  return f;
}

/** In-page: marks the smallest container around the name field that holds an add or save button with data-sbscope. */
function markAddScope(source) {
  document.querySelectorAll("[data-sbscope]").forEach((el) => el.removeAttribute("data-sbscope"));
  const re = new RegExp(source, "i");
  const name = document.querySelector('[data-sbf="name"]');
  let box = name?.closest("form,[role=dialog],dialog") || name?.parentElement;
  while (box && box !== document.body && ![...box.querySelectorAll("button,input[type=submit]")].some((b) => re.test((b.innerText || b.value || "").trim())))
    box = box.parentElement;
  if (box && box !== document.body) box.setAttribute("data-sbscope", "");
}

/** Submits the add-team form; returns "disabled" when its button refuses to be pressed. */
async function submitAdd(page) {
  const name = page.locator('[data-sbf="name"]');
  const re = /^\s*(\+\s*)?(add|save|create|submit|done|confirm|register)\b/i;
  await page.evaluate(markAddScope, re.source);
  const scope = (await page.locator("[data-sbscope]").count()) ? page.locator("[data-sbscope]") : page.locator("body");
  const button = scope.locator("button:visible, input[type=submit]:visible").filter({ hasText: re }).filter({ hasNotText: /another|more|quick/i }).last();
  if (await button.count()) {
    if (await button.isDisabled()) return "disabled";
    await button.click({ timeout: 5000 });
  } else await name.press("Enter");
  await page.waitForTimeout(1200);
  return "";
}

/** Adds a team with the test logo; returns its starting score, or null when there is no add-team form. */
async function addTeam(page, name, score) {
  const f = await findAddForm(page);
  if (!f.name) return { ok: false, form: f };
  await page.locator('[data-sbf="name"]').fill(name);
  if (f.logo) {
    await page.locator('[data-sbf="logo"]').setInputFiles(LOGO);
    await page.waitForTimeout(1200);
    // A crop or confirm step after choosing the image.
    const crop = page.locator("[role=dialog]:visible button:visible, dialog[open] button:visible").filter({ hasText: /^\s*(crop|use (this )?(image|logo)|apply)\b/i }).first();
    if (await crop.count()) await crop.click({ timeout: 3000 }).catch(() => {}), await page.waitForTimeout(600);
  }
  let start = 0;
  if (f.score) {
    await page.locator('[data-sbf="score"]').fill(String(score));
    start = score;
  }
  await submitAdd(page);
  return { ok: true, form: f, start };
}

const rowLoc = (page) => page.locator('[data-sbrow="t"]');

/** Sets a team's score from `current` to `target`: a score field in its row, a "set score" control, or its +N buttons. */
async function setScore(page, name, current, target) {
  if (current === target) return true;
  if (!(await page.evaluate(markRow, [name, "t"]))) return false;
  const row = rowLoc(page);
  const field = row.locator("input[type=number]:visible, input[inputmode=numeric]:visible").first();
  if (await field.count()) {
    await field.fill(String(target));
    await field.press("Enter");
    await page.waitForTimeout(400);
    await page.keyboard.press("Tab").catch(() => {});
    await page.waitForTimeout(900);
    return true;
  }
  const custom = row.locator("button:visible, [role=button]:visible").filter({ hasText: /set|custom|edit score|adjust/i })
    .or(row.locator(":is(button,[role=button])[aria-label*='custom' i]:visible, :is(button,[role=button])[aria-label*='set score' i]:visible, :is(button,[role=button])[aria-label*='adjust' i]:visible")).first();
  if (await custom.count()) {
    page.promptValue = target;
    await custom.click({ timeout: 5000 });
    await page.waitForTimeout(700);
    const input = page.locator("[role=dialog] input:visible, dialog[open] input:visible, [data-sbrow=t] input:visible").filter({ hasNot: page.locator("[type=file]") }).first();
    if (await input.count()) {
      await input.fill(String(target));
      await input.press("Enter");
      await page.waitForTimeout(500);
      const ok = page.locator("[role=dialog] button:visible, dialog[open] button:visible").filter({ hasText: /save|set|apply|ok|done|update|confirm/i }).first();
      if (await ok.count()) await ok.click({ timeout: 3000 }).catch(() => {});
    }
    await page.waitForTimeout(900);
    return true;
  }
  const steps = [];
  for (const b of await row.locator("button:visible, [role=button]:visible").all()) {
    const label = `${await b.innerText()} ${(await b.getAttribute("aria-label")) || ""}`;
    const n = label.match(/^\s*\+\s?(\d+)/)?.[1] || label.match(/\b(?:add|give|plus)\s+(\d+)/i)?.[1];
    if (n) steps.push([Number(n), b]);
  }
  if (!steps.length) return false;
  steps.sort((x, y) => y[0] - x[0]);
  let left = target - current;
  for (let guard = 0; left > 0 && guard < 30; guard++) {
    const step = steps.find(([n]) => n <= left);
    if (!step) break;
    await page.evaluate(markRow, [name, "t"]);
    await step[1].click({ timeout: 5000 });
    await page.waitForTimeout(350);
    left -= step[0];
  }
  await page.waitForTimeout(900);
  return left === 0;
}

async function editName(page, from, to) {
  if (!(await page.evaluate(markRow, [from, "t"]))) return "row not found";
  const edit = rowLoc(page).locator("button:visible, [role=button]:visible, a:visible").filter({ hasText: /edit|rename/i })
    .or(rowLoc(page).locator(":is(button,[role=button])[aria-label*='edit' i]:visible, :is(button,[role=button])[aria-label*='rename' i]:visible")).first();
  if (!(await edit.count())) return "no edit control";
  await edit.click({ timeout: 5000 });
  await page.waitForTimeout(800);
  const field = page.locator("input:visible").filter({ hasNot: page.locator("[type=file]") });
  let target = null;
  for (const f of await field.all()) if ((await f.inputValue().catch(() => "")) === from) target = f;
  if (!target) return "no field holding the team name";
  await target.fill(to);
  const save = page.locator(":is(form,[role=dialog],dialog,[data-sbrow=t]):has(input:focus) button:visible").filter({ hasText: /save|update|done|apply|confirm/i }).first();
  if (await save.count()) await save.click({ timeout: 5000 });
  else await target.press("Enter");
  await page.waitForTimeout(1200);
  return "";
}

async function removeTeam(page, name) {
  if (!(await page.evaluate(markRow, [name, "t"]))) return "row not found";
  const del = rowLoc(page).locator("button:visible, [role=button]:visible").filter({ hasText: /delete|remove/i })
    .or(rowLoc(page).locator(":is(button,[role=button])[aria-label*='delete' i]:visible, :is(button,[role=button])[aria-label*='remove' i]:visible")).first();
  if (!(await del.count())) return "no delete control";
  await del.click({ timeout: 5000 });
  await page.waitForTimeout(700);
  // A confirmation step, in a dialog or in place of the button.
  const confirm = page.locator("[role=dialog] button:visible, dialog[open] button:visible, [role=alertdialog] button:visible, [data-sbrow=t] button:visible")
    .filter({ hasText: /confirm|yes|delete|remove/i }).first();
  if (await confirm.count()) await confirm.click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(1200);
  return "";
}

const shows = async (page, name, exact = false) => (await page.evaluate(positions, [[name], exact]))[0] !== null;

function orderOf(found, names) {
  if (found.some((p) => !p)) return null;
  return names.map((n, i) => [n, found[i]]).sort((x, y) => x[1].top - y[1].top || x[1].left - y[1].left).map(([n]) => n);
}

export async function interactDesktop(context, url, handoffs, pages) {
  const byRole = assignPages(pages, ROLES);
  const out = {};
  const home = await freshPage(context, url);
  out.sample = await attempt(async () => {
    const f = await home.evaluate(sampleFacts);
    return { score: (f.marked ? 0.5 : 0) + (f.scores >= 4 ? 0.5 : 0), detail: `${f.scores} scores shown, marked as sample ${f.marked}` };
  });
  const operator = byRole.operator;
  if (!operator) {
    await home.close();
    const missing = { pass: false, detail: "no operator page found" };
    return Object.assign(out, Object.fromEntries(["form", "emptyName", "added", "logo", "liveSync", "sorted", "resort", "persists", "edit", "remove"].map((k) => [k, missing])));
  }
  const op = await openOperator(context, operator.url);

  out.form = await attempt(async () => {
    const f = await findAddForm(op);
    return { score: (f.name ? 0.5 : 0) + (f.logo ? 0.5 : 0), detail: `name field ${!!f.name}, image upload ${!!f.logo} ${f.accept || ""}` };
  });
  out.emptyName = await attempt(async () => {
    const f = await findAddForm(op);
    if (!f.name) return { pass: false, detail: "no team name field" };
    const before = await op.evaluate(() => document.body.innerText);
    if ((await submitAdd(op)) === "disabled") return { pass: true, detail: "add button disabled until a name is entered" };
    const after = await op.evaluate(() => document.body.innerText);
    const message = newLines(before, after).find((l) => /name|required|enter|empty|blank|please/i.test(l));
    const invalid = (await op.locator('[data-sbf="name"]').count()) && (await op.locator('[data-sbf="name"]').evaluate((el) => !el.validity.valid && el.required));
    return { pass: !!(message || invalid), detail: message || (invalid ? "browser validation on a required field" : "no message") };
  });

  const scores = {};
  const added = {};
  for (const [key, [name, score]] of Object.entries(TEAMS)) {
    const r = await attempt(async () => addTeam(op, name, score));
    added[key] = !!r.ok;
    scores[key] = r.start ?? 0;
    if (r.ok) added[key] = await setScore(op, name, scores[key], score).then((ok) => ((scores[key] = ok ? score : scores[key]), true)).catch(() => true);
  }
  const names = Object.values(TEAMS).map(([n]) => n);
  await op.waitForTimeout(SYNC_WAIT);

  out.liveSync = await attempt(async () => {
    const seen = await home.evaluate(positions, [names]);
    const n = seen.filter(Boolean).length;
    return { score: n / names.length, detail: `${n}/${names.length} added teams on the already open scoreboard` };
  });

  const board = await freshPage(context, url);
  out.added = await attempt(async () => {
    const seen = (await board.evaluate(positions, [names])).filter(Boolean).length;
    return { score: seen / names.length, detail: `${seen}/${names.length} added teams on the scoreboard` };
  });
  out.logo = await attempt(async () => {
    const r = await board.evaluate(logoNear, [TEAMS.a[0], LOGO_RGB]);
    return { pass: r.found, detail: r.detail };
  });
  const expected = Object.entries(TEAMS).sort((x, y) => y[1][1] - x[1][1]).map(([, [n]]) => n);
  out.sorted = await attempt(async () => {
    const all = Object.keys(TEAMS).every((k) => scores[k] === TEAMS[k][1]);
    const order = orderOf(await board.evaluate(positions, [names]), names);
    if (!order) return { pass: false, detail: "added teams not all shown" };
    return { pass: all && order.join("|") === expected.join("|"), detail: `${all ? "" : "scores could not all be set; "}order ${order.join(", ")}` };
  });
  await board.close();

  out.resort = await attempt(async () => {
    const ok = await setScore(op, TEAMS.a[0], scores.a, RAISED);
    if (!ok) return { pass: false, detail: "could not change the score on the operator page" };
    scores.a = RAISED;
    await op.waitForTimeout(SYNC_WAIT);
    const page = await freshPage(context, url);
    const order = orderOf(await page.evaluate(positions, [names]), names);
    await page.close();
    const want = [TEAMS.a[0], TEAMS.b[0], TEAMS.c[0]];
    return { pass: !!order && order.join("|") === want.join("|"), detail: `after raising ${TEAMS.a[0]} to ${RAISED}: ${order?.join(", ") || "teams missing"}` };
  });
  // The open scoreboard tab also follows the score change; live-sync scores both halves.
  if (out.resort.pass) {
    const order = orderOf(await home.evaluate(positions, [names]), names);
    const follows = !!order && order[0] === TEAMS.a[0];
    out.liveSync = { score: (out.liveSync.score ?? 0) * 0.5 + (follows ? 0.5 : 0), detail: `${out.liveSync.detail}; open tab re-sorted ${follows}` };
  } else out.liveSync = { score: (out.liveSync.score ?? 0) * 0.5, detail: `${out.liveSync.detail}; score change not made` };

  out.persists = await attempt(async () => {
    const page = await freshPage(context, url);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(2000);
    const order = orderOf(await page.evaluate(positions, [names]), names);
    const logo = await page.evaluate(logoNear, [TEAMS.a[0], LOGO_RGB]);
    await page.close();
    const facts = [!!order, !!order && (!out.resort.pass || order[0] === TEAMS.a[0]), logo.found];
    return { score: fraction(facts.filter(Boolean).length, 3), detail: `teams ${facts[0]}, score kept ${facts[1]}, logo ${facts[2]}` };
  });

  out.edit = await attempt(async () => {
    const problem = await editName(op, TEAMS.c[0], RENAMED);
    if (problem) return { pass: false, detail: problem };
    await op.waitForTimeout(SYNC_WAIT);
    const page = await freshPage(context, url);
    const [renamed, old] = [await shows(page, RENAMED), await shows(page, TEAMS.c[0], true)];
    await page.close();
    return { pass: renamed && !old, detail: `new name shown ${renamed}, old name gone ${!old}` };
  });
  out.remove = await attempt(async () => {
    const problem = await removeTeam(op, TEAMS.b[0]);
    if (problem) return { pass: false, detail: problem };
    await op.waitForTimeout(SYNC_WAIT);
    const page = await freshPage(context, url);
    const [gone, kept] = [!(await shows(page, TEAMS.b[0], true)), await shows(page, TEAMS.a[0])];
    await page.close();
    return { pass: gone && kept, detail: `removed team gone ${gone}, other teams kept ${kept}` };
  });
  await op.close();
  await home.close();
  return out;
}

export async function interactMobile(context, url) {
  return {
    phoneAdd: await attempt(async () => {
      const home = await freshPage(context, url);
      const link = home.locator("a[href]").filter({ hasText: /operator|admin|control|manage|host|desk|console|dashboard/i }).first();
      const menu = home.locator("button[aria-label*='menu' i]:visible, header [aria-expanded]:visible").first();
      if (!(await link.isVisible().catch(() => false)) && (await menu.count())) await menu.click({ timeout: 5000 }), await home.waitForTimeout(800);
      if (!(await link.isVisible().catch(() => false))) return (await home.close(), { pass: false, detail: "no visible link to the operator page on a phone" });
      const href = await link.evaluate((a) => a.href);
      await home.close();
      const op = await openOperator(context, href);
      const r = await addTeam(op, PHONE_TEAM, 15);
      await op.close();
      if (!r.ok) return { pass: false, detail: "no add-team form on a phone" };
      const page = await freshPage(context, url);
      const seen = await shows(page, PHONE_TEAM);
      await page.close();
      return { pass: seen, detail: `team added on a phone shows on the scoreboard ${seen}` };
    }),
  };
}
