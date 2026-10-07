// cypress c3: warped cylinder. A capped 9-sided cylinder pinched into a flame, with spiralling vertical ridges and a lumpy lean near the tip, plus three flame-lick lobes low on the column.
const leaf = M(0x2f4a2a, 'foliage', 0.9, { flatShading: true });
const bark = M(0x4a3324, 'timber', 0.95);
const env = (t) => t < 0.1 ? 0.62 + t * 3.6 : 0.98 * Math.pow(Math.max(0, 1 - (t - 0.1) / 0.9), 0.75);
const ge = warp(new THREE.CylinderGeometry(1, 1, 9.6, 9, 12), (p) => {
  const t = (p.y + 4.8) / 9.6; const a = Math.atan2(p.z, p.x); const r0 = Math.hypot(p.x, p.z);
  const r = r0 * env(t) * (1 + 0.14 * Math.sin(a * 4 + t * 9)); const aa = a + t * 0.6;
  p.x = Math.cos(aa) * r + Math.sin(t * 7) * 0.05 * t; p.z = Math.sin(aa) * r; p.y += 4.8 + 0.4;
});
add(ge, leaf);
for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.4; add(new THREE.IcosahedronGeometry(0.45, 0), leaf, Math.cos(a) * 0.75, 1.6 + i * 1.1, Math.sin(a) * 0.75, 0, a, 0, 1, 2.2, 1); }
add(new THREE.CylinderGeometry(0.13, 0.18, 0.5, 6), bark, 0, 0.25, 0);
