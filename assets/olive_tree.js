// olive_tree c2: sweeps. Two tapered tube strands twisting round each other from a flared base, swept branches out to five canopy masses each built from three dodecahedra.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 58224; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
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
