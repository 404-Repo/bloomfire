// flower_patch c3: clumped reading. A low lumpy meadow mound, three open grass-cone tufts, and fifteen chunky cup flowers (open five-sided cones, wide side up) in poppy red, ochre and white plus lavender spikes, ringed round the tufts.
const red = M(0xd2412f, 'foliage', 0.8, { side: THREE.DoubleSide, flatShading: true }), white = M(0xf3efe2, 'foliage', 0.8, { side: THREE.DoubleSide, flatShading: true }), ochre = M(0xe0a93a, 'foliage', 0.8, { side: THREE.DoubleSide, flatShading: true });
const lav = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true }), grass = M(0x8a9a48, 'foliage', 0.9, { side: THREE.DoubleSide, flatShading: true }), mound = M(0x7f9142, 'foliage', 0.95, { flatShading: true });
add(warp(new THREE.CylinderGeometry(0.38, 0.5, 0.05, 7, 1), (p) => { p.y += 0.04 * noise(p.x * 8, 0, p.z * 8); if (p.y < 0) p.y = Math.min(p.y, -0.025); }), mound, 0, 0.025, 0);
const tufts = [[0.16, 0.1], [-0.2, 0.12], [0.0, -0.22]];
tufts.forEach(([x, z], i) => add(warp(new THREE.ConeGeometry(0.13, 0.26, 6, 2, true), (p) => { const a = Math.atan2(p.z, p.x); if (p.y > 0) { p.x += Math.cos(a * 3) * 0.04; p.z += Math.sin(a * 2) * 0.04; } }), grass, x, 0.16, z, 0, i, 0));
const kinds = ['r', 'o', 'w', 'r', 'l', 'w', 'r', 'o', 'l', 'w', 'r', 'o', 'w', 'l', 'r'];
kinds.forEach((k, i) => {
  const t = tufts[i % 3]; const a = i * 2.39996; const r = rr(0.14, 0.24); const x = t[0] + Math.cos(a) * r, z = t[1] + Math.sin(a) * r;
  if (Math.hypot(x, z) > 0.5) return;
  const h = rr(0.16, 0.3);
  limb(V(x, 0.03, z), V(x, h, z), 0.008, 0.006, grass, 3);
  if (k === 'l') { add(new THREE.OctahedronGeometry(1), lav, x, h + 0.06, z, 0, 0, 0, 0.032, 0.09, 0.032); return; }
  add(new THREE.ConeGeometry(0.07, 0.05, 5, 1, true), k === 'r' ? red : k === 'w' ? white : ochre, x, h + 0.02, z, Math.PI + rr(-0.3, 0.3), 0, rr(-0.3, 0.3));
});
