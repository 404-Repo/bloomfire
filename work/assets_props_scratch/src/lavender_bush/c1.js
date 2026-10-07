// lavender_bush c1: primitives. Lumpy grey-green half-dome mound with 20 radiating stems, each a green octahedron stalk tipped with a stretched lavender octahedron spike.
const leaf = M(0x7d8a63, 'foliage', 0.9, { flatShading: true }), stem = M(0x8a9a6a, 'foliage', 0.9, { flatShading: true }), flower = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true });
add(warp(new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), (p) => { p.multiplyScalar(1 + 0.12 * noise(p.x * 9, p.y * 9, p.z * 9)); p.y *= 0.95; }), leaf, 0, 0, 0, 0, 0, 0, 1.25, 1, 1.25);
for (let i = 0; i < 20; i++) {
  const u = 0.25 + 0.75 * ((i * 0.618) % 1); const a = i * 2.39996;
  const dir = V(Math.cos(a) * (1 - u) * 0.9, 0.35 + u, Math.sin(a) * (1 - u) * 0.9).normalize();
  const base = V(Math.cos(a) * 0.3 * (1 - u * 0.6), 0.22 + u * 0.12, Math.sin(a) * 0.3 * (1 - u * 0.6));
  const sMid = base.clone().addScaledVector(dir, 0.12), tip = base.clone().addScaledVector(dir, 0.32);
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir);
  const s = add(new THREE.OctahedronGeometry(1), stem, sMid.x, sMid.y, sMid.z, 0, 0, 0, 0.012, 0.12, 0.012); s.quaternion.copy(q);
  const f = add(new THREE.OctahedronGeometry(1), flower, tip.x, tip.y, tip.z, 0, 0, 0, 0.035, 0.11, 0.035); f.quaternion.copy(q);
}
