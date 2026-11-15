"""Behaviour checks for the solution: failed requests, overflow 360 to 1440 px on every route, wrapped controls,
accessible names, every control (mobile menu, services accordion, testimonial arrows, billing toggle, FAQ,
work and insight filters, hero video toggle, back to top), the three-step contact form (invalid and valid),
deep links, reduced motion and layout shift.

usage: python interactions.py http://localhost:4331 ../reports/interactions.json
"""
import json, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1].rstrip("/"), sys.argv[2]
ROUTES = ["/", "/about", "/services", "/services/growth-strategy", "/work", "/work/ledgerly", "/pricing",
          "/insights", "/insights/90-day-growth-roadmap", "/contact"]
WIDTHS = [360, 390, 414, 600, 768, 1024, 1180, 1280, 1440]
R = {}


def rec(name, ok, detail=""):
    R[name] = {"pass": bool(ok), "detail": detail}
    print(("PASS " if ok else "FAIL ") + name, "" if ok else detail)


def open_page(br, route="/", w=1440, h=900, **kw):
    pg = br.new_page(viewport={"width": w, "height": h}, **kw)
    pg.goto(URL + route, wait_until="load"); pg.wait_for_timeout(2200)
    return pg


def scroll_all(pg):
    h = pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0, h, 600):
        pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(90)


def requests_and_layout(br):
    failed, overflow, wrapped, unnamed, cls = [], [], [], [], []
    for w in WIDTHS:
        pg = br.new_page(viewport={"width": w, "height": 900})
        pg.on("response", lambda r: r.status >= 400 and failed.append(f"{r.status} {r.url}"))
        pg.on("requestfailed", lambda r: "ERR_ABORTED" not in (r.failure or "") and failed.append(f"{r.url} {r.failure}"))
        pg.add_init_script("""window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries())
            if (!e.hadRecentInput) window.__cls += e.value }).observe({type: 'layout-shift', buffered: true});""")
        for r in ROUTES:
            pg.goto(URL + r, wait_until="load"); pg.wait_for_timeout(2200); scroll_all(pg)
            sw = pg.evaluate("document.documentElement.scrollWidth")
            if sw > w: overflow.append(f"{r}@{w}: {sw}")
            wr = pg.evaluate("""() => { const lines = e => { const rg = document.createRange(); rg.selectNodeContents(e);
                return new Set([...rg.getClientRects()].filter(r => r.width > 1).map(r => Math.round(r.top / 6))).size };
              const texts = e => { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), o = []; let n;
                while ((n = w.nextNode())) if (n.textContent.trim()) o.push(n); return o };
              return [...document.querySelectorAll('.btn, header a, header button, [aria-pressed]')]
                .filter(e => e.offsetParent && texts(e).some(n => lines(n) > 1)).map(e => e.innerText.trim()) }""")
            if wr: wrapped.append(f"{r}@{w}: {wr}")
            un = pg.evaluate("""() => [...document.querySelectorAll('button, a[href]')].filter(e => e.offsetParent &&
                !(e.getAttribute('aria-label') || e.innerText.trim())).map(e => e.outerHTML.slice(0, 100))""")
            if un: unnamed.append(f"{r}@{w}: {un}")
            c = pg.evaluate("window.__cls")
            if c > 0.001: cls.append(f"{r}@{w}: {c:.4f}")
        pg.close()
    rec("no failed requests (10 routes x 9 widths)", not failed, failed[:10])
    rec("no horizontal overflow 360 to 1440 px (10 routes x 9 widths)", not overflow, overflow)
    rec("no button, nav link or toggle label wraps (10 routes x 9 widths)", not wrapped, wrapped)
    rec("every visible button and link has an accessible name", not unnamed, unnamed[:10])
    rec("cumulative layout shift is 0 on load and scroll (10 routes x 9 widths)", not cls, cls)


