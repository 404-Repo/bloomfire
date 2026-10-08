// Dresses the valley: authored placements per place, vegetation instanced per chunk, colliders.
// Only assets listed in assets/index.json are placed, so a module that does not exist yet never 404s.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ASSET, bakeStatic } from '../assetlib.js';
import { scene } from './render.js';
import { patchTree, patchMaterial } from './paint.js';
import { bakeJoints } from './fx.js';
import { addBox, addCircle, addDeck } from './collide.js';
import { PLACES, BRIDGES, LANTERNS, PATHS as ALLPATHS } from './layout.js';
import { waterLevelAt } from './ground.js';
import { polyDist } from './terrain.js';

let T = null, have = new Set();
const A = (n) => `./assets/${n}.js`;
export const W = { lanterns: [], animated: [], blocks: [], plumes: [], veg: [], stairLamps: [] };

// deterministic random
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(1709);
const faceTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

const HEIGHTS = {
  village_house: 7.2, tower_house: 11, water_mill: 9, stone_bridge: null, stone_steps: 2.4, terrace_wall: 1.2, windmill: 13.5, quarry_crane: 12,
  chapel: 14, clock_tower: 18, arcade_section: 8, market_stall: 2.6, stone_well: 2.6, lantern_post: 3.2,
  olive_tree: 4.6, cypress: 10, lemon_tree_pot: 3.2, lavender_bush: 0.7, grass_tuft: 0.55, flower_patch: 0.35, boulder: 1.7,
  cart: 1.5, barrel_cluster: 1.25, crate_stack: 1.4, amphora: 0.9, wooden_fence: 1.0, haystack: 2.2, field_wall: 1.0, chalk_block: 1.3,
};

// The block a placement belongs to: static scenery is baked per block so the far side can be culled.
const blocks = new Map();
function blockFor(x, z) { const k = Math.floor((x + 320) / 80) + ',' + Math.floor((z + 320) / 80); let b = blocks.get(k); if (!b) blocks.set(k, b = new THREE.Group()); return b; }

function footY(x, z, hw, hd, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw); let m = T.height(x, z);
  for (const [a, b] of [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]]) m = Math.min(m, T.height(x + a * c + b * s, z - a * s + b * c));
  return m;
}

// Place one static asset. Returns the object (already in its block) or null when the module is absent.
async function put(name, x, z, yaw = 0, o = {}) {
  if (!have.has(name)) return null;
  const obj = await ASSET(A(name), { height: o.height ?? HEIGHTS[name] ?? undefined, keepHierarchy: !!o.keep });
  const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
  const s = o.scale ?? 1; obj.scale.multiplyScalar(s); size.multiplyScalar(s);
  const y = o.y ?? (footY(x, z, size.x * 0.4, size.z * 0.4, yaw) - (o.sink ?? 0.08));
  obj.position.set(x, y, z); obj.rotation.y = yaw;
  if (o.collide !== false) {
    const cs = o.cscale ?? 0.92;
    if (o.circle) addCircle(x, z, o.circle, y, y + size.y);
    else addBox(x, z, size.x * 0.5 * cs, size.z * 0.5 * cs, yaw, y, y + (o.top ?? size.y), { walk: !!o.walk });
  }
  if (o.keep) { bakeJoints(obj); scene.add(obj); patchTree(obj); } else blockFor(x, z).add(obj);
  return obj;
}

