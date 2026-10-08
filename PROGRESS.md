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

## Milestone 3: content complete (2026-10-07)

The whole game exists and plays from the title to the end card. Serving at **http://localhost:8797/**.

**Content**
- Eight places, each dressed and announced on arrival: Lampwright's Rise, the Olive Terraces, Millbrook,
  Vell Market, Windmill Ridge, the Chalk Quarry, the Pilgrim Stair, the Sun Chapel.
- Five inkwells, each a three-node fight (a wave seals the nodes, clear it, break a node, the next wave
  comes), the first one taught, the next four in any order. Each one floods its place with colour, lights
  its lantern (checkpoint) and gives a rifle lens: Split, Arc, Burst, Rapid, Sun.
- Eight optional ink nests off the roads (one node, a pack, a burst of colour, 1,500 points): the reason to
  explore and the "nests x of 8" line on the end card.
- Old Inkhorn at the summit: slam rings you dash through, a roar that opens the chest core (the only real
  damage window), lobbed ink from phase 2, summons, a charge in phase 3. Then the finale: the whole valley
  floods with colour, and an end card with score, time, kills, best chain, nests, the restored percentage,
  a map of what you painted, and a best score kept on the device.
- Five ink kinds (Blotling, Smear, Spitter, Quill, Inkhorn), with telegraphs, glowing cores worth double,
  and a fairness rule: ink outside your view waits before it strikes.
- A director that sends packs to meet you in grey country, scaled by how many inkwells you have broken.
- Title slideshow from three Atlas story paintings, story captions, tutorial captions, a gold waypoint with
  distance, compass, damage arcs, combo tiers, pause menu with sound, aim assist and look speed.
- 4 Atlas music cues (calm, fight, boss, finale) and synthesised effects whose kill note rises with the combo.
- 37 asset modules through the 404 loop plus the rebuilt rifle; Atlas spend so far 2,066 credits (ledger;
  PATINA counted at an estimate).

**Measured: the whole campaign by my gate in one run** (real multi-touch, 844x390, `work/gate/full2/`):
title to end card in **1,471 s (24.5 min)**, 797 kills, 5 of 5 inkwells, the boss, the end card;
2 deaths; 29 BLOOMs; peak 642 draws and 1.01 M triangles (jam caps 900 and 1.5 M). The bot walks straight
lines and fights everything it meets, so a human's time will differ; unmeasured.

**Critic rounds so far** (fresh harsh critic each, blind pairs, keys withheld until verdicts were written):

| round | vs podium | vs floor | vs concept bar | first property named |
|---|---|---|---|---|
| 1 | 2 of 8 | 6 of 6 | 0 of 6 | ink linework on everything |
| 2 | 3 of 8 (all slight) | 6 of 6 | 0 of 6 | bare shaded slopes fill 40 to 60% of frame |

After round 1: crease outlines from reconstructed normals, indigo rim-lit ink, path-side dressing, the
rifle rebuilt. After round 2: texture edges drawn as pen strokes on the ink side, a near-field ring of
grass and stones that follows you, core glows, warmer paper, ridge rows.

**First blind tester session** (s01, casual persona, BLOOMFIRE first, then SUNDRIFT, 540 s each):
SUNDRIFT won keep-playing (decisive) and better-made (clear). BLOOMFIRE scored looks 8, fun 4: the tester
died in the first minute to attackers it could not see, could not find the gold mark, and saw little hit
feedback. Fixed since (on the working tree, not yet re-tested): ink outside your view waits before it
strikes, regeneration out of combat, a world-space waypoint, a hit flash on the core glow, a wider touch
assist (lock 11 degrees, auto-fire 9, magnetism 7), a softer first tier, a smaller death penalty.

## Milestone 4: jam gate PASS and blind comparison against the winners (2026-10-07)

Final build: commit **76a9279** (main). Serving at **http://localhost:8797/**; a cloudflared quick tunnel
to it is running for phone play (URL in `work/tunnel.log`; ephemeral). No GitHub repo was created.

