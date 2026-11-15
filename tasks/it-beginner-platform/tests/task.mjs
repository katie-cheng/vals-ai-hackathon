// Task-specific part of the verifier: the checklist for "improve or reconstruct github.com/AjinLab/it-beginner-website".
// The brief is one sentence, so the checklist is what the source site contains (environment/source): its course content and its
// features, rebuilt as a client-side app. The source's server-side login, registration and admin suite are out of scope.
// The site may use any routes and markup: pages are found by crawling links from the home page.

// Chapter and lesson titles and quiz questions from the source's seed data (db/database.js).
const CHAPTERS = [
  "Getting Started",
  "Software Development Basics",
  "Web Development Fundamentals",
  "Frontend Development & Tools",
  "Vue.js Framework & Single Page Apps",
  "Full-Stack Architecture & Backend Communication",
];
const LESSONS = [
  "Welcome & Course Overview",
  "Curriculum",
  "How to Access Course Resources",
  "Software Development Workflow",
  "What Is Agile and Scrum",
  "Backlog and Scrum Board in Jira",
  "Chapter Introduction",
  "How Websites Work",
  "What Is JavaScript",
  "Variables & Data Types",
  "How to Execute JavaScript",
  "Conditionals & Comparators",
  "Objects",
  "Arrays",
  "Loops",
  "Functions",
  "Built-in Functions",
  "Intro to HTML & CSS",
  "HTML",
  "CSS",
  "HTML Head Tags",
  "Website With HTML, CSS & JS",
  "Chapter Introduction",
  "Develop Teamable Demo App",
  "JavaScript Frameworks",
  "Maintaining JS Frameworks",
  "Open Source Explained",
  "Libraries Explained",
  "NPM Registry",
  "Versioning in Software Development",
  "How to Use Libraries in JS",
  "NPM CLI",
  "Command Line & OS Basics",
  "Install NPM on macOS",
  "Install NPM on Windows",
  "Install JS Libraries With NPM",
  "Chapter Introduction",
  "Vue.js Tutorial Part 1",
  "Vue.js Tutorial Part 2",
  "Implement Frontend With Vue.js Part 1",
  "Implement Frontend With Vue.js Part 2",
  "Frontend & Backend Communication",
];
const QUESTIONS = [
  "What does Agile methodology emphasize?",
  "What is a Scrum Board used for?",
  "What is a Product Backlog?",
  "Which keyword is used to declare a variable in modern JavaScript?",
  "What is the correct way to write a JavaScript array?",
  "What does HTML stand for?",
  "Which CSS property is used to change text color?",
  "What is a JavaScript function?",
  "Which loop will execute at least once?",
  "What is the DOM?",
  "Which of these is a JavaScript framework?",
  "What does npm stand for?",
  "What is semantic versioning format?",
  "What is open source software?",
  "Which command installs a package with npm?",
  "What is the primary prerequisite to start this IT Beginner course?",
  "Why is hands-on coding recommended while watching course videos?",
  "How should you organize your course files and exercises?",
];
const MAX_PAGES = 120;
const MAX_MOBILE_PAGES = 16;
const MARKER = "graderprobe7391";
const STOP = new Set([
  "a",
  "an",
  "the",
  "is",
  "to",
  "in",
  "of",
  "and",
  "with",
  "what",
  "how",
  "for",
  "on",
  "by",
  "does",
  "which",
  "this",
  "these",
  "your",
  "you",
  "at",
  "it",
  "are",
  "or",
  "used",
  "will",
]);

// Titles are matched loosely, so "JS" / "JavaScript" and small rewordings of the source's titles still count.
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/&/g, " and ")
    .replace(/\bjavascript\b/g, "js")
    .replace(/\boperating system\b/g, "os")
    .replace(/vue\.js/g, "vuejs")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const stem = (t) => (t.length > 3 ? t.replace(/s$/, "") : t);
const tokens = (s) =>
  norm(s)
    .split(" ")
    .filter((t) => t && !STOP.has(t))
    .map(stem);
