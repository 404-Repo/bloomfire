// lemon_tree_pot c1: primitives. Tapered cylinder pot with torus rim and band, soil disc, straight cylinder trunk, one lumpy sphere canopy studded with 24 octahedron lemons.
const pot = M(0xc0603a, 'tile', 0.85), soil = M(0x5a4030, 'ground', 1.0), bark = M(0x6b5640, 'timber', 0.95);
const leaf = M(0x557a2e, 'foliage', 0.85, { flatShading: true }), fruit = M(0xe9c53a, 'foliage', 0.7, { flatShading: true });
add(new THREE.CylinderGeometry(0.5, 0.36, 0.8, 12), pot, 0, 0.4, 0);
add(new THREE.TorusGeometry(0.5, 0.06, 4, 12), pot, 0, 0.8, 0, Math.PI / 2);
add(new THREE.TorusGeometry(0.42, 0.04, 4, 12), pot, 0, 0.3, 0, Math.PI / 2);
add(new THREE.CircleGeometry(0.47, 10), soil, 0, 0.77, 0, -Math.PI / 2);
limb(V(0, 0.75, 0), V(0.03, 2.0, 0.02), 0.07, 0.045, bark, 6);
const R = 0.72, cy = 2.42;
add(warp(new THREE.SphereGeometry(R, 12, 8), (p) => { p.multiplyScalar(1 + 0.1 * noise(p.x * 6, p.y * 6, p.z * 6)); }), leaf, 0, cy, 0);
for (let i = 0; i < 24; i++) {
  const y = 1 - 2 * (i + 0.5) / 24; const a = i * 2.39996; const rxz = Math.sqrt(1 - y * y);
  const d = V(Math.cos(a) * rxz, y * 0.8, Math.sin(a) * rxz).normalize();
  if (d.y < -0.75) continue;
  add(new THREE.OctahedronGeometry(0.095), fruit, d.x * R * 0.98, cy + d.y * R * 0.98, d.z * R * 0.98, 0, a, 0.3, 1, 1.35, 1);
}
