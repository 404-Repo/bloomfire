// lavender_bush c3: hand-built fountain reading. A small squashed icosahedron leaf core, 44 folded grey-green leaf blades splaying from the root, and 28 stems each a folded green blade carrying a six-triangle lavender bipyramid spike.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 68400; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const leaf = M(0x7d8a63, 'foliage', 0.9, { side: THREE.DoubleSide, flatShading: true }), flower = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true });
  const L = soup(), F = soup();
  for (let i = 0; i < 44; i++) {
    const a = i * 2.39996; const lean = 0.3 + 0.8 * ((i * 0.618) % 1); const len = rr(0.3, 0.42);
    const d = V(Math.cos(a) * lean, 1, Math.sin(a) * lean).normalize(); const side = V(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(0.03);
    const b = V(Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08); const tip = b.clone().addScaledVector(d, len); tip.y -= len * 0.1 * lean;
    const mid = b.clone().addScaledVector(d, len * 0.4); mid.y += 0.015;
    L.tri([b.x - side.x, b.y, b.z - side.z], [mid.x, mid.y, mid.z], [tip.x, tip.y, tip.z]); L.tri([b.x + side.x, b.y, b.z + side.z], [tip.x, tip.y, tip.z], [mid.x, mid.y, mid.z]);
  }
  for (let i = 0; i < 28; i++) {
    const a = i * 2.39996 + 0.5; const lean = 0.15 + 0.95 * ((i * 0.618 + 0.3) % 1); const len = rr(0.36, 0.46);
    const d = V(Math.cos(a) * lean, 1, Math.sin(a) * lean).normalize(); const side = V(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(0.012);
    const b = V(Math.cos(a) * 0.09, 0.05, Math.sin(a) * 0.09); const top = b.clone().addScaledVector(d, len);
    L.tri([b.x - side.x, b.y, b.z - side.z], [b.x + side.x, b.y, b.z + side.z], [top.x, top.y, top.z]);
    const sb = b.clone().addScaledVector(d, len - 0.04), st = b.clone().addScaledVector(d, len + 0.16), sm = b.clone().addScaledVector(d, len + 0.04);
    const ring = [0, 1, 2].map((k) => { const ang = k * 2.094 + a; return [sm.x + Math.cos(ang) * 0.035, sm.y, sm.z + Math.sin(ang) * 0.035]; });
    for (let k = 0; k < 3; k++) { const p = ring[k], q = ring[(k + 1) % 3]; F.tri(p, q, [st.x, st.y, st.z]); F.tri(q, p, [sb.x, sb.y, sb.z]); }
  }
  add(L.geo(), leaf); add(F.geo(), flower);
  add(new THREE.IcosahedronGeometry(0.2, 0), M(0x7d8a63, 'foliage', 0.9, { flatShading: true }), 0, 0.1, 0, 0, 0.4, 0, 1.3, 0.75, 1.3);

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
