// cypress c1: profile. One lathed flame-shaped column (widest a third of the way up, drawn to a point) with lumpy radial noise and a slight flame twist, on a short trunk stub.
const leaf = M(0x2f4a2a, 'foliage', 0.9, { flatShading: true });
const bark = M(0x4a3324, 'timber', 0.95);
const prof = [[0.0, 0.32], [0.45, 0.38], [0.78, 0.8], [0.95, 1.6], [1.02, 2.6], [1.0, 3.7], [0.92, 4.9], [0.8, 6.0], [0.64, 7.1], [0.46, 8.1], [0.28, 9.0], [0.12, 9.6], [0.0, 10.0]].map(([r, y]) => new THREE.Vector2(r, y));
const ge = warp(new THREE.LatheGeometry(prof, 12), (p) => {
  const a = Math.atan2(p.z, p.x); const r = Math.hypot(p.x, p.z); if (r < 1e-4) return;
  const k = 1 + 0.13 * Math.sin(a * 5 + p.y * 1.3) + 0.08 * Math.sin(a * 3 - p.y * 2.1 + 1);
  const tw = p.y * 0.08; p.x = Math.cos(a + tw) * r * k; p.z = Math.sin(a + tw) * r * k; p.x += Math.sin(p.y * 0.5) * 0.06;
});
add(ge, leaf);
add(new THREE.CylinderGeometry(0.13, 0.18, 0.5, 6), bark, 0, 0.25, 0);
