// Helpers for the tasks' task.mjs files, synced into every task's tests/ with the rest of the shared verifier.

export const norm = (s) => (s || "").toLowerCase().replace(/[’`]/g, "'").replace(/&/g, " and ").replace(/[^a-z0-9#'+ ]+/g, " ").replace(/\s+/g, " ").trim();
export const squash = (s) => norm(s).replace(/\band\b/g, "").replace(/ /g, "");
export const digits = (s) => (s || "").replace(/\D/g, "");

/** Largest per-channel difference between two #rrggbb colours. */
export function hexDistance(a, b) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return Math.max(...p(a).map((x, i) => Math.abs(x - p(b)[i])));
}

/** Runs one interaction check; a thrown error becomes a failed check instead of failing the whole view. */
export async function attempt(fn) {
  try {
    return await fn();
  } catch (e) {
    return { pass: false, detail: `error: ${String(e).split("\n")[0].slice(0, 200)}` };
  }
}

export async function freshPage(context, url) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 90_000 });
  await page.waitForTimeout(2000);
  return page;
}

/** Lines of `after` that were not in `before`, for spotting a confirmation or validation message after an action. */
export function newLines(before, after) {
  const seen = new Set(before.split("\n").map((l) => l.trim()));
  return after.split("\n").map((l) => l.trim()).filter((l) => l && !seen.has(l));
}

/** In-page (page.evaluate): a dialog, or a fixed overlay covering half the viewport that holds an image, is open. */
export function overlayOpen() {
  const visible = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  if ([...document.querySelectorAll("[role=dialog],dialog[open],[aria-modal=true]")].some(visible)) return true;
  return [...document.body.querySelectorAll("*")].some((el) => {
    if (getComputedStyle(el).position !== "fixed" || !el.querySelector("img") || !visible(el)) return false;
    const r = el.getBoundingClientRect();
    return r.width * r.height >= 0.5 * innerWidth * innerHeight;
  });
}

/**
 * Maps page roles to discovered pages ({path, labels}); `roles` maps a role to a list of regexes in order of preference.
 * Paths are matched first for every role, then link labels for the roles still missing, so an "Order now" button that links
 * to the menu does not claim the menu page.
 */
export function assignPages(pages, roles) {
  const found = {};
  const taken = new Set();
  const claim = (role, match) => {
    for (const re of roles[role]) {
      const p = pages.find((x) => x.path !== "/" && !taken.has(x.path) && match(x, re));
      if (p) return (found[role] = p), taken.add(p.path);
    }
  };
  for (const role of Object.keys(roles)) claim(role, (x, re) => re.test(x.path.toLowerCase()));
  for (const role of Object.keys(roles)) if (!found[role]) claim(role, (x, re) => x.labels.some((l) => re.test(l)));
  return found;
}

/** Phone check: the nav starts collapsed (fewer than 4 of `navItems` visible) and a menu toggle reveals at least 4. */
export async function checkMobileMenu(context, url, navItems) {
  const page = await freshPage(context, url);
  const navVisible = (items) =>
    [...document.querySelectorAll("a,button")].filter((el) => {
      const r = el.getBoundingClientRect();
      const label = (el.innerText || "").toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();
      return items.includes(label) && r.width > 0 && r.bottom > 0 && r.top < innerHeight && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    }).length;
  const result = await attempt(async () => {
    const before = await page.evaluate(navVisible, navItems);
    if (before >= 4) return { pass: false, detail: `${before} nav links already visible: no collapsed menu` };
    // Prefer an explicitly labelled toggle, else an icon-only button in the header.
    let toggle = page.locator("button[aria-label*='menu' i]:visible, [aria-expanded]:visible, [aria-controls]:visible").first();
    if (!(await toggle.count())) toggle = page.locator("header button:visible, nav button:visible").filter({ hasNotText: /\w/ }).first();
    if (!(await toggle.count())) return { pass: false, detail: "no menu toggle found" };
    await toggle.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    const after = await page.evaluate(navVisible, navItems);
    return { pass: after >= 4, detail: `nav links visible ${before} -> ${after}` };
  });
  await page.close();
  return result;
}
