# BLOOMFIRE

*Shoot the colour back.*

A first-person action shooter for phones. Ink has drowned the valley of Vell: every wall, tree and
roof is a cold blue-grey ink sketch, and things made of ink walk in it. You carry a prism rifle that
fires stored sunlight. **Every kill bursts the colour back into the world around it**: the ground,
the walls and the olive trees within a few metres turn from ink wash to warm late-afternoon paint,
and flowers spring up. Cleanse the five inkwells that feed the blot, climb to the Sun Chapel, break
Old Inkhorn, and the whole valley floods with colour.

## The one rule nobody else in jam 001 used

Your kills paint the world. It is the score, the map and the reward at once:
- **Moment to moment** (every 1 to 3 s in a fight): a kill is a splash of colour, a pop, a score
  floater, a rising combo note and a mote that flies to you.
- **Every 20 to 40 s**: a wave cleared, a lantern lit (checkpoint), a combo tier called out.
- **Every 2 to 3 min**: an inkwell destroyed. A wave of colour rolls across the whole district, the
  district's music layer comes in, and the rifle gains a lens.
- **The run**: score, time, and **% of the valley restored**, saved as your best. Missed blots in
  side corners leave grey holes on the end-card map, which is the reason to replay.

Checked against all 25 entry files and the three podium games (WINNERS.md in
~/astrocade-game4/research): Bellkeeper carries wind, Farseek steers light into doors, SUNDRIFT
turns drifts into time of day, MOONPULL moves the sea. Nobody repaints the world with combat.

## Why this concept (reasons, not taste)

1. **Ben asked for action.** An FPS with a fight every few seconds, not a guided tour. MOONPULL lost
   "keep playing" to games with "small wins every few seconds and a score to beat"
   (judge_final/REPORT.md s08, s09). Combo, score floaters and a best score are built into the verb.
2. **Expansive and authored.** One valley about 460 by 520 m with eight named places, each with a
   job. You see all five ink plumes from the first hilltop, so the goal is on screen at second 10.
3. **The lighting lesson becomes the mechanic.** The Roman FPS lost 0/6 seven rounds running because
   its lighting had one colour temperature. Here every frame at a fight boundary has two: cold ink
   wash against warm painted sun. RUST 17's lever was surface material; restored ground uses Atlas
   PATINA textures triplanar, the ink side uses the same textures as a cold wash.
4. **A committed art direction** (MOONPULL lost its last four critic rounds to SUNDRIFT's single
   committed look). Here the look is the premise: an ink drawing being coloured in, with ink
   outlines that fade where colour returns.
5. **Phone-first FPS controls that a thumb can do.** Move stick left, drag to look right, auto-fire
   when the reticle sits on a target, gentle aim assist (slowdown + pull), two big buttons: DASH and
   BLOOM. Desktop: WASD, mouse look, click to fire.

## The valley (metres, x east, z south, y up)

| # | place | where | job |
|---|---|---|---|
| 1 | Lampwright's Rise | south-west hilltop, ~(-190, 170), 40 m up | start: the workshop, the prism, the overlook of the whole grey valley and five ink plumes; tutorial fight |
| 2 | The Olive Terraces | slope from the Rise to the river, ~(-110, 90) | first inkwell (tutorial heart); dry-stone terrace walls as cover |
| 3 | Millbrook | the river village with a water mill and bridges, ~(-20, -10) | inkwell; fights across bridges and the mill race |
| 4 | Vell Market | a town on a low mound east of the river, ~(110, 20) | inkwell in the square; arcades, a clock tower, alleys |
| 5 | Windmill Ridge | a crest in the north-west, ~(-160, -140), 30 m up | inkwell among the windmills; long sight lines, flyers |
| 6 | The Chalk Quarry | a pit in the north-east hill, ~(150, -160) | inkwell on the pit floor; cranes, ledges, a vertical fight |
| 7 | The Pilgrim Stair | switchbacks up the north mountain, ~(40, -230) | gauntlet, opens when all five inkwells are gone |
| 8 | The Sun Chapel | the summit, ~(40, -290), 65 m up | Old Inkhorn, three phases; finale, the colour wave over the whole valley |

Order: Rise and Terraces first (teaching), then Millbrook, Market, Ridge and Quarry **in any order**
(the branch), then the Stair and the Chapel.

## The fight

- **Prism rifle**: hitscan sunlight bolts, about 9 a second, no reload. Lenses earned from inkwells,
  in the order you take them: Split (every third shot is three bolts), Arc (a kill arcs to the next
  enemy), Burst (kills splash), Rapid (+40% rate), Sun (BLOOM charges twice as fast).
- **BLOOM**: charged by kills. A 14 m nova that kills the small, staggers the big and paints a huge
  circle. The big reward button.
- **DASH**: two charges, a short burst with invulnerability; a dash through a wisp kills it.
- **The ink**: Blotlings (fast swarm, the combo food), Smears (shambling husks), Spitters (lob
  telegraphed ink, you sidestep), Quills (darting flyers), Inkhorns (armoured brutes with a glowing
  core), Inkwells (the hearts: a pulsing spire with three exposed nodes, spawns waves), Old Inkhorn
  (the boss).
- **Combo**: kills within 3 s chain, x1 to x8, with called tiers. Bonuses: double, multi, long shot,
  dash kill, core shot.
- **Failure**: 100 health, motes heal. Die and you wake at the last lit lantern, combo lost and 10% of
  the run score taken. The grey slowly creeps back over ground near a living inkwell, so dawdling
  costs restoration.

## Bar (from the podium, measured in WINNERS.md, plus MOONPULL's lesson)

- 8 named places, 5 hearts + a boss, a branch in the middle, title, story cards, end card.
- Rewards at least every 5 s while fighting; a score and a best score; % restored.
- 12+ minutes first play; a reason to replay (score, time, restoration %, missed corners).
- Phone: 60 fps target, under 450 draws and 0.75 M triangles in play (jam cap 900 / 1.5 M).
- First-person camera at 1.65 m eye height, fov adapted to portrait and landscape.

## Risks

- **Portrait FPS.** The jam gate is 390x844 portrait; a portrait FPS sees a narrow slice. Play is
  designed for both, with a wider vertical fov in portrait and a "turn your phone" hint.
- **An ink world in stills.** A desaturated world can read as unfinished in a blind frame. Mitigation:
  the ink side is a designed blue-slate wash with paper grain and outlines, and the capture path
  always includes painted ground.
- **Scope.** Eight places and seven enemy kinds. If time runs short, the Quarry folds into the Ridge
  and the Stair becomes a short climb.
- **Fill rate.** A post pass for outlines on a phone. Measured, and cut to a material-only treatment if
  it costs too much.
