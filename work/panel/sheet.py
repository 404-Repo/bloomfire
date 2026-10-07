#!/usr/bin/env python3
# Contact sheet for one act: sheet.py <out.jpg> <frame.jpg> <seconds> [<frame.jpg> <seconds> ...]
# Frames left to right, oldest first, at most 8 (evenly sampled if more), game time stamped on each.
import sys
from PIL import Image, ImageDraw
out, a = sys.argv[1], sys.argv[2:]
fr = [(a[i], a[i + 1]) for i in range(0, len(a), 2)]
if len(fr) > 8:
    idx = [round(i * (len(fr) - 1) / 7) for i in range(8)]
    fr = [fr[i] for i in idx]
ims = [Image.open(f).convert('RGB') for f, _ in fr]
w, h = ims[0].size
cols = len(ims) if w < h else min(len(ims), 4)
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w + (cols - 1) * 4, rows * h + (rows - 1) * 4), (30, 30, 30))
d = ImageDraw.Draw(S)
for i, (im, (_, t)) in enumerate(zip(ims, fr)):
    x, y = (i % cols) * (w + 4), (i // cols) * (h + 4)
    S.paste(im, (x, y))
    d.rectangle([x, y, x + 58, y + 16], fill=(0, 0, 0))
    d.text((x + 3, y + 2), f"{float(t):.1f}s", fill=(255, 255, 0))
if S.size[0] > 1600:
    S = S.resize((1600, round(S.size[1] * 1600 / S.size[0])))
S.save(out, quality=72)
