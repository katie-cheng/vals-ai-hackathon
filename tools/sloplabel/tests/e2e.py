"""Headless smoke test of the autosave flow: pick -> row created, empty close -> row kept, re-click -> row removed,
climb + type -> row updated/retargeted + screenshot, keyboard shortcuts, mobile frame."""
import asyncio, json, os, sys
import httpx
from playwright.async_api import async_playwright

B = os.environ.get("SLOP_BASE", "http://127.0.0.1:8700")
SR = "document.getElementById('__sloplabel').shadowRoot"


def labels(sid):
    return httpx.get(f"{B}/__slop/api/labels?site={sid}").json()


async def target(page):
    return await page.evaluate("""() => { const el = [...document.querySelectorAll('h1,h2,button,a')].find(e => { const r = e.getBoundingClientRect(); return r.width>20 && r.top>60 && r.bottom<innerHeight; });
       if (!el) return null; const r = el.getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; }""")


async def main(site_ids):
    async with async_playwright() as p:
        br = await p.chromium.launch(args=["--no-sandbox"])
        ctx = await br.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        page.on("console", lambda m: m.type == "error" and errs.append("console: " + m.text[:200]))
        await page.goto(B + "/__slop/")
        await page.wait_for_selector(".s")
        print("index cards:", await page.locator(".s").count())
        for sid in site_ids:
            errs.clear()
            await page.goto(f"{B}/__slop/open/{sid}", wait_until="load")
            await page.evaluate("localStorage.setItem('__slop_annotator','e2e-bot')")
            await page.wait_for_timeout(2500)
            before = {l["id"] for l in labels(sid)}
            out = {"site": sid}
            pt = await target(page)
            if not pt:
                print(sid, "no target"); continue
            # 1) pick + close empty -> row created then deleted
            await page.keyboard.press("q")
            await page.mouse.move(*pt); await page.wait_for_timeout(200)
            out["tip"] = (await page.evaluate(f"{SR}.querySelector('.tip').innerText")).replace("\n", " | ")[:120]
            await page.mouse.click(*pt); await page.wait_for_timeout(700)
            new = [l for l in labels(sid) if l["id"] not in before]
            out["after_click_rows"] = len(new)
            out["after_click_shot_status"] = new[0]["shot_status"] if new else None
            await page.keyboard.press("Escape"); await page.wait_for_timeout(1500)
            out["after_empty_close_rows"] = len([l for l in labels(sid) if l["id"] not in before])
            out["empty_mark_visible"] = await page.evaluate(f"[...{SR}.querySelectorAll('.mark')].some(m=>!m.hidden)")
            await page.mouse.move(*pt); await page.wait_for_timeout(150)
            await page.mouse.click(*pt); await page.wait_for_timeout(800)
            out["after_unclick_rows"] = len([l for l in labels(sid) if l["id"] not in before])
            # 2) pick (pick mode stays on), W to climb, type comment -> autosaved + retargeted
            out["still_picking"] = await page.evaluate(f"{SR}.querySelector('.bar [data-a=pick]').classList.contains('on')")
            if not out["still_picking"]:
                await page.keyboard.press("q")
            await page.mouse.move(*pt); await page.wait_for_timeout(150)
            await page.mouse.click(*pt); await page.wait_for_timeout(700)
            first = [l for l in labels(sid) if l["id"] not in before][0]
            await page.keyboard.press("w"); await page.wait_for_timeout(200)
            await page.keyboard.press("f")
            await page.keyboard.type("automated smoke test label")
            await page.wait_for_timeout(1500)
            cur = [l for l in labels(sid) if l["id"] == first["id"]][0]
            out["autosaved_comment"] = cur["comment"]
            out["retargeted"] = (cur["selector"], cur["tag"]) != (first["selector"], first["tag"])
            out["panel_status"] = await page.evaluate(f"{SR}.querySelector('.panel .st').innerText")
            await page.screenshot(path=f"/tmp/sl_{sid}_panel.png")
            await page.keyboard.press("Escape"); await page.wait_for_timeout(500)
            for _ in range(40):
                cur = [l for l in labels(sid) if l["id"] == first["id"]]
                if cur and cur[0]["shot_status"] not in ("pending", "waiting"): break
                await asyncio.sleep(1)
            out["kept_after_close"] = bool(cur)
            out["shot_status"] = cur[0]["shot_status"] if cur else None
            out["pins"] = await page.evaluate(f"[...{SR}.querySelectorAll('.pin')].filter(p=>!p.hidden).length")
            # 3) shortcuts: ? help, A drawer, H pins, reopen via pin + D delete
            await page.keyboard.press("?"); out["help_open"] = await page.evaluate(f"!{SR}.querySelector('.help').hidden")
            await page.screenshot(path=f"/tmp/sl_{sid}_help.png")
            await page.keyboard.press("Escape")
            await page.keyboard.press("a"); out["drawer_open"] = await page.evaluate(f"!{SR}.querySelector('.drawer').hidden")
            await page.keyboard.press("a")
            await page.keyboard.press("h"); await page.wait_for_timeout(300); out["pins_hidden_after_h"] = await page.evaluate(f"[...{SR}.querySelectorAll('.pin')].filter(p=>!p.hidden).length") == 0
            await page.keyboard.press("h"); await page.wait_for_timeout(1200)
            await page.evaluate(f"[...{SR}.querySelectorAll('.pin')].find(p=>+p.dataset.id==={first['id']})?.click()")
            await page.wait_for_timeout(900)
            out["reopened_comment"] = await page.evaluate(f"{SR}.querySelector('.panel textarea')?.value")
            await page.keyboard.press("Escape")
            out["closed_unchanged_kept"] = any(l["id"] == first["id"] for l in labels(sid))
            await page.evaluate(f"[...{SR}.querySelectorAll('.pin')].find(p=>+p.dataset.id==={first['id']})?.click()")
            await page.wait_for_timeout(900)
            page.once("dialog", lambda d: asyncio.ensure_future(d.accept()))
            await page.keyboard.press("d"); await page.wait_for_timeout(800)
            out["deleted_with_d"] = not any(l["id"] == first["id"] for l in labels(sid))
            out["leftover_rows"] = len([l for l in labels(sid) if l["id"] not in before])
            for l in labels(sid):
                if l["id"] not in before:
                    httpx.delete(f"{B}/__slop/api/labels/{l['id']}")
            out["errors"] = errs[:5]
            print(json.dumps(out))
        await page.goto(f"{B}/__slop/open/{site_ids[0]}?view=mobile", wait_until="load")
        await page.wait_for_timeout(3000)
        print("mobile frame overlay:", await page.frames[1].evaluate("!!document.getElementById('__sloplabel') && innerWidth"))
        await br.close()

asyncio.run(main(sys.argv[1:] or ["S03"]))
