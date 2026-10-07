// flower_patch c3: clumped reading. A low lumpy meadow mound, three open grass-cone tufts, and fifteen chunky cup flowers (open five-sided cones, wide side up) in poppy red, ochre and white plus lavender spikes, ringed round the tufts.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 16565; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const red = M(0xd2412f, 'foliage', 0.8, { side: THREE.DoubleSide, flatShading: true }), white = M(0xf3efe2, 'foliage', 0.8, { side: THREE.DoubleSide, flatShading: true }), ochre = M(0xe0a93a, 'foliage', 0.8, { side: THREE.DoubleSide, flatShading: true });
  const lav = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true }), grass = M(0x8a9a48, 'foliage', 0.9, { side: THREE.DoubleSide, flatShading: true }), mound = M(0x7f9142, 'foliage', 0.95, { flatShading: true });
  add(warp(new THREE.CylinderGeometry(0.38, 0.5, 0.05, 7, 1), (p) => { p.y += 0.04 * noise(p.x * 8, 0, p.z * 8); if (p.y < 0) p.y = Math.min(p.y, -0.025); }), mound, 0, 0.025, 0);
  const tufts = [[0.16, 0.1], [-0.2, 0.12], [0.0, -0.22]];
  tufts.forEach(([x, z], i) => add(warp(new THREE.ConeGeometry(0.13, 0.26, 6, 2, true), (p) => { const a = Math.atan2(p.z, p.x); if (p.y > 0) { p.x += Math.cos(a * 3) * 0.04; p.z += Math.sin(a * 2) * 0.04; } }), grass, x, 0.16, z, 0, i, 0));
  const kinds = ['r', 'o', 'w', 'r', 'l', 'w', 'r', 'o', 'l', 'w', 'r', 'o', 'w', 'l', 'r'];
  kinds.forEach((k, i) => {
    const t = tufts[i % 3]; const a = i * 2.39996; const r = rr(0.14, 0.24); const x = t[0] + Math.cos(a) * r, z = t[1] + Math.sin(a) * r;
    if (Math.hypot(x, z) > 0.5) return;
    const h = rr(0.16, 0.3);
    limb(V(x, 0.03, z), V(x, h, z), 0.008, 0.006, grass, 3);
    if (k === 'l') { add(new THREE.OctahedronGeometry(1), lav, x, h + 0.06, z, 0, 0, 0, 0.032, 0.09, 0.032); return; }
    add(new THREE.ConeGeometry(0.07, 0.05, 5, 1, true), k === 'r' ? red : k === 'w' ? white : ochre, x, h + 0.02, z, Math.PI + rr(-0.3, 0.3), 0, rr(-0.3, 0.3));
  });

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
