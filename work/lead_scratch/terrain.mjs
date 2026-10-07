// The valley's ground: one authored height function, sampled once into a grid that both the mesh
// and the physics read, so what you see is what you stand on.
import { WORLD, HALF, PLACES, RIVER, LAKE, PATHS } from './layout.mjs';

export const STEP = 2.5;
export const N = Math.round(WORLD / STEP) + 1;   // 257 samples a side

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

function hash2(ix, iz) { let h = (ix * 374761393 + iz * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  return lerp(lerp(hash2(ix, iz), hash2(ix + 1, iz), u), lerp(hash2(ix, iz + 1), hash2(ix + 1, iz + 1), u), v);
}
export function fbm(x, z, oct = 4) { let a = 0, f = 1, s = 0.5; for (let i = 0; i < oct; i++) { a += s * vnoise(x * f, z * f); f *= 2.03; s *= 0.5; } return a; }

const gauss = (x, z, cx, cz, r, h) => { const dx = x - cx, dz = z - cz; return h * Math.exp(-(dx * dx + dz * dz) / (r * r)); };
function segDist(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / (abx * abx + abz * abz || 1)));
  const qx = ax + abx * t, qz = az + abz * t; return [Math.hypot(px - qx, pz - qz), t];
}
// distance to a polyline, with the arc-length parameter (0..1) of the nearest point
export function polyDist(px, pz, pts) {
  let best = 1e9, bs = 0, acc = 0, total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i]; const L = Math.hypot(bx - ax, bz - az);
    const [d, t] = segDist(px, pz, ax, az, bx, bz);
    if (d < best) { best = d; bs = (acc + t * L) / total; }
    acc += L;
  }
  return [best, bs, total];
}
export function riverLevel(s) { return lerp(RIVER.level0, RIVER.level1, s); }

// The raw shape of the land, before paths are carved.
function rawHeight(x, z) {
  let h = 4.0;
  const r = Math.hypot(x * 0.92, z * 0.82);
  h += sstep(170, 330, r) * 30;                         // the rim of hills around the valley
  h += (fbm(x * 0.012 + 3.1, z * 0.012 - 1.7) - 0.5) * 7; // broad undulation
  h += (fbm(x * 0.05, z * 0.05, 3) - 0.5) * 1.6;           // small relief
  // Lampwright's Rise
  h += gauss(x, z, -192, 170, 72, 36);
  // Windmill Ridge: a long crest
  { const [d] = segDist(x, z, -236, -84, -112, -196); h += 30 * Math.pow(Math.max(0, 1 - d / 62), 1.6); }
  // the north mountain with the chapel
  h += gauss(x, z, 40, -296, 62, 58) + gauss(x, z, 10, -320, 80, 14);
  // quarry hill
  h += gauss(x, z, 176, -176, 78, 34);
  // market mound
  h += gauss(x, z, 112, 18, 60, 8);
  // olive terraces: step the slope below the Rise into 1.4 m benches
  { const [d] = segDist(x, z, -168, 136, -70, 50); const m = sstep(48, 30, d) * sstep(4, 9, h);
    if (m > 0) { const q = 1.4, k = h / q, fl = Math.floor(k), fr = k - fl; const st = (fl + sstep(0.78, 1.0, fr)) * q; h = lerp(h, st, m); } }
  // flat pads for the authored places
  const pad = (cx, cz, rad, w, ph) => { const d = Math.hypot(x - cx, z - cz); h = lerp(h, ph, sstep(rad + w, rad, d)); };
  pad(-192, 168, 20, 16, h > 0 ? 39.5 : 39.5);   // the workshop yard on the Rise
  pad(112, 18, 40, 22, 12.0);                    // the market square and streets
  pad(-22, -18, 30, 18, 6.0);                    // Millbrook village
  pad(40, -288, 20, 12, 61.0);                   // the chapel summit
  pad(-160, -140, 22, 14, 33.0);                 // ridge saddle with the inkwell
  // quarry pit: cut into the hill, two ledges and a floor
  { const d = Math.hypot(x - 166, z - 162 * -1); const m = sstep(50, 40, d);
    // stepped benches you can walk up: an amphitheatre of chalk, not a well
    if (m > 0) { const k = Math.max(0, d - 22) * 0.62, q = 1.6, fl = Math.floor(k / q), fr = k / q - fl; const ledge = 7 + (fl + sstep(0.55, 1.0, fr)) * q; h = lerp(h, Math.min(h, ledge), m); } }
  // river channel and lake basin
  { const [d, s] = polyDist(x, z, RIVER.pts); const wl = riverLevel(s);
    const bank = Math.max(wl + 1.4, h);
    h = lerp(wl - 1.8, bank, sstep(RIVER.width * 0.45, RIVER.width * 1.3, d)); if (d < RIVER.width * 2.4) h = Math.min(h, lerp(wl + 1.0, h, sstep(RIVER.width * 1.1, RIVER.width * 2.4, d))); }
  { const d = Math.hypot(x - LAKE.at[0], z - LAKE.at[1]); h = lerp(LAKE.level - 3.0, h, sstep(LAKE.r * 0.7, LAKE.r * 1.15, d)); }
  return h;
}

