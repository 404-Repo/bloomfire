// cypress c3: warped cylinder. A capped 9-sided cylinder pinched into a flame, with spiralling vertical ridges and a lumpy lean near the tip, plus three flame-lick lobes low on the column.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 76212; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const leaf = M(0x2f4a2a, 'foliage', 0.9, { flatShading: true });
  const bark = M(0x4a3324, 'timber', 0.95);
  const env = (t) => t < 0.1 ? 0.62 + t * 3.6 : 0.98 * Math.pow(Math.max(0, 1 - (t - 0.1) / 0.9), 0.75);
  const ge = warp(new THREE.CylinderGeometry(1, 1, 9.6, 9, 12), (p) => {
    const t = (p.y + 4.8) / 9.6; const a = Math.atan2(p.z, p.x); const r0 = Math.hypot(p.x, p.z);
    const r = r0 * env(t) * (1 + 0.14 * Math.sin(a * 4 + t * 9)); const aa = a + t * 0.6;
    p.x = Math.cos(aa) * r + Math.sin(t * 7) * 0.05 * t; p.z = Math.sin(aa) * r; p.y += 4.8 + 0.4;
  });
  add(ge, leaf);
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.4; add(new THREE.IcosahedronGeometry(0.45, 0), leaf, Math.cos(a) * 0.75, 1.6 + i * 1.1, Math.sin(a) * 0.75, 0, a, 0, 1, 2.2, 1); }
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
