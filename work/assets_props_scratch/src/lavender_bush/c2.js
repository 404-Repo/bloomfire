// lavender_bush c2: part breakdown. Five overlapping squashed icosahedron leaf blobs make the mound; 36 thin open three-sided cones fan out of it as lavender spikes.
const leaf = M(0x7d8a63, 'foliage', 0.9, { flatShading: true }), leaf2 = M(0x8f9a74, 'foliage', 0.9, { flatShading: true }), flower = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true, side: THREE.DoubleSide });
[[0, 0.18, 0, 0.32], [0.26, 0.12, 0.08, 0.22], [-0.25, 0.12, -0.05, 0.24], [0.05, 0.12, 0.27, 0.22], [-0.04, 0.12, -0.27, 0.22]].forEach(([x, y, z, r], i) => add(new THREE.IcosahedronGeometry(r, 0), i % 2 ? leaf2 : leaf, x, y, z, i, i, 0, 1.15, 0.75, 1.15));
for (let i = 0; i < 36; i++) {
  const u = (i * 0.618) % 1; const a = i * 2.39996; const lean = 0.15 + 0.9 * (1 - u);
  const dir = V(Math.cos(a) * lean, 1, Math.sin(a) * lean).normalize();
  const base = V(Math.cos(a) * 0.18 * (1 - u), 0.2, Math.sin(a) * 0.18 * (1 - u));
  const L = rr(0.36, 0.5); const c = base.clone().addScaledVector(dir, L * 0.62);
  const ms = add(new THREE.ConeGeometry(0.03, L * 0.55, 3, 1, true), flower, c.x, c.y, c.z);
  ms.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
}