// Build the grid: raw heights, then carve every path to a smoothed, slope-limited profile.
export function buildTerrain() {
  const H = new Float32Array(N * N), P = new Uint8Array(N * N);   // P: path paint (0..255), kind in low bit of K
  const K = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) H[j * N + i] = rawHeight(-HALF + i * STEP, -HALF + j * STEP);
  const sample = (x, z) => bilinear(H, x, z);
  for (const p of PATHS) {
    // resample the polyline every 2 m, read heights, smooth, limit slope
    const pts = []; for (let i = 1; i < p.pts.length; i++) {
      const [ax, az] = p.pts[i - 1], [bx, bz] = p.pts[i]; const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 2));
      for (let k = 0; k < n; k++) pts.push([lerp(ax, bx, k / n), lerp(az, bz, k / n)]);
    }
    pts.push(p.pts[p.pts.length - 1]);
    let prof = pts.map(([x, z]) => sample(x, z));
    const win = p.steep ? 3 : 9;
    for (let pass = 0; pass < 3; pass++) prof = prof.map((_, i) => { let a = 0, c = 0; for (let k = -win; k <= win; k++) { const q = prof[Math.max(0, Math.min(prof.length - 1, i + k))]; a += q; c++; } return a / c; });
    const maxRise = p.steep ? 0.9 : 0.55;   // metres per 2 m sample: about 24 and 15 degrees
    for (let i = 1; i < prof.length; i++) prof[i] = Math.max(prof[i - 1] - maxRise, Math.min(prof[i - 1] + maxRise, prof[i]));
    for (let i = prof.length - 2; i >= 0; i--) prof[i] = Math.max(prof[i + 1] - maxRise, Math.min(prof[i + 1] + maxRise, prof[i]));
    p.profile = { pts, h: prof };
    // carve the grid near the path
    const reach = p.w + (p.steep ? 12 : 7);
    let minx = 1e9, maxx = -1e9, minz = 1e9, maxz = -1e9; for (const [x, z] of pts) { minx = Math.min(minx, x); maxx = Math.max(maxx, x); minz = Math.min(minz, z); maxz = Math.max(maxz, z); }
    const i0 = Math.max(0, Math.floor((minx - reach + HALF) / STEP)), i1 = Math.min(N - 1, Math.ceil((maxx + reach + HALF) / STEP));
    const j0 = Math.max(0, Math.floor((minz - reach + HALF) / STEP)), j1 = Math.min(N - 1, Math.ceil((maxz + reach + HALF) / STEP));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const x = -HALF + i * STEP, z = -HALF + j * STEP;
      // blend the road heights of every nearby stretch, weighted by distance: where two switchback legs
      // meet, taking only the nearest one leaves a cliff along the line where "nearest" changes
      let best = 1e9, sw = 0, sh = 0;
      for (let k = 1; k < pts.length; k++) { const [d, t] = segDist(x, z, pts[k - 1][0], pts[k - 1][1], pts[k][0], pts[k][1]); if (d < best) best = d; if (d < reach * 2) { const w = 1 / Math.pow(d + 1.5, 4); sw += w; sh += w * lerp(prof[k - 1], prof[k], t); } }
      const bh = sw > 0 ? sh / sw : 0;
      if (best > reach) continue;
      const idx = j * N + i, m = sstep(reach, p.w * 0.5, best);
      H[idx] = lerp(H[idx], bh, m);
      const paint = Math.round(255 * sstep(p.w * 0.5 + 1.2, p.w * 0.5 - 0.6, best));
      if (paint > P[idx]) { P[idx] = paint; K[idx] = p.kind === 'cobble' ? 1 : 0; }
    }
  }
  return { H, P, K, N, STEP, HALF, height: (x, z) => bilinear(H, x, z), normal: (x, z) => normalAt(H, x, z) };
}

export function bilinear(H, x, z) {
  const fx = Math.min(N - 1.001, Math.max(0, (x + HALF) / STEP)), fz = Math.min(N - 1.001, Math.max(0, (z + HALF) / STEP));
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, a = j * N + i;
  return lerp(lerp(H[a], H[a + 1], u), lerp(H[a + N], H[a + N + 1], u), v);
}
function normalAt(H, x, z) {
  const e = 1.0, hx = bilinear(H, x + e, z) - bilinear(H, x - e, z), hz = bilinear(H, x, z + e) - bilinear(H, x, z - e);
  const l = Math.hypot(hx, 2 * e, hz); return [-hx / l, 2 * e / l, -hz / l];
}

export { PLACES };
