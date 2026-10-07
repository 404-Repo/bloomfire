// chalk_block c2: profile. The block's front outline (rectangle with a big chipped corner and a small nick) extruded with a bevel for softened quarried edges, raised tool-mark bands across all four faces, and the spalled chip lying at its foot.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.9, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); ms.scale.set(sx, sy, sz); g.add(ms); return ms; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  let _s = 92930; const rnd = () => ((_s = (_s * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + (b - a) * rnd();
  const noise = (x, y, z) => Math.sin(x * 1.7 + y * 0.3 + 1.1) * Math.sin(y * 2.3 + z * 0.7 + 0.4) * Math.sin(z * 1.9 + x * 0.5 + 2.3);
  const warp = (geo, fn) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  // a tapered open cylinder from point a to point b (limbs, stems, shafts)
  const limb = (a, b, r0, r1, mat, rs = 6) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const ge = new THREE.CylinderGeometry(r1, r0, L + r1, rs, 1, true); ge.translate(0, L / 2, 0); const ms = new THREE.Mesh(ge, mat); ms.position.copy(a); ms.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(ms); return ms; };
  // hand-built triangle soup, one geometry per material
  const soup = () => { const a = []; return { tri(p, q, r) { a.push(...p, ...q, ...r); }, quad(p, q, r, s) { a.push(...p, ...q, ...r, ...p, ...r, ...s); }, geo() { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); ge.computeVertexNormals(); return ge; } }; };
  const chalk = M(0xe8e2d4, 'stone', 0.95, { flatShading: true }), chalk2 = M(0xdcd5c4, 'stone', 0.95, { flatShading: true });
  const W = 1.7, H = 1.3, D = 1.1;
  const sh = new THREE.Shape();
  sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H - 0.42); sh.lineTo(W / 2 - 0.18, H - 0.2); sh.lineTo(W / 2 - 0.5, H); sh.lineTo(-W / 2 + 0.12, H); sh.lineTo(-W / 2, H - 0.1); sh.lineTo(-W / 2, 0);
  const ge = new THREE.ExtrudeGeometry(sh, { depth: D - 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 1, curveSegments: 1 });
  add(ge, chalk, 0, 0.05, -(D - 0.12) / 2);
  for (const z of [-1, 1]) for (let i = 0; i < 3; i++) { const y = 0.3 + i * 0.3; add(new THREE.BoxGeometry(W - 0.5 - i * 0.12, 0.05, 0.03), chalk2, -0.12, y, z * (D / 2 + 0.005)); }
  for (const x of [-1, 1]) for (let i = 0; i < 2; i++) add(new THREE.BoxGeometry(0.03, 0.05, D - 0.4 - i * 0.15), chalk2, x * (W / 2 + 0.055), 0.35 + i * 0.32, 0.0, 0.0, 0, 0);
  add(new THREE.DodecahedronGeometry(0.14, 0), chalk2, W / 2 - 0.1, 0.07, D / 2 + 0.2, 0.3, 0.4, 0, 1.3, 0.6, 1);

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
