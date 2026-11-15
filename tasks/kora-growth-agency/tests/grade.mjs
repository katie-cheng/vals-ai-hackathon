// SlopBench verifier, shared by every task: renders a site in Chromium at five widths (390-1920px) plus a resize sweep, and writes
// reward.json + details.json + screenshots. Task-agnostic scores: the human-labelled slop patterns (probe.mjs) and the baseline
// checks below. Task-specific scores: the brief's checklist and interactions, from the task's own task.mjs.
// The canonical copy lives in tasks/verifier/; tasks/sync-verifier.sh copies it into each task's tests/.
// Usage: node grade.mjs (--dist /app/dist | --url https://...) --out /logs/verifier
// Playwright is resolved from $PLAYWRIGHT_MODULE_DIR (default /opt/verifier, where the task image installs it).
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";
import { probe } from "./probe.mjs";
import * as task from "./task.mjs";

const { chromium } = createRequire(path.join(process.env.PLAYWRIGHT_MODULE_DIR || "/opt/verifier", "package.json"))("playwright");

// Interactions run at "desktop" and "phone"; slop patterns are counted at every width and averaged.
const VIEWPORTS = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  tablet: { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
  laptop: { viewport: { width: 1280, height: 800 } },
  desktop: { viewport: { width: 1440, height: 900 } },
  wide: { viewport: { width: 1920, height: 1080 } },
};
const FULL_PAGE_SHOTS = new Set(["phone", "desktop"]);
// Pages are the home page plus the same-origin pages it links to, so a multi-page site is graded on every page in its nav.
const MAX_PAGES = 12;
// Each page is narrowed through these widths, the way a person resizes a browser window; controls that break are counted once.
const SWEEP_WIDTHS = [1920, 1680, 1536, 1440, 1366, 1280, 1180, 1100, 1024, 960, 900, 820, 768, 680, 600, 540, 480, 414, 390, 360];
// Each pattern comes from the team's SlopLabel labels. Occurrences beyond `free` cost one slop point per `per_point`,
// and points add up across patterns. Values are provisional: fit them to the arena votes, and check that the golden
// reference stays near 0 points while the labelled arena originals (S03, S04) score high.
const SLOP_CHECKS = {
  eyebrows: { free: 1, per_point: 2, about: "small uppercase letter-spaced label text (unique strings)" },
  heading_accents: { free: 0, per_point: 1, about: "headings with an italic / recoloured / different-font accent span" },
  dot_separators: { free: 1, per_point: 2, about: "· and • separator glyphs" },
  pills: { free: 2, per_point: 3, about: "fully rounded pill buttons and badges" },
  big_rounding: { free: 2, per_point: 3, about: "large containers with radius >= 24px" },
  numbered_markers: { free: 0, per_point: 2, about: "01 / 02 / 03 section, step or menu markers" },
  em_dashes_per_1k_words: { free: 1, per_point: 2, about: "em dashes per 1000 words of copy" },
  emoji_icons: { free: 0, per_point: 1, about: "emoji and dingbat glyphs used as icons" },
  gradient_text: { free: 0, per_point: 1, about: "gradient-filled text" },
  pulsing_dots: { free: 0, per_point: 1, about: "small infinitely animated dots" },
  tiny_text_share: { free: 0.02, per_point: 0.05, about: "share of copy words set below 12px" },
  duplicate_ctas: { free: 0, per_point: 1, about: "the same call to action twice within one block" },
  broken_controls: { free: 0, per_point: 1, sweep: true, about: "buttons, nav links or the logo whose label wraps or overflows at some width from 360 to 1920px" },
};
// task.mjs SLOP_EXEMPT maps a check id to the brief's words asking for that pattern (e.g. floating particles for pulsing_dots).
// An exempt check is still measured and reported, but costs no points: what the brief asks for is not slop.
const SLOP_EXEMPT = task.SLOP_EXEMPT ?? {};
for (const id of Object.keys(SLOP_EXEMPT)) if (!SLOP_CHECKS[id]) throw new Error(`task.mjs SLOP_EXEMPT names unknown slop check "${id}"`);
// Slop points map to a 0-1 score for the reward; this many points halves it.
const SLOP_HALF_POINTS = 15;
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".gif": "image/gif", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
  ".mp4": "video/mp4", ".webm": "video/webm", ".txt": "text/plain", ".xml": "application/xml", ".webmanifest": "application/manifest+json",
};

