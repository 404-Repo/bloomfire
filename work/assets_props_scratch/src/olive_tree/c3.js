// olive_tree c3: a broader reading, like the concept paintings. One warped gnarled bole that forks into three leaning limbs under a wide, irregular umbrella of nine flattened lumpy canopy clouds.
const bark = M(0x6e6152, 'timber', 0.95, { side: THREE.DoubleSide });
const leafA = M(0x6f7d3c, 'foliage', 0.9, { flatShading: true }), leafB = M(0x8a9558, 'foliage', 0.9, { flatShading: true });
const bole = warp(new THREE.CylinderGeometry(0.2, 0.38, 1.6, 8, 5, true), (p) => {
  const t = (p.y + 0.8) / 1.6; const a = t * 1.6; const x = p.x, z = p.z;
  p.x = x * Math.cos(a) - z * Math.sin(a); p.z = x * Math.sin(a) + z * Math.cos(a);
  const k = 1 + 0.22 * Math.sin(Math.atan2(z, x) * 3 + t * 5) + (t < 0.12 ? (0.12 - t) * 4 : 0); p.x *= k; p.z *= k; p.x += t * t * 0.25;
});
add(bole, bark, 0, 0.8, 0);
const fork = V(0.25, 1.55, 0);
const limbs = [[V(-1.2, 2.9, 0.35)], [V(1.35, 3.0, -0.3)], [V(0.1, 3.4, -0.9)], [V(0.2, 3.3, 1.0)]];
limbs.forEach(([end], i) => { const mid = V((fork.x + end.x) / 2 + (i % 2 ? 0.2 : -0.2), (fork.y + end.y) / 2 + 0.1, (fork.z + end.z) / 2); limb(fork, mid, 0.17, 0.12, bark, 6); limb(mid, end, 0.12, 0.06, bark, 6); });
const clouds = [[-1.35, 3.25, 0.4, 0.95], [1.45, 3.3, -0.3, 0.9], [0.1, 3.7, -1.0, 0.9], [0.2, 3.65, 1.05, 0.9], [0.0, 4.0, 0.0, 0.85], [-0.9, 3.55, -0.85, 0.7], [0.95, 3.5, 0.85, 0.7], [-0.75, 3.45, 1.05, 0.65], [1.0, 3.55, -1.0, 0.65]];
clouds.forEach(([x, y, z, r], i) => {
  const ge = warp(new THREE.SphereGeometry(r, 7, 5), (p) => { p.multiplyScalar(1 + 0.2 * noise(p.x * 3.5 + i * 2, p.y * 3.5, p.z * 3.5)); p.y *= 0.55; });
  add(ge, i % 3 === 1 ? leafB : leafA, x, y, z, 0, i, 0);
});
