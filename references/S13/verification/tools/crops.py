"""Per-critique before/after evidence.

For every S13 critique: left = the labelled crop from the original site (data/sloplabel/shots/<id>.png) with its
context shot, right = the same place in the rebuilt site, at the width the label was made at.
usage: python crops.py FIXED_URL OUTDIR
"""
import json, pathlib, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[4]
CRIT = ROOT / "references/S13/inputs/critiques/critiques.json"
SHOTS = ROOT / "data/sloplabel/shots"

HEADER = dict(sel="header", clip_top=110)
HERO_TOP = dict(sel="#top h1", pad=170)
SVC = dict(sel="#service-panel", pad=24)
SLIDER = dict(sel="#results [role=slider]", pad=16)
STEPS = dict(sel="#process .space-y-10", pad=10, maxh=900)
# where each critiqued element lives (or used to live) in the rebuild
SPEC = {
    38: HERO_TOP, 40: HERO_TOP, 46: dict(sel="#top h1", pad=30),
    51: HEADER, 58: HEADER, 121: HEADER,
    61: dict(sel="#top a[href='#quote']", pad=150), 62: dict(sel="#top a[href='#quote']", pad=150),
    73: dict(sel="#top .animate-marquee >> xpath=../..", pad=30, fullw=True),
    67: dict(sel="#services h2", pad=60), 75: SVC, 107: SVC, 126: SVC, 127: SVC, 131: SVC,
    133: SVC, 134: SVC, 135: SVC, 136: dict(sel="#services", pad=0, maxh=1400),
    139: dict(sel="#results button[aria-label='Next comparison'] >> xpath=..", pad=20),
    144: SLIDER, 150: SLIDER,
    157: dict(SLIDER, keys=["Home"] + ["ArrowRight"] * 6), 170: dict(SLIDER, keys=["Home"] + ["ArrowRight"] * 3),
    174: dict(SLIDER, keys=["Home"] + ["ArrowRight"] * 12), 190: dict(SLIDER, keys=["End"] + ["ArrowLeft"] * 3),
    168: dict(sel="#results [role=slider]", pad=16, below=150),
    228: dict(sel="#process h3 >> nth=0", pad=120), 235: dict(sel="#process h3 >> nth=1", pad=120),
    230: dict(sel="#process .space-y-10 .rounded-full >> nth=0", pad=40),
    239: dict(sel="#process .space-y-10 .rounded-full >> nth=2", pad=40),
    237: STEPS, 246: STEPS,
    255: dict(sel="#why-us h2", pad=40, below=420), 256: dict(sel="#why-us h2", pad=40, below=420),
    258: dict(sel="#why-us h2", pad=40, below=420), 260: dict(sel="#why-us h2", pad=60),
    261: dict(sel="#why-us .persp > div >> nth=0", pad=20, hover=True),
    262: dict(sel="#why-us .persp > div >> nth=4", pad=20, hover=True),
    263: dict(sel="#why-us .persp > div >> nth=5", pad=20, hover=True),
    264: dict(sel="#pricing .glass-strong", pad=20), 266: dict(sel="#pricing .lg\\:grid-cols-5", pad=16),
    268: dict(sel="#areas svg", pad=10), 274: dict(sel="#areas .glass", pad=10), 277: dict(sel="#areas", pad=0, maxh=1100),
    270: dict(sel="#areas .flex-wrap", pad=50),
    279: dict(sel="#faq article >> nth=4", pad=20),
    280: dict(sel="#quote .glass-strong", pad=20, maxh=420), 281: dict(sel="#quote .glass-strong", pad=20, maxh=420),
    284: dict(sel="footer .border-t >> nth=1", pad=30), 287: dict(sel="footer .md\\:grid-cols-\\[1\\.4fr_1fr_1fr\\]", pad=20, below=140),
    285: dict(sel="footer button[aria-label='Share this website']", pad=70),
    292: dict(sel="#service-panel", pad=10), 297: dict(sel="#service-panel", pad=10),
}

HIDE_HEADER = "header{visibility:hidden!important}"


