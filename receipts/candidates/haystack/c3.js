// haystack c3: displaced sphere. A detail-2 icosahedron cut flat below, pulled into a rounded dome with shaggy noise, eleven hay tufts (stretched tetrahedra) poking out of the surface, a little hay spill on the ground and the pole.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 68064; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const hay = M(0xd9b54a, 'fabric', 0.95, { flatShading: true }), hay2 = M(0xc9a03c, 'fabric', 0.95, { flatShading: true }), pole = M(0x4a3324, 'timber', 0.9);
  add(warp(new THREE.IcosahedronGeometry(1, 2), (p) => { p.multiplyScalar(1 + 0.08 * noise(p.x * 5, p.y * 5, p.z * 5)); if (p.y < -0.25) p.y = -0.25; p.x *= 1.15; p.z *= 1.15; p.y = (p.y + 0.25) * 1.5; }), hay);
  for (let i = 0; i < 11; i++) { const u = rr(0.1, 0.8), a = i * 2.39996, rxz = Math.sqrt(1 - u * u); const n = V(Math.cos(a) * rxz, u, Math.sin(a) * rxz); const ms = add(new THREE.TetrahedronGeometry(0.16), hay2, n.x * 1.12, (n.y + 0.25) * 1.45, n.z * 1.12); ms.quaternion.setFromUnitVectors(V(0, 1, 0), n); ms.scale.set(0.7, 1.8, 0.7); }
  for (let i = 0; i < 5; i++) { const a = rr(0, 6.28); add(new THREE.CylinderGeometry(0.2, 0.32, 0.06, 5), hay2, Math.cos(a) * 1.3, 0.03, Math.sin(a) * 1.3, 0, a, 0); }
  limb(V(0, 1.6, 0), V(0.03, 2.2, 0), 0.045, 0.035, pole, 6);

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
