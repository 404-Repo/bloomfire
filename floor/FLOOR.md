# BLOOMFIRE floor

One agent, one pass, no loop, no critic, no rounds, no candidate picking. It is the low mark.

**Time:** about 10 minutes wall clock (16:39 to 16:49 CEST, 7 Oct 2026), well under the 60 to 90
budget, so this floor is if anything weaker than a typical one.

## What was built

- `game/index.html` + `game/main.js` (one file, ~480 lines). three@0.169.0 from jsdelivr, import map.
- 11 assets in `game/assets/`, one attempt each, no verify run: olive_tree, cypress, village_house,
  terrace_wall, windmill, lamp_post, inkwell, blotling, smear, prism_rifle, flower_clump.
  Loaded through `ASSET()` from the copied `assetlib.js`; lit by the copied `rig.js` (hour 16.8).
- Valley: one heightmapped terrain 560 x 640 m with the Rise, terrace slope, Windmill Ridge, quarry
  hill and pit, market mound, river and north mountain. Props at the Rise, Terraces, Millbrook,
  Market, Ridge and Quarry, plus scatter.
- The mechanic: terrain is vertex-coloured ink; a kill repaints vertices in a radius, flips nearby
  props from ink materials to their true materials, and spawns instanced flowers. % restored on HUD.
- Fight: hitscan at 9/s, auto-fire when the reticle is on a target, gentle aim assist, Blotlings
  and Smears, 5 inkwells (60 HP, spawn waves inside 75 m), combo x1 to x8, long-shot bonus, DASH
  (2 charges, dash kills), BLOOM nova, heal on kill, respawn at last cleansed well with 10% score
  loss, best score in localStorage, win card after 5 wells.
- Contract: `__READY__`, `#startb` (started by a real touch tap), `#stick` (up = forward),
  `__GAME__` {pos, fps, speed, score, over, draws, tris, hp, shots, kills}. Desktop WASD + mouse.

## Frames

`_frames/f1.png` to `f6.png`, 844x390, touch emulation (so the rig picked its `phone` tier: no post,
1 shadow cascade). Driver: stick held forward the whole time, real right-side drags steer toward
the nearest inkwell, firing is the game's own auto-fire. Script: `_scratch/capture.mjs`.

| frame | draws | tris | fps | kills | score | wells |
|---|---|---|---|---|---|---|
| f1 | 317 | 179,284 | 60 | 2 | 250 | 0 |
| f2 | 306 | 181,268 | 60 | 6 | 2,150 | 0 |
| f3 | 261 | 169,976 | 60 | 6 | 2,150 | 0 |
| f4 | 222 | 169,784 | 60 | 11 | 4,450 | 1 |
| f5 | 205 | 164,668 | 60 | 11 | 4,450 | 1 |
| f6 | 202 | 167,270 | 60 | 14 | 5,200 | 1 |

GPU: `ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)`, headless Chrome. The fps is
a desktop M4 at the rAF cap, not a phone measurement.

## What is missing

- No Pilgrim Stair, no Sun Chapel, no Old Inkhorn boss; no story cards; no end-card map.
- Only 2 of 7 enemy kinds (no Spitters, Quills, Inkhorns); enemies are rigid and only bob.
- No lenses, no lanterns as objects, no music layers, no grey creep-back; audio is beeps.
- No mill, bridges, market stalls, clock tower, quarry cranes; windmill sails are static.
- No ink outlines or paper-grain shader; the ink look is a desaturated material swap.
- Player collision is circles only and ignores tree canopies; the rifle reads as a box with a
  white prism; enemies are small and hard to read at range.
- Not tested in portrait (390x844) or on a real phone; no asset verify run.
- Port note: 8811 was already held by another process (`node platform/server/index.mjs`, 6 days
  old), so this was served on 8813 and that server was left alone.
