# PLAYER PANEL

Fresh tester agents, each with a player persona, play a REAL build blind on an emulated phone and rate it. The panel
is meant to replace Ben's hands-on fun verdict (STUDIO_PIPELINE.md, P6 and the PLAYER PANEL section). It is only
trusted for the uses its calibration supports: see "Calibration" and "What the panel can and cannot be used for".

**Calibration result: FAIL** (2026-10-03, four rounds: 52 blind sessions in r1 to r3, a 2-session Opus pilot, and
12 sessions in r4, the cross-game nuance re-run with a movement assist). The panel reproduces Ben's verdicts on our
own TOWLINE builds (look build clearly below the fun build, "slow" and "no music" on the look build, RILL level with
the fun build) in every round. It does NOT reproduce "the jam winners are above the fun build on nuance". In r1 to r3
that was because testers never got past the opening of the two 3D adventures. In r4 the movement assist fixed that
(Bellkeeper nuance 1.4 pooled before, 5.7 after; Farseek 3.8 before, 6.3 after), but the winners still only tie the
fun build on average (5.8 vs 5.7, check needs +1.0): Bellkeeper ties it, SUNDRIFT sits below it, Farseek is above.
The remaining gap is a disagreement on the fun build, which testers credit with a real towing risk and reward
(nuance 5 to 6), not "basic 101". Do not use the panel as a nuance gate against the jam field. See "What the panel
can and cannot be used for".

## How to run it

Needs: node 25, puppeteer from `~/404-game-recipe/node_modules` (imported by absolute path, nothing to install),
python3 with PIL. Check `df -h ~` first; a 300 s session writes about 10 to 15 MB of screenshots.

1. Serve the build. Local builds: `node panel/serve.mjs <game dir> <port>`. An old commit: `git worktree add
   --detach <scratch dir> <commit>` and serve `<scratch dir>/game` (never touch the main checkout or ports 8741/8748).
2. Add the game to `panel/games.json` (url, starting phone size: 390x844 portrait or 844x390 landscape).
3. Start the harnesses and write the prompts:
   `PANEL_MIN=300 python3 panel/batch.py <run dir> <key file OUTSIDE the run dir> <first port> casual,competitive,indie [game,game]`
   It starts one harness per (persona, game), picks a random label ("Game E"), writes `<run dir>/prompts/sNN.txt`
   and the private key (session to game). Testers only ever get their prompt file and a port.
4. Spawn one fresh sub-agent per session (we used Sonnet, general-purpose) with: "Read <run dir>/prompts/sNN.txt and
   follow it exactly". Run AT MOST 6 at a time: the account's sub-agent limit (20) is shared with the studio's
   builders, which have priority. Start the next session when one finishes. (r1 to r3 ran 18 at once; game time is
   virtual, so a busy machine slows the run but does not change what the tester sees.)
   Games with `"assist"` in games.json get the movement assist and the ASSIST block in their prompt; `"min"` sets
   their session minimum (Bellkeeper and Farseek: 600 s).
5. Score: `python3 panel/aggregate.py <key file> <run dir> [--md] [--nuance-only]`. It prints per-game means, per-session rows and
   the calibration checks. Stop the harnesses with `curl localhost:<port>/quit` (or kill -9 the node processes; each
   harness also kills its Chrome on SIGTERM).

Cost and time (measured on this calibration, Sonnet testers): one 180 s session took 140 to 345 tool calls, 170k to
310k sub-agent tokens and 9 to 21 minutes; a 300 s session took 195 to 650 tool calls, 240k to 490k tokens and 19 to
37 minutes. A 3-persona x 6-game round is 18 sessions. With the movement assist (r4, `results/r4/cost.json`): a
600 s assisted session took 362k to 725k tokens (mean 488k), 432 to 1,057 tool calls and 28 to 57 minutes (mean 44);
a 300 s unassisted session took 301k to 441k tokens (mean 351k), 232 to 591 tool calls and 12 to 32 minutes (mean 19).
The 12-session r4 run used 5.03M sub-agent tokens.

