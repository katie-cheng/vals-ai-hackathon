"""Side-by-side screenshots: inputs/live-app (left, before) vs solution (right, after) at 1440 px.

usage: python compare.py http://localhost:BEFORE http://localhost:AFTER ../before-after
"""
import asyncio, io, sys
from PIL import Image
from playwright.async_api import async_playwright

# name, route, text to scroll to (None = top, "bottom" = page end), crop height
SHOTS = [
    ("home-hero", "/", None, 900),
    ("work", "/work", None, 1500),
    ("ledgerly-challenge", "/work/ledgerly", "The challenge", 900),
    ("ledgerly-cta-footer", "/work/ledgerly", "bottom", 1500),
    ("about", "/about", "Founded on a", 1100),
    ("pricing", "/pricing", "alternatives", 1200),
]


async def grab(b, base, route, anchor, ch):
    pg = await b.new_page(viewport={"width": 1440, "height": 900})
    await pg.goto(base + route, wait_until="load"); await pg.wait_for_timeout(3000)
    h = await pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0, h, 600):
        await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(80)
    if anchor == "bottom":
        y = h - ch
    elif anchor:
        y = await pg.evaluate("""t => { const e = [...document.querySelectorAll('h1,h2,h3,span,p')]
            .find(e => e.innerText && e.innerText.toLowerCase().includes(t.toLowerCase()));
            return e ? e.getBoundingClientRect().top + scrollY - 150 : 0 }""", anchor)
    else:
        y = 0
    await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(500)
    png = await pg.screenshot(full_page=True)
    await pg.close()
    im = Image.open(io.BytesIO(png)); y = max(0, min(int(y), im.height - ch))
    return im.crop((0, y, 1440, y + ch))


async def main(before, after, outdir):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, route, anchor, ch in SHOTS:
            l = await grab(b, before, route, anchor, ch); r = await grab(b, after, route, anchor, ch)
            c = Image.new("RGB", (2900, ch), "white"); c.paste(l, (0, 0)); c.paste(r, (1460, 0))
            c.resize((1450, ch // 2)).save(f"{outdir}/ba-{name}.png")
            print(name)
        await b.close()


asyncio.run(main(sys.argv[1].rstrip("/"), sys.argv[2].rstrip("/"), sys.argv[3]))
