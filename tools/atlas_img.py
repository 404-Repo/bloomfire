#!/usr/bin/env python3
"""Atlas text to image for BLOOMFIRE. Logs every call to ~/astrocade-game5/atlas_calls.jsonl at the node price
maximum (REST does not report settled cost). Refuses past the game cap (env CAP, default 4000 credits, about what
MOONPULL spent). Never prints or stores the API key.
Usage: python3 tools/atlas_img.py fast|std <out.png> <label> "<prompt>"
  fast = Text to Image (Fast), Gemini 3.1 Flash Lite Image 16:9 1K, max 46 credits  (object references, textures drafts)
  std  = Gemini 3.1 Flash Image 16:9 2K, max 77 credits                            (concept frames, title art)"""
import sys, json, os, time, datetime, urllib.request, hashlib
BASE = "https://api.prod-market.atlas.design"
APIS = {"fast": ("61e0ef8f-3405-4006-9337-c44b3e42dfa4", 46), "std": ("bfbeea76-8673-492e-8401-975940109276", 77)}
LOG = os.path.expanduser("~/astrocade-game5/atlas_calls.jsonl"); CAP = int(os.environ.get("CAP", "4000"))
def spent():
    if not os.path.exists(LOG): return 0
    return sum(json.loads(l).get("credits_max_hold", 0) for l in open(LOG) if l.strip())
kind, out, label, prompt = sys.argv[1:5]; api, maxc = APIS[kind]
if spent() + maxc > CAP: print(json.dumps({"ok": False, "error": f"REFUSED: cap {CAP}, spent {spent()}"})); sys.exit(2)
key = open(os.path.expanduser("~/.claude/atlas_api_key")).read().strip(); H = {"Authorization": "Bearer " + key}
rec = {"utc": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "game": "game5", "what": label,
       "kind": "image-" + kind, "api_id": api, "credits_max_hold": maxc, "prompt": prompt[:600]}
t0 = time.time()
try:
    r = json.loads(urllib.request.urlopen(urllib.request.Request(f"{BASE}/0.2/api_execute/{api}", data=json.dumps({"prompt": prompt}).encode(),
        headers={**H, "Content-Type": "application/json"}, method="POST"), timeout=900).read())
    fid = r["outputs"]["image"]
    d = urllib.request.urlopen(urllib.request.Request(f"{BASE}/0.2/download_binary_result/{fid}", headers=H), timeout=300).read()
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True); open(out, "wb").write(d)
    rec.update(ok=True, result_id=fid, file=os.path.abspath(out), bytes=len(d), sha16=hashlib.sha256(d).hexdigest()[:16])
except Exception as e:
    rec.update(ok=False, error=str(e)[:300])
rec["secs"] = round(time.time() - t0, 1)
open(LOG, "a").write(json.dumps(rec) + "\n")
print(json.dumps({k: v for k, v in rec.items() if k != "prompt"}))
