"""Render real-world reference sites from candidate lists in data/web/.

Sources:
  curated-top:    hand-picked high-quality sites of top companies / well-known designers (data/web/curated_top.tsv)
  osm-local:      local businesses with websites from OpenStreetMap city extracts (scripts/osm_businesses.py)
  personal-sites: personal homepages listed on personalsit.es (data/web/personal_sites.json)

Output: data/snapshots/web/<source>/<slug>/{desktop,mobile}.{png,html}, meta.json (includes the site "type").
Usage: python3 scripts/scrape_web.py [--sources curated-top,osm-local,personal-sites] [--personal 80] [--workers 2]
"""
import argparse, asyncio, csv, json, pathlib, re, time, urllib.parse
from playwright.async_api import async_playwright
from render_lib import render

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = ROOT / "data/web"

ap = argparse.ArgumentParser()
ap.add_argument("--sources", default="curated-top,osm-local,personal-sites")
ap.add_argument("--personal", type=int, default=80, help="max usable personal-site captures")
ap.add_argument("--workers", type=int, default=2)
args = ap.parse_args()


def slug(url):
    p = urllib.parse.urlparse(url)
    return re.sub(r"[^a-z0-9]+", "-", (p.netloc.removeprefix("www.") + p.path).lower()).strip("-")


def candidates():
    want = set(args.sources.split(","))
    out = []
    if "curated-top" in want:
        for r in csv.DictReader(open(WEB / "curated_top.tsv"), delimiter="\t"):
            out.append({"source": "curated-top", "slug": slug(r["url"]), "url": r["url"], "type": r["type"]})
    if "osm-local" in want:
        out += json.load(open(WEB / "osm_businesses.json"))
    if "personal-sites" in want:
        out += json.load(open(WEB / "personal_sites.json"))
    return out


async def main():
    base = ROOT / "data/snapshots/web"
    done = {(p.parent.parent.name, p.parent.name) for p in base.glob("*/*/meta.json")}
    personal_ok = {p.parent.name for p in base.glob("personal-sites/*/meta.json")
                   if json.load(open(p)).get("views", {}).get("desktop") == "ok"}
    queue = asyncio.Queue()
    for c in candidates():
        if (c["source"], c["slug"]) not in done:
            queue.put_nowait(c)
    print(queue.qsize(), "to capture", flush=True)
    lock = asyncio.Lock()
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        async def worker():
            while not queue.empty():
                c = await queue.get()
                if c["source"] == "personal-sites" and len(personal_ok) >= args.personal:
                    continue
                meta = dict(c, render_url=c["url"])
                d = base / c["source"] / c["slug"]
                d.mkdir(parents=True, exist_ok=True)
                try:
                    meta["views"], meta["stats"] = await asyncio.wait_for(render(browser, c["url"], d), 400)
                except Exception as e:
                    meta["views"], meta["stats"] = {"desktop": f"error: {e!r}"[:200]}, {}
                meta["captured_at"] = time.time()
                (d / "meta.json").write_text(json.dumps(meta, indent=1))
                async with lock:
                    if c["source"] == "personal-sites" and meta["views"].get("desktop") == "ok":
                        personal_ok.add(c["slug"])
                    print(c["source"], c["type"], c["slug"], meta["views"], flush=True)

        await asyncio.gather(*[worker() for _ in range(args.workers)])
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
