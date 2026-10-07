// wooden_fence c3: braced reading. Two stout end posts with stepped caps, three rails (top rail thicker), and a diagonal brace from the bottom of one post to the top of the other; rails sag slightly and are pegged with dark bolts.
const post = M(0x4a3324, 'timber', 0.9), rail = M(0x7a5534, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.4 });
[-1.42, 1.42].forEach((x) => { add(new THREE.BoxGeometry(0.18, 0.92, 0.18), post, x, 0.46, 0); add(new THREE.BoxGeometry(0.22, 0.06, 0.22), post, x, 0.95, 0); add(new THREE.BoxGeometry(0.14, 0.04, 0.14), post, x, 0.99, 0); });
[[0.28, 0.1], [0.55, 0.11], [0.82, 0.14]].forEach(([y, h], k) => {
  const ge = warp(new THREE.BoxGeometry(2.96, h, 0.075, 4, 1, 1), (p) => { p.y -= 0.03 * (1 - (p.x / 1.48) ** 2); });
  add(ge, rail, 0, y, 0.125 - k * 0.0);
  for (const x of [-1.42, 1.42]) add(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 5), iron, x, y, 0.17, Math.PI / 2);
});
const b0 = V(-1.3, 0.2, 0.125), b1 = V(1.3, 0.85, 0.125); const d = b1.clone().sub(b0);
const br = add(new THREE.BoxGeometry(d.length(), 0.09, 0.06), rail, (b0.x + b1.x) / 2, (b0.y + b1.y) / 2, 0.07, 0, 0, Math.atan2(d.y, d.x));
