#!/usr/bin/env python3
# aggregate.py <key.json> <run dir> [--md]
# Joins each session's rating.json with the private key, prints per-game means and the calibration checks.
# Calibration checks (fixed BEFORE the first results were read, 2026-10-03):
#   C1 fun: TOWLINE look build mean fun is at least 1.0 below the TOWLINE fun build ("clearly above")
#   C2 fun: the look build has the lowest mean fun of all six games
#   C3 fun: RILL mean fun is at most 0.5 above the fun build ("near or below")
#   C4 nuance: every jam winner's mean nuance is above the fun build's, and their average is at least 1.0 above it
#   C5 phrases: of the look build's testers, a majority call it slow AND a majority report no music;
#               of the fun build's testers, a majority describe the play as basic/simple/template (or nuance <= 4)
#   (info) fun build mean fun >= 6, Ben's "level we could feature it"
import json, sys, os, re, statistics as st
keyf, run = sys.argv[1], sys.argv[2]
key = json.load(open(keyf))
WIN = ['bellkeeper', 'sundrift', 'farseek']
ORDER = ['towline_look', 'towline_fun', 'rill'] + WIN
rows = []
for sid, k in key.items():
    f = os.path.join(run, sid, 'rating.json')
    if not os.path.exists(f): continue
    try: r = json.load(open(f))
    except Exception: txt = open(f).read(); r = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
    r.update(sid=sid, game=k['game'], persona=k['persona'])
    rows.append(r)
def num(x):
    try: return float(x)
    except Exception: return None
def mean(g, f):
    v = [num(r.get(f)) for r in rows if r['game'] == g and num(r.get(f)) is not None]
    return round(st.mean(v), 2) if v else None
def text(r): return ' '.join(str(r.get(k, '')) for k in ('verdict', 'worst_moment', 'audio', 'pace_word', 'nuance_found', 'best_moment')).lower()
SLOW = re.compile(r'\bslow|sluggish|drag(s|ged|ging)? on|plodding|tedious|leisurely|crawl')
NOMUSIC = re.compile(r'no music|without music|silen|no sound|nothing to hear|heard nothing|no audio|barely any sound|mute')
BASIC = re.compile(r'basic|simple|shallow|one[- ]note|repetitive|template|standard|generic|by[- ]the[- ]numbers|nothing to decide|no real (choice|decision|trade)|one obvious|samey|straightforward')
table = []
for g in ORDER:
    rs = [r for r in rows if r['game'] == g]
    if not rs: continue
    rep = sum(1 for r in rs if str(r.get('would_replay', '')).lower().startswith('y'))
    table.append(dict(game=g, n=len(rs), fun=mean(g, 'fun'), nuance=mean(g, 'nuance'), pace=mean(g, 'pace'), juice=mean(g, 'feedback_juice'),
                      replay=f'{rep}/{len(rs)}', slow=sum(1 for r in rs if SLOW.search(text(r))), nomusic=sum(1 for r in rs if NOMUSIC.search(str(r.get('audio', '')).lower() + ' ' + str(r.get('verdict', '')).lower())),
                      basic=sum(1 for r in rs if BASIC.search(text(r)) or (num(r.get('nuance')) or 10) <= 4)))
T = {t['game']: t for t in table}
def g(gm, f): return T.get(gm, {}).get(f)
checks = []
def check(name, fn):  # each check on its own, so a missing game fails that check only (never a vacuous PASS)
    try: ok, vals = fn(); checks.append((name, ok, vals))
    except (TypeError, ValueError, KeyError) as e: checks.append((name, False, 'missing games for this check'))
check('C1 fun: look build >= 1.0 below fun build', lambda: (g('towline_fun', 'fun') - g('towline_look', 'fun') >= 1.0, f"{g('towline_look','fun')} vs {g('towline_fun','fun')}"))
check('C2 fun: look build lowest of all', lambda: (len(table) == 6 and g('towline_look', 'fun') == min(t['fun'] for t in table), ', '.join(f"{t['game']} {t['fun']}" for t in table)))
check('C3 fun: RILL near or below fun build (<= +0.5)', lambda: (g('rill', 'fun') <= g('towline_fun', 'fun') + 0.5, f"{g('rill','fun')} vs {g('towline_fun','fun')}"))
def c4():
    wn = [g(w, 'nuance') for w in WIN]
    if None in wn: raise TypeError
    return all(x > g('towline_fun', 'nuance') for x in wn) and st.mean(wn) - g('towline_fun', 'nuance') >= 1.0, f"winners {wn} (mean {round(st.mean(wn), 2)}) vs fun build {g('towline_fun','nuance')}"
check('C4 nuance: each winner above fun build, average >= +1.0', c4)
def c5():
    nl, nf = g('towline_look', 'n'), g('towline_fun', 'n')
    return g('towline_look', 'slow') * 2 > nl and g('towline_look', 'nomusic') * 2 > nl and g('towline_fun', 'basic') * 2 > nf, f"look slow {g('towline_look','slow')}/{nl}, no music {g('towline_look','nomusic')}/{nl}; fun basic {g('towline_fun','basic')}/{nf}"
check('C5 phrases: look "slow" + "no music", fun "basic"', c5)
check('(info) fun build featureable (fun >= 6)', lambda: (g('towline_fun', 'fun') >= 6, str(g('towline_fun', 'fun'))))
if '--nuance-only' in sys.argv:  # cross-game nuance check alone (round 4): the fun build against the three winners
    checks = [c for c in checks if c[0].startswith('C4')]
ok = all(c[1] for c in checks if not c[0].startswith('(info)'))
md = '--md' in sys.argv
if md:
    print('| Game | n | Fun | Nuance | Pace | Juice | Replay | says slow | says no music | says basic |')
    print('|---|---|---|---|---|---|---|---|---|---|')
    for t in table: print(f"| {t['game']} | {t['n']} | {t['fun']} | {t['nuance']} | {t['pace']} | {t['juice']} | {t['replay']} | {t['slow']} | {t['nomusic']} | {t['basic']} |")
    print(); print('| Check | Result | Values |'); print('|---|---|---|')
    for c in checks: print(f"| {c[0]} | {'PASS' if c[1] else 'FAIL'} | {c[2]} |")
    print(f"\nCALIBRATION: {'PASS' if ok else 'FAIL'}")
else:
    for t in table: print(t)
    for c in checks: print(('PASS ' if c[1] else 'FAIL ') + c[0] + '  ' + c[2])
    print('CALIBRATION', 'PASS' if ok else 'FAIL')
    print('\nper session:')
    for r in sorted(rows, key=lambda r: (ORDER.index(r['game']), r['persona'])):
        print(f"{r['sid']} {r['game']:13} {r['persona']:11} fun {r.get('fun')} nuance {r.get('nuance')} pace {r.get('pace')} ({r.get('pace_word')}) juice {r.get('feedback_juice')} replay {r.get('would_replay')} quit {r.get('would_quit_at_s')} play {r.get('play_seconds')}")
