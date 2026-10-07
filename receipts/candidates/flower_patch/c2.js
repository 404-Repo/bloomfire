// flower_patch c2: hand-built. Every head is a squashed octahedron (reads from the side as well as from above) on a folded stem, in drifts: poppies to one side, daisies and ochre centre, lavender at the back, with 30 grass blades between.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 86765; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const red = M(0xd2412f, 'foliage', 0.8, { flatShading: true }), white = M(0xf3efe2, 'foliage', 0.8, { flatShading: true }), ochre = M(0xe0a93a, 'foliage', 0.8, { flatShading: true });
  const lav = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true }), stemM = M(0x5f7a34, 'foliage', 0.9, { side: THREE.DoubleSide }), grass = M(0x8a9a48, 'foliage', 0.9, { side: THREE.DoubleSide });
  const G = soup(), S = soup();
  const blade = (soupT, x, z, h, ta, w, bend) => { const tip = [x + Math.cos(ta) * bend, h, z + Math.sin(ta) * bend]; soupT.tri([x - w * Math.sin(ta), 0, z + w * Math.cos(ta)], [x, 0.02, z], tip); soupT.tri([x, 0.02, z], [x + w * Math.sin(ta), 0, z - w * Math.cos(ta)], tip); return tip; };
  for (let i = 0; i < 30; i++) { const a = rr(0, 6.28), r = Math.sqrt(rnd()) * 0.5; blade(G, Math.cos(a) * r, Math.sin(a) * r, rr(0.1, 0.22), rr(0, 6.28), 0.022, 0.07); }
  const drift = [['r', 0.22, 0.1, 6], ['w', -0.2, 0.18, 5], ['o', 0.0, -0.05, 4], ['l', -0.05, -0.32, 4], ['r', -0.32, -0.12, 2], ['w', 0.3, -0.25, 2]];
  drift.forEach(([k, cx, cz, n]) => {
    for (let j = 0; j < n; j++) {
      const a = rr(0, 6.28), r = rr(0, 0.14), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      const h = k === 'l' ? rr(0.2, 0.26) : rr(0.18, 0.33);
      const tip = blade(S, x, z, h, rr(0, 6.28), 0.01, 0.03);
      if (k === 'l') { add(new THREE.OctahedronGeometry(1), lav, tip[0], h + 0.06, tip[2], 0, 0, 0, 0.03, 0.08, 0.03); continue; }
      const s = k === 'w' ? 0.06 : 0.07;
      add(new THREE.OctahedronGeometry(1), k === 'r' ? red : k === 'w' ? white : ochre, tip[0], h, tip[2], rr(-0.3, 0.3), rr(0, 1), rr(-0.3, 0.3), s, 0.03, s);
    }
  });
  add(G.geo(), grass); add(S.geo(), stemM);

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
