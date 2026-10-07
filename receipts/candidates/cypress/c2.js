// cypress c2: part breakdown. A slim lathed core wrapped in sixteen elongated icosahedron tufts set round it on a flame-shaped envelope, so the column is clumpy like brush strokes.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 46421; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const leaf = M(0x2f4a2a, 'foliage', 0.9, { flatShading: true }), leaf2 = M(0x36522f, 'foliage', 0.9, { flatShading: true });
  const bark = M(0x4a3324, 'timber', 0.95);
  const env = (y) => y < 1 ? 0.5 + y * 0.4 : Math.max(0.05, 0.95 * Math.pow(1 - (y - 1) / 9, 0.8));
  const core = [[0, 0.4], [0.5, 0.5], [0.72, 1.5], [0.72, 3.5], [0.6, 5.5], [0.4, 7.5], [0.15, 9.2], [0, 9.9]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(core, 6), leaf);
  for (let i = 0; i < 16; i++) {
    const y = 0.9 + i * 0.52; const a = i * 2.4; const r = env(y) * 0.55;
    const ge = new THREE.IcosahedronGeometry(1, 0);
    add(ge, i % 3 ? leaf : leaf2, Math.cos(a) * r, y, Math.sin(a) * r, rr(-0.3, 0.3), a, rr(-0.2, 0.2), env(y) * 0.72, 0.85 + (i < 13 ? 0.3 : 0), env(y) * 0.72);
  }
  add(new THREE.ConeGeometry(0.2, 0.9, 5), leaf2, 0.03, 9.55, 0);
  add(new THREE.CylinderGeometry(0.13, 0.18, 0.5, 6), bark, 0, 0.25, 0);

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
