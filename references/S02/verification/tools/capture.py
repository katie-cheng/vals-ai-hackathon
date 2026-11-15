"""Full-page screenshots of every route at 1440 and 390px.  usage: python capture.py URL OUTDIR
Routes are reached client-side (pushState) so the same script works on the Arcada host, which 404s on deep links."""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROUTES = {"home": "/", "dashboard": "/dashboard", "courses": "/courses", "lesson": "/lesson/1", "playground": "/playground", "search": "/search",
          "quizzes": "/quizzes", "quiz": "/quiz/1", "certificates": "/certificates", "certificate": "/certificate/ITB-CH1-8291X",
          "resources": "/resources", "admin": "/admin", "profile": "/profile"}
url, out = sys.argv[1].rstrip("/"), pathlib.Path(sys.argv[2])
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((1440, 900), (390, 844)):
        (out / str(w)).mkdir(parents=True, exist_ok=True)
        pg = b.new_page(viewport={"width": w, "height": h}); pg.goto(url + "/", wait_until="networkidle"); pg.wait_for_timeout(800)
        for name, r in ROUTES.items():
            pg.evaluate("r=>{history.pushState({},'',r);dispatchEvent(new PopStateEvent('popstate'))}", r); pg.wait_for_timeout(700)
            pg.evaluate("document.querySelectorAll('*').forEach(e=>{const c=getComputedStyle(e);if(c.animationIterationCount==='infinite')e.style.animation='none'})")
            pg.screenshot(path=str(out / str(w) / f"{name}.png"), full_page=True)
        pg.close()
    b.close()
