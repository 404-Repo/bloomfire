// boulder c2: plane-sliced. A detail-1 icosahedron clamped against eleven cutting planes spread round it, so it becomes a chunky faceted block with broad flat faces and a few rounded corners left, the way limestone fractures; two spalled chips at its foot.
const lime = M(0xcfc3a5, 'stone', 0.95, { flatShading: true });
const planes = [];
for (let i = 0; i < 11; i++) { const a = i * 2.39996 + rr(-0.3, 0.3); const n = V(Math.cos(a), rr(-0.3, 1.1), Math.sin(a)).normalize(); planes.push([n, rr(0.58, 0.74)]); }
planes.push([V(0, -1, 0), 0.6]);
const ge = warp(new THREE.IcosahedronGeometry(1, 1), (p) => {
  p.multiplyScalar(1 + 0.08 * noise(p.x * 2, p.y * 2, p.z * 2));
  for (const [n, d] of planes) { const s = p.dot(n); if (s > d) p.addScaledVector(n, d - s); }
});
add(ge, lime, 0, 0.6, 0, 0, 0.3, 0, 1.6, 1.22, 1.3);
const chipM = M(0xbfb294, "stone", 0.95, { flatShading: true });
add(new THREE.DodecahedronGeometry(0.24, 0), chipM, 1.45, 0.12, 0.65, 0.5, 0.2, 0.3, 1.2, 0.6, 1);
add(new THREE.DodecahedronGeometry(0.17, 0), chipM, -1.2, 0.08, -0.9, 0.2, 0.9, 0.1, 1.2, 0.6, 1);
