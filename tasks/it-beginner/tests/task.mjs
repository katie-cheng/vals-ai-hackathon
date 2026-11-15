// Task-specific part of the verifier: the IT Beginner brief ("Improve or Reconstruct the current Website. make it production ready,
// proffesional one.") for the AjinLab/it-beginner-website repository in /app/existing-site. The checks cover what that site has (its
// pages, curriculum, lesson player, playground, search, quizzes, cheatsheets, sign-in and admin area) and what "production ready" means
// for it (deep links, access control, persistence, a phone menu). grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of
// tasks/verifier/; only this file is per task.
import { assignPages, attempt, checkMobileMenu, freshPage, newLines } from "./lib.mjs";

const ADMIN = { email: "admin@itbeginner.com", password: "admin123" };
// The current site's pages (views/partials/sidebar.ejs, routes/), in order of preference per role.
const ROLES = {
  dashboard: [/dashboard|my-learning|overview/, /dashboard|my learning/],
  courses: [/courses?|curriculum|catalog|learning|chapters?$|syllabus/, /courses?|curriculum|chapters/],
  playground: [/playground|sandbox|editor/, /playground|sandbox/],
  search: [/search/, /search/],
  quizzes: [/quiz/, /quiz/],
  resources: [/resources?|cheat|handbook|reference/, /resources|cheat ?sheets?|handbook/],
  certificates: [/certificat/, /certificat/],
  profile: [/profile|account|settings/, /profile|account|settings/],
  login: [/login|sign-?in|auth/, /^(sign in|log in|login)$/],
  register: [/register|sign-?up|join/, /register|sign up|create account/],
};
const REQUIRED = ["dashboard", "courses", "playground", "search", "quizzes", "resources", "certificates", "profile", "login"];
const CHAPTERS = [/getting started/, /software development/, /web development|web fundamentals/, /frontend development|front-end development/, /vue/, /full.?stack|backend|back-end/];
const HANDBOOKS = [/javascript/, /html/, /\bcss/, /agile|scrum/, /command line|terminal|\bcli\b/, /\bnpm\b/];
const LESSON_COUNT = 42;
const NAV_ITEMS = ["home", "dashboard", "my learning", "learning", "courses", "curriculum", "playground", "search", "quizzes", "resources", "cheatsheets", "certificates", "profile", "settings", "bookmarks", "sign in", "log in"];
const LESSON_PATH = /\/(lessons?|lectures?|videos?|watch)\b/i;
const MARKER = "DEB-PLAYGROUND-4471";

const fraction = (found, total) => found / total;
const lower = (s) => (s || "").toLowerCase();

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const pages = views.desktop.pages;
  const byRole = assignPages(pages, ROLES);
  const home = pages[0].facts;
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);
  const allText = lower(pages.map((p) => p.facts.text).join("\n"));
  const textOf = (role) => lower(byRole[role]?.facts?.text);

  add("name", "IT Beginner brand shown", /it beginner/i.test(home.text) ? 1 : 0);
  add("pages", "The current site's pages each have a route linked from the site: dashboard, courses, playground, search, quizzes, resources, certificates, profile, sign-in",
    fraction(REQUIRED.filter((r) => byRole[r]).length, REQUIRED.length), Object.keys(ROLES).map((r) => `${r} ${byRole[r]?.path || "missing"}`).join(", "));
  const chapters = CHAPTERS.filter((re) => re.test(textOf("courses") || allText));
  add("chapters", "The curriculum's six chapters are shown", fraction(chapters.length, CHAPTERS.length), `${chapters.length}/6`);
  fromAct("lessons", "All 42 lessons are listed, each linking to its own lesson page", "lessons");
  fromAct("lesson-player", "A lesson page has a player, notes or discussion, and a completion toggle that survives a reload", "lessonPlayer");
  fromAct("playground", "The code playground runs the learner's JavaScript and shows its console output", "playground");
  fromAct("search", "Lesson search narrows the results, with a chapter filter", "search");
  fromAct("quiz", "A chapter quiz can be answered and gives feedback or a score", "quiz");
  const books = HANDBOOKS.filter((re) => re.test(textOf("resources")));
  add("resources", "Cheatsheets cover JavaScript, HTML, CSS, Agile/Scrum, the command line and npm", fraction(books.length, HANDBOOKS.length), `${books.length}/${HANDBOOKS.length}`);
  fromAct("sign-in", "Sign-in rejects bad credentials and the demo administrator reaches an admin area with a user roster", "signIn");
  fromAct("admin-protected", "The admin area is not shown to a signed-out visitor", "adminProtected");
  fromAct("register", "A new learner can register and is signed in", "register");
  fromAct("deep-links", "Every page loads directly from its URL", "deepLinks");
  fromAct("mobile-menu", "Mobile menu", "mobileMenu");
  return items;
}

