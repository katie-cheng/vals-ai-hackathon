"""Render every route at 1440 and 390 px and record console errors, horizontal overflow and banned patterns.

usage: python checks.py http://localhost:4173 > ../reports/checks.json
"""
import asyncio, json, re, sys
from playwright.async_api import async_playwright

ROUTES = ["/", "/about", "/services", "/services/growth-strategy", "/work", "/work/ledgerly", "/pricing",
          "/insights", "/insights/90-day-growth-roadmap", "/contact"]
WIDTHS = [1440, 390]
JS = """() => {
  const els = [...document.querySelectorAll('body *')].filter(e => e.offsetParent !== null);
  const cs = e => getComputedStyle(e);
  return {
    scrollWidth: document.documentElement.scrollWidth,
    text_middot: (document.body.innerText.match(/\\u00b7/g) || []).length,
    text_emdash: (document.body.innerText.match(/\\u2014/g) || []).length,
    animated_dots: els.filter(e => e.offsetWidth <= 12 && e.offsetHeight <= 12 && cs(e).borderRadius !== '0px'
                                  && cs(e).animationName !== 'none').length,
    monospace: els.filter(e => /mono/i.test(cs(e).fontFamily) && e.innerText.trim()).length,
    fonts: [...new Set(els.filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
                         .map(e => cs(e).fontFamily.split(',')[0].replace(/["']/g, '')))],
  };
}"""


async def main(base):
    out = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in WIDTHS:
            pg = await b.new_page(viewport={"width": w, "height": 900})
            for r in ROUTES:
                errs = []; pg.remove_all_listeners() if hasattr(pg, "remove_all_listeners") else None
                pg.on("console", lambda m, errs=errs: errs.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e, errs=errs: errs.append(str(e)))
                await pg.goto(base + r, wait_until="load")
                await pg.wait_for_timeout(3000)
                h = await pg.evaluate("document.documentElement.scrollHeight")
                for y in range(0, h, 600):
                    await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(80)
                m = await pg.evaluate(JS)
                m.update(route=r, width=w, height=h, console_errors=errs[:5], path=await pg.evaluate("location.pathname"))
                m["pass"] = (not errs and m["scrollWidth"] <= w and not m["text_middot"] and not m["text_emdash"]
                             and not m["animated_dots"] and not m["monospace"] and m["path"] == r)
                out.append(m)
            await pg.close()
        await b.close()
    print(json.dumps({"base": base, "passed": sum(m["pass"] for m in out), "total": len(out), "results": out}, indent=1))


asyncio.run(main(sys.argv[1].rstrip("/")))
