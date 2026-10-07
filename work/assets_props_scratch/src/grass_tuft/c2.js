// grass_tuft c2: primitives. Twenty-two open three-sided cones as blades, tilted outward from a tight root, in two greens.
const grass = M(0x8a9a48, 'foliage', 0.9, { side: THREE.DoubleSide, flatShading: true }), grass2 = M(0x9fae58, 'foliage', 0.9, { side: THREE.DoubleSide, flatShading: true });
for (let i = 0; i < 22; i++) {
  const a = i * 2.39996, u = (i * 0.618) % 1, lean = 0.1 + 0.7 * u, h = 0.56 * (1 - 0.4 * u);
  const d = V(Math.cos(a) * lean, 1, Math.sin(a) * lean).normalize();
  const c = V(Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04).addScaledVector(d, h / 2);
  const ms = add(new THREE.ConeGeometry(0.022, h, 3, 1, true), i % 3 ? grass : grass2, c.x, c.y, c.z);
  ms.quaternion.setFromUnitVectors(V(0, 1, 0), d);
}
