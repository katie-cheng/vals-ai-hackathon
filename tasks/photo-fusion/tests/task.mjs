// Task-specific part of the verifier: the PHOTO FUSION brief's checklist, checked by actually merging images.
// grade.mjs, probe.mjs, lib.mjs and test.sh are shared copies of tasks/verifier/; only this file is per task.
// The grader makes solid-colour test photos in the browser, uploads them (file input and a dropped file), and reads the
// colours back out of the on-screen preview and the downloaded file, so a mock-up that does not really merge cannot pass.
import fs from "node:fs";
import { attempt, freshPage } from "./lib.mjs";

export const SLOP_EXEMPT = {};

// Test photos: 800x800 solid squares in colours no UI is likely to use at area.
const PHOTOS = { red: [229, 57, 53], green: [67, 160, 71], blue: [30, 136, 229], yellow: [253, 216, 53] };
const MAGENTA = [255, 0, 255];
const SIDE = 800;
const PRESENT = 0.01;

const fraction = (found, total) => found / total;

/** Each item: {id, desc, score in [0,1], detail}. */
export function requirements(views) {
  const d = views.desktop.facts;
  const act = Object.assign({}, ...Object.values(views).filter((v) => v.ok).map((v) => v.interactions));
  const items = [];
  const add = (id, desc, score, detail = "") => items.push({ id, desc, score: Math.round(score * 1000) / 1000, detail });
  const fromAct = (id, desc, key) => add(id, desc, act[key]?.score ?? (act[key]?.pass ? 1 : 0), act[key]?.detail);

  add("name", "Site is called PHOTO FUSION, an image merger", (/photo\s*fusion/i.test(d.text) ? 0.5 : 0) + (/image merger/i.test(d.text) ? 0.5 : 0));
  add("seo-meta", "Title names PHOTO FUSION and a meta description exists", (/photo\s*fusion/i.test(d.title) ? 0.5 : 0) + (d.metaDescription.trim() ? 0.5 : 0), d.title);
  const labels = d.clickables.map((c) => (c.text || c.label || "").toLowerCase().trim());
  const login = d.fields.some((f) => f.type === "password") || labels.some((l) => /^(log ?in|sign ?in|sign ?up|register|create (an )?account|my account)$/.test(l));
  add("no-login", "No login or account required", login ? 0 : 1);
  const store = d.text.match(/add to (cart|bag)|shopping (cart|bag)|\bcheckout\b|shop now|buy now|\bour (store|shop|products)\b|[$€£]\s?\d+(\.\d\d)?\b/i);
  add("no-store", "No products or online store", store ? 0 : 1, store ? store[0] : "");
  fromAct("multi-upload", "File picker takes several images at once (multiple, image types)", "picker");
  add("upload-button", "A large upload button (at least 48px tall and 160px wide on desktop, 44px tall on a phone)",
    ((act.uploadButton?.pass ? 1 : 0) + (act.phoneButton?.pass ? 1 : 0)) / 2, `desktop ${act.uploadButton?.detail}; phone ${act.phoneButton?.detail}`);
  fromAct("upload-preview", "Uploading three photos shows all three in a merged preview straight away", "uploadPreview");
  fromAct("horizontal", "Horizontal layout puts the photos side by side", "horizontal");
  fromAct("vertical", "Vertical layout stacks the photos", "vertical");
  fromAct("rearrange", "Uploaded photos can be rearranged", "rearrange");
  fromAct("remove", "An uploaded photo can be removed", "remove");
  fromAct("drag-drop", "Dropping image files onto the page adds them", "dragDrop");
  fromAct("grid", "Grid layout arranges four photos in rows and columns", "grid");
  fromAct("collage", "A collage layout distinct from the grid and the strips", "collage");
  fromAct("spacing", "Spacing control changes the merged image", "spacing");
  fromAct("background", "A custom background colour shows in the merged image", "background");
  fromAct("border", "Border control changes the merged image", "border");
  fromAct("download-png", "Downloads a real merged PNG holding every photo at high resolution", "downloadPng");
  fromAct("size", "Image size control changes the downloaded dimensions", "size");
  fromAct("download-jpg", "Downloads a real merged JPG", "downloadJpg");
  fromAct("phone-merge", "Uploading and previewing a merge works on a phone", "phoneMerge");
  fromAct("palette", "White and dark blue palette with a purple gradient", "palette");
  fromAct("motion", "Animations and smooth transitions", "motion");
  fromAct("reduced-motion", "Reduced-motion users see every section heading", "reducedMotion");
  return items;
}

