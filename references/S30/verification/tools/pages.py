"""Full-page original (inputs/live-app, left) vs solution (right) for every route, at 1440 and 390 px.

usage: python pages.py http://localhost:BEFORE http://localhost:AFTER ../pages
"""
import io, pathlib, sys
from PIL import Image
from playwright.sync_api import sync_playwright

ROUTES = ["/", "/about", "/services", "/services/growth-strategy", "/work", "/work/ledgerly", "/pricing",
          "/insights", "/insights/90-day-growth-roadmap", "/contact"]
BEFORE, AFTER, OUT = sys.argv[1].rstrip("/"), sys.argv[2].rstrip("/"), pathlib.Path(sys.argv[3])


def full(pg, url):
    pg.goto(url, wait_until="load"); pg.wait_for_timeout(3500)
    h = pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0, h, 500):
        pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(100)
    pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(600)
    return Image.open(io.BytesIO(pg.screenshot(full_page=True))).convert("RGB")


OUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    br = p.chromium.launch()
    for w, vh in ((1440, 900), (390, 844)):
        pg = br.new_page(viewport={"width": w, "height": vh})
        for r in ROUTES:
            l, a = full(pg, BEFORE + r), full(pg, AFTER + r)
            im = Image.new("RGB", (w * 2 + 40, max(l.height, a.height)), "white")
            im.paste(l, (0, 0)); im.paste(a, (w + 40, 0))
            if w == 1440:
                im = im.resize((im.width // 2, im.height // 2))
            name = r.strip("/").replace("/", "-") or "home"
            im.save(OUT / f"{name}-{w}.jpg", quality=72)
        pg.close()
    br.close()
print("done")
