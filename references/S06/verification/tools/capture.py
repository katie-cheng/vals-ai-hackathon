"""Capture every public route of the site: full-page screenshot, home-page section screenshots, console errors, failed requests.

usage: python capture.py URL OUTDIR [--widths 1440,390] [--fmt png|jpg]
Writes OUTDIR/<width>/<page>.<fmt>, OUTDIR/<width>/home-<n>-<section>.<fmt> and OUTDIR/<width>/log.json.
The admin dashboard is captured with an administrator session written to localStorage (the app keeps its session there).
"""
import argparse, json, pathlib, re
from playwright.sync_api import sync_playwright

ROUTES = [("home", "/"), ("menu", "/menu"), ("about", "/about"), ("gallery", "/gallery"), ("reviews", "/reviews"),
          ("contact", "/contact"), ("order", "/order"), ("login", "/login"), ("notfound", "/nope")]

def settle(page):
    page.wait_for_timeout(1200)
    h = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        page.mouse.wheel(0, 600); page.wait_for_timeout(120); y += 600
        h = page.evaluate("document.documentElement.scrollHeight")
    page.wait_for_timeout(600)
    page.evaluate("window.scrollTo(0,0)")
    page.wait_for_timeout(700)

def shot(target, path, fmt, **kw):
    if fmt == "jpg":
        target.screenshot(path=str(path), type="jpeg", quality=70, animations="disabled", **kw)
    else:
        target.screenshot(path=str(path), animations="disabled", **kw)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url"); ap.add_argument("out")
    ap.add_argument("--widths", default="1440,390"); ap.add_argument("--fmt", default="png")
    ap.add_argument("--no-admin", action="store_true")
    a = ap.parse_args(); base = a.url.rstrip("/")
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w in [int(x) for x in a.widths.split(",")]:
            h = 900 if w > 600 else 844
            out = pathlib.Path(a.out) / str(w); out.mkdir(parents=True, exist_ok=True)
            ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            page = ctx.new_page()
            log = {"console": [], "pageerrors": [], "failed": [], "overflow": {}}
            cur = {"name": ""}
            page.on("console", lambda m: m.type == "error" and log["console"].append(f"{cur['name']}: {m.text}"))
            page.on("pageerror", lambda e: log["pageerrors"].append(f"{cur['name']}: {e}"))
            page.on("requestfailed", lambda r: log["failed"].append(f"{cur['name']}: {r.url} {r.failure}"))
            page.on("response", lambda r: r.status >= 400 and log["failed"].append(f"{cur['name']}: {r.status} {r.url}"))
            for name, route in ROUTES:
                cur["name"] = name
                page.goto(base + route, wait_until="load"); settle(page)
                log["overflow"][name] = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
                if name == "home":
                    secs = page.query_selector_all("main > section, main > div > section, footer")
                    for i, el in enumerate(secs):
                        label = el.evaluate("e => e.tagName === 'FOOTER' ? 'footer' : (e.id || e.getAttribute('aria-label') || (e.querySelector('h1,h2') || {}).innerText || 'section')")
                        label = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")[:28]
                        el.scroll_into_view_if_needed(); page.wait_for_timeout(700)
                        shot(el, out / f"home-{i:02d}-{label}.{a.fmt}", a.fmt)
                    page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(500)
                    shot(page, out / f"header.{a.fmt}", a.fmt, clip={"x": 0, "y": 0, "width": w, "height": 150})
                shot(page, out / f"{name}.{a.fmt}", a.fmt, full_page=True)
            if not a.no_admin:
                cur["name"] = "admin"
                page.evaluate("localStorage.setItem('rocksteady-campus-session-v2', JSON.stringify({id:'admin',name:'Campus Administrator',email:'admin@rocksteady.co.za',role:'admin'}))")
                page.goto(base + "/admin", wait_until="load")
                page.wait_for_timeout(1200)
                log["overflow"]["admin"] = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
                shot(page, out / f"admin.{a.fmt}", a.fmt, full_page=True)
            (out / "log.json").write_text(json.dumps(log, indent=1))
            ctx.close()
        b.close()

if __name__ == "__main__":
    main()