/** In-page: base64 PNGs of solid squares, one per name. */
function makePhotos({ names, colors, side }) {
  return names.map((n) => {
    const c = document.createElement("canvas");
    c.width = c.height = side;
    const ctx = c.getContext("2d");
    ctx.fillStyle = `rgb(${colors[n].join(",")})`;
    ctx.fillRect(0, 0, side, side);
    return c.toDataURL("image/png").split(",")[1];
  });
}

async function photoFiles(page, names) {
  const data = await page.evaluate(makePhotos, { names, colors: PHOTOS, side: SIDE });
  return names.map((n, i) => ({ name: `${n}.png`, mimeType: "image/png", buffer: Buffer.from(data[i], "base64") }));
}

/** In-page: decodes an image data URL and reports its size, the share and centroid of each colour, and a coarse thumbnail. */
async function analyze({ src, colors }) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const N = 64;
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, N, N);
  const px = ctx.getImageData(0, 0, N, N).data;
  const out = {};
  for (const [name, rgb] of Object.entries(colors)) {
    let n = 0, sx = 0, sy = 0;
    for (let i = 0; i < N * N; i++) {
      const a = px[i * 4 + 3];
      if (a > 200 && Math.abs(px[i * 4] - rgb[0]) <= 36 && Math.abs(px[i * 4 + 1] - rgb[1]) <= 36 && Math.abs(px[i * 4 + 2] - rgb[2]) <= 36) {
        n++;
        sx += i % N;
        sy += Math.floor(i / N);
      }
    }
    out[name] = { share: n / (N * N), x: n ? sx / n / N : null, y: n ? sy / n / N : null };
  }
  // Bounding box of the photo pixels, so a merge drawn inside a fixed-size canvas is measured by the photos themselves.
  let x0 = N, x1 = -1, y0 = N, y1 = -1;
  for (let i = 0; i < N * N; i++) {
    const hit = Object.entries(colors).some(([name, rgb]) => name !== "magenta" && px[i * 4 + 3] > 200 && Math.abs(px[i * 4] - rgb[0]) <= 36 && Math.abs(px[i * 4 + 1] - rgb[1]) <= 36 && Math.abs(px[i * 4 + 2] - rgb[2]) <= 36);
    if (hit) (x0 = Math.min(x0, i % N)), (x1 = Math.max(x1, i % N)), (y0 = Math.min(y0, Math.floor(i / N))), (y1 = Math.max(y1, Math.floor(i / N)));
  }
  const photoRatio = x1 < 0 ? 0 : ((x1 - x0 + 1) * img.naturalWidth) / ((y1 - y0 + 1) * img.naturalHeight);
  const thumb = [];
  for (let i = 0; i < N * N; i += 37) thumb.push(px[i * 4], px[i * 4 + 1], px[i * 4 + 2], px[i * 4 + 3]);
  return { w: img.naturalWidth, h: img.naturalHeight, colors: out, thumb, photoRatio };
}

/** In-page: marks up to four candidates for the merged preview: large canvases and uploaded or generated images. */
function markPreviews(side) {
  document.querySelectorAll("[data-sbp]").forEach((e) => e.removeAttribute("data-sbp"));
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width >= 100 && r.height >= 60 && el.checkVisibility({ visibilityProperty: true });
  };
  const local = (el) => /^(blob:|data:)/.test(el.currentSrc || el.src || "");
  const area = (el) => el.getBoundingClientRect().width * el.getBoundingClientRect().height;
  const media = [...document.querySelectorAll("canvas, img")].filter((el) => vis(el) && (el.tagName === "CANVAS" || local(el))).sort((a, b) => area(b) - area(a));
  const picked = [];
  for (const m of media) {
    let el = m;
    // One of the uploaded photos shown as is: the preview is built from DOM images, so take the box holding several.
    if (m.tagName === "IMG" && m.naturalWidth === side && m.naturalHeight === side) {
      let up = m.parentElement;
      while (up && up !== document.body) {
        if ([...up.querySelectorAll("img")].filter((i) => local(i) && vis(i)).length >= 2) break;
        up = up.parentElement;
      }
      if (up && up !== document.body) el = up;
    }
    if (!picked.includes(el)) picked.push(el);
    if (picked.length === 4) break;
  }
  picked.forEach((el, i) => el.setAttribute("data-sbp", String(i)));
  return picked.map((el) => ({ tag: el.tagName.toLowerCase(), w: el.width || el.naturalWidth || 0, h: el.height || el.naturalHeight || 0 }));
}

