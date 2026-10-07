// field_wall c1: primitives, through-stones. Four courses of jittered boxes running the full 0.5 m depth in broken bond with varied lengths and heights, topped by a coping row of rounded stones set on edge.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 46262; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const st = M(0xc9b48f, 'stone', 0.95, { flatShading: true }), st2 = M(0xb8a37d, 'stone', 0.95, { flatShading: true }), core = M(0x8f7e60, 'stone', 1.0);
  add(new THREE.BoxGeometry(4.9, 0.78, 0.36), core, 0, 0.39, 0);
  const L = 5.0; let y = 0;
  const heights = [0.22, 0.2, 0.19, 0.17];
  heights.forEach((h, c) => {
    let x = -L / 2 + (c % 2 ? rr(0.05, 0.25) : 0);
    if (c % 2) { const w0 = x + L / 2; if (w0 > 0.04) { add(new THREE.BoxGeometry(w0 - 0.02, h - 0.02, 0.48), st2, -L / 2 + w0 / 2, y + h / 2, 0); } }
    while (x < L / 2 - 0.05) {
      let w = Math.min(rr(0.32, 0.62), L / 2 - x); if (L / 2 - x - w < 0.15) w = L / 2 - x;
      const hh = h * rr(0.8, 1.0), dd = 0.5 * rr(0.9, 1.0);
      add(warp(new THREE.BoxGeometry(w - 0.03, hh - 0.02, dd), (p) => { p.y += 0.015 * noise(p.x * 9 + x * 5, p.z * 5, c); p.z += 0.02 * noise(p.y * 9, p.x * 7 + x, c); }), (Math.round(x * 7) + c) % 3 ? st : st2, x + w / 2, y + hh / 2, rr(-0.02, 0.02), 0, rr(-0.05, 0.05), rr(-0.03, 0.03));
      x += w;
    }
    y += h;
  });
  for (let x = -L / 2 + 0.11; x < L / 2 - 0.1; x += 0.25) add(new THREE.DodecahedronGeometry(0.13, 0), (Math.round(x * 4)) % 2 ? st : st2, x, y + 0.08, rr(-0.03, 0.03), rr(0, 1), rr(0, 1), 0.25, 0.85, 1.05, 1.6);

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
