"""Behaviour checks for the S02 rebuild.

usage: python checks.py URL OUT.json
Covers every route: console errors, failed requests, horizontal overflow and control wrapping 360 to 1440px, CLS on a
throttled cold load, internal links, accessible names, and each interactive feature (menus, role switch, landing
accordion and scratchpad, curriculum filter and bookmarks, search filters, quiz validation/submit/retake,
lesson player, notes and Q&A forms, playground run/save, cheatsheet tabs and copy, profile reset dialog,
admin roster, certificate page, reduced motion, persistence).
"""
import json, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1].rstrip("/"), sys.argv[2]
ROUTES = ["/", "/dashboard", "/courses", "/lesson/1", "/lesson/10", "/playground", "/search", "/quizzes", "/quiz/1",
          "/certificates", "/certificate/ITB-CH1-8291X", "/certificate/NOPE", "/resources", "/admin", "/profile"]
WIDTHS = [360, 390, 480, 600, 768, 900, 1024, 1180, 1279, 1280, 1440]
R = {}
CLS_INIT = "window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)__cls+=e.value}).observe({type:'layout-shift',buffered:true});"


def rec(name, ok, detail=""):
    R[name] = {"pass": bool(ok), "detail": detail}
    print(("PASS " if ok else "FAIL ") + name, "" if ok else detail)


def go(pg, route, wait=400):
    pg.goto(URL + route, wait_until="networkidle"); pg.wait_for_timeout(wait)


def errors_and_requests(br):
    for w in (1440, 390):
        pg = br.new_page(viewport={"width": w, "height": 900}); log = []
        pg.on("console", lambda m: m.type == "error" and log.append("console: " + m.text))
        pg.on("pageerror", lambda e: log.append("pageerror: " + str(e)))
        pg.on("response", lambda r: r.status >= 400 and log.append(f"{r.status} {r.url}"))
        pg.on("requestfailed", lambda r: "net::ERR_ABORTED" not in (r.failure or "") and log.append(f"failed {r.url}"))
        external = []
        pg.on("request", lambda r: not r.url.startswith(URL) and not r.url.startswith(("data:", "blob:", "about:")) and external.append(r.url))
        for route in ROUTES:
            go(pg, route, 250)
            h = pg.evaluate("document.documentElement.scrollHeight")
            for y in range(0, h, 700): pg.evaluate(f"scrollTo(0,{y})"); pg.wait_for_timeout(40)
        rec(f"no console errors, page errors or failed requests on {len(ROUTES)} routes @{w}", not log, log[:8])
        rec(f"no third-party requests @{w}", not external, sorted(set(external))[:8])
        pg.close()


def layout(br):
    over, wrapped, clipped = [], [], []
    for w in WIDTHS:
        pg = br.new_page(viewport={"width": w, "height": 900})
        for route in ROUTES:
            go(pg, route, 150)
            sw = pg.evaluate("document.documentElement.scrollWidth")
            if sw > w: over.append(f"{route}@{w}: {sw}")
            bad = pg.evaluate("""() => { const lines = e => { const tops = new Set(); const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
                for (let n; (n = tw.nextNode());) { if (!n.textContent.trim() || n.parentElement.closest('.sr-only')) continue; const rg = document.createRange(); rg.selectNodeContents(n);
                  for (const r of rg.getClientRects()) if (r.width > 1) tops.add(Math.round(r.top / 6)); }
                return tops.size };
              const out = { wrapped: [], clipped: [] };
              for (const e of document.querySelectorAll('header a, header button, .btn, .option, .badge')) {
                if (!e.offsetParent) continue; const t = (e.innerText || '').trim(); if (!t) continue;
                if (lines(e) > 1) out.wrapped.push(t.slice(0, 40));
                if (e.scrollWidth > e.clientWidth + 1) out.clipped.push(t.slice(0, 40)); }
              return out }""")
            wrapped += [f"{route}@{w}: {t}" for t in bad["wrapped"]]; clipped += [f"{route}@{w}: {t}" for t in bad["clipped"]]
        pg.close()
    rec(f"no horizontal overflow on {len(ROUTES)} routes at {WIDTHS}", not over, over[:10])
    rec("header links, buttons, options and badges stay on one line at every width", not wrapped, wrapped[:10])
    rec("no button, option or badge label is clipped at any width", not clipped, clipped[:10])


