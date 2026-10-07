# FPS field test on a phone: BLACKSITE, RUST 17, Shards, Guardians

2026-10-07. Field research for BLOOMFIRE (see ../CONCEPT.md).

**Method.** Puppeteer, Chrome headless 'new', `--enable-gpu --ignore-gpu-blocklist`. Viewports 844x390
landscape and 390x844 portrait, DPR 2, isMobile, hasTouch. Every game was started with a real tap and
played with real CDP multi-touch (`Input.dispatchTouchEvent`): finger 1 held the stick while finger 2
dragged to look. A bot played each game for 2 to 3.5 minutes per orientation.
- Scripts: `research/fps_field/_scratch/fight_*.mjs`
- Logs: `_scratch/log_*.txt`
- Raw frames and contact sheets: `_scratch/raw/` and `_scratch/sheet_*.jpg`
- Curated frames: `research/fps_field/<game>/`
- Source: shallow clones in `research/fps_field/src/`, read only

**How to read the tags.** [M] means measured in this session, by telemetry, touch calibration or a
frame. [S] means read from the game's source at the cloned HEAD. [I] means inferred.

**What these numbers cannot tell you**
- GPU was `ANGLE Metal Renderer: Apple M4` on a desktop. Every game held 60 fps there, so the fps
  figures say nothing about a real phone. Draw and triangle counts are the useful load figures.
- "Time to first kill" comes from a bot that knows exactly where the enemy is. For BLACKSITE it read
  `player.yaw`, exposed read-only by a script patch. For RUST 17 it read `__GAME__.aimDrag`. Treat it
  as a lower bound. A thumb is slower, and that gap is exactly what aim assist has to close.
- "Thumbs only" means at most one finger on each side. The right thumb either looks or presses FIRE.
  It never does both unless the game lets FIRE double as a look pad.
- Guardians is a flying-boat sim and Shards is a third-person ARPG. They are in this test for their
  touch, aim-assist and auto-fire patterns, not as FPS peers.

---

## PROJECT BLACKSITE (dairus01.github.io/blacksite)

Military campaign FPS, procedural Three.js. Source: `game/src/input.js` and `main.js`.

| item | value |
|---|---|
| start | DEPLOY tap goes straight into the mission. Enemies were 4 m away at 3 s [M] |
| stick | fixed, 94 px landscape / 124 px portrait. Throw = 0.36 x width, so 34 px / 45 px [M][S] |
| look | right pad, x≥321 landscape (523 px wide) / x≥148 portrait [M] |
| look sens | **0.00294 rad/px** with stick held, matching source 1.25 x 0.00235. ADS gives 0.00181 [M][S] |
| stick + look | work together [M] |
| fire | button, 72 px landscape / 78 px portrait. Does not feed look, so the thumb lifts to fire [M][S] |
| buttons | **16** on screen (FIRE, AIM, RLD, JUMP, SWAP, RUN, LOW, USE, FRAG, HEAL, SMOKE, PLATE, MAP, MENU and others) [M] |
| aim assist | only while ADS on a coarse pointer. Cone dot > 0.998 (**3.6°**); yaw lerps 0.15 per frame toward target; needs line of sight [S] |
| auto-fire | none [S] |
| fov (vertical) | 72 landscape (≈115° horizontal), 86 portrait (≈47° horizontal). ADS 54 / 67 [S] |
| first kill | 1.3 s landscape, 2.8 s portrait (bot). 6/6 patrol kills in about 45 s; 12 hits from 49 shots (24%) [M] |
| screen tells you | objective card, waypoint diamond with metres, minimap, "HOSTILE DOWN +100", radio subtitles [M] |
| load | 100 to 450 draws, 17k to 45k tris [M] |

**Bugs [M]**
- In landscape the minimap sits over the ammo counter and the MAP button.
- The AIM button is hidden under LOW.
- The "GROUND / 11m TO OBJECTIVE" text runs under the SWAP and USE buttons (frame L1_kill).
- A keyboard prompt, "E TO ACCESS", shows on a phone.
- There is no auto-reload. In the first run, shots stopped at 30 until RLD was tapped.

## RUST 17 (404-repo.github.io/rust17/game, ours)

Team deathmatch in a desert oilfield. Source: `game/src/ui/touch.js` and `player/controller.js`.

