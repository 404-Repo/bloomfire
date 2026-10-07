# BLOOMFIRE claims (from the six concept frames)

Bar: `ref/concept/01..06_*.png` (Atlas std, 2752x1536, 16:9). Measure: `python3 tools/claims.py <png|dir>`.
**Capture size for every figure here: centre-cropped to 844:390 (top and bottom trimmed, never stretched),
resampled to 844x390.** The concept frames are 16:9 and the game frame is wider, so a game capture at
844x390 sees more world sideways than these crops do; capture the game at 844x390 landscape for the
measurement pass and treat the band figures as approximate. The blind pairs judged by eye carry the verdict.

Status: these numbers are from the bar ONLY. No floor exists yet, so none of the claims has passed the
70 percent separation test in docs/claims.md. Run the floor through the same script before trusting any.
Sanity control: the rejected first chapel frame (more grey, bells) scored warm_pct 11.4 vs 22.3.

## Concept-frame values (844x390)

| frame | warm % | cold % | p98 luma | top-2% warm | near edges | ink lines grey / warm % | magenta % | enemy h |
|---|---|---|---|---|---|---|---|---|
| 01 Rise | 25.4 | 51.9 | 245 | 0.94 | 0.584 | 15.3 / 9.8 | 0.45 | 0.27 |
| 02 Terraces | 20.6 | 54.6 | 251 | 0.29 | 0.610 | 17.7 / 16.4 | 0.18 | 0.30 |
| 03 Millbrook | 18.4 | 63.1 | 240 | 0.70 | 0.541 | 13.6 / 10.6 | 0.10 | 0.20 |
| 04 Market | 9.8 | 64.7 | 240 | 0.95 | 0.590 | 17.5 / 11.9 | 0.12 | 0.72 |
| 05 Ridge | 36.7 | 38.9 | 233 | 0.99 | 0.585 | 15.0 / 9.1 | 0.05 | 0.16 |
| 06 Chapel | 22.3 | 51.7 | 248 | 0.95 | 0.558 | 13.2 / 9.4 | 0.31 | 0.52 |
| median | 21.5 | 53.3 | 243 | 0.95 | 0.585 | 15.2 / 10.2 | 0.15 | 0.28 |

## The claims

**C1. Two colour temperatures in every frame, both in quantity.** Warm painted pixels (hue 15-65, S>=0.30,
V>=0.35) are 9.8 to 37 percent of the frame and cold ink-wash pixels (S<0.16, or hue 180-250 with S<0.45)
are 39 to 65 percent. Fail if warm_pct < 8 or cold_pct < 35.
Gameable by: a warm sky or an orange HUD panel supplying all the warm pixels while the ground stays grey;
check that warm sits on ground and walls, not only above the horizon.

**C2. The brightest values sit in the warm light.** p98 luma 233 to 251, and in 5 of 6 frames at least 70
percent of the top-2-percent pixels are warm (R-B > 20). Fail if p98 < 225 or top2_warm_share < 0.6 (frame
02 is the exception: its brightest pixels are the white paper splash and the bolt flash).
Gameable by: a bloom-blown sun disc or a yellow muzzle flash that alone fills the top 2 percent.

**C3. The near field is dressed.** In the band y 62-96 percent, x 3-55 percent (left of the rifle), edge
density (Sobel > 60) is 0.54 to 0.61 and luma std 49 to 74. Fail if near_edge_density < 0.45.
Gameable by: a high-frequency noise or hatching texture on bare ground. A critic must see objects
(walls, plants, steps) within about 8 m, not just a busy surface.

**C4. Ink outlines on silhouettes in grey areas.** Thin dark lines (luma < 0.62 x 9px local mean and < 110)
are 13 to 18 percent of cold regions below the sky band. Fail if ink_line_pct_in_grey < 10.
Honest note: the concept frames keep outlines in the warm areas too (9 to 16 percent), so "outlines fade
where colour returns" is NOT supported by these images and is not a claim. Keep it as a design choice only.
Gameable by: a full-screen edge post pass that outlines texture noise rather than silhouettes.

**C5. Magenta belongs to the ink, and it is rare.** Magenta (hue 295-345, S>=0.45, V>=0.5) is 0.05 to 0.45
percent of the frame and present whenever an enemy is. Fail if magenta_pct > 1.0, or 0 with an enemy in view.
Gameable by: shrinking the cores until nothing reads; pair with C6.

**C6. The nearest enemy reads big.** The tallest dark ink body joined to a magenta core (outlines removed by
a 2 px opening) spans 16 to 72 percent of frame height in combat frames (median 0.28). Fail a combat frame
if enemy_height_frac < 0.12. Fragile: in frame 01 it measures the ink plumes, not a creature. Eye check
whenever the number surprises you.
Gameable by: a dark shadow decal or ink puddle touching a core.

Eye checks with no number: the frame reads as an ink drawing being coloured in (paper grain, hatching); a
lit lantern or the prism is the warmest point near the camera.