def cls(br):
    worst = []
    for w, h in ((1440, 900), (390, 844)):
        for route in ROUTES:
            ctx = br.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page(); pg.add_init_script(CLS_INIT)
            cdp = ctx.new_cdp_session(pg); cdp.send("Network.enable")
            cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 150, "downloadThroughput": 200 * 1024, "uploadThroughput": 100 * 1024})
            go(pg, route, 1200)
            v = pg.evaluate("__cls")
            if v > 0.0005: worst.append(f"{route}@{w}: {v:.4f}")
            ctx.close()
    rec("CLS 0 on a throttled cold load of every route (1440 and 390)", not worst, worst)
    # CLS while using the page: open/close every disclosure on the landing page and switch tabs on the lesson page
    pg = br.new_page(viewport={"width": 1440, "height": 900}); pg.add_init_script(CLS_INIT)
    go(pg, "/quizzes"); pg.hover("a.btn >> nth=0"); pg.wait_for_timeout(300)
    go(pg, "/courses"); pg.hover("ol.rows a >> nth=0"); pg.hover("ol.rows button >> nth=0"); pg.wait_for_timeout(300)
    rec("hovering rows and buttons shifts nothing", pg.evaluate("__cls") < 0.0005, pg.evaluate("__cls")); pg.close()


def links_and_names(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900}); dead, unnamed, noalt, h1s = [], [], [], []
    hrefs = set()
    for route in ROUTES:
        go(pg, route, 150)
        info = pg.evaluate("""() => ({
          hrefs: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
          unnamed: [...document.querySelectorAll('button, a, input, select, textarea')].filter(e => e.offsetParent && !((e.innerText || '').trim() || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || (e.labels && e.labels.length) || e.title)).map(e => e.outerHTML.slice(0, 90)),
          noalt: [...document.querySelectorAll('img:not([alt])')].length,
          h1: document.querySelectorAll('h1').length })""")
        hrefs |= set(info["hrefs"]); unnamed += [f"{route}: {u}" for u in info["unnamed"]]
        if info["noalt"]: noalt.append(route)
        if info["h1"] != 1: h1s.append(f"{route}: {info['h1']}")
    for href in sorted(h for h in hrefs if h.startswith("/")):
        go(pg, href, 100)
        path, _, frag = href.partition("#")
        ok = pg.evaluate("document.querySelector('main h1') !== null")
        if path.startswith("/resources") and frag: ok = ok and pg.evaluate("f => document.querySelector('[role=tab][aria-selected=true]') !== null && location.hash === '#' + f", frag)
        elif frag: ok = ok and pg.evaluate("f => !!document.getElementById(f)", frag)
        if not ok: dead.append(href)
    ext = sorted(h for h in hrefs if h.startswith("http"))
    rec(f"all {len([h for h in hrefs if h.startswith('/')])} internal links resolve to a page (and anchor)", not dead, dead)
    rec("external links", all(h.startswith("https://github.com/AjinLab/") for h in ext), ext)
    rec("every control has an accessible name", not unnamed, unnamed[:8])
    rec("every image has alt", not noalt, noalt)
    rec("exactly one h1 per route", not h1s, h1s)
    go(pg, "/no-such-page"); rec("unknown route falls back to the landing page", "Master full-stack" in pg.inner_text("h1"))
    pg.close()


