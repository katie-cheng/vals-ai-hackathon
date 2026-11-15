"""Per-critique before/after evidence.

For every S06 label, and every S05 label applied to S06: left = the labelled crop from the labelled site
(data/sloplabel/shots/<id>.png) with its context shot, right = the same place in the rebuilt S06, at the width the
label was made at.
usage: python crops.py REBUILD_URL OUTDIR
"""
import io, json, pathlib, sys
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[4]
CRIT = ROOT / "references/S06/inputs/critiques/critiques.json"
URL, OUT = sys.argv[1].rstrip("/"), pathlib.Path(sys.argv[2])

sec = lambda n, **k: dict(route="/", sel=f"main > section >> nth={n}", **k)
HERO, CATS, BEST, PROMO, WHY, REVIEWS, LOCATION = (sec(i) for i in range(7))
FILTER = dict(route="/menu", sel="[aria-label='Menu categories'] >> xpath=../..", pad=24, below=420)
SPEC = {
    # S06
    389: HERO, 391: HERO, 394: HERO, 395: HERO,
    396: dict(route="/", sel="#categories", maxh=380, above=220),
    397: dict(route="/", sel="#categories h2", pad=70), 401: dict(route="/", sel="main > section >> nth=2 >> h2", pad=70),
    398: FILTER, 400: dict(FILTER, click="Dagwoods", below=700),
    399: dict(route="/", sel="footer"), 405: WHY, 406: WHY, 407: REVIEWS, 408: REVIEWS, 409: LOCATION,
    410: dict(route="/", sel="header"),
    # S05 labels applied to S06
    289: dict(route="/", sel="header"), 294: dict(route="/", sel="footer"), 296: HERO, 453: HERO,
    452: dict(route="/", sel="#categories h2", pad=70), 454: FILTER,
    455: WHY, 456: WHY, 457: WHY, 458: WHY, 459: dict(route="/about", sel="main > section >> nth=1"), 460: REVIEWS,
}

labels = {x["id"]: x for x in json.load(open(CRIT)) if x["site_id"] in ("S06", "S05")}
OUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for lid, spec in SPEC.items():
        lab = labels[lid]; w = int(lab["viewport_w"] or 1232)
        pg = b.new_page(viewport={"width": w, "height": int(lab["viewport_h"] or 900)})
        pg.goto(URL + spec["route"], wait_until="load"); pg.wait_for_timeout(1200)
        if spec.get("click"):
            pg.get_by_role("button", name=spec["click"], exact=True).first.click(); pg.wait_for_timeout(700)
        el = pg.locator(spec["sel"]).first; el.scroll_into_view_if_needed(); pg.wait_for_timeout(700)
        box = el.bounding_box(); pad = spec.get("pad", 0)
        sy = pg.evaluate("scrollY"); ph = pg.evaluate("document.documentElement.scrollHeight")
        y0 = max(0, box["y"] + sy - pad - spec.get("above", 0))
        hgt = min(spec.get("maxh", 1400), box["height"] + 2 * pad + spec.get("above", 0) + spec.get("below", 0), ph - y0)
        shot = pg.screenshot(full_page=True, clip={"x": 0, "y": y0, "width": w, "height": hgt}, animations="disabled")
        pg.close()
        after = Image.open(io.BytesIO(shot)).convert("RGB")
        before = [Image.open(ROOT / lab[k]).convert("RGB") for k in ("crop", "context") if lab.get(k) and (ROOT / lab[k]).exists()]
        H = 700
        fit = lambda im: im if im.height <= H and im.width <= 900 else im.resize((int(im.width * min(H / im.height, 900 / im.width)), int(im.height * min(H / im.height, 900 / im.width))))
        ims = [fit(i) for i in before] + [fit(after)]
        top, gap = 64, 20
        sheet = Image.new("RGB", (sum(i.width for i in ims) + gap * (len(ims) + 1), max(i.height for i in ims) + top + gap), "white")
        d = ImageDraw.Draw(sheet)
        d.text((gap, 8), f"#{lid} ({lab['site_id']}, {w}px): {(lab['comment'] or lab['text'] or '').strip()[:170]}".replace("\n", " "), fill="black")
        x = gap
        for i, im in enumerate(ims):
            d.text((x, 40), ["labelled element", "labelled context", "rebuild"][i if len(ims) == 3 else i + (3 - len(ims))], fill=(200, 0, 0) if im is not ims[-1] else (0, 120, 0))
            sheet.paste(im, (x, top)); x += im.width + gap
        sheet.save(OUT / f"{lid}.jpg", quality=80)
        print("ok", lid)
    b.close()
