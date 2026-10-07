// water_mill c1: assembled from primitives. Stone ground storey with chalk quoins,
// half-timbered limewash upper storey, gable roof (ridge along Z), undershot wheel on +X
// in a stone mill race. userData.joints.wheel: Group at the axle, spins about local X.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (hex, name, r = 0.85, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra }); m.name = name; return m; };
  const stone = M(0xc9b48f, 'stone'), chalk = M(0xe8e2d4, 'stone'), plaster = M(0xeee3cf, 'plaster');
  const tile = M(0xc0603a, 'tile', 0.8), timber = M(0x7a5534, 'timber'), dark = M(0x4a3324, 'timber');
  const teal = M(0x3f8a8a, 'timber'), madder = M(0xa8382e, 'timber'), iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.4 });
  const water = M(0x3f8a8a, '', 0.25);
  const put = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); p.add(me); return me; };
  const box = (p, w, h, d, mat, x, y, z, rx, ry, rz) => put(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);
  const body = new THREE.Group(); g.add(body);

  const W = 8, D = 7, H1 = 3.6, H2 = 2.6, RISE = 2.3;
  // ground storey
  box(body, W, H1, D, stone, 0, H1 / 2, 0);
  // quoins, alternating
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let i = 0; i < 5; i++) {
    const y = 0.36 + i * 0.72, a = i % 2 === 0;
    box(body, a ? 0.9 : 0.5, 0.6, a ? 0.5 : 0.9, chalk, sx * (W / 2 - (a ? 0.4 : 0.2)), y, sz * (D / 2 - (a ? 0.2 : 0.4)));
    box(body, a ? 0.9 : 0.5, 0.6, a ? 0.5 : 0.9, chalk, sx * (W / 2 - (a ? 0.4 : 0.2)) + sx * 0.05, y, sz * (D / 2 - (a ? 0.2 : 0.4)) + sz * 0.05);
  }
  // recessed door, front: stone surround proud of the wall, dark door behind
  const fz = D / 2;
  box(body, 1.0, 2.1, 0.1, dark, -1.2, 1.05, fz + 0.02);
  box(body, 0.35, 2.4, 0.35, chalk, -1.85, 1.2, fz + 0.12);
  box(body, 0.35, 2.4, 0.35, chalk, -0.55, 1.2, fz + 0.12);
  box(body, 1.75, 0.45, 0.4, chalk, -1.2, 2.55, fz + 0.12);
  for (let i = 0; i < 4; i++) box(body, 0.06, 1.9, 0.04, timber, -1.55 + i * 0.23, 1.0, fz + 0.08);
  // small barred vent windows on the ground storey, all sides
  const vent = (x, y, z, ry) => { const v = new THREE.Group(); v.position.set(x, y, z); v.rotation.y = ry; body.add(v);
    box(v, 0.8, 0.6, 0.1, dark, 0, 0, 0.02); box(v, 1.1, 0.18, 0.3, chalk, 0, -0.38, 0.1); box(v, 1.1, 0.2, 0.3, chalk, 0, 0.4, 0.1); };
  vent(1.6, 2.2, fz, 0); vent(0, 2.2, -fz, Math.PI); vent(-W / 2, 2.2, 1.5, -Math.PI / 2); vent(-W / 2, 2.2, -1.5, -Math.PI / 2); vent(W / 2, 2.4, -2.4, Math.PI / 2);
  // string course
  box(body, W + 0.3, 0.3, D + 0.3, timber, 0, H1 + 0.15, 0);
  // upper storey
  const y2 = H1 + 0.3, WU = W + 0.2, DU = D + 0.2;
  box(body, WU, H2, DU, plaster, 0, y2 + H2 / 2, 0);
  // timber frame: corner posts, mid posts, top plate
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(body, 0.32, H2, 0.32, timber, sx * WU / 2, y2 + H2 / 2, sz * DU / 2);
  box(body, WU + 0.3, 0.28, DU + 0.3, timber, 0, y2 + H2, 0);
  for (const sz of [-1, 1]) for (const x of [-1.3, 1.3]) box(body, 0.26, H2, 0.12, timber, x, y2 + H2 / 2, sz * (DU / 2 + 0.05));
  for (const sx of [-1, 1]) for (const z of [-1.2, 1.2]) box(body, 0.12, H2, 0.26, timber, sx * (WU / 2 + 0.05), y2 + H2 / 2, z);
  // windows with teal shutters + red inner panels like the reference
  const win = (x, y, z, ry, inner) => { const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.y = ry; body.add(w);
    box(w, 0.8, 1.1, 0.1, inner, 0, 0, 0.03); box(w, 1.0, 0.14, 0.25, chalk, 0, -0.62, 0.1); box(w, 1.0, 0.14, 0.2, chalk, 0, 0.62, 0.08);
    box(w, 0.42, 1.1, 0.08, teal, -0.64, 0, 0.12, 0, 0.25, 0); box(w, 0.42, 1.1, 0.08, teal, 0.64, 0, 0.12, 0, -0.25, 0); };
  const wy = y2 + 1.35;
  win(-2.6, wy, DU / 2 + 0.02, 0, dark); win(2.6, wy, DU / 2 + 0.02, 0, madder);
  win(-2.6, wy, -DU / 2 - 0.02, Math.PI, madder); win(2.6, wy, -DU / 2 - 0.02, Math.PI, dark);
  win(-WU / 2 - 0.02, wy, 0, -Math.PI / 2, dark); win(WU / 2 + 0.02, wy, 2.3, Math.PI / 2, madder); win(WU / 2 + 0.02, wy, -2.3, Math.PI / 2, dark);
  // gable: triangular prism, apex up, along Z
  const y3 = y2 + H2 + 0.14;
  const prism = new THREE.CylinderGeometry(1, 1, DU, 3, 1); prism.rotateX(-Math.PI / 2);
  prism.scale(WU / 1.732, RISE / 1.5, 1); prism.translate(0, RISE / 3, 0);
  put(body, prism, plaster, 0, y3, 0);
  // gable timbers front/back: king post + two braces
  for (const sz of [-1, 1]) {
    const z = sz * (DU / 2 + 0.06);
    box(body, 0.26, RISE * 0.9, 0.12, timber, 0, y3 + RISE * 0.45, z);
    const ang = Math.atan2(RISE * 0.55, 1.8);
    box(body, 2.2, 0.22, 0.12, timber, -0.95, y3 + 0.6, z, 0, 0, ang);
    box(body, 2.2, 0.22, 0.12, timber, 0.95, y3 + 0.6, z, 0, 0, -ang);
  }
  // roof slabs with eaves overhang, ridge along Z
  const OV = 0.6, half = WU / 2, pitch = Math.atan2(RISE, half);
  const run = (half + OV) / Math.cos(pitch), RL = DU + 1.0, T = 0.25;
  for (const s of [-1, 1]) {
    const cx = s * (half + OV) / 2, cy = y3 + RISE - Math.tan(pitch) * (half + OV) / 2 + T / 2 + 0.02;
    box(body, run, T, RL, tile, cx, cy, 0, 0, 0, -s * pitch);
    // barrel-tile ribs running down the slope
    for (let k = 0; k < 11; k++) {
      const z = -RL / 2 + 0.35 + k * (RL - 0.7) / 10;
      const rib = new THREE.CylinderGeometry(0.12, 0.12, run, 5, 1, false, 0, Math.PI); rib.rotateZ(Math.PI / 2); rib.rotateX(-Math.PI / 2);
      put(body, rib, tile, cx - s * Math.sin(pitch) * 0.12, cy + Math.cos(pitch) * 0.12, z, 0, 0, -s * pitch);
    }
    for (const sz of [-1, 1]) box(body, run, 0.34, 0.12, dark, cx, cy - 0.06, sz * (RL / 2 + 0.03), 0, 0, -s * pitch);
  }
  box(body, 0.45, 0.35, RL + 0.1, tile, 0, y3 + RISE + 0.2, 0);
  // mill race along Z on +X side
  const ax = W / 2 + 1.35, ay = 3.25, R = 3.0;
  const L = 9.0;
  box(body, 2.0, 0.12, L, stone, ax, 0.06, 0);
  put(body, new THREE.PlaneGeometry(1.7, L - 0.1), water, ax, 0.42, 0, -Math.PI / 2);
  box(body, 0.6, 0.9, L, stone, ax + 1.3, 0.45, 0);
  for (let k = 0; k < 6; k++) box(body, 0.66, 0.2, 1.4, chalk, ax + 1.3, 0.95, -L / 2 + 0.75 + k * 1.5);
  // short wall on the house side, outside the house footprint
  for (const sz of [-1, 1]) box(body, 0.6, 0.9, 1.0, stone, ax - 1.3, 0.45, sz * (D / 2 + 0.5));
  // bearing pier outside the wheel
  box(body, 0.9, ay - 0.1, 1.2, stone, ax + 1.3, (ay - 0.1) / 2, 0);
  box(body, 1.1, 0.3, 1.4, chalk, ax + 1.3, ay - 0.1, 0);

  // the wheel, at the axle
  const wheel = new THREE.Group(); wheel.position.set(ax, ay, 0); g.add(wheel);
  for (const x of [-0.5, 0.5]) {
    const rim = new THREE.TorusGeometry(R - 0.12, 0.13, 5, 28); rim.rotateY(Math.PI / 2);
    put(wheel, rim, timber, x, 0, 0);
    const rim2 = new THREE.TorusGeometry(R - 0.95, 0.09, 4, 20); rim2.rotateY(Math.PI / 2);
    put(wheel, rim2, timber, x, 0, 0);
    for (let k = 0; k < 4; k++) box(wheel, 0.14, 2 * R - 0.3, 0.16, timber, x, 0, 0, (k * Math.PI) / 4, 0, 0);
  }
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    box(wheel, 1.25, 0.9, 0.08, dark, 0, Math.cos(a) * (R - 0.55), Math.sin(a) * (R - 0.55), a, 0, 0);
  }
  const hub = new THREE.CylinderGeometry(0.45, 0.45, 1.3, 10); hub.rotateZ(Math.PI / 2); put(wheel, hub, dark);
  const axle = new THREE.CylinderGeometry(0.16, 0.16, 2.9, 8); axle.rotateZ(Math.PI / 2); put(wheel, axle, iron, 0.1);
  for (const x of [-0.68, 0.68]) { const band = new THREE.CylinderGeometry(0.48, 0.48, 0.08, 10); band.rotateZ(Math.PI / 2); put(wheel, band, iron, x); }
  g.userData.joints = { wheel };
  {
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
  }
  return g;
}