/** The merged preview: the first candidate showing at least `min` of the expected photo colours. */
async function preview(page, expect, min = Math.min(2, expect.length)) {
  await page.waitForTimeout(900);
  const found = await page.evaluate(markPreviews, SIDE);
  for (let i = 0; i < found.length; i++) {
    const el = page.locator(`[data-sbp="${i}"]`);
    // Scrolled into view first, so a scroll-triggered fade-in has run before the screenshot.
    if (i === 0 || !(await el.isVisible())) {
      await el.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(700);
    }
    const shot = await el.screenshot({ animations: "disabled", timeout: 8000 }).catch(() => null);
    if (!shot) continue;
    const a = await page.evaluate(analyze, { src: `data:image/png;base64,${shot.toString("base64")}`, colors: { ...PHOTOS, magenta: MAGENTA } });
    if (expect.filter((n) => a.colors[n].share >= PRESENT).length >= min) return { ...a, ...found[i], ratio: a.w / a.h };
  }
  return null;
}

const present = (a, names) => names.filter((n) => a.colors[n].share >= PRESENT);
const differs = (a, b) => {
  if (!a || !b) return false;
  if (Math.abs(a.ratio - b.ratio) > 0.02 || a.w !== b.w || a.h !== b.h) return true;
  let diff = 0;
  for (let i = 0; i < Math.min(a.thumb.length, b.thumb.length); i++) diff += Math.abs(a.thumb[i] - b.thumb[i]);
  return diff / a.thumb.length > 1.5;
};
const order = (a, names, axis) => names.filter((n) => a.colors[n].share >= PRESENT).sort((p, q) => a.colors[p][axis] - a.colors[q][axis]);

/** In-page: tags the visible control whose label matches, preferring the given kinds. Returns its kind, or null. */
function markControl({ source, flags, avoid, kinds, pick = 0 }) {
  document.querySelectorAll("[data-sbc]").forEach((e) => e.removeAttribute("data-sbc"));
  const re = new RegExp(source, flags);
  const no = avoid ? new RegExp(avoid, "i") : null;
  const vis = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ visibilityProperty: true });
  const labelOf = (el) => {
    const parts = [el.getAttribute("aria-label"), el.getAttribute("title"), el.getAttribute("name"), el.id];
    if (el.labels) parts.push(...[...el.labels].map((l) => l.innerText));
    const by = el.getAttribute("aria-labelledby");
    if (by) parts.push(...by.split(" ").map((id) => document.getElementById(id)?.innerText));
    if (el.matches("button,[role=radio],[role=tab],[role=option],a,label")) parts.push(el.innerText);
    // Unlabelled inputs: the nearest text before them in their field box.
    if (el.matches("input,select") && !el.labels?.length && !by) {
      let box = el.parentElement;
      for (let k = 0; k < 3 && box && !box.innerText.trim(); k++) box = box.parentElement;
      if (box) parts.push(box.innerText.split("\n")[0]);
    }
    return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  };
  const selectors = {
    range: "input[type=range],[role=slider]",
    number: "input[type=number]",
    select: "select",
    color: "input[type=color]",
    button: "button,[role=radio],[role=tab],[role=option],label,a[href='#'],[role=button]",
  };
  for (const kind of kinds) {
    const els = [...document.querySelectorAll(selectors[kind])].filter((el) => {
      if (el.closest("header,nav,footer") || (kind !== "color" && !vis(el))) return false;
      const l = labelOf(el);
      return re.test(l) && !(no && no.test(l)) && l.length <= 80;
    });
    // The most specific label first: "Horizontal" before a section toggle reading "Layout: horizontal, vertical or grid".
    els.sort((a, b) => labelOf(a).length - labelOf(b).length);
    if (els.length > pick) {
      els[pick].setAttribute("data-sbc", "1");
      return { kind, label: labelOf(els[pick]).slice(0, 60), count: els.length };
    }
    if (els.length) continue;
    // A select whose options name the choice (e.g. a layout dropdown).
    if (kind === "button") {
      const sel = [...document.querySelectorAll("select")].find((s) => vis(s) && [...s.options].some((o) => re.test(o.text)));
      if (sel) {
        sel.setAttribute("data-sbc", "1");
        return { kind: "option", value: [...sel.options].find((o) => re.test(o.text)).value };
      }
    }
  }
  return null;
}

/** Clicks or selects the choice labelled `re` (a layout or format). */
async function choose(page, re, avoid) {
  const c = await page.evaluate(markControl, { source: re.source, flags: re.flags, avoid, kinds: ["button"] });
  if (!c) return null;
  const el = page.locator("[data-sbc]");
  if (c.kind === "option") await el.selectOption(c.value);
  else {
    await el.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    await el.click({ timeout: 4000 });
  }
  return c;
}

