// olive_tree c2: sweeps. Two tapered tube strands twisting round each other from a flared base, swept branches out to five canopy masses each built from three dodecahedra.
const bark = M(0x6e6152, 'timber', 0.95);
const leafA = M(0x6f7d3c, 'foliage', 0.9, { flatShading: true }), leafB = M(0x8a9558, 'foliage', 0.9, { flatShading: true });
const tube = (pts, r0, r1, seg = 8, rad = 5) => {
  const curve = new THREE.CatmullRomCurve3(pts); const ge = new THREE.TubeGeometry(curve, seg, 1, rad, false);
  const p = ge.attributes.position, vv = new THREE.Vector3();
  for (let j = 0; j <= seg; j++) { const t = j / seg; const c = curve.getPointAt(t); const r = r0 + (r1 - r0) * t; for (let k = 0; k <= rad; k++) { const i = j * (rad + 1) + k; vv.fromBufferAttribute(p, i).sub(c).multiplyScalar(r).add(c); p.setXYZ(i, vv.x, vv.y, vv.z); } }
  ge.computeVertexNormals(); add(ge, bark); return curve;
};
const strand = (ph) => { const pts = []; for (let i = 0; i <= 5; i++) { const y = i * 0.42; const a = ph + i * 0.9; pts.push(V(Math.cos(a) * 0.14 + i * 0.03, y, Math.sin(a) * 0.14)); } return pts; };
const s1 = strand(0), s2 = strand(Math.PI);
tube(s1, 0.28, 0.14); tube(s2, 0.26, 0.13);
add(new THREE.CylinderGeometry(0.28, 0.55, 0.35, 8, 1, true), M(0x6e6152, 'timber', 0.95, { side: THREE.DoubleSide }), 0.02, 0.17, 0);
const tops = [s1[5], s2[5]];
const masses = [[-1.3, 3.2, 0.2, 0], [1.3, 3.35, -0.1, 1], [0.1, 4.05, -0.2, 0], [-0.3, 3.3, 1.1, 1], [0.5, 3.2, -1.1, 0]];
masses.forEach(([x, y, z, w], i) => {
  const from = tops[i % 2];
  tube([from, V(from.x + (x - from.x) * 0.45, from.y + 0.45, from.z + (z - from.z) * 0.4), V(x * 0.85, y - 0.35, z * 0.85)], 0.11, 0.05, 5, 5);
  for (let k = 0; k < 3; k++) {
    const a = k * 2.1 + i; const r = 0.5 - k * 0.06;
    const ge = new THREE.DodecahedronGeometry(r, 0);
    add(ge, (k + w) % 2 ? leafB : leafA, x + Math.cos(a) * 0.38, y + (k === 0 ? 0.12 : -0.05), z + Math.sin(a) * 0.38, k, a, 0, 1.15, 0.78, 1.15);
  }
});
