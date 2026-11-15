"""Per-critique before/after evidence.

For every S02 label: left = the labelled crop from the original (data/sloplabel/shots/<id>.png) with its context shot,
right = the same place in the rebuild, at the width the label was made at.
usage: python crops.py REBUILD_URL OUTDIR
"""
import json, pathlib, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[4]
CRIT = ROOT / "references/S02/inputs/critiques/critiques.json"
SHOTS = ROOT / "data/sloplabel/shots"

HEADER = dict(clip_top=72)
HERO = dict(sel="main section >> nth=0", pad=10)
HERO_TEXT = dict(sel="main h1", pad=30, below=260)
FEATURES = dict(sel="main section >> nth=1", pad=10)
SYLLABUS_HEAD = dict(sel="main section >> nth=2 >> h2", pad=40, below=160)
CHAPTERS = dict(sel="main section >> nth=2 >> .rows", pad=10, maxh=620)
PANEL = dict(sel="#chapter-panel-1", pad=70)
CTA = dict(sel="main section >> nth=3", pad=10)
FOOTER = dict(sel="footer", pad=0)
SPEC = {41: SYLLABUS_HEAD, 84: SYLLABUS_HEAD, 45: HERO_TEXT, 53: HERO_TEXT, 54: HERO_TEXT, 447: HERO_TEXT, 448: HERO,
        74: dict(sel="main section >> nth=1 >> h2", pad=40), 76: FEATURES, **{i: FEATURES for i in range(78, 84)},
        **{i: CHAPTERS for i in range(85, 96)}, 96: PANEL, 97: PANEL,
        99: CTA, 100: CTA, 101: CTA, 102: CTA, 103: CTA, 104: FOOTER, 105: FOOTER, 106: FOOTER, 108: FOOTER, 450: FOOTER,
        **{i: HEADER for i in range(109, 119)}}
F = lambda n: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", n)


def grab(page, spec, out):
    w = page.viewport_size["width"]
    if spec.get("clip_top"):
        page.evaluate("scrollTo(0,0)"); page.screenshot(path=out, clip=dict(x=0, y=0, width=w, height=spec["clip_top"])); return
    b = page.locator(spec["sel"]).first.evaluate("e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height } }")
    p = spec.get("pad", 20); y0 = max(0, b["y"] - p); y1 = b["y"] + b["height"] + p + spec.get("below", 0)
    if spec.get("maxh"): y1 = min(y1, y0 + spec["maxh"])
    x0 = max(0, b["x"] - p); x1 = min(w, b["x"] + b["width"] + p)
    page.screenshot(path=out, full_page=True, clip=dict(x=x0, y=y0, width=x1 - x0, height=y1 - y0))


def compose(r, before, ctx, after, out):
    fit = lambda im, mw, mh: (lambda i: (i.thumbnail((mw, mh)), i)[1])(im.convert("RGB"))
    b, c, a = fit(Image.open(before), 560, 420), fit(Image.open(ctx), 560, 360), fit(Image.open(after), 760, 800)
    H = max(b.height + c.height + 30, a.height) + 90
    s = Image.new("RGB", (1360, H), "white"); d = ImageDraw.Draw(s)
    note = (r["comment"] or "").strip().replace("\n", " ") or "(no comment) " + (r.get("reading") or "")
    d.text((10, 8), f"S02 #{r['id']}", fill="black", font=F(20)); d.text((140, 12), note[:150], fill=(60, 60, 60), font=F(13))
    d.text((10, 44), "ORIGINAL (labelled crop + context)", fill=(190, 30, 30), font=F(14)); d.text((590, 44), "REBUILD (same place)", fill=(20, 120, 60), font=F(14))
    s.paste(b, (10, 70)); s.paste(c, (10, 70 + b.height + 20)); s.paste(a, (590, 70)); s.save(out, quality=78)


def main():
    url, outdir = sys.argv[1], pathlib.Path(sys.argv[2]); raw = outdir / "_raw"; raw.mkdir(parents=True, exist_ok=True)
    crits = [r for r in json.loads(CRIT.read_text()) if r["site_id"] == "S02"]
    with sync_playwright() as p:
        br = p.chromium.launch()
        for w in sorted({r["viewport_w"] for r in crits}):
            pg = br.new_page(viewport={"width": w, "height": 900}); pg.goto(url, wait_until="networkidle"); pg.wait_for_timeout(600)
            for r in [r for r in crits if r["viewport_w"] == w]:
                a = raw / f"{r['id']}.png"; grab(pg, SPEC[r["id"]], str(a))
                compose(r, SHOTS / f"{r['id']}.png", SHOTS / f"{r['id']}_ctx.png", a, outdir / f"{r['id']}.jpg"); print("ok", r["id"], w)
            pg.close()
        br.close()


if __name__ == "__main__":
    main()
