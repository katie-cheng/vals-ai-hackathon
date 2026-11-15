"""Freeze rendered snapshots of sites in a split: desktop + mobile full-page screenshots and rendered DOM.

Usage: python3 scripts/snapshot_sites.py heldout [--cdp http://localhost:29229]
"""
import argparse, json, pathlib, time
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
VIEWPORTS = {"desktop": (1440, 900), "mobile": (390, 844)}

ap = argparse.ArgumentParser()
ap.add_argument("split", choices=["dev", "heldout"])
ap.add_argument("--cdp", default=None, help="connect to an existing Chrome instead of launching one")
args = ap.parse_args()

sites = json.load(open(ROOT / "data/splits.json"))[args.split]
out_dir = ROOT / "data/snapshots" / args.split
with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(args.cdp) if args.cdp else p.chromium.launch()
    for s in sites:
        d = out_dir / s["site_id"]
        d.mkdir(parents=True, exist_ok=True)
        meta = dict(s, captured_at=time.time(), views={})
        for name, (w, h) in VIEWPORTS.items():
            ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=name == "mobile")
            page = ctx.new_page()
            try:
                page.goto(s["url"], wait_until="load", timeout=60000)
                page.wait_for_timeout(2500)
                for y in range(0, page.evaluate("document.body.scrollHeight"), h):
                    page.evaluate(f"window.scrollTo(0,{y})")
                    page.wait_for_timeout(150)
                page.evaluate("window.scrollTo(0,0)")
                page.wait_for_timeout(500)
                page.screenshot(path=d / f"{name}.png", full_page=True)
                (d / f"{name}.html").write_text(page.content())
                meta["views"][name] = "ok"
            except Exception as e:
                meta["views"][name] = f"failed: {e}"[:200]
            ctx.close()
        (d / "meta.json").write_text(json.dumps(meta, indent=1))
        print(s["site_id"], meta["views"])
