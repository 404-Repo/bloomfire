// flower_patch c1: primitives. Eighteen flowers on thin three-sided stems: five-petal poppy discs with dark centres, six-petal white daisies and ochre discs with contrasting centres, lavender spikes, all over 26 folded grass blades. Heads 13 to 15 cm so they read at 10 m.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 56974; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const red = M(0xd2412f, 'foliage', 0.8, { side: THREE.DoubleSide }), white = M(0xf3efe2, 'foliage', 0.8, { side: THREE.DoubleSide }), ochre = M(0xe0a93a, 'foliage', 0.8, { side: THREE.DoubleSide });
  const lav = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true }), dark = M(0x2a2420, 'foliage', 0.9, { side: THREE.DoubleSide }), stemM = M(0x5f7a34, 'foliage', 0.9, { side: THREE.DoubleSide });
  const grass = M(0x8a9a48, 'foliage', 0.9, { side: THREE.DoubleSide });
  const G = soup(), S = soup();
  for (let i = 0; i < 26; i++) {
    const a = rr(0, 6.28), r = Math.sqrt(rnd()) * 0.48, x = Math.cos(a) * r, z = Math.sin(a) * r, h = rr(0.12, 0.24), ta = rr(0, 6.28), w = 0.025;
    const tip = [x + Math.cos(ta) * 0.06, h, z + Math.sin(ta) * 0.06];
    G.tri([x - w * Math.sin(ta), 0, z + w * Math.cos(ta)], [x, 0.02, z], tip); G.tri([x, 0.02, z], [x + w * Math.sin(ta), 0, z - w * Math.cos(ta)], tip);
  }
  const kinds = ['r', 'r', 'w', 'o', 'r', 'w', 'l', 'o', 'w', 'r', 'l', 'o', 'w', 'r', 'o', 'l', 'w', 'r'];
  kinds.forEach((k, i) => {
    const a = i * 2.39996, r = 0.08 + 0.4 * Math.sqrt((i + 0.5) / kinds.length), x = Math.cos(a) * r, z = Math.sin(a) * r;
    const h = k === 'l' ? rr(0.18, 0.22) : rr(0.2, 0.33); const lean = rr(-0.25, 0.25);
    S.tri([x - 0.008, 0, z], [x + 0.008, 0, z], [x + lean * 0.1, h, z]); S.tri([x, 0, z - 0.008], [x, 0, z + 0.008], [x + lean * 0.1, h, z]);
    const hx = x + lean * 0.1;
    if (k === 'l') { add(new THREE.OctahedronGeometry(1), lav, hx, h + 0.07, z, 0, 0, lean, 0.03, 0.09, 0.03); return; }
    const tilt = -0.25 - rnd() * 0.3;
    const head = add(new THREE.CircleGeometry(k === 'w' ? 0.08 : 0.09, k === 'w' ? 6 : 5), k === 'r' ? red : k === 'w' ? white : ochre, hx, h, z, -Math.PI / 2 + tilt * Math.cos(a), 0, tilt * Math.sin(a));
    const ctr = add(new THREE.CircleGeometry(0.032, 3), k === 'r' ? dark : k === 'w' ? ochre : dark, hx, h + 0.006, z, -Math.PI / 2 + tilt * Math.cos(a), 0, tilt * Math.sin(a));
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
