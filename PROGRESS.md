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
