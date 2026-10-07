// Two-storey village house, about 7 m to the ridge. Limewash block, terracotta gable roof
// with deep eaves, recessed door, teal shutters, chimney.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, r, n) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const wall = M(0xeee3cf, 0.92, 'plaster'), stone = M(0xc9b48f, 0.95, 'stone'), tile = M(0xc0603a, 0.8, 'tile');
  const teal = M(0x3f8a8a, 0.7, 'timber'), dark = M(0x4a3324, 0.8, 'timber'), timber = M(0x7a5534, 0.85, 'timber');
  const W = 7, D = 5.6, H = 6;
  const add = (geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); g.add(o); return o; };
  add(new THREE.BoxGeometry(W + 0.2, 0.6, D + 0.2), stone, 0, 0.3, 0);
  add(new THREE.BoxGeometry(W, H - 0.6, D), wall, 0, 0.6 + (H - 0.6) / 2, 0);
  // gable roof: a triangular prism extruded along x
  const sh = new THREE.Shape(); const ov = 0.55, rh = 1.7;
  sh.moveTo(-D / 2 - ov, 0); sh.lineTo(D / 2 + ov, 0); sh.lineTo(0, rh); sh.lineTo(-D / 2 - ov, 0);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: W + 2 * ov, bevelEnabled: false }), tile);
  roof.rotation.y = Math.PI / 2; roof.position.set(-W / 2 - ov, H - 0.05, 0); g.add(roof);
  // gable ends in plaster
  const gs = new THREE.Shape(); gs.moveTo(-D / 2, 0); gs.lineTo(D / 2, 0); gs.lineTo(0, rh - 0.35); gs.lineTo(-D / 2, 0);
  for (const sx of [-1, 1]) { const ge = new THREE.Mesh(new THREE.ExtrudeGeometry(gs, { depth: 0.2, bevelEnabled: false }), wall); ge.rotation.y = Math.PI / 2; ge.position.set(sx * W / 2 - 0.1, H - 0.05, 0); g.add(ge); }
  // eave fascia
  for (const sz of [-1, 1]) add(new THREE.BoxGeometry(W + 2 * ov, 0.18, 0.2), timber, 0, H - 0.08, sz * (D / 2 + ov - 0.1));
  // door, recessed with a stone surround
  add(new THREE.BoxGeometry(1.4, 2.5, 0.25), stone, -1.6, 0.6 + 1.2, D / 2 + 0.05);
  add(new THREE.BoxGeometry(1.0, 2.1, 0.2), dark, -1.6, 0.6 + 1.05, D / 2 + 0.06);
  // windows with shutters, front and back, both storeys
  for (const sz of [-1, 1]) for (const [x, y] of [[1.6, 2.1], [-1.6, 4.4], [1.6, 4.4], ...(sz < 0 ? [[-1.6, 2.1]] : [])]) {
    add(new THREE.BoxGeometry(1.0, 1.25, 0.2), dark, x, y, sz * (D / 2 + 0.02));
    add(new THREE.BoxGeometry(1.2, 0.12, 0.35), stone, x, y - 0.68, sz * (D / 2 + 0.08));
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.5, 1.2, 0.08), teal, x + s * 0.8, y, sz * (D / 2 + 0.06));
  }
  // side windows
  for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.2, 1.1, 0.9), teal, sx * (W / 2 + 0.03), 4.4, 0);
  // chimney
  add(new THREE.BoxGeometry(0.7, 1.8, 0.7), wall, 2.2, H + 1.1, -0.8);
  add(new THREE.BoxGeometry(0.9, 0.25, 0.9), tile, 2.2, H + 2.05, -0.8);
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
