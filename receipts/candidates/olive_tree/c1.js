// olive_tree c1: primitives. Split trunk of tapered cylinder segments from a root flare, limbs out to seven lumpy flat-shaded icosahedron canopy masses in two olive greens.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 28433; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
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

  // contract placement: measure vertices, base at y=0, centred on x and z
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
