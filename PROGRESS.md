# BLOOMFIRE progress

Lead: Claude (Opus 5.5) as a jam entrant, running GAME.md's prompt from ~/404-game-recipe @ 4effad3 verbatim
as operating instructions, with the jam rules (/tmp/jamrepo_chk/README.md). Repo: ~/astrocade-game5.
Serve: :8797. Images: Atlas via tools/atlas_img.py, every call logged in atlas_calls.jsonl (cap 4,000
credits, about what MOONPULL spent).

## Milestone 1: concept and scope chosen (2026-10-07)

**BLOOMFIRE**, a phone-first first-person shooter. Ink has drowned the valley of Vell; you carry a
prism rifle that fires sunlight, and **every kill bursts colour back into the world around it**.
Five inkwells to destroy (four in any order), a gauntlet up the Pilgrim Stair, Old Inkhorn at the
Sun Chapel, and the whole valley floods with colour. Full pitch: `CONCEPT.md`. Style lock:
`STYLE_LOCK.md`.

Why this concept (reasons, not taste):
- **Ben asked for action, and MOONPULL lost on stickiness.** Its testers chose the games with "small
  wins every few seconds and a score to beat" (judge_final/REPORT.md). Here the kill is the reward
  and it is visible in the world; combo, score, a best score and "% of the valley restored" are part
  of the verb, not bolted on.
- **"What nobody else tried" is 20 of 100.** Bellkeeper carries wind, Farseek steers light,
  SUNDRIFT turns drifts into time of day, MOONPULL moves the sea. Repainting the world with combat
  appears in none of the 25 entry files.
- **Expansive and authored**, the thing Ben liked in the winners: one valley about 460 x 520 m,
  eight named places with jobs, the goal (five ink plumes) visible from the first hilltop.
- **Our two FPS lessons are built into the premise.** The Roman FPS lost 0/6 for lack of a second
  colour temperature; here every fight boundary is cold ink wash against warm painted sun. RUST 17's
  lever was surface material; restored ground gets Atlas PATINA textures.
- **A committed art direction** (MOONPULL's last four critic rounds were lost to SUNDRIFT's single
  look): an ink drawing being coloured in, with outlines that fade where colour returns.

Scope: eight places (Lampwright's Rise, Olive Terraces, Millbrook, Vell Market, Windmill Ridge,
Chalk Quarry, Pilgrim Stair, Sun Chapel), six ink enemy kinds plus inkwells and a boss, five
rifle lenses, BLOOM ultimate, dash, combo, checkpoint lanterns, title, end card with score and
restoration map. Fallback if time runs short: the Quarry folds into the Ridge, the Stair shortens.

Running in parallel (3 agents): the floor (one agent, one pass, no loop, `floor/`), concept frames
plus claims plus object references from Atlas (`ref/`), and FPS field research on a phone viewport
(Blacksite, Guardians of the Rock, Shards, RUST 17; `research/`). I am building the engine.

## Milestone 2: first playable vertical slice on :8797 (2026-10-07)

Serving at **http://localhost:8797/** (`python3 -m http.server 8797` in `game/`, always the working tree).
The loop works end to end: title, a real tap to start, the Rise, a tutorial pack, the Olive Terraces
inkwell (wave, nodes open, break a node, next wave, three nodes, the place floods with colour, a lens),
then the four-way branch. Every kill paints the ground and walls around it, flowers spring up, motes fly
home, the combo climbs.

**Measured with my own gate** (`tools/fpsgate.mjs`: real multi-touch through CDP, left thumb on the stick
steering to the objective, right thumb dragging the look in small steps toward the ink that `__GAME__`
says is nearest, a third finger tapping BLOOM and DASH; asserts moved, fired, killed, painted, budgets):

| run | time | kills | shots | inkwells | restored | deaths | peak draws / tris | verdict |
|---|---|---|---|---|---|---|---|---|
| landscape 844x390 | 240 s | 136 | 612 | 2 of 5 | 8.6% | 0 | 483 / 0.94 M | PASS |
| portrait 390x844 | 90 s | 27 | 39 | 0 | 0.1% | 0 | 407 / 0.80 M | PASS |

A kill every 1.8 s in the landscape run; the bot used BLOOM 3 times. GPU string: ANGLE Metal, Apple M4,
headless. The frame rate the gate reads (60) is a desktop GPU, not a phone. Frames: `work/gate/m2_land/`.

**Built so far**
- Assets through the 404 loop (3 candidates each, verify sheet, picked by eye, loader regression 100%
  triangle retention): 14 structures, 8 creatures and the rifle, 15 props and plants = 37 modules.
  Picks and reasons: `receipts/candidates/PICKS_*.md`.
- Atlas: 6 concept frames, 13 object reference sheets, a sky panorama, 8 PATINA ground and wall materials,
  4 music cues. Ledger: `atlas_calls.jsonl` (PATINA cost is an estimate; the API does not report it).
- Engine: one authored height function for a 640 m valley, eight places, paths carved to smoothed
  profiles, river and lake; a 512x512 paint mask every lit material reads (ink wash driven by light, pen
  hatching on walls, stipple on ground, outlines in a post pass that fade where colour returns, a warm
  glow on the frontier); triplanar PATINA detail on walls and ground.
- Fight: hitscan sunlight, auto-fire on touch when the reticle is within 5.5 degrees of ink, aim assist
  (friction plus pull), bullet magnetism, combo x1 to x8 with called tiers, multi, long, core and dash
  bonuses, BLOOM, DASH, five lenses, five ink kinds with telegraphed attacks, inkwells whose nodes are
  sealed while a wave lives.

**Honest gaps at this point**
- A sub-agent (the structures asset agent) spawned four helpers of its own, which broke the "3 agents
  at once" rule for about ten minutes. Later agents are told not to.
- The rifle reads as a crude brass box with a white block for a prism; tracers draw as wide white wedges
  near the muzzle; enemies up close are flat black with little face.
- The boss, finale and end card exist in code but no gate has reached them yet.
- No critic round yet; no human has played it; nobody has listened to the music (the Atlas service
  returned 17 to 26 s cues for 70 to 80 s requests, so they loop short).
