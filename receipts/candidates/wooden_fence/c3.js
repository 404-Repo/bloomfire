// wooden_fence c3: braced reading. Two stout end posts with stepped caps, three rails (top rail thicker), and a diagonal brace from the bottom of one post to the top of the other; rails sag slightly and are pegged with dark bolts.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 27802; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const post = M(0x4a3324, 'timber', 0.9), rail = M(0x7a5534, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.4 });
  [-1.42, 1.42].forEach((x) => { add(new THREE.BoxGeometry(0.18, 0.92, 0.18), post, x, 0.46, 0); add(new THREE.BoxGeometry(0.22, 0.06, 0.22), post, x, 0.95, 0); add(new THREE.BoxGeometry(0.14, 0.04, 0.14), post, x, 0.99, 0); });
  [[0.28, 0.1], [0.55, 0.11], [0.82, 0.14]].forEach(([y, h], k) => {
    const ge = warp(new THREE.BoxGeometry(2.96, h, 0.075, 4, 1, 1), (p) => { p.y -= 0.03 * (1 - (p.x / 1.48) ** 2); });
    add(ge, rail, 0, y, 0.125 - k * 0.0);
    for (const x of [-1.42, 1.42]) add(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 5), iron, x, y, 0.17, Math.PI / 2);
  });
  const b0 = V(-1.3, 0.2, 0.125), b1 = V(1.3, 0.85, 0.125); const d = b1.clone().sub(b0);
  const br = add(new THREE.BoxGeometry(d.length(), 0.09, 0.06), rail, (b0.x + b1.x) / 2, (b0.y + b1.y) / 2, 0.07, 0, 0, Math.atan2(d.y, d.x));

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
