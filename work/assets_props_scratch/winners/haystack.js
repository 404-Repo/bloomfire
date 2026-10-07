// haystack c1: profile. A lathed dome (fat beehive profile with a flared skirt) roughened with noise and droops, a ragged skirt of hay tufts (open cones) round the base, and a dark pole out of the crown.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 8482; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const hay = M(0xd9b54a, 'fabric', 0.95, { flatShading: true }), hay2 = M(0xc9a03c, 'fabric', 0.95, { flatShading: true, side: THREE.DoubleSide }), pole = M(0x4a3324, 'timber', 0.9);
  const prof = [[0.0, 0.0], [1.15, 0.0], [1.2, 0.12], [1.12, 0.45], [1.0, 0.9], [0.82, 1.3], [0.58, 1.62], [0.3, 1.85], [0.08, 1.93], [0.0, 1.94]].map(([r, y]) => new THREE.Vector2(r, y));
  add(warp(new THREE.LatheGeometry(prof, 14), (p) => { const a = Math.atan2(p.z, p.x); const k = 1 + 0.07 * Math.sin(a * 7 + p.y * 3) + 0.05 * noise(p.x * 4, p.y * 4, p.z * 4); p.x *= k; p.z *= k; if (p.y > 0.05) p.y -= 0.04 * Math.abs(Math.sin(a * 5 + p.y * 6)); }), hay);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + rr(-0.1, 0.1); const ms = add(new THREE.ConeGeometry(0.16, 0.42, 3, 1, true), hay2, Math.cos(a) * 1.15, 0.17, Math.sin(a) * 1.15, 0, -a, 0); ms.rotation.set(Math.sin(a) * 0.5, -a, -Math.cos(a) * 0.5, 'YXZ'); ms.rotateZ(Math.PI); }
  limb(V(0, 1.6, 0), V(0.04, 2.2, 0.02), 0.045, 0.035, pole, 6);

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
