// lemon_tree_pot c2: profiles. Lathed pot with lip, banded body and foot; trunk forking into three; canopy of four lumpy icosahedron masses with 28 lemons tucked on their surface.
const pot = M(0xc0603a, 'tile', 0.85, { side: THREE.DoubleSide }), soil = M(0x5a4030, 'ground', 1.0), bark = M(0x6b5640, 'timber', 0.95);
const leaf = M(0x557a2e, 'foliage', 0.85, { flatShading: true }), leaf2 = M(0x648a36, 'foliage', 0.85, { flatShading: true }), fruit = M(0xe9c53a, 'foliage', 0.7, { flatShading: true });
const prof = [[0.0, 0.0], [0.34, 0.0], [0.36, 0.05], [0.34, 0.1], [0.38, 0.14], [0.4, 0.3], [0.45, 0.33], [0.44, 0.38], [0.47, 0.66], [0.56, 0.7], [0.57, 0.84], [0.48, 0.86], [0.46, 0.76]].map(([r, y]) => new THREE.Vector2(r, y));
add(new THREE.LatheGeometry(prof, 12), pot);
add(new THREE.CircleGeometry(0.46, 10), soil, 0, 0.76, 0, -Math.PI / 2);
const fork = V(0.0, 1.55, 0);
limb(V(0, 0.72, 0), fork, 0.075, 0.06, bark, 6);
const masses = [[0, 2.55, 0, 0.62], [-0.38, 2.25, 0.18, 0.5], [0.4, 2.3, -0.12, 0.5], [0.05, 2.2, -0.42, 0.48]];
masses.forEach(([x, y, z, r], i) => {
  if (i) limb(fork, V(x * 0.6, y - 0.3, z * 0.6), 0.045, 0.03, bark, 5); else limb(fork, V(0, 2.2, 0), 0.05, 0.035, bark, 5);
  add(warp(new THREE.IcosahedronGeometry(r, 1), (p) => p.multiplyScalar(1 + 0.12 * noise(p.x * 7 + i, p.y * 7, p.z * 7))), i % 2 ? leaf2 : leaf, x, y, z);
});
for (let i = 0; i < 28; i++) {
  const [x, y, z, r] = masses[i % 4]; const u = rr(-0.6, 0.9), a = rr(0, Math.PI * 2); const rxz = Math.sqrt(1 - u * u);
  add(new THREE.OctahedronGeometry(0.07), fruit, x + Math.cos(a) * rxz * r * 0.95, y + u * r * 0.95, z + Math.sin(a) * rxz * r * 0.95, 0, a, 0.2, 1, 1.35, 1);
}
