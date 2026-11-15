"""Capture per-section screenshots, console errors and failed requests for a site.

usage: python capture.py URL OUTDIR [--widths 1440,390]
Writes OUTDIR/<width>/<section>.png, OUTDIR/<width>/full.png and OUTDIR/<width>/log.json.
"""
import argparse, json, pathlib
from playwright.sync_api import sync_playwright

SECTIONS = ["header", "#top", "#services", "#results", "#process", "#why-us", "#pricing", "#areas", "#faq", "#quote", "footer"]

def settle(page):
    page.wait_for_timeout(3500)  # preloader
    h = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        page.mouse.wheel(0, 500)
        page.wait_for_timeout(180)
        y += 500
        h = page.evaluate("document.documentElement.scrollHeight")
    page.wait_for_timeout(1500)
    page.evaluate("window.scrollTo(0,0)")
    page.wait_for_timeout(1500)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url"); ap.add_argument("out")
    ap.add_argument("--widths", default="1440,390")
    a = ap.parse_args()
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w in [int(x) for x in a.widths.split(",")]:
            h = 900 if w > 600 else 844
            out = pathlib.Path(a.out) / str(w); out.mkdir(parents=True, exist_ok=True)
            ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            page = ctx.new_page()
            log = {"console": [], "pageerrors": [], "failed": []}
            page.on("console", lambda m: m.type in ("error", "warning") and log["console"].append(f"{m.type}: {m.text}"))
            page.on("pageerror", lambda e: log["pageerrors"].append(str(e)))
            page.on("requestfailed", lambda r: log["failed"].append(f"{r.url} {r.failure}"))
            page.on("response", lambda r: r.status >= 400 and log["failed"].append(f"{r.status} {r.url}"))
            page.goto(a.url, wait_until="load")
            settle(page)
            for s in SECTIONS:
                el = page.query_selector(s)
                if not el:
                    log.setdefault("missing", []).append(s); continue
                name = s.strip("#") or "top"
                if s == "header":
                    page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(600)
                    page.screenshot(path=str(out / "header.png"), clip={"x": 0, "y": 0, "width": w, "height": 120})
                    continue
                el.scroll_into_view_if_needed(); page.wait_for_timeout(1200)
                el.screenshot(path=str(out / f"{name}.png"), animations="disabled")
            page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(800)
            page.screenshot(path=str(out / "full.png"), full_page=True, animations="disabled")
            (out / "log.json").write_text(json.dumps(log, indent=1))
            ctx.close()
        b.close()

if __name__ == "__main__":
    main()
