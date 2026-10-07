// barrel_cluster c3: another arrangement. Two lathed barrels standing side by side, a small slatted crate on top of one, a tall amphora leaning against them and a little jug at its foot; the group reads as a stacked corner rather than a row.
const wood = M(0x7a5534, 'timber', 0.9, { flatShading: true, side: THREE.DoubleSide }), lid = M(0x8a6440, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5, side: THREE.DoubleSide }), terra = M(0xc0603a, 'tile', 0.85, { side: THREE.DoubleSide });
const crateM = M(0x8a6a44, 'timber', 0.9), frameM = M(0x6b4a2e, 'timber', 0.9), inner = M(0x3a2a1c, 'timber', 1.0);
const H = 0.9, R = 0.31, r = 0.26;
const bprof = []; for (let i = 0; i <= 6; i++) bprof.push(new THREE.Vector2(r + (R - r) * Math.sin(Math.PI * i / 6), i / 6 * H));
const barrel = (x, z) => {
  add(new THREE.LatheGeometry(bprof, 12), wood, x, 0, z);
  add(new THREE.CircleGeometry(r - 0.01, 12), lid, x, H - 0.02, z, -Math.PI / 2);
  for (const hy of [0.1, 0.32, 0.58, 0.8]) { const rb = r + (R - r) * Math.sin(Math.PI * hy / H) + 0.01; add(new THREE.LatheGeometry([new THREE.Vector2(rb, 0), new THREE.Vector2(rb + 0.005, 0.045)], 12), iron, x, hy, z); }
};
barrel(-0.33, -0.05); barrel(0.33, -0.12);
const cs = 0.35, cy = H + cs / 2;
add(new THREE.BoxGeometry(cs * 0.9, cs * 0.9, cs * 0.9), inner, 0.3, cy, -0.12, 0, 0.3, 0);
for (let i = 0; i < 3; i++) { const y = cy - cs / 2 + 0.06 + i * 0.115; for (const ry of [0.3, 0.3 + Math.PI / 2]) for (const sd of [-1, 1]) add(new THREE.BoxGeometry(cs, 0.08, 0.025), crateM, 0.3 + Math.sin(ry) * sd * cs / 2, y, -0.12 + Math.cos(ry) * sd * cs / 2, 0, ry, 0); }
for (const [lx, lz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const c = Math.cos(0.3), sn = Math.sin(0.3); add(new THREE.BoxGeometry(0.04, cs, 0.04), frameM, 0.3 + (lx * c + lz * sn) * cs / 2, cy, -0.12 + (-lx * sn + lz * c) * cs / 2, 0, 0.3, 0); }
const aprof = [[0, 0], [0.05, 0.0], [0.07, 0.05], [0.15, 0.2], [0.18, 0.36], [0.16, 0.5], [0.09, 0.6], [0.06, 0.64], [0.06, 0.76], [0.085, 0.8], [0.06, 0.81]].map(([a, b]) => new THREE.Vector2(a, b));
const amp = add(new THREE.LatheGeometry(aprof, 10), terra, 0.02, 0.0, 0.33, -0.22, 0, 0.05);
add(new THREE.TorusGeometry(0.06, 0.015, 3, 6), terra, 0.14, 0.62, 0.22, -0.22, Math.PI / 2, 0);
add(new THREE.TorusGeometry(0.06, 0.015, 3, 6), terra, -0.1, 0.62, 0.22, -0.22, Math.PI / 2, 0);
add(new THREE.LatheGeometry([[0, 0], [0.06, 0], [0.09, 0.08], [0.07, 0.17], [0.04, 0.2], [0.05, 0.24], [0.035, 0.24]].map(([a, b]) => new THREE.Vector2(a, b)), 8), terra, -0.32, 0, 0.36);