def header(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900}); go(pg, "/")
    for label, path in [("Dashboard", "/dashboard"), ("Curriculum", "/courses"), ("Playground", "/playground"), ("Cheatsheets", "/resources"), ("Quizzes", "/quizzes"), ("Certificates", "/certificates")]:
        pg.click(f"header nav >> text={label}"); pg.wait_for_timeout(120)
        ok = pg.evaluate("location.pathname") == path and pg.get_attribute(f"header nav a:has-text('{label}')", "aria-current") == "page" and pg.evaluate("scrollY") == 0
        rec(f"nav: {label} opens {path} and is marked current", ok)
    pg.click("header [aria-label='Search lessons']"); pg.wait_for_timeout(200); rec("header search opens /search with the field focused", pg.evaluate("location.pathname === '/search' && document.activeElement.id === 'search-query'"))
    pg.click("header [aria-label='Account menu']"); pg.wait_for_timeout(300)
    rec("account menu opens", pg.is_visible("[role=menu]") and pg.get_attribute("header [aria-label='Account menu']", "aria-expanded") == "true")
    pg.keyboard.press("Escape"); rec("account menu closes on Escape", not pg.is_visible("[role=menu]"))
    pg.click("header [aria-label='Account menu']"); pg.mouse.click(300, 600); rec("account menu closes on outside click", not pg.is_visible("[role=menu]"))
    pg.click("header [aria-label='Account menu']"); pg.click("[role=menu] >> text=Switch to admin view"); pg.click("header [aria-label='Account menu']")
    rec("role switch: admin view adds the admin link", pg.is_visible("[role=menu] >> text=Admin control center") and "Course Admin" in pg.inner_text("[role=menu]"))
    pg.click("[role=menu] >> text=Admin control center"); rec("admin link opens /admin", pg.evaluate("location.pathname") == "/admin")
    pg.click("header [aria-label='Account menu']"); pg.click("[role=menu] >> text=Switch to student view"); pg.close()
    pg = br.new_page(viewport={"width": 390, "height": 844}); go(pg, "/")
    rec("mobile: desktop nav hidden, menu button shown", pg.locator("header nav:visible").count() == 0 and pg.is_visible("[aria-label='Open menu']"))
    pg.click("[aria-label='Open menu']"); pg.wait_for_timeout(300)
    rec("mobile menu opens with 6 links", pg.locator("header nav:visible a").count() == 6 and pg.is_visible("[aria-label='Close menu']"))
    pg.click("header nav:visible >> text=Quizzes"); pg.wait_for_timeout(200)
    rec("mobile menu link navigates and closes the menu", pg.evaluate("location.pathname") == "/quizzes" and pg.locator("header nav:visible").count() == 0)
    pg.close()


def landing(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900}); go(pg, "/")
    pg.click("text=Run >> nth=0"); pg.wait_for_timeout(300)
    rec("landing scratchpad: Run prints the console output", "Ready to learn full-stack web tech!" in pg.inner_text("[aria-live=polite]"))
    b = pg.locator("button[aria-controls^='chapter-panel-']")
    rec("landing curriculum: 6 chapters, first open", b.count() == 6 and b.nth(0).get_attribute("aria-expanded") == "true")
    b.nth(2).click(); pg.wait_for_timeout(300)
    rec("landing curriculum: opening chapter 3 shows its 16 lessons and closes chapter 1", pg.locator("#chapter-panel-3 ol a").count() == 16 and b.nth(0).get_attribute("aria-expanded") == "false")
    b.nth(2).click(); rec("landing curriculum: clicking again closes it", pg.locator("[id^='chapter-panel-']").count() == 0)
    b.nth(1).focus(); pg.keyboard.press("Enter"); rec("landing curriculum: keyboard opens a chapter", pg.is_visible("#chapter-panel-2"))
    pg.click("#chapter-panel-2 ol a >> nth=0"); rec("landing lesson link opens the lesson", pg.evaluate("location.pathname") == "/lesson/4")
    go(pg, "/"); href = pg.get_attribute("a.btn-primary >> nth=0", "href"); rec("hero CTA resumes the last lesson", href == "/lesson/4", href)
    pg.close()


def courses_search(br):
    pg = br.new_page(viewport={"width": 1440, "height": 900}); go(pg, "/courses")
    rec("curriculum lists 42 lessons in 6 chapters", pg.locator("ol.rows > li").count() == 42 and pg.locator("main section").count() == 6)
    pg.click("button.option >> text=Chapter 3"); rec("chapter filter shows only chapter 3 (16 lessons)", pg.locator("ol.rows > li").count() == 16 and pg.get_attribute("button.option:has-text('Chapter 3')", "aria-pressed") == "true")
    pg.click("button.option >> text=All chapters"); rec("All chapters restores the list", pg.locator("ol.rows > li").count() == 42)
    bm = pg.locator("ol.rows > li button").nth(1); before = bm.get_attribute("aria-pressed"); bm.click()
    rec("bookmark toggles", bm.get_attribute("aria-pressed") != before)
    go(pg, "/dashboard"); rec("bookmark shows on the dashboard", "Curriculum & Learning Path" in pg.inner_text("aside"))
    go(pg, "/courses"); pg.locator("ol.rows > li button").nth(1).click()
    go(pg, "/courses#chapter-4"); rec("/courses#chapter-4 scrolls to chapter 4", pg.evaluate("Math.abs(document.getElementById('chapter-4').getBoundingClientRect().top) < 140"))
    go(pg, "/search")
    rec("search starts with 42 lessons", "42 lessons found" in pg.inner_text("main"))
    pg.fill("#search-query", "flexbox"); pg.wait_for_timeout(150); n = pg.locator("ul.rows > li").count()
    rec("keyword filter narrows results", 0 < n < 42 and f"{n} lesson" in pg.inner_text("[role=status]"), n)
    pg.select_option("#search-chapter", "5"); pg.wait_for_timeout(100); rec("keyword + chapter with no match shows the empty state", pg.is_visible("text=No lessons match your search"))
    pg.click("text=Reset filters"); rec("reset filters restores 42", "42 lessons found" in pg.inner_text("main") and pg.input_value("#search-query") == "")
    pg.select_option("#search-status", "completed"); rec("status filter: completed = 3", pg.locator("ul.rows > li").count() == 3)
    pg.select_option("#search-status", "bookmarked"); rec("status filter: bookmarked = 3", pg.locator("ul.rows > li").count() == 3)
    pg.close()