def nav(br):
    pg = open_page(br, "/", 390, 844)
    b = pg.locator("header button[aria-controls='mobile-nav'], header button[aria-label*='menu' i]").first
    b.click(); pg.wait_for_timeout(500)
    m = pg.locator("#mobile-nav"); ok = m.is_visible()
    m.locator("a[href='/pricing']").first.click(); pg.wait_for_timeout(1500)
    rec("mobile menu opens, navigates and closes", ok and pg.evaluate("location.pathname") == "/pricing" and not m.is_visible())
    pg.close()
    pg = open_page(br, "/")
    seen = []
    for href in ["/about", "/services", "/work", "/pricing", "/insights"]:
        pg.locator(f"header nav a[href='{href}']").first.click(); pg.wait_for_timeout(1200)
        seen.append((pg.evaluate("location.pathname"), pg.evaluate("scrollY"), pg.locator("h1").first.is_visible()))
    rec("header links change route, reset scroll and show the page h1", all(p == h and y == 0 and v for (p, y, v), h in zip(seen, ["/about", "/services", "/work", "/pricing", "/insights"])), seen)
    pg.close()
    bad = []
    for r in ROUTES + ["/work/nova-cloud", "/services/revenue-operations"]:
        pg = br.new_page(); resp = pg.goto(URL + r, wait_until="load"); pg.wait_for_timeout(1500)
        if resp.status != 200 or pg.locator("h1").count() != 1: bad.append(r)
        pg.close()
    rec("every route loads directly (deep link) with exactly one h1", not bad, bad)


def home(br):
    pg = open_page(br, "/")
    v = pg.locator("video").first; t = pg.locator("button[aria-label*='video' i]").first
    p0 = v.evaluate("v => v.paused"); t.click(); pg.wait_for_timeout(400); p1 = v.evaluate("v => v.paused")
    rec("hero video toggle pauses and plays", p0 != p1, f"{p0} -> {p1}")
    acc = pg.locator("button[aria-controls^='service-']")
    acc.nth(2).scroll_into_view_if_needed(); acc.nth(2).click(); pg.wait_for_timeout(700)
    rec("services accordion opens the clicked practice and closes the others",
        acc.nth(2).get_attribute("aria-expanded") == "true" and acc.nth(0).get_attribute("aria-expanded") == "false", acc.count())
    sec = pg.locator("section[aria-label*='Client' i]").last
    q = lambda: sec.locator("figure[aria-hidden=false] blockquote").first.inner_text()
    sec.scroll_into_view_if_needed(); a = q(); pg.locator("button[aria-label^='Next']").first.click(); pg.wait_for_timeout(900); b = q()
    pg.locator("button[aria-label^='Previous']").first.click(); pg.wait_for_timeout(900)
    rec("testimonial arrows go forward and back", a != b and q() == a)
    faq(pg, "home")
    billing(pg, "home")
    pg.locator("footer button[aria-label^='Back']").click(); pg.wait_for_timeout(1500)
    rec("back to top returns to the top", pg.evaluate("scrollY") < 5)
    pg.close()


def faq(pg, where):
    b = pg.locator("button[aria-controls^='faq'], section button[aria-expanded]").filter(has_text="?")
    b.nth(1).scroll_into_view_if_needed(); b.nth(1).click(); pg.wait_for_timeout(600)
    one = b.nth(1).get_attribute("aria-expanded") == "true" and b.nth(0).get_attribute("aria-expanded") == "false"
    b.nth(1).click(); pg.wait_for_timeout(600)
    rec(f"FAQ ({where}): opens one answer at a time and closes again", one and b.nth(1).get_attribute("aria-expanded") == "false")


def billing(pg, where):
    g = pg.locator("[aria-label^='Billing']").first; g.scroll_into_view_if_needed()
    price = lambda: pg.evaluate("[...document.querySelectorAll('.figure')].map(e => e.innerText).filter(t => t.startsWith('$')).join(' ')")
    a = price(); g.locator("button").first.click(); pg.wait_for_timeout(700); b = price()
    rec(f"billing toggle ({where}) changes the monthly prices and the pressed state", a != b and g.locator("button").first.get_attribute("aria-pressed") == "true", f"{a} -> {b}")


