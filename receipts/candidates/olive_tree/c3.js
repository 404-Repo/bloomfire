// olive_tree c3: a broader reading, like the concept paintings. One warped gnarled bole that forks into three leaning limbs under a wide, irregular umbrella of nine flattened lumpy canopy clouds.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 88015; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const bark = M(0x6e6152, 'timber', 0.95, { side: THREE.DoubleSide });
  const leafA = M(0x6f7d3c, 'foliage', 0.9, { flatShading: true }), leafB = M(0x8a9558, 'foliage', 0.9, { flatShading: true });
  const bole = warp(new THREE.CylinderGeometry(0.2, 0.38, 1.6, 8, 5, true), (p) => {
    const t = (p.y + 0.8) / 1.6; const a = t * 1.6; const x = p.x, z = p.z;
    p.x = x * Math.cos(a) - z * Math.sin(a); p.z = x * Math.sin(a) + z * Math.cos(a);
    const k = 1 + 0.22 * Math.sin(Math.atan2(z, x) * 3 + t * 5) + (t < 0.12 ? (0.12 - t) * 4 : 0); p.x *= k; p.z *= k; p.x += t * t * 0.25;
  });
  add(bole, bark, 0, 0.8, 0);
  const fork = V(0.25, 1.55, 0);
  const limbs = [[V(-1.2, 2.9, 0.35)], [V(1.35, 3.0, -0.3)], [V(0.1, 3.4, -0.9)], [V(0.2, 3.3, 1.0)]];
  limbs.forEach(([end], i) => { const mid = V((fork.x + end.x) / 2 + (i % 2 ? 0.2 : -0.2), (fork.y + end.y) / 2 + 0.1, (fork.z + end.z) / 2); limb(fork, mid, 0.17, 0.12, bark, 6); limb(mid, end, 0.12, 0.06, bark, 6); });
  const clouds = [[-1.35, 3.25, 0.4, 0.95], [1.45, 3.3, -0.3, 0.9], [0.1, 3.7, -1.0, 0.9], [0.2, 3.65, 1.05, 0.9], [0.0, 4.0, 0.0, 0.85], [-0.9, 3.55, -0.85, 0.7], [0.95, 3.5, 0.85, 0.7], [-0.75, 3.45, 1.05, 0.65], [1.0, 3.55, -1.0, 0.65]];
  clouds.forEach(([x, y, z, r], i) => {
    const ge = warp(new THREE.SphereGeometry(r, 7, 5), (p) => { p.multiplyScalar(1 + 0.2 * noise(p.x * 3.5 + i * 2, p.y * 3.5, p.z * 3.5)); p.y *= 0.55; });
    add(ge, i % 3 === 1 ? leafB : leafA, x, y, z, 0, i, 0);
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
