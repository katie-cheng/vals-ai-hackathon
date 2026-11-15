"""Render candidate sites on many Modal CPU containers (same renderer as scrape_web.py, ~30x faster than this VM).

Usage: modal run scripts/render_modal.py [--sources curated-top,osm-local,personal-sites] [--personal 110]
Writes data/snapshots/web/<source>/<slug>/{desktop,mobile}.{png,html}, meta.json; skips already-captured sites.
"""
import csv, json, pathlib, re, time, urllib.parse

import modal

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
WEB = ROOT / "data/web"
app = modal.App("slopbench-render")
image = (modal.Image.debian_slim(python_version="3.11")
         .pip_install("playwright==1.47.0", "pillow")
         .run_commands("playwright install --with-deps chromium")
         .add_local_python_source("render_lib"))


@app.function(image=image, cpu=2, memory=4096, timeout=900, max_containers=40)
def render_one(c: dict) -> dict:
    import asyncio, tempfile
    from playwright.async_api import async_playwright
    from render_lib import render

    async def go(d):
        async with async_playwright() as p:
            b = await p.chromium.launch()
            try:
                return await asyncio.wait_for(render(b, c["url"], d), 600)
            finally:
                await b.close()

    d = pathlib.Path(tempfile.mkdtemp())
    try:
        views, stats = asyncio.run(go(d))
    except Exception as e:
        views, stats = {"desktop": f"error: {e!r}"[:200]}, {}
    files = {f.name: f.read_bytes() for f in d.iterdir()}
    return {"meta": dict(c, render_url=c["url"], views=views, stats=stats, captured_at=time.time()), "files": files}


def slug(url):
    p = urllib.parse.urlparse(url)
    return re.sub(r"[^a-z0-9]+", "-", (p.netloc.removeprefix("www.") + p.path).lower()).strip("-")


@app.local_entrypoint()
def main(sources: str = "curated-top,osm-local,personal-sites", personal: int = 110):
    want, cands = set(sources.split(",")), []
    if "curated-top" in want:
        cands += [{"source": "curated-top", "slug": slug(r["url"]), "url": r["url"], "type": r["type"]}
                  for r in csv.DictReader(open(WEB / "curated_top.tsv"), delimiter="\t")]
    if "osm-local" in want:
        cands += json.load(open(WEB / "osm_businesses.json"))
    if "personal-sites" in want:
        cands += json.load(open(WEB / "personal_sites.json"))[:personal]
    base = ROOT / "data/snapshots/web"
    done = {(p.parent.parent.name, p.parent.name) for p in base.glob("*/*/meta.json")}
    todo = [c for c in cands if (c["source"], c["slug"]) not in done]
    print(f"{len(todo)} to render", flush=True)
    ok = 0
    for r in render_one.map(todo, order_outputs=False, return_exceptions=True):
        if isinstance(r, Exception):
            print("error", repr(r)[:150]); continue
        m = r["meta"]
        d = base / m["source"] / m["slug"]
        d.mkdir(parents=True, exist_ok=True)
        for name, b in r["files"].items():
            (d / name).write_bytes(b)
        (d / "meta.json").write_text(json.dumps(m, indent=1))
        ok += m["views"].get("desktop") == "ok"
        print(ok, m["source"], m["type"], m["slug"], m["views"].get("desktop"), flush=True)