/** Static server for a Vite build: real files by path, index.html for extensionless (client-side) routes, 404 otherwise. */
function serve(root) {
  const server = http.createServer((req, res) => {
    let file = path.join(root, path.normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)));
    if (!file.startsWith(root)) file = root;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      if (path.extname(file)) return res.writeHead(404).end();
      file = path.join(root, "index.html");
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

/** Opens the page, records console errors and failed image requests, and scrolls once through it so scroll-triggered reveals fire. */
async function openPage(context, url) {
  const page = await context.newPage();
  const log = { consoleErrors: [], failedImages: [] };
  page.on("console", (m) => m.type() === "error" && log.consoleErrors.push(m.text().slice(0, 300)));
  page.on("pageerror", (e) => log.consoleErrors.push(String(e).slice(0, 300)));
  page.on("response", (r) => r.request().resourceType() === "image" && r.status() >= 400 && log.failedImages.push(r.url()));
  page.on("requestfailed", (r) => r.resourceType() === "image" && log.failedImages.push(r.url()));
  await page.goto(url, { waitUntil: "load", timeout: 90_000 });
  await page.waitForTimeout(2500);
  const { height, step } = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, step: innerHeight }));
  for (let y = 0; y < Math.min(height, 20_000); y += step / 2) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  return { page, log };
}

/** A page's identity: its path, plus the route for hash routers (#/menu). Plain #section anchors stay on the same page. */
function pageKey(u) {
  const route = u.hash.startsWith("#/") ? u.hash.replace(/\/+$/, "") : "";
  return route && route !== "#" ? u.pathname + route : u.pathname.replace(/\/+$/, "") || "/";
}

/** Home first, then same-origin pages linked from the home page at desktop width (header, nav and footer links first). */
async function discoverPages(browser, url) {
  const context = await browser.newContext(VIEWPORTS.desktop);
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(2500);
    const links = await page.evaluate(() =>
      [...document.querySelectorAll("a[href]")]
        .map((a) => ({ href: a.href, label: (a.innerText || a.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().toLowerCase(), chrome: !!a.closest("header,nav,footer") }))
        .sort((a, b) => b.chrome - a.chrome),
    );
    const home = new URL(url);
    const pages = new Map([[pageKey(home), { url: home.href, path: pageKey(home), labels: ["home"] }]]);
    for (const link of links) {
      const u = new URL(link.href);
      if (u.origin !== home.origin || /\.[a-z0-9]{2,5}$/i.test(u.pathname)) continue;
      const key = pageKey(u);
      if (!pages.has(key) && pages.size < MAX_PAGES) pages.set(key, { url: u.href, path: key, labels: [] });
      if (pages.has(key) && link.label && !pages.get(key).labels.includes(link.label)) pages.get(key).labels.push(link.label);
    }
    return [...pages.values()];
  } finally {
    await context.close();
  }
}

/** Resizes every page through SWEEP_WIDTHS and collects each control whose label breaks, with the widths where it does. */
async function sweepControls(browser, pages) {
  const context = await browser.newContext({ viewport: { width: SWEEP_WIDTHS[0], height: 900 } });
  try {
    const broken = new Map();
    const byWidth = Object.fromEntries(SWEEP_WIDTHS.map((w) => [w, 0]));
    for (const { url, path: pagePath } of pages) {
      const { page } = await openPage(context, url);
      for (const width of SWEEP_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(300);
        const found = await page.evaluate(probe, "controls");
        byWidth[width] += found.length;
        for (const f of found) {
          // Keyed without the page, so a header control that breaks on every page counts once.
          const key = `${f.el}|${f.text}`;
          if (!broken.has(key)) broken.set(key, { ...f, page: pagePath, widths: [] });
          if (!broken.get(key).widths.includes(width)) broken.get(key).widths.push(width);
        }
      }
      await page.close();
    }
    return { ok: true, count: broken.size, by_width: byWidth, examples: [...broken.values()] };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 500), count: 0, by_width: {}, examples: [] };
  } finally {
    await context.close();
  }
}

