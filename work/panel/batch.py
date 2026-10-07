#!/usr/bin/env python3
# batch.py <run dir> <key file> <first port> <persona,persona,...> [game,game,...]
# Starts one harness per (persona, game) session with a random blind label, writes <key file> (private, keep it OUTSIDE the run dir:
# session -> game) and <run dir>/prompts/<session>.txt (what each tester gets). Testers never see key.json.
import sys, json, os, random, subprocess, string
run, keyf, port0, personas = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4].split(',')
H = os.path.dirname(os.path.abspath(__file__))
games = json.load(open(os.path.join(H, 'games.json')))
gl = sys.argv[5].split(',') if len(sys.argv) > 5 else [g for g in games if not g.startswith('_')]
os.makedirs(os.path.join(run, 'prompts'), exist_ok=True)
key = json.load(open(keyf)) if os.path.exists(keyf) else {}
pairs = [(p, g) for p in personas for g in gl]; random.shuffle(pairs)
port = port0
for p, g in pairs:
    label = 'Game ' + random.choice(string.ascii_uppercase[:12])
    sid = f's{len(key) + 1:02d}'
    while os.path.exists(os.path.join(run, sid)): sid = sid + 'x'
    out = os.path.join(run, sid)
    r = subprocess.run([os.path.join(H, 'start.sh'), g, str(port), out], capture_output=True, text=True)
    scr = f"{games[g]['w']}x{games[g]['h']}"
    key[sid] = {'game': g, 'persona': p, 'label': label, 'port': port, 'started': r.stdout.strip()}
    mn = str(games[g].get('min', os.environ.get('PANEL_MIN', '180'))); asst = '1' if games[g].get('assist') else '0'
    open(os.path.join(run, 'prompts', sid + '.txt'), 'w').write(subprocess.run(['python3', os.path.join(H, 'prompt.py'), p, label, str(port), out, scr, mn, asst], capture_output=True, text=True).stdout)
    print(sid, port, r.stdout.strip())
    port += 1
json.dump(key, open(keyf, 'w'), indent=1)
