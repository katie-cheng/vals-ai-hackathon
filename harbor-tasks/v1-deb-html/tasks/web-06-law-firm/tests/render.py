"""Render /app/index.html headlessly, capture evidence, and write a gate reward.

Slop verifiers are not implemented yet; `reward` is only a "it rendered a real page" gate.
Evidence (screenshots, DOM, console log) is saved under /logs/verifier/render/ so
future verifiers can be developed and regraded against it.
"""

import json
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

PAGE = Path("/app/index.html")
OUT = Path("/logs/verifier/render")
REWARD = Path("/logs/verifier/reward.json")
PORT = 8123
VIEWPORTS = {"desktop": (1440, 900), "mobile": (390, 844)}
SETTLE_MS = 3000
MIN_TEXT_CHARS = 200


def write_reward(metrics: dict) -> None:
    REWARD.parent.mkdir(parents=True, exist_ok=True)
    REWARD.write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    if not PAGE.is_file() or PAGE.stat().st_size == 0:
        write_reward({"reward": 0, "file_present": 0})
        return

    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1", "--directory", str(PAGE.parent)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(1)
    metrics: dict = {"file_present": 1, "html_bytes": PAGE.stat().st_size}
    log: dict = {}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for name, (w, h) in VIEWPORTS.items():
                ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
                page = ctx.new_page()
                events = {"console_errors": [], "page_errors": [], "failed_requests": []}
                page.on("console", lambda m, e=events: m.type == "error" and e["console_errors"].append(m.text))
                page.on("pageerror", lambda err, e=events: e["page_errors"].append(str(err)))
                page.on("requestfailed", lambda r, e=events: e["failed_requests"].append(r.url))
                loaded = 1
                try:
                    page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="load", timeout=45000)
                except Exception as exc:  # noqa: BLE001
                    loaded = 0
                    events["page_errors"].append(f"navigation: {exc}")
                page.wait_for_timeout(SETTLE_MS)
                stats = page.evaluate(
                    """() => ({
                        text_chars: (document.body?.innerText || '').trim().length,
                        h_overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
                        page_height: document.documentElement.scrollHeight,
                    })"""
                )
                page.screenshot(path=str(OUT / f"{name}.png"))
                page.screenshot(path=str(OUT / f"{name}-full.png"), full_page=True)
                (OUT / f"{name}.dom.html").write_text(page.content())
                log[name] = {**events, **stats, "loaded": loaded}
                metrics[f"{name}_loaded"] = loaded
                metrics[f"{name}_console_errors"] = len(events["console_errors"])
                metrics[f"{name}_page_errors"] = len(events["page_errors"])
                metrics[f"{name}_h_overflow"] = int(stats["h_overflow"])
                metrics[f"{name}_text_chars"] = stats["text_chars"]
                ctx.close()
            browser.close()
    finally:
        server.terminate()

    (OUT / "render_log.json").write_text(json.dumps(log, indent=2))
    renders = all(metrics[f"{n}_loaded"] for n in VIEWPORTS)
    nonblank = all(metrics[f"{n}_text_chars"] >= MIN_TEXT_CHARS for n in VIEWPORTS)
    metrics["reward"] = int(renders and nonblank)
    write_reward(metrics)


if __name__ == "__main__":
    main()
