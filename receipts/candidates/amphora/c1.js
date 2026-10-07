// amphora c1: primitives. Squashed sphere belly, cylinder shoulder and neck, torus lip, cone foot, two half-torus handles; a dark timber ring stand on three splayed legs with a lower tie ring.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 59580; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const terra = M(0xc0603a, 'tile', 0.85), dark = M(0x4a3324, 'timber', 0.9);
  add(new THREE.SphereGeometry(0.2, 12, 8), terra, 0, 0.42, 0, 0, 0, 0, 1, 1.45, 1);
  add(new THREE.CylinderGeometry(0.075, 0.15, 0.14, 12, 1, true), terra, 0, 0.66, 0);
  add(new THREE.CylinderGeometry(0.068, 0.075, 0.16, 12, 1, true), terra, 0, 0.8, 0);
  add(new THREE.TorusGeometry(0.075, 0.022, 4, 12), terra, 0, 0.88, 0, Math.PI / 2);
  add(new THREE.ConeGeometry(0.08, 0.2, 8), terra, 0, 0.08, 0, Math.PI);
  for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.075, 0.016, 4, 6, Math.PI), terra, s * 0.1, 0.74, 0, 0, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2);
  add(new THREE.TorusGeometry(0.205, 0.025, 4, 12), dark, 0, 0.32, 0, Math.PI / 2);
  add(new THREE.TorusGeometry(0.22, 0.018, 4, 12), dark, 0, 0.12, 0, Math.PI / 2);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + Math.PI / 2; limb(V(Math.cos(a) * 0.29, 0, Math.sin(a) * 0.29), V(Math.cos(a) * 0.2, 0.36, Math.sin(a) * 0.2), 0.022, 0.02, dark, 5); }

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