// ---- instanced vegetation -------------------------------------------------------------------------
const species = new Map();   // name -> [{x,z,yaw,s}]
function plant(name, x, z, s = 1, yaw = R() * Math.PI * 2) { if (!species.has(name)) species.set(name, []); species.get(name).push({ x, z, s, yaw }); }
const FAR = { olive_tree: 230, grass_tuft: 120, lavender_bush: 150, boulder: 220, cypress: 320, lemon_tree_pot: 150 };
async function growSpecies(name, cast = true) {
  const list = species.get(name); if (!list || !have.has(name)) return;
  const proto = await ASSET(A(name), { height: HEIGHTS[name] });
  proto.updateMatrixWorld(true);
  // one geometry per species with the part colours baked into vertex colours, so a chunk is ONE draw
  const geos = []; let rough = 0, n = 0;
  proto.traverse((o) => {
    if (!o.isMesh) return;
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    const c = o.material.color || new THREE.Color(1, 1, 1), cnt = g.attributes.position.count, arr = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3)); geos.push(g); rough += o.material.roughness ?? 0.8; n++;
  });
  if (!geos.length) return;
  const geo = mergeGeometries(geos, false);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough / n, metalness: 0 }); mat.name = name === 'boulder' ? 'stone' : 'foliage';
  patchMaterial(mat);
  const chunks = new Map();
  for (const p of list) { const k = Math.floor((p.x + 320) / 128) + ',' + Math.floor((p.z + 320) / 128); if (!chunks.has(k)) chunks.set(k, []); chunks.get(k).push(p); }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  for (const pts of chunks.values()) {
    const im = new THREE.InstancedMesh(geo, mat, pts.length);
    pts.forEach((p, i) => {
      const y = T.height(p.x, p.z) - 0.05;
      e.set(0, p.yaw, 0); q.setFromEuler(e); sc.setScalar(p.s); pos.set(p.x, y, p.z);
      im.setMatrixAt(i, m.compose(pos, q, sc));
    });
    im.castShadow = cast; im.receiveShadow = true; im.computeBoundingSphere();
    im.userData.cast = cast; im.userData.far = FAR[name] || 260; scene.add(im); W.veg.push(im);
  }
  if (name === 'olive_tree' || name === 'cypress' || name === 'lemon_tree_pot') for (const p of list) addCircle(p.x, p.z, (name === 'cypress' ? 0.8 : name === 'olive_tree' ? 1.7 : 0.6) * p.s, T.height(p.x, p.z), T.height(p.x, p.z) + 3, { noRay: true });   // keeps you out of the canopy, lets sunlight through
}

// ---- the places -----------------------------------------------------------------------------------
async function dressRise() {
  await put('village_house', -206, 184, faceTo(-206, 184, -186, 160));
  await put('tower_house', -180, 184, faceTo(-180, 184, -192, 164));
  await put('stone_well', -184, 172, 0.4);
  await put('lemon_tree_pot', -198, 175, 0); await put('lemon_tree_pot', -201, 172, 0.5);
  await put('cart', -212, 166, 1.1); await put('barrel_cluster', -196, 188, 0.3);
  for (let a = 0; a < 26; a++) { const t = a / 26 * Math.PI * 2, r = 26 + R() * 6; const x = -192 + Math.cos(t) * r, z = 168 + Math.sin(t) * r; if (Math.cos(t) > 0.35 && Math.sin(t) < -0.2) continue; plant(R() < 0.6 ? 'olive_tree' : 'cypress', x, z, 0.85 + R() * 0.3); }
  for (let i = 0; i < 40; i++) plant('lavender_bush', -192 + (R() - 0.5) * 34, 168 + (R() - 0.5) * 34, 0.8 + R() * 0.5);
}

async function dressTerraces() {
  // terrace walls along the risers of the stepped slope; olive rows on the benches
  for (let gx = -175; gx <= -60; gx += 6) for (let gz = 40; gz <= 145; gz += 6) {
    const x = gx + (R() - 0.5) * 2, z = gz + (R() - 0.5) * 2;
    const n = T.normal(x, z); const slope = 1 - n[1];
    const along = Math.abs((x + 168) * 86 + (z - 136) * 98) / Math.hypot(86, 98);   // distance to the band axis
    if (along > 44 || T.height(x, z) < 5) continue;
    if (slope > 0.12) { const yaw = Math.atan2(n[0], n[2]); if (R() < 0.42) await put('terrace_wall', x, z, yaw, { sink: 0.5, cscale: 0.9 }); }
    else if (R() < 0.42) plant('olive_tree', x + (R() - 0.5) * 2, z + (R() - 0.5) * 2, 0.8 + R() * 0.35);
    else if (R() < 0.12) plant('lavender_bush', x, z, 1 + R() * 0.4);
  }
  await put('haystack', -132, 116, 0.3); await put('cart', -86, 66, 2.2);
}

