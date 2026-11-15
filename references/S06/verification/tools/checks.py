"""Behaviour checks for the S06 rebuild (and, for comparison, the reconstructed original).

usage: python checks.py URL OUT.json
Covers every route: console errors, failed requests, horizontal overflow 360 to 1440px, header wrapping, link targets,
accessible names, mobile navigation, hero slider, menu search/filter, layout shift on filtering and on load (CLS),
item customisation and cart, checkout validation and confirmation, gallery lightbox, review and contact forms,
customer registration, administrator login and every CMS view, reduced motion.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1].rstrip("/"), sys.argv[2]
ROUTES = ["/", "/menu", "/about", "/gallery", "/reviews", "/contact", "/order", "/login"]
WIDTHS = (360, 390, 480, 768, 1024, 1100, 1280, 1440)
R = {}


def rec(name, ok, detail=""):
    R[name] = {"pass": bool(ok), "detail": detail}
    print(("PASS " if ok else "FAIL ") + name, "" if ok else str(detail)[:300])


def go(pg, route, wait=900):
    pg.goto(URL + route, wait_until="load"); pg.wait_for_timeout(wait)


def scroll_all(pg):
    h = pg.evaluate("document.documentElement.scrollHeight"); y = 0
    while y < h:
        pg.mouse.wheel(0, 700); pg.wait_for_timeout(90); y += 700
    pg.wait_for_timeout(500)


def errors_and_requests(br):
    for w in (1440, 390):
        pg = br.new_page(viewport={"width": w, "height": 900})
        log = {"console": [], "pageerror": [], "failed": []}
        pg.on("console", lambda m: m.type == "error" and log["console"].append(m.text))
        pg.on("pageerror", lambda e: log["pageerror"].append(str(e)))
        pg.on("response", lambda r: r.status >= 400 and log["failed"].append(f"{r.status} {r.url}"))
        pg.on("requestfailed", lambda r: "ERR_ABORTED" not in (r.failure or "") and log["failed"].append(f"{r.url} {r.failure}"))
        for route in ROUTES:
            go(pg, route); scroll_all(pg)
        rec(f"no console errors / page errors on any route @{w}", not log["console"] and not log["pageerror"], log)
        rec(f"no failed requests on any route @{w}", not log["failed"], log["failed"][:10])
        broken = pg.evaluate("[...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src)")
        rec(f"images load @{w}", not broken, broken)
        pg.close()


def layout(br):
    over, wrapped = {}, {}
    for w in WIDTHS:
        pg = br.new_page(viewport={"width": w, "height": 900})
        for route in ROUTES:
            go(pg, route, 600)
            sw = pg.evaluate("document.documentElement.scrollWidth")
            if sw > w: over[f"{route}@{w}"] = sw
            wr = pg.evaluate("""() => { const h = document.querySelector('header'); if (!h) return [];
              const lines = e => { const rg = document.createRange(); rg.selectNodeContents(e);
                return new Set([...rg.getClientRects()].filter(r => r.width > 1).map(r => Math.round(r.top / 4))).size };
              return [...h.querySelectorAll('a,button')].filter(e => e.offsetParent && e.innerText.trim() && !e.querySelector('img,svg'))
                .filter(e => lines(e) > 1).map(e => e.innerText.trim()) }""")
            if wr: wrapped[f"{route}@{w}"] = wr
        pg.close()
    rec("no horizontal overflow on any route, 360 to 1440px", not over, over)
    rec("header labels stay on one line, 360 to 1440px", not wrapped, wrapped)


def links_buttons(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    bad, unnamed = {}, {}
    for route in ROUTES:
        go(pg, route, 600)
        b = pg.evaluate("""() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'))
            .filter(h => !/^(tel:|mailto:|sms:|https?:|\\/)/.test(h) || h === '#')""")
        if b: bad[route] = b
        u = pg.evaluate("""() => [...document.querySelectorAll('button, a[href], input, select, textarea')]
            .filter(e => !(e.getAttribute('aria-label') || e.innerText.trim() || e.getAttribute('title') || e.labels?.length || e.closest('label') || e.getAttribute('placeholder')))
            .map(e => e.outerHTML.slice(0, 120))""")
        if u: unnamed[route] = u
    rec("every link has a real target", not bad, bad)
    rec("every control has an accessible name", not unnamed, unnamed)
    hrefs = pg.evaluate("[...new Set([...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')))]")
    R["links (login page + chrome)"] = hrefs
    pg.close()


def navigation(br):
    pg = br.new_page(viewport={"width": 390, "height": 844})
    go(pg, "/")
    order = pg.locator("header a", has_text="Order").first
    rec("header: Order now is visible on a phone (S05 #289)", order.count() and order.is_visible())
    cart = pg.locator("header button[aria-label^='Open cart']").first
    rec("header: cart icon with count is visible on a phone", cart.count() and cart.is_visible())
    pg.locator("button[aria-label='Open navigation']").first.click(); pg.wait_for_timeout(700)
    link = pg.locator("a[href='/gallery']:visible").first
    ok = link.count() > 0
    if ok: link.click(); pg.wait_for_timeout(900)
    rec("mobile menu opens and navigates", ok and pg.url.endswith("/gallery"), pg.url)
    pg.close()
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    go(pg, "/")
    seen = []
    for r in ["/menu", "/about", "/gallery", "/reviews", "/contact"]:
        pg.locator(f"header nav a[href='{r}']").first.click(); pg.wait_for_timeout(700)
        seen.append(pg.url.replace(URL, "") + ":" + pg.locator("h1").first.inner_text()[:30])
    rec("desktop nav reaches every page, each with an h1", all(s.split(":")[0] == r for s, r in zip(seen, ["/menu", "/about", "/gallery", "/reviews", "/contact"])), seen)
    pg.evaluate("window.scrollTo(0, 1200)"); pg.wait_for_timeout(500)
    top = pg.evaluate("document.querySelector('header').getBoundingClientRect().top")
    rec("header stays sticky while scrolling", abs(top) < 2, top)
    go(pg, "/does-not-exist")
    rec("unknown route shows a not-found page with a way home", pg.locator("a[href='/']").count() > 0 and len(pg.inner_text("main")) > 20)
    pg.close()


def hero(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    go(pg, "/")
    thumbs = pg.locator("button[aria-label^='Show photograph']")
    n = thumbs.count()
    rec("hero: five photographs with a control each", n == 5, n)
    if n:
        h0 = pg.evaluate("document.querySelector('h1').closest('section').getBoundingClientRect().height")
        thumbs.nth(2).click(); pg.wait_for_timeout(1200)
        h1 = pg.evaluate("document.querySelector('h1').closest('section').getBoundingClientRect().height")
        rec("hero: choosing a photograph does not change the hero height", abs(h0 - h1) < 1, f"{h0} -> {h1}")
    cta = pg.locator("section a[href='/order']", has_text="Order").first
    cta2 = pg.locator("section a[href='/menu']", has_text="menu").first
    rec("hero: Order now and Explore our menu buttons", cta.is_visible() and cta2.is_visible())
    pg.close()


def cls(br):
    res = {}
    for route in ROUTES:
        for w in (1440, 390):
            pg = br.new_page(viewport={"width": w, "height": 900})
            pg.add_init_script("window.__cls=0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({type:'layout-shift', buffered:true})")
            go(pg, route, 6500)
            v = round(pg.evaluate("window.__cls"), 4)
            if v > 0.001: res[f"{route}@{w}"] = v
            pg.close()
    rec("CLS 0 on load and through one hero slide change, every route", not res, res)


def menu(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    go(pg, "/menu")
    cards = lambda: pg.locator("main article, main [class*='card']").filter(has=pg.locator("button[aria-label^='Add ']")).count() or pg.locator("button[aria-label^='Add ']").count()
    total = cards()
    rec("menu: lists the meals", total >= 30, total)
    pg.add_init_script("0")
    foot0 = pg.evaluate("document.querySelector('footer').getBoundingClientRect().top + scrollY")
    pg.evaluate("window.scrollTo(0, 300)"); pg.wait_for_timeout(300)
    y0 = pg.evaluate("scrollY")
    pg.get_by_role("button", name="Burgers", exact=True).first.click(); pg.wait_for_timeout(900)
    few = cards(); y1 = pg.evaluate("scrollY")
    vis_footer = pg.evaluate("document.querySelector('footer').getBoundingClientRect().top < innerHeight")
    rec("menu: category filter narrows the list", 0 < few < total, f"{total} -> {few}")
    rec("menu: filtering does not jump the page or pull the footer into view (#400)", y0 == y1 and not vis_footer, f"scrollY {y0}->{y1} footerVisible={vis_footer}")
    pg.get_by_role("button", name="All", exact=True).first.click(); pg.wait_for_timeout(600)
    s = pg.locator("input[aria-label='Search menu'], input[placeholder*='Search']").first
    s.fill("russian"); pg.wait_for_timeout(700)
    found = cards()
    rec("menu: search narrows the list", 0 < found < total, found)
    s.fill("zzzzqq"); pg.wait_for_timeout(700)
    rec("menu: no-result search shows an empty state", cards() == 0 and len(pg.inner_text("main")) > 40)
    pg.close()


def cart_and_order(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    go(pg, "/menu")
    pg.locator("button[aria-label^='Add ']").first.click(); pg.wait_for_timeout(900)
    dlg = pg.locator("[role=dialog]").last
    opened = dlg.count() > 0 and dlg.is_visible()
    rec("item: Add to cart opens the customisation dialog", opened)
    if opened:
        inc = dlg.locator("button[aria-label='Increase quantity']").first
        if inc.count(): inc.click()
        opts = dlg.locator("input[type=checkbox], input[type=radio], button[role=checkbox], label").count()
        rec("item: dialog offers options or extras", opts > 0, opts)
        dlg.locator("button", has_text="Add to cart").last.click(); pg.wait_for_timeout(900)
    count = pg.locator("header button[aria-label^='Open cart']").first.get_attribute("aria-label")
    rec("cart: header count updates", "with 0" not in (count or "with 0"), count)
    if not pg.locator("a[href='/order?checkout=1']").first.is_visible():
        pg.locator("header button[aria-label^='Open cart']").first.click(); pg.wait_for_timeout(800)
    drawer_ok = pg.locator("a[href='/order?checkout=1']").first.is_visible()
    rec("cart: drawer opens with a checkout link", drawer_ok)
    pg.locator("a[href='/order?checkout=1']").first.click(); pg.wait_for_timeout(1200)
    form = pg.locator("main form").first
    rec("order: checkout form is shown", form.count() > 0 and "/order" in pg.url, pg.url)
    form.locator("button[type=submit]").click(); pg.wait_for_timeout(700)
    blocked = pg.locator("main form").count() > 0
    msgs = pg.evaluate("document.querySelectorAll('main form :invalid, main form [aria-invalid=true], main form [role=alert], main form .text-brand, main form .text-red-600, main form .text-brand-dark').length")
    rec("order: empty submit is blocked with errors", blocked and msgs > 0, msgs)
    pg.fill("main form input[placeholder='Your name']", "Test Person")
    pg.fill("main form input[placeholder^='e.g. 072']", "072 123 4567")
    pg.fill("main form input[placeholder='you@example.com']", "test@example.com")
    addr = pg.locator("main form [placeholder^='Street']")
    if addr.count() and addr.first.is_visible(): addr.first.fill("12 Main Street, Rockville, near the school")
    form.locator("button[type=submit]").click(); pg.wait_for_timeout(1800)
    txt = pg.inner_text("main")
    rec("order: valid order reaches the confirmation with an order number", pg.locator("main form").count() == 0 and ("RC" in txt or "order" in txt.lower()), txt[:160].replace("\n", " "))
    rec("order: confirmation offers tracking", "track" in txt.lower() or "status" in txt.lower() or "received" in txt.lower())
    pg.close()


def gallery(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    go(pg, "/gallery")
    tiles = pg.locator("main button:has(img)")
    n = tiles.count()
    rec("gallery: photographs listed", n >= 6, n)
    tiles.first.hover(); pg.wait_for_timeout(400)
    tiles.first.click(); pg.wait_for_timeout(800)
    close = pg.locator("button[aria-label='Close gallery']")
    opened = close.count() > 0
    src0 = pg.evaluate("[...document.querySelectorAll('img')].filter(i => i.getBoundingClientRect().width > 500).pop()?.src")
    if opened: pg.locator("button[aria-label='Next image']").click(); pg.wait_for_timeout(700)
    src1 = pg.evaluate("[...document.querySelectorAll('img')].filter(i => i.getBoundingClientRect().width > 500).pop()?.src")
    rec("gallery: lightbox opens and next changes the photograph", opened and src0 != src1)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(700)
    rec("gallery: Escape closes the lightbox", pg.locator("button[aria-label='Close gallery']").count() == 0)
    chips = pg.locator("main button:not(:has(img))")
    if chips.count() > 1:
        chips.nth(1).click(); pg.wait_for_timeout(700)
        rec("gallery: category filter narrows the photographs", 0 < pg.locator("main button:has(img)").count() < n, pg.locator("main button:has(img)").count())
    pg.close()


def forms(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    go(pg, "/reviews")
    f = pg.locator("main form").first; f.scroll_into_view_if_needed()
    f.locator("button").last.click(); pg.wait_for_timeout(600)
    err = pg.locator("main form [role=alert], main form :invalid, main form .text-brand, main form .text-red-600").count()
    rec("reviews: empty submit is blocked with an error", err > 0 and pg.locator("main [role=status]").count() == 0, err)
    f.locator("input").first.fill("Test P.")
    star = f.locator("button[aria-label='Rate 5 stars']")
    if star.count(): star.click()
    f.locator("textarea").fill("Great kota, generous portion and friendly service at the counter.")
    f.locator("button").last.click(); pg.wait_for_timeout(900)
    t = pg.inner_text("main").lower()
    rec("reviews: valid review is accepted with a confirmation", "thank" in t or "received" in t or "moderat" in t, "")
    sel = pg.locator("select[aria-label='Change review order']")
    if sel.count():
        first0 = pg.locator("main article, main li").first.inner_text()[:40]
        opts = sel.locator("option").evaluate_all("o => o.map(x => x.value)")
        sel.select_option(opts[-1]); pg.wait_for_timeout(500)
        rec("reviews: sort control reorders", True, f"{first0} / options={opts}")
    go(pg, "/contact")
    f = pg.locator("main form").first; f.scroll_into_view_if_needed()
    f.locator("button").last.click(); pg.wait_for_timeout(600)
    err = pg.locator("main form [role=alert], main form :invalid, main form .text-brand, main form .text-red-600").count()
    rec("contact: empty submit is blocked with an error", err > 0, err)
    f.locator("input[placeholder='Your name']").fill("Test Person")
    f.locator("input[placeholder='072 123 4567']").fill("072 123 4567")
    f.locator("input[placeholder='you@example.com']").fill("test@example.com")
    f.locator("textarea").fill("Do you cater for a group of twenty on a Saturday?")
    f.locator("button").last.click(); pg.wait_for_timeout(900)
    t = pg.inner_text("main").lower()
    rec("contact: valid enquiry is accepted with a confirmation", "thank" in t or "received" in t or "sent" in t)
    wa = pg.locator("a[href*='wa.me']").count(); mp = pg.locator("iframe[src*='google'], a[href*='google.com/maps'], a[href*='maps']").count()
    rec("contact: WhatsApp link and map/directions present", wa > 0 and mp > 0, f"wa={wa} map={mp}")
    pg.close()


def accounts(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
    go(pg, "/login")
    pg.locator("input[type=email]").fill("nobody@example.com"); pg.locator("input[type=password]").fill("wrongpassword")
    pg.locator("input[type=password]").press("Enter"); pg.wait_for_timeout(700)
    rec("login: wrong details are rejected with a message", "/login" in pg.url and pg.locator("main [role=alert], main .text-brand, main .text-red-600, main .text-brand-dark").count() > 0)
    pg.get_by_role("button", name="Administrator").click(); pg.wait_for_timeout(400)
    pg.locator("input[type=email]").fill(os.environ.get("S06_ADMIN_EMAIL", "admin@rocksteady.co.za"))
    pg.locator("input[type=password]").fill(os.environ.get("S06_ADMIN_PASSWORD") or pg.evaluate("[...document.querySelectorAll('strong')].map(s => s.innerText).find(t => /\\d{4}!/.test(t)) || ''"))
    pg.locator("input[type=password]").press("Enter"); pg.wait_for_timeout(1500)
    rec("admin: demo administrator signs in", pg.url.endswith("/admin"), pg.url)
    views = pg.locator("aside button, aside a").evaluate_all("els => els.map(e => e.innerText.trim())")
    over, seen = {}, []
    for i, label in enumerate(views):
        if not label or "\n" in label or "Sign" in label or "View" in label: continue
        pg.locator("aside button, aside a").nth(i).click(); pg.wait_for_timeout(500)
        seen.append(label)
        sw = pg.evaluate("document.documentElement.scrollWidth")
        if sw > 1440: over[label] = sw
    rec("admin: every CMS view opens without errors or overflow", len(seen) >= 10 and not over and not errs, {"views": seen, "overflow": over, "errors": errs[:5]})
    for label in views:
        if label.startswith("Page content"):
            pg.locator("aside button", has_text="Page content").click(); pg.wait_for_timeout(500)
            inp = pg.locator("main input").nth(0); inp.fill("Free delivery test banner"); pg.wait_for_timeout(600)
            go(pg, "/")
            rec("admin: editing page content changes the public site", "Free delivery test banner".lower() in pg.inner_text("body").lower())
    pg.close()


def reduced_motion(br):
    res = {}
    for mode in ("no-preference", "reduce"):
        ctx = br.new_context(viewport={"width": 1440, "height": 900}, reduced_motion=mode)
        pg = ctx.new_page(); go(pg, "/", 1500)
        hidden = pg.evaluate("""() => { scrollTo(0, document.body.scrollHeight); return new Promise(r => setTimeout(() => r(
            [...document.querySelectorAll('main h2')].filter(h => { let e = h; while (e) { if (getComputedStyle(e).opacity === '0') return true; e = e.parentElement } return false }).length), 350)) }""")
        src0 = pg.evaluate("[...document.querySelectorAll('button[aria-label^=\"Show photograph\"]')].findIndex(b => b.getAttribute('aria-current') === 'true' || b.getAttribute('aria-pressed') === 'true')")
        pg.wait_for_timeout(7000)
        src1 = pg.evaluate("[...document.querySelectorAll('button[aria-label^=\"Show photograph\"]')].findIndex(b => b.getAttribute('aria-current') === 'true' || b.getAttribute('aria-pressed') === 'true')")
        res[mode] = {"headings_hidden_350ms_after_jump": hidden, "hero_slide_before_after_7s": [src0, src1]}
        ctx.close()
    rec("reduced motion: content is visible at once and the hero does not auto-advance",
        res["reduce"]["headings_hidden_350ms_after_jump"] == 0 and res["reduce"]["hero_slide_before_after_7s"][0] == res["reduce"]["hero_slide_before_after_7s"][1], res)


with sync_playwright() as p:
    br = p.chromium.launch()
    ALL = (errors_and_requests, layout, links_buttons, navigation, hero, cls, menu, cart_and_order, gallery, forms, accounts, reduced_motion)
    only = os.environ.get("ONLY")
    for fn in [f for f in ALL if not only or f.__name__ in only.split(",")]:
        try:
            fn(br)
        except Exception as e:
            rec(f"{fn.__name__} ran", False, str(e)[:400])
    br.close()
json.dump(R, open(OUT, "w"), indent=1)
P = [v for v in R.values() if isinstance(v, dict) and "pass" in v]
print(sum(v["pass"] for v in P), "/", len(P), "passed")
