// chalk_block c3: two-part reading. A jittered main block with its top-front edge cut away in a stepped chip, plus the chipped-off fragment lying at its foot and a wedge of spall; banded faces from two inset slab skins.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 22730; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const chalk = M(0xe8e2d4, 'stone', 0.95, { flatShading: true }), chalk2 = M(0xd9d2c1, 'stone', 0.95, { flatShading: true });
  const jit = (ge, k) => warp(ge, (p) => { p.x += k * noise(p.x * 4, p.y * 4, p.z * 4); p.y += k * 0.6 * noise(p.y * 4, p.z * 4, p.x * 4); p.z += k * noise(p.z * 4, p.x * 4, p.y * 4); });
  add(jit(new THREE.BoxGeometry(1.6, 1.0, 1.1, 2, 2, 2), 0.03), chalk, 0, 0.5, 0);
  add(jit(new THREE.BoxGeometry(1.6, 0.3, 0.75, 2, 1, 1), 0.03), chalk, 0, 1.15, -0.175);
  add(jit(new THREE.BoxGeometry(1.0, 0.3, 0.33, 1, 1, 1), 0.02), chalk2, -0.3, 1.15, 0.36);
  add(jit(new THREE.BoxGeometry(1.64, 0.18, 1.14), 0.01), chalk2, 0, 0.35, 0);
  add(jit(new THREE.BoxGeometry(1.64, 0.14, 1.14), 0.01), chalk2, 0, 0.75, 0);
  add(new THREE.DodecahedronGeometry(0.2, 0), chalk, 0.75, 0.1, 0.75, 0.3, 0.5, 0, 1.3, 0.6, 1);
  add(new THREE.TetrahedronGeometry(0.16, 0), chalk2, 0.35, 0.07, 0.8, 0.6, 0.2, 0.4);

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
