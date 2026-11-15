"""Make each before/after "before" image from its own "after" image (fix F13: #157 #170 #174 #190, S14 #327).

The geometry of a before must match its after exactly, so every before here is the after photo plus a dirt layer.
The dirt patterns for siding, driveway and exterior glass come from the live site's original "before" photos
(inputs/live-app/public/images/gallery-*-before.jpg); gutters, interior windows and patio use procedural grime.
These are illustrations, not real job photos.

usage: python tools/make_befores.py   (run from references/S13/solution)
"""
import pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = pathlib.Path(__file__).resolve().parents[1]
IMG = HERE / "public/images"
ORIG = HERE.parent / "inputs/live-app/public/images"
rng = np.random.default_rng(13)


def load(p):
    return np.asarray(Image.open(p).convert("RGB")).astype(np.float32) / 255


def save(a, name):
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(IMG / name, quality=86, optimize=True)


def blur(m, r):
    return np.asarray(Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255


def lum(a):
    return a @ np.array([0.299, 0.587, 0.114], np.float32)


def dirt_from(before, size, lo=0.05, hi=0.55):
    """Darkness map of an original 'before' photo: 0 = clean surface, 1 = heavy dirt."""
    b = np.asarray(Image.open(before).convert("RGB").resize(size, Image.LANCZOS)).astype(np.float32) / 255
    L = lum(b)
    ref = np.percentile(L, 97)
    return np.clip((1 - L / ref - lo) / (hi - lo), 0, 1)


def noise(shape, scale, stretch=(1, 1)):
    h, w = shape
    small = rng.random((max(2, int(h / scale / stretch[0])), max(2, int(w / scale / stretch[1]))))
    n = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255
    return n


def stain(after, dirt, tint, strength, dull=0.0):
    d = (dirt * strength)[..., None]
    out = after * (1 - dull) + after.mean(axis=2, keepdims=True) * dull
    return out * (1 - d) + np.array(tint, np.float32) * d


def poly_mask(size, polys, r=6):
    m = Image.new("L", size, 0)
    dr = ImageDraw.Draw(m)
    for p in polys:
        dr.polygon(p, fill=255)
    return blur(np.asarray(m).astype(np.float32) / 255, r)


def siding():
    a = load(IMG / "gallery-siding-after.jpg")
    h, w = a.shape[:2]
    d = dirt_from(ORIG / "gallery-siding-before.jpg", (w, h), 0.04, 0.5)
    d = d - np.median(d, axis=1, keepdims=True) * 1.2  # drop the source photo's own panel shadow lines
    d = np.clip(blur(np.clip(d, 0, 1), 1.2) * 1.3 + 0.12 * noise((h, w), 60), 0, 1)
    save(stain(a, d, (0.26, 0.31, 0.16), 0.85, dull=0.15) * 0.93, "gallery-siding-before.jpg")


def driveway():
    a = load(IMG / "gallery-driveway-after.jpg")
    h, w = a.shape[:2]
    d = dirt_from(ORIG / "gallery-driveway-before.jpg", (w, h), 0.08, 0.6)
    film = 0.35 + 0.25 * noise((h, w), 120)
    out = stain(a, np.clip(d, 0, 1), (0.17, 0.19, 0.14), 0.9, dull=0.25)
    out = stain(out, film, (0.42, 0.40, 0.33), 0.55)
    save(out, "gallery-driveway-before.jpg")


def exterior_window():
    a = load(IMG / "gallery-window-after.jpg")
    h, w = a.shape[:2]
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    sky = (b - r > 0.12) | ((lum(a) > 0.8) & (b > r))
    ys, xs = np.where(sky)
    y0, y1 = np.percentile(ys, [0.5, 99.5]).astype(int)
    x0, x1 = np.percentile(xs, [0.5, 99.5]).astype(int)
    glass = np.zeros((h, w), np.float32)
    glass[y0:y1, x0:x1] = 1
    glass = blur(glass * blur(sky.astype(np.float32), 4).clip(0, 1) * 1.6, 1.5).clip(0, 1)
    src = Image.open(ORIG / "gallery-window-before.jpg").convert("RGB")
    sw, sh = src.size
    crop = src.crop((int(sw * 0.06), int(sh * 0.08), int(sw * 0.94), int(sh * 0.92))).resize((x1 - x0, y1 - y0), Image.LANCZOS)
    c = np.asarray(crop).astype(np.float32) / 255
    spots = np.zeros((h, w), np.float32)
    cl = lum(c)
    spots[y0:y1, x0:x1] = np.clip(np.abs(cl - blur(cl, 12)) * 5, 0, 1)
    haze = np.zeros_like(a)
    haze[y0:y1, x0:x1] = c * 0.6 + 0.25
    g = glass[..., None]
    out = a * (1 - 0.72 * g) + haze * 0.72 * g
    out = out + (spots * glass * 0.25)[..., None]
    frame = blur((~sky).astype(np.float32), 1) * poly_mask((w, h), [[(x0 - 40, y0 - 40), (x1 + 40, y0 - 40), (x1 + 40, y1 + 60), (x0 - 40, y1 + 60)]], 2)
    out = stain(out, frame * (0.25 + 0.5 * noise((h, w), 25, (4, 1))), (0.45, 0.43, 0.35), 0.6)
    siding_dirt = (1 - frame) * np.clip(noise((h, w), 40, (6, 1)) - 0.35, 0, 1)
    save(stain(out, siding_dirt, (0.35, 0.37, 0.25), 0.25), "gallery-window-before.jpg")


def gutter():
    a = load(IMG / "gallery-gutter-after.jpg")
    h, w = a.shape[:2]
    L = lum(a)
    sat = a.max(axis=2) - a.min(axis=2)
    white = blur(((L > 0.62) & (sat < 0.12)).astype(np.float32), 2)
    stripes = np.clip(noise((h, w), 18, (10, 1)) * 1.4 - 0.45, 0, 1)
    grime = np.clip(0.35 + 0.5 * noise((h, w), 70), 0, 1)
    d = white * np.clip(stripes * 0.6 + grime * 0.4, 0, 1)
    out = stain(a, d, (0.33, 0.31, 0.22), 0.7, dull=0.15)
    roof = blur((L < 0.35).astype(np.float32), 3) * np.clip(noise((h, w), 30) - 0.3, 0, 1)
    save(stain(out, roof, (0.24, 0.30, 0.14), 0.6), "gallery-gutter-before.jpg")


def interior():
    a = load(IMG / "interior-window-clean.jpg")
    h, w = a.shape[:2]
    panes = poly_mask((w, h), [[(507, 183), (562, 183), (562, 303), (507, 303)], [(640, 178), (828, 178), (828, 302), (640, 302)]], 1)
    smudge = np.clip(noise((h, w), 14) * 0.8 + noise((h, w), 50) * 0.5 - 0.2, 0, 1)
    streak = np.clip(noise((h, w), 6, (12, 1)) - 0.45, 0, 1) * 1.6
    d = panes * np.clip(0.7 + 0.3 * smudge + streak * 0.3, 0, 1)
    out = stain(a, d, (0.70, 0.69, 0.62), 0.88)
    sill = poly_mask((w, h), [[(500, 300), (568, 300), (568, 312), (500, 312)], [(620, 300), (835, 300), (835, 318), (620, 318)]], 1)
    dust = np.clip(noise((h, w), 4) - 0.5, 0, 1) * 1.8
    save(stain(out, sill * dust, (0.33, 0.30, 0.25), 0.8), "interior-window-before.jpg")


def patio():
    a = load(IMG / "patio-clean.jpg")
    h, w = a.shape[:2]
    paving = poly_mask((w, h), [[(430, 430), (600, 420), (750, 420), (830, 627), (520, 627)], [(150, 425), (400, 410), (330, 445), (120, 450)]], 4)
    L = lum(a)
    joints = np.clip((blur(L, 3) - L) * 9, 0, 1)
    moss = np.clip(blur(joints, 1.5) * 1.5 + noise((h, w), 30) * 0.6 - 0.3, 0, 1)
    film = 0.45 + 0.4 * noise((h, w), 45)
    out = stain(a, paving * moss, (0.14, 0.18, 0.08), 1.0)
    out = stain(out, paving * film, (0.32, 0.30, 0.22), 0.7, dull=0.0)
    pool = poly_mask((w, h), [[(200, 415), (590, 418), (440, 500), (90, 520), (60, 470)]], 6)
    save(stain(out, pool * 0.85, (0.20, 0.33, 0.18), 0.6), "patio-before.jpg")


if __name__ == "__main__":
    for f in (siding, driveway, exterior_window, gutter, interior, patio):
        f()
    print("done")
