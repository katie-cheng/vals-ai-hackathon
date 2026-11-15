"""Shared Playwright renderer: desktop + mobile full-page screenshots, rendered HTML and page stats."""
import asyncio

VIEWPORTS = {"desktop": (1440, 900), "mobile": (390, 844)}


def is_blank(png):
    from PIL import Image, ImageStat
    im = Image.open(png).convert("L")
    im = im.crop((0, 0, im.width, min(im.height, 2700))).resize((144, 270))
    return ImageStat.Stat(im).stddev[0] < 4


async def render(browser, url, d):
    views, stats = {}, {}
    for name, (w, h) in VIEWPORTS.items():
        ctx = await browser.new_context(viewport={"width": w, "height": h}, is_mobile=name == "mobile",
                                        user_agent=None if name == "desktop" else
                                        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
        page = await ctx.new_page()
        failed = []
        page.on("requestfailed", lambda r: failed.append(r.url))
        try:
            for attempt in range(4):
                try:
                    await page.goto(url, wait_until="load", timeout=90000)
                    break
                except Exception as e:
                    if "ERR_CONNECTION_REFUSED" not in str(e) or attempt == 3 or "archive.org" not in url:
                        raise
                    await asyncio.sleep(20 * (attempt + 1))
            await page.wait_for_timeout(3000)
            height = await page.evaluate("document.documentElement.scrollHeight")
            for y in range(0, min(height, 12000), h):
                await page.evaluate(f"window.scrollTo(0,{y})")
                await page.wait_for_timeout(120)
            await page.evaluate("window.scrollTo(0,0)")
            await page.wait_for_timeout(500)
            await page.screenshot(path=d / f"{name}.png", full_page=True, timeout=60000)
            (d / f"{name}.html").write_text(await page.content())
            stats[name] = await page.evaluate("""() => ({
                height: document.documentElement.scrollHeight,
                text_len: document.body ? document.body.innerText.length : 0,
                stylesheets: document.styleSheets.length,
                images: document.images.length,
                broken_images: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
                final_url: location.href})""")
            stats[name]["failed_requests"] = len(failed)
            stats[name]["blank"] = is_blank(d / f"{name}.png")
            views[name] = "ok"
        except Exception as e:
            views[name] = f"failed: {e}"[:200]
        await ctx.close()
    return views, stats
