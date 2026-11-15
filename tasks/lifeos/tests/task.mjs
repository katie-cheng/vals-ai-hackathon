// Task-specific part of the verifier: the LifeOS brief's checklist (sidebar sections, top bar, dashboard, tasks, habits, calendar,
// Pomodoro, notes, Chart.js analytics, settings) and the interactions it asks to work. grade.mjs, probe.mjs, lib.mjs and test.sh are
// shared copies of tasks/verifier/; only this file is per task. Checks find controls by role, label and text, never by the golden
// reference's markup, so either path or hash routes and any component structure pass.
import { assignPages, attempt, checkMobileMenu, freshPage, hexDistance, newLines, overlayOpen } from "./lib.mjs";

// Nothing in this brief asks for a pattern that grade.mjs SLOP_CHECKS penalises.
export const SLOP_EXEMPT = {};

const ROLES = {
  tasks: [/task|todo/, /my tasks|tasks/],
  habits: [/habit/],
  calendar: [/calendar|schedule/],
  focus: [/focus|pomodoro|timer/],
  notes: [/notes?\b/],
  analytics: [/analytic|stats|insight|report/],
  settings: [/setting|preference/],
};
const NAV_LABELS = ["overview", "my tasks", "habits", "calendar", "focus mode", "notes", "analytics", "settings"];
const NAV_ITEMS = [...NAV_LABELS, "tasks", "focus", "dashboard", "home"];
const SAMPLE_HABITS = [/read/i, /exercise|workout/i, /water|hydrat/i, /cod(e|ing)/i, /sleep/i];
const MARK = "Renew passport Qz71";
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const fraction = (found, total) => found / total;
const sleep = (page, ms) => page.waitForTimeout(ms);
const bodyText = (page) => page.evaluate(() => document.body.innerText);
const main = (page) => page.locator("main").first();

/** First visible button (or link) whose accessible name matches `re`, preferring the main region. */
async function button(page, re, { within = null, roles = ["button"] } = {}) {
  for (const scope of within ? [within] : [main(page), page]) {
    for (const role of roles) {
      const loc = scope.getByRole(role, { name: re }).filter({ visible: true });
      if (await loc.count()) return loc.first();
    }
  }
  return null;
}

/** The open dialog (role=dialog, <dialog open> or aria-modal), or null. */
async function dialog(page) {
  const loc = page.locator("[role=dialog]:visible, dialog[open], [aria-modal=true]:visible");
  return (await loc.count()) ? loc.last() : null;
}

/** Text inputs and textareas a user types into inside `scope`. */
const textInputs = (scope) => scope.locator("input:not([type]):visible, input[type=text]:visible, textarea:visible");

/** Accepts or dismisses native confirm() dialogs and records whether one appeared. */
function nativeDialogs(page, accept = true) {
  const seen = { count: 0 };
  page.on("dialog", (d) => { seen.count++; (accept ? d.accept() : d.dismiss()).catch(() => {}); });
  return seen;
}

/** Visible check controls in the main region: checkboxes, role=checkbox, or buttons labelled complete/mark/toggle. */
async function checks(page) {
  return main(page).locator("input[type=checkbox]:visible, [role=checkbox]:visible, button[aria-label*='complete' i]:visible, button[aria-label*='mark' i]:visible");
}
async function countChecks(page) {
  return (await checks(page)).count();
}

/** Opens the create-task form on the tasks page and fills it; returns the dialog/form scope or a failure detail. */
async function openTaskForm(page) {
  const add = await button(page, /^(\+\s*)?(add|new|create)( a)? task|^\+$|^add$|^new$/i);
  if (!add) return { error: "no add-task button" };
  await add.click({ timeout: 5000 });
  await sleep(page, 700);
  const dlg = await dialog(page);
  return { dlg, scope: dlg || main(page) };
}

async function submitIn(scope, page) {
  const sub = (await button(page, /^(save|submit|update)\b/i, { within: scope })) || (await button(page, /^(create|add)\b/i, { within: scope })) ||
    scope.locator("button[type=submit]:visible").first();
  await sub.click({ timeout: 5000 });
  await sleep(page, 900);
}

