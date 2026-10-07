// olive_tree c1: primitives. Split trunk of tapered cylinder segments from a root flare, limbs out to seven lumpy flat-shaded icosahedron canopy masses in two olive greens.
const bark = M(0x6e6152, 'timber', 0.95, { side: THREE.DoubleSide });
const leafA = M(0x6f7d3c, 'foliage', 0.9, { flatShading: true }), leafB = M(0x8a9558, 'foliage', 0.9, { flatShading: true });
add(new THREE.CylinderGeometry(0.2, 0.5, 0.45, 8, 1, true), bark, 0, 0.22, 0);
const chain = (pts, r0, r1) => { for (let i = 0; i < pts.length - 1; i++) { const t0 = i / (pts.length - 1), t1 = (i + 1) / (pts.length - 1); limb(pts[i], pts[i + 1], r0 + (r1 - r0) * t0, r0 + (r1 - r0) * t1, bark, 7); } };
chain([V(-0.05, 0.1, 0), V(0.12, 0.8, 0.08), V(-0.12, 1.5, 0.12), V(-0.55, 2.2, 0.2), V(-1.15, 2.75, 0.3)], 0.26, 0.08);
chain([V(0.08, 0.1, -0.02), V(0.22, 0.9, -0.12), V(0.42, 1.7, -0.18), V(0.95, 2.4, -0.25), V(1.25, 2.9, -0.2)], 0.24, 0.08);
chain([V(-0.12, 1.5, 0.12), V(-0.05, 2.3, -0.2), V(-0.25, 3.0, -0.75)], 0.12, 0.06);
chain([V(0.42, 1.7, -0.18), V(0.35, 2.5, 0.35), V(0.55, 3.1, 0.85)], 0.12, 0.06);
chain([V(-0.05, 2.3, -0.2), V(0.05, 3.2, 0.0), V(0.0, 3.7, 0.05)], 0.09, 0.05);
chain([V(-0.55, 2.2, 0.2), V(-0.6, 2.5, 0.9)], 0.08, 0.05);
const clumps = [[-1.25, 2.95, 0.3, 0.8], [1.3, 3.1, -0.2, 0.78], [0.0, 3.95, 0.05, 0.85], [-0.3, 3.25, -0.85, 0.72], [0.6, 3.3, 0.9, 0.72], [-0.7, 2.7, 1.0, 0.6], [0.95, 2.6, -0.95, 0.55]];
clumps.forEach(([x, y, z, r], i) => {
  const ge = warp(new THREE.IcosahedronGeometry(r, 1), (p) => { const k = 1 + 0.18 * noise(p.x * 4 + i, p.y * 4, p.z * 4 - i); p.multiplyScalar(k); p.y *= 0.72; if (p.y < -r * 0.45) p.y = -r * 0.45 + (p.y + r * 0.45) * 0.3; });
  add(ge, i % 2 ? leafB : leafA, x, y, z, 0, i * 1.3, 0);
});