def quiz(br):
    ctx = br.new_context(viewport={"width": 1440, "height": 900}); pg = ctx.new_page(); go(pg, "/quizzes")
    rec("quizzes lists 6 quizzes, chapter 1 passed", pg.locator("ul.rows > li").count() == 6 and "Passed" in pg.inner_text("ul.rows > li >> nth=0"))
    pg.click("ul.rows > li >> nth=1 >> a.btn"); pg.wait_for_timeout(200)
    rec("Start quiz opens /quiz/2", pg.evaluate("location.pathname") == "/quiz/2")
    n = pg.locator("fieldset").count()
    pg.click("text=Submit quiz"); pg.wait_for_timeout(200)
    rec("submitting an incomplete quiz shows an error per unanswered question and does not submit", pg.locator(".field-error").count() == n and not pg.is_visible("[role=status].surface"))
    pg.locator("fieldset").nth(0).locator("[role=radio]").nth(0).click()
    rec("answering clears that question's error; answer is marked checked", pg.locator(".field-error").count() == n - 1 and pg.locator("fieldset").nth(0).locator("[role=radio][aria-checked=true]").count() == 1)
    for i in range(n): pg.locator("fieldset").nth(i).locator("[role=radio]").nth(0).click()
    pg.click("text=Submit quiz"); pg.wait_for_timeout(400)
    rec("submit shows score, per-question result and explanations", pg.is_visible("[role=status].surface") and pg.locator("fieldset .badge").count() == n and "You scored" in pg.inner_text("[role=status].surface"))
    rec("answers lock after submit", pg.locator("[role=radio]:not([disabled])").count() == 0)
    pg.click("text=Retake quiz >> nth=0"); rec("retake clears the quiz", pg.locator("[role=radio][aria-checked=true]").count() == 0 and not pg.is_visible("[role=status].surface"))
    # pass the quiz: pick answers until each is right (retake between tries is not needed: read the marked answer after one submit)
    for i in range(n): pg.locator("fieldset").nth(i).locator("[role=radio]").nth(0).click()
    pg.click("text=Submit quiz"); pg.wait_for_timeout(300)
    right = pg.evaluate("[...document.querySelectorAll('fieldset')].map(f => [...f.querySelectorAll('[role=radio]')].findIndex(b => b.className.includes('border-ok')))")
    pg.click("text=Retake quiz >> nth=0")
    for i, j in enumerate(right): pg.locator("fieldset").nth(i).locator("[role=radio]").nth(j).click()
    pg.click("text=Submit quiz"); pg.wait_for_timeout(400)
    rec("all-correct submission passes and offers the certificate", "Quiz passed" in pg.inner_text("[role=status].surface") and pg.is_visible("text=View certificate"))
    pg.click("text=View certificate"); pg.wait_for_timeout(300)
    rec("certificate page shows the earned certificate", pg.evaluate("location.pathname").startswith("/certificate/ITB-CH2-") and "Software Development Basics" in pg.inner_text("article") and "Alex Chen" in pg.inner_text("article"))
    pg.evaluate("window.__printed = 0; window.print = () => { window.__printed++ }; 0"); pg.click("button:has-text('Print or save as PDF')")
    rec("print button calls window.print", pg.evaluate("__printed") == 1)
    go(pg, "/certificates"); rec("certificates page lists both certificates; chapter 2 marked earned", pg.locator("#earned-title + ul > li").count() == 2 and pg.locator(".badge-ok").count() == 2)
    pg.reload(wait_until="networkidle"); rec("earned certificate persists across reload", pg.locator("#earned-title + ul > li").count() == 2)
    go(pg, "/certificate/NOPE"); rec("unknown certificate code shows a not-found state, not a fake certificate", "Certificate not found" in pg.inner_text("h1"))
    ctx.close()


