"""Original-vs-rebuild screenshots: every route full-page, plus each home section, at 1440 and 390px.

usage: python capture.py ORIGINAL_URL REBUILD_URL OUTDIR
Writes OUTDIR/{original,rebuild}/<width>/<name>.jpg and side-by-side sheets in OUTDIR/compare/<width>/<name>.jpg.
"""
import pathlib, sys
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROUTES = {"home": "/", "menu": "/menu", "about": "/about", "gallery": "/gallery", "reviews": "/reviews",
          "contact": "/contact", "order": "/order", "login": "/login"}
SITES = {"original": sys.argv[1].rstrip("/"), "rebuild": sys.argv[2].rstrip("/")}
OUT = pathlib.Path(sys.argv[3])


def settle(pg):
    pg.wait_for_timeout(1200)
    h = pg.evaluate("document.documentElement.scrollHeight"); y = 0
    while y < h:
        pg.mouse.wheel(0, 600); pg.wait_for_timeout(110); y += 600
        h = pg.evaluate("document.documentElement.scrollHeight")
    pg.wait_for_timeout(600); pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(700)


def save(png_bytes, path):
    import io
    Image.open(io.BytesIO(png_bytes)).convert("RGB").save(path, quality=80)


with sync_playwright() as p:
    b = p.chromium.launch()
    for site, url in SITES.items():
        for w in (1440, 390):
            out = OUT / site / str(w); out.mkdir(parents=True, exist_ok=True)
            pg = b.new_page(viewport={"width": w, "height": 900 if w > 600 else 844})
            for name, route in ROUTES.items():
                pg.goto(url + route, wait_until="load"); settle(pg)
                save(pg.screenshot(full_page=True, animations="disabled"), out / f"{name}.jpg")
                if name == "home":
                    secs = pg.locator("main > section, main > div > section, footer")
                    for i in range(secs.count()):
                        el = secs.nth(i); el.scroll_into_view_if_needed(); pg.wait_for_timeout(500)
                        save(el.screenshot(animations="disabled"), out / f"home-section-{i + 1:02d}.jpg")
            pg.close()
    b.close()

for w in ("1440", "390"):
    cdir = OUT / "compare" / w; cdir.mkdir(parents=True, exist_ok=True)
    for f in sorted((OUT / "rebuild" / w).glob("*.jpg")):
        if f.name.startswith("home-section"): continue
        a = Image.open(OUT / "original" / w / f.name); c = Image.open(f)
        gap, top = 24, 36
        sheet = Image.new("RGB", (a.width + c.width + gap, max(a.height, c.height) + top), "white")
        d = ImageDraw.Draw(sheet); d.text((8, 10), "original (reconstructed live app)", fill="black"); d.text((a.width + gap + 8, 10), "rebuild", fill="black")
        sheet.paste(a, (0, top)); sheet.paste(c, (a.width + gap, top))
        if sheet.height > 12000: sheet = sheet.crop((0, 0, sheet.width, 12000))
        sheet.save(cdir / f.name, quality=72)