const visibleText = (page) => page.evaluate(() => document.body.innerText);
const sameOrigin = (page, re) =>
  page.evaluate((src) => {
    const re = new RegExp(src, "i");
    return [...new Set([...document.querySelectorAll("a[href]")].map((a) => new URL(a.href, location.href))
      .filter((u) => u.origin === location.origin && re.test(u.pathname + u.hash)).map((u) => u.href))];
  }, re.source);

/** Opens every collapsed toggle in main content, so lessons hidden in accordions are rendered. */
async function expandAll(page) {
  const toggles = page.locator("main [aria-expanded=false]:visible, main summary:visible");
  const n = Math.min(12, await toggles.count());
  for (let i = 0; i < n; i++) await toggles.nth(0).click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(400);
}

async function countLessons(context, coursesUrl) {
  if (!coursesUrl) return { pass: false, detail: "no courses page" };
  const page = await freshPage(context, coursesUrl);
  try {
    await expandAll(page);
    const lessons = new Set(await sameOrigin(page, LESSON_PATH));
    // Chapter pages (S01-style /chapter/3) list their own lessons.
    const chapters = (await sameOrigin(page, /\/(chapters?|modules?|units?)\/[^/]+/)).slice(0, 8);
    for (const href of chapters) {
      await page.goto(href, { waitUntil: "load", timeout: 60_000 });
      await page.waitForTimeout(1200);
      await expandAll(page);
      for (const l of await sameOrigin(page, LESSON_PATH)) lessons.add(l);
    }
    const n = [...lessons].map((h) => new URL(h).pathname).filter((p, i, a) => a.indexOf(p) === i).length;
    return { pass: n >= LESSON_COUNT, score: Math.min(1, n / LESSON_COUNT), detail: `${n} lesson pages linked from the courses page${chapters.length ? ` and ${chapters.length} chapter pages` : ""}` };
  } finally {
    await page.close();
  }
}

async function lessonPlayer(context, coursesUrl, homeUrl) {
  const page = await freshPage(context, coursesUrl || homeUrl);
  try {
    await expandAll(page);
    let href = (await sameOrigin(page, LESSON_PATH))[0];
    if (!href) {
      const chapter = (await sameOrigin(page, /\/(chapters?|modules?|units?)\/[^/]+/))[0];
      if (chapter) {
        await page.goto(chapter, { waitUntil: "load", timeout: 60_000 });
        await page.waitForTimeout(1200);
        href = (await sameOrigin(page, LESSON_PATH))[0];
      }
    }
    if (!href) return { pass: false, detail: "no lesson link" };
    await page.goto(href, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(1500);
    const player = await page.evaluate(() => !!document.querySelector("video, iframe, [role=slider], input[type=range], button[aria-label*=play i]")
      || [...document.querySelectorAll("button")].some((b) => /^\s*(play|pause|resume)\b/i.test(b.innerText || b.getAttribute("title") || "")));
    const notes = (await page.locator("textarea").count()) > 0 || (await page.getByRole("tab", { name: /notes|q ?& ?a|discussion/i }).count()) > 0;
    const toggle = page.locator("button:visible").filter({ hasText: /complete|done|finished/i }).first();
    let persisted = false;
    let detail = "";
    if (await toggle.count()) {
      const before = await toggle.innerText();
      await toggle.click({ timeout: 5000 }).catch(() => toggle.click({ force: true, timeout: 5000 }));
      await page.waitForTimeout(800);
      const after = await visibleText(page);
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(1500);
      const reloaded = await visibleText(page);
      const added = newLines(before, after).filter((l) => /complete|done|finished|✓/i.test(l));
      persisted = added.length > 0 && added.some((l) => reloaded.includes(l));
      detail = `toggle "${before.trim().slice(0, 30)}" -> ${added.slice(0, 2).join(" | ") || "no change"}${persisted ? ", kept after reload" : ""}`;
    } else detail = "no completion toggle";
    const score = (Number(player) + Number(notes) + Number(persisted)) / 3;
    return { pass: score === 1, score, detail: `${new URL(href).pathname}: player ${player}, notes/discussion ${notes}; ${detail}` };
  } finally {
    await page.close();
  }
}

async function playground(context, url) {
  if (!url) return { pass: false, detail: "no playground page" };
  const page = await freshPage(context, url);
  try {
    const jsTab = page.locator("[role=tab]:visible, button:visible").filter({ hasText: /^\s*(js|javascript|script\.js|app\.js)\s*$/i }).first();
    if (await jsTab.count()) await jsTab.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);
    const editor = page.locator(".cm-content:visible, .monaco-editor textarea, textarea:visible, [contenteditable=true]:visible").first();
    if (!(await editor.count())) return { pass: false, detail: "no code editor" };
    await editor.click({ timeout: 5000, force: true });
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Delete");
    await page.keyboard.type(`console.log("${MARKER}")`);
    const run = page.locator("button:visible").filter({ hasText: /\brun\b|execute/i }).first();
    if (await run.count()) await run.click({ timeout: 5000 });
    await page.waitForTimeout(1500);
    const consoleTab = page.locator("[role=tab]:visible, button:visible").filter({ hasText: /^\s*(console|output|logs?)\b/i }).first();
    if (await consoleTab.count()) await consoleTab.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(800);
    // The editor itself holds the marker, so it must appear in output: a leaf outside the editor, or a sandbox frame, without the code.
    const outside = await page.evaluate((m) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const el = node.parentElement;
        if (node.textContent.includes(m) && !node.textContent.includes("console.log") && el && !el.closest("textarea,.cm-editor,.monaco-editor,[contenteditable=true],pre[aria-hidden=true]") && el.checkVisibility()) return true;
      }
      return false;
    }, MARKER);
    let framed = false;
    for (const frame of page.frames().slice(1)) {
      framed ||= await frame.evaluate((m) => { const t = document.body?.innerText || ""; return t.includes(m) && !t.includes("console.log"); }, MARKER).catch(() => false);
    }
    return { pass: outside || framed, detail: outside ? "console output shows the logged text" : framed ? "sandbox frame shows the logged text" : `logged text not shown${(await run.count()) ? "" : ", no run button"}` };
  } finally {
    await page.close();
  }
}

