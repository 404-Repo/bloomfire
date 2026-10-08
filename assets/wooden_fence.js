// wooden_fence c1: primitives (o07 breakdown). Three square dark-timber posts with chamfered pyramid tops, two chunky rails let into them, dark iron bolt heads on both faces of each joint.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 68211; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const post = M(0x4a3324, 'timber', 0.9), rail = M(0x7a5534, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.4 });
  const xs = [-1.42, 0, 1.42];
  xs.forEach((x, i) => { add(new THREE.BoxGeometry(0.15, 0.92, 0.15), post, x, 0.46, 0, 0, i * 0.08, 0); add(new THREE.ConeGeometry(0.11, 0.1, 4), post, x, 0.97, 0, 0, Math.PI / 4 + i * 0.08, 0); });
  [[0.38, 0.03], [0.74, -0.02]].forEach(([y, tw], k) => {
    for (let s = 0; s < 2; s++) { const ms = add(new THREE.BoxGeometry(1.5, 0.14, 0.07), rail, -0.71 + s * 1.42, y + (s ? tw : -tw) * 0.5, 0.11, 0, 0, s ? tw : -tw); }
  });
  xs.forEach((x) => [0.38, 0.74].forEach((y) => { add(new THREE.BoxGeometry(0.045, 0.045, 0.03), iron, x, y, 0.155); add(new THREE.BoxGeometry(0.045, 0.045, 0.03), iron, x, y, -0.09); }));

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