def filters(br):
    for route, card in (("/work", "a[href^='/work/']"), ("/insights", "a[href^='/insights/']")):
        pg = open_page(br, route)
        g = pg.locator("[aria-label^='Filter']").first
        n0 = pg.locator(f"main {card}").count(); g.locator("button").nth(1).click(); pg.wait_for_timeout(800)
        n1 = pg.locator(f"main {card}").count(); g.locator("button").nth(0).click(); pg.wait_for_timeout(800)
        rec(f"{route} filter narrows the list and 'All' restores it", 0 < n1 < n0 and pg.locator(f"main {card}").count() == n0, f"{n0} -> {n1}")
        pg.locator(f"main {card}").first.click(); pg.wait_for_timeout(1500)
        rec(f"{route} card opens its detail page", pg.evaluate("location.pathname").startswith(route + "/"))
        pg.close()
    pg = open_page(br, "/pricing"); billing(pg, "pricing"); faq(pg, "pricing"); pg.close()
    pg = open_page(br, "/insights/90-day-growth-roadmap")
    links = pg.evaluate("[...document.querySelectorAll('main a[href^=\"/insights/\"]')].map(a => a.getAttribute('href'))")
    rec("insight article: next and related articles never repeat", len(links) == len(set(links)) and "/insights/90-day-growth-roadmap" not in links, links)
    pg.close()


def contact(br):
    pg = open_page(br, "/contact")
    go = pg.locator("form button[type=submit]")
    go.click(); pg.wait_for_timeout(400)
    e1 = pg.locator("form [role=alert]").count()
    pg.locator("input[autocomplete=name]").fill("Ada Lovelace"); pg.locator("input[type=email]").fill("ada@"); pg.locator("input[autocomplete=organization]").fill("Analytical")
    go.click(); pg.wait_for_timeout(400); e2 = pg.locator("form [role=alert]").count()
    pg.locator("input[type=email]").fill("ada@analytical.co"); go.click(); pg.wait_for_timeout(600)
    rec("contact step 1: empty and malformed fields are rejected with messages", e1 == 3 and e2 == 1, f"{e1},{e2}")
    go.click(); pg.wait_for_timeout(400); e3 = pg.locator("form [role=alert]").count()
    opts = pg.locator("form button[aria-pressed]")
    opts.nth(1).click(); opts.nth(opts.count() - 1).click(); go.click(); pg.wait_for_timeout(600)
    go.click(); pg.wait_for_timeout(400); e4 = pg.locator("form [role=alert]").count()
    rec("contact steps 2 and 3: a choice is required before continuing", e3 >= 1 and e4 == 1, f"{e3},{e4}")
    pg.locator("form button[aria-pressed]").first.click(); go.click(); pg.wait_for_timeout(900)
    done = pg.locator("[role=status]").filter(has_text="Ada").count() > 0 or pg.locator("main [role=status]").count() > 0
    rec("contact: valid submission shows the confirmation", done and pg.locator("form").count() == 0)
    pg.close()


def reduced_motion(br):
    ctx = br.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    pg = ctx.new_page(); pg.goto(URL + "/", wait_until="load"); pg.wait_for_timeout(1200)
    r = pg.evaluate("""() => { const vis = [...document.querySelectorAll('main *')].filter(e => e.offsetParent);
        return { hidden: vis.filter(e => +getComputedStyle(e).opacity < 1 && !e.closest('[aria-hidden=true]')).length,
                 running: document.getAnimations().filter(a => a.playState === 'running').length,
                 videoPaused: document.querySelector('video').paused, h1: !!document.querySelector('h1') } }""")
    rec("reduced motion: content is visible at once, nothing animates, the hero video is paused",
        r["h1"] and r["running"] == 0 and r["videoPaused"] and r["hidden"] == 0, r)
    ctx.close()


with sync_playwright() as p:
    br = p.chromium.launch()
    for f in (requests_and_layout, nav, home, filters, contact, reduced_motion):
        try: f(br)
        except Exception as e: rec(f"{f.__name__} ran", False, str(e)[:300])
    br.close()
R["summary"] = {"passed": sum(v["pass"] for v in R.values()), "total": len(R)}
json.dump(R, open(OUT, "w"), indent=1)
print(R["summary"])
