// The valley of Vell, authored. Metres: x east, z south (north is -z), y up.
// Everything that places things in the world reads from here, so the map has one source.

export const WORLD = 640;          // square world, centred on the origin
export const HALF = WORLD / 2;

// Named places. `at` is the centre, `r` the radius the zone banner uses.
export const PLACES = [
  { id: 'rise', name: "Lampwright's Rise", sub: 'the last lit workshop', at: [-190, 166], r: 46 },
  { id: 'terraces', name: 'The Olive Terraces', sub: 'first inkwell', at: [-118, 96], r: 52 },
  { id: 'mill', name: 'Millbrook', sub: 'the river village', at: [-22, -18], r: 55 },
  { id: 'market', name: 'Vell Market', sub: 'the town on the mound', at: [110, 18], r: 55 },
  { id: 'ridge', name: 'Windmill Ridge', sub: 'sails over the valley', at: [-166, -138], r: 60 },
  { id: 'quarry', name: 'The Chalk Quarry', sub: 'the white pit', at: [162, -158], r: 55 },
  { id: 'stair', name: 'The Pilgrim Stair', sub: 'the climb', at: [42, -232], r: 42 },
  { id: 'chapel', name: 'The Sun Chapel', sub: 'the summit', at: [40, -288], r: 30 },
];

// The river runs north to south into the lake. Water level falls along it.
export const RIVER = { pts: [[-40, -330], [-36, -210], [-28, -100], [-20, -18], [2, 70], [52, 150], [110, 205]], level0: 9.0, level1: 1.2, width: 11 };
export const LAKE = { at: [128, 228], r: 70, level: 1.2 };

// Paths. Terrain is carved to a smoothed profile along each, and the ground shader paints them.
// kind: 'dirt' | 'cobble'. Bridges are listed separately and placed as assets.
export const PATHS = [
  { id: 'rise_terraces', kind: 'dirt', w: 4.5, pts: [[-196, 168], [-176, 150], [-160, 128], [-128, 102], [-96, 76], [-66, 44], [-44, 14], [-34, -4]] },
  { id: 'mill_market', kind: 'cobble', w: 5, pts: [[-6, -8], [22, 0], [56, 10], [86, 16], [110, 18]] },
  { id: 'mill_ridge', kind: 'dirt', w: 4.5, pts: [[-36, -30], [-62, -58], [-96, -92], [-128, -118], [-156, -134], [-176, -140]] },
  { id: 'market_quarry', kind: 'dirt', w: 5, pts: [[112, 0], [122, -40], [124, -84], [136, -118], [152, -146], [162, -160]] },
  { id: 'mill_stair', kind: 'dirt', w: 4.5, pts: [[-2, -34], [6, -84], [22, -140], [40, -188]] },
  { id: 'stair', kind: 'cobble', w: 5, steep: true, pts: [[40, -188], [76, -204], [78, -218], [14, -230], [10, -244], [70, -256], [72, -268], [40, -280], [40, -290]] },
  { id: 'market_lake', kind: 'dirt', w: 4, pts: [[112, 40], [116, 90], [104, 140], [96, 168]] },
];

export const BRIDGES = [
  { at: [-20, -6], yaw: 0.14, len: 18 },   // Millbrook, on the mill-market road
  { at: [8, 76], yaw: 0.56, len: 18 },      // south footbridge
];

// The inkwells: the five hearts. `order` is only the teaching order; the middle four can be done in any order.
export const INKWELLS = [
  { id: 'terraces', place: 'terraces', at: [-110, 86] },
  { id: 'mill', place: 'mill', at: [-12, -46] },
  { id: 'market', place: 'market', at: [112, 22] },
  { id: 'ridge', place: 'ridge', at: [-160, -146] },
  { id: 'quarry', place: 'quarry', at: [164, -164] },
];

// Lanterns: checkpoints. Lit when the place they stand in is cleansed (the Rise one is lit at start).
export const LANTERNS = [
  { id: 'rise', at: [-186, 156] }, { id: 'terraces', at: [-98, 74] }, { id: 'mill', at: [-30, -22] },
  { id: 'market', at: [98, 30] }, { id: 'ridge', at: [-146, -126] }, { id: 'quarry', at: [146, -144] },
  { id: 'stair', at: [40, -192] }, { id: 'chapel', at: [40, -276] },
];

export const SPAWN = { at: [-192, 168], yaw: -0.82 };   // yaw 0 looks north (-z); this looks north-east, over the valley
