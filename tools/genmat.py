#!/usr/bin/env python3
"""Tileable PBR materials via the Atlas PATINA API (same API RUST 17 used, b1cd24af). Writes game/tex/<name>/{basecolor,normal}.jpg at 1024
and logs every call to atlas_calls.jsonl. The REST API does not report settled cost; we log an ESTIMATED max of 60 credits a call.
  python3 tools/genmat.py [name ...]"""
import json, os, sys, urllib.request, datetime, time, io
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = open(os.path.expanduser('~/.claude/atlas_api_key')).read().strip()
APIID = 'b1cd24af-214f-47c2-b5b7-7cf8ce58b60b'
API = 'https://api.prod-market.atlas.design/0.2/api_execute/' + APIID
DL = 'https://api.prod-market.atlas.design/0.2/download_binary_result/'
LOG = os.path.join(ROOT, 'atlas_calls.jsonl')
S = ' Seamless tileable PBR material, top down flat lighting, no objects, no text, no watermark, evenly filled frame, painterly hand-painted game texture.'
MATS = {
 'meadow': 'Mediterranean meadow ground: short dry grass and green grass mixed, tiny clover, small wildflower specks, a little bare soil between the blades.',
 'dirt': 'Packed warm ochre dirt footpath with small pebbles, faint foot-worn texture, dusty, no tracks, no lines.',
 'cobble': 'Old rounded cobblestones of pale warm limestone set in packed earth, irregular sizes, worn tops, grass in a few joints.',
 'limestone': 'Weathered pale limestone rock surface with layered strata, pits and cracks, warm cream grey with ochre stains.',
 'plaster': 'Old limewash plaster wall, warm off-white, soft brush marks, hairline cracks, slightly uneven, faint patches.',
 'drystone': 'Dry stone wall of irregular warm beige and grey stones fitted without mortar, dark gaps between stones.',
 'rooftile': 'Terracotta clay roof tiles in overlapping curved rows, weathered orange red with darker edges and lichen specks.',
 'timber': 'Old weathered timber planks, warm brown, open grain, knots, soft sun-worn edges.',
}
def log(rec):
    with open(LOG, 'a') as f: f.write(json.dumps(rec) + '\n')
def run(n):
    d = os.path.join(ROOT, 'game', 'tex', n); os.makedirs(d, exist_ok=True)
    if all(os.path.exists(os.path.join(d, k + '.jpg')) for k in ('basecolor', 'normal')): return 'skip ' + n
    body = json.dumps({'prompt': MATS[n] + S}).encode(); t0 = time.time(); err = ''
    for attempt in range(2):
        rec = {'utc': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'game': 'game5', 'what': 'material ' + n, 'kind': 'patina',
               'api_id': APIID, 'credits_max_hold': 60, 'credits_basis': 'ESTIMATE, PATINA node price not read', 'prompt': MATS[n][:300]}
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(API, data=body, headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY}), timeout=900))
            outs = r['outputs']
            for k in ('basecolor', 'normal'):
                raw = urllib.request.urlopen(urllib.request.Request(DL + outs[k], headers={'Authorization': 'Bearer ' + KEY}), timeout=300).read()
                Image.open(io.BytesIO(raw)).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(os.path.join(d, k + '.jpg'), quality=84)
            rec.update(ok=True, result_ids=outs, secs=round(time.time() - t0, 1)); log(rec); return 'ok ' + n
        except Exception as e:
            err = str(e)[:200]; rec.update(ok=False, error=err); log(rec)
    return 'FAIL ' + n + ' ' + err
with ThreadPoolExecutor(4) as ex:
    for line in ex.map(run, sys.argv[1:] or list(MATS)): print(line, flush=True)
