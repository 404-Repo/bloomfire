import { buildTerrain } from './terrain.mjs';
import fs from 'fs';
const T = buildTerrain(); const out = [];
for (let z = -305; z <= -175; z += 1) { const row = []; for (let x = -10; x <= 110; x += 1) { const n = T.normal(x, z); row.push([T.height(x, z), n[1]]); } out.push(row); }
fs.writeFileSync('stair.json', JSON.stringify(out));
