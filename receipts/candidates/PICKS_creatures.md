# BLOOMFIRE creature + rifle picks (assets_creatures agent, 2026-10-07)

Method: 404 path B, three construction strategies per object (primitives / profiles-sweeps /
hand-built or different reading), `harness/verify.mjs` four sides + 3/4, picked by eye from
`<object>/_verify/sheet.png`. Sources with shared snippets: `work/assets_creatures_scratch/src/`.
Pose test (every joint at -0.6 / 0 / +0.6 rad): `work/assets_creatures_scratch/shots/pose.png`.
Loader regression: `work/assets_creatures_scratch/shots/rawtest.json` + `regress.py`.

| object | winner | tris | joints | why | what the others got wrong |
|---|---|---|---|---|---|
| blotling | c1 primitives | 2300 | body, legFL, legFR, legBL, legBR | sheen shell plates read on the back, a big clear bone mask, splayed stumpy legs | c2 lathe shell sank into the body (plain egg); c3 bent extruded mask bowed and shredded (the warped-extrude-cap trap), faceted body |
| smear | c2 sweeps | 2316 | body, head, armL, armR, legL, legR | each limb is one tapered swept tube: reads as one wet stretched husk, long clawed arms | c1 3360 tris (over 3k) and reads as a jointed mannequin; c3 beaded spine looks robotic |
| spitter | c2 profiles | 2748 | body, sac, tube | lathe sac, flared lathe tube, horned skull; core bulges through the sac front AND back after a fix (it was buried) | c1 3812 tris (over budget), core barely visible; c3 faceting artifacts on the displaced body, verifier flagged a featureless back |
| quill | c2 profiles | 1820 | body, wingL, wingR | leaf-shaped extruded quills, raven silhouette; rest dihedral baked into an inner group so the game's flap on rotation.z adds to it; span 1.23 m | c1 cone quills, wings flat (thin bars from the front), span 1.08 m; c3 bat membrane shades with hard white facets |
| inkhorn | c3 different reading | 2948 | body, head, armL, armR, legL, legR | hunched brute, big faceted pauldrons, core and horns read from front and side | c1 3364 tris, boxy; c2 extruded pauldrons came out as flat shelves and the chest plate hid the core |
| inkwell | c2 profiles | 3688 | spire, node0, node1, node2 | lathe pot, S-bent lathe spire, thick thorned helix vine, three large nodes in ink cups | all three first read as a witch hat on a pot; c1 torus vines and c3 star-twist thorns too small to register. c2 was then thickened |
| old_inkhorn | c2 sweeps | 6954 | body, head, core, armL, armR, legL, legR | only one where the bone rib cage reads (c04); cage opened so the core shows; built in a 3.4 m rig unit inside a scaled non-joint wrapper (x4.15) | c1 8000 tris, torus ribs sank into the chest; c3 rib blades hidden, white facet flashes on the slabs |
| prism_rifle | c2 profiles | 1512 | prism, muzzle | extruded stock profile with grip, extruded hex cage frames with rivets, lathe barrel/bands/slotted shroud, enlarged lathe gem; muzzle at -Z | c1 stock is a box; c3 butt cap a round blob and round cage does not match r01 |

All winners: base y=0, centred x/z, ink 0x15131f r0.25, sheen 0x2b2a45, one bone face 0xd8d2c4,
emissive 'core' 0xff3d8b x2; rifle brass 'metal', timber 'timber', emissive 'prism' 0xffd27a.
No text/glyphs. Joints are Groups at the pivot with geometry offset inside; everything hangs off `body`.

Loader regression (game/assetlib.js, unmodified): raw vs merged and raw vs keepHierarchy both 100.0%
triangle retention on all 8; every declared joint resolves on a keepHierarchy instance and rotating
it moves geometry. Merged loads collapse to 3-4 meshes; keepHierarchy keeps 25-52 meshes (bake per joint).
