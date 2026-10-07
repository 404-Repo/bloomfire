#!/bin/bash
# Start one blind session harness: panel/start.sh <game key in games.json> <port> <session dir>
# Prints only the port, never the URL, so the orchestrator can hand the tester nothing but the port.
H=$(cd "$(dirname "$0")" && pwd)
read url w h assist min < <(python3 -c "import json,os; g=json.load(open('$H/games.json'))['$1']; print(g['url'], g['w'], g['h'], g.get('assist','-'), g.get('min', os.environ.get('PANEL_MIN','180')))")
AS=""; [ "$assist" != "-" ] && AS="--assist=$assist"
mkdir -p "$3"
nohup node "$H/harness.mjs" --url="$url" --out="$3" --port="$2" --w="$w" --h="$h" --min="$min" $AS > "$3/harness.out" 2>&1 &
for i in $(seq 1 120); do grep -q "harness on" "$3/harness.out" 2>/dev/null && { echo "ready on port $2"; exit 0; }; sleep 1; done
echo "harness did not start"; exit 1