async function dressMill() {
  const mill = await put('water_mill', -40, -46, 0, { keep: true });
  if (mill && mill.userData.joints && mill.userData.joints.wheel) W.animated.push({ node: mill.userData.joints.wheel, axis: 'x', speed: 0.6 });
  for (const [x, z, tx, tz] of [[-52, -12, -20, -10], [-54, 10, -20, 6], [-60, -30, -20, -26], [8, -26, -20, -24], [12, -2, -20, -4], [6, 20, -20, 14], [-4, -64, -20, -50], [-62, 26, -30, 10]]) await put('village_house', x, z, faceTo(x, z, tx, tz));
  await put('tower_house', -66, -46, faceTo(-66, -46, -30, -30));
  await put('stone_well', -34, 6, 0); await put('market_stall', -42, 2, Math.PI / 2); await put('market_stall', -40, 14, Math.PI / 2);
  await put('cart', -26, 22, 0.8); await put('barrel_cluster', -46, -24, 1); await put('crate_stack', 2, 8, 0.4);
  for (let i = 0; i < 18; i++) { const z = -80 + i * 9 + R() * 3, side = i % 2 ? 1 : -1; plant('cypress', -20 + side * (17 + R() * 6) + (z > 0 ? z * 0.25 : 0), z, 0.8 + R() * 0.3); }
  for (let i = 0; i < 30; i++) plant('olive_tree', -22 + (R() - 0.5) * 120, -18 + (R() - 0.5) * 110, 0.8 + R() * 0.3);
}

async function dressMarket() {
  await put('arcade_section', 97, -5, 0); await put('arcade_section', 90, 20, Math.PI / 2); await put('arcade_section', 124, -4, 0, {});
  await put('clock_tower', 134, -6, faceTo(134, -6, 112, 20));
  const ring = [[140, 12], [142, 30], [132, 46], [116, 50], [98, 46], [84, 36], [80, 4], [94, -16], [140, -22], [150, 8], [66, 22], [100, 64], [130, 64]];
  for (const [x, z] of ring) await put(R() < 0.25 ? 'tower_house' : 'village_house', x, z, faceTo(x, z, 112, 20));
  for (const [x, z] of [[100, 8], [102, 32], [124, 32], [126, 10], [112, 38]]) await put('market_stall', x, z, faceTo(x, z, 112, 20));
  await put('stone_well', 120, 28, 0.3); await put('cart', 96, 26, 1.9); await put('barrel_cluster', 128, 22, 0.2); await put('crate_stack', 98, 14, 0.6); await put('amphora', 126, 34, 0);
  for (let i = 0; i < 24; i++) { const t = R() * Math.PI * 2, r = 58 + R() * 22; plant(R() < 0.5 ? 'cypress' : 'olive_tree', 112 + Math.cos(t) * r, 18 + Math.sin(t) * r, 0.8 + R() * 0.3); }
}

async function dressRidge() {
  const a = [-236, -84], b = [-112, -196];
  for (const t of [0.06, 0.2, 0.34, 0.74, 0.86, 0.97]) {
    const x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
    const wm = await put('windmill', x, z, Math.PI * 0.25, { keep: true, circle: 3.2 });
    if (wm && wm.userData.joints && wm.userData.joints.sails) W.animated.push({ node: wm.userData.joints.sails, axis: 'z', speed: 0.5 + R() * 0.3 });
  }
  for (let i = 0; i < 14; i++) await put('haystack', -175 + (R() - 0.5) * 90, -140 + (R() - 0.5) * 70, R() * 3);
  for (let i = 0; i < 18; i++) { const x = -175 + (R() - 0.5) * 110, z = -140 + (R() - 0.5) * 80; await put('field_wall', x, z, R() * Math.PI, { sink: 0.3 }); }
  for (let i = 0; i < 70; i++) plant('lavender_bush', -175 + (R() - 0.5) * 80, -140 + (R() - 0.5) * 60, 0.9 + R() * 0.5);
  // lavender rows and olive rows down both flanks of the ridge, the way farmed hillsides look
  for (let r = 0; r < 9; r++) for (let k = 0; k < 22; k++) {
    const t = 0.08 + k * 0.04, side = r % 2 ? 1 : -1, off = 14 + Math.floor(r / 2) * 7;
    const x = a[0] + (b[0] - a[0]) * t + side * off * 0.67, z = a[1] + (b[1] - a[1]) * t + side * off * 0.74;
    if (T.normal(x, z)[1] < 0.72) continue;
    if (r < 4) plant('lavender_bush', x, z, 1.1); else if (k % 2 === 0) plant('olive_tree', x, z, 0.8 + R() * 0.2);
  }
  for (let i = 0; i < 8; i++) { const t = 0.1 + i * 0.11; await put('field_wall', a[0] + (b[0] - a[0]) * t + 10, a[1] + (b[1] - a[1]) * t + 11, Math.atan2(b[0] - a[0], b[1] - a[1]) + Math.PI / 2, { sink: 0.3 }); }
}

