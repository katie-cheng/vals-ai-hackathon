"""Behaviour checks for the rebuild (and, for comparison, the original).

usage: python checks.py URL OUT.json
Covers: console errors, failed requests, horizontal overflow, header wrapping, in-page links, button names,
mobile menu, services switcher, before/after slider, FAQ, map towns, quote form (invalid + valid), share button,
reduced motion.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
R = {}


def rec(name, ok, detail=""):
    R[name] = {"pass": bool(ok), "detail": detail}
    print(("PASS " if ok else "FAIL ") + name, detail if not ok else "")


def scroll_all(pg):
    pg.wait_for_timeout(3000)
    h = pg.evaluate("document.documentElement.scrollHeight"); y = 0
    while y < h:
        pg.mouse.wheel(0, 600); pg.wait_for_timeout(120); y += 600
    pg.wait_for_timeout(800)


def errors_and_requests(br):
    for w in (1440, 390):
        pg = br.new_page(viewport={"width": w, "height": 900})
        log = {"console": [], "pageerror": [], "failed": []}
        pg.on("console", lambda m: m.type == "error" and log["console"].append(m.text))
        pg.on("pageerror", lambda e: log["pageerror"].append(str(e)))
        pg.on("response", lambda r: r.status >= 400 and log["failed"].append(f"{r.status} {r.url}"))
        pg.on("requestfailed", lambda r: "net::ERR_ABORTED" not in (r.failure or "") and log["failed"].append(f"{r.url} {r.failure}"))
        pg.goto(URL, wait_until="load"); scroll_all(pg)
        rec(f"no console errors / page errors @{w}", not log["console"] and not log["pageerror"], log)
        rec(f"no failed requests @{w}", not log["failed"], log["failed"])
        pg.close()


def layout(br):
    for w in (360, 390, 768, 1024, 1097, 1180, 1279, 1280, 1440):
        pg = br.new_page(viewport={"width": w, "height": 900})
        pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2800)
        sw = pg.evaluate("document.documentElement.scrollWidth")
        rec(f"no horizontal overflow @{w}", sw <= w, f"scrollWidth={sw}")
        wrapped = pg.evaluate("""() => { const h = document.querySelector('header');
          const lines = e => { const rg = document.createRange(); rg.selectNodeContents(e);
            return new Set([...rg.getClientRects()].filter(r => r.width > 1).map(r => Math.round(r.top / 4))).size };
          return [...h.querySelectorAll('a,button')].filter(e => e.offsetParent && !e.closest('[aria-label="Mobile navigation"]'))
            .flatMap(e => e.querySelector('*') ? [...e.querySelectorAll('*')].filter(c => !c.children.length) : [e])
            .filter(e => e.innerText && e.innerText.trim() && lines(e) > 1).map(e => e.innerText.trim()) }""")
        rec(f"header text on one line @{w}", not wrapped, wrapped)
        pg.close()


def links_buttons(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2800)
    bad = pg.evaluate("""() => [...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))
        .filter(h => h.startsWith('#') ? (h.length>1 && !document.getElementById(h.slice(1))) : !/^(tel:|mailto:|sms:|https?:)/.test(h))""")
    rec("every in-page link has a target", not bad, bad)
    hrefs = pg.evaluate("[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')))]")
    R["links"] = hrefs
    unnamed = pg.evaluate("""() => [...document.querySelectorAll('button, a[href], [role=slider], [role=tab]')]
        .filter(e => !(e.getAttribute('aria-label') || e.innerText.trim() || e.getAttribute('title'))).map(e=>e.outerHTML.slice(0,120))""")
    rec("every button/link has an accessible name", not unnamed, unnamed)
    pg.close()


def mobile_menu(br):
    for w in (390, 1100):
        pg = br.new_page(viewport={"width": w, "height": 844})
        pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2800)
        btn = pg.locator("button[aria-label='Open navigation menu']")
        if not btn.is_visible():
            rec(f"menu button visible @{w}", False); pg.close(); continue
        btn.click(); pg.wait_for_timeout(800)
        nav = pg.locator("[aria-label='Mobile navigation']")
        ok_open = nav.is_visible()
        nav.locator("a[href='#pricing']").first.click(); pg.wait_for_timeout(2200)
        top = pg.evaluate("document.getElementById('pricing').getBoundingClientRect().top")
        rec(f"mobile menu opens and links scroll @{w}", ok_open and abs(top) < 200 and not nav.is_visible(), f"open={ok_open} pricingTop={top:.0f}")
        pg.close()


def services(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2800)
    tabs = pg.locator("#services [role=tab]")
    n = tabs.count()
    panel_title = lambda: pg.locator("#services [role=tabpanel] h3").first.inner_text()
    tabs.nth(2).scroll_into_view_if_needed(); tabs.nth(2).click(); pg.wait_for_timeout(900)
    t2 = tabs.nth(2).inner_text().strip(); p2 = panel_title()
    rec("services: 6 tabs, clicking a tab shows that service", n == 6 and t2.split("\n")[-1] in p2, f"tabs={n} tab='{t2}' panel='{p2}'")
    pg.locator("#services button[aria-label*='Next']").click(); pg.wait_for_timeout(900)
    rec("services: next button advances", tabs.nth(3).get_attribute("aria-selected") == "true", panel_title())
    pg.locator("#services button[aria-label*='Previous']").click(); pg.wait_for_timeout(900)
    rec("services: previous button goes back", tabs.nth(2).get_attribute("aria-selected") == "true", panel_title())
    tabs.nth(2).focus(); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(900)
    rec("services: ArrowRight on tabs advances", tabs.nth(3).get_attribute("aria-selected") == "true")
    titles = set()
    for i in range(n):
        tabs.nth(i).click(); pg.wait_for_timeout(700); titles.add(panel_title())
    rec("services: every service reachable", len(titles) == 6, sorted(titles))
    pg.close()
    pg = br.new_page(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2800)
    panel = pg.locator("#services [role=tabpanel]"); panel.scroll_into_view_if_needed(); pg.wait_for_timeout(800)
    b = panel.bounding_box()
    pg.evaluate("""([x,y]) => { const el=document.elementFromPoint(x,y);
        const ev=(t,cx)=>el.dispatchEvent(new PointerEvent(t,{bubbles:true,pointerType:'touch',pointerId:1,isPrimary:true,clientX:cx,clientY:y}));
        ev('pointerdown',x); ev('pointermove',x-80); ev('pointerup',x-160); }""",
        [b["x"] + b["width"] * 0.75, b["y"] + 120])
    pg.wait_for_timeout(900)
    rec("services: swipe left on mobile advances", pg.locator("#services [role=tab]").nth(1).get_attribute("aria-selected") == "true")
    pg.close()


def slider(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2800)
    s = pg.locator("#results [role=slider]"); s.scroll_into_view_if_needed(); pg.wait_for_timeout(1000)
    v0 = int(s.get_attribute("aria-valuenow"))
    s.focus(); [pg.keyboard.press("ArrowLeft") for _ in range(5)]; pg.wait_for_timeout(300)
    v1 = int(s.get_attribute("aria-valuenow"))
    rec("slider: arrow keys move it", v1 < v0, f"{v0}->{v1}")
    b = s.bounding_box()
    pg.mouse.move(b["x"] + b["width"] * v1 / 100, b["y"] + b["height"] / 2); pg.mouse.down()
    pg.mouse.move(b["x"] + b["width"] * 0.2, b["y"] + b["height"] / 2, steps=8); pg.mouse.up(); pg.wait_for_timeout(300)
    v2 = int(s.get_attribute("aria-valuenow"))
    rec("slider: dragging moves it", abs(v2 - 20) <= 4, f"after drag={v2}")
    pg.mouse.click(b["x"] + b["width"] * 0.8, b["y"] + b["height"] / 2); pg.wait_for_timeout(300)
    rec("slider: click moves it", abs(int(s.get_attribute("aria-valuenow")) - 80) <= 4, s.get_attribute("aria-valuenow"))
    tabs = pg.locator("#results button:has-text('House Siding') >> xpath=..").locator("button")
    srcs = set()
    for i in range(tabs.count()):
        tabs.nth(i).click(); pg.wait_for_timeout(900)
        srcs.add(tuple(pg.eval_on_selector_all("#results [role=slider] img", "els=>els.map(e=>e.getAttribute('src'))")))
    pairs = [p for p in srcs]
    rec("before/after: 6 comparisons, each with distinct before and after images", len(pairs) == 6 and all(len(set(p)) == 2 for p in pairs), pairs)
    pg.close()


def faq_towns_share(br):
    ctx = br.new_context(viewport={"width": 1440, "height": 900}, permissions=["clipboard-read", "clipboard-write"])
    pg = ctx.new_page(); pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2800)
    q = pg.locator("#faq button[aria-expanded]").nth(1); q.scroll_into_view_if_needed(); pg.wait_for_timeout(600)
    before = q.get_attribute("aria-expanded"); q.click(); pg.wait_for_timeout(700)
    rec("faq: question toggles open", before == "false" and q.get_attribute("aria-expanded") == "true")
    chip = pg.locator("#areas button", has_text="Hartford").first; chip.scroll_into_view_if_needed(); chip.click(); pg.wait_for_timeout(700)
    labels = pg.eval_on_selector_all("#areas svg text", "els=>els.map(e=>e.textContent)")
    conf = pg.locator("#areas p", has_text="Yes, we come to you").first.inner_text()
    rec("map: choosing a town labels only that town and confirms it", labels == ["Hartford"] and "Hartford" in conf, f"labels={labels} conf='{conf}'")
    pg.locator("#areas svg g").nth(5).dispatch_event("click"); pg.wait_for_timeout(600)
    rec("map: clicking a map dot selects it", len(pg.eval_on_selector_all("#areas svg text", "els=>els.map(e=>e.textContent)")) == 1)
    sh = pg.locator("footer button[aria-label='Share this website']"); sh.scroll_into_view_if_needed(); sh.click(); pg.wait_for_timeout(600)
    st = pg.locator("footer [role=status]")
    rec("footer: share button gives feedback", st.count() > 0, st.first.inner_text() if st.count() else "")
    ctx.close()


def quote(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2800)
    f = pg.locator("#quote form"); f.scroll_into_view_if_needed(); pg.wait_for_timeout(800)
    pg.locator("#quote button[type=submit]").click(); pg.wait_for_timeout(800)
    invalid = pg.evaluate("document.querySelectorAll('#quote form :invalid, #quote form [aria-invalid=true]').length")
    rec("quote: empty submit is blocked with field errors", f.count() == 1 and invalid > 0, f"invalid fields={invalid}")
    fill = {"name": "Test Person", "phone": "860-555-0123", "email": "test@example.com", "address": "12 Main Street", "town": "Hartford", "zip": "12345"}
    for k, v in fill.items():
        pg.fill(f"#quote [name={k}]", v)
    pg.locator("#quote label", has_text="Gutter").first.click()
    pg.select_option("#quote [name=stories]", "2")
    pg.locator("#quote button[type=submit]").click(); pg.wait_for_timeout(1500)
    zip_err = pg.locator("#quote", has_text="06000").count() > 0 or pg.evaluate("!document.querySelector('#quote [name=zip]').checkValidity()")
    rec("quote: non-Connecticut ZIP is rejected", f.count() == 1 and zip_err)
    pg.fill("#quote [name=zip]", "06103")
    pg.locator("#quote button[type=submit]").click(); pg.wait_for_timeout(3500)
    rec("quote: valid request reaches the success state", pg.locator("#quote form").count() == 0, pg.locator("#quote").inner_text()[:200])
    pg.close()


def reduced_motion(br):
    res = {}
    for mode in ("no-preference", "reduce"):
        ctx = br.new_context(viewport={"width": 1440, "height": 900}, reduced_motion=mode)
        pg = ctx.new_page(); pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2500)
        hidden = []
        for sid in ("services", "results", "process", "why-us", "pricing", "areas", "faq", "quote"):
            pg.evaluate(f"document.getElementById('{sid}').scrollIntoView()"); pg.wait_for_timeout(400)
            if pg.evaluate(f"getComputedStyle(document.querySelector('#{sid} h2')).opacity") == "0":
                hidden.append(sid)
        anims = pg.evaluate("document.getAnimations().filter(a=>a.playState==='running').length")
        res[mode] = {"running_animations": anims, "headings_hidden": hidden}
        ctx.close()
    rec("reduced motion: content visible without waiting, fewer running animations",
        not res["reduce"]["headings_hidden"] and res["reduce"]["running_animations"] < res["no-preference"]["running_animations"], res)


with sync_playwright() as p:
    br = p.chromium.launch()
    ALL = (errors_and_requests, layout, links_buttons, mobile_menu, services, slider, faq_towns_share, quote, reduced_motion)
    only = os.environ.get('ONLY')
    for fn in [f for f in ALL if not only or f.__name__ in only.split(',')]:
        try:
            fn(br)
        except Exception as e:
            rec(f"{fn.__name__} ran", False, str(e)[:300])
    br.close()
json.dump(R, open(OUT, "w"), indent=1)
print(sum(v["pass"] for k, v in R.items() if isinstance(v, dict) and "pass" in v), "/", sum(1 for v in R.values() if isinstance(v, dict) and "pass" in v), "passed")
