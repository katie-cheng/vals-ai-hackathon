"""Compare the live S02 site with inputs/live-app (vite preview): normalised DOM equality and full-page pixel diff per route.

usage: python fidelity.py [LOCAL_URL]   (run from a scratch dir; writes PNGs to cwd)
"""
import sys, re, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops, ImageStat
LIVE="https://it-beginner-platform-jqu1.arcada.app"; LOCAL=sys.argv[1] if len(sys.argv)>1 else "http://localhost:4302"
ROUTES=["/","/dashboard","/courses","/lesson/1","/lesson/10","/playground","/search","/quizzes","/quiz/1","/certificates","/resources","/admin","/profile"]
def norm(h):
    h=re.sub(r' data-source-loc="[^"]*"','',h)
    h=re.sub(r' data-arena[^=]*="[^"]*"','',h)
    return h
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,hh in [(1440,900),(390,844)]:
        for r in ROUTES:
            res={}
            for name,base in [("live",LIVE),("local",LOCAL)]:
                ctx=b.new_context(viewport={"width":w,"height":hh}); pg=ctx.new_page()
                pg.goto(base+"/", wait_until="load"); pg.wait_for_timeout(1500); pg.evaluate("r=>{history.pushState({},'',r);dispatchEvent(new PopStateEvent('popstate'))}",r); pg.wait_for_timeout(2000)
                res[name]=norm(pg.evaluate("document.getElementById('root').innerHTML"))
                f=f"{name}_{w}_{r.strip('/').replace('/','-') or 'home'}.png"; pg.screenshot(path=f, full_page=True); res[name+"_png"]=f
                ctx.close()
            a=Image.open(res["live_png"]).convert("RGB"); c=Image.open(res["local_png"]).convert("RGB")
            d="size %s vs %s"%(a.size,c.size) if a.size!=c.size else "mean %.3f"%(sum(ImageStat.Stat(ImageChops.difference(a,c)).mean)/3)
            same=res["live"]==res["local"]
            print(w,r,"DOM same" if same else "DOM DIFF",len(res["live"]),len(res["local"]),d, flush=True)
            if not same:
                x,y=res["live"],res["local"]; i=next((k for k in range(min(len(x),len(y))) if x[k]!=y[k]),0)
                print("   live :",x[max(0,i-80):i+120]); print("   local:",y[max(0,i-80):i+120])
    b.close()