### Jam gate (recipe @ 4effad3, 390x844 @3x, real touch, 4G, CPU 2x slower)

| | tunnel | localhost:8797 |
|---|---|---|
| ready | 8.7 s (budget 20) | 8.2 s |
| weight | 5.5 MB (budget 10) | 5.5 MB |
| started / moved | real tap / 38.6 m | real tap / 38.6 m |
| peak draws / tris | 464 / 852,690 | 463 / 852,738 |
| errors / 404s / outside folder | 0 / 0 / none | 0 / 0 / none |
| RESULT | **PASS** | **PASS** |

Verdict blocks: `work/jam_verdict_final_tunnel.txt`, `work/jam_verdict_final_local.txt`. `harness/ship.mjs`:
56 modules parse, no path leaves the folder. `harness/live.mjs` on the tunnel: ready 4.4 s, moved 28.8 m.
The 60 fps the gate prints is an M4's Metal GPU, not a phone.

### Blind look critic, five rounds (fresh harsh critic each; keys moved out before judging)

| round | vs podium frames | vs floor | vs concept bar | what decided the losses |
|---|---|---|---|---|
| 1 | 2 of 8 | 6 of 6 | 0 of 6 | ink linework missing |
| 2 | 3 of 8 (all slight) | 6 of 6 | 0 of 6 | bare shaded slopes |
| 3 | 1 of 8 | 6 of 6 | 0 of 6 | hazy grey under a white sky (my round-2 tweak thinned the lines; reverted) |
| 4 | 2 of 8 | 6 of 6 | 0 of 6 | grey areas read as unrendered |
| 5 | 1 of 8 | 6 of 6 | 0 of 6 | palette unity: the grey half against fully coloured games |

Every claim measure moved the right way from round 4 to 5 (warm share of highlights 0.48 to 0.57, ink-line
coverage 4.3% to 6.1%, near-field density 0.28 to 0.40) and the podium count did not. The round-5 critic
called the remaining gap **mostly the subject, not execution**: the game starts grey by design, and
every early-play frame is half grey; its only podium wins are frames that are coloured edge to edge. Two
critics in a row named the same structural cause, so by GAME.md's stopping rule I stopped look rounds
there. Caveats: the pairs are not truly blind (ours are landscape with an FPS HUD, the podium set is
portrait), and 8 pairs is coarse.

### Blind head-to-head play, 8 sessions (fresh Sonnet testers, MOONPULL's panel harness)

Each tester played two games blind ("Game A", "Game B") for at least 540 s each on an emulated phone with
real multi-touch on a virtual clock, then made a forced choice. BLOOMFIRE was served from frozen worktree
snapshots so later edits could not leak into a session.

| # | persona | opponent | BF played | build | keep playing | better made |
|---|---|---|---|---|---|---|
| s01 | casual | SUNDRIFT | 1st | cea98c0 | SUNDRIFT decisive | SUNDRIFT clear |
| s02 | competitive | SUNDRIFT | 2nd | cea98c0 | **BLOOMFIRE clear** | **BLOOMFIRE clear** |
| s03 | casual | SUNDRIFT | 2nd | b5e4bce | **BLOOMFIRE slight** | SUNDRIFT slight |
| s04 | casual | Bellkeeper | 2nd | b5e4bce | **BLOOMFIRE clear** | **BLOOMFIRE slight** |
| s05 | indie | Farseek | 1st | b5e4bce | Farseek clear | **BLOOMFIRE slight** |
| s06 | competitive | SUNDRIFT | 1st | bebb10c | SUNDRIFT slight | SUNDRIFT clear |
| s07 | casual | Farseek | 1st | bebb10c | **BLOOMFIRE clear** | Farseek slight |
| s08 | indie | Bellkeeper | 2nd | bebb10c | **BLOOMFIRE clear** | **BLOOMFIRE clear** |