const lines = (text) => (text || "").split(/\n+/).map(norm).filter(Boolean);
/** True when at least `share` of the title's words are in the line and the line is not much longer than the title. */
function lineMatches(line, title, share = 0.8, slack = 4) {
  const want = tokens(title);
  const have = new Set(line.split(" ").map(stem));
  const found = want.filter((t) => have.has(t)).length;
  return found >= Math.max(1, Math.ceil(want.length * share)) && tokens(line).length <= want.length + slack;
}
const inText = (pageLines, title, share, slack) => pageLines.some((l) => lineMatches(l, title, share, slack));
const fraction = (found, total) => found / total;

async function attempt(fn) {
  try {
    return await fn();
  } catch (e) {
    return { pass: false, detail: `error: ${String(e).split("\n")[0].slice(0, 200)}` };
  }
}

/** Runs in the page: what the page shows and which same-site pages it links to. */
function pageFacts() {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  };
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const links = [];
  for (const a of document.querySelectorAll("a[href]")) {
    const u = new URL(a.getAttribute("href"), location.href);
    if (u.origin !== location.origin || /\.[a-z0-9]{2,5}$/i.test(u.pathname)) continue;
    // Hash routers keep the route in the fragment; plain fragments are in-page anchors.
    links.push({
      url: u.origin + u.pathname + u.search + (u.hash.startsWith("#/") ? u.hash : ""),
      text: clean(a.innerText || a.getAttribute("aria-label")),
      inHeader: !!a.closest("header,nav"),
      visible: visible(a),
    });
  }
  const controls = [...document.querySelectorAll("button,[role=button],[role=tab],a")].filter(visible).map((el) => clean(el.innerText || el.getAttribute("aria-label") || el.title));
  return {
    title: document.title,
    metaDescription: (document.querySelector('meta[name="description"]') || {}).content || "",
    text: document.body.innerText,
    h1: [...document.querySelectorAll("h1")].filter(visible).map((h) => clean(h.innerText)),
    headings: [...document.querySelectorAll("h1,h2,h3")].filter(visible).map((h) => clean(h.innerText)),
    links,
    controls,
    codeBlocks: [...document.querySelectorAll("pre")].filter(visible).length,
    editors: [...document.querySelectorAll("textarea,[contenteditable=true],.cm-content,.monaco-editor")].filter(visible).length,
    iframes: document.querySelectorAll("iframe").length,
    video: document.querySelectorAll("video").length,
    choices: [...document.querySelectorAll("input[type=radio],[role=radio]")].length,
    searchInputs: [...document.querySelectorAll("input")].filter((i) => visible(i) && (i.type === "search" || /search/i.test([i.placeholder, i.name, i.id, i.getAttribute("aria-label")].join(" "))))
      .length,
    progress: document.querySelectorAll("progress,[role=progressbar]").length,
    brokenImages: [...document.images]
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src)
      .slice(0, 5),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

/** Breadth-first crawl of same-site links from the home page. `shape` de-duplicates URLs (used on mobile to visit one page per route). */
async function crawl(context, start, limit, shape = (u) => u) {
  const page = await context.newPage();
  const errors = [];
  let current = start;
  page.on("console", (m) => m.type() === "error" && errors.push(`${new URL(current).pathname}: ${m.text().slice(0, 200)}`));
  page.on("pageerror", (e) => errors.push(`${new URL(current).pathname}: ${String(e).slice(0, 200)}`));
  const home = new URL(start).origin + new URL(start).pathname;
  const queue = [home];
  const seen = new Set([shape(home)]);
  const pages = [];
  while (queue.length && pages.length < limit) {
    current = queue.shift();
    try {
      await page.goto(current, { waitUntil: "load", timeout: 30_000 });
      // A full reload when only the fragment changes, so hash-routed pages render from a cold start too.
      if (current.includes("#/")) await page.reload({ waitUntil: "load", timeout: 30_000 });
      await page.waitForTimeout(pages.length ? 500 : 2000);
      const facts = await page.evaluate(pageFacts);
      pages.push({ url: current, path: current.slice(new URL(current).origin.length), ...facts, lines: lines(facts.text) });
      for (const l of facts.links) {
        if (!seen.has(shape(l.url))) {
          seen.add(shape(l.url));
          queue.push(l.url);
        }
      }
    } catch (e) {
      pages.push({
        url: current,
        path: current.slice(new URL(current).origin.length),
        failed: String(e).split("\n")[0].slice(0, 200),
        text: "",
        lines: [],
        h1: [],
        headings: [],
        links: [],
        controls: [],
      });
    }
  }
  await page.close();
  return { pages, errors, truncated: queue.length };
}

