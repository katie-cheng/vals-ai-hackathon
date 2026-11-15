import asyncio, json
from playwright.async_api import async_playwright
B = "http://127.0.0.1:8700"
async def main():
    sites = json.loads(__import__("urllib.request").request.urlopen(B + "/__slop/api/sites").read())
    async with async_playwright() as p:
        br = await p.chromium.launch()
        sem = asyncio.Semaphore(5)
        async def one(s):
            async with sem:
                ctx = await br.new_context(viewport={"width": 1440, "height": 900}); page = await ctx.new_page()
                errs, bad = [], []
                page.on("pageerror", lambda e: errs.append(str(e)[:120]))
                page.on("response", lambda r: bad.append(f"{r.status} {r.url[-60:]}") if r.status >= 400 else None)
                try:
                    await page.goto(f"{B}/__slop/open/{s['site_id']}", wait_until="load", timeout=45000)
                except Exception as e:
                    errs.append("GOTO " + str(e)[:80])
                await page.wait_for_timeout(2500)
                await page.mouse.wheel(0, 4000); await page.wait_for_timeout(800)
                r = await page.evaluate("({ov: !!document.getElementById('__sloplabel'), locs: document.querySelectorAll('[data-source-loc]').length, h: document.documentElement.scrollHeight, txt: document.body.innerText.length})")
                await ctx.close()
                return s["site_id"], r, errs[:2], bad[:3]
        for sid, r, errs, bad in await asyncio.gather(*[one(s) for s in sites]):
            print(sid, r, "ERR" if errs else "", errs, bad)
        await br.close()
asyncio.run(main())