/** Moves the setting labelled `re` well away from its current value, whatever kind of control it is. */
async function adjust(page, re, avoid, pick = 0) {
  const args = { source: re.source, flags: re.flags, avoid, pick };
  let c = await page.evaluate(markControl, { ...args, kinds: ["range", "number", "select"] });
  if (!c) {
    // A button labelled with the setting: either the setting itself, or a collapsed panel holding its slider.
    c = (await page.evaluate(markControl, { ...args, kinds: ["button"] })) || (await page.evaluate(markControl, { ...args, avoid: null, kinds: ["button"] }));
    if (!c) return null;
    const toggle = page.locator("[data-sbc]");
    await toggle.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    await toggle.click({ timeout: 4000 });
    await page.waitForTimeout(500);
    const inner = await page.evaluate(markControl, { ...args, kinds: ["range", "number", "select"] });
    if (!inner) return c;
    c = { ...inner, label: `${c.label} > ${inner.label}` };
  }
  const el = page.locator("[data-sbc]");
  await el.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
  if (c.kind === "range" || c.kind === "number") {
    await el.evaluate((input) => {
      const isRange = input.matches("input");
      const min = Number(input.min || input.getAttribute("aria-valuemin") || 0);
      const max = Number(input.max || input.getAttribute("aria-valuemax") || 100);
      const now = Number(input.value ?? input.getAttribute("aria-valuenow"));
      const target = now - min < (max - min) / 2 ? min + 0.75 * (max - min) : min;
      if (!isRange) return;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, String(Math.round(target)));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    if (c.kind === "range" && !(await el.evaluate((e) => e.matches("input")))) {
      await el.focus();
      for (let i = 0; i < 12; i++) await page.keyboard.press("PageUp");
    }
  } else if (c.kind === "select") {
    const values = await el.evaluate((s) => [...s.options].map((o) => o.value));
    const now = await el.inputValue();
    await el.selectOption(values[values.indexOf(now) === values.length - 1 ? 0 : values.length - 1]);
  }
  return c;
}

/** Clicks the download control (and a confirm button in a dialog it opens) and returns the file's bytes. */
async function download(page) {
  const found = await page.evaluate(() => {
    document.querySelectorAll("[data-sbd]").forEach((e) => e.removeAttribute("data-sbd"));
    const els = [...document.querySelectorAll("button,a,[role=button]")].filter((el) => {
      const t = (el.innerText || el.getAttribute("aria-label") || "").trim();
      return /download|export|save/i.test(t) && t.length <= 40 && !el.closest("header,nav,footer,details") && el.getBoundingClientRect().width > 0 && el.checkVisibility({ visibilityProperty: true });
    });
    const label = (el) => (el.innerText || el.getAttribute("aria-label") || "").trim();
    // A button that starts with the verb ("Download PNG") over one that mentions it ("Export quality, format & download").
    els.sort((a, b) => Number(!/^(download|export|save)/i.test(label(a))) - Number(!/^(download|export|save)/i.test(label(b))) || (a.disabled ? 1 : 0) - (b.disabled ? 1 : 0));
    if (els[0]) els[0].setAttribute("data-sbd", "1");
    return !!els[0];
  });
  if (!found) throw new Error("no download button");
  const pending = page.waitForEvent("download", { timeout: 12_000 });
  const first = page.locator("[data-sbd]");
  await first.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
  await first.click({ timeout: 5000 });
  let file = await Promise.race([pending, page.waitForTimeout(4000).then(() => null)]);
  if (!file) {
    const confirm = page.locator("[role=dialog] button:visible, dialog button:visible, [aria-modal=true] button:visible").filter({ hasText: /download|export|save/i });
    if (await confirm.count()) await confirm.last().click({ timeout: 4000 });
    file = await pending;
  }
  return fs.readFileSync(await file.path());
}

/** Format and pixel size from a PNG or JPEG header. */
function header(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { type: "png", w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) return { type: "jpg", w: 0, h: 0 };
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { type: "jpg", w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return { type: "jpg", w: 0, h: 0 };
  }
  return { type: "unknown", w: 0, h: 0 };
}

async function readDownload(page, buf) {
  const h = header(buf);
  const mime = h.type === "jpg" ? "image/jpeg" : "image/png";
  const a = h.type === "unknown" ? null : await page.evaluate(analyze, { src: `data:${mime};base64,${buf.toString("base64")}`, colors: PHOTOS });
  return { ...h, a };
}

async function fileInput(page) {
  const inputs = page.locator("input[type=file]");
  const n = await inputs.count();
  for (let i = 0; i < n; i++) if (await inputs.nth(i).evaluate((e) => e.multiple)) return inputs.nth(i);
  return n ? inputs.first() : null;
}

/** In-page: drops files on the drag-and-drop target (the smallest visible element that mentions dragging or dropping). */
async function dropFiles({ files, attempt }) {
  const vis = (el) => el.getBoundingClientRect().width > 0 && el.checkVisibility({ visibilityProperty: true });
  const text = (el) => el.innerText || "";
  const targets = [...document.querySelectorAll("body *")].filter((el) => vis(el) && !el.closest("header,nav,footer") && /drag|drop/i.test(text(el)) && text(el).length < 400 && !/reorder|rearrange|sort/i.test(text(el)));
  // Upload zones (holding the file input, or saying "drop") first, then the smallest such text; the page itself last.
  const rank = (el) => (el.querySelector("input[type=file]") || el.closest("label")?.querySelector("input[type=file]") ? 0 : 2) + (/drop/i.test(text(el)) ? 0 : 1);
  targets.sort((a, b) => rank(a) - rank(b) || text(a).length - text(b).length);
  const target = [...targets.slice(0, 3), document.body][attempt];
  if (!target) return null;
  target.scrollIntoView({ block: "center" });
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(new File([Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0))], f.name, { type: "image/png" }));
  const r = target.getBoundingClientRect();
  const at = { bubbles: true, cancelable: true, dataTransfer: dt, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
  for (const type of ["dragenter", "dragover", "drop"]) target.dispatchEvent(new DragEvent(type, at));
  return target === document.body ? "page" : text(target).split("\n")[0].slice(0, 50);
}