const about = (p, re) => re.test(p.path) || p.h1.some((h) => re.test(h)) || re.test(p.title.split(/[|·–—-]/)[0]);
// A lesson page is headed by a lesson title (its h1, or its first heading when it has no h1), possibly with a subtitle added.
// Lesson pages share one route, so the largest group of such pages under one parent path is taken; that leaves out a
// curriculum page that happens to be headed like the lesson called "Curriculum".
function lessonPagesOf(pages) {
  const groups = new Map();
  for (const p of pages) {
    if (p.failed || !LESSONS.some((t) => (p.h1.length ? p.h1 : p.headings.slice(0, 1)).some((h) => lineMatches(norm(h), t, 0.8, 6)))) continue;
    const key = p.path.replace(/\d+/g, "N").replace(/\/[^/]*$/, "");
    groups.set(key, [...(groups.get(key) || []), p]);
  }
  return [...groups.values()].sort((a, b) => b.length - a.length)[0] || [];
}
const slim = (p) => ({
  path: p.path,
  title: p.title,
  metaDescription: p.metaDescription,
  h1: p.h1,
  headings: p.headings,
  lines: p.lines,
  controls: p.controls,
  failed: p.failed,
  codeBlocks: p.codeBlocks,
  editors: p.editors,
  iframes: p.iframes,
  video: p.video,
  choices: p.choices,
  searchInputs: p.searchInputs,
  progress: p.progress,
  brokenImages: p.brokenImages,
  overflowX: p.overflowX,
  navLinks: p.links.filter((l) => l.inHeader && l.visible).length,
  percent: /\d+\s*%/.test(p.text),
});

async function open(context, url) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 30_000 });
  await page.waitForTimeout(1500);
  return page;
}
const bodyText = (page) => page.evaluate(() => document.body.innerText);
/** Clicks the first visible button, tab or link whose label matches. */
async function clickLabel(page, re) {
  const el = page.locator("button:visible, [role=tab]:visible, [role=button]:visible, input[type=submit]:visible, a:visible").filter({ hasText: re }).first();
  if (!(await el.count())) {
    const named = page.getByRole("button", { name: re }).first();
    if (!(await named.count())) return false;
    await named.click({ timeout: 5000 });
    return true;
  }
  await el.click({ timeout: 5000 });
  return true;
}

