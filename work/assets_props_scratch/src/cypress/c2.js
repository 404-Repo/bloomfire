// cypress c2: part breakdown. A slim lathed core wrapped in sixteen elongated icosahedron tufts set round it on a flame-shaped envelope, so the column is clumpy like brush strokes.
const leaf = M(0x2f4a2a, 'foliage', 0.9, { flatShading: true }), leaf2 = M(0x36522f, 'foliage', 0.9, { flatShading: true });
const bark = M(0x4a3324, 'timber', 0.95);
const env = (y) => y < 1 ? 0.5 + y * 0.4 : Math.max(0.05, 0.95 * Math.pow(1 - (y - 1) / 9, 0.8));
const core = [[0, 0.4], [0.5, 0.5], [0.72, 1.5], [0.72, 3.5], [0.6, 5.5], [0.4, 7.5], [0.15, 9.2], [0, 9.9]].map(([r, y]) => new THREE.Vector2(r, y));
add(new THREE.LatheGeometry(core, 6), leaf);
for (let i = 0; i < 16; i++) {
  const y = 0.9 + i * 0.52; const a = i * 2.4; const r = env(y) * 0.55;
  const ge = new THREE.IcosahedronGeometry(1, 0);
  add(ge, i % 3 ? leaf : leaf2, Math.cos(a) * r, y, Math.sin(a) * r, rr(-0.3, 0.3), a, rr(-0.2, 0.2), env(y) * 0.72, 0.85 + (i < 13 ? 0.3 : 0), env(y) * 0.72);
}
add(new THREE.ConeGeometry(0.2, 0.9, 5), leaf2, 0.03, 9.55, 0);
add(new THREE.CylinderGeometry(0.13, 0.18, 0.5, 6), bark, 0, 0.25, 0);
