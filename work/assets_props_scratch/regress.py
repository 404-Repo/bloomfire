#!/usr/bin/env python3
"""Pass/fail the asset loader against raw module output.

Usage: node rawtest_shot.mjs && python3 regress.py

Gate on TRIANGLE RETENTION, not pixels. When a loader mishandles InstancedMesh
it keeps one copy and discards the rest, so the triangle count collapses by the
instance factor — an exact, unambiguous signal. Pixel comparisons cannot be the
gate: thin geometry (a clump of wheat stalks) differs by a few percent of
coverage through anti-aliasing alone while being pixel-perfect in structure.
"""
import json, sys

REPORT = sys.argv[1] if len(sys.argv) > 1 else 'shots/rawtest.json'
KEEP_MIN = 0.95

rows = json.load(open(REPORT))
fails = []
print(f'{"asset":20} {"raw tris":>9} {"lib tris":>9} {"kept":>7}   verdict')
for r in rows:
    raw = (r.get('raw') or {}).get('tris')
    lib = (r.get('assetlib') or {}).get('tris')
    if not raw:
        print(f'{r["slug"]:20} {"?":>9} {"?":>9} {"?":>7}   raw render failed')
        fails.append(r['slug']); continue
    keep = lib / raw
    ok = keep >= KEEP_MIN
    if not ok: fails.append(r['slug'])
    print(f'{r["slug"]:20} {raw:9d} {lib:9d} {keep:6.1%}   {"ok" if ok else "GEOMETRY LOST"}')

print()
if fails:
    print('REGRESSION TEST: FAIL —', ', '.join(fails))
    print('The loader is dropping geometry. Fix the loader; do NOT blame the asset pack.')
    sys.exit(1)
print('REGRESSION TEST: PASS — loader keeps the raw modules\' geometry')