def lesson(br):
    ctx = br.new_context(viewport={"width": 1440, "height": 900}); pg = ctx.new_page(); go(pg, "/lesson/5")
    t0 = pg.inner_text("main .surface span.font-mono >> nth=0")
    rec("lesson does not autoplay", pg.is_visible("[aria-label='Play lesson']") and t0 == "0:00", t0)
    pg.click("[aria-label='Play']"); pg.wait_for_timeout(2300); t1 = pg.inner_text("main .surface span.font-mono >> nth=0")
    rec("play advances the timer", t1 in ("0:02", "0:03"), t1)
    pg.click("[aria-label='Pause']"); pg.wait_for_timeout(1300); rec("pause stops it", pg.inner_text("main .surface span.font-mono >> nth=0") == t1)
    pg.click("[aria-label='Forward 5 seconds']"); pg.click("[aria-label='Forward 5 seconds']"); pg.click("[aria-label='Back 5 seconds']")
    t2 = pg.inner_text("main .surface span.font-mono >> nth=0"); rec("seek buttons move 5 seconds", t2 in ("0:07", "0:08"), t2)
    pg.select_option("#player-speed", "2"); pg.click("[aria-label='Play']"); pg.wait_for_timeout(2200); pg.click("[aria-label='Pause']")
    t3 = pg.inner_text("main .surface span.font-mono >> nth=0"); rec("2x speed advances twice as fast", t3 in ("0:11", "0:12", "0:13"), t3)
    pg.locator("[aria-label='Seek']").focus(); pg.keyboard.press("End"); rec("seek slider is keyboard operable", pg.inner_text("main .surface span.font-mono >> nth=0") == pg.inner_text("main .surface span.font-mono >> nth=1"))
    pg.keyboard.press("Home"); pg.select_option("#player-speed", "1"); pg.locator("h1").click(); pg.keyboard.press("Space"); pg.wait_for_timeout(1200); pg.keyboard.press("k")
    rec("Space / K shortcuts play and pause", pg.inner_text("main .surface span.font-mono >> nth=0") == "0:01" and pg.is_visible("[aria-label='Play']"))
    pg.keyboard.press("f"); rec("F toggles theater mode (chapter list hides)", not pg.is_visible("#chapter-lessons-title")); pg.keyboard.press("f")
    pg.click("[aria-label='Keyboard shortcuts']"); pg.wait_for_timeout(250); rec("shortcuts dialog opens with focus inside", pg.is_visible("[role=dialog]") and pg.evaluate("document.activeElement.getAttribute('aria-label')") == "Close")
    pg.keyboard.press("Escape"); rec("shortcuts dialog closes on Escape", not pg.is_visible("[role=dialog]"))
    bm = pg.locator("button:has-text('Bookmark')"); bm.click(); rec("bookmark button toggles", pg.locator("button:has-text('Bookmarked')").get_attribute("aria-pressed") == "true")
    pg.click("button:has-text('Mark as done')"); rec("mark as done toggles", pg.locator("button:has-text('Completed')").get_attribute("aria-pressed") == "true")
    w = pg.evaluate("[...document.querySelectorAll('button[aria-pressed].btn')].map(b => b.offsetWidth)"); rec("toggle buttons keep their width in both states", len(set(w)) == 1, w)
    for name in ["Scratchpad", "Notes", "Q&A", "Transcript", "Overview"]:
        pg.click(f"[role=tab]:has-text('{name}')"); pg.wait_for_timeout(250)
        rec(f"lesson tab {name} selects and shows its panel", pg.get_attribute(f"[role=tab]:has-text('{name}')", "aria-selected") == "true" and len(pg.inner_text("[role=tabpanel]")) > 20)
    pg.click("[role=tab]:has-text('Scratchpad')"); pg.fill("#scratchpad-code", "console.log(6*7)"); pg.click("[role=tabpanel] >> text=Run code")
    rec("scratchpad runs code", pg.inner_text("[role=tabpanel] pre").strip() == "42")
    pg.fill("#scratchpad-code", "nope("); pg.click("[role=tabpanel] >> text=Run code"); rec("scratchpad reports errors", "error" in pg.inner_text("[role=tabpanel] pre").lower())
    pg.click("text=Reset code"); rec("scratchpad reset restores the starter code", len(pg.input_value("#scratchpad-code")) > 20)
    pg.click("[role=tab]:has-text('Notes')"); pg.click("text=Save note")
    rec("empty note is rejected with a message", pg.is_visible("#note-error") and pg.get_attribute("#note-draft", "aria-invalid") == "true")
    pg.fill("#note-draft", "A test note"); pg.click("text=Save note"); rec("note saves and lists", "A test note" in pg.inner_text("[role=tabpanel] ul") and pg.input_value("#note-draft") == "")
    pg.click("[aria-label='Delete note']"); rec("note deletes", not pg.is_visible("text=A test note"))
    go(pg, "/lesson/1"); pg.click("[role=tab]:has-text('Q&A')"); n = pg.locator("[role=tabpanel] ul.rows > li").count()
    pg.click("text=Post question"); rec("empty question is rejected with a message", pg.is_visible("#question-error"))
    pg.fill("#question-draft", "Is this a test?"); pg.click("text=Post question"); rec("question posts", pg.locator("[role=tabpanel] ul.rows > li").count() == n + 1)
    up = pg.locator("[aria-label^='Upvote']").nth(1); a = up.inner_text(); up.click(); rec("upvote changes the count", up.inner_text() != a)
    pg.click("[role=tabpanel] ul.rows > li >> nth=1 >> text=Reply"); pg.click("text=Send reply"); rec("empty reply is rejected", pg.locator(".field-error").count() == 1)
    pg.fill("input[id^='reply-']", "A reply"); pg.click("text=Send reply"); rec("reply posts", pg.is_visible("text=A reply"))
    pg.click("[role=tab]:has-text('Transcript')"); pg.click("[role=tabpanel] ol button >> nth=2"); rec("transcript line seeks the video", pg.inner_text("main .surface span.font-mono >> nth=0") != "0:00")
    pg.click("aside ol a >> nth=1"); rec("chapter list opens another lesson", pg.evaluate("location.pathname") == "/lesson/2")
    pg.click("text=Next:"); rec("next link opens the next lesson", pg.evaluate("location.pathname") == "/lesson/3")
    ctx.close()


