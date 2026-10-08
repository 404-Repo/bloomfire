// crate_stack c3: profiles. Every crate face is one extruded panel: a square frame with a diagonal brace, made by cutting two triangular holes from the board outline, set over a recessed core; lid panels the same; three crates, the top one turned.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 40647; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const panelM = M(0x7a5534, 'timber', 0.9), core = M(0x9a7a50, 'timber', 0.9);
  const panel = (s) => { const t = s * 0.11, h = s / 2; const sh = new THREE.Shape(); sh.moveTo(-h, -h); sh.lineTo(h, -h); sh.lineTo(h, h); sh.lineTo(-h, h); sh.lineTo(-h, -h);
    const k = t * 1.4, i = h - t; const h1 = new THREE.Path(); h1.moveTo(-i, -i + k); h1.lineTo(-i, i); h1.lineTo(i - k, i); h1.lineTo(-i, -i + k); const h2 = new THREE.Path(); h2.moveTo(-i + k, -i); h2.lineTo(i, i - k); h2.lineTo(i, -i); h2.lineTo(-i + k, -i);
    sh.holes.push(h1, h2); const ge = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false }); ge.translate(0, 0, -0.02); return ge; };
  const crate = (s, x, y, z, ry) => {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; g.add(grp);
    const a = (geo, mat, px, py, pz, rx = 0, rY = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(px, py, pz); ms.rotation.set(rx, rY, 0); grp.add(ms); };
    a(new THREE.BoxGeometry(s - 0.06, s - 0.06, s - 0.06), core, 0, s / 2, 0);
    const p = panel(s), o = s / 2 - 0.02;
    a(p, panelM, 0, s / 2, o); a(p, panelM, 0, s / 2, -o, 0, Math.PI); a(p, panelM, o, s / 2, 0, 0, Math.PI / 2); a(p, panelM, -o, s / 2, 0, 0, -Math.PI / 2); a(p, panelM, 0, s - 0.02, 0, -Math.PI / 2, 0);
  };
  crate(0.74, -0.39, 0, 0.0, 0.03);
  crate(0.74, 0.39, 0, 0.02, -0.05);
  crate(0.66, 0.05, 0.74, -0.02, 0.22);

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
