// barrel_cluster c2: profiles. Lathed barrels (bulged stave profile with chime lips) with lathed iron hoops, a lathed amphora with tube handles, and a crate with X-braced faces; arrangement as the brief: standing barrel, crate, second barrel lying chocked on the crate, amphora in front.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 97628; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const wood = M(0x7a5534, 'timber', 0.9, { flatShading: true, side: THREE.DoubleSide }), lid = M(0x8a6440, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5, side: THREE.DoubleSide }), terra = M(0xc0603a, 'tile', 0.85, { side: THREE.DoubleSide });
  const crateM = M(0x8a6a44, 'timber', 0.9), frameM = M(0x6b4a2e, 'timber', 0.9);
  const H = 0.9, R = 0.31, r = 0.26;
  const bprof = []; for (let i = 0; i <= 6; i++) { const y = i / 6 * H; bprof.push(new THREE.Vector2(r + (R - r) * Math.sin(Math.PI * i / 6), y)); }
  const bulge = (y) => r + (R - r) * Math.sin(Math.PI * y / H);
  const barrel = (x, y, z, rz) => {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.z = rz; g.add(grp);
    const a = (geo, mat, py = 0, rot = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.y = py; ms.rotation.x = rot; grp.add(ms); };
    a(new THREE.LatheGeometry(bprof, 12), wood, -H / 2);
    a(new THREE.CircleGeometry(r - 0.01, 12), lid, H / 2 - 0.02, -Math.PI / 2); a(new THREE.CircleGeometry(r - 0.01, 12), lid, -H / 2 + 0.02, Math.PI / 2);
    for (const hy of [0.08, 0.3, 0.6, 0.82]) { const rb = bulge(hy) + 0.01; a(new THREE.LatheGeometry([new THREE.Vector2(rb, 0), new THREE.Vector2(rb + 0.005, 0.045)], 12), iron, hy - H / 2); }
  };
  const s = 0.6, cx = 0.38, cz = -0.15;
  add(new THREE.BoxGeometry(s, s, s), crateM, cx, s / 2, cz);
  for (const [nx, nz, ry] of [[0, 1, 0], [0, -1, 0], [1, 0, Math.PI / 2], [-1, 0, Math.PI / 2]]) {
    const px = cx + nx * (s / 2 + 0.015), pz = cz + nz * (s / 2 + 0.015);
    for (const yy of [0.04, s - 0.04]) add(new THREE.BoxGeometry(s, 0.08, 0.03), frameM, px, yy, pz, 0, ry, 0);
    for (const sd of [-1, 1]) { const ms = add(new THREE.BoxGeometry(0.08, s, 0.03), frameM, px + (ry ? 0 : sd * (s / 2 - 0.04)), s / 2, pz + (ry ? sd * (s / 2 - 0.04) : 0), 0, ry, 0); }
    add(new THREE.BoxGeometry(0.07, s * 1.15, 0.03), frameM, px, s / 2, pz, 0, ry, Math.PI / 4);
  }
  barrel(-0.42, H / 2, -0.1, 0);
  barrel(cx, s + R + 0.005, cz, Math.PI / 2);
  for (const sd of [-1, 1]) add(new THREE.BoxGeometry(0.08, 0.06, 0.12), frameM, cx + sd * 0.12, s + 0.03, cz + 0.24);
  const aprof = [[0, 0], [0.07, 0.0], [0.08, 0.04], [0.15, 0.16], [0.18, 0.3], [0.16, 0.44], [0.09, 0.52], [0.06, 0.56], [0.06, 0.64], [0.08, 0.67], [0.06, 0.68]].map(([rr2, y]) => new THREE.Vector2(rr2, y));
  add(new THREE.LatheGeometry(aprof, 10), terra, 0.0, 0, 0.38);
  for (const sd of [-1, 1]) add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(sd * 0.14, 0.45, 0.38), V(sd * 0.15, 0.56, 0.38), V(sd * 0.06, 0.6, 0.38)]), 5, 0.014, 4, false), terra);

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
