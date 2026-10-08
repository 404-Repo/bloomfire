// Static colliders on a spatial hash: oriented boxes and circles with a vertical span, plus walkable
// decks (bridges) whose height is a function. Used by the player, the ink, and line-of-sight rays.
const CELL = 16;
const grid = new Map();
export const colliders = [];
const key = (i, j) => i * 73856093 ^ j * 19349663;

function insert(c) {
  colliders.push(c);
  const r = c.kind === 'circle' ? c.r : Math.hypot(c.hw, c.hd);
  const i0 = Math.floor((c.x - r) / CELL), i1 = Math.floor((c.x + r) / CELL), j0 = Math.floor((c.z - r) / CELL), j1 = Math.floor((c.z + r) / CELL);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = key(i, j); let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(c); }
  return c;
}
export function addBox(x, z, hw, hd, yaw, y0, top, extra = {}) {
  return insert({ kind: 'box', x, z, hw, hd, yaw, c: Math.cos(yaw), s: Math.sin(yaw), y0, top, ...extra });
}
export function addCircle(x, z, r, y0, top, extra = {}) { return insert({ kind: 'circle', x, z, r, y0, top, ...extra }); }
// a deck: a box footprint whose walkable height is fn(localX, localZ) (absolute y)
export function addDeck(x, z, hw, hd, yaw, fn, extra = {}) {
  return insert({ kind: 'box', deck: fn, x, z, hw, hd, yaw, c: Math.cos(yaw), s: Math.sin(yaw), y0: -99, top: -99, ...extra });
}
export function removeCollider(c) {
  const i = colliders.indexOf(c); if (i >= 0) colliders.splice(i, 1);
  for (const a of grid.values()) { const k = a.indexOf(c); if (k >= 0) a.splice(k, 1); }
}

const seen = new Set();
export function nearby(x, z, r, out = []) {
  out.length = 0; seen.clear();
  const i0 = Math.floor((x - r) / CELL), i1 = Math.floor((x + r) / CELL), j0 = Math.floor((z - r) / CELL), j1 = Math.floor((z + r) / CELL);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const a = grid.get(key(i, j)); if (a) for (const c of a) if (!seen.has(c)) { seen.add(c); out.push(c); } }
  return out;
}
// to box-local coordinates (box yaw rotates about +y like three.js)
export function toLocal(c, x, z) { const dx = x - c.x, dz = z - c.z; return [dx * c.c - dz * c.s, dx * c.s + dz * c.c]; }
function fromLocalDir(c, lx, lz) { return [lx * c.c + lz * c.s, -lx * c.s + lz * c.c]; }

// Highest walkable surface under (x,z) that is not above `maxY` (what you could be standing on).
export function surfaceAt(x, z, maxY, base) {
  let h = base; const list = nearby(x, z, 1, tmp);
  for (const c of list) {
    if (c.kind === 'circle') { if (c.walk && Math.hypot(x - c.x, z - c.z) < c.r && c.top <= maxY && c.top > h) h = c.top; continue; }
    const [lx, lz] = toLocal(c, x, z); if (Math.abs(lx) > c.hw || Math.abs(lz) > c.hd) continue;
    const top = c.deck ? c.deck(lx, lz) : c.top;
    if ((c.walk || c.deck) && top <= maxY && top > h) h = top;
  }
  return h;
}
const tmp = [];

// Push a circle (x,z,r) out of every collider whose span overlaps [y0,y1]. Returns the pushed position and
// the lowest obstacle top it was pushed by (for mantling), or null.
export function pushOut(p, r, y0, y1, res) {
  res.blockTop = null; res.nx = 0; res.nz = 0;
  const list = nearby(p.x, p.z, r + 1, tmp);
  for (const c of list) {
    if (c.deck || c.top <= y0 || c.y0 >= y1 || c.ghost) continue;
    if (c.kind === 'circle') {
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + r;
      if (d < m && d > 1e-5) { p.x += dx / d * (m - d); p.z += dz / d * (m - d); res.nx = dx / d; res.nz = dz / d; if (res.blockTop === null || c.top < res.blockTop) res.blockTop = c.top; }
      continue;
    }
    const [lx, lz] = toLocal(c, p.x, p.z);
    const qx = Math.max(-c.hw, Math.min(c.hw, lx)), qz = Math.max(-c.hd, Math.min(c.hd, lz));
    let dx = lx - qx, dz = lz - qz, d = Math.hypot(dx, dz);
    if (d >= r) continue;
    if (d < 1e-5) { // centre inside the box: leave by the nearest face
      const ex = c.hw - Math.abs(lx), ez = c.hd - Math.abs(lz);
      if (ex < ez) { dx = Math.sign(lx) || 1; dz = 0; d = 0; const push = ex + r; const [wx, wz] = fromLocalDir(c, dx * push, 0); p.x += wx; p.z += wz; }
      else { dz = Math.sign(lz) || 1; dx = 0; d = 0; const push = ez + r; const [wx, wz] = fromLocalDir(c, 0, dz * push); p.x += wx; p.z += wz; }
      const [nx, nz] = fromLocalDir(c, dx, dz); res.nx = nx; res.nz = nz;
    } else {
      const k = (r - d) / d; const [wx, wz] = fromLocalDir(c, dx * k, dz * k); p.x += wx; p.z += wz;
      const [nx, nz] = fromLocalDir(c, dx / d, dz / d); res.nx = nx; res.nz = nz;
    }
    if (res.blockTop === null || c.top < res.blockTop) res.blockTop = c.top;
  }
  return res;
}

// Ray against colliders: returns distance or Infinity. o, d are {x,y,z}; d normalised.
export function rayColliders(o, d, maxT) {
  let best = maxT;
  const steps = Math.ceil(maxT / CELL) + 1; seen.clear();
  const cand = [];
  for (let s = 0; s <= steps; s++) {
    const t = Math.min(maxT, s * CELL), x = o.x + d.x * t, z = o.z + d.z * t;
    const i = Math.floor(x / CELL), j = Math.floor(z / CELL);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const a = grid.get(key(i + di, j + dj)); if (a) for (const c of a) if (!seen.has(c)) { seen.add(c); cand.push(c); } }
  }
  for (const c of cand) {
    if (c.deck || c.noRay) continue;
    let t;
    if (c.kind === 'circle') t = rayCyl(o, d, c);
    else t = rayObb(o, d, c);
    if (t < best) best = t;
  }
  return best;
}
function rayCyl(o, d, c) {
  const ox = o.x - c.x, oz = o.z - c.z, a = d.x * d.x + d.z * d.z; if (a < 1e-8) return Infinity;
  const b = ox * d.x + oz * d.z, cc = ox * ox + oz * oz - c.r * c.r, disc = b * b - a * cc; if (disc < 0) return Infinity;
  const t = (-b - Math.sqrt(disc)) / a; if (t < 0) return Infinity;
  const y = o.y + d.y * t; return y >= c.y0 && y <= c.top ? t : Infinity;
}
function rayObb(o, d, c) {
  const [lx, lz] = toLocal(c, o.x, o.z), dx = d.x * c.c - d.z * c.s, dz = d.x * c.s + d.z * c.c;
  let t0 = 0, t1 = Infinity;
  const slab = (p, v, lo, hi) => { if (Math.abs(v) < 1e-8) return p >= lo && p <= hi; let a = (lo - p) / v, b = (hi - p) / v; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); return t0 <= t1; };
  if (!slab(lx, dx, -c.hw, c.hw) || !slab(lz, dz, -c.hd, c.hd) || !slab(o.y, d.y, c.y0, c.top)) return Infinity;
  return t0;
}