async function dressQuarry() {
  await put('quarry_crane', 140, -168, Math.PI / 2); await put('quarry_crane', 188, -146, -Math.PI / 2.4);
  for (let i = 0; i < 26; i++) { const t = R() * Math.PI * 2, r = 6 + R() * 34; await put('chalk_block', 166 + Math.cos(t) * r, -162 + Math.sin(t) * r, R() * 3, { scale: 0.7 + R() * 0.8, walk: true }); }
  await put('cart', 150, -150, 0.6);
}

async function dressStairAndChapel() {
  // lanterns up the Pilgrim Stair, one at every switchback; they light when the stair opens
  const { PATHS } = await import('./layout.js');
  const st = PATHS.find((p) => p.id === 'stair').pts;
  for (let i = 1; i < st.length - 1; i++) {
    const [x, z] = st[i], [px, pz] = st[i - 1], dx = x - px, dz = z - pz, l = Math.hypot(dx, dz) || 1;
    const lx = x + dz / l * 3.4, lz = z - dx / l * 3.4;
    const obj = await put('lantern_post', lx, lz, 0, { keep: true, circle: 0.3 });
    const glass = []; if (obj) obj.traverse((o) => { if (o.material && o.material.name === 'lamp_glass') { o.material = o.material.clone(); o.material.userData.noPaint = true; glass.push(o.material); } });
    W.stairLamps.push({ obj, glass, at: [lx, lz] });
  }
  await put('chapel', 40, -305, 0, { cscale: 0.95 });
  for (const [x, z] of [[24, -298], [56, -298], [22, -280], [58, -280]]) plant('cypress', x, z, 0.9);
  for (let i = 0; i < 26; i++) { const x = 40 + (R() - 0.5) * 120, z = -240 + (R() - 0.5) * 70;
    if (polyDist(x, z, st)[0] < 11) continue;   // keep the stair clear
    plant('cypress', x, z, 0.7 + R() * 0.3); }
}

// the near field along every path: lavender, stones, grass clumps, the odd wall or fence
async function dressPaths() {
  const { PATHS } = await import('./layout.js');
  for (const p of PATHS) {
    for (let i = 1; i < p.pts.length; i++) {
      const [ax, az] = p.pts[i - 1], [bx, bz] = p.pts[i], L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 6);
      const dx = (bx - ax) / L, dz = (bz - az) / L;
      for (let k = 0; k < n; k++) {
        const t = (k + R()) / n, cx = ax + (bx - ax) * t, cz = az + (bz - az) * t;
        for (const side of [-1, 1]) {
          const off = p.w * 0.5 + 1.2 + R() * 2.5, x = cx - dz * off * side, z = cz + dx * off * side;
          if (waterLevelAt(x, z) > -50 || PLACES.some((q) => Math.hypot(x - q.at[0], z - q.at[1]) < q.r * 0.5)) continue;
          const r = R();
          if (r < 0.35) plant('lavender_bush', x, z, 0.8 + R() * 0.6);
          else if (r < 0.47) plant('boulder', x, z, 0.35 + R() * 0.5);
          else if (r < 0.52 && !p.steep) await put('field_wall', x - dz * side * 0.6, z + dx * side * 0.6, Math.atan2(dx, dz) + Math.PI / 2, { sink: 0.25 });
          for (let g = 0; g < 3; g++) plant('grass_tuft', x + (R() - 0.5) * 3, z + (R() - 0.5) * 3, 0.8 + R() * 0.8);
        }
      }
    }
  }
}