| item | value |
|---|---|
| stick | floating, anywhere in the left 45% below 26% of the height. Throw 40 px, base 108 px, knob 46 px [S][M] |
| look | right 55%. A short tap (under 14 px, under 260 ms) fires [S] |
| look sens | **0.00667 rad/px** (150 px per radian) [M][S] |
| stick + look | work together; the stick also auto-sprints after 330 ms at full forward [M][S] |
| fire | 98 px button that **also feeds look while dragged**, so one thumb aims and fires [S][M] |
| buttons | 7: FIRE, ADS, JUMP, CROUCH, RELOAD, SWAP, NADE [M] |
| aim assist / auto-fire | none [S] |
| fov (vertical) | 74 in both orientations: ≈117° horizontal landscape, **≈38° horizontal portrait**. ADS 55 for the AR [S] |
| contact | first visible hostile at **112 to 118 m**, about 5 px tall on a 390 px screen [M][I] |
| kills (bot) | landscape: 1 kill in about 150 s in one run, 0 in two others; portrait: 1 kill at 119 s. Killed once at 141 s [M] |
| screen tells you | team score, timer, compass, kill feed, HEADSHOT callout, red damage vignette [M] |
| load | 60 to 1010 draws, 58k to **1.73M** tris on the "phone" quality tier [M] |

**Bugs [M]**
- In portrait, RELOAD and SWAP (x 126 to 184) sit on top of the stick pad (x 0 to 176).
- Reserve ammo ran out ("30 0") with no resupply seen.
- Holding FIRE as the look thumb spent all 180 rounds in 33 s in an early run.

## Shards of the Blighted March (third-person ARPG)

Source: `game/src/input.js` and `combat-targeting.js`.

| item | value |
|---|---|
| stick | fixed, 90 px landscape / 104 px portrait. Throw = 0.34 x width, so 31 px / 35 px [M][S] |
| camera | drag the world to orbit at **0.009 rad/px**. Works while the stick is held [M] |
| attack | hold ATTACK (62 px). **Auto-target:** nearest living enemy within weapon range (at least 4.2 m), clear path, any direction [S] |
| contact / first kill | 6.5 s / **13.6 s** landscape; 7.7 s / 15.3 s portrait [M] |
| kills | 8 in 150 s landscape, 2 in 120 s portrait. Early hit rate 25 hits from 31 swings (81%) [M] |
| HUD | bottom bar is 116 of 390 px, **30% of a landscape screen**, plus a row of 5 top buttons [M] |
| load | 180 to 460 draws, 280k to 660k tris [M] |

**Bugs [M]**
- Holding ATTACK drains stamina to 0. Each swing costs stamina (`combat-model.js:75`), so swings stop
  and the screen shows "Not enough stamina". It stayed stuck there for over 60 s with an enemy 1 to 2 m
  away (frame L5).
- The start route runs into town fences and buildings. Steering in a straight line got stuck until I
  added waypoints.

## Guardians of the Rock (flying-boat sim, 1941)

Source: `src/touch.js` and `main.js`.

| item | value |
|---|---|
| stick | 110 px landscape / 128 px portrait. Rate control (pitch and roll); the same stick aims a manned gun [M][S] |
| buttons | 6 (FIRE, DROP, REPORT, DEPTH, VIEW, press-on) at 48 to 52 px, plus a throttle lever [M] |
| auto-fire | **automated crew gunners** fire at hostiles in their arc within 650 to 700 m with an 8 m lead, call it on the intercom and show a picture-in-picture window [S][M] |
| result | sine-wave stick input crashed the plane in about 15 s ("hit the water too hard"). The manned nose gun drifted to the sky under a rate stick. Practice targets were 2.5 to 28 nm away, so no kill in 200 s [M] |
| load | 100 to 1100 draws, 0.48M to 1.45M tris [M] |

---

## What a phone FPS must do (rules for BLOOMFIRE)

1. **Look sensitivity about 0.004 rad/px at hip fov, scaled by fov/hipFov when zoomed.**
   - BLACKSITE at 0.0029 needed about 540 px for a 90° turn, more than the whole look pad [M].
   - RUST 17 at 0.0067 turns 90° in 235 px but overshoots small targets [M][I].
   - A 300 px thumb sweep should turn about 70° [I].
   - Use no acceleration curve: a linear delta per px was the only behaviour the bot could hold [I].

2. **Floating stick in the left 40 to 45% of the screen: base at least 108 px, throw 40 px, auto-sprint
   after 330 ms at full forward.**
   - Copy RUST 17 [S].
   - BLACKSITE's fixed 94 px stick with a 34 px throw is the small end of what worked [M].
   - Stick plus look-drag at the same time worked in all four games through real multi-touch [M].
   - Route every finger by its touch identifier from the element it started on (RUST 17 pattern) [S].

