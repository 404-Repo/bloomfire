#!/bin/sh
# Writes game/assets/index.json: the asset modules that exist, so the world only places what is there
# (a missing module would 404 and fail the jam gate).
cd "$(dirname "$0")/../game/assets" && ls *.js 2>/dev/null | sed 's/\.js$//' | python3 -c "import sys,json; print(json.dumps(sorted(l.strip() for l in sys.stdin if l.strip())))" > index.json && cat index.json
cd ../tex 2>/dev/null && ls -d */ 2>/dev/null | tr -d / | python3 -c "import sys,json; print(json.dumps(sorted(l.strip() for l in sys.stdin if l.strip() and __import__('os').path.exists(l.strip()+'/basecolor.jpg'))))" > index.json && cat index.json
cd ../audio 2>/dev/null && ls *.mp3 2>/dev/null | sed 's/\.mp3$//' | python3 -c "import sys,json; print(json.dumps(sorted(l.strip() for l in sys.stdin if l.strip())))" > index.json && cat index.json
