// crate_stack c1: primitives. Three crates (two 0.74 m below, one 0.66 m on top turned 15 degrees), each a core box with a frame of twelve edge boards and a diagonal brace on all four sides.
const crateM = M(0x8a6a44, 'timber', 0.9), frameM = M(0x6b4a2e, 'timber', 0.9);
const crate = (s, x, y, z, ry) => {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; g.add(grp);
  const a = (geo, mat, px, py, pz, rx = 0, rY = 0, rz = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(px, py, pz); ms.rotation.set(rx, rY, rz); grp.add(ms); };
  const t = s * 0.1, h = s / 2 - t / 2;
  a(new THREE.BoxGeometry(s * 0.96, s * 0.96, s * 0.96), crateM, 0, s / 2, 0);
  for (const u of [-1, 1]) for (const v of [-1, 1]) { a(new THREE.BoxGeometry(s, t, t), frameM, 0, s / 2 + u * h, v * h); a(new THREE.BoxGeometry(t, t, s), frameM, u * h, s / 2 + v * h, 0); a(new THREE.BoxGeometry(t, s, t), frameM, u * h, s / 2, v * h); }
  const dl = s * 1.18;
  for (const v of [-1, 1]) { a(new THREE.BoxGeometry(t * 0.8, dl, t * 0.5), frameM, 0, s / 2, v * s * 0.49, 0, 0, v * Math.PI / 4); a(new THREE.BoxGeometry(t * 0.5, dl, t * 0.8), frameM, v * s * 0.49, s / 2, 0, v * Math.PI / 4, 0, 0); }
};
crate(0.74, -0.39, 0, 0.02, 0.04);
crate(0.74, 0.39, 0, -0.03, -0.06);
crate(0.66, 0.02, 0.74, 0.0, 0.26);