3. **Auto-fire when the reticle is on a target.**
   - Fire after 0.12 s of reticle overlap, inside a **3° cone** out to effective range (25 m) [I].
   - The cone is taken from BLACKSITE's 3.6° ADS cone (dot 0.998) [S].
   - Without auto-fire the right thumb has to choose between looking and shooting. BLACKSITE forces a
     lift [M]. RUST 17 fixes this by making FIRE drag-to-look, but then fires the whole time you aim
     and ran dry in 33 s [M].
   - Keep a 96 px FIRE-plus-look button for players who want manual fire [S].

4. **Aim assist always on for touch, never gated behind ADS.**
   - Inside a 6° cone, cut sensitivity to 0.5x [I].
   - Inside 3.6°, pull yaw toward the target at no more than 0.15 per frame at 60 fps (BLACKSITE's
     value [S]).
   - Use line-of-sight checks.
   - Shards shows the far end of the scale: full 360° auto-target gave an 81% hit rate and a first kill
     in 13.6 s [M].
   - RUST 17 has no assist. A perfect-aim bot got 0 to 1 kills in 2.5 minutes [M].

5. **FOV: landscape vertical 68 to 72° (about 110 to 115° horizontal); portrait vertical 88 to 92°
   (about 48 to 52° horizontal).**
   - Do not keep one vertical fov for both orientations. RUST 17's 74° gives only **38° horizontal in
     portrait** [S][I].
   - BLACKSITE's 72 / 86 split is the right shape [S].
   - Treat landscape as primary [I].

6. **Fight close and fast: first contact within 3 s of control, at 8 to 25 m, with every enemy at least
   25 px tall on a 390 px-tall screen.**
   - At a vertical fov of 70°, a 1.8 m enemy is 25 px tall at 20 m and 42 px at 12 m [I].
   - BLACKSITE: contact at 4 m by 3 s, first kill in 1.3 to 2.8 s [M].
   - RUST 17: contact at 112 to 118 m, where the enemy is about 5 px tall. One kill took about 2 minutes [M].

7. **No more than 5 combat controls: stick, look pad, FIRE (auto-fire backup), DASH, BLOOM. Plus a 44 px
   pause button in a corner.**
   - Every button at least 60 px; FIRE and BLOOM at least 90 px [I].
   - BLACKSITE's 16 buttons overlap in both orientations [M].
   - Gate the build on a bounding-box overlap check in both orientations: RUST 17 portrait has
     RELOAD/SWAP sitting on the stick pad [M].

8. **HUD no more than 10% of the screen. Leave the centre 60% clear. Put no keyboard hints on touch.**
   - Shards' bar takes 30% of landscape [M].
   - BLACKSITE's minimap covers its ammo count, and it shows "E TO ACCESS" on a phone [M].
   - Feedback that worked in frames: a kill text at reticle height (BLACKSITE "HOSTILE DOWN +100", RUST 17
     "HEADSHOT"), a waypoint diamond with metres, and a red damage vignette [M].

9. **No resource lock-outs.**
   - No manual reload.
   - Holding fire or attack must never drain into a dead state.
   - BLACKSITE stalled until RLD was tapped [M]. RUST 17 ran out of reserve ammo [M]. Shards' held
     ATTACK sat at 0 stamina for over 60 s next to an enemy [M].
   - BLOOMFIRE's "about 9 a second, no reload" is right. Keep it [I].

10. **Keep the load at or under 300 draws and 500k tris, and publish `__GAME__`
    {draws, tris, fps, kills, yaw, pitch, aimDrag} so every gate can aim and measure.**
    - BLACKSITE ran at 100 to 450 draws and 17k to 45k tris [M].
    - RUST 17 peaked at 1010 draws and 1.73M tris even on its "phone" tier [M].
    - RUST 17's `aimDrag` telemetry let the bot aim exactly. BLACKSITE needed a script patch to read yaw [M].
    - Never use a rate-controlled stick for aim. Guardians' rate stick crashed the plane in 15 s and
      drifted its gun into the sky [M].

## Still missing

- **Real phone hardware.** No fps, thermal or Safari test was run. One run on an iPhone or a mid-range
  Android in each orientation would change rules 5 and 10 most.
- **Human thumbs.** Bot aim is a lower bound. One human time-to-first-kill per game would calibrate
  rules 1, 3 and 4.
- **Guardians and Shards are not FPS.** Their numbers inform assist and auto-fire, not look feel.
- **BLACKSITE beyond level 1.** The bot reached extraction but got stuck on a wall, so later levels and
  modes were not played.