async function search(context, url) {
  if (!url) return { pass: false, detail: "no search page" };
  const page = await freshPage(context, url);
  try {
    const input = page.locator("main input[type=search]:visible, main input[type=text]:visible, input[type=search]:visible, input[placeholder*=search i]:visible").first();
    if (!(await input.count())) return { pass: false, detail: "no search field" };
    const countResults = () => page.evaluate((src) => [...document.querySelectorAll("main a[href], main [role=listitem], main li, main article")]
      .filter((el) => el.checkVisibility() && (el.tagName !== "A" || new RegExp(src, "i").test(el.getAttribute("href")))).length, LESSON_PATH.source);
    const before = await countResults();
    await input.fill("array");
    await input.press("Enter").catch(() => {});
    await page.waitForTimeout(1200);
    const after = await countResults();
    const text = await page.evaluate(() => document.querySelector("main")?.innerText || document.body.innerText);
    const narrowed = after > 0 && after < before && /array/i.test(text);
    const filter = await page.evaluate(() => [...document.querySelectorAll("select")].some((s) => s.options.length >= 6 && /chapter|getting started/i.test(s.innerText + (s.labels?.[0]?.innerText || "")))
      || [...document.querySelectorAll("main button, main [role=tab], main [role=radio]")].filter((b) => /chapter|getting started|vue|software development/i.test(b.innerText)).length >= 4);
    return { pass: narrowed && filter, score: Number(narrowed) * 0.7 + Number(filter) * 0.3, detail: `results ${before} -> ${after} for "array"; chapter filter ${filter}` };
  } finally {
    await page.close();
  }
}