/** In-page: large visible upload controls and their size. */
function uploadButtons() {
  return [...document.querySelectorAll("button,label,a,[role=button]")]
    .filter((el) => /upload|add (photos|images)|choose (photos|images|files)|select (photos|images|files)|browse/i.test(el.innerText || el.getAttribute("aria-label") || "") && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }))
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), text: (el.innerText || "").trim().slice(0, 30) };
    })
    .sort((a, b) => b.w * b.h - a.w * a.h);
}

/** In-page: whether the page has white and dark blue surfaces and a purple gradient. */
function palette() {
  const hsl = ([r, g, b]) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    if (!d) return { h: 0, s: 0, l };
    const s = d / (1 - Math.abs(2 * l - 1));
    const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: (h * 60 + 360) % 360, s, l };
  };
  // Any CSS colour (rgb, oklch, oklab, ...) converted to sRGB by painting it; translucent ones are skipped.
  const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const cache = new Map();
  const toRgb = (str) => {
    if (!cache.has(str)) {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillStyle = str;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      cache.set(str, d[3] > 128 ? [d[0], d[1], d[2]] : null);
    }
    return cache.get(str);
  };
  const rgbs = (s) => [...(s || "").matchAll(/(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^()]*\)|#[0-9a-f]{3,8}\b/gi)].map((m) => toRgb(m[0])).filter(Boolean);
  const darkBlue = (c) => { const x = hsl(c); return x.h >= 200 && x.h <= 250 && x.s >= 0.3 && x.l <= 0.32; };
  const purple = (c) => { const x = hsl(c); return x.h >= 250 && x.h <= 300 && x.s >= 0.35 && x.l >= 0.25 && x.l <= 0.8; };
  let white = 0, dark = 0, gradient = 0;
  for (const el of document.querySelectorAll("body, body *")) {
    const r = el.getBoundingClientRect();
    const a = r.width * r.height;
    if (a < 2000 || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const cs = getComputedStyle(el);
    const bg = rgbs(cs.backgroundColor);
    const stops = rgbs(cs.backgroundImage);
    if (bg.some((c) => hsl(c).l >= 0.96)) white = Math.max(white, a);
    if ([...bg, ...stops].some(darkBlue) || (rgbs(cs.color).some(darkBlue) && el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))) dark += a;
    if (/gradient/.test(cs.backgroundImage) && stops.some(purple)) gradient++;
  }
  return { white: Math.round(white), dark: Math.round(dark), gradient };
}

