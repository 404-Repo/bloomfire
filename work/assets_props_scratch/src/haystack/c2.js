// haystack c2: part breakdown. The stack as stacked layers of hay: five flattened tori of decreasing radius with a cone cap, so the straw reads as banded drifts, plus a pole through the crown.
const hay = M(0xd9b54a, 'fabric', 0.95, { flatShading: true }), hay2 = M(0xc9a03c, 'fabric', 0.95, { flatShading: true }), pole = M(0x4a3324, 'timber', 0.9);
add(new THREE.CylinderGeometry(0.95, 1.15, 0.3, 12), hay2, 0, 0.15, 0);
[[1.0, 0.25, 0.3], [0.9, 0.24, 0.65], [0.74, 0.23, 0.98], [0.55, 0.21, 1.28], [0.34, 0.19, 1.54]].forEach(([R, r, y], i) => add(warp(new THREE.TorusGeometry(R, r, 4, 12), (p) => p.multiplyScalar(1 + 0.04 * noise(p.x * 6, p.y * 6, p.z * 6))), i % 2 ? hay2 : hay, 0, y, 0, Math.PI / 2, 0, i * 0.4, 1, 1, 0.75));
add(new THREE.ConeGeometry(0.42, 0.4, 10), hay, 0, 1.78, 0);
limb(V(0, 1.6, 0), V(0.03, 2.2, 0), 0.045, 0.035, pole, 6);