- **Keep playing: BLOOMFIRE 5 of 8** (vs Bellkeeper 2 of 2, vs Farseek 1 of 2, vs SUNDRIFT 2 of 4).
- **Better made: BLOOMFIRE 4 of 8** (vs Bellkeeper 2 of 2, vs Farseek 1 of 2, vs SUNDRIFT 1 of 4).
- For comparison, MOONPULL's panel had it at 6 of 9 on keep-playing but 0 of 2 against the sticky score game;
  here the score-loop rival (SUNDRIFT) is split 2 to 2.
- **Order effect, unbalanced:** BLOOMFIRE won keep-playing in 4 of 4 sessions where it was played second
  and 1 of 4 where it was played first. Treat the totals as soft.
- What testers praised (their words): "something happening every few seconds", "the grey valley flooding to
  colour", the BLOOM crowd-clear, "a score to chase within 35 seconds", "stay on painted ground changed how I
  moved", punchy layered kill audio (from s03 on).
- What they held against it, and what I changed between sessions: deaths to attackers they could not see
  (fairness rule, damage arcs, off-screen threat chevrons, softer bites, regeneration), hard to find the goal
  (a gold waypoint with distance, then routing it along the Pilgrim Stair), thin hit and gun sound (rebuilt),
  long walks (packs come sooner, respawn at most 40 m back), "same loop at minute nine" from the indie
  persona (a choice of two lenses at every inkwell; colour heals you and slows the ink), camera clipping and
  black frames from ink at point blank and tree canopies (ink holds at arm's length, bigger tree colliders).
  The last three of those changes (threat chevrons, stair routing, the endless-nest fix) landed after the
  last session and are not tester-verified.
- Harness caveats: Bellkeeper's movement assist hung twice in s08 and its phone was restarted (it cost that
  tester time on Bellkeeper, not play time); in s04 the same assist hung once. Testers see a frame every
  0.5 s, so aiming and every "could not see what hit me" are worse for them than for a thumb.

### Whole game, final build, my gate

One run of 76a9279 from the title to the end card with real touch: **1,638 s**, 441 kills, 5 of 5 inkwells,
4 lens picks, the boss, the end card; 1 death; peak 547 draws and 1.16 M triangles (`work/gate/final8/`).
That time is inflated by the bot, not the game: it stood at the foot of the first inkwell staring up past
its look limit for about 15 minutes (the same inkwell took it 65 s and 101 s in two separate runs on the
same build). Inkwells 2 to 5 took it 302 s, and the climb plus the boss 90 s.

Late fixes found by those long bot runs (after the last tester session, so not tester-verified): the
Pilgrim Stair rebuilt as a spiral ramp (the switchbacks left cliffs between legs), the boss rises on the
far side of the arena instead of on top of you, two arcades in Vell Market moved off the roads they were
blocking, nests spawn once instead of forever, inkwell trickles no longer re-seal the nodes, trees stop
players but not shots, and the last climb is quiet.

### What is measured, what is not

Measured: the jam gate (on the final commit, tunnel and local), the whole campaign end to end by my real-touch gate (completed on the final commit and on an earlier one; several other long runs stalled on bot navigation and exposed the fixes above),
eight blind tester sessions, five blind critic rounds, draw and triangle peaks under every route.
Not measured: a real phone (frame rate, heat, iOS audio, the notch), a human first play and its length,
whether a human dies as often as the testers did, whether the music loops sound good (nobody has listened;
the cues are 17 to 26 s), and the final build's changes with testers.

### What I would do next

1. Put it in Ben's hands on a phone through the tunnel: the real questions now are feel and difficulty.
2. Start the valley less grey: let each place keep a little colour (lanterns, doors, flowers) so early frames
   are not half grey. That is the one lever the critic says would move the look comparison.
3. Re-run 4 tester sessions on the final build with the order balanced (BLOOMFIRE first in two, second in two).
4. Longer music cues (ask for 3 x 25 s and stitch), and a phone performance pass if frames drop.
