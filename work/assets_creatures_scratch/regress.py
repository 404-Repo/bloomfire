#!/usr/bin/env python3
"""Pass/fail ~/astrocade-game5/game/assetlib.js against raw module output (triangle retention >= 95%),
for the default merged load and for keepHierarchy, plus joint resolution on keepHierarchy."""
import json, sys
rows = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'shots/rawtest.json'))
fails = []
print(f'{"asset":12} {"raw":>6} {"merged":>7} {"kept":>6} {"tree":>6} {"kept":>6} {"joints":>7} moves  verdict')
for r in rows:
    raw, m, t = r['raw']['tris'], r['merged']['tris'], r['tree']['tris']
    km, kt = m / raw, t / raw
    ok = km >= 0.95 and kt >= 0.95 and r['jointsResolved'] == r['jointsDeclared'] and r['jointMovesGeometry']
    if not ok: fails.append(r['slug'])
    print(f'{r["slug"]:12} {raw:6d} {m:7d} {km:6.1%} {t:6d} {kt:6.1%} {r["jointsResolved"]:>3}/{r["jointsDeclared"]:<3} {str(r["jointMovesGeometry"]):5}  {"ok" if ok else "FAIL"}')
print('\nREGRESSION:', 'FAIL ' + ', '.join(fails) if fails else 'PASS')
sys.exit(1 if fails else 0)