async function quiz(context, url) {
  if (!url) return { pass: false, detail: "no quizzes page" };
  const page = await freshPage(context, url);
  try {
    const start = (await sameOrigin(page, /\/quiz(zes)?\/[^/]+/))[0];
    if (start) {
      await page.goto(start, { waitUntil: "load", timeout: 60_000 });
      await page.waitForTimeout(1500);
    } else {
      const btn = page.locator("main button:visible, main a:visible").filter({ hasText: /start|take|begin|attempt/i }).first();
      if (await btn.count()) await btn.click({ timeout: 5000 }), await page.waitForTimeout(1200);
    }
    const before = await visibleText(page);
    const FEEDBACK = /correct|incorrect|wrong|score|passed|failed|\d+\s*%/i;
    const feedbackLines = async () => newLines(before, await visibleText(page)).filter((l) => FEEDBACK.test(l) && !/answered/i.test(l));
    let answered = 0;
    // Answer every unanswered question shown (radio groups, else option buttons), then submit or go next; quizzes may be one question per step.
    for (let step = 0; step < 15; step++) {
      const names = await page.evaluate(() => [...new Set([...document.querySelectorAll("input[type=radio]")].filter((r) => r.checkVisibility() || r.closest("label")?.checkVisibility()).map((r) => r.name))]
        .filter((n) => !document.querySelector(`input[type=radio][name="${CSS.escape(n)}"]:checked`)));
      for (const n of names) {
        await page.locator(`input[type=radio][name="${n}"]`).first().check({ force: true, timeout: 3000 }).catch(() => {});
        answered++;
      }
      const groups = page.locator("[role=radiogroup]:visible");
      let ariaAnswered = 0;
      for (let g = 0; g < Math.min(20, await groups.count()); g++) {
        const group = groups.nth(g);
        if ((await group.locator("[aria-checked=true]").count()) || !(await group.locator("[role=radio]:enabled").count())) continue;
        await group.locator("[role=radio]").first().click({ timeout: 3000 }).catch(() => {});
        ariaAnswered++;
      }
      answered += ariaAnswered;
      if (!names.length && !ariaAnswered && step === 0) {
        const option = page.locator("[role=radio]:visible").first().or(page.locator("main button:visible").filter({ hasNotText: /submit|check|next|back|reset|retry|start|bookmark|finish/i }).nth(1)).first();
        if (!(await option.count())) return { pass: false, detail: "no answer options" };
        await option.click({ timeout: 5000, force: true });
        answered++;
      }
      await page.waitForTimeout(300);
      const submit = page.locator("button:visible:enabled").filter({ hasText: /submit|check|finish|next|see results|grade/i }).first();
      if (!(await submit.count())) break;
      await submit.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(600);
      if ((await feedbackLines()).length) break;
    }
    await page.waitForTimeout(800);
    const feedback = await feedbackLines();
    return { pass: feedback.length > 0, detail: `${answered} answered; ` + (feedback.slice(0, 2).join(" | ") || "no feedback") };
  } finally {
    await page.close();
  }
}

/** Fills an email + password form on `page` and submits it; returns the page text afterwards. */
async function submitCredentials(page, email, password) {
  const form = page.locator("form:has(input[type=password])").first();
  const scope = (await form.count()) ? form : page.locator("body");
  const emailField = scope.locator("input[type=email], input[name*=email i], input[id*=email i], input[autocomplete=username], input[type=text]").first();
  if (await emailField.count()) await emailField.fill(email);
  await scope.locator("input[type=password]").first().fill(password);
  const submit = scope.locator("button[type=submit], input[type=submit], button:not([type])").filter({ hasText: /sign in|log ?in|continue|submit/i }).first();
  if (await submit.count()) await submit.click({ timeout: 5000 });
  else await scope.locator("input[type=password]").first().press("Enter");
  await page.waitForTimeout(1500);
  return visibleText(page);
}

const signedIn = (text) => /sign ?out|log ?out/i.test(text);

