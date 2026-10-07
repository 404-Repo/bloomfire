// cart c3: another reading. The cart at rest, pitched forward about its axle so the shaft tips sit on the ground; open slatted sides (two rails over a row of upright slats) instead of boards; twelve-spoke wheels.
const ochre = M(0xd9a441, 'timber', 0.85), dark = M(0x4a3324, 'timber', 0.9), wood = M(0x7a5534, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5 });
const zB = -1.35, zF = 0.4, Rw = 0.62;
const body = new THREE.Group(); body.position.set(0, Rw, -0.45); g.add(body);
const b = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); body.add(ms); return ms; };
const zc = (zB + zF) / 2 + 0.45;
b(new THREE.BoxGeometry(1.1, 0.06, zF - zB), ochre, 0, 0.16, zc);
for (const s of [-1, 1]) {
  b(new THREE.BoxGeometry(0.1, 0.1, zF - zB), ochre, s * 0.4, 0.08, zc);
  b(new THREE.BoxGeometry(0.09, 0.09, 1.65), ochre, s * 0.37, 0.08, zF + 0.45 + 0.78, 0, s * 0.02, 0);
  for (const y of [0.42, 0.68]) b(new THREE.BoxGeometry(0.06, 0.08, zF - zB + 0.08), ochre, s * 0.57, y, zc);
  for (let i = 0; i < 6; i++) b(new THREE.BoxGeometry(0.05, 0.56, 0.07), wood, s * 0.56, 0.44, zB + 0.45 + 0.08 + i * (zF - zB - 0.16) / 5);
}
b(new THREE.BoxGeometry(1.12, 0.56, 0.05), ochre, 0, 0.44, zF + 0.45);
b(new THREE.BoxGeometry(1.12, 0.56, 0.05), ochre, 0, 0.44, zB + 0.45);
b(new THREE.BoxGeometry(0.85, 0.07, 0.07), wood, 0, 0.08, 2.0);
body.rotation.x = Math.atan2(Rw + 0.08 - 0.06, 2.05);
add(new THREE.CylinderGeometry(0.045, 0.045, 1.66, 6), iron, 0, Rw, -0.45, 0, 0, Math.PI / 2);
for (const s of [-1, 1]) {
  const x = s * 0.76;
  add(new THREE.TorusGeometry(Rw - 0.035, 0.035, 4, 18), iron, x, Rw, -0.45, 0, Math.PI / 2, 0);
  add(new THREE.TorusGeometry(Rw - 0.1, 0.045, 4, 18), wood, x, Rw, -0.45, 0, Math.PI / 2, 0, 1, 1, 1.4);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8), dark, x, Rw, -0.45, 0, 0, Math.PI / 2);
  for (let k = 0; k < 6; k++) add(new THREE.BoxGeometry(0.035, 2 * Rw - 0.16, 0.045), wood, x, Rw, -0.45, k * Math.PI / 6, 0, 0);
}
