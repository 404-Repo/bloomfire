// haystack c3: displaced sphere. A detail-2 icosahedron cut flat below, pulled into a rounded dome with shaggy noise, eleven hay tufts (stretched tetrahedra) poking out of the surface, a little hay spill on the ground and the pole.
const hay = M(0xd9b54a, 'fabric', 0.95, { flatShading: true }), hay2 = M(0xc9a03c, 'fabric', 0.95, { flatShading: true }), pole = M(0x4a3324, 'timber', 0.9);
add(warp(new THREE.IcosahedronGeometry(1, 2), (p) => { p.multiplyScalar(1 + 0.08 * noise(p.x * 5, p.y * 5, p.z * 5)); if (p.y < -0.25) p.y = -0.25; p.x *= 1.15; p.z *= 1.15; p.y = (p.y + 0.25) * 1.5; }), hay);
for (let i = 0; i < 11; i++) { const u = rr(0.1, 0.8), a = i * 2.39996, rxz = Math.sqrt(1 - u * u); const n = V(Math.cos(a) * rxz, u, Math.sin(a) * rxz); const ms = add(new THREE.TetrahedronGeometry(0.16), hay2, n.x * 1.12, (n.y + 0.25) * 1.45, n.z * 1.12); ms.quaternion.setFromUnitVectors(V(0, 1, 0), n); ms.scale.set(0.7, 1.8, 0.7); }
for (let i = 0; i < 5; i++) { const a = rr(0, 6.28); add(new THREE.CylinderGeometry(0.2, 0.32, 0.06, 5), hay2, Math.cos(a) * 1.3, 0.03, Math.sin(a) * 1.3, 0, a, 0); }
limb(V(0, 1.6, 0), V(0.03, 2.2, 0), 0.045, 0.035, pole, 6);
