"""Sample YC company homepages and render them.

Sets (stratified by industry, seed 0):
  pre2022: batches <= 2021, rendered from the Internet Archive snapshot closest to 2021-07-01 (pre-ChatGPT human-made reference set)
  current: batches 2025-2026, rendered live (in-the-wild mix)

Source list: data/yc/yc-oss-all.json from https://yc-oss.github.io/api/companies/all.json
Output: data/snapshots/yc/<set>/<slug>/{desktop,mobile}.{png,html}, meta.json; plus data/yc/<set>.jsonl
Usage: python3 scripts/scrape_yc.py pre2022|current [--n 200] [--workers 4]
"""
import argparse, asyncio, json, pathlib, random, re, time, urllib.parse, urllib.request
from collections import defaultdict
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
VIEWPORTS = {"desktop": (1440, 900), "mobile": (390, 844)}

ap = argparse.ArgumentParser()
ap.add_argument("set", choices=["pre2022", "current"])
ap.add_argument("--n", type=int, default=200)
ap.add_argument("--workers", type=int, default=4)
args = ap.parse_args()


def year(c):
    m = re.search(r"(\d{4})", c.get("batch") or "")
    return int(m.group(1)) if m else None


def stratified(pool, n, seed=0):
    rng = random.Random(seed)
    by = defaultdict(list)
    for c in pool:
        by[c.get("industry") or "Unspecified"].append(c)
    for v in by.values():
        rng.shuffle(v)
    order = []
    while any(by.values()):  # round-robin weighted by industry size
        for k in sorted(by, key=lambda k: -len(by[k])):
            take = max(1, round(len(by[k]) / max(1, len(pool)) * 20))
            order += by[k][:take]
            by[k] = by[k][take:]
    return order


companies = json.load(open(ROOT / "data/yc/yc-oss-all.json"))
if args.set == "pre2022":
    pool = [c for c in companies if c.get("website") and year(c) and year(c) <= 2021]
else:
    pool = [c for c in companies if c.get("website") and year(c) in (2025, 2026)]
candidates = stratified(pool, args.n)
out_dir = ROOT / "data/snapshots/yc" / args.set
out_dir.mkdir(parents=True, exist_ok=True)


def wayback_url(site):
    q = "https://archive.org/wayback/available?" + urllib.parse.urlencode({"url": site, "timestamp": "20210701"})
    for _ in range(3):
        try:
            r = json.load(urllib.request.urlopen(q, timeout=30))
            snap = r.get("archived_snapshots", {}).get("closest")
            if snap and snap.get("status") == "200" and snap["timestamp"] < "20221101":
                return snap["timestamp"], f"https://web.archive.org/web/{snap['timestamp']}if_/{site}"
            return None
        except Exception:
            time.sleep(3)
    return None


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


async def main():
    done = {p.parent.name for p in out_dir.glob("*/meta.json")
            if json.load(open(p)).get("views", {}).get("desktop") == "ok"}
    ok = len(done)
    queue = asyncio.Queue()
    for c in candidates:
        if c["slug"] not in done:
            queue.put_nowait(c)
    lock = asyncio.Lock()
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        async def worker():
            nonlocal ok
            while not queue.empty() and ok < args.n:
                c = await queue.get()
                site = c["website"]
                meta = {k: c.get(k) for k in ("slug", "name", "batch", "industry", "subindustry", "status", "one_liner", "website")}
                meta["set"] = args.set
                if args.set == "pre2022":
                    wb = await asyncio.to_thread(wayback_url, site)
                    if not wb:
                        continue
                    meta["archive_timestamp"], url = wb
                else:
                    url = site
                meta["render_url"] = url
                d = out_dir / c["slug"]
                d.mkdir(exist_ok=True)
                meta["views"], meta["stats"] = await render(browser, url, d)
                meta["captured_at"] = time.time()
                (d / "meta.json").write_text(json.dumps(meta, indent=1))
                async with lock:
                    if meta["views"].get("desktop") == "ok":
                        ok += 1
                    print(ok, c["slug"], meta["views"], flush=True)

        await asyncio.gather(*[worker() for _ in range(args.workers)])
        await browser.close()
    rows = [json.load(open(p)) for p in sorted(out_dir.glob("*/meta.json"))]
    with open(ROOT / f"data/yc/{args.set}.jsonl", "w") as f:
        for r in rows:
            f.write(json.dumps(r) + "\n")
    print("ok", sum(r["views"].get("desktop") == "ok" for r in rows), "of", len(rows))


asyncio.run(main())
