"""Record the live S13 app: per-section copy, component locs, computed design tokens, breakpoint behaviour.

usage: python dossier_capture.py URL OUT.json
"""
import json, sys
from playwright.sync_api import sync_playwright

JS = r"""
() => {
  const secs = [...document.querySelectorAll('header, main > section, main > * > section, footer')];
  const out = [];
  for (const s of secs) {
    const locs = new Set(); const fonts = {}; const colors = {}; const sizes = {}; const radii = {};
    for (const el of [s, ...s.querySelectorAll('*')]) {
      const l = el.getAttribute('data-source-loc'); if (l) locs.add(l.split(':')[0]);
      const cs = getComputedStyle(el);
      if (el.childNodes && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) {
        const f = cs.fontFamily.split(',')[0].replace(/"/g, '') + ' ' + cs.fontWeight;
        fonts[f] = (fonts[f] || 0) + 1;
        sizes[cs.fontSize] = (sizes[cs.fontSize] || 0) + 1;
        colors[cs.color] = (colors[cs.color] || 0) + 1;
      }
      if (cs.borderTopLeftRadius !== '0px') radii[cs.borderTopLeftRadius] = (radii[cs.borderTopLeftRadius] || 0) + 1;
    }
    const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const r = s.getBoundingClientRect();
    out.push({ tag: s.tagName.toLowerCase(), id: s.id, top: Math.round(r.top + scrollY), height: Math.round(r.height),
      bg: getComputedStyle(s).backgroundColor, components: [...locs].sort(), fonts: top(fonts), sizes: top(sizes),
      colors: top(colors), radii: top(radii), text: s.innerText.replace(/\n{3,}/g, '\n\n').trim() });
  }
  return out;
}
"""

def run(url, out):
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w, h in [(1440, 900), (1280, 800), (1024, 768), (768, 1024), (390, 844)]:
            pg = b.new_page(viewport={"width": w, "height": h})
            pg.goto(url, wait_until="load"); pg.wait_for_timeout(3500)
            for _ in range(40):
                pg.mouse.wheel(0, 600); pg.wait_for_timeout(120)
            pg.wait_for_timeout(1500)
            hdr = pg.evaluate("""() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); return cs.display === 'none' ? 'hidden' : 'visible'; };
              const nav = document.querySelector('header nav'); return { nav: q('header nav'), navHeight: nav ? nav.getBoundingClientRect().height : null,
              menuButton: q('header button[aria-label*="menu" i]'), docWidth: document.documentElement.scrollWidth } }""")
            entry = {"header": hdr}
            if w in (1440, 390):
                entry["sections"] = pg.evaluate(JS)
            res[str(w)] = entry
            pg.close()
        b.close()
    json.dump(res, open(out, "w"), indent=1)

if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2])
