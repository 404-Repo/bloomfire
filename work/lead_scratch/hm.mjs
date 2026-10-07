import { buildTerrain, N } from './terrain.mjs';
import fs from 'fs';
const t0=Date.now(); const T = buildTerrain(); console.log('built', Date.now()-t0,'ms');
let mn=1e9,mx=-1e9; for (const v of T.H){mn=Math.min(mn,v);mx=Math.max(mx,v);} console.log('h range',mn.toFixed(1),mx.toFixed(1));
fs.writeFileSync('hm.bin', Buffer.from(T.H.buffer)); fs.writeFileSync('pm.bin', Buffer.from(T.P.buffer));
for (const [n,x,z] of [['rise',-192,168],['mill',-22,-18],['market',112,18],['ridge',-160,-140],['quarry',166,-162],['chapel',40,-288],['stairbase',40,-188]]) console.log(n, T.height(x,z).toFixed(1));
