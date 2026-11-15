"""Record the live S06 app: per-route sections with copy, component locs and computed design tokens, plus header behaviour by width.

usage: python dossier_capture.py URL OUT.json
"""
import json, sys
from playwright.sync_api import sync_playwright

ROUTES = ["/", "/menu", "/about", "/gallery", "/reviews", "/contact", "/order", "/login"]
JS = r"""
() => {
  const secs = [...document.querySelectorAll('header, main > section, main > div, footer')].filter(e => e.getBoundingClientRect().height > 0);
  const out = [];
  for (const s of secs) {
    const locs = new Set(); const fonts = {}; const colors = {}; const sizes = {}; const radii = {}; let upper = 0, tiny = 0, texts = 0;
    for (const el of [s, ...s.querySelectorAll('*')]) {
      const l = el.getAttribute('data-source-loc'); if (l) locs.add(l.split(':')[0]);
      const cs = getComputedStyle(el);
      if (el.childNodes && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) {
        const f = cs.fontFamily.split(',')[0].replace(/"/g, '') + ' ' + cs.fontWeight;
        fonts[f] = (fonts[f] || 0) + 1; sizes[cs.fontSize] = (sizes[cs.fontSize] || 0) + 1; colors[cs.color] = (colors[cs.color] || 0) + 1;
        texts++; if (cs.textTransform === 'uppercase' && parseFloat(cs.fontSize) <= 14) upper++; if (parseFloat(cs.fontSize) < 12) tiny++;
      }
      if (cs.borderTopLeftRadius !== '0px') radii[cs.borderTopLeftRadius] = (radii[cs.borderTopLeftRadius] || 0) + 1;
    }
    const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const r = s.getBoundingClientRect(); const h = s.querySelector('h1,h2');
    out.push({ tag: s.tagName.toLowerCase(), id: s.id, heading: h ? h.innerText : '', top: Math.round(r.top + scrollY), height: Math.round(r.height),
      bg: getComputedStyle(s).backgroundColor, components: [...locs].sort(), fonts: top(fonts), sizes: top(sizes), colors: top(colors), radii: top(radii),
      textNodes: texts, smallUppercase: upper, under12px: tiny, icons: s.querySelectorAll('svg').length,
      text: s.innerText.replace(/\n{3,}/g, '\n\n').trim() });
  }
  return out;
}
"""
HDR = """() => { const vis = e => e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
  const nav = document.querySelector('header nav'); const order = [...document.querySelectorAll('header a')].find(a => /order now/i.test(a.innerText));
  return { nav: vis(nav), menuButton: vis(document.querySelector('header button[aria-label="Open navigation"]')), orderNow: vis(order),
    bottomNav: vis(document.querySelector('nav[aria-label="Quick navigation"]')), headerHeight: document.querySelector('header').getBoundingClientRect().height,
    docWidth: document.documentElement.scrollWidth } }"""

def run(url, out):
    res = {"header": {}, "routes": {}}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w, h in [(1440, 900), (1280, 800), (1024, 768), (768, 1024), (390, 844)]:
            pg = b.new_page(viewport={"width": w, "height": h})
            for route in ROUTES:
                if w not in (1440, 390) and route != "/":
                    continue
                pg.goto(url.rstrip("/") + route, wait_until="load"); pg.wait_for_timeout(1500)
                for _ in range(30):
                    pg.mouse.wheel(0, 600); pg.wait_for_timeout(80)
                pg.wait_for_timeout(800)
                if route == "/":
                    res["header"][str(w)] = pg.evaluate(HDR)
                if w in (1440, 390):
                    res["routes"].setdefault(route, {})[str(w)] = pg.evaluate(JS)
            pg.close()
        b.close()
    json.dump(res, open(out, "w"), indent=1)

if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2])
