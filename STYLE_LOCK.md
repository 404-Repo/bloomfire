# BLOOMFIRE: the locked style

> Sun-warmed Mediterranean hill-country objects built as chunky, readable, slightly exaggerated
> shapes (thick walls, rounded stone edges, heavy timber), flat matte colours with gentle roughness,
> painted in their true late-afternoon colours; no text, glyphs or logos anywhere.

Hand this file, unchanged, to every agent that generates anything.

The game draws every object in two states: its true colour (below) and an ink-wash version the
shader derives from it. **Author the true colour.** Never paint an object grey to look "inked".

## Palette: the restored world

| role | hex | where it belongs |
|---|---|---|
| limewash | `0xeee3cf` | house walls, chapel walls, plastered parts |
| warm stone | `0xc9b48f` | dry-stone walls, terrace walls, bridges, wells, steps |
| chalk | `0xe8e2d4` | quarry faces, chalk blocks, mile stones |
| terracotta | `0xc0603a` | roof tiles, pots, chimney caps |
| ochre | `0xd9a441` | painted shutters, cart bodies, awnings (with madder) |
| madder red | `0xa8382e` | awning stripes, doors, flags without marks |
| shutter teal | `0x3f8a8a` | shutters, doors, window frames, benches |
| lavender | `0x8c7bbf` | flower beds, lavender rows, cloth |
| olive leaf | `0x6f7d3c` | olive canopies, shrubs |
| cypress | `0x2f4a2a` | cypress trees, dark hedges |
| grass | `0x8a9a48` | grass tufts, meadow |
| timber | `0x7a5534` | beams, carts, ladders, mill wheels, fences |
| dark timber | `0x4a3324` | posts, doors, frames |
| iron | `0x3c3a38` | hinges, bands, lamp posts, crane parts (`metal`) |
| brass | `0xb8913a` | lantern frames, the prism rifle's fittings (`metal`) |
| sunlight | `0xffd27a` | emissive only: lantern glass, the rifle's prism, bolts |

## Palette: the ink (enemies and inkwells)

| role | hex | where it belongs |
|---|---|---|
| ink body | `0x15131f` | every enemy's body; roughness 0.25, metalness 0, a wet sheen |
| ink sheen | `0x2b2a45` | secondary body parts, plates |
| bone mask | `0xd8d2c4` | masks, horns, beaks, claws (one per enemy, it is the face) |
| magenta core | `0xff3d8b` | emissive weak spots, eyes and inkwell nodes. Nothing else uses it |

Enemies must read as black-and-magenta silhouettes against both a grey and a painted world.

## Fixed decisions

- Metres. Player eye 1.65 m. A storey is 3.0 m; a door 2.1 by 1.0 m; a window 1.1 by 0.8 m.
- Terrace wall 1.2 m high, 0.6 m thick. Field wall 1.0 m. Fence 1.0 m. Crate 0.6 m. Barrel 0.9 m.
  Amphora 0.9 m. Cart 1.5 m tall, 3.2 m long. Lamp post 3.2 m. Market stall 2.6 m tall, 2.4 m wide.
  Well 1.0 m wall, 2.6 m with its frame. Olive tree 4.5 m. Cypress 10 m. Lemon tree 3.5 m.
  House 2 storeys, 6.5 to 7.5 m to the ridge. Water mill 9 m. Windmill 13 m to the cap, sails 16 m
  across. Clock tower 18 m. Chapel 14 m. Quarry crane 12 m.
- Enemies: Blotling 0.6 m, Spitter 1.6 m, Smear 2.0 m, Quill 1.2 m wingspan, Inkhorn 3.2 m,
  Inkwell 7 m, Old Inkhorn 14 m.
- Base at y = 0, centred on x and z, front faces +Z.
- Flat colours with sensible roughness; surfaces are applied at load time. Name materials with the
  contract's list: `plaster`, `stone`, `timber`, `tile`, `metal`, `fabric`, `foliage`, `ground`.
- Silhouette first: an FPS sees objects from 1.65 m, near and at 100 m. Overhangs, eaves, recessed
  doors and windows, thick rims and chunky trims read; tiny detail does not.
- Budget: props under 4k triangles, buildings under 12k, enemies under 3k (they are many), hero
  rifle under 8k. Segment counts low; no decimation.
- Anything that moves (enemies, mill wheel, windmill sails, the rifle) names its moving parts on
  `userData.joints` with pivots at the joint.
- No text, glyphs, numbers or logos anywhere, in any object.
