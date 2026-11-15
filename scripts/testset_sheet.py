"""Contact sheet of the frozen test set (first desktop screen + type/source label) for eyeballing type tags.
Usage: python3 scripts/testset_sheet.py [out.jpg]"""
import json, pathlib, sys
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "arena"))
import app  # noqa: E402

app.warm_cache = lambda: None
T = json.load(open(ROOT / "data/testset.json"))["sites"]
with app.app.app_context():
    S = app.sites()
    ks = sorted(T, key=lambda k: (T[k]["type"], T[k]["source"], k))
    W, H, cols = 360, 225, 6
    sheet = Image.new("RGB", (cols * W, -(-len(ks) // cols) * (H + 24)), "white")
    d = ImageDraw.Draw(sheet)
    for i, k in enumerate(ks):
        im = Image.open(app.compressed_shot(S[k], "desktop")).convert("RGB")
        im = im.crop((0, 0, im.width, int(im.width * 0.625))).resize((W - 6, H))
        x, y = (i % cols) * W, (i // cols) * (H + 24)
        sheet.paste(im, (x + 3, y + 20))
        d.text((x + 4, y + 4), f"{i} {T[k]['type']} | {T[k]['source']} | {k[:30]}", fill="black")
    sheet.save(sys.argv[1] if len(sys.argv) > 1 else "/tmp/testset_sheet.jpg", quality=80)
    print(len(ks))