export async function interactDesktop(context, url) {
  const { pages, errors, truncated } = await crawl(context, url, MAX_PAGES);
  const out = { crawl: { pages: pages.map(slim), errors: errors.slice(0, 10), errorCount: errors.length, truncated } };
  const ok = pages.filter((p) => !p.failed);
  const lessonPages = lessonPagesOf(ok);
  const COMPLETE = /mark\b.*\b(complete|done|finished)|^complete( lesson)?$|^(mark )?done$|finish lesson/i;
  // The demo learner may already have finished some lessons, so use one that still offers the control.
  const lessonPage = lessonPages.find((p) => p.controls.some((c) => COMPLETE.test(c))) || lessonPages[0];
  const quizPage = ok
    .filter((p) => about(p, /quiz/i))
    .sort((a, b) => b.choices - a.choices || QUESTIONS.filter((q) => inText(b.lines, q, 0.75, 8)).length - QUESTIONS.filter((q) => inText(a.lines, q, 0.75, 8)).length)[0];
  const playgroundPage = ok.find((p) => p.editors && p.iframes) || ok.find((p) => about(p, /playground|sandbox|editor/i));
  const searchPage = ok.find((p) => about(p, /search/i) && p.searchInputs) || ok.find((p) => p.searchInputs);

  // Marking a lesson complete changes what the lesson page shows, and the change survives a reload.
  out.lessonProgress = await attempt(async () => {
    if (!lessonPage) return { pass: false, detail: "no lesson page found" };
    const page = await open(context, lessonPage.url);
    try {
      const before = await bodyText(page);
      if (!(await clickLabel(page, COMPLETE))) return { pass: false, detail: "no mark-complete control" };
      await page.waitForTimeout(1000);
      const after = await bodyText(page);
      if (after === before) return { pass: false, detail: "clicking mark-complete changed nothing" };
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(1500);
      const reloaded = await bodyText(page);
      return { pass: reloaded !== before, detail: reloaded !== before ? "state kept after reload" : "state lost on reload" };
    } finally {
      await page.close();
    }
  });

  // A note typed on a lesson page is shown back after saving.
  out.lessonNotes = await attempt(async () => {
    if (!lessonPage) return { pass: false, detail: "no lesson page found" };
    const page = await open(context, lessonPage.url);
    try {
      const field = () => page.locator("textarea:visible").first();
      if (!(await field().count())) await clickLabel(page, /^\s*(my )?notes?\b/i);
      await page.waitForTimeout(500);
      if (!(await field().count())) return { pass: false, detail: "no note field on the lesson page" };
      await field().fill(`${MARKER} note`);
      const form = field().locator("xpath=ancestor::form[1]");
      const submit = (await form.count())
        ? form.locator("button:visible, input[type=submit]:visible").last()
        : page
            .locator("button:visible")
            .filter({ hasText: /save|add|post/i })
            .first();
      await submit.click({ timeout: 5000 });
      await page.waitForTimeout(1000);
      const shown = await page.evaluate((m) => [...document.querySelectorAll("body *:not(textarea):not(input)")].some((el) => !el.children.length && (el.innerText || "").includes(m)), MARKER);
      return { pass: shown, detail: shown ? "note listed" : "note not shown after saving" };
    } finally {
      await page.close();
    }
  });

  // Answering every question and submitting shows a result.
  out.quizSubmit = await attempt(async () => {
    if (!quizPage) return { pass: false, detail: "no quiz page found" };
    const page = await open(context, quizPage.url);
    try {
      const before = await bodyText(page);
      const RESULT = /\d+\s*(\/|of|out of)\s*\d+\s*(correct|right|points)|\d+\s*%|your score|you scored|\bpassed\b|quiz complete/i;
      const newLines = (text) =>
        text
          .split("\n")
          .filter((l) => !before.includes(l))
          .join(" ");
      const pick = () =>
        page.evaluate(() => {
          const groups = new Map();
          for (const el of document.querySelectorAll("input[type=radio],[role=radio]")) {
            const key =
              el.name ||
              el.closest("fieldset,[role=radiogroup],ul,ol,li,section,div")?.outerHTML.length +
                ":" +
                [...document.querySelectorAll("fieldset,[role=radiogroup]")].indexOf(el.closest("fieldset,[role=radiogroup]"));
            if (!groups.has(key)) groups.set(key, el);
          }
          // One click per group; clicking a group's first option is enough to answer it.
          for (const el of groups.values()) (el.closest("label") || el).click();
          if (groups.size) return groups.size;
          // Quizzes built from plain buttons: the first button of every list of two or more sibling option buttons.
          let n = 0;
          for (const first of document.querySelectorAll("main button:first-child, [role=main] button:first-child")) {
            const siblings = [...first.parentElement.children].filter((c) => c.tagName === "BUTTON");
            if (siblings.length < 2 || siblings.length > 6 || first.closest("header,nav,[role=tablist]")) continue;
            first.click();
            n++;
          }
          return n;
        });
      // Quizzes that show every question at once need one round; quizzes that show one question at a time need one per question.
      const SUBMIT = /submit|finish|check answers?|see (my )?(score|results?)|^\s*(next|continue|check)\b/i;
      let picked = 0;
      let submitted = false;
      for (let round = 0; round < 25; round++) {
        const n = await pick();
        picked += n;
        await page.waitForTimeout(300);
        const button = page.locator("button:visible, input[type=submit]:visible").filter({ hasText: SUBMIT }).first();
        const clicked =
          (await button.count()) > 0 &&
          (await button.click({ timeout: 3000 }).then(
            () => true,
            () => false,
          ));
        submitted = submitted || clicked;
        await page.waitForTimeout(600);
        if ((!n && !clicked) || RESULT.test(newLines(await bodyText(page)))) break;
      }
      if (!submitted) return { pass: false, detail: "no submit control" };
      await page.waitForTimeout(1000);
      const after = await bodyText(page);
      const result = newLines(after).match(RESULT);
      return { pass: !!result, detail: result ? `answered ${picked} questions; result: ${result[0]}` : `answered ${picked} questions; no score shown` };
    } finally {
      await page.close();
    }
  });

  // Code typed into the playground renders in its preview frame.
  out.playgroundRun = await attempt(async () => {
    if (!playgroundPage) return { pass: false, detail: "no playground page found" };
    const page = await open(context, playgroundPage.url);
    try {
      // Multi-file editors: type into the HTML file.
      await clickLabel(page, /^\s*(index\.)?html\s*$/i).catch(() => false);
      await page.waitForTimeout(300);
      const editor = page.locator("textarea:visible, .cm-content:visible, .monaco-editor:visible, [contenteditable=true]:visible").first();
      if (!(await editor.count())) return { pass: false, detail: "no code editor" };
      await editor.click({ timeout: 5000 });
      await page.keyboard.press("ControlOrMeta+A");
      await page.keyboard.insertText(`<p>${MARKER}</p>`);
      await clickLabel(page, /^\s*(▶\s*)?run\b/i).catch(() => false);
      await page.waitForTimeout(1500);
      for (const frame of page.frames()) {
        if (frame === page.mainFrame()) continue;
        if (await frame.evaluate((m) => document.body && document.body.innerText.includes(m), MARKER).catch(() => false)) return { pass: true, detail: "preview shows the typed markup" };
      }
      return { pass: false, detail: "typed markup did not reach the preview" };
    } finally {
      await page.close();
    }
  });

  // Searching for "Vue" lists the Vue lessons and drops unrelated ones.
  out.search = await attempt(async () => {
    if (!searchPage) return { pass: false, detail: "no search field found" };
    const page = await open(context, searchPage.url);
    try {
      const input = page
        .locator("input:visible")
        .filter({ has: page.locator("xpath=self::*[@type='search' or contains(translate(concat(@placeholder,@name,@id,@aria-label),'SEARCH','search'),'search')]") })
        .first();
      await input.fill("Vue");
      await input.press("Enter");
      await page.waitForTimeout(1500);
      const found = lines(await bodyText(page));
      const hit = inText(found, "Vue.js Tutorial Part 1");
      const miss = !inText(found, "How Websites Work", 1, 1) && !inText(found, "Backlog and Scrum Board in Jira", 1, 1);
      return { pass: hit && miss, detail: `Vue lesson listed: ${hit}; unrelated lessons hidden: ${miss}` };
    } finally {
      await page.close();
    }
  });
  return out;
}

