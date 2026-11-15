"""Per-critique before/after evidence, one image per S30 label.

Left: the labelled element in the original (data/sloplabel/shots/<id>_ctx.png, the label drawn on it).
Right: the same place in the solution, at the 934 px width the labels were made at.
The export's context shots for the 24 case-study labels are blank, so for those the left side is rendered from
inputs/live-app at the label's scroll position with the label's rectangle drawn on it.
usage: python crops.py http://localhost:4331 ../crops http://localhost:4330
"""
import io, json, pathlib, sys
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[4]
CRIT = json.load(open(ROOT / "references/S30/inputs/critiques/critiques.json"))
SHOTS = ROOT / "data/sloplabel/shots"
BASE, OUT = sys.argv[1].rstrip("/"), pathlib.Path(sys.argv[2])
LIVE = sys.argv[3].rstrip("/") if len(sys.argv) > 3 else None

TOP, CTA, FOOT = None, "cta", "footer"
CASE = {"/work/ledgerly": [238, 240, 248, 249, 252, 257], "/work/nova-cloud": [267, 269, 275, 276, 278],
        "/work/atlas-freight": [282, 283, 286, 290, 293, 295], "/work/bloom-and-co": [298, 299, 300, 301, 302, 303, 305]}
# label id -> (route, where the element is, or used to be, in the solution)
SPEC = {171: ("/", TOP), 183: ("/", TOP), 188: ("/work", TOP), 211: ("/work", "Ledgerly"), 213: ("/work", "Nova Cloud"),
        215: ("/work", "Atlas Freight"), 216: ("/work", "Bloom & Co"), 217: ("/work", CTA), 224: ("/work", CTA),
        231: ("/work", CTA), 232: ("/work", FOOT), 233: ("/work", FOOT), 234: ("/work", FOOT), 236: ("/work", FOOT),
        309: ("/services", TOP), 311: ("/services", TOP), 312: ("/pricing", TOP), 313: ("/pricing", "Do the math"),
        316: ("/pricing", "Do the math"), 324: ("/pricing", "Do the math"), 326: ("/pricing", "Do the math"),
        333: ("/pricing", CTA), 335: ("/pricing", "Fair questions"), 337: ("/insights", TOP), 339: ("/insights", CTA),
        341: ("/about", TOP), 343: ("/about", "Founded on a"), 348: ("/about", "Founded on a"),
        353: ("/about", "Values that"), 354: ("/about", "Six years"), 355: ("/about", "Senior only. No"),
        357: ("/about", FOOT), 358: ("/about", FOOT), 359: ("/contact", TOP), 360: ("/contact", FOOT)}
for route, ids in CASE.items():
    for i in ids:
        text = {238: 1, 267: 1, 293: 1, 295: 1, 298: 1}.get(i) and "Where they started" or \
               {240: 1, 290: 1}.get(i) and "moves that" or {248: 1, 269: 1, 286: 1, 302: 1}.get(i) and "Receipts" or \
               {299: 1, 300: 1, 301: 1}.get(i) and "Services" or {278: 1}.get(i) and FOOT or CTA
        SPEC[i] = (route, text)


def shot(pg, route, where, vh):
    pg.set_viewport_size({"width": 934, "height": vh})
    pg.goto(BASE + route, wait_until="load"); pg.wait_for_timeout(2000)
    h = pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0, h, 500):
        pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(80)
    y = pg.evaluate("""w => { if (!w) return 0; const top = e => e.getBoundingClientRect().top + scrollY;
        if (w === 'footer') return document.documentElement.scrollHeight;
        if (w === 'cta') return top(document.querySelector('footer')) - innerHeight * 0.6;
        const e = [...document.querySelectorAll('main h1, main h2, main h3, main dt, main p, main span')]
            .find(e => e.innerText && e.innerText.trim().startsWith(w) || e.innerText.includes(w));
        return e ? top(e) - 160 : 0 }""", where)
    pg.evaluate(f"window.scrollTo(0,{max(0, y)})"); pg.wait_for_timeout(900)
    return Image.open(io.BytesIO(pg.screenshot())).convert("RGB")


def original(pg, c, route):
    pg.set_viewport_size({"width": int(c["viewport_w"]), "height": int(c["viewport_h"])})
    pg.goto(LIVE + route, wait_until="load"); pg.wait_for_timeout(3500)
    h = pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0, h, 500):
        pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(80)
    pg.evaluate(f"window.scrollTo(0,{c['scroll_y']})"); pg.wait_for_timeout(1500)
    im = Image.open(io.BytesIO(pg.screenshot())).convert("RGB")
    r = c["rect"]
    ImageDraw.Draw(im).rectangle((r["left"], r["top"], r["left"] + r["width"], r["top"] + r["height"]), outline=(225, 29, 72), width=3)
    return im


OUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page()
    for c in CRIT:
        route, where = SPEC[c["id"]]
        before = Image.open(SHOTS / f"{c['id']}_ctx.png").convert("RGB")
        lo, hi = before.convert("L").getextrema()
        if hi - lo < 20 and LIVE:
            before = original(pg, c, route)
        after = shot(pg, route, where, int(c.get("viewport_h") or 900))
        H = 620
        l = before.resize((int(before.width * H / before.height), H)); r = after.resize((int(after.width * H / after.height), H))
        im = Image.new("RGB", (l.width + r.width + 30, H + 34), "white")
        d = ImageDraw.Draw(im)
        d.text((6, 10), f"#{c['id']} original: {(c.get('comment') or '(no comment)')[:110]}", fill="black")
        d.text((l.width + 36, 10), f"solution {route}", fill="black")
        im.paste(l, (0, 34)); im.paste(r, (l.width + 30, 34))
        im.save(OUT / f"{c['id']}.jpg", quality=80)
    br.close()
print(len(CRIT), "crops")