async function dressCountry() {
  await dressPaths();
  for (let i = 0; i < 2600; i++) { const x = (R() - 0.5) * 560, z = (R() - 0.5) * 560; if (waterLevelAt(x, z) > -50 || T.normal(x, z)[1] < 0.75) continue; plant('grass_tuft', x, z, 0.8 + R() * 0.7); }
  // olive groves and cypress clumps across the valley floor, boulders on slopes; away from paths and water
  for (let i = 0; i < 520; i++) {
    const x = (R() - 0.5) * 560, z = (R() - 0.5) * 560;
    if (waterLevelAt(x, z) > -50) continue;
    const near = PLACES.some((p) => Math.hypot(x - p.at[0], z - p.at[1]) < p.r * 0.75); if (near) continue;
    if (ALLPATHS.some((p) => polyDist(x, z, p.pts)[0] < p.w + 2)) continue;   // nothing growing in the road
    const n = T.normal(x, z); const h = T.height(x, z);
    if (n[1] < 0.8) { if (R() < 0.3) plant('boulder', x, z, 0.7 + R() * 1.2); continue; }
    const r = R(); plant(r < 0.55 ? 'olive_tree' : r < 0.8 ? 'cypress' : 'lavender_bush', x, z, 0.75 + R() * 0.4);
    if (h > 20 && R() < 0.2) plant('boulder', x + 3, z + 2, 0.6 + R());
  }
}

export async function buildWorld(terrain, onProgress) {
  T = terrain;
  try { have = new Set(await (await fetch('./assets/index.json', { cache: 'no-store' })).json()); } catch { have = new Set(); }
  const steps = [dressRise, dressTerraces, dressMill, dressMarket, dressRidge, dressQuarry, dressStairAndChapel, dressCountry];
  for (let i = 0; i < steps.length; i++) { await steps[i](); onProgress((i + 1) / (steps.length + 3), 'dressing ' + (PLACES[i]?.name || 'the valley')); }
  // bridges are walkable decks, with low parapet colliders
  for (const b of BRIDGES) {
    if (!have.has('stone_bridge')) break;
    const y = Math.min(T.height(b.at[0] - Math.cos(b.yaw) * 9, b.at[1] + Math.sin(b.yaw) * 9), T.height(b.at[0] + Math.cos(b.yaw) * 9, b.at[1] - Math.sin(b.yaw) * 9)) - 0.35;
    await put('stone_bridge', b.at[0], b.at[1], b.yaw, { y, collide: false, height: 3.2 });
    addDeck(b.at[0], b.at[1], 9.2, 1.8, b.yaw, (lx) => y + 0.4 + 2.0 * Math.cos(Math.PI * lx / 18));
    for (const side of [-1, 1]) { const [ox, oz] = [Math.sin(b.yaw) * side * 1.95, Math.cos(b.yaw) * side * 1.95]; addBox(b.at[0] + ox, b.at[1] + oz, 8.5, 0.18, b.yaw, y, y + 3.4, { noRay: true }); }
  }
  // lanterns: the checkpoints, kept separate so they can light up
  for (const l of LANTERNS) {
    const obj = await put('lantern_post', l.at[0], l.at[1], 0, { keep: true, circle: 0.3 });
    const glass = []; if (obj) obj.traverse((o) => { if (o.material && o.material.name === 'lamp_glass') { o.material = o.material.clone(); o.material.userData.noPaint = true; glass.push(o.material); } });
    const light = new THREE.PointLight(0xffc070, 0, 14, 1.6); light.position.set(l.at[0], (obj ? obj.position.y : T.height(...l.at)) + 3.0, l.at[1]); scene.add(light);
    W.lanterns.push({ ...l, obj, glass, light, lit: false });
  }
  onProgress(0.85, 'growing the olives');
  await makeRing();
  for (const n of ['olive_tree', 'cypress', 'lavender_bush', 'boulder', 'lemon_tree_pot', 'grass_tuft']) await growSpecies(n, n !== 'lavender_bush' && n !== 'grass_tuft');
  // bake each block of static scenery
  for (const g of blocks.values()) {
    const baked = bakeStatic(g); patchTree(baked); baked.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(baked); W.blocks.push(baked);
  }
  onProgress(1, 'done');
}