export async function interactMobile(context, url) {
  // One page per route shape (/lesson/1 and /lesson/2 count once) is enough to find overflow on a phone.
  const { pages } = await crawl(context, url, MAX_MOBILE_PAGES, (u) => u.replace(/\d+/g, "N").replace(/[?].*$/, ""));
  const overflow = pages.filter((p) => !p.failed && p.overflowX > 1).map((p) => `${p.path} ${p.overflowX}px`);
  const page = await open(context, url);
  const visibleNav = () =>
    [...document.querySelectorAll("header a[href], nav a[href]")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.left >= 0 && r.right <= innerWidth + 1 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    }).length;
  const mobileMenu = await attempt(async () => {
    const before = await page.evaluate(visibleNav);
    if (before >= 4) return { pass: true, detail: `${before} nav links visible without a menu` };
    // Try each labelled toggle in the header, then icon-only buttons, until one reveals the navigation.
    const toggles = page.locator("header button:visible, nav button:visible");
    const order = [];
    for (let i = 0; i < Math.min(await toggles.count(), 8); i++) {
      const label = `${await toggles.nth(i).getAttribute("aria-label")} ${await toggles.nth(i).innerText()}`;
      order.push({ i, rank: /\b(nav|navigation|main menu|open menu|toggle menu)\b/i.test(label) ? 0 : /menu/i.test(label) ? 1 : 2 });
    }
    for (const { i } of order.sort((a, b) => a.rank - b.rank)) {
      await toggles
        .nth(i)
        .click({ timeout: 5000 })
        .catch(() => {});
      await page.waitForTimeout(800);
      const after = await page.evaluate(visibleNav);
      if (after >= 4) return { pass: true, detail: `nav links visible ${before} -> ${after}` };
      await page.keyboard.press("Escape");
      await page.goto(url, { waitUntil: "load" });
      await page.waitForTimeout(1000);
    }
    return { pass: false, detail: `no header button reveals the navigation (${before} links visible)` };
  });
  await page.close();
  return { mobileMenu, mobileOverflow: { pass: overflow.length === 0, detail: overflow.slice(0, 6).join(", "), pages: pages.length, count: overflow.length } };
}

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const rendered = Object.entries(views).filter(([, v]) => v.ok);
  const act = Object.assign({}, ...rendered.map(([, v]) => v.interactions));
  const pages = (act.crawl?.pages || []).filter((p) => !p.failed);
  const failed = (act.crawl?.pages || []).filter((p) => p.failed);
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(Math.max(0, Math.min(1, score)) * 1000) / 1000, detail: String(detail || "").slice(0, 300) });
  const missing = (list, found) => list.filter((x, i) => !found[i]);
  const step = (id, desc) => add(id, desc, act[id]?.pass ? 1 : 0, act[id]?.detail);
  const home = pages[0] || { lines: [], headings: [], title: "", metaDescription: "", navLinks: 0 };
  const anyPage = (title, share, slack) => pages.some((p) => inText(p.lines, title, share, slack));

  // Course content carried over from the source.
  add("site-name", "The site is named IT Beginner", /it\s*beginner/i.test(home.title) || home.lines.some((l) => l.includes("it beginner")) ? 1 : 0, home.title);
  const chapters = CHAPTERS.map((c) => anyPage(c));
  add("chapters", "All 6 chapters are listed", fraction(chapters.filter(Boolean).length, CHAPTERS.length), `missing: ${missing(CHAPTERS, chapters).join(", ")}`);
  const distinct = [...new Set(LESSONS)];
  const listed = distinct.map((t) => anyPage(t));
  add("lessons-listed", "All 42 lessons are listed by title", fraction(listed.filter(Boolean).length, distinct.length), `missing: ${missing(distinct, listed).join(", ")}`);
  const lessonPages = lessonPagesOf(pages);
  add(
    "lesson-pages",
    "Each of the 42 lessons has its own page, headed by its title",
    fraction(Math.min(lessonPages.length, LESSONS.length), LESSONS.length),
    `${lessonPages.length} lesson pages found`,
  );
  const players = lessonPages.filter((p) => p.video || p.controls.some((c) => /\bplay\b|\bpause\b/i.test(c)));
  add("lesson-player", "Lesson pages have a player with a play control", lessonPages.length ? fraction(players.length, lessonPages.length) : 0, `${players.length}/${lessonPages.length} lesson pages`);
  const curriculum = pages.find((p) => !lessonPages.includes(p) && distinct.filter((t) => inText(p.lines, t)).length >= 30);
  add("curriculum-page", "One page lists the whole curriculum", curriculum ? 1 : 0, curriculum?.path);

  // Features of the source site.
  step("lessonProgress", "A lesson can be marked complete and stays complete after a reload");
  step("lessonNotes", "A note can be saved on a lesson");
  const dashboard =
    pages.find((p) => /dashboard|progress|welcome back/i.test(p.path + " " + p.h1.join(" "))) || pages.slice(1).find((p) => p.lines.some((l) => /^(my |your )?(dashboard|progress)$/.test(l)));
  const showsProgress = dashboard && (dashboard.progress > 0 || dashboard.percent || dashboard.lines.some((l) => /\d+ of \d+|\d+ (lessons? )?(completed|complete|done)/.test(l)));
  add("dashboard", "A dashboard shows the learner's progress", dashboard ? (showsProgress ? 1 : 0.5) : 0, dashboard?.path || "no dashboard page");
  const questions = QUESTIONS.map((q) => anyPage(q, 0.75, 8));
  add("quiz-questions", "Chapter quizzes carry the source's questions", fraction(questions.filter(Boolean).length, QUESTIONS.length), `found ${questions.filter(Boolean).length}/${QUESTIONS.length}`);
  step("quizSubmit", "A quiz can be answered and submitted for a score");
  const certificates = pages.find((p) => /certificat/i.test(p.path + " " + p.h1.join(" ")));
  add("certificates", "A certificates page exists", certificates ? 1 : 0, certificates?.path);
  step("playgroundRun", "The code playground renders typed code in a preview");
  step("search", "Lesson search filters by keyword");
  const resources = pages.filter((p) => !lessonPages.includes(p) && p.codeBlocks >= 2 && /resource|cheat ?sheet|handbook|reference/i.test(p.path + " " + p.headings.join(" ")));
  add("cheatsheets", "A resources page has code cheatsheets", resources.length ? 1 : 0, resources[0]?.path);

  // Production readiness.
  add("navigation", "The header links to at least 4 pages on desktop", Math.min(1, home.navLinks / 4), `${home.navLinks} header links`);
  step("mobileMenu", "Navigation is reachable on a phone");
  add("seo-meta", "Title names the site and a meta description exists", (/it\s*beginner/i.test(home.title) ? 0.5 : 0) + (home.metaDescription.trim() ? 0.5 : 0), home.title);
  const dead = pages.filter((p) => p.lines.join(" ").length < 80 || p.h1.some((h) => /not found|404/i.test(h)));
  add(
    "no-dead-links",
    "Every internal link opens a real page",
    1 - Math.min(1, (dead.length + failed.length) / 3),
    [...dead, ...failed]
      .map((p) => p.path)
      .slice(0, 5)
      .join(", "),
  );
  // The shared baseline covers the first 12 pages; these cover every page the crawl reached (all 42 lessons).
  add("console-clean-all", "No console errors on any page", act.crawl?.errorCount ? 0 : 1, (act.crawl?.errors || []).slice(0, 2).join(" | "));
  const broken = new Set(pages.flatMap((p) => p.brokenImages || []));
  add("images-load-all", "All images load on every page", Math.max(0, 1 - broken.size / 5), [...broken].slice(0, 3).join(", "));
  const desktopOverflow = pages.filter((p) => p.overflowX > 1);
  const mobile = act.mobileOverflow;
  add(
    "no-overflow-all",
    "No page overflows horizontally on desktop or phone",
    !mobile ? 0 : 1 - Math.min(1, (desktopOverflow.length + mobile.count) / 4),
    [...desktopOverflow.map((p) => `${p.path} ${p.overflowX}px (desktop)`), mobile?.detail].filter(Boolean).slice(0, 4).join(", "),
  );

  // The source has no reviews, ratings or audience figures; a hit means fabricated content.
  const all = pages.map((p) => p.lines.join("\n")).join("\n");
  const testimonials = all.match(/testimonial|what (our )?(students|learners|developers) (say|are saying)|trusted by|rated \d|\d(\.\d)? ?(out of|\/) ?5\b/);
  add("no-testimonials", "No invented testimonials or ratings", testimonials ? 0 : 1, testimonials?.[0]);
  const claims = all.match(/\b\d{1,3} ?\d{3} (students|learners|developers|graduates|users)\b|\b\d+k (students|learners|developers|graduates|users)\b|\baward winning\b|\bjob guarantee/);
  add("no-invented-claims", "No invented audience figures or awards", claims ? 0 : 1, claims?.[0]);
  return items;
}
