#!/usr/bin/env python3
# pairbatch.py <run dir> <key file> <first port> <sid>:<gameA>:<gameB>:<persona> [...]
# Starts both harnesses for each pair session and writes <run dir>/prompts/<sid>.txt. Key file kept OUTSIDE the run dir.
import sys, json, os, re, subprocess
run, keyf, port = sys.argv[1], sys.argv[2], int(sys.argv[3])
H = os.path.dirname(os.path.abspath(__file__))
games = json.load(open(os.path.join(H, 'games.json')))
t = open(os.path.join(H, 'personas.md')).read()
blocks = dict(re.findall(r'^## (\w+)\n(.*?)(?=^## |\Z)', t, re.S | re.M))
tpl = open(os.path.join(H, 'pair_template.md')).read()
os.makedirs(os.path.join(run, 'prompts'), exist_ok=True)
key = json.load(open(keyf)) if os.path.exists(keyf) else {}
for spec in sys.argv[4:]:
    sid, ga, gb, persona = spec.split(':')
    out = os.path.join(run, sid); os.makedirs(out, exist_ok=True)
    ports = {}
    for lab, g in (('A', ga), ('B', gb)):
        r = subprocess.run([os.path.join(H, 'start.sh'), g, str(port), os.path.join(out, lab)], capture_output=True, text=True)
        ports[lab] = port; print(sid, lab, port, r.stdout.strip()); port += 1
    scr = lambda g: f"{games[g]['w']}x{games[g]['h']}"
    p = (tpl.replace('{PERSONA_ID}', persona).replace('{PERSONA}', blocks[persona].strip().rstrip('-').strip())
         .replace('{PORTA}', str(ports['A'])).replace('{PORTB}', str(ports['B'])).replace('{SCREENA}', scr(ga)).replace('{SCREENB}', scr(gb))
         .replace('{MIN}', '540').replace('{MAX}', '600').replace('{OUT}', out))
    open(os.path.join(run, 'prompts', sid + '.txt'), 'w').write(p)
    key[sid] = {'A': ga, 'B': gb, 'persona': persona, 'ports': ports}
json.dump(key, open(keyf, 'w'), indent=1)