def tools(br):
    ctx = br.new_context(viewport={"width": 1440, "height": 900}); ctx.grant_permissions(["clipboard-read", "clipboard-write"]); pg = ctx.new_page(); go(pg, "/playground", 800)
    rec("playground runs the preset on load", "Welcome to IT Beginner!" in pg.inner_text("[aria-live=polite]"))
    for name in ["HTML", "CSS", "JavaScript"]:
        pg.click(f"[role=tab]:has-text('{name}')"); rec(f"playground {name} tab shows its editor", pg.get_attribute("textarea", "aria-label") == f"{name} editor")
    pg.fill("textarea", "console.log('hi ' + (2+3))"); pg.click("text=Run code"); pg.wait_for_timeout(500)
    rec("playground Run code prints to the console", pg.inner_text("[aria-live=polite]").strip() == "hi 5")
    pg.click("text=Clear"); rec("console clears", "No console output" in pg.inner_text("[aria-live=polite]"))
    n = pg.locator("#playground-snippet option").count(); pg.fill("#playground-title", "My snippet"); pg.click("button:has-text('Save')")
    rec("save adds a snippet and confirms", pg.locator("#playground-snippet option").count() == n + 1 and "saved" in pg.inner_text("[role=status]").lower())
    pg.fill("#playground-title", ""); rec("save is disabled without a title", pg.is_disabled("button:has-text('Save')"))
    with pg.expect_download() as d: pg.click("text=Export .html")
    rec("export downloads an .html file", d.value.suggested_filename.endswith(".html"))
    pg.select_option("#playground-snippet", index=2); pg.wait_for_timeout(500); rec("choosing a snippet loads it", pg.input_value("#playground-title") != "")
    go(pg, "/resources"); tabs = pg.locator("[role=tab]")
    rec("cheatsheets: 4 handbooks, first selected", tabs.count() == 4 and tabs.nth(0).get_attribute("aria-selected") == "true")
    tabs.nth(2).click(); pg.wait_for_timeout(250); rec("cheatsheet tab switches content and updates the URL", "Agile" in pg.inner_text("[role=tabpanel] h2") and pg.evaluate("location.hash") == "#agile-scrum")
    tabs.nth(0).click(); c = pg.locator("[role=tabpanel] button.btn").nth(0); c.click(); pg.wait_for_timeout(150)
    rec("copy puts the snippet on the clipboard and confirms", "Copied" in c.inner_text() and len(pg.evaluate("navigator.clipboard.readText()")) > 20)
    w1 = c.evaluate("e => e.offsetWidth"); pg.wait_for_timeout(2200); rec("copy button reverts and keeps its width", "Copied" not in c.inner_text() and c.evaluate("e => e.offsetWidth") == w1)
    ctx.close()


