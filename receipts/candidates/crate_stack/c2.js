// crate_stack c2: part breakdown. Slatted crates: a dark inner box behind three spaced horizontal planks per side and a planked lid, with square corner posts; two below side by side, one on top offset and turned.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 10856; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const plank = M(0x8a6a44, 'timber', 0.9), post = M(0x6b4a2e, 'timber', 0.9), inner = M(0x3a2a1c, 'timber', 1.0);
  const crate = (s, x, y, z, ry) => {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; g.add(grp);
    const a = (geo, mat, px, py, pz, rY = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(px, py, pz); ms.rotation.y = rY; grp.add(ms); };
    a(new THREE.BoxGeometry(s * 0.9, s * 0.9, s * 0.9), inner, 0, s / 2, 0);
    const ph = s * 0.24;
    for (let i = 0; i < 3; i++) { const py = s * 0.17 + i * s * 0.32; for (const v of [-1, 1]) { a(new THREE.BoxGeometry(s * 0.92, ph, 0.03), plank, 0, py, v * s * 0.46); a(new THREE.BoxGeometry(0.03, ph, s * 0.92), plank, v * s * 0.46, py, 0); } }
    for (let i = 0; i < 3; i++) a(new THREE.BoxGeometry(s * 0.92, 0.03, ph * 1.2), plank, 0, s - 0.015, (i - 1) * s * 0.31);
    for (const u of [-1, 1]) for (const v of [-1, 1]) a(new THREE.BoxGeometry(s * 0.09, s, s * 0.09), post, u * s * 0.46, s / 2, v * s * 0.46);
  };
  crate(0.74, -0.39, 0, 0.03, -0.05);
  crate(0.74, 0.39, 0, -0.02, 0.07);
  crate(0.66, -0.12, 0.74, 0.02, 0.32);

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
