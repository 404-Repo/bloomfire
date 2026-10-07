// lavender_bush c1: primitives. Lumpy grey-green half-dome mound with 20 radiating stems, each a green octahedron stalk tipped with a stretched lavender octahedron spike.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 8818; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const leaf = M(0x7d8a63, 'foliage', 0.9, { flatShading: true }), stem = M(0x8a9a6a, 'foliage', 0.9, { flatShading: true }), flower = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true });
  add(warp(new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), (p) => { p.multiplyScalar(1 + 0.12 * noise(p.x * 9, p.y * 9, p.z * 9)); p.y *= 0.95; }), leaf, 0, 0, 0, 0, 0, 0, 1.25, 1, 1.25);
  for (let i = 0; i < 20; i++) {
    const u = 0.25 + 0.75 * ((i * 0.618) % 1); const a = i * 2.39996;
    const dir = V(Math.cos(a) * (1 - u) * 0.9, 0.35 + u, Math.sin(a) * (1 - u) * 0.9).normalize();
    const base = V(Math.cos(a) * 0.3 * (1 - u * 0.6), 0.22 + u * 0.12, Math.sin(a) * 0.3 * (1 - u * 0.6));
    const sMid = base.clone().addScaledVector(dir, 0.12), tip = base.clone().addScaledVector(dir, 0.32);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir);
    const s = add(new THREE.OctahedronGeometry(1), stem, sMid.x, sMid.y, sMid.z, 0, 0, 0, 0.012, 0.12, 0.012); s.quaternion.copy(q);
    const f = add(new THREE.OctahedronGeometry(1), flower, tip.x, tip.y, tip.z, 0, 0, 0, 0.035, 0.11, 0.035); f.quaternion.copy(q);
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
