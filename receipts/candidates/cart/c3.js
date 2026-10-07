// cart c3: another reading. The cart at rest, pitched forward about its axle so the shaft tips sit on the ground; open slatted sides (two rails over a row of upright slats) instead of boards; twelve-spoke wheels.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 52602; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const ochre = M(0xd9a441, 'timber', 0.85), dark = M(0x4a3324, 'timber', 0.9), wood = M(0x7a5534, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5 });
  const zB = -1.35, zF = 0.4, Rw = 0.62;
  const body = new THREE.Group(); body.position.set(0, Rw, -0.45); g.add(body);
  const b = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); body.add(ms); return ms; };
  const zc = (zB + zF) / 2 + 0.45;
  b(new THREE.BoxGeometry(1.1, 0.06, zF - zB), ochre, 0, 0.16, zc);
  for (const s of [-1, 1]) {
    b(new THREE.BoxGeometry(0.1, 0.1, zF - zB), ochre, s * 0.4, 0.08, zc);
    b(new THREE.BoxGeometry(0.09, 0.09, 1.65), ochre, s * 0.37, 0.08, zF + 0.45 + 0.78, 0, s * 0.02, 0);
    for (const y of [0.42, 0.68]) b(new THREE.BoxGeometry(0.06, 0.08, zF - zB + 0.08), ochre, s * 0.57, y, zc);
    for (let i = 0; i < 6; i++) b(new THREE.BoxGeometry(0.05, 0.56, 0.07), wood, s * 0.56, 0.44, zB + 0.45 + 0.08 + i * (zF - zB - 0.16) / 5);
  }
  b(new THREE.BoxGeometry(1.12, 0.56, 0.05), ochre, 0, 0.44, zF + 0.45);
  b(new THREE.BoxGeometry(1.12, 0.56, 0.05), ochre, 0, 0.44, zB + 0.45);
  b(new THREE.BoxGeometry(0.85, 0.07, 0.07), wood, 0, 0.08, 2.0);
  body.rotation.x = Math.atan2(Rw + 0.08 - 0.06, 2.05);
  add(new THREE.CylinderGeometry(0.045, 0.045, 1.66, 6), iron, 0, Rw, -0.45, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) {
    const x = s * 0.76;
    add(new THREE.TorusGeometry(Rw - 0.035, 0.035, 4, 18), iron, x, Rw, -0.45, 0, Math.PI / 2, 0);
    add(new THREE.TorusGeometry(Rw - 0.1, 0.045, 4, 18), wood, x, Rw, -0.45, 0, Math.PI / 2, 0, 1, 1, 1.4);
    add(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8), dark, x, Rw, -0.45, 0, 0, Math.PI / 2);
    for (let k = 0; k < 6; k++) add(new THREE.BoxGeometry(0.035, 2 * Rw - 0.16, 0.045), wood, x, Rw, -0.45, k * Math.PI / 6, 0, 0);
  }

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
