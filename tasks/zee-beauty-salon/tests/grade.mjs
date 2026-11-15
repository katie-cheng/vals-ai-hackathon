// SlopBench verifier: renders a site in Chromium at five widths (390-1920px) plus a resize sweep, scores brief fulfillment (task.mjs)
// and the human-labelled slop patterns (probe.mjs), and writes reward.json + details.json + screenshots.
// Usage: node grade.mjs (--dist /app/dist | --url https://...) --out /logs/verifier
// Playwright is resolved from $PLAYWRIGHT_MODULE_DIR (default /opt/verifier, where the task image installs it).
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";
import { probe } from "./probe.mjs";
import { interactDesktop, interactMobile, requirements } from "./task.mjs";

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
// One desktop page is narrowed through these widths, the way a person resizes a browser window; controls that break are counted once.
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

/** Resizes one page through SWEEP_WIDTHS and collects every control whose label breaks, with the widths where it does. */
async function sweepControls(browser, url) {
  const context = await browser.newContext({ viewport: { width: SWEEP_WIDTHS[0], height: 900 } });
  try {
    const { page } = await openPage(context, url);
    const broken = new Map();
    const byWidth = {};
    for (const width of SWEEP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(300);
      const found = await page.evaluate(probe, "controls");
      byWidth[width] = found.length;
      for (const f of found) {
        const key = `${f.el}|${f.text}`;
        if (!broken.has(key)) broken.set(key, { ...f, widths: [] });
        broken.get(key).widths.push(width);
      }
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

async function grade(url, out) {
  const browser = await chromium.launch();
  const views = {};
  let sweep;
  try {
    for (const [name, options] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext(options);
      // WhatsApp hand-offs are recorded and blocked so booking checks never leave the sandbox.
      const handoffs = [];
      await context.route(/wa\.me|whatsapp\.com/, (route) => {
        handoffs.push(route.request().url());
        return route.abort();
      });
      try {
        const { page, log } = await openPage(context, url);
        await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: FULL_PAGE_SHOTS.has(name), timeout: 60_000 });
        if (FULL_PAGE_SHOTS.has(name)) fs.writeFileSync(path.join(out, `${name}.html`), await page.content());
        const facts = await page.evaluate(probe);
        await page.close();
        const interactions = name === "desktop" ? await interactDesktop(context, url, handoffs) : name === "phone" ? await interactMobile(context, url) : {};
        views[name] = { ok: true, facts, log, interactions };
      } catch (e) {
        views[name] = { ok: false, error: String(e).slice(0, 500) };
      }
      await context.close();
    }
    sweep = await sweepControls(browser, url);
  } finally {
    await browser.close();
  }

  const d = views.desktop;
  const gate = d.ok && d.facts.text.length >= 200 && d.facts.height >= 600 ? 1 : 0;
  const reqs = gate ? requirements(views) : [];
  const rendered = Object.keys(VIEWPORTS).filter((v) => views[v].ok);
  const slop = gate
    ? Object.entries(SLOP_CHECKS).map(([id, cfg]) => {
        if (cfg.sweep) return { id, about: cfg.about, value: sweep.count, points: round(slopPoints(sweep.count, cfg)), by_width: sweep.by_width, examples: sweep.examples };
        const byWidth = Object.fromEntries(rendered.map((v) => [v, round(views[v].facts.slop[id].count)]));
        const value = mean(Object.values(byWidth));
        const worst = rendered.reduce((a, b) => (byWidth[b] > byWidth[a] ? b : a));
        return { id, about: cfg.about, value: round(value), points: round(slopPoints(value, cfg)), by_width: byWidth, examples: views[worst].facts.slop[id].examples };
      })
    : [];
  const requirementsScore = mean(reqs.map((r) => r.score));
  const points = slop.reduce((total, s) => total + s.points, 0);
  const slopScore = gate ? 1 / (1 + points / SLOP_HALF_POINTS) : 0;
  const reward = { reward: round(gate * (requirementsScore + slopScore) / 2), requirements: round(requirementsScore), slop: round(slopScore), slop_points: round(points), gate };
  const details = {
    url,
    reward,
    requirements: reqs,
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
  for (const r of details.requirements) if (r.score < 1) console.log(`req  ${r.score.toFixed(2)}  ${r.id}: ${r.detail}`);
  for (const s of details.slop) if (s.points > 0) console.log(`slop ${s.points.toFixed(2)} pts  ${s.id} = ${s.value}  ${JSON.stringify(s.by_width)}`);
} finally {
  server?.close();
}
