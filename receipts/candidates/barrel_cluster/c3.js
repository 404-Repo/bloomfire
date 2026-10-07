// barrel_cluster c3: another arrangement. Two lathed barrels standing side by side, a small slatted crate on top of one, a tall amphora leaning against them and a little jug at its foot; the group reads as a stacked corner rather than a row.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 27428; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const wood = M(0x7a5534, 'timber', 0.9, { flatShading: true, side: THREE.DoubleSide }), lid = M(0x8a6440, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5, side: THREE.DoubleSide }), terra = M(0xc0603a, 'tile', 0.85, { side: THREE.DoubleSide });
  const crateM = M(0x8a6a44, 'timber', 0.9), frameM = M(0x6b4a2e, 'timber', 0.9), inner = M(0x3a2a1c, 'timber', 1.0);
  const H = 0.9, R = 0.31, r = 0.26;
  const bprof = []; for (let i = 0; i <= 6; i++) bprof.push(new THREE.Vector2(r + (R - r) * Math.sin(Math.PI * i / 6), i / 6 * H));
  const barrel = (x, z) => {
    add(new THREE.LatheGeometry(bprof, 12), wood, x, 0, z);
    add(new THREE.CircleGeometry(r - 0.01, 12), lid, x, H - 0.02, z, -Math.PI / 2);
    for (const hy of [0.1, 0.32, 0.58, 0.8]) { const rb = r + (R - r) * Math.sin(Math.PI * hy / H) + 0.01; add(new THREE.LatheGeometry([new THREE.Vector2(rb, 0), new THREE.Vector2(rb + 0.005, 0.045)], 12), iron, x, hy, z); }
  };
  barrel(-0.33, -0.05); barrel(0.33, -0.12);
  const cs = 0.35, cy = H + cs / 2;
  add(new THREE.BoxGeometry(cs * 0.9, cs * 0.9, cs * 0.9), inner, 0.3, cy, -0.12, 0, 0.3, 0);
  for (let i = 0; i < 3; i++) { const y = cy - cs / 2 + 0.06 + i * 0.115; for (const ry of [0.3, 0.3 + Math.PI / 2]) for (const sd of [-1, 1]) add(new THREE.BoxGeometry(cs, 0.08, 0.025), crateM, 0.3 + Math.sin(ry) * sd * cs / 2, y, -0.12 + Math.cos(ry) * sd * cs / 2, 0, ry, 0); }
  for (const [lx, lz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const c = Math.cos(0.3), sn = Math.sin(0.3); add(new THREE.BoxGeometry(0.04, cs, 0.04), frameM, 0.3 + (lx * c + lz * sn) * cs / 2, cy, -0.12 + (-lx * sn + lz * c) * cs / 2, 0, 0.3, 0); }
  const aprof = [[0, 0], [0.05, 0.0], [0.07, 0.05], [0.15, 0.2], [0.18, 0.36], [0.16, 0.5], [0.09, 0.6], [0.06, 0.64], [0.06, 0.76], [0.085, 0.8], [0.06, 0.81]].map(([a, b]) => new THREE.Vector2(a, b));
  const amp = add(new THREE.LatheGeometry(aprof, 10), terra, 0.02, 0.0, 0.33, -0.22, 0, 0.05);
  add(new THREE.TorusGeometry(0.06, 0.015, 3, 6), terra, 0.14, 0.62, 0.22, -0.22, Math.PI / 2, 0);
  add(new THREE.TorusGeometry(0.06, 0.015, 3, 6), terra, -0.1, 0.62, 0.22, -0.22, Math.PI / 2, 0);
  add(new THREE.LatheGeometry([[0, 0], [0.06, 0], [0.09, 0.08], [0.07, 0.17], [0.04, 0.2], [0.05, 0.24], [0.035, 0.24]].map(([a, b]) => new THREE.Vector2(a, b)), 8), terra, -0.32, 0, 0.36);

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
