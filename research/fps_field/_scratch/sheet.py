import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(d + '/*.jpg'))
ims = [Image.open(f) for f in fs]
tw = 420 if ims[0].width > ims[0].height else 200
th = int(ims[0].height * tw / ims[0].width)
cols = 5 if tw == 420 else 8
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * (th + 16)), 'white')
dr = ImageDraw.Draw(S)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * tw, (i // cols) * (th + 16)
    S.paste(im.resize((tw, th)), (x, y + 16)); dr.text((x + 2, y + 2), os.path.basename(f), fill='black')
S.save(out, quality=70)
