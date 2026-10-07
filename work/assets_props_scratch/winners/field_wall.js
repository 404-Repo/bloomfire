// field_wall c2: profile. A battered core (extruded trapezoid section along X) faced on both sides with flat extruded irregular-polygon stones laid in courses, and a rounded coping slab line on top.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 76053; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const st = M(0xc9b48f, 'stone', 0.95, { flatShading: true }), st2 = M(0xb8a37d, 'stone', 0.95, { flatShading: true }), core = M(0x9a8866, 'stone', 1.0);
  const sec = new THREE.Shape(); sec.moveTo(-0.24, 0); sec.lineTo(0.24, 0); sec.lineTo(0.19, 0.88); sec.lineTo(-0.19, 0.88); sec.lineTo(-0.24, 0);
  const cg = new THREE.ExtrudeGeometry(sec, { depth: 5.0, bevelEnabled: false }); cg.rotateY(Math.PI / 2); cg.translate(-2.5, 0, 0); add(cg, core);
  const stone = (w, h) => { const s = new THREE.Shape(); const n = 5, o = rr(0, 1.25); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + o; const x = Math.cos(a) * w / 2 * rr(0.85, 1.05), y = Math.sin(a) * h / 2 * rr(0.8, 1.05); i ? s.lineTo(x, y) : s.moveTo(x, y); } return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }); };
  for (const side of [-1, 1]) {
    for (let c = 0; c < 4; c++) {
      const yc = 0.13 + c * 0.21; const zf = 0.24 - (yc / 0.88) * 0.05; let x = -2.45 + (c % 2) * 0.2;
      while (x < 2.4) { const w = Math.min(rr(0.44, 0.66), 2.48 - x); if (w < 0.12) break; const ms = add(stone(w, 0.24), (c + Math.round(x * 3)) % 3 ? st : st2, x + w / 2, yc, side * (zf - 0.02), 0.06 * side, side < 0 ? Math.PI : 0, 0); x += w + 0.02; }
    }
  }
  for (let x = -2.4; x < 2.45; x += 0.42) add(new THREE.CylinderGeometry(0.13, 0.15, 0.42, 5), x % 0.84 < 0.42 ? st : st2, x + 0.2, 0.92, 0, 0, 0, Math.PI / 2, 1, 1, 1.3);

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