export async function interactDesktop(context, url) {
  const out = {};
  const page = await freshPage(context, url);
  const input = await fileInput(page);
  out.picker = await attempt(async () => {
    if (!input) return { pass: false, detail: "no file input" };
    const { multiple, accept } = await input.evaluate((e) => ({ multiple: e.multiple, accept: e.accept }));
    const images = !accept || /image/.test(accept);
    return { pass: multiple && images, score: (multiple ? 0.5 : 0) + (images ? 0.5 : 0), detail: `multiple ${multiple}, accept "${accept}"` };
  });
  out.uploadButton = await attempt(async () => {
    const b = (await page.evaluate(uploadButtons))[0];
    return { pass: !!b && b.h >= 48 && b.w >= 160, detail: b ? `${b.text} ${b.w}x${b.h}` : "no upload button" };
  });

  let last = null;
  const three = ["red", "green", "blue"];
  out.uploadPreview = await attempt(async () => {
    if (!input) return { pass: false, detail: "no file input" };
    await input.setInputFiles(await photoFiles(page, three));
    await page.waitForTimeout(1200);
    last = await preview(page, three, 3);
    return { pass: !!last, detail: last ? `${last.tag} preview ${last.w}x${last.h}` : "no preview showing all three photos" };
  });

  const strip = async (re, avoid, axis) => {
    const c = await choose(page, re, avoid);
    if (!c) return { pass: false, detail: "no control" };
    const p = await preview(page, three, 3);
    if (!p) return { pass: false, detail: `${c.label || c.value}: preview lost the photos` };
    last = p;
    // Side by side (or stacked): the photos spread along the axis and line up across it, whether or not the canvas is cropped to a fixed shape.
    const other = axis === "x" ? "y" : "x";
    const along = three.map((n) => p.colors[n][axis]), across = three.map((n) => p.colors[n][other]);
    const spread = Math.max(...along) - Math.min(...along) > 0.4;
    const aligned = Math.max(...across) - Math.min(...across) < 0.12;
    return { pass: spread && aligned, score: (spread ? 0.5 : 0) + (aligned ? 0.5 : 0), detail: `${c.label || c.value}: ${p.w}x${p.h}, photos span ${p.photoRatio.toFixed(2)}:1, order ${order(p, three, axis).join(" ")}` };
  };
  out.vertical = await attempt(() => strip(/vertical|stack|top.to.bottom|column/i, "columns", "y"));
  out.horizontal = await attempt(() => strip(/horizontal|side.by.side|left.to.right|\brow\b/i, "rows", "x"));

  out.rearrange = await attempt(async () => {
    if (!last) return { pass: false, detail: "no preview" };
    const before = order(last, three, "x").join(" ");
    const moves = page.locator("button:visible, [role=button]:visible").filter({ hasNotText: /download|layout/i });
    const n = await moves.count();
    for (let i = 0; i < n && i < 80; i++) {
      const b = moves.nth(i);
      const label = `${(await b.getAttribute("aria-label")) || ""} ${(await b.getAttribute("title")) || ""} ${await b.innerText()}`;
      if (!/move|left|right|\bup\b|down|earlier|later|forward|backward|reorder|swap|shift/i.test(label) || /remove|delete/i.test(label) || (await b.isDisabled())) continue;
      if (await b.evaluate((el) => !!el.closest("header,nav,footer"))) continue;
      await b.click({ timeout: 3000 }).catch(() => {});
      const p = await preview(page, three, 3);
      if (p && order(p, three, "x").join(" ") !== before) return (last = p), { pass: true, detail: `button "${label.trim().slice(0, 40)}": ${before} -> ${order(p, three, "x").join(" ")}` };
    }
    const drag = page.locator("[draggable=true]:visible").filter({ has: page.locator("img") });
    if ((await drag.count()) >= 2) {
      await drag.nth(0).dragTo(drag.nth(1), { timeout: 5000 }).catch(() => {});
      const p = await preview(page, three, 3);
      if (p && order(p, three, "x").join(" ") !== before) return (last = p), { pass: true, detail: `drag: ${before} -> ${order(p, three, "x").join(" ")}` };
    }
    return { pass: false, detail: "no move control or drag changed the order" };
  });

  out.remove = await attempt(async () => {
    const del = page.locator("button:visible, [role=button]:visible").filter({ hasNotText: /all|clear|reset/i });
    const n = await del.count();
    for (let i = 0; i < n && i < 80; i++) {
      const b = del.nth(i);
      const label = `${(await b.getAttribute("aria-label")) || ""} ${(await b.getAttribute("title")) || ""} ${await b.innerText()}`;
      if (!/remove|delete|trash|discard/i.test(label) || /all|clear/i.test(label) || (await b.evaluate((el) => !!el.closest("header,nav,footer")))) continue;
      await b.click({ timeout: 3000 });
      await page.waitForTimeout(400);
      // A confirm step counts as part of removing.
      const confirm = page.locator("[role=dialog] button:visible, [role=alertdialog] button:visible").filter({ hasText: /remove|delete|yes|ok/i });
      if (await confirm.count()) await confirm.first().click({ timeout: 3000 });
      const p = await preview(page, three, 1);
      const left = p ? present(p, three) : [];
      return { pass: left.length === 2, detail: `photos in preview ${left.join(" ") || "none"}` };
    }
    return { pass: false, detail: "no remove control" };
  });

  // Four photos from here: whatever is left, plus a dropped yellow and, if needed, a re-uploaded colour.
  out.dragDrop = await attempt(async () => {
    const missing = three.filter((n) => !last || !present(last, three).includes(n));
    const names = ["yellow", ...(out.remove.pass ? missing : ["red"])].slice(0, 2);
    const data = await page.evaluate(makePhotos, { names, colors: PHOTOS, side: SIDE });
    const tried = [];
    for (let attempt = 0; attempt < 4; attempt++) {
      const where = await page.evaluate(dropFiles, { files: names.map((n, i) => ({ name: `${n}.png`, data: data[i] })), attempt });
      if (where === null) continue;
      tried.push(where);
      await page.waitForTimeout(1200);
      const p = await preview(page, ["yellow"], 1);
      if (p) return { pass: true, detail: `dropped on "${where}": ${present(p, Object.keys(PHOTOS)).join(" ")}` };
    }
    return { pass: false, detail: `dropped on ${tried.map((t) => `"${t}"`).join(", ")}: yellow photo not in preview` };
  });
  const four = Object.keys(PHOTOS);
  // Without a working drop, upload the rest so the later checks still see four photos.
  {
    const p = await preview(page, four, 1);
    const missing = four.filter((n) => !p || !present(p, four).includes(n));
    if (missing.length && input) await input.setInputFiles(await photoFiles(page, missing)).catch(() => {});
  }

  out.grid = await attempt(async () => {
    const c = await choose(page, /\bgrid\b/i);
    if (!c) return { pass: false, detail: "no grid control" };
    const p = await preview(page, four, 4);
    if (!p) return { pass: false, detail: "grid preview lacks the four photos" };
    last = p;
    const ys = four.map((n) => p.colors[n].y), xs = four.map((n) => p.colors[n].x);
    const rows = Math.max(...ys) - Math.min(...ys) > 0.25, cols = Math.max(...xs) - Math.min(...xs) > 0.25;
    return { pass: rows && cols, detail: `${p.w}x${p.h}, rows ${rows}, columns ${cols}` };
  });
  out.collage = await attempt(async () => {
    const grid = last;
    const c = await choose(page, /collage|mosaic|freeform|feature|masonry/i);
    if (!c) return { pass: false, detail: "no collage control" };
    const p = await preview(page, four, 4);
    if (!p) return { pass: false, detail: "collage preview lacks the four photos" };
    last = p;
    const shares = four.map((n) => p.colors[n].share);
    const unequal = Math.max(...shares) > 1.4 * Math.min(...shares);
    return { pass: differs(p, grid) && (unequal || !out.grid.pass), detail: `${c.label || c.value}: ${p.w}x${p.h}, photo shares ${shares.map((s) => s.toFixed(2)).join(" ")}` };
  });
  await choose(page, /horizontal|side.by.side|left.to.right|\brow\b/i, "rows").catch(() => {});
  last = (await preview(page, four, 4)) || last;

  const setting = async (re, avoid, check) => {
    const before = await preview(page, four, 4);
    const c = await adjust(page, re, avoid);
    if (!c) return { pass: false, detail: "no control" };
    const p = await preview(page, four, 4);
    const ok = check ? check(p, before) : differs(p, before);
    return { pass: !!ok, detail: `${c.kind} "${c.label || ""}": ${before ? `${before.w}x${before.h}` : "-"} -> ${p ? `${p.w}x${p.h}` : "no preview"}` };
  };
  out.spacing = await attempt(() => setting(/spacing|\bgap\b|gutter|padding|margin/i, "border|radius"));
  out.background = await attempt(async () => {
    const args = { source: "background|\\bbg\\b|canvas|backdrop|fill|gradient", flags: "i", avoid: "border|frame|stroke|outline|text", kinds: ["color"] };
    let c = await page.evaluate(markControl, args);
    if (!c) {
      // The picker may sit in a collapsed "Background" panel, labelled only "Custom" or similar.
      const panel = await page.evaluate(markControl, { source: "background", flags: "i", kinds: ["button"] });
      if (panel) await page.locator("[data-sbc]").click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(500);
      c = await page.evaluate(markControl, { ...args, source: "background|\\bbg\\b|canvas|backdrop|fill|gradient|custom|colou?r" });
      if (!c) c = await page.evaluate(markControl, { ...args, source: "." });
    }
    if (!c) return { pass: false, detail: "no background colour picker" };
    const el = page.locator("[data-sbc]");
    await el.fill("#ff00ff").catch(async () => {
      await el.evaluate((input) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "#ff00ff");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
    const p = await preview(page, four, 4);
    return { pass: !!p && p.colors.magenta.share >= 0.003, detail: `${c.label}: magenta share ${p ? p.colors.magenta.share.toFixed(3) : "no preview"}` };
  });
  out.border = await attempt(() => setting(/border|frame|stroke|outline/i, "colou?r|radius|round"));

  out.downloadPng = await attempt(async () => {
    await choose(page, /^\s*png\s*$|\bpng\b/i, "jpe?g");
    const d = await readDownload(page, await download(page));
    const all = d.a ? present(d.a, four) : [];
    const big = Math.max(d.w, d.h) >= 1500;
    const ok = d.type === "png" && all.length === 4 && big;
    return { pass: ok, score: (d.type === "png" ? 0.4 : 0) + 0.4 * fraction(all.length, 4) + (big ? 0.2 : 0), detail: `${d.type} ${d.w}x${d.h}, photos ${all.join(" ")}` };
  });
  out.size = await attempt(async () => {
    const before = header(await download(page));
    const re = /\bsize\b|resolution|dimension|output|scale|width|\b\d{3,4}\s?px\b|\b(hd|4k)\b/i;
    const avoid = "border|spacing|gap|font|margin|padding|radius|corner|quality";
    let tried = [];
    // A row of size buttons may start on the current size, so a second one is tried.
    for (const pick of [0, 1]) {
      const c = await adjust(page, re, avoid, pick);
      if (!c) break;
      await page.waitForTimeout(600);
      const after = header(await download(page));
      tried.push(`${c.kind} "${c.label || ""}" -> ${after.w}x${after.h}`);
      if (after.w !== before.w || after.h !== before.h) return { pass: true, detail: `${before.w}x${before.h}; ${tried.join("; ")}` };
      if (c.kind !== "button") break;
    }
    return { pass: false, detail: tried.length ? `${before.w}x${before.h}; ${tried.join("; ")}` : "no size control" };
  });
  out.downloadJpg = await attempt(async () => {
    const c = await choose(page, /jpe?g/i);
    if (!c) return { pass: false, detail: "no JPG choice" };
    const d = await readDownload(page, await download(page));
    const all = d.a ? present(d.a, four) : [];
    return { pass: d.type === "jpg" && all.length === 4, score: (d.type === "jpg" ? 0.5 : 0) + 0.5 * fraction(all.length, 4), detail: `${d.type} ${d.w}x${d.h}, photos ${all.join(" ")}` };
  });
  await page.close();

  const look = await freshPage(context, url);
  out.palette = await attempt(async () => {
    const p = await look.evaluate(palette);
    const score = (p.white >= 200_000 ? 1 / 3 : 0) + (p.dark >= 50_000 ? 1 / 3 : 0) + (p.gradient > 0 ? 1 / 3 : 0);
    return { pass: score > 0.99, score, detail: `white area ${p.white}, dark blue area ${p.dark}, purple gradients ${p.gradient}` };
  });
  out.motion = await attempt(async () => {
    // Animations seen while scrolling through the page, plus controls that ease between states.
    let seen = 0;
    const height = await look.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += 600) {
      await look.evaluate((top) => window.scrollTo(0, top), y);
      await look.waitForTimeout(250);
      seen += await look.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
    }
    const eased = await look.evaluate(() => [...document.querySelectorAll("button,a,[role=button],label")].filter((el) => getComputedStyle(el).transitionDuration.split(",").some((t) => parseFloat(t) > 0)).length);
    return { pass: seen > 0 && eased >= 3, score: (seen > 0 ? 0.5 : 0) + (eased >= 3 ? 0.5 : 0), detail: `running animations seen ${seen}, controls with transitions ${eased}` };
  });
  await look.close();

  out.reducedMotion = await attempt(async () => {
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(url, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(1500);
    const hidden = await page.evaluate(async () => {
      const out = [];
      for (const h of document.querySelectorAll("main h2, section h2")) {
        h.scrollIntoView({ block: "center" });
        await new Promise((r) => setTimeout(r, 1200));
        let el = h, op = 1;
        while (el) (op *= Number(getComputedStyle(el).opacity)), (el = el.parentElement);
        if (op < 0.5) out.push(h.innerText.slice(0, 40));
      }
      return out;
    });
    await page.close();
    return { pass: hidden.length === 0, detail: hidden.length ? `headings still hidden: ${hidden.join(" | ")}` : "all section headings visible" };
  });
  return out;
}

export async function interactMobile(context, url) {
  const out = {};
  const page = await freshPage(context, url);
  out.phoneButton = await attempt(async () => {
    const b = (await page.evaluate(uploadButtons))[0];
    return { pass: !!b && b.h >= 44, detail: b ? `${b.text} ${b.w}x${b.h}` : "no upload button" };
  });
  out.phoneMerge = await attempt(async () => {
    const input = await fileInput(page);
    if (!input) return { pass: false, detail: "no file input" };
    await input.setInputFiles(await photoFiles(page, ["red", "blue"]));
    await page.waitForTimeout(1200);
    const p = await preview(page, ["red", "blue"], 2);
    return { pass: !!p, detail: p ? `${p.tag} preview ${p.w}x${p.h}` : "no preview with both photos" };
  });
  await page.close();
  return out;
}
