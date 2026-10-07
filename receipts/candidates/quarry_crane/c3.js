// quarry_crane c3: a different part breakdown. Twin-beam jib (two parallel timbers with
// spacer blocks, the way the reference draws it), mast held by two raking back legs to a
// rectangular sill frame, winch with a hand wheel on BOTH ends, iron cheek plates at the joints.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (hex, name, r = 0.85, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra }); m.name = name; return m; };
  const timber = M(0x7a5534, 'timber'), dark = M(0x4a3324, 'timber'), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5 });
  const rope = M(0xc9b48f, 'fabric', 0.95);
  const put = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); p.add(me); return me; };
  const box = (p, w, h, d, mat, x, y, z, rx, ry, rz) => put(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);
  const body = new THREE.Group(); g.add(body);
  const beam = (a, b, sx, sz, mat = timber, round = false) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
    const geo = round ? new THREE.CylinderGeometry(sx, sx, L, 5) : new THREE.BoxGeometry(sx, L, sz ?? sx);
    const me = new THREE.Mesh(geo, mat); me.position.copy(A).addScaledVector(d, 0.5);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); body.add(me); return me; };
  const MH = 9.2;
  // sill frame: rectangle of timbers + cross piece
  for (const z of [-1.4, 1.4]) box(body, 6.6, 0.5, 0.5, timber, -0.9, 0.25, z);
  for (const x of [-4.0, 0, 2.2]) box(body, 0.5, 0.5, 3.4, timber, x, 0.25, 0);
  for (const [x, z] of [[-4.0, -1.4], [-4.0, 1.4], [2.2, -1.4], [2.2, 1.4]]) box(body, 0.56, 0.12, 0.56, iron, x, 0.52, z);
  // mast (thick) and two raking back legs
  box(body, 0.8, MH, 0.8, timber, 0, 0.4 + MH / 2, 0);
  for (const y of [2.0, 5.0, 8.0]) box(body, 0.9, 0.3, 0.9, iron, 0, y, 0);
  box(body, 1.2, 0.45, 1.2, dark, 0, 0.4 + MH + 0.22, 0);
  for (const z of [-1.3, 1.3]) { beam([-0.15, 5.4, z * 0.12], [-3.0, 0.5, z], 0.36); box(body, 0.1, 0.5, 0.5, iron, -0.3, 5.2, z * 0.2); }
  // twin-beam jib with spacers
  const F = [0.45, 1.3], T = [5.8, 12.0], dxj = T[0] - F[0], dyj = T[1] - F[1];
  for (const z of [-0.32, 0.32]) beam([F[0], F[1], z], [T[0], T[1], z], 0.46, 0.3);
  for (const t of [0.12, 0.35, 0.6, 0.85]) { const me = box(body, 0.36, 0.6, 0.36, dark, F[0] + dxj * t, F[1] + dyj * t, 0); me.rotation.z = -Math.atan2(dxj, dyj); }
  for (const z of [-0.49, 0.49]) { box(body, 0.6, 0.7, 0.04, iron, T[0] - 0.05, T[1] - 0.25, z, 0, 0, -Math.atan2(dxj, dyj)); box(body, 0.7, 0.8, 0.04, iron, F[0] + 0.05, F[1] + 0.1, z, 0, 0, -Math.atan2(dxj, dyj)); }
  // heel block bolting jib to mast foot
  box(body, 0.7, 1.1, 1.2, dark, 0.45, 1.05, 0);
  // sheaves
  for (const [x, y] of [[0.3, MH + 0.35], [T[0] + 0.05, T[1] - 0.25]]) { const sh = new THREE.CylinderGeometry(0.45, 0.45, 0.24, 12); sh.rotateX(Math.PI / 2); put(body, sh, dark, x, y, 0); }
  // stays, hoist, hook
  for (const z of [-0.2, 0.2]) beam([0.35, MH + 0.5, z], [T[0] - 0.25, T[1] + 0.05, z], 0.045, null, rope, true);
  const hx = T[0] + 0.38, HY = 6.8;
  for (const dx of [-0.07, 0.07]) beam([hx + dx, T[1] - 0.3, 0], [hx + dx, HY + 0.5, 0], 0.035, null, rope, true);
  box(body, 0.5, 0.8, 0.42, iron, hx, HY + 0.3, 0);
  put(body, new THREE.TorusGeometry(0.4, 0.11, 6, 10, Math.PI * 1.4), iron, hx, HY - 0.3, 0, 0, 0, Math.PI * 0.85);
  // winch with two hand wheels
  const WX = -2.3, WY = 1.75;
  for (const z of [-1.0, 1.0]) { box(body, 0.42, WY + 0.1, 0.42, timber, WX, 0.5 + (WY - 0.1) / 2, z); beam([WX - 1.1, 0.5, z], [WX, WY, z], 0.26); beam([WX + 1.1, 0.5, z], [WX, WY, z], 0.26); }
  const drum = new THREE.CylinderGeometry(0.75, 0.75, 1.6, 12); drum.rotateX(Math.PI / 2); put(body, drum, rope, WX, WY + 0.2, 0);
  for (let k = 0; k < 6; k++) { const r = new THREE.TorusGeometry(0.76, 0.05, 4, 12); put(body, r, rope, WX, WY + 0.2, -0.6 + k * 0.24); }
  const ax = new THREE.CylinderGeometry(0.13, 0.13, 3.8, 6); ax.rotateX(Math.PI / 2); put(body, ax, iron, WX, WY + 0.2, 0);
  for (const z of [-1.75, 1.75]) {
    put(body, new THREE.TorusGeometry(1.4, 0.12, 5, 18), timber, WX, WY + 0.2, z);
    for (let k = 0; k < 3; k++) box(body, 0.13, 2.8, 0.13, timber, WX, WY + 0.2, z, 0, 0, (k * Math.PI) / 3);
  }
  beam([WX + 0.6, WY + 0.8, 0], [0.1, MH + 0.25, 0], 0.035, null, rope, true);
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
