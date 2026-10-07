// barrel_cluster c1: primitives. Barrels are 12-sided cylinders bulged by warping, with three iron torus hoops and a lid; one stands, one lies chocked on top of a framed crate; an amphora of sphere + cylinders + torus handles stands in front.
const wood = M(0x7a5534, 'timber', 0.9, { flatShading: true }), lid = M(0x8a6440, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5 }), terra = M(0xc0603a, 'tile', 0.85);
const crateM = M(0x8a6a44, 'timber', 0.9), frameM = M(0x6b4a2e, 'timber', 0.9);
const barrel = (x, y, z, rx, rz) => {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.set(rx, 0, rz); g.add(grp);
  const a = (geo, mat, py, rot = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.y = py; ms.rotation.x = rot; grp.add(ms); };
  a(warp(new THREE.CylinderGeometry(0.26, 0.26, 0.9, 12, 4, true), (p) => { const k = 1 + 0.2 * Math.cos(p.y / 0.45 * Math.PI / 2); p.x *= k; p.z *= k; }), wood, 0);
  a(new THREE.CircleGeometry(0.26, 12), lid, 0.45, -Math.PI / 2); a(new THREE.CircleGeometry(0.26, 12), lid, -0.45, Math.PI / 2);
  for (const hy of [-0.36, 0, 0.36]) { const r = 0.26 * (1 + 0.2 * Math.cos(hy / 0.45 * Math.PI / 2)) + 0.008; a(new THREE.TorusGeometry(r, 0.018, 3, 12), iron, hy, Math.PI / 2); }
};
const crate = (s, x, z, ry) => {
  add(new THREE.BoxGeometry(s * 0.94, s * 0.94, s * 0.94), crateM, x, s / 2, z, 0, ry, 0);
  const t = s * 0.08;
  for (const [ax, ay, az] of [[1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0]]) add(new THREE.BoxGeometry(s, t, t), frameM, x, s / 2 + ay * (s - t) / 2, z + ax * (s - t) / 2, 0, ry, 0);
  const c = Math.cos(ry), sn = Math.sin(ry);
  for (const [lx, lz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) add(new THREE.BoxGeometry(t, s, t), frameM, x + (lx * c + lz * sn) * (s - t) / 2, s / 2, z + (-lx * sn + lz * c) * (s - t) / 2, 0, ry, 0);
  for (const sd of [-1, 1]) add(new THREE.BoxGeometry(t * 0.8, s * 1.2, t * 0.6), frameM, x + sn * sd * s * 0.48, s / 2, z + c * sd * s * 0.48, 0, ry, Math.PI / 4);
};
barrel(-0.42, 0.45, -0.1, 0, 0);
crate(0.6, 0.38, -0.15, 0.15);
barrel(0.38, 0.6 + 0.315, -0.15, 0, Math.PI / 2);
add(new THREE.SphereGeometry(0.18, 10, 7), terra, 0.0, 0.3, 0.38, 0, 0, 0, 1, 1.3, 1);
add(new THREE.CylinderGeometry(0.06, 0.12, 0.16, 10, 1, true), terra, 0.0, 0.58, 0.38);
add(new THREE.TorusGeometry(0.065, 0.018, 3, 10), terra, 0.0, 0.67, 0.38, Math.PI / 2);
add(new THREE.CylinderGeometry(0.08, 0.06, 0.08, 10), terra, 0.0, 0.04, 0.38);
for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.06, 0.014, 3, 6, Math.PI), terra, s * 0.09, 0.56, 0.38, 0, 0, -s * Math.PI / 2);
for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.08, 0.06, 0.5), frameM, 0.38 + s * 0.22, 0.63, -0.15, 0, 0.15, 0);