## The harness

`panel/harness.mjs` (one per session) drives Chrome (puppeteer, `headless: 'new'`, Metal ANGLE GPU, never
SwiftShader) as an iPhone-sized touch device (390x844 or 844x390, DPR 2, iOS user agent, real CDP touch events,
multi-touch). The tester talks to it with curl:

- `/act?s=tap x y; hold x y ms; drag x1 y1 x2 y2 ms; swipe ...; down x y [finger]; move x y [finger]; up [finger]; wait ms`
  (at most 8 s of game time per act), `/look`, `/status`, `/rotate?o=landscape|portrait`, `/reload`.
- **Virtual clock** (`panel/shim.js`, injected before any game script). `performance.now`, `Date.now`,
  `requestAnimationFrame`, `setTimeout`/`setInterval`, `Event.timeStamp` and (from v2) `AudioContext.currentTime`
  only advance inside an act, at 60 steps per second. The game is frozen while the agent thinks, so slow thinking
  costs no game time. Each clock read nudges time by 1 microsecond so busy-wait loops cannot hang the page.
- **Screens.** A screenshot every 0.5 s of game time (0.75 s in v1 and v2), returned per act as one contact sheet
  (at most 8 frames, time-stamped) plus the latest frame at exact touch coordinates.
- **Sound log**, because the tester cannot hear. The shim hooks WebAudio (every source start: oscillator wave,
  pitch and glides; buffer name, length, loop and playback rate; scheduled-ahead time; stops; the engine state) and
  HTMLAudio (play, pause, ended, loop, muted, blocked by autoplay). `panel/sound.mjs` turns that into lines such as
  `MUSIC/AMBIENCE playing under this stretch: "music_day.mp3" (loop), since 0.5 s`, `SEQUENCED MUSIC ... 36 notes,
  C#3 to D#9`, `effect: sample "clink.mp3" 1 s, playback rate 1.08`, `pattern: sample "clink.mp3" played 4 times with
  its pitch climbing`, `MUSIC: none playing in this stretch`, `SILENCE: no sound has played at all so far`. Sounds
  started on a suspended engine are reported as inaudible.
