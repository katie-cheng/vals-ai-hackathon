// In-page probe, passed to page.evaluate: it must stay self-contained (no imports, no outer-scope references).
// Returns page facts for the brief requirements and raw counts for the slop patterns the team labelled
// (docs/label-analysis.md, tasks/reference-rubric.md); scoring happens in grade.mjs.
// probe("controls") returns only the controls whose label breaks at the current width, for the resize sweep in grade.mjs.
// probe("inner") is for pages after the home page: slop inside header, nav and footer is skipped there, since the home page already
// counted that shared chrome. Page facts are unaffected.
export function probe(only) {
  const MAX_EXAMPLES = 6;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  };
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const ownText = (el) => clean([...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(" "));
  const px = (v) => (v === "normal" ? 0 : parseFloat(v) || 0);
  const family = (cs) => cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
  const describe = (el) => {
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
    return el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "") + (cls ? `.${cls}` : "");
  };
  const radiusPx = (value, rect) => (value.endsWith("%") ? (parseFloat(value) / 100) * Math.min(rect.width, rect.height) * 2 : parseFloat(value) || 0);
  const transparent = (c) => !c || c === "transparent" || /rgba\([^)]*,\s*0\)$/.test(c);
  const hasSurface = (cs) =>
    !transparent(cs.backgroundColor) || cs.backgroundImage !== "none" || (px(cs.borderTopWidth) > 0 && !transparent(cs.borderTopColor)) || cs.boxShadow !== "none";
  const isGradientText = (cs) => (cs.backgroundClip === "text" || cs.webkitBackgroundClip === "text") && cs.backgroundImage.includes("gradient");
  const toHex = (c) => {
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m || (m[4] !== undefined && parseFloat(m[4]) === 0)) return null;
    return "#" + [m[1], m[2], m[3]].map((x) => (+x).toString(16).padStart(2, "0")).join("");
  };
  const finding = (el, extra = {}) => ({ el: describe(el), text: clean(el.innerText || el.textContent).slice(0, 80), ...extra });

  // Short controls (buttons, button-styled links, header and nav links) whose label wraps onto 2+ lines or overflows its box.
  // Text is grouped by its nearest non-inline box: a card link that stacks a label over a value has two boxes and is skipped.
  if (only === "controls") {
    const lineBox = (node, stop) => {
      let el = node.parentElement;
      while (el !== stop && ["inline", "contents"].includes(getComputedStyle(el).display)) el = el.parentElement;
      return el;
    };
    const lineCount = (rects) => {
      let count = 0;
      let bottom = -Infinity;
      for (const r of [...rects].sort((a, b) => a.top - b.top)) {
        if (r.top >= bottom - r.height * 0.3) {
          count++;
          bottom = r.bottom;
        } else bottom = Math.max(bottom, r.bottom);
      }
      return count;
    };
    const broken = [];
    for (const el of document.querySelectorAll("a,button,[role=button]")) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || !visible(el) || el.closest("[aria-hidden=true]")) continue;
      const t = clean(el.innerText);
      if (!t || t.length > 40 || t.split(" ").length > 5) continue;
      if (el.tagName === "A" && !el.closest("header,nav") && el.getAttribute("role") !== "button" && !hasSurface(getComputedStyle(el))) continue;
      const boxes = new Map();
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const parent = n.parentElement.getBoundingClientRect();
        if (!n.textContent.trim() || parent.width < 4 || parent.height < 4) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        const box = lineBox(n, el);
        boxes.set(box, [...(boxes.get(box) || []), ...[...range.getClientRects()].filter((x) => x.width > 1 && x.height > 1)]);
      }
      if (boxes.size !== 1) continue;
      const rects = [...boxes.values()][0];
      const lines = lineCount(rects);
      // Text past the control's own edges; scrollWidth would also count clipped decorative layers such as shine sweeps.
      const spill = Math.round(Math.max(0, ...rects.map((x) => Math.max(x.right - r.right, r.left - x.left))));
      if (lines > 1 || spill > 1) broken.push(finding(el, { lines, spill }));
    }
    return broken;
  }

  const all = [...document.body.querySelectorAll("*")].filter((el) => !["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName));
  const chrome = (el) => only === "inner" && !!el.closest("header,nav,footer,[role=banner],[role=contentinfo]");
  const counted = all.filter((el) => !chrome(el));
  const holders = [];
  for (const el of counted) {
    const t = ownText(el);
    if (t && visible(el)) holders.push({ el, t, cs: getComputedStyle(el) });
  }

  // Slop patterns.
  // A scrolling ribbon (marquee) of uppercase service names is an accepted pattern, not an eyebrow.
  const inRibbon = (el) => {
    for (let a = el.parentElement, i = 0; a && i < 5; a = a.parentElement, i++) {
      const as = getComputedStyle(a);
      if (as.whiteSpace !== "nowrap" || as.display !== "flex") continue;
      const box = a.parentElement;
      if (box && getComputedStyle(box).overflowX !== "visible" && a.scrollWidth > 1.5 * box.clientWidth) return true;
      if (a.getAnimations().some((x) => x.effect?.getComputedTiming().iterations === Infinity)) return true;
    }
    return false;
  };
  const eyebrowTexts = new Map();
  const numbered = [];
  const emoji = [];
  let dotSeparators = 0;
  const dotExamples = [];
  let tinyWords = 0;
  let totalWords = 0;
  let emDashes = 0;
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}]/gu;
  for (const { el, t, cs } of holders) {
    const fs = px(cs.fontSize);
    const words = t.split(" ").length;
    totalWords += words;
    if (fs < 12) tinyWords += words;
    emDashes += (t.match(/—/g) || []).length;
    const letters = t.replace(/[^A-Za-z]/g, "");
    const upper = cs.textTransform === "uppercase" || (letters.length >= 3 && letters === letters.toUpperCase());
    if (fs <= 13 && px(cs.letterSpacing) >= Math.max(0.8, 0.06 * fs) && upper && letters.length >= 3 && words <= 8 && !eyebrowTexts.has(t.toUpperCase()) && !inRibbon(el))
      eyebrowTexts.set(t.toUpperCase(), finding(el, { fontSize: cs.fontSize, letterSpacing: cs.letterSpacing }));
    if (/^\(?0\d\)?([\s./:)\-–—]|$)/.test(t)) numbered.push(finding(el));
    const dots = (t.match(/[·•]/g) || []).length;
    if (dots) {
      dotSeparators += dots;
      if (dotExamples.length < MAX_EXAMPLES) dotExamples.push(finding(el));
    }
    const em = t.match(emojiRe);
    if (em) emoji.push(finding(el, { glyphs: em.join("") }));
  }

  const headingAccents = [];
  const headingEls = new Set([...document.querySelectorAll("h1,h2,h3,h4")].filter((h) => visible(h) && !chrome(h)));
  for (const { el, cs } of holders) if (px(cs.fontSize) >= 36 && cs.display !== "inline" && !el.closest("h1,h2,h3,h4")) headingEls.add(el);
  for (const h of headingEls) {
    const hs = getComputedStyle(h);
    const ht = clean(h.innerText);
    // A price with a smaller unit ("$5 each") is not an accented headline.
    if (/^[+-]?[$€£¥]\s?\d/.test(ht)) continue;
    for (const d of h.querySelectorAll("em,i,span,strong,b,mark")) {
      const dt = clean(d.innerText);
      if (!dt || dt.length >= 0.9 * ht.length || !visible(d)) continue;
      const ds = getComputedStyle(d);
      if (ds.fontStyle !== hs.fontStyle || ds.color !== hs.color || family(ds) !== family(hs) || isGradientText(ds)) {
        headingAccents.push(finding(h, { accent: dt.slice(0, 40) }));
        break;
      }
    }
  }

  const pills = [];
  const bigRounding = [];
  const gradientText = [];
  const pulsingDots = [];
  for (const el of counted) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const rad = radiusPx(cs.borderTopLeftRadius, r);
    if (r.height >= 14 && r.height <= 72 && r.width >= 1.4 * r.height && rad >= r.height / 2 - 1 && hasSurface(cs) && clean(el.innerText)
        && !pills.some((p) => p.node.contains(el)))
      pills.push({ node: el, ...finding(el) });
    if (r.width >= 240 && r.height >= 160 && rad >= 24 && (hasSurface(cs) || el.querySelector("img")) && !bigRounding.some((b) => b.node.contains(el)))
      bigRounding.push({ node: el, ...finding(el, { radius: cs.borderTopLeftRadius }) });
    if (isGradientText(cs) && clean(el.innerText)) gradientText.push(finding(el));
    if (r.width >= 3 && r.width <= 20 && r.height <= 20 && cs.animationName !== "none" && cs.animationIterationCount.includes("infinite") && rad >= Math.min(r.width, r.height) / 2 - 0.5)
      pulsingDots.push(finding(el, { animation: cs.animationName }));
  }

  // The same call to action twice within one block: the pair's lowest common ancestor holds no third copy and is at most ~1.5 screens tall,
  // so one button per card across a grid is not a duplicate. Header, nav and footer repeat CTAs by convention and are skipped.
  // Elements that only look like buttons count too, and so do ones hidden only by opacity: hover-revealed copies over images were labelled.
  const INLINE_TAGS = ["SPAN", "SVG", "I", "B", "STRONG", "EM", "IMG", "PATH"];
  const ctaLike = (el) =>
    el.matches("a,button,[role=button]") ||
    (!el.closest("a,button,[role=button]") && hasSurface(getComputedStyle(el)) && el.children.length <= 3 && [...el.children].every((c) => INLINE_TAGS.includes(c.tagName.toUpperCase())));
  const latent = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && el.checkVisibility({ visibilityProperty: true });
  };
  const ctasByText = new Map();
  for (const el of counted) {
    if (!latent(el) || el.closest("header,nav,footer,[aria-hidden=true],dialog,[role=dialog]") || !ctaLike(el)) continue;
    const t = clean(el.innerText).toLowerCase();
    if (t && t.length <= 60 && t.split(" ").length <= 8) ctasByText.set(t, [...(ctasByText.get(t) || []), el]);
  }
  const duplicateCtas = [];
  for (const [t, els] of ctasByText) {
    for (let i = 0; i < els.length; i++)
      for (let j = i + 1; j < els.length; j++) {
        if (els[i].contains(els[j]) || els[j].contains(els[i])) continue;
        let lca = els[i].parentElement;
        while (lca && !lca.contains(els[j])) lca = lca.parentElement;
        if (lca && els.filter((e) => lca.contains(e)).length === 2 && lca.getBoundingClientRect().height <= 1.5 * innerHeight)
          duplicateCtas.push(finding(lca, { cta: t }));
      }
  }

  const bodyText = document.body.innerText;
  const strip = (list) => list.map(({ node, ...rest }) => rest);
  // Rates also return their numerator and denominator so grade.mjs can pool them across pages.
  const rate = (num, den, per) => ({ count: (per * num) / Math.max(1, den), num, den, per, examples: [] });
  const slop = {
    eyebrows: { count: eyebrowTexts.size, examples: [...eyebrowTexts.values()].slice(0, MAX_EXAMPLES) },
    heading_accents: { count: headingAccents.length, examples: headingAccents.slice(0, MAX_EXAMPLES) },
    dot_separators: { count: dotSeparators, examples: dotExamples },
    pills: { count: pills.length, examples: strip(pills).slice(0, MAX_EXAMPLES) },
    big_rounding: { count: bigRounding.length, examples: strip(bigRounding).slice(0, MAX_EXAMPLES) },
    numbered_markers: { count: numbered.length, examples: numbered.slice(0, MAX_EXAMPLES) },
    em_dashes_per_1k_words: rate(emDashes, totalWords, 1000),
    emoji_icons: { count: emoji.reduce((n, e) => n + [...e.glyphs].length, 0), examples: emoji.slice(0, MAX_EXAMPLES) },
    gradient_text: { count: gradientText.length, examples: gradientText.slice(0, MAX_EXAMPLES) },
    pulsing_dots: { count: pulsingDots.length, examples: pulsingDots.slice(0, MAX_EXAMPLES) },
    tiny_text_share: rate(tinyWords, totalWords, 1),
    duplicate_ctas: { count: duplicateCtas.length, examples: duplicateCtas.slice(0, MAX_EXAMPLES) },
  };

  // Facts for the brief requirements.
  const bodyFonts = {};
  for (const p of document.querySelectorAll("p")) if (visible(p) && clean(p.innerText)) bodyFonts[family(getComputedStyle(p))] = (bodyFonts[family(getComputedStyle(p))] || 0) + 1;
  const colors = new Set();
  for (const el of all) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    for (const c of [cs.color, cs.backgroundColor, cs.borderTopColor]) {
      const hex = toHex(c);
      if (hex) colors.add(hex);
    }
  }
  const labelOf = (el) => clean((el.labels && el.labels[0] && el.labels[0].innerText) || (el.closest("label") && el.closest("label").innerText) || "");
  return {
    title: document.title,
    metaDescription: (document.querySelector('meta[name="description"]') || {}).content || "",
    text: bodyText,
    headings: [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => ({ tag: h.tagName.toLowerCase(), text: clean(h.innerText), font: family(getComputedStyle(h)), visible: visible(h) })),
    bodyFonts,
    clickables: [...document.querySelectorAll("a,button,[role=button],[role=tab],input[type=submit]")].map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: clean(el.innerText || el.value || el.getAttribute("aria-label")),
      href: el.getAttribute("href") || "",
      inHeader: !!el.closest("header,nav"),
      visible: visible(el),
    })),
    fields: [...document.querySelectorAll("input,select,textarea")].filter((el) => !["hidden", "submit", "button"].includes(el.type)).map((el) => ({
      tag: el.tagName.toLowerCase(), type: el.type || "", name: el.name || "", id: el.id || "", placeholder: el.placeholder || "",
      aria: el.getAttribute("aria-label") || "", label: labelOf(el), required: el.required,
    })),
    forms: document.forms.length,
    iframes: [...document.querySelectorAll("iframe")].map((f) => f.src),
    ldjson: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
    colors: [...colors],
    brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src).slice(0, 20),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
    slop,
  };
}