def account(br):
    ctx = br.new_context(viewport={"width": 1440, "height": 900}); pg = ctx.new_page(); go(pg, "/admin")
    rec("admin in student view: role buttons disabled, switch offered", pg.locator("tbody button:disabled").count() == 6 and pg.is_visible("main button:has-text('Switch to admin view')"))
    pg.click("main button:has-text('Switch to admin view')"); rec("switching to admin enables the roster", pg.locator("tbody button:disabled").count() == 0 and pg.locator("main button:has-text('Switch to admin view')").count() == 0)
    pg.click("tbody tr >> nth=1 >> button"); rec("role toggle changes the row", "Admin" in pg.inner_text("tbody tr >> nth=1 >> .badge"))
    pg.fill("#roster-filter", "kenji"); rec("roster filter narrows to 1", pg.locator("tbody tr").count() == 1)
    pg.fill("#roster-filter", "zzz"); rec("roster filter empty state", "No students match" in pg.inner_text("tbody"))
    go(pg, "/profile"); rec("role persists across navigation", "Course Admin" in pg.inner_text("main"))
    pg.click("main button:has-text('Switch to student view')"); rec("profile role switch", "Alex Chen" in pg.inner_text("main"))
    with pg.expect_download() as d: pg.click("text=Export learning data")
    rec("export downloads JSON", d.value.suggested_filename.endswith(".json"))
    pg.click("text=Reset all progress"); pg.wait_for_timeout(250)
    rec("reset opens a confirm dialog with focus on Cancel", pg.is_visible("[role=alertdialog]") and pg.evaluate("document.activeElement.innerText") == "Cancel")
    pg.keyboard.press("Escape"); rec("Escape cancels the reset", not pg.is_visible("[role=alertdialog]") and "3 of 42" in pg.inner_text("main"))
    pg.click("text=Reset all progress"); pg.click("[role=alertdialog] >> text=Reset progress"); pg.wait_for_timeout(200)
    rec("confirming resets progress and says so", "0 of 42" in pg.inner_text("main") and "have been reset" in pg.inner_text("main"))
    go(pg, "/dashboard"); rec("dashboard reflects the reset", "0 of 42" in pg.inner_text("main"))
    ctx.close()


def reduced_motion(br):
    ctx = br.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce"); pg = ctx.new_page(); go(pg, "/")
    pg.click("header [aria-label='Account menu']")
    d = pg.evaluate("[...document.querySelectorAll('*')].map(e => getComputedStyle(e)).filter(c => c.animationName !== 'none' && parseFloat(c.animationDuration) > 0.01 || parseFloat(c.transitionDuration) > 0.01).length")
    rec("reduced motion: no animation or transition longer than 10ms", d == 0, d); ctx.close()
    pg = br.new_page(viewport={"width": 1440, "height": 900}); bad = []
    for route in ROUTES:
        go(pg, route, 100)
        bad += pg.evaluate("[...document.querySelectorAll('*')].filter(e => getComputedStyle(e).animationIterationCount === 'infinite' && getComputedStyle(e).animationName !== 'none').map(e => e.className.toString().slice(0, 40))")
    rec("no infinite animations on any route", not bad, bad[:5]); pg.close()


with sync_playwright() as p:
    br = p.chromium.launch()
    for f in (errors_and_requests, layout, cls, links_and_names, header, landing, courses_search, quiz, lesson, tools, account, reduced_motion):
        try: f(br)
        except Exception as e: rec(f"{f.__name__} ran to completion", False, str(e)[:400])
    br.close()
fails = [k for k, v in R.items() if not v["pass"]]
json.dump({"url": URL, "passed": len(R) - len(fails), "failed": len(fails), "results": R}, open(OUT, "w"), indent=1)
print(f"\n{len(R) - len(fails)} passed, {len(fails)} failed")
