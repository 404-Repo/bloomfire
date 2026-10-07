#!/usr/bin/env python3
"""BLOOMFIRE claims, measured on a game-shaped frame.
Usage: python3 tools/claims.py <png|dir> [...]   -> one row per frame + medians, as a table and JSON (--json).
Every frame is centre-cropped to the 844:390 aspect (never stretched), then resampled to 844x390.
Bands are fractions of that 844x390 frame. A rifle box (bottom right) is excluded from the near-field band.
See ref/CLAIMS.md for the claims, thresholds and how each could be gamed."""
import sys, os, json, glob
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

W, H = 844, 390

def load(path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    tgt = W / H
    if w / h > tgt:  # too wide: crop sides
        nw = int(round(h * tgt)); x0 = (w - nw) // 2; im = im.crop((x0, 0, x0 + nw, h))
    else:            # too tall: crop top and bottom
        nh = int(round(w / tgt)); y0 = (h - nh) // 2; im = im.crop((0, y0, w, y0 + nh))
    return im.resize((W, H), Image.LANCZOS)

def hsv(a):
    r, g, b = [a[..., i] for i in range(3)]
    mx = a.max(-1); mn = a.min(-1); d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
    return h, s, mx

def measure(path):
    im = load(path)
    a = np.asarray(im).astype(np.float32) / 255.0
    L = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]) * 255
    h, s, v = hsv(a)
    R, B = a[..., 0] * 255, a[..., 2] * 255
    out = {"frame": os.path.basename(path)}

    # C1 two colour temperatures: warm painted vs cold ink wash, both present in quantity
    warm = (h >= 15) & (h <= 65) & (s >= 0.30) & (v >= 0.35)
    cold = ((s < 0.16) | ((h >= 180) & (h <= 250) & (s < 0.45))) & (v >= 0.12)
    out["warm_pct"] = round(100 * warm.mean(), 1)
    out["cold_pct"] = round(100 * cold.mean(), 1)

    # C2 the brightest values sit in the warm light: share of the top 2% luma that is warm (R-B > 20)
    t = np.percentile(L, 98)
    top = L >= t
    out["p98_luma"] = round(float(t), 1)
    out["p2_luma"] = round(float(np.percentile(L, 2)), 1)
    out["top2_warm_share"] = round(float(((R - B) > 20)[top].mean()), 2)

    # C3 near field is dressed: bottom band, left of the rifle box; edge density and colour spread
    y0, y1, x0, x1 = int(0.62 * H), int(0.96 * H), int(0.03 * W), int(0.55 * W)
    gx = ndi.sobel(L, 1); gy = ndi.sobel(L, 0); G = np.hypot(gx, gy)
    band = (slice(y0, y1), slice(x0, x1))
    out["near_edge_density"] = round(float((G[band] > 60).mean()), 3)
    out["near_luma_std"] = round(float(L[band].std()), 1)

    # C4 ink outlines in grey areas: thin dark lines inside cold regions, sky band excluded (top 25%)
    blur = ndi.uniform_filter(L, 9)
    line = (L < 0.62 * blur) & (L < 110)
    cold_ground = cold.copy(); cold_ground[: int(0.25 * H)] = False
    cold_ground = ndi.binary_erosion(ndi.binary_closing(cold_ground, iterations=3), iterations=1) | cold_ground
    region = ndi.binary_dilation(cold_ground, iterations=2)
    out["ink_line_pct_in_grey"] = round(100 * float(line[region].mean()) if region.any() else 0.0, 2)
    # contrast: the same statistic inside warm regions (outlines should fade where colour returns)
    wreg = ndi.binary_dilation(warm, iterations=2) & ~region
    out["ink_line_pct_in_warm"] = round(100 * float(line[wreg].mean()) if wreg.any() else 0.0, 2)

    # C5 magenta belongs to the ink only: present, and rare
    mag = (h >= 295) & (h <= 345) & (s >= 0.45) & (v >= 0.50)
    out["magenta_pct"] = round(100 * float(mag.mean()), 2)

    # C6 the nearest enemy reads big: dark ink bodies connected to a magenta core, tallest bbox / frame height
    # opening (2 px) removes the ink outlines, which otherwise join every dark thing into one component
    ink = ndi.binary_opening((L < 70) & (B >= R - 15), iterations=2)
    magd = ndi.binary_dilation(mag, iterations=6)
    lab, n = ndi.label(ink | ndi.binary_dilation(mag, iterations=2))
    best = 0.0
    if n:
        hits = set(np.unique(lab[magd & (lab > 0)]).tolist())
        for sl_i, sl in enumerate(ndi.find_objects(lab), start=1):
            if sl is None or sl_i not in hits: continue
            if (sl[1].stop - sl[1].start) / W > 0.6: continue  # a whole-frame dark region is not a creature
            best = max(best, (sl[0].stop - sl[0].start) / H)
    out["enemy_height_frac"] = round(best, 3)
    return out

def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    files = []
    for a in args:
        files += sorted(glob.glob(os.path.join(a, "*.png"))) if os.path.isdir(a) else [a]
    rows = [measure(f) for f in files]
    if "--json" in sys.argv:
        print(json.dumps(rows, indent=1)); return
    keys = [k for k in rows[0] if k != "frame"]
    print(f"capture: centre-crop to 844:390, resample {W}x{H}")
    print("frame".ljust(28) + "".join(k[:14].rjust(15) for k in keys))
    for r in rows:
        print(r["frame"][:27].ljust(28) + "".join(str(r[k]).rjust(15) for k in keys))
    med = {k: float(np.median([r[k] for r in rows])) for k in keys}
    print("MEDIAN".ljust(28) + "".join(str(round(med[k], 3)).rjust(15) for k in keys))

if __name__ == "__main__":
    main()
