"""Side-by-side original vs rebuild per route.  usage: python compare.py RAW_ORIGINAL RAW_REBUILD OUTDIR"""
import pathlib, sys
from PIL import Image, ImageDraw, ImageFont

o, f, out = map(pathlib.Path, sys.argv[1:4])
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
for wdir in sorted(o.iterdir()):
    (out / wdir.name).mkdir(parents=True, exist_ok=True)
    for a in sorted(wdir.glob("*.png")):
        A, B = Image.open(a).convert("RGB"), Image.open(f / wdir.name / a.name).convert("RGB")
        tw = 720 if int(wdir.name) > 600 else 390
        A = A.resize((tw, int(A.height * tw / A.width))); B = B.resize((tw, int(B.height * tw / B.width)))
        H = min(max(A.height, B.height), 3600)
        s = Image.new("RGB", (tw * 2 + 30, H + 44), "white"); d = ImageDraw.Draw(s)
        d.text((8, 10), f"ORIGINAL  {a.stem} @{wdir.name}", fill=(190, 30, 30), font=F); d.text((tw + 30, 10), "REBUILD", fill=(20, 120, 60), font=F)
        s.paste(A.crop((0, 0, tw, min(A.height, H))), (0, 44)); s.paste(B.crop((0, 0, tw, min(B.height, H))), (tw + 30, 44))
        s.save(out / wdir.name / f"{a.stem}.jpg", quality=72)
