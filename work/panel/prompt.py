#!/usr/bin/env python3
# prompt.py <persona id> <label> <port> <out dir> <WxH> [min s] [assist 0|1]  -> the full tester prompt on stdout
import sys, re, os
pid, label, port, out, screen = sys.argv[1:6]
MIN = sys.argv[6] if len(sys.argv) > 6 else os.environ.get('PANEL_MIN', '180')
ASSIST = len(sys.argv) > 7 and sys.argv[7] == '1'
t = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'personas.md')).read()
blocks = dict(re.findall(r'^## (\w+)\n(.*?)(?=^## |\Z)', t, re.S | re.M))
tpl = blocks['TEMPLATE'].strip()
tpl = tpl.replace('{ASSIST}', blocks['ASSIST'].strip().replace('{PORT}', port) + '\n' if ASSIST else '')
persona = blocks[pid].strip().rstrip('-').strip()
print(tpl.replace('{PERSONA_ID}', pid).replace('{PERSONA}', persona).replace('{LABEL}', label).replace('{PORT}', port).replace('{OUT}', out).replace('{SCREEN}', screen).replace('{MIN}', MIN))