function slopPoints(value, { free, per_point }) {
  return Math.max(0, value - free) / per_point;
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const round = (x) => Math.round(x * 10_000) / 10_000;

/** One slop count per width over all pages: counts add up, rates pool their numerators and denominators. */
function combinePages(pages, id) {
  const parts = pages.map((p) => p.facts.slop[id]);
  const examples = pages.flatMap((p) => p.facts.slop[id].examples.map((e) => (pages.length > 1 ? { page: p.path, ...e } : e))).slice(0, 6);
  if (parts[0].den === undefined) return { count: parts.reduce((n, s) => n + s.count, 0), examples };
  const sum = (key) => parts.reduce((n, s) => n + s[key], 0);
  return { count: (parts[0].per * sum("num")) / Math.max(1, sum("den")), examples };
}

/** Checks every site must pass whatever its brief says, in the same {id, desc, score, detail} shape as task.mjs requirements. */
function baseline(views) {
  const rendered = Object.values(views).filter((v) => v.ok);
  const errors = rendered.flatMap((v) => v.log.consoleErrors);
  const broken = new Set(rendered.flatMap((v) => [...v.pages.flatMap((p) => p.facts.brokenImages), ...v.log.failedImages]));
  const overflowing = Object.entries(views).flatMap(([name, v]) => {
    if (!v.ok) return [`${name} failed`];
    const wide = v.pages.filter((p) => p.facts.overflowX > 1).map((p) => `${p.path} ${p.facts.overflowX}px`);
    return wide.length ? [`${name} ${wide.join(" ")}`] : [];
  });
  return [
    { id: "console-clean", desc: "No console errors", score: errors.length ? 0 : 1, detail: errors.slice(0, 2).join(" | ") },
    { id: "images-load", desc: "All images load", score: round(Math.max(0, 1 - broken.size / 5)), detail: [...broken].slice(0, 3).join(", ") },
    { id: "no-overflow", desc: "No horizontal overflow at any width", score: round(1 - overflowing.length / Object.keys(views).length), detail: overflowing.join(", ") },
  ];
}

async function grade(url, out) {
  const browser = await chromium.launch();
  const views = {};
  let sweep;
  let pages = [{ url, path: "/", labels: ["home"] }];
  try {
    try {
      pages = await discoverPages(browser, url);
    } catch {
      // The home page itself failed to load; the viewport loop records that error.
    }
    for (const [name, options] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext(options);
      // Hand-offs the brief asks for (task.mjs HANDOFF_URLS, e.g. a WhatsApp booking) are recorded for the interactions and
      // blocked so they never leave the sandbox.
      const handoffs = [];
      if (task.HANDOFF_URLS) {
        await context.route(task.HANDOFF_URLS, (route) => {
          handoffs.push(route.request().url());
          // task.mjs HANDOFF_REPLY stands in for an endpoint the brief keeps (e.g. a quote API); without it the request is aborted.
          const reply = task.HANDOFF_REPLY?.(route.request());
          return reply ? route.fulfill(reply) : route.abort();
        });
      }
      try {
        const log = { consoleErrors: [], failedImages: [] };
        const pageViews = [];
        for (const [i, p] of pages.entries()) {
          const shot = i === 0 ? name : `${name}-${p.path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;
          try {
            const opened = await openPage(context, p.url);
            if (i === 0 || FULL_PAGE_SHOTS.has(name)) await opened.page.screenshot({ path: path.join(out, `${shot}.png`), fullPage: FULL_PAGE_SHOTS.has(name), timeout: 60_000 });
            if (FULL_PAGE_SHOTS.has(name)) fs.writeFileSync(path.join(out, `${shot}.html`), await opened.page.content());
            const facts = await opened.page.evaluate(probe, i === 0 ? undefined : "inner");
            await opened.page.close();
            log.consoleErrors.push(...opened.log.consoleErrors.map((m) => (i === 0 ? m : `${p.path}: ${m}`)));
            log.failedImages.push(...opened.log.failedImages);
            pageViews.push({ path: p.path, labels: p.labels, facts });
          } catch (e) {
            if (i === 0) throw e;
            log.consoleErrors.push(`${p.path}: page failed to load: ${String(e).split("\n")[0].slice(0, 200)}`);
          }
        }
        const interact = { desktop: task.interactDesktop, phone: task.interactMobile }[name];
        const interactions = interact ? await interact(context, url, handoffs, pages) : {};
        views[name] = { ok: true, facts: pageViews[0].facts, pages: pageViews, log, interactions };
      } catch (e) {
        views[name] = { ok: false, error: String(e).slice(0, 500) };
      }
      await context.close();
    }
    sweep = await sweepControls(browser, pages);
  } finally {
    await browser.close();
  }

  const d = views.desktop;
  // Games and apps may open on a short start screen, so a task can lower the minimum.
  const { minText = 200, minHeight = 600 } = task.GATE || {};
  const gate = d.ok && d.facts.text.length >= minText && d.facts.height >= minHeight ? 1 : 0;
  const taskReqs = gate ? task.requirements(views) : [];
  const baseReqs = gate ? baseline(views) : [];
  const rendered = Object.keys(VIEWPORTS).filter((v) => views[v].ok);
  const slop = gate
    ? Object.entries(SLOP_CHECKS).map(([id, cfg]) => {
        let measured;
        if (cfg.sweep) measured = { value: sweep.count, by_width: sweep.by_width, examples: sweep.examples };
        else {
          const combined = Object.fromEntries(rendered.map((v) => [v, combinePages(views[v].pages, id)]));
          const byWidth = Object.fromEntries(rendered.map((v) => [v, round(combined[v].count)]));
          const worst = rendered.reduce((a, b) => (byWidth[b] > byWidth[a] ? b : a));
          measured = { value: mean(Object.values(byWidth)), by_width: byWidth, examples: combined[worst].examples };
        }
        const exempt = SLOP_EXEMPT[id];
        const points = exempt ? 0 : round(slopPoints(measured.value, cfg));
        return { id, about: cfg.about, value: round(measured.value), points, ...(exempt && { exempt }), by_width: measured.by_width, examples: measured.examples };
      })
    : [];
  const requirementsScore = mean([...taskReqs, ...baseReqs].map((r) => r.score));
  const points = slop.reduce((total, s) => total + s.points, 0);
  const slopRaw = gate ? 1 / (1 + points / SLOP_HALF_POINTS) : 0;
  const taskScore = mean(taskReqs.map((r) => r.score));
  // A page that does little of the brief has little room for slop, so slop credit is scaled by how much of the task it met.
  const slopScore = slopRaw * taskScore;
  const reward = {
    reward: round(gate * (requirementsScore + slopScore) / 2),
    requirements: round(requirementsScore),
    task: round(taskScore),
    baseline: round(mean(baseReqs.map((r) => r.score))),
    slop: round(slopScore),
    slop_raw: round(slopRaw),
    slop_points: round(points),
    gate,
  };
  const details = {
    url,
    pages: pages.map(({ path: pagePath, labels }) => ({ path: pagePath, labels })),
    reward,
    task: taskReqs,
    baseline: baseReqs,
    slop,
    sweep: sweep.ok ? { widths: SWEEP_WIDTHS } : { error: sweep.error },
    views: Object.fromEntries(Object.entries(views).map(([k, v]) => [k, v.ok ? { log: v.log, interactions: v.interactions } : v])),
  };
  fs.writeFileSync(path.join(out, "reward.json"), JSON.stringify(reward) + "\n");
  fs.writeFileSync(path.join(out, "details.json"), JSON.stringify(details, null, 1) + "\n");
  return details;
}

const { values } = parseArgs({ options: { dist: { type: "string" }, url: { type: "string" }, out: { type: "string", default: "/logs/verifier" } } });
if (!values.dist === !values.url) throw new Error("pass exactly one of --dist or --url");
fs.mkdirSync(values.out, { recursive: true });
const server = values.dist ? await serve(path.resolve(values.dist)) : null;
try {
  const url = values.url || `http://127.0.0.1:${server.address().port}/`;
  const details = await grade(url, values.out);
  console.log(JSON.stringify(details.reward));
  for (const [scope, reqs] of [["task", details.task], ["base", details.baseline]]) for (const r of reqs) if (r.score < 1) console.log(`${scope} ${r.score.toFixed(2)}  ${r.id}: ${r.detail}`);
  for (const s of details.slop) {
    if (s.exempt) console.log(`slop exempt     ${s.id} = ${s.value}  (${s.exempt})`);
    else if (s.points > 0) console.log(`slop ${s.points.toFixed(2)} pts  ${s.id} = ${s.value}  ${JSON.stringify(s.by_width)}`);
  }
} finally {
  server?.close();
}