def font(n):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", n)
    except OSError:
        return ImageFont.load_default()


def settle(page):
    page.wait_for_timeout(3500)
    h = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        page.mouse.wheel(0, 600); page.wait_for_timeout(120); y += 600
    page.wait_for_timeout(800)


def grab(page, spec, out):
    w = page.viewport_size["width"]
    if spec.get("clip_top"):
        page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(900)
        page.screenshot(path=out, clip=dict(x=0, y=0, width=w, height=spec["clip_top"]))
        return
    loc = page.locator(spec["sel"]).first
    loc.evaluate("e=>e.scrollIntoView({block:'center'})"); page.wait_for_timeout(500)
    page.evaluate("(y)=>window.scrollBy(0,-y)", 200); page.wait_for_timeout(1300)
    if spec.get("keys"):
        loc.focus()
        for k in spec["keys"]:
            page.keyboard.press(k)
        page.wait_for_timeout(500)
    style = page.add_style_tag(content=HIDE_HEADER)
    if spec.get("hover"):
        loc.hover(); page.wait_for_timeout(700)
    b = loc.bounding_box()
    sy = page.evaluate("window.scrollY")
    p = spec.get("pad", 20)
    x0 = 0 if spec.get("fullw") else max(0, b["x"] - p)
    x1 = w if spec.get("fullw") else min(w, b["x"] + b["width"] + p)
    y0 = b["y"] + sy - p
    y1 = b["y"] + sy + b["height"] + p + spec.get("below", 0)
    if spec.get("maxh"):
        y1 = min(y1, y0 + spec["maxh"])
    page.screenshot(path=out, full_page=True, clip=dict(x=x0, y=max(0, y0), width=x1 - x0, height=y1 - max(0, y0)))
    style.evaluate("e=>e.remove()")


def compose(cid, comment, before, ctx, after, out):
    def fit(im, mw, mh):
        im = im.convert("RGB"); im.thumbnail((mw, mh)); return im
    b, c, a = fit(Image.open(before), 560, 460), fit(Image.open(ctx), 560, 360), fit(Image.open(after), 760, 820)
    H = max(b.height + c.height + 30, a.height) + 90
    W = 560 + 760 + 40
    s = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(s)
    d.text((10, 8), f"S13 #{cid}", fill="black", font=font(20))
    d.text((140, 12), comment[:150] + ("..." if len(comment) > 150 else ""), fill=(60, 60, 60), font=font(13))
    d.text((10, 44), "ORIGINAL (labelled crop + context)", fill=(190, 30, 30), font=font(14))
    d.text((590, 44), "REBUILD (same place)", fill=(20, 120, 60), font=font(14))
    s.paste(b, (10, 70)); s.paste(c, (10, 70 + b.height + 20)); s.paste(a, (590, 70))
    s.save(out, quality=78)


def main():
    url, outdir = sys.argv[1], pathlib.Path(sys.argv[2])
    only = {int(x) for x in sys.argv[3].split(",")} if len(sys.argv) > 3 else None
    raw = outdir / "_raw"; raw.mkdir(parents=True, exist_ok=True)
    crits = [r for r in json.loads(CRIT.read_text()) if r["site_id"] == "S13" and (not only or r["id"] in only)]
    by_w = {}
    for r in crits:
        by_w.setdefault(r["viewport_w"], []).append(r)
    with sync_playwright() as p:
        br = p.chromium.launch()
        for w, rs in sorted(by_w.items()):
            pg = br.new_page(viewport={"width": w, "height": 900 if w > 600 else 844})
            pg.goto(url, wait_until="load"); settle(pg)
            for r in rs:
                spec = SPEC[r["id"]]
                a = raw / f"{r['id']}.png"
                try:
                    grab(pg, spec, str(a))
                except Exception as e:
                    print("FAIL", r["id"], e); continue
                compose(r["id"], r["comment"], SHOTS / f"{r['id']}.png", SHOTS / f"{r['id']}_ctx.png", a, outdir / f"{r['id']}.jpg")
                print("ok", r["id"], w)
            pg.close()
        br.close()


if __name__ == "__main__":
    main()
