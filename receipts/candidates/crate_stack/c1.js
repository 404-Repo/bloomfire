// crate_stack c1: primitives. Three crates (two 0.74 m below, one 0.66 m on top turned 15 degrees), each a core box with a frame of twelve edge boards and a diagonal brace on all four sides.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 81056; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const crateM = M(0x8a6a44, 'timber', 0.9), frameM = M(0x6b4a2e, 'timber', 0.9);
  const crate = (s, x, y, z, ry) => {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; g.add(grp);
    const a = (geo, mat, px, py, pz, rx = 0, rY = 0, rz = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(px, py, pz); ms.rotation.set(rx, rY, rz); grp.add(ms); };
    const t = s * 0.1, h = s / 2 - t / 2;
    a(new THREE.BoxGeometry(s * 0.96, s * 0.96, s * 0.96), crateM, 0, s / 2, 0);
    for (const u of [-1, 1]) for (const v of [-1, 1]) { a(new THREE.BoxGeometry(s, t, t), frameM, 0, s / 2 + u * h, v * h); a(new THREE.BoxGeometry(t, t, s), frameM, u * h, s / 2 + v * h, 0); a(new THREE.BoxGeometry(t, s, t), frameM, u * h, s / 2, v * h); }
    const dl = s * 1.18;
    for (const v of [-1, 1]) { a(new THREE.BoxGeometry(t * 0.8, dl, t * 0.5), frameM, 0, s / 2, v * s * 0.49, 0, 0, v * Math.PI / 4); a(new THREE.BoxGeometry(t * 0.5, dl, t * 0.8), frameM, v * s * 0.49, s / 2, 0, v * Math.PI / 4, 0, 0); }
  };
  crate(0.74, -0.39, 0, 0.02, 0.04);
  crate(0.74, 0.39, 0, -0.03, -0.06);
  crate(0.66, 0.02, 0.74, 0.0, 0.26);

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
