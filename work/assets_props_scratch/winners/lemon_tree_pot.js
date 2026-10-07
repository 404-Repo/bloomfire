// lemon_tree_pot c1: primitives. Tapered cylinder pot with torus rim and band, soil disc, straight cylinder trunk, one lumpy sphere canopy studded with 24 octahedron lemons.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 12672; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const pot = M(0xc0603a, 'tile', 0.85), soil = M(0x5a4030, 'ground', 1.0), bark = M(0x6b5640, 'timber', 0.95);
  const leaf = M(0x557a2e, 'foliage', 0.85, { flatShading: true }), fruit = M(0xe9c53a, 'foliage', 0.7, { flatShading: true });
  add(new THREE.CylinderGeometry(0.5, 0.36, 0.8, 12), pot, 0, 0.4, 0);
  add(new THREE.TorusGeometry(0.5, 0.06, 4, 12), pot, 0, 0.8, 0, Math.PI / 2);
  add(new THREE.TorusGeometry(0.42, 0.04, 4, 12), pot, 0, 0.3, 0, Math.PI / 2);
  add(new THREE.CircleGeometry(0.47, 10), soil, 0, 0.77, 0, -Math.PI / 2);
  limb(V(0, 0.75, 0), V(0.03, 2.0, 0.02), 0.07, 0.045, bark, 6);
  const R = 0.72, cy = 2.42;
  add(warp(new THREE.SphereGeometry(R, 12, 8), (p) => { p.multiplyScalar(1 + 0.1 * noise(p.x * 6, p.y * 6, p.z * 6)); }), leaf, 0, cy, 0);
  for (let i = 0; i < 24; i++) {
    const y = 1 - 2 * (i + 0.5) / 24; const a = i * 2.39996; const rxz = Math.sqrt(1 - y * y);
    const d = V(Math.cos(a) * rxz, y * 0.8, Math.sin(a) * rxz).normalize();
    if (d.y < -0.75) continue;
    add(new THREE.OctahedronGeometry(0.095), fruit, d.x * R * 0.98, cy + d.y * R * 0.98, d.z * R * 0.98, 0, a, 0.3, 1, 1.35, 1);
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