export function litLantern(id, on = true) {
  const l = W.lanterns.find((q) => q.id === id); if (!l) return null;
  l.lit = on; l.light.intensity = on ? 18 : 0; for (const m of l.glass) m.emissiveIntensity = on ? 2.4 : 0;
  return l;
}

// the near field: a ring of grass and stones that follows you, so the ground within 30 m is never bare
const TOWNS = PLACES.filter((p) => ['rise', 'mill', 'market', 'chapel'].includes(p.id));
const RING = { mesh: [], cell: 2.3, n: 26, cx: 1e9, cz: 1e9 };
async function makeRing() {
  for (const [name, h, per] of [['grass_tuft', 0.38, 0.75], ['boulder', 0.5, 0.06], ['lavender_bush', 0.6, 0.05]]) {
    if (!have.has(name)) continue;
    const proto = await ASSET(A(name), { height: h }); proto.updateMatrixWorld(true);
    const geos = []; let rough = 0, n = 0;
    proto.traverse((o) => { if (!o.isMesh) return; const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
      for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
      const c = o.material.color, cnt = g.attributes.position.count, arr = new Float32Array(cnt * 3); for (let i = 0; i < cnt; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(arr, 3)); geos.push(g); rough += o.material.roughness ?? 0.9; n++; });
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough / n }); mat.name = name === 'boulder' ? 'stone' : 'foliage'; patchMaterial(mat);
    const im = new THREE.InstancedMesh(mergeGeometries(geos, false), mat, RING.n * RING.n); im.frustumCulled = false; im.receiveShadow = true;
    im.userData.per = per; im.userData.seed = RING.mesh.length * 977; scene.add(im); RING.mesh.push(im);
  }
}
const _rm = new THREE.Matrix4(), _rq = new THREE.Quaternion(), _rs = new THREE.Vector3(), _rp = new THREE.Vector3(), _ry = new THREE.Vector3(0, 1, 0);
const hh = (i, j, k) => { let h = (i * 374761393 + j * 668265263 + k * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
function updateRing(cam) {
  const ci = Math.floor(cam.position.x / RING.cell), cj = Math.floor(cam.position.z / RING.cell);
  if (ci === RING.cx && cj === RING.cz) return; RING.cx = ci; RING.cz = cj;
  for (const im of RING.mesh) {
    let k = 0; const per = im.userData.per, sd = im.userData.seed;
    for (let j = -RING.n / 2; j < RING.n / 2; j++) for (let i = -RING.n / 2; i < RING.n / 2; i++) {
      const gi = ci + i, gj = cj + j; if (hh(gi, gj, sd) > per) continue;
      const x = (gi + hh(gi, gj, sd + 1)) * RING.cell, z = (gj + hh(gi, gj, sd + 2)) * RING.cell;
      if (waterLevelAt(x, z) > -50 || T.normal(x, z)[1] < 0.7) continue;
      if (per < 0.5 && TOWNS.some((q) => Math.hypot(x - q.at[0], z - q.at[1]) < q.r * 0.75)) continue;   // no boulders in a square
      const s = (0.7 + hh(gi, gj, sd + 3) * 0.9) * (per < 0.5 ? 1.4 : 1);
      _rq.setFromAxisAngle(_ry, hh(gi, gj, sd + 4) * 6.28); _rs.setScalar(s); _rp.set(x, T.height(x, z) - 0.04, z);
      im.setMatrixAt(k++, _rm.compose(_rp, _rq, _rs));
    }
    im.count = k; im.instanceMatrix.needsUpdate = true;
  }
}

// far vegetation chunks are hidden and only near ones cast shadows
const _c = new THREE.Vector3();
export function lightStair() { for (const l of W.stairLamps) for (const m of l.glass) m.emissiveIntensity = 2.6; }
export function updateWorld(dt, t, cam) {
  if (cam) updateRing(cam);
  if (cam) for (const im of W.veg) { const s = im.boundingSphere; _c.copy(s.center); const d = _c.distanceTo(cam.position) - s.radius; im.visible = d < im.userData.far; im.castShadow = im.userData.cast && d < 40; }
  for (const a of W.animated) a.node.rotation[a.axis] += a.speed * dt;
}
