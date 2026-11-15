"""Report header links/buttons whose text wraps onto more than one line. usage: python header_wrap.py URL 1440,1024,390"""
import sys
from playwright.sync_api import sync_playwright
url=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in [int(x) for x in sys.argv[2].split(',')]:
        pg=b.new_page(viewport={'width':w,'height':800}); pg.goto(url,wait_until='load'); pg.wait_for_timeout(2500)
        r=pg.evaluate("""()=>{const h=document.querySelector('header');const els=[...h.querySelectorAll('a,button')].filter(e=>e.offsetParent&&!e.closest('[aria-label="Mobile navigation"]'));
        const lines=e=>{const rg=document.createRange();rg.selectNodeContents(e);const tops=new Set([...rg.getClientRects()].filter(r=>r.width>1).map(r=>Math.round(r.top/4)));return tops.size};const multi=els.filter(e=>e.innerText.trim()&&lines(e)>1).map(e=>e.innerText.trim().slice(0,20));
        const inner=h.querySelector('div');const over=inner.scrollWidth>inner.clientWidth+1;return {multi,over,doc:document.documentElement.scrollWidth,vis:els.map(e=>e.innerText.trim().slice(0,12)||e.getAttribute('aria-label')?.slice(0,12))}}""")
        print(w,r['over'],r['doc'],r['multi'],r['vis']); pg.close()