- **Console** messages and page errors per act (URLs stripped so the game's address never leaks), and a full
  `log.jsonl` per session (every act, raw sound events, console) for later telemetry.

## Movement assist (r4)

For games where the fun sits behind walking a character through 3D, a per-game module in `panel/assist/` gives the
tester two more endpoints: `/places` (destinations from where the hero stands, including "objective") and
`/goto?to=<place>` (walk there, up to 60 s of game time, returned as a normal contact sheet and sound log). The
assist only moves the hero: it never presses USE or any action button, never catches, gives, turns or throws
anything, and never chooses the next step. Testers keep direct touch control at all times.
- `assist/bellkeeper.mjs`: the entrant's own A* route planner (`repo/tools/route-planner.mjs`) over the game's world
  module built in node, and the path follower the trailer agent adapted from the entrant's known-route regression
  (`~/404_jam_site/work/trailers/bellkeeper/capture2.mjs`: go, travel, approach, ride), steering the real on-screen
  touch stick. Places are the named anchors within 30 m and 4 m of height, live gusts, "ride the updraft at grille X",
  and "objective": the point the game's own chart marks, exposed by a one-line read-only patch of main.js served
  through request interception (`objective:(window.__OBJ__=quest.objectiveTarget())`). The game logic is unchanged.
- `assist/farseek.mjs`: the movement legs of the entrant's own play-through recorder
  (`~/404_jam_site/work/trailers/farseek/repo/scripts/record-trailer.mjs`: steer, go, jumpToward and the court and
  checkpoint routes) as a small route graph: the gap jump, the hang and drop, the jump to the crack, the shimmy and
  climb, the stair, the vault to the mirror island, the floor corridor, the gate; plus straight-line places in the
  checkpoint. Camera-relative strafes were replaced by steering toward world points. Input is the game's keyboard
  controls; worlds three and four have no assist (direct control only).
- Reliability (r4): Bellkeeper 254 of 340 gotos arrived (75 percent), Farseek 113 of 148 (76 percent). Failures
  were mostly honest ("no walkable path from here" before a bridge or updraft exists) and some real driver misses
  (the vault to the Farseek island failed to land a few times).

## Personas (verbatim prompts in `panel/personas.md`)

| id | who | what they reward |
|---|---|---|
| casual | Maya, 34, plays in 2 to 5 min gaps (Candy Crush, Royal Match, Subway Surfers) | clear goals, small wins, sounds, visible progress |
| competitive | Dev, 22, score chaser (Geometry Dash, Vampire Survivors, Tetris 99) | speed, combos, risk for reward, juice; hates dead time |
| explorer | Sofia, 41, atmosphere and story (Monument Valley, Alto's Odyssey, A Short Hike) | curiosity rewarded, a world that reveals itself |
| firsttime | Joe, 58, new to phone games (Solitaire, Wordle) | being shown what to do, clear response to touch |
| indie | Kai, 29, jam judge (Into the Breach, Mini Metro, Downwell) | one verb with a real trade-off, systems that feed each other |

Shared template: blind label only, be honest not polite ("most games land between 3 and 6"), play at least the
session minimum and note when you WOULD have quit, then write `rating.json`: fun, nuance (with the strategy in your
own words), pace and a pace word, feedback/juice, audio in a sentence, would-replay, quit time, time to understand
the goal, control trouble (v2+), best and worst moment, and a one-paragraph verdict.

Calibration rounds used casual, competitive and indie (3 per game, the cost-sane option). explorer and firsttime are
written but NOT calibrated.

## Calibration

Ground truth (Ben's own play): TOWLINE look build a26d0cf "not that fun, pretty slow, no dopamine hits, no music";
TOWLINE fun build 53a21a0 "much better, featureable" but "basic 101 gameplay"; RILL better than older studio games but
not on par with the jam; jam winners The Last Bellkeeper, SUNDRIFT and Farseek above all of ours on nuance.

Checks, fixed in `aggregate.py` before the first result was read:

| Check | Meaning |
|---|---|
| C1 | look build mean fun at least 1.0 below the fun build |
| C2 | look build has the lowest mean fun of all six |
| C3 | RILL mean fun at most 0.5 above the fun build |
| C4 | every winner's mean nuance above the fun build, and their average at least 1.0 above |
| C5 | majority of look-build testers say slow AND no music; majority of fun-build testers say basic/simple (or nuance 4 or less) |

Note: STUDIO_PIPELINE.md states the order as RILL < look build < fun build. The brief for this calibration says the
look build is lowest and RILL near or below the fun build; the checks follow the brief.

Per-game means. Fun / nuance on 1 to 10. n = 3 sessions per game per round (r1 had 2 for the look build and
Bellkeeper: two sessions were not launched once the v1 audio bug was found).

| Game | r1 fun / nuance | r2 fun / nuance | r3 fun / nuance |
|---|---|---|---|
| TOWLINE look a26d0cf | 3.0 / 2.0 | 2.7 / 2.0 | 3.0 / 2.0 |
| TOWLINE fun 53a21a0 | 4.7 / 3.7 | 5.0 / 5.0 | 5.0 / 5.7 |
| RILL | 4.0 / 6.7 | 4.7 / 6.3 | 5.0 / 6.7 |
| Bellkeeper | 2.0 / 1.0 | 2.3 / 1.3 | 2.3 / 1.7 |
| SUNDRIFT | 5.7 / 5.3 | 6.0 / 5.0 | 5.7 / 5.3 |
| Farseek | 2.7 / 3.7 | 3.3 / 3.7 | 3.0 / 4.0 |

| Check | r1 | r2 | r3 |
|---|---|---|---|
| C1 look clearly below fun | PASS | PASS | PASS |
| C2 look lowest of all six | FAIL | FAIL | FAIL |
| C3 RILL near or below fun | PASS | PASS | PASS |
| C4 winners above fun on nuance | FAIL | FAIL | FAIL |
| C5 slow / no music / basic | PASS | FAIL | FAIL |
| Overall | FAIL | FAIL | FAIL |

C2 fails only because Bellkeeper (and in r1 Farseek) score below the look build. C5 in r2 and r3 fails on the
"basic" half only: the look build is called slow and silent 3 of 3 in every round, but after the audio fix only 1 of 3
fun-build testers called its play basic (r1, with the broken audio log, it was 3 of 3). The word "slow" itself does
not discriminate: testers say it about every game; the pace score does (look 2.3 to 2.5, SUNDRIFT 4.7 to 5.3).

Phrases, in the testers' own words, against Ben's:
- Look build, Ben "no music, slow, no dopamine hits": "Dead silent the entire 182 seconds - no music, no splash from
  the oars, no chime when a lantern hooked" (r2 casual); "no speed, no combo, no score that matters" (r1
  competitive); pace word "too slow" in 8 of 8 sessions.
- Fun build, Ben "basic 101 gameplay": "there's exactly one verb (steer toward the next glowing thing) and it never
  grows a second one" (r1 indie); but the r2 and r3 indie testers found a towing risk/reward (a tight route that can
  snag the string against a slower wide line), nuance 6 and 5.
- Bellkeeper, Ben "interesting nuance": testers mostly never got past the first errand ("walk to NPC, ring bell,
  catch wind, carry it to a wheel"); the Opus pilot reached the routing idea ("your bell carries one gust, and you
  feed it into machines that chain into other machines") but still rated nuance 4 and 3.

Opus pilot (not a revision, a diagnostic): two Opus testers on Bellkeeper with the v3 prompt got further than any
Sonnet tester (woke 1 of 3 windmills, found the valve) but rated fun 3 and 3, nuance 4 and 3. A model swap alone
would not have flipped C4 (fun build nuance 5.7 in r3), so a third revision with Opus testers was not run.

### Round 4: cross-game nuance with the movement assist (revision 3, the last)

TOWLINE fun build against the three winners, casual, competitive and indie each, labels shuffled. Bellkeeper and
Farseek: 600 s sessions with the movement assist. TOWLINE fun and SUNDRIFT: 300 s, no assist (direct touch games, as
in r3). At most 6 testers at a time.

| Game | Fun | Nuance | Pace | Juice | Nuance per tester (casual, competitive, indie) |
|---|---|---|---|---|---|
| TOWLINE fun 53a21a0 | 5.3 | 5.7 | 5.0 | 8.0 | 5, 6, 6 |
| Bellkeeper (assist, 600 s) | 5.7 | 5.7 | 4.0 | 7.7 | 7, 6, 4 |
| SUNDRIFT | 6.0 | 5.3 | 6.3 | 7.7 | 5, 6, 5 |
| Farseek (assist, 600 s) | 3.3 | 6.3 | 2.7 | 4.7 | 6, 6, 7 |

**C4, winners above the fun build on nuance: FAIL.** Winners 5.67, 5.33, 6.33 (mean 5.78) against 5.67; the check
needs every winner above and the mean at least 1.0 above. Only Farseek is above (+0.67).

What the assist changed: testers reached the systems Ben called nuance. Bellkeeper testers woke mills, used the
pipes valve that misroutes the gust, and fought the guardian ("the vane you feed has to match the color the
guardian's heart is currently burning", competitive); one casual tester rated it 7. Farseek testers lit stelae and
reasoned about relaying light mirror to mirror ("Mirror 3 sits on an island with no sunbeam of its own at all, so it
must be meant to be fed by a relay", indie, 7). Bellkeeper's fun went from 2.3 (r3) to 5.7.

Why it still fails: (1) the fun build is not seen as "basic 101": all three testers named a towing risk and reward
(a longer string pays more, a bump drops the multiplier, the oil clock forces a commitment, the token shop choices),
nuance 5 to 6 in r3 and r4 alike; (2) SUNDRIFT's drift and smash risk reads as one lever ("once you've found that one
lever by minute two, nothing new gets added", indie, 5); (3) the indie tester on Bellkeeper read its systems as
"all execution, not decision" and "just a glowing button telling me what to press next" (4), and that tester also spent the
last third stuck on the ladders shutter step. Absolute 1 to 10 nuance scores, each tester seeing one game, do not
separate "a real trade-off on rails" from "systems that feed each other" by the margin Ben's verdict implies.

## What changed between rounds

- **r1 (v1)**: harness as described, 0.75 s cadence, 180 s sessions, AudioContext clock left real. Found two harness
  faults: (1) the audio clock ran in real time while the game clock was frozen, so music schedulers burst their notes
  at the start of each act and went quiet for the rest, and (2) the summary said "SILENCE" during acts where a looping
  music track started earlier was still playing. Testers wrote "no music" about games that have it (Farseek 3 of 3).
- **r2 (revision 1, v2)**: AudioContext.currentTime follows the virtual clock; sounds are logged at their scheduled
  time; a stateful summary reports music still playing every act and says "MUSIC: none playing" explicitly; sounds on
  a suspended engine are reported as inaudible; taps last 50 ms instead of 0. Prompt: an explicit "your hands are
  clumsier than a real player's" correction, a control_trouble field, a rotate hint. Result: "no music" now lands
  only on the look build (3 of 3; fun build 0 of 3); winners unchanged.
- **r3 (revision 2, v3)**: 0.5 s cadence, 300 s sessions, how-to for a 3D virtual stick (short nudges, back off and
  go wide), "push on to new content", and the nuance rubric counts systems the game shows or sets up, not only the
  ones mastered. Result: same ordering; Bellkeeper and Farseek still stuck in their openings.
- **r4 (revision 3, v4)**: the movement assist above, 600 s sessions for the 3D winners, at most 6 testers at once,
  and the cross-game nuance check only. Result: the winners are no longer under-rated by navigation, but C4 still
  fails (see Round 4). No revisions remain.
- **Checked and ruled out**: the virtual clock as the cause of the 3D wedging. The same Bellkeeper walk run under the
  virtual clock and under a real-time clock (`--realtime` diagnostic flag) produced the same path and the same wedge
  against the same wall with the same camera close-up (frames compared side by side).

## Known blind spots

1. **3D third-person movement.** Testers see the screen every 0.5 s and cannot steer mid-act. Without the assist
   (r1 to r3), most of every Bellkeeper and Farseek session went on walking, falling and getting wedged, and testers
   blamed the game ("collision bug", "soft-lock behind a wall at Mara"); those claims are NOT verified and real players
   finished both games. The assist (r4) fixes travel only where a module exists (Bellkeeper; Farseek's first two
   worlds) and arrives about 75 percent of the time. Real-time skill moments are still beyond the testers: the
   Bellkeeper guardian's beam dodge and Farseek's fine mirror aiming were failed repeatedly and blamed partly on the
   harness. A new 3D game needs its own assist module before its nuance can be judged.
1b. **Assist side effects.** Farseek's assist drives the game's keyboard controls, so its HUD switches to key hints
   (E, C) on the phone; the prompt maps them to the on-screen buttons. Bellkeeper's objective target is read through a
   one-line read-only patch of main.js.
1c. **Session length differs between games in r4** (600 s for the assisted 3D games, 300 s for TOWLINE fun and
   SUNDRIFT). The longer window favours the winners, so it did not cause the failure.
2. **Window length.** Nuance that appears after minute 5 is invisible. The winners' nuance mostly lives after their
   tutorials (Bellkeeper's wind routing, Farseek's mirror puzzle); the bot benchmark in FUN_SPEC finishes Bellkeeper
   in 355 s at perfect play, a human or agent needs far longer.
3. **Gain-level muting is invisible to the sound log.** The log sees a sound start, not the master volume. Bellkeeper
   shows an "Enable sound" button, so testers may have "heard" sounds a real player would not. This biases in the
   winners' favour, so it did not cause the failure.
4. **CSS and Web Animations run in real time**, not on the virtual clock, so a fade or popup made in CSS can play out
   differently from a phone. Web workers and OfflineAudioContext are not virtualised.
5. **Blindness is partial.** Labels hide the name, but title screens show it (testers named "Towline", "Sundrift").
   They do not know which games are ours or the winners, and nothing in the prompt says so.
6. **Absolute scale is compressed.** Every game lands between 2 and 6 on fun and 0 of 54 testers (52 plus the pilot) said "yes" to replay;
   Ben's "featureable" fun build gets 5.0. Read the panel as a ranking between builds, not as a ship score.
7. **Persona coverage.** Only casual, competitive and indie were calibrated. explorer (Sofia) and firsttime (Joe) are
   written and wired but never run; the explorer persona is the one most likely to rate Bellkeeper higher.
8. **One engine.** Chrome with an iPhone user agent, not WebKit. iOS audio unlock rules are not reproduced.
9. **Phrase checks are regex.** `aggregate.py` matches words like slow, silent, basic; it is a coarse proxy, read the
   verdicts.
10. **Concurrency.** r1 to r3 launched 18 sub-agents at once against an account limit of 20, which starved the
    game 2 builder (it logged an agent-limit blocker). From r4: at most 6 at a time, builders have priority.
12. **One TOWLINE tester (r4, competitive) reported that "Row on to Reed Basin" reloaded to the title and wiped the
    run, twice.** TOWLINE moves to the next district by a page navigation, and the older TOWLINE harness notes that
    Chrome drops touches across such a navigation. Not verified: it may be a harness artifact rather than a game bug.
11. **/rotate** was reported to give a blank screen on Bellkeeper by one tester; another played it in landscape
    fine. Not reproduced.

## What the panel can and cannot be used for

Supported by all three rounds:
- **A/B of builds of the same game** on fun, pace, juice and audio: TOWLINE look vs fun separated by 1.7 to 2.3 fun
  points every round, with juice 1.5 to 3.0 vs 6.7 to 7.7.
- **A floor gate**: a build that testers call silent and too slow, with pace 3 or less and no replay, is below what Ben
  rejected. The panel caught both of Ben's look-build complaints (no music, slow) in 8 of 8 sessions.
- **Our studio games against each other** when the play is direct touch (steer, drag, draw): RILL vs TOWLINE fun
  came out level, as Ben placed them.

Not supported:
- Ranking our game against the jam winners on nuance, or claiming "on par with the jam" (C4 failed in all four
  rounds, including r4 with the movement assist and 10-minute sessions).
- Nuance verdicts on a 3D game without its own assist module.
- An absolute "featureable" threshold.

What could still change this (not done; the three revisions are used up):
- **Pairwise judging for nuance**: one tester plays the fun build and a winner back to back and says which has more
  nuance and why. One-game-per-tester absolute scores compress to 5 to 6 for everything with any trade-off.
- **A nuance rubric anchored on examples**, for instance the NUANCE list in STUDIO_PIPELINE.md written out as 7 to 9
  anchors and TOWLINE's towing as a named 5, so "a trade-off on rails" and "systems that feed each other" separate.
- **A human spot-check** of the fun build and one winner, to tell whether the panel is wrong or Ben's "basic 101"
  rests on something the panel cannot see (feel, novelty against the genre, how the systems combine late).

## Files

- `harness.mjs`, `shim.js`, `sound.mjs`, `sheet.py`: the phone, the clock, the ears, the contact sheet.
- `assist/bellkeeper.mjs`, `assist/farseek.mjs`: movement assists (r4).
- `personas.md`, `prompt.py`, `batch.py`, `start.sh`, `games.json`, `serve.mjs`: prompts and orchestration.
- `aggregate.py`: per-game means and the calibration checks.
- `results/r1`, `results/r2`, `results/r3`, `results/r4` (with `cost.json`), `results/pilot_opus`: every rating.json, the session key, `calibration.md`; r1 and r2 also keep
  the prompt and shim versions they ran with. Screenshots and raw logs stay in session scratch (not committed).
