// crate_stack c2: part breakdown. Slatted crates: a dark inner box behind three spaced horizontal planks per side and a planked lid, with square corner posts; two below side by side, one on top offset and turned.
const plank = M(0x8a6a44, 'timber', 0.9), post = M(0x6b4a2e, 'timber', 0.9), inner = M(0x3a2a1c, 'timber', 1.0);
const crate = (s, x, y, z, ry) => {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; g.add(grp);
  const a = (geo, mat, px, py, pz, rY = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(px, py, pz); ms.rotation.y = rY; grp.add(ms); };
  a(new THREE.BoxGeometry(s * 0.9, s * 0.9, s * 0.9), inner, 0, s / 2, 0);
  const ph = s * 0.24;
  for (let i = 0; i < 3; i++) { const py = s * 0.17 + i * s * 0.32; for (const v of [-1, 1]) { a(new THREE.BoxGeometry(s * 0.92, ph, 0.03), plank, 0, py, v * s * 0.46); a(new THREE.BoxGeometry(0.03, ph, s * 0.92), plank, v * s * 0.46, py, 0); } }
  for (let i = 0; i < 3; i++) a(new THREE.BoxGeometry(s * 0.92, 0.03, ph * 1.2), plank, 0, s - 0.015, (i - 1) * s * 0.31);
  for (const u of [-1, 1]) for (const v of [-1, 1]) a(new THREE.BoxGeometry(s * 0.09, s, s * 0.09), post, u * s * 0.46, s / 2, v * s * 0.46);
};
crate(0.74, -0.39, 0, 0.03, -0.05);
crate(0.74, 0.39, 0, -0.02, 0.07);
crate(0.66, -0.12, 0.74, 0.02, 0.32);
