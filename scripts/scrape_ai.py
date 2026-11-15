"""Sample AI-builder-made sites (Lovable) and render them, to widen the quality range beyond YC.

Sources (shuffled together, seed 0):
  madewithlovable: community showcase of sites built with Lovable (madewithlovable.com/sitemap_projects.xml);
                   live URL taken from each project page's JSON-LD "url"
  lovable-templates: official Lovable templates (*.lovable.app links on lovable.dev/templates)

Output: data/snapshots/ai/<source>/<slug>/{desktop,mobile}.{png,html}, meta.json; plus data/ai/sites.jsonl
Usage: python3 scripts/scrape_ai.py [--n 200] [--templates 50] [--workers 2]
"""
import argparse, asyncio, json, pathlib, random, re, time, urllib.request
from playwright.async_api import async_playwright
from render_lib import render

ROOT = pathlib.Path(__file__).resolve().parent.parent
UA = {"User-Agent": "Mozilla/5.0 (SlopBench research; contact aliahmad@stanford.edu)"}

ap = argparse.ArgumentParser()
ap.add_argument("--n", type=int, default=200)
ap.add_argument("--templates", type=int, default=50)
ap.add_argument("--workers", type=int, default=2)
args = ap.parse_args()


def get(url):
    req = urllib.request.Request(url, headers={**UA, "Accept-Encoding": "identity"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")


def candidates():
    rng = random.Random(0)
    tpl = sorted(set(re.findall(r"https://[a-z0-9-]+\.lovable\.app", get("https://lovable.dev/templates"))))
    rng.shuffle(tpl)
    tpl = [{"source": "lovable-templates", "slug": u.split("//")[1].split(".")[0], "url": u} for u in tpl[:args.templates]]
    proj = re.findall(r"<loc>([^<]+)</loc>", get("https://madewithlovable.com/sitemap_projects.xml"))
    rng.shuffle(proj)
    proj = [{"source": "madewithlovable", "slug": p.rstrip("/").rsplit("/", 1)[1], "page": p} for p in proj]
    out, i = [], 0
    while tpl or proj:  # interleave so both sources fill in from the start
        if tpl and (i % 4 == 0 or not proj):
            out.append(tpl.pop())
        elif proj:
            out.append(proj.pop())
        i += 1
    return out


def project_url(page):
    time.sleep(0.5)
    m = re.search(r'"url":\s*"(https?://[^"]+)"', get(page))
    return m.group(1) if m else None


async def main():
    cands = candidates()
    base = ROOT / "data/snapshots/ai"
    done = {(p.parent.parent.name, p.parent.name) for p in base.glob("*/*/meta.json")
            if json.load(open(p)).get("views", {}).get("desktop") == "ok"}
    ok = len(done)
    queue = asyncio.Queue()
    for c in cands:
        if (c["source"], c["slug"]) not in done:
            queue.put_nowait(c)
    lock = asyncio.Lock()
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        async def worker():
            nonlocal ok
            while not queue.empty() and ok < args.n:
                c = await queue.get()
                meta = dict(c)
                if c["source"] == "madewithlovable":
                    try:
                        meta["url"] = await asyncio.to_thread(project_url, c["page"])
                    except Exception:
                        meta["url"] = None
                    if not meta["url"]:
                        continue
                meta["render_url"] = meta["url"]
                d = base / c["source"] / c["slug"]
                d.mkdir(parents=True, exist_ok=True)
                meta["views"], meta["stats"] = await render(browser, meta["url"], d)
                meta["captured_at"] = time.time()
                (d / "meta.json").write_text(json.dumps(meta, indent=1))
                async with lock:
                    if meta["views"].get("desktop") == "ok":
                        ok += 1
                    print(ok, c["source"], c["slug"], meta["views"], flush=True)

        await asyncio.gather(*[worker() for _ in range(args.workers)])
        await browser.close()
    rows = [json.load(open(p)) for p in sorted(base.glob("*/*/meta.json"))]
    (ROOT / "data/ai").mkdir(exist_ok=True)
    with open(ROOT / "data/ai/sites.jsonl", "w") as f:
        for r in rows:
            f.write(json.dumps(r) + "\n")
    print("ok", sum(r["views"].get("desktop") == "ok" for r in rows), "of", len(rows))


asyncio.run(main())
