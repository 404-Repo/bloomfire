// cart c1: primitives (o06 breakdown). Ochre plank bed on two under-rails that run on as shafts sloping to the ground at +Z; plank side boards with stakes, front and tail boards; two eight-spoke wheels (timber felloe torus, iron tyre torus, hub, four through-spokes) on an iron axle.
const ochre = M(0xd9a441, 'timber', 0.85), dark = M(0x4a3324, 'timber', 0.9), wood = M(0x7a5534, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5 });
const beam = (a, b, w, h, mat) => { const d = b.clone().sub(a); const ms = add(new THREE.BoxGeometry(w, h, d.length()), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); ms.quaternion.setFromUnitVectors(V(0, 0, 1), d.normalize()); return ms; };
const zB = -1.3, zF = 0.35, zA = -0.45, Rw = 0.62;
add(new THREE.BoxGeometry(1.1, 0.06, zF - zB), ochre, 0, 0.8, (zB + zF) / 2);
for (const s of [-1, 1]) {
  beam(V(s * 0.4, 0.72, zB), V(s * 0.4, 0.72, zF), 0.1, 0.1, ochre);
  beam(V(s * 0.4, 0.72, zF - 0.05), V(s * 0.33, 0.06, 1.9), 0.09, 0.09, ochre);
  for (const y of [0.95, 1.17]) add(new THREE.BoxGeometry(0.05, 0.19, zF - zB + 0.06), ochre, s * 0.56, y, (zB + zF) / 2);
  add(new THREE.BoxGeometry(0.07, 0.05, zF - zB + 0.12), wood, s * 0.57, 1.3, (zB + zF) / 2);
  for (const z of [zB + 0.05, (zB + zF) / 2, zF - 0.05]) add(new THREE.BoxGeometry(0.08, 0.72, 0.08), wood, s * 0.6, 1.08, z);
}
add(new THREE.BoxGeometry(1.1, 0.42, 0.05), ochre, 0, 1.03, zF);
add(new THREE.BoxGeometry(1.1, 0.42, 0.05), ochre, 0, 1.03, zB);
add(new THREE.BoxGeometry(0.9, 0.07, 0.07), wood, 0, 0.12, 1.75);
add(new THREE.CylinderGeometry(0.045, 0.045, 1.66, 6), iron, 0, Rw, zA, 0, 0, Math.PI / 2);
add(new THREE.BoxGeometry(1.0, 0.1, 0.16), dark, 0, 0.7, zA);
for (const s of [-1, 1]) {
  const x = s * 0.76;
  add(new THREE.TorusGeometry(Rw - 0.035, 0.035, 4, 16), iron, x, Rw, zA, 0, Math.PI / 2, 0);
  add(new THREE.TorusGeometry(Rw - 0.1, 0.05, 4, 16), wood, x, Rw, zA, 0, Math.PI / 2, 0, 1, 1, 1.3);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8), dark, x, Rw, zA, 0, 0, Math.PI / 2);
  for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(0.04, 2 * Rw - 0.16, 0.05), wood, x, Rw, zA, k * Math.PI / 4, 0, 0);
}
