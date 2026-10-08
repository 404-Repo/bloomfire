// cypress c1: profile. One lathed flame-shaped column (widest a third of the way up, drawn to a point) with lumpy radial noise and a slight flame twist, on a short trunk stub.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 16630; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const leaf = M(0x2f4a2a, 'foliage', 0.9, { flatShading: true });
  const bark = M(0x4a3324, 'timber', 0.95);
  const prof = [[0.0, 0.32], [0.45, 0.38], [0.78, 0.8], [0.95, 1.6], [1.02, 2.6], [1.0, 3.7], [0.92, 4.9], [0.8, 6.0], [0.64, 7.1], [0.46, 8.1], [0.28, 9.0], [0.12, 9.6], [0.0, 10.0]].map(([r, y]) => new THREE.Vector2(r, y));
  const ge = warp(new THREE.LatheGeometry(prof, 12), (p) => {
    const a = Math.atan2(p.z, p.x); const r = Math.hypot(p.x, p.z); if (r < 1e-4) return;
    const k = 1 + 0.13 * Math.sin(a * 5 + p.y * 1.3) + 0.08 * Math.sin(a * 3 - p.y * 2.1 + 1);
    const tw = p.y * 0.08; p.x = Math.cos(a + tw) * r * k; p.z = Math.sin(a + tw) * r * k; p.x += Math.sin(p.y * 0.5) * 0.06;
  });
  add(ge, leaf);
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