/** Toast: an aria-live / role=status|alert region or a toast-named element gained text. */
const toastText = () =>
  [...document.querySelectorAll("[role=status],[role=alert],[aria-live],[class*=toast i],[class*=snack i],[class*=notif i]")]
    .filter((el) => el.getBoundingClientRect().width > 0).map((el) => el.innerText.trim()).filter(Boolean).join(" | ");

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const pages = views.desktop.pages;
  const byRole = assignPages(pages, ROLES);
  const home = pages[0].facts;
  const textOf = (role) => byRole[role]?.facts?.text || "";
  const allText = pages.map((p) => p.facts.text).join("\n");
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);
  const share = (text, patterns) => patterns.filter((re) => re.test(text));

  add("name", "LifeOS name shown", /lifeos/i.test(home.text) || /lifeos/i.test(home.title) ? 1 : 0);
  const roles = Object.keys(ROLES);
  add("pages", "Overview plus My Tasks, Habits, Calendar, Focus Mode, Notes, Analytics and Settings sections with their own routes",
    fraction(roles.filter((r) => byRole[r]).length, roles.length), roles.map((r) => `${r} ${byRole[r]?.path || "missing"}`).join(", "));
  const navTexts = home.clickables.filter((c) => c.visible).map((c) => c.text.toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim());
  const navFound = NAV_LABELS.filter((n) => navTexts.includes(n));
  add("sidebar-nav", "Sidebar lists Overview, My Tasks, Habits, Calendar, Focus Mode, Notes, Analytics and Settings", fraction(navFound.length, NAV_LABELS.length),
    `missing: ${NAV_LABELS.filter((n) => !navFound.includes(n)).join(", ") || "none"}`);
  fromAct("active-nav", "The current section is highlighted in the navigation", "activeNav");
  fromAct("sidebar-collapse", "The sidebar collapses", "sidebarCollapse");
  fromAct("topbar", "Top bar: page title, search, notifications, current date, avatar, theme toggle", "topbar");
  fromAct("notifications", "The notification icon opens notifications", "notifications");

  const dash = share(home.text, [/good (morning|afternoon|evening)|welcome back|hello,|hi,/i, /total tasks/i, /completed/i, /pending/i, /active habits/i,
    /productivity score|weekly score|weekly productivity/i, /today'?s tasks|tasks for today|due today/i, /habit/i, /upcoming|deadline/i]);
  add("dashboard", "Overview: greeting, total/completed/pending tasks, active habits, weekly score, today's tasks, habits, deadlines", fraction(dash.length, 9), `${dash.length}/9`);
  fromAct("dashboard-chart", "Overview has a weekly productivity chart", "dashboardChart");
  fromAct("quick-actions", "Overview quick action buttons work", "quickActions");
  add("no-lorem", "Realistic sample data, no lorem ipsum", /lorem ipsum|dolor sit amet/i.test(allText) ? 0 : 1);

  fromAct("task-create", "A task can be created in a modal and appears in the list", "taskCreate");
  fromAct("task-validation", "An empty task is rejected with a validation message", "taskValidation");
  fromAct("task-persist", "A new task survives a page reload", "taskPersist");
  fromAct("task-fields", "Tasks take a Low/Medium/High priority, a due date and a category", "taskFields");
  fromAct("task-complete", "A task can be marked completed and shows as completed", "taskComplete");
  fromAct("task-edit", "A task can be edited", "taskEdit");
  fromAct("task-delete", "Deleting a task asks for confirmation and removes it", "taskDelete");
  fromAct("task-search", "Task search narrows the list", "taskSearch");
  fromAct("task-filter", "Tasks filter by status and by priority", "taskFilter");
  fromAct("task-sort", "Tasks sort by deadline and by creation date", "taskSort");
  add("task-overdue", "Overdue tasks are marked", /overdue/i.test(textOf("tasks") + home.text) ? 1 : 0);
  fromAct("toasts", "Actions show toast notifications", "toasts");

  const habits = share(textOf("habits"), SAMPLE_HABITS);
  add("habit-samples", "Sample habits: read 20 minutes, exercise, drink water, practice coding, sleep on time", fraction(habits.length, 5), `${habits.length}/5`);
  const habitFacts = share(textOf("habits"), [/streak/i, /\d+\s?%/]);
  add("habit-stats", "Habits show streaks and completion percentages", fraction(habitFacts.length, 2));
  fromAct("habit-check", "A habit can be marked done for today", "habitCheck");
  fromAct("habit-add", "A habit can be added", "habitAdd");
  fromAct("habit-delete", "A habit can be deleted", "habitDelete");

  fromAct("calendar-month", "Calendar shows the month and navigates between months", "calendarNav");
  fromAct("calendar-today", "Calendar highlights the current date", "calendarToday");
  fromAct("calendar-select", "Clicking a date shows that date's tasks and a task can be added to it", "calendarSelect");

  fromAct("timer-modes", "Pomodoro: 25-minute focus, 5-minute short break and 15-minute long break", "timerModes");
  fromAct("timer-controls", "Pomodoro timer starts, pauses and resets", "timerControls");
  fromAct("timer-custom", "Focus duration can be customised", "timerCustom");
  add("timer-history", "Focus session history is shown", /history|sessions?|completed/i.test(textOf("focus")) ? 1 : 0);

  fromAct("note-create", "A note can be created and saved", "noteCreate");
  fromAct("note-search", "Note search narrows the notes", "noteSearch");
  fromAct("note-pin", "A note can be pinned", "notePin");
  fromAct("note-delete", "A note can be deleted", "noteDelete");
  const noteFacts = [/categor|work|personal|ideas/i.test(textOf("notes")), /edited|modified|updated|ago|today|yesterday/i.test(textOf("notes"))];
  add("note-meta", "Notes show categories and last modified dates", fraction(noteFacts.filter(Boolean).length, 2));

  const analytics = share(textOf("analytics"), [/daily|per day|completion/i, /weekly|trend/i, /habit/i, /focus/i, /priority/i, /completion rate|overall|%/i]);
  add("analytics-topics", "Analytics: daily completion, weekly trend, habit consistency, focus hours, priority split, completion rate", fraction(analytics.length, 6), `${analytics.length}/6`);
  fromAct("analytics-charts", "Analytics draws at least four charts on canvas (Chart.js)", "analyticsCharts");
  fromAct("analytics-live", "Charts change after the underlying task data changes", "analyticsLive");

  fromAct("theme", "Light/dark theme switch changes the page and persists", "theme");
  fromAct("display-name", "Display name setting changes the greeting", "displayName");
  const settings = share(textOf("settings"), [/theme|dark|light/i, /name/i, /pomodoro|focus|break/i, /preference|goal|default/i, /clear|reset|delete all/i]);
  add("settings-sections", "Settings: theme, display name, Pomodoro durations, productivity preferences, clear data", fraction(settings.length, 5), `${settings.length}/5`);
  fromAct("clear-confirm", "Clearing all data asks for confirmation first", "clearConfirm");
  fromAct("persistence", "Settings and data persist after reload", "persistence");

  fromAct("deep-links", "Every section loads directly from its URL", "deepLinks");
  fromAct("reduced-motion", "Animations respect prefers-reduced-motion", "reducedMotion");
  fromAct("mobile-menu", "Sidebar becomes a menu on phones", "mobileMenu");
  const fonts = Object.keys(home.bodyFonts || {}).join(" ") + " " + home.headings.map((h) => h.font).join(" ");
  add("font", "Inter or Geist typography", /inter|geist/i.test(fonts) ? 1 : 0, fonts.slice(0, 80));
  add("palette", "Off-white #F8F9FB background", home.colors.some((c) => hexDistance(c, "#f8f9fb") <= 4) ? 1 : 0);
  return items;
}

export async function interactDesktop(context, url, _handoffs, pages) {
  const byRole = assignPages(pages, ROLES);
  const at = (role) => byRole[role]?.url;
  const out = {};
  const toasts = [];

  out.deepLinks = await attempt(async () => {
    const bad = [];
    for (const p of pages.slice(1)) {
      const page = await context.newPage();
      const res = await page.goto(p.url, { waitUntil: "load", timeout: 60_000 }).catch(() => null);
      await sleep(page, 800);
      const len = await page.evaluate(() => document.body.innerText.length).catch(() => 0);
      if (!res || !res.ok() || len < 200) bad.push(p.path);
      await page.close();
    }
    return { pass: bad.length === 0 && pages.length >= 6, score: pages.length > 1 ? (1 - bad.length / (pages.length - 1)) * Math.min(1, (pages.length - 1) / 7) : 0,
      detail: bad.length ? `broken: ${bad.join(", ")}` : `${pages.length - 1} pages` };
  });

  out.reducedMotion = await attempt(async () => {
    const page = await freshPage(context, url);
    const found = await page.evaluate(() => [...document.styleSheets].some((s) => {
      try { return [...s.cssRules].some((r) => /prefers-reduced-motion/.test(r.conditionText || r.media?.mediaText || "")); } catch { return false; }
    }) || matchMedia("(prefers-reduced-motion: reduce)") instanceof MediaQueryList && /reduced-motion/.test([...document.scripts].map((s) => s.textContent).join("")));
    await page.close();
    return { pass: found, detail: found ? "prefers-reduced-motion rule found" : "no prefers-reduced-motion rule" };
  });

  out.topbar = await attempt(async () => {
    const page = await freshPage(context, at("tasks") || url);
    const r = await page.evaluate((months) => {
      const vis = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.top < 200 && el.checkVisibility({ visibilityProperty: true }); };
      const top = [...document.querySelectorAll("a,button,input,[role=button],h1,h2,time,span,p,div")].filter(vis);
      const name = (el) => `${el.getAttribute("aria-label") || ""} ${el.getAttribute("title") || ""} ${el.placeholder || ""} ${el.innerText || ""}`.toLowerCase();
      const now = new Date();
      const month = months[now.getMonth()];
      const text = top.map((el) => el.innerText || "").join("\n").toLowerCase();
      return {
        title: top.some((el) => /^h[12]$/i.test(el.tagName) && /task/i.test(el.innerText)),
        search: top.some((el) => el.tagName === "INPUT" && /search/.test(name(el))),
        notif: top.some((el) => /notif|bell|alert/.test(name(el)) && /BUTTON|A/.test(el.tagName)),
        date: new RegExp(`(${month}|${month.slice(0, 3)})\\.?\\s+${now.getDate()}\\b|\\b${now.getDate()}\\s+(${month}|${month.slice(0, 3)})`).test(text),
        avatar: top.some((el) => /avatar|profile|account|user/.test(name(el) + " " + (el.className?.baseVal ?? el.className ?? "")) && el.getBoundingClientRect().width <= 60),
        theme: top.some((el) => /theme|dark|light|mode/.test(name(el)) && /BUTTON|A|INPUT/.test(el.tagName)),
      };
    }, MONTHS);
    await page.close();
    const parts = Object.entries(r).filter(([, v]) => v).map(([k]) => k);
    return { pass: parts.length === 6, score: parts.length / 6, detail: `found: ${parts.join(", ")}` };
  });

  out.notifications = await attempt(async () => {
    const page = await freshPage(context, url);
    const bell = page.locator("button[aria-label*='notif' i]:visible, [title*='notif' i]:visible, button[class*='notif' i]:visible, button[aria-label*='bell' i]:visible").first();
    if (!(await bell.count())) return (await page.close(), { pass: false, detail: "no notification button" });
    const before = await bodyText(page);
    await bell.click({ timeout: 5000 });
    await sleep(page, 700);
    const added = newLines(before, await bodyText(page));
    await page.close();
    return { pass: added.length > 0, detail: `new lines: ${added.slice(0, 2).join(" | ")}` };
  });

  out.activeNav = await attempt(async () => {
    const target = at("tasks") || at("habits");
    if (!target) return { pass: false, detail: "no tasks page" };
    const page = await freshPage(context, target);
    const r = await page.evaluate(() => {
      const links = [...document.querySelectorAll("nav a, aside a, [role=navigation] a")].filter((a) => a.getBoundingClientRect().width > 0 && /\w/.test(a.innerText));
      const style = (a) => { const s = getComputedStyle(a); return `${s.backgroundColor}|${s.color}|${s.fontWeight}|${s.borderLeftColor}|${s.boxShadow}`; };
      const active = links.find((a) => a.getAttribute("aria-current") === "page" || /active|current|selected/.test(a.className)) ||
        links.find((a) => /task/i.test(a.innerText) && new URL(a.href, location.href).href === location.href);
      if (!active) return { ok: false, detail: "no current link" };
      const others = links.filter((a) => a !== active).map(style);
      return { ok: /task|habit/i.test(active.innerText) && others.length > 2 && others.every((s) => s !== style(active)), detail: `active "${active.innerText.trim()}"` };
    });
    await page.close();
    return { pass: r.ok, detail: r.detail };
  });

  out.sidebarCollapse = await attempt(async () => {
    const page = await freshPage(context, url);
    const navWidth = () => page.evaluate(() => {
      const n = document.querySelector("aside") || document.querySelector("nav");
      return n ? Math.round(n.getBoundingClientRect().width) : 0;
    });
    const before = await navWidth();
    const btn = await button(page, /collapse|sidebar|toggle (menu|nav)|minimi[sz]e/i, { within: page });
    if (!btn) return (await page.close(), { pass: false, detail: "no collapse control" });
    await btn.click({ timeout: 5000 });
    await sleep(page, 800);
    const after = await navWidth();
    if (after < before * 0.7) { await btn.click({ timeout: 5000 }).catch(() => {}); await sleep(page, 400); }
    await page.close();
    return { pass: after < before * 0.7, detail: `sidebar ${before}px -> ${after}px` };
  });

  out.dashboardChart = await attempt(async () => {
    const page = await freshPage(context, url);
    const n = await page.evaluate(() => [...document.querySelectorAll("canvas, svg")].filter((c) => { const r = c.getBoundingClientRect(); return r.width >= 160 && r.height >= 100; }).length);
    await page.close();
    return { pass: n >= 1, detail: `${n} chart surfaces on the overview` };
  });

  out.quickActions = await attempt(async () => {
    const page = await freshPage(context, url);
    const btns = main(page).getByRole("button", { name: /new|add|start|create|quick/i }).filter({ visible: true });
    const n = Math.min(3, await btns.count());
    let worked = 0;
    for (let i = 0; i < n; i++) {
      await page.goto(url, { waitUntil: "load" });
      await sleep(page, 1200);
      const b = main(page).getByRole("button", { name: /new|add|start|create|quick/i }).filter({ visible: true }).nth(i);
      const before = { href: page.url(), text: await bodyText(page) };
      await b.click({ timeout: 5000 }).catch(() => {});
      await sleep(page, 800);
      if (page.url() !== before.href || (await page.evaluate(overlayOpen)) || newLines(before.text, await bodyText(page)).length) worked++;
      await page.keyboard.press("Escape").catch(() => {});
    }
    await page.close();
    return { pass: n >= 2 && worked === n, score: n ? (worked / n) * Math.min(1, n / 2) : 0, detail: `${worked}/${n} quick actions responded` };
  });

  // Tasks
  const tasksUrl = at("tasks");
  out.taskCreate = await attempt(async () => {
    if (!tasksUrl) return { pass: false, detail: "no tasks page" };
    const page = await freshPage(context, tasksUrl);
    nativeDialogs(page);
    const form = await openTaskForm(page);
    if (form.error) return (await page.close(), { pass: false, detail: form.error });
    const input = textInputs(form.scope).first();
    await input.fill(MARK);
    const fields = await form.scope.evaluate((el) => {
      const root = el;
      const sel = [...root.querySelectorAll("select")];
      const opts = sel.map((s) => [...s.options].map((o) => o.text.toLowerCase()).join(","));
      const btnText = [...root.querySelectorAll("button,[role=radio],label")].map((b) => b.innerText.toLowerCase()).join(",");
      return {
        priority: opts.some((o) => /low/.test(o) && /medium/.test(o) && /high/.test(o)) || (/\blow\b/.test(btnText) && /\bmedium\b/.test(btnText) && /\bhigh\b/.test(btnText)),
        due: !!root.querySelector("input[type=date], input[type=datetime-local]"),
        category: opts.some((o) => /work|personal|health|category/.test(o)) || /categor/i.test(root.innerText),
      };
    });
    out.taskFields = { pass: fields.priority && fields.due && fields.category, score: [fields.priority, fields.due, fields.category].filter(Boolean).length / 3,
      detail: Object.entries(fields).map(([k, v]) => `${k} ${v}`).join(", ") };
    const prio = form.scope.locator("select").filter({ hasText: /high/i }).first();
    if (await prio.count()) await prio.selectOption({ label: await prio.locator("option").filter({ hasText: /high/i }).first().innerText() }).catch(() => {});
    await submitIn(form.scope, page);
    const toast = await page.evaluate(toastText);
    if (toast) toasts.push(`create: ${toast.slice(0, 60)}`);
    const shown = (await bodyText(page)).includes(MARK);
    const closed = !(await dialog(page));
    await page.reload({ waitUntil: "load" });
    await sleep(page, 1500);
    const persisted = (await bodyText(page)).includes(MARK);
    out.taskPersist = { pass: persisted, detail: persisted ? "task still listed after reload" : "task gone after reload" };
    await page.close();
    return { pass: !!form.dlg && shown && closed, score: (form.dlg ? 0.3 : 0) + (shown ? 0.5 : 0) + (closed ? 0.2 : 0), detail: `modal ${!!form.dlg}, listed ${shown}, closed ${closed}` };
  });

  out.taskValidation = await attempt(async () => {
    if (!tasksUrl) return { pass: false, detail: "no tasks page" };
    const page = await freshPage(context, tasksUrl);
    const seen = nativeDialogs(page);
    const before = await countChecks(page);
    const form = await openTaskForm(page);
    if (form.error) return (await page.close(), { pass: false, detail: form.error });
    const text = await bodyText(page);
    await submitIn(form.scope, page);
    const invalid = await page.evaluate(() => document.querySelectorAll(":invalid, [aria-invalid=true]").length);
    const added = newLines(text, await bodyText(page));
    await page.keyboard.press("Escape").catch(() => {});
    await sleep(page, 500);
    const after = await countChecks(page);
    await page.close();
    const message = invalid > 0 || seen.count > 0 || added.some((l) => /required|enter|title|name|empty|please|add a/i.test(l));
    return { pass: message && after <= before, detail: `invalid ${invalid}, alerts ${seen.count}, new lines ${added.slice(0, 2).join(" | ")}, tasks ${before} -> ${after}` };
  });

  out.taskSearch = await attempt(async () => {
    if (!tasksUrl) return { pass: false, detail: "no tasks page" };
    const page = await freshPage(context, tasksUrl);
    const box = main(page).locator("input[type=search]:visible, input[placeholder*='search' i]:visible, input[aria-label*='search' i]:visible").first();
    if (!(await box.count())) return (await page.close(), { pass: false, detail: "no search box on the tasks page" });
    const before = await countChecks(page);
    await box.fill("passport");
    await sleep(page, 800);
    const hit = await countChecks(page);
    const text = await main(page).innerText();
    await box.fill("zzqxv");
    await sleep(page, 800);
    const none = await countChecks(page);
    await page.close();
    return { pass: before >= 5 && hit >= 1 && hit < before && none === 0 && /passport/i.test(text), detail: `${before} tasks, "passport" ${hit}, nonsense ${none}` };
  });

  out.taskFilter = await attempt(async () => {
    if (!tasksUrl) return { pass: false, detail: "no tasks page" };
    const page = await freshPage(context, tasksUrl);
    const before = await countChecks(page);
    const apply = async (re) => {
      const sel = main(page).locator("select:visible").filter({ has: page.locator("option", { hasText: re }) }).first();
      if (await sel.count()) {
        const label = await sel.locator("option").filter({ hasText: re }).first().innerText();
        await sel.selectOption({ label });
      } else {
        const b = await button(page, new RegExp(`^${re.source}$`, "i"), { roles: ["button", "tab", "radio"] });
        if (!b) return null;
        await b.click({ timeout: 5000 });
      }
      await sleep(page, 700);
      return countChecks(page);
    };
    const reset = async () => { await page.reload({ waitUntil: "load" }); await sleep(page, 1200); };
    const high = await apply(/high( priority)?/i);
    await reset();
    const done = await apply(/completed?|done/i);
    await page.close();
    const ok = (n) => n !== null && n >= 1 && n < before;
    return { pass: ok(high) && ok(done), score: (ok(high) ? 0.5 : 0) + (ok(done) ? 0.5 : 0), detail: `${before} tasks, high ${high}, completed ${done}` };
  });

  out.taskSort = await attempt(async () => {
    if (!tasksUrl) return { pass: false, detail: "no tasks page" };
    const page = await freshPage(context, tasksUrl);
    const opts = await page.evaluate(() => [...document.querySelectorAll("main select option, main [role=option], main button, main [role=menuitem]")].map((o) => o.textContent.toLowerCase()).join("|"));
    const hasDue = /due|deadline/.test(opts);
    const hasCreated = /created|newest|oldest|recent|date added/.test(opts);
    let changed = false;
    const sel = main(page).locator("select:visible").filter({ has: page.locator("option", { hasText: /created|newest|oldest|recent|date added/i }) }).first();
    if (await sel.count()) {
      const before = await main(page).innerText();
      const options = await sel.locator("option").allInnerTexts();
      for (const o of options.filter((x) => /created|newest|oldest|recent|added|due|deadline/i.test(x))) {
        await sel.selectOption({ label: o });
        await sleep(page, 500);
        if ((await main(page).innerText()) !== before) changed = true;
      }
    }
    await page.close();
    return { pass: hasDue && hasCreated && changed, score: (hasDue ? 0.3 : 0) + (hasCreated ? 0.3 : 0) + (changed ? 0.4 : 0), detail: `deadline ${hasDue}, creation ${hasCreated}, order changed ${changed}` };
  });

  out.taskComplete = await attempt(async () => {
    if (!tasksUrl) return { pass: false, detail: "no tasks page" };
    const page = await freshPage(context, tasksUrl);
    const state = () => page.evaluate(() => [...document.querySelectorAll("main input[type=checkbox], main [role=checkbox], main button[aria-label*='complete' i], main button[aria-label*='mark' i]")]
      .filter((e) => e.getBoundingClientRect().width > 0).map((e) => `${e.checked ?? ""}${e.getAttribute("aria-checked") ?? ""}${e.getAttribute("aria-pressed") ?? ""}${e.getAttribute("aria-label") ?? ""}`).sort().join("\n"));
    const done = () => page.evaluate(() => [...document.querySelectorAll("main *")].filter((e) => /line-through/.test(getComputedStyle(e).textDecorationLine) || e.checked === true || e.getAttribute("aria-checked") === "true").length);
    const s0 = await state();
    const d0 = await done();
    const before = await bodyText(page);
    const box = (await checks(page)).first();
    if (!(await box.count())) return (await page.close(), { pass: false, detail: "no completion control" });
    await box.click({ timeout: 5000 });
    await sleep(page, 900);
    const toast = await page.evaluate(toastText);
    if (toast) toasts.push(`complete: ${toast.slice(0, 60)}`);
    const s1 = await state();
    const d1 = await done();
    const textChanged = newLines(before, await bodyText(page)).length > 0;
    await page.close();
    return { pass: s1 !== s0 && (d1 !== d0 || textChanged), detail: `control state changed ${s1 !== s0}, completed markers ${d0} -> ${d1}` };
  });

  out.taskEdit = await attempt(async () => {
    if (!tasksUrl) return { pass: false, detail: "no tasks page" };
    const page = await freshPage(context, tasksUrl);
    const edit = await button(page, /\bedit\b/i);
    if (!edit) return (await page.close(), { pass: false, detail: "no edit control" });
    await edit.click({ timeout: 5000 });
    await sleep(page, 700);
    const scope = (await dialog(page)) || main(page);
    const input = textInputs(scope).first();
    const old = await input.inputValue().catch(() => "");
    await input.fill(`${old} edited Kw4`);
    await submitIn(scope, page);
    const shown = (await bodyText(page)).includes("edited Kw4");
    await page.close();
    return { pass: !!old && shown, detail: `prefilled "${old.slice(0, 40)}", updated ${shown}` };
  });

  out.taskDelete = await attempt(async () => {
    if (!tasksUrl) return { pass: false, detail: "no tasks page" };
    const page = await freshPage(context, tasksUrl);
    const seen = nativeDialogs(page);
    const before = await countChecks(page);
    const del = await button(page, /\b(delete|remove|trash)\b/i);
    if (!del) return (await page.close(), { pass: false, detail: "no delete control" });
    await del.click({ timeout: 5000 });
    await sleep(page, 700);
    const custom = await dialog(page);
    let asked = seen.count > 0;
    if (custom) {
      asked = true;
      const yes = await button(page, /delete|remove|confirm|yes/i, { within: custom });
      if (yes) await yes.click({ timeout: 5000 });
    }
    await sleep(page, 900);
    const after = await countChecks(page);
    const toast = await page.evaluate(toastText);
    if (toast) toasts.push(`delete: ${toast.slice(0, 60)}`);
    await page.close();
    return { pass: asked && after === before - 1, score: (asked ? 0.5 : 0) + (after < before ? 0.5 : 0), detail: `confirmation ${asked}, tasks ${before} -> ${after}` };
  });
  out.toasts = { pass: toasts.length >= 2, score: Math.min(1, toasts.length / 2), detail: toasts.join(" ; ") || "no toast seen" };

  // Habits
  const habitsUrl = at("habits");
  out.habitCheck = await attempt(async () => {
    if (!habitsUrl) return { pass: false, detail: "no habits page" };
    const page = await freshPage(context, habitsUrl);
    const before = await main(page).innerText();
    const ctl = (await button(page, /mark|done|complete|check( ?off| ?in)?\b|today/i, { roles: ["button", "checkbox"] })) || (await checks(page)).first();
    if (!ctl || !(await ctl.count())) return (await page.close(), { pass: false, detail: "no habit check control" });
    await ctl.click({ timeout: 5000 });
    await sleep(page, 900);
    const after = await main(page).innerText();
    await page.close();
    return { pass: after !== before, detail: after !== before ? `changed: ${newLines(before, after).slice(0, 2).join(" | ")}` : "nothing changed" };
  });
  out.habitAdd = await attempt(async () => {
    if (!habitsUrl) return { pass: false, detail: "no habits page" };
    const page = await freshPage(context, habitsUrl);
    const addBtn = await button(page, /^(\+\s*)?(add|new|create)( a)?( habit)?$|add habit|new habit/i);
    if (!addBtn) return (await page.close(), { pass: false, detail: "no add-habit button" });
    await addBtn.click({ timeout: 5000 });
    await sleep(page, 700);
    const scope = (await dialog(page)) || main(page);
    await textInputs(scope).first().fill("Stretch Vb9");
    await submitIn(scope, page);
    const shown = (await bodyText(page)).includes("Stretch Vb9");
    await page.close();
    return { pass: shown, detail: shown ? "new habit listed" : "new habit not shown" };
  });
  out.habitDelete = await attempt(async () => {
    if (!habitsUrl) return { pass: false, detail: "no habits page" };
    const page = await freshPage(context, habitsUrl);
    nativeDialogs(page);
    const before = await main(page).innerText();
    const del = await button(page, /\b(delete|remove|trash)\b/i);
    if (!del) return (await page.close(), { pass: false, detail: "no delete control" });
    await del.click({ timeout: 5000 });
    await sleep(page, 700);
    const dlg = await dialog(page);
    if (dlg) { const yes = await button(page, /delete|remove|confirm|yes/i, { within: dlg }); if (yes) await yes.click({ timeout: 5000 }); }
    await sleep(page, 900);
    const gone = newLines(await main(page).innerText(), before).length > 0;
    await page.close();
    return { pass: gone, detail: gone ? "a habit was removed" : "nothing removed" };
  });

  // Calendar
  const calUrl = at("calendar");
  const monthOf = (text) => { const m = text.toLowerCase().match(new RegExp(`\\b(${MONTHS.join("|")})\\s+(20\\d\\d)\\b`)); return m ? `${m[1]} ${m[2]}` : null; };
  out.calendarNav = await attempt(async () => {
    if (!calUrl) return { pass: false, detail: "no calendar page" };
    const page = await freshPage(context, calUrl);
    const m0 = monthOf(await main(page).innerText());
    const next = await button(page, /next|forward|›|>|→|chevron-?right/i);
    if (!m0 || !next) return (await page.close(), { pass: false, score: m0 ? 0.3 : 0, detail: `month heading ${m0}, next button ${!!next}` });
    await next.click({ timeout: 5000 });
    await sleep(page, 700);
    const m1 = monthOf(await main(page).innerText());
    const prev = await button(page, /prev|back|‹|<|←|chevron-?left/i);
    if (prev) { await prev.click({ timeout: 5000 }); await prev.click({ timeout: 5000 }); await sleep(page, 700); }
    const m2 = monthOf(await main(page).innerText());
    await page.close();
    const d = (m) => (m ? MONTHS.indexOf(m.split(" ")[0]) + 12 * Number(m.split(" ")[1]) : NaN);
    const fwd = d(m1) - d(m0) === 1;
    const back = d(m2) - d(m0) === -1;
    return { pass: fwd && back, score: 0.3 + (fwd ? 0.35 : 0) + (back ? 0.35 : 0), detail: `${m0} -> next ${m1} -> back twice ${m2}` };
  });
  out.calendarToday = await attempt(async () => {
    if (!calUrl) return { pass: false, detail: "no calendar page" };
    const page = await freshPage(context, calUrl);
    const r = await page.evaluate(() => {
      const day = String(new Date().getDate());
      const cells = [...document.querySelectorAll("main button, main td, main [role=gridcell], main div")].filter((el) => {
        const t = (el.innerText || "").trim().split("\n")[0].trim();
        const r = el.getBoundingClientRect();
        return t === day && r.width >= 24 && r.width <= 260 && r.height >= 20;
      });
      const marked = cells.filter((el) => el.getAttribute("aria-current") || /today|current/i.test(el.className + " " + [...el.querySelectorAll("*")].map((c) => c.className?.baseVal ?? c.className).join(" ")));
      if (marked.length) return "today marked by attribute or class";
      // Otherwise the cell must look different from a neighbouring day cell.
      const sig = (el) => { const all = [el, ...el.querySelectorAll("*")]; return all.map((x) => { const s = getComputedStyle(x); return `${s.backgroundColor}${s.color}${s.borderColor}${s.fontWeight}${s.boxShadow}`; }).join(); };
      return cells.length ? (cells.some((c) => { const n = c.nextElementSibling || c.previousElementSibling; return n && sig(n) !== sig(c); }) ? "today styled differently" : "") : "";
    });
    await page.close();
    return { pass: !!r, detail: r || "current date not highlighted" };
  });
  out.calendarSelect = await attempt(async () => {
    if (!calUrl) return { pass: false, detail: "no calendar page" };
    const page = await freshPage(context, calUrl);
    nativeDialogs(page);
    const now = new Date();
    const pick = now.getDate() >= 20 ? 12 : 24;
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${pick}`;
    const before = await main(page).innerText();
    const cell = main(page).locator(`[data-date='${iso}']:visible`).first();
    const target = (await cell.count()) ? cell : main(page).locator("button:visible, td:visible, [role=gridcell]:visible").filter({ hasText: new RegExp(`^\\s*${pick}\\b`) }).first();
    if (!(await target.count())) return (await page.close(), { pass: false, detail: `no cell for day ${pick}` });
    await target.click({ timeout: 5000 });
    await sleep(page, 800);
    const after = await main(page).innerText();
    const shows = newLines(before, after).some((l) => new RegExp(`\\b${pick}\\b`).test(l)) || newLines(before, after).length > 0;
    const addBtn = await button(page, /add|new|create|schedule/i);
    let added = false;
    let prefilled = false;
    if (addBtn) {
      await addBtn.click({ timeout: 5000 });
      await sleep(page, 700);
      const scope = (await dialog(page)) || main(page);
      const date = scope.locator("input[type=date]").first();
      if (await date.count()) { prefilled = (await date.inputValue()) === iso; if (!prefilled) await date.fill(iso); }
      await textInputs(scope).first().fill("Dentist follow-up Rt3");
      await submitIn(scope, page);
      await target.click({ timeout: 5000 }).catch(() => {});
      await sleep(page, 700);
      added = (await main(page).innerText()).includes("Dentist follow-up Rt3");
    }
    await page.close();
    return { pass: shows && added && prefilled, score: (shows ? 0.4 : 0) + (added ? 0.4 : 0) + (prefilled ? 0.2 : 0), detail: `date panel ${shows}, add on date ${added}, date prefilled ${prefilled}` };
  });

  // Focus
  const focusUrl = at("focus");
  const clockOf = async (page) => { const m = (await main(page).innerText()).match(/\b(\d{1,3}):([0-5]\d)\b/); return m ? `${Number(m[1])}:${m[2]}` : null; };
  out.timerModes = await attempt(async () => {
    if (!focusUrl) return { pass: false, detail: "no focus page" };
    const page = await freshPage(context, focusUrl);
    const res = { focus: await clockOf(page) };
    for (const [k, re] of [["short", /short/i], ["long", /long/i]]) {
      const b = await button(page, re, { roles: ["tab", "button", "radio"] });
      if (b) { await b.click({ timeout: 5000 }); await sleep(page, 500); res[k] = await clockOf(page); }
    }
    await page.close();
    const ok = [res.focus === "25:00", res.short === "5:00", res.long === "15:00"];
    return { pass: ok.every(Boolean), score: ok.filter(Boolean).length / 3, detail: `focus ${res.focus}, short ${res.short}, long ${res.long}` };
  });
  out.timerControls = await attempt(async () => {
    if (!focusUrl) return { pass: false, detail: "no focus page" };
    const page = await freshPage(context, focusUrl);
    const t0 = await clockOf(page);
    const start = await button(page, /^(start|play|begin|resume)\b|start (focus|timer|session)/i);
    if (!start) return (await page.close(), { pass: false, detail: "no start button" });
    await start.click({ timeout: 5000 });
    await sleep(page, 3200);
    const t1 = await clockOf(page);
    const pause = await button(page, /pause|stop/i);
    let paused = false;
    if (pause) {
      await pause.click({ timeout: 5000 });
      await sleep(page, 300);
      const p0 = await clockOf(page);
      await sleep(page, 2200);
      paused = p0 === (await clockOf(page));
    }
    const reset = await button(page, /reset|restart/i);
    let wasReset = false;
    if (reset) { await reset.click({ timeout: 5000 }); await sleep(page, 600); wasReset = (await clockOf(page)) === t0; }
    await page.close();
    const ran = !!t0 && !!t1 && t1 !== t0;
    return { pass: ran && paused && wasReset, score: (ran ? 0.4 : 0) + (paused ? 0.3 : 0) + (wasReset ? 0.3 : 0), detail: `${t0} -> ${t1} running, paused ${paused}, reset ${wasReset}` };
  });
  out.timerCustom = await attempt(async () => {
    const urls = [focusUrl, at("settings")].filter(Boolean);
    for (const u of urls) {
      const page = await freshPage(context, u);
      const input = page.locator("input[type=number]:visible, input[type=range]:visible").filter({ hasNot: page.locator("xx") });
      const n = await input.count();
      let field = null;
      for (let i = 0; i < n; i++) {
        const id = await input.nth(i).evaluate((el) => `${el.id} ${el.name} ${el.getAttribute("aria-label") || ""} ${el.labels?.[0]?.innerText || ""} ${el.closest("label, .field, div")?.innerText || ""}`.toLowerCase());
        if (/focus|work|pomodoro/.test(id) && !/break|goal/.test(id.split(" ").slice(0, 4).join(" "))) { field = input.nth(i); break; }
      }
      if (!field) { await page.close(); continue; }
      await field.fill("30");
      await field.dispatchEvent("change");
      const save = await button(page, /^save|apply|update/i);
      if (save) await save.click({ timeout: 5000 }).catch(() => {});
      await sleep(page, 600);
      if (focusUrl) { await page.goto(focusUrl, { waitUntil: "load" }); await sleep(page, 1500); }
      const shown = await clockOf(page);
      await page.goto(u, { waitUntil: "load" });
      await sleep(page, 1200);
      const back = page.locator("input[type=number]:visible").filter({ hasNot: page.locator("xx") });
      for (let i = 0; i < (await back.count()); i++) if ((await back.nth(i).inputValue()) === "30") { await back.nth(i).fill("25"); await back.nth(i).dispatchEvent("change"); }
      if (save) await (await button(page, /^save|apply|update/i))?.click({ timeout: 5000 }).catch(() => {});
      await page.close();
      return { pass: shown === "30:00", score: shown === "30:00" ? 1 : 0.3, detail: `focus set to 30 on ${new URL(u).pathname + new URL(u).hash}, timer shows ${shown}` };
    }
    return { pass: false, detail: "no focus duration input" };
  });

  // Notes
  const notesUrl = at("notes");
  out.noteCreate = await attempt(async () => {
    if (!notesUrl) return { pass: false, detail: "no notes page" };
    const page = await freshPage(context, notesUrl);
    const addBtn = await button(page, /^(\+\s*)?(add|new|create)( a)?( note)?$|add note|new note|create note/i);
    if (!addBtn) return (await page.close(), { pass: false, detail: "no new-note button" });
    await addBtn.click({ timeout: 5000 });
    await sleep(page, 700);
    const scope = (await dialog(page)) || main(page);
    const inputs = textInputs(scope);
    await inputs.first().fill("Packing list Mn5");
    const area = scope.locator("textarea:visible, [contenteditable=true]:visible").first();
    if (await area.count()) await area.fill("Charger, passport, rain jacket");
    const save = (await button(page, /^(save|done)\b/i, { within: scope })) || ((await dialog(page)) && (await button(page, /^(create|add)\b/i, { within: scope })));
    if (save) { await save.click({ timeout: 5000 }); await sleep(page, 900); }
    await page.reload({ waitUntil: "load" });
    await sleep(page, 1500);
    const kept = (await bodyText(page)).includes("Packing list Mn5");
    await page.close();
    return { pass: kept, detail: kept ? "note saved and still there after reload" : "note not found after reload" };
  });
  out.noteSearch = await attempt(async () => {
    if (!notesUrl) return { pass: false, detail: "no notes page" };
    const page = await freshPage(context, notesUrl);
    const box = main(page).locator("input[type=search]:visible, input[placeholder*='search' i]:visible, input[aria-label*='search' i]:visible").first();
    if (!(await box.count())) return (await page.close(), { pass: false, detail: "no notes search box" });
    const before = (await main(page).innerText()).length;
    await box.fill("zzqxv");
    await sleep(page, 800);
    const after = (await main(page).innerText()).length;
    await page.close();
    return { pass: after < before * 0.8, detail: `notes text ${before} -> ${after} characters for a nonsense query` };
  });
  out.notePin = await attempt(async () => {
    if (!notesUrl) return { pass: false, detail: "no notes page" };
    const page = await freshPage(context, notesUrl);
    const pins = main(page).getByRole("button", { name: /\bpin\b/i }).filter({ visible: true });
    if (!(await pins.count())) return (await page.close(), { pass: false, detail: "no pin control" });
    const sig = () => page.evaluate(() => [...document.querySelectorAll("main button")].map((b) => `${b.getAttribute("aria-label")}|${b.getAttribute("aria-pressed")}|${b.className}`).join("\n") + document.querySelector("main").innerText);
    const s0 = await sig();
    await pins.last().click({ timeout: 5000 });
    await sleep(page, 800);
    const changed = (await sig()) !== s0;
    await page.close();
    return { pass: changed, detail: changed ? "pin state changed" : "nothing changed" };
  });
  out.noteDelete = await attempt(async () => {
    if (!notesUrl) return { pass: false, detail: "no notes page" };
    const page = await freshPage(context, notesUrl);
    nativeDialogs(page);
    const before = await main(page).innerText();
    let del = await button(page, /\b(delete|remove|trash)\b/i);
    if (!del) {
      for (const sel of ["li:visible button:visible", "article:visible", "li:visible"]) {
        const open = main(page).locator(sel).first();
        if (!(await open.count())) continue;
        await open.click({ timeout: 5000 });
        await sleep(page, 700);
        if ((del = await button(page, /\b(delete|remove|trash)\b/i, { within: page }))) break;
      }
    }
    if (!del) return (await page.close(), { pass: false, detail: "no delete control" });
    await del.click({ timeout: 5000 });
    await sleep(page, 700);
    const dlg = await dialog(page);
    if (dlg) { const yes = await button(page, /delete|remove|confirm|yes/i, { within: dlg }); if (yes) await yes.click({ timeout: 5000 }); }
    await sleep(page, 900);
    const gone = newLines(await main(page).innerText(), before).length > 0;
    await page.close();
    return { pass: gone, detail: gone ? "a note was removed" : "nothing removed" };
  });

  // Analytics
  const anUrl = at("analytics");
  const canvasSig = (page) => page.evaluate(() => [...document.querySelectorAll("canvas")].filter((c) => c.width > 0 && c.getBoundingClientRect().width >= 120).map((c) => c.toDataURL().slice(-400)));
  out.analyticsCharts = await attempt(async () => {
    if (!anUrl) return { pass: false, detail: "no analytics page" };
    const page = await freshPage(context, anUrl);
    await sleep(page, 1000);
    const n = (await canvasSig(page)).length;
    await page.close();
    return { pass: n >= 4, score: Math.min(1, n / 4), detail: `${n} canvas charts` };
  });
  out.analyticsLive = await attempt(async () => {
    if (!anUrl || !tasksUrl) return { pass: false, detail: "no analytics or tasks page" };
    const page = await freshPage(context, anUrl);
    await sleep(page, 1200);
    const s0 = await canvasSig(page);
    await page.goto(tasksUrl, { waitUntil: "load" });
    await sleep(page, 1500);
    const boxes = await checks(page);
    for (let i = 0; i < Math.min(3, await boxes.count()); i++) { await (await checks(page)).nth(i).click({ timeout: 5000 }); await sleep(page, 300); }
    await page.goto(anUrl, { waitUntil: "load" });
    await sleep(page, 2500);
    const s1 = await canvasSig(page);
    await page.close();
    const changed = s0.filter((s, i) => s1[i] !== undefined && s1[i] !== s).length;
    return { pass: s0.length > 0 && changed >= 1, detail: `${changed} of ${s0.length} charts changed after completing tasks` };
  });

  // Settings
  const setUrl = at("settings");
  out.theme = await attempt(async () => {
    const page = await freshPage(context, setUrl || url);
    const bg = () => page.evaluate(() => { const b = getComputedStyle(document.body).backgroundColor; const h = getComputedStyle(document.documentElement).backgroundColor; const m = document.querySelector("main"); return `${b}|${h}|${m ? getComputedStyle(m).backgroundColor : ""}|${getComputedStyle(document.body).color}`; });
    const b0 = await bg();
    const toggle = (await button(page, /^dark\b|dark (mode|theme)|switch to dark|theme|toggle (mode|dark)/i, { within: page, roles: ["button", "radio", "switch", "checkbox", "tab"] }));
    if (!toggle) return (await page.close(), { pass: false, detail: "no theme control" });
    await toggle.click({ timeout: 5000 });
    await sleep(page, 900);
    const b1 = await bg();
    await page.reload({ waitUntil: "load" });
    await sleep(page, 1500);
    const b2 = await bg();
    const light = await button(page, /^light\b|light (mode|theme)|switch to light|theme|toggle (mode|dark)/i, { within: page, roles: ["button", "radio", "switch", "checkbox", "tab"] });
    if (light && b1 !== b0) { await light.click({ timeout: 5000 }); await sleep(page, 600); }
    await page.close();
    return { pass: b1 !== b0 && b2 === b1, score: (b1 !== b0 ? 0.6 : 0) + (b1 !== b0 && b2 === b1 ? 0.4 : 0), detail: `changed ${b1 !== b0}, persisted ${b2 === b1}` };
  });
  out.displayName = await attempt(async () => {
    if (!setUrl) return { pass: false, detail: "no settings page" };
    const page = await freshPage(context, setUrl);
    const input = main(page).locator("input:visible").filter({ hasNot: page.locator("xx") });
    let field = null;
    for (let i = 0; i < (await input.count()); i++) {
      const id = await input.nth(i).evaluate((el) => `${el.type} ${el.id} ${el.name} ${el.placeholder} ${el.getAttribute("aria-label") || ""} ${el.labels?.[0]?.innerText || ""}`.toLowerCase());
      if (/^(text|) /.test(id) && /name/.test(id)) { field = input.nth(i); break; }
    }
    if (!field) return (await page.close(), { pass: false, detail: "no display name field" });
    await field.fill("Jordan");
    await field.press("Enter").catch(() => {});
    const save = await button(page, /^save|apply|update/i);
    if (save) await save.click({ timeout: 5000 }).catch(() => {});
    await sleep(page, 800);
    await page.goto(url, { waitUntil: "load" });
    await sleep(page, 1500);
    const shown = /jordan/i.test(await main(page).innerText());
    out.persistence = { pass: shown, detail: shown ? "display name kept across a full page load" : "name not kept" };
    await page.close();
    return { pass: shown, detail: shown ? "greeting uses the new name" : "overview does not show the new name" };
  });
  out.clearConfirm = await attempt(async () => {
    if (!setUrl) return { pass: false, detail: "no settings page" };
    const page = await freshPage(context, setUrl);
    const seen = nativeDialogs(page, false);
    const btn = await button(page, /clear|reset|erase|delete (all|everything|data)/i);
    if (!btn) return (await page.close(), { pass: false, detail: "no clear-data button" });
    await btn.click({ timeout: 5000 });
    await sleep(page, 800);
    const dlg = await dialog(page);
    if (dlg) { const no = await button(page, /cancel|no|keep|close/i, { within: dlg }); if (no) await no.click({ timeout: 5000 }); else await page.keyboard.press("Escape"); }
    await sleep(page, 600);
    await page.goto(tasksUrl || url, { waitUntil: "load" });
    await sleep(page, 1500);
    const kept = (await countChecks(page)) > 0;
    await page.close();
    const asked = !!dlg || seen.count > 0;
    return { pass: asked && kept, score: (asked ? 0.6 : 0) + (asked && kept ? 0.4 : 0), detail: `confirmation ${asked}, data kept after cancelling ${kept}` };
  });
  return out;
}

export async function interactMobile(context, url) {
  return { mobileMenu: await checkMobileMenu(context, url, NAV_ITEMS) };
}
