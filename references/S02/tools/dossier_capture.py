"""Record the live S02 app per route: copy, component locs, computed design tokens, header behaviour by width.

usage: python dossier_capture.py URL OUT.json SCREENS_DIR
Deep links 404 on the Arcada host, so every route is reached client-side (history.pushState + popstate).
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright

ROUTES = ["/", "/dashboard", "/courses", "/lesson/1", "/playground", "/search", "/quizzes", "/quiz/1",
          "/certificates", "/resources", "/admin", "/profile"]
JS = r"""
() => {
  const regions = [['header', document.querySelector('header')], ['main', document.querySelector('main')], ['footer', document.querySelector('footer')]];
  const out = [];
  for (const [name, s] of regions) {
    if (!s) continue;
    const locs = new Set(); const fonts = {}; const colors = {}; const sizes = {}; const radii = {}; const anim = {}; let grad = 0, blur = 0, upper = 0;
    for (const el of [s, ...s.querySelectorAll('*')]) {
      const l = el.getAttribute('data-source-loc'); if (l) locs.add(l.split(':')[0]);
      const cs = getComputedStyle(el);
      if ([...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) {
        const f = cs.fontFamily.split(',')[0].replace(/"/g, '') + ' ' + cs.fontWeight;
        fonts[f] = (fonts[f] || 0) + 1; sizes[cs.fontSize] = (sizes[cs.fontSize] || 0) + 1; colors[cs.color] = (colors[cs.color] || 0) + 1;
        if (cs.textTransform === 'uppercase') upper++;
      }
      if (cs.borderTopLeftRadius !== '0px') radii[cs.borderTopLeftRadius] = (radii[cs.borderTopLeftRadius] || 0) + 1;
      if (cs.backgroundImage.includes('gradient')) grad++;
      if (cs.backdropFilter !== 'none' || cs.filter.includes('blur')) blur++;
      if (cs.animationName !== 'none') anim[cs.animationName] = (anim[cs.animationName] || 0) + 1;
    }
    const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const r = s.getBoundingClientRect();
    out.push({ region: name, top: Math.round(r.top + scrollY), height: Math.round(r.height), components: [...locs].sort(),
      fonts: top(fonts), sizes: top(sizes), colors: top(colors), radii: top(radii), gradients: grad, blurs: blur, uppercase: upper,
      animations: anim, text: s.innerText.replace(/\n{3,}/g, '\n\n').trim() });
  }
  return out;
}
"""

def nav(pg, url, r):
    pg.goto(url, wait_until="load"); pg.wait_for_timeout(1500)
    pg.evaluate("r=>{history.pushState({},'',r);dispatchEvent(new PopStateEvent('popstate'))}", r); pg.wait_for_timeout(1500)

def run(url, out, screens):
    res = {"routes": {}, "header": {}}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w, h in [(1440, 900), (1280, 800), (1024, 768), (768, 1024), (390, 844), (360, 800)]:
            pg = b.new_page(viewport={"width": w, "height": h}); nav(pg, url, "/")
            res["header"][str(w)] = pg.evaluate("""() => { const h = document.querySelector('header'); const n = h.querySelector('nav');
              const vis = e => e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
              return { headerHeight: h.getBoundingClientRect().height, navVisible: vis(n), navRight: n ? Math.round(n.getBoundingClientRect().right) : null,
                rowScrollWidth: h.firstElementChild.scrollWidth, docWidth: document.documentElement.scrollWidth, viewport: innerWidth,
                wrapped: [...h.querySelectorAll('a,button,span')].filter(e => vis(e) && e.children.length === 0 && e.getClientRects().length > 1).map(e => e.innerText) } }""")
            if w in (1440, 390):
                d = pathlib.Path(screens) / str(w); d.mkdir(parents=True, exist_ok=True)
                for r in ROUTES:
                    nav(pg, url, r)
                    res["routes"].setdefault(r, {})[str(w)] = pg.evaluate(JS)
                    pg.screenshot(path=str(d / ((r.strip("/").replace("/", "-") or "home") + ".jpg")), full_page=True, type="jpeg", quality=70)
            pg.close()
        b.close()
    json.dump(res, open(out, "w"), indent=1)

if __name__ == "__main__":
    run(*sys.argv[1:4])