async function signIn(browser, loginUrl, origin) {
  if (!loginUrl) return { result: { pass: false, detail: "no sign-in page" } };
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(loginUrl, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(1500);
    if (!(await page.locator("input[type=password]").count())) return { result: { pass: false, detail: "no password field on the sign-in page" } };
    const shown = (await visibleText(page)).includes(ADMIN.email);
    const wrong = await submitCredentials(page, ADMIN.email, "wrong-password-1");
    const rejected = !signedIn(wrong) && (await page.locator("input[type=password]").count()) > 0 && /invalid|incorrect|wrong|not match|try again|error/i.test(wrong);
    if (!(await page.locator("input[type=password]").count())) await page.goto(loginUrl, { waitUntil: "load" }), await page.waitForTimeout(1200);
    const text = await submitCredentials(page, ADMIN.email, ADMIN.password);
    const ok = signedIn(text) || (!(await page.locator("input[type=password]:visible").count()) && /admin/i.test(text));
    // The admin area: a link the signed-in admin can see, else the current site's /admin route.
    let adminUrl = (await sameOrigin(page, /admin/))[0];
    if (!adminUrl) {
      const menu = page.locator("header button[aria-haspopup]:visible, header button[aria-label*=account i]:visible").first();
      if (await menu.count()) await menu.click().catch(() => {}), await page.waitForTimeout(500), (adminUrl = (await sameOrigin(page, /admin/))[0]);
    }
    adminUrl ||= new URL("/admin", origin).href;
    await page.goto(adminUrl, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(1500);
    const adminText = await visibleText(page);
    const roster = ok && /students?|learners?|users?|roster/i.test(adminText) && (adminText.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).length >= 1;
    const score = (Number(shown) + Number(rejected) + Number(ok) + Number(roster)) / 4;
    return { adminUrl, result: { pass: score === 1, score, detail: `demo credentials shown ${shown}, wrong password rejected ${rejected}, admin signed in ${ok}, roster at ${new URL(adminUrl).pathname} ${roster}` } };
  } finally {
    await context.close();
  }
}

async function adminProtected(browser, adminUrl) {
  if (!adminUrl) return { pass: false, detail: "no admin area found" };
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(adminUrl, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(1500);
    const text = await visibleText(page);
    const leaked = text.includes(ADMIN.email) && !(await page.locator("input[type=password]:visible").count()) || /role|promote|make admin/i.test(text) && (text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).length >= 3;
    return { pass: !leaked, detail: leaked ? `${new URL(adminUrl).pathname} shows the roster signed out` : `${new URL(adminUrl).pathname} asks a signed-out visitor to sign in` };
  } finally {
    await context.close();
  }
}

async function register(browser, registerUrl, loginUrl) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    let url = registerUrl;
    if (!url && loginUrl) {
      await page.goto(loginUrl, { waitUntil: "load", timeout: 60_000 });
      await page.waitForTimeout(1200);
      url = (await sameOrigin(page, /register|sign-?up|join/))[0];
    }
    if (!url) return { pass: false, detail: "no registration page" };
    await page.goto(url, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(1500);
    const form = page.locator("form:has(input[type=password])").first();
    if (!(await form.count())) return { pass: false, detail: "no registration form" };
    const before = await visibleText(page);
    await form.locator("button[type=submit], button:not([type])").last().click({ timeout: 5000 });
    await page.waitForTimeout(800);
    const blocked = !signedIn(await visibleText(page)) && ((await page.evaluate(() => document.querySelectorAll("form :invalid, [aria-invalid=true]").length)) > 0 || newLines(before, await visibleText(page)).length > 0);
    for (const input of await form.locator("input:visible").all()) {
      const t = lower(`${await input.getAttribute("type")} ${await input.getAttribute("name")} ${await input.getAttribute("id")} ${await input.getAttribute("autocomplete")}`);
      if (/checkbox/.test(t)) await input.check().catch(() => {});
      else if (/password/.test(t)) await input.fill("Learner#2026");
      else if (/email/.test(t)) await input.fill("dana.learner@example.com");
      else if (/user/.test(t)) await input.fill("danalearner");
      else await input.fill("Dana Learner");
    }
    await form.locator("button[type=submit], button:not([type])").last().click({ timeout: 5000 });
    await page.waitForTimeout(1500);
    const text = await visibleText(page);
    const ok = signedIn(text) || /dana/i.test(text) && !(await page.locator("input[type=password]:visible").count());
    return { pass: ok && blocked, score: Number(ok) * 0.7 + Number(blocked) * 0.3, detail: `empty form blocked ${blocked}, new account signed in ${ok}` };
  } finally {
    await context.close();
  }
}

export async function interactDesktop(context, url, handoffs, pages) {
  const byRole = assignPages(pages, ROLES);
  const out = {};
  out.lessons = await attempt(() => countLessons(context, byRole.courses?.url));
  out.lessonPlayer = await attempt(() => lessonPlayer(context, byRole.courses?.url, url));
  out.playground = await attempt(() => playground(context, byRole.playground?.url));
  out.search = await attempt(() => search(context, byRole.search?.url));
  out.quiz = await attempt(() => quiz(context, byRole.quizzes?.url));
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
  const browser = context.browser();
  let adminUrl;
  out.signIn = await attempt(async () => {
    const r = await signIn(browser, byRole.login?.url, url);
    adminUrl = r.adminUrl;
    return r.result;
  });
  out.adminProtected = await attempt(() => adminProtected(browser, adminUrl));
  out.register = await attempt(() => register(browser, byRole.register?.url, byRole.login?.url));
  return out;
}

export async function interactMobile(context, url) {
  return { mobileMenu: await checkMobileMenu(context, url, NAV_ITEMS) };
}
