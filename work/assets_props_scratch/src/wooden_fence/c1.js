// wooden_fence c1: primitives (o07 breakdown). Three square dark-timber posts with chamfered pyramid tops, two chunky rails let into them, dark iron bolt heads on both faces of each joint.
const post = M(0x4a3324, 'timber', 0.9), rail = M(0x7a5534, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.4 });
const xs = [-1.42, 0, 1.42];
xs.forEach((x, i) => { add(new THREE.BoxGeometry(0.15, 0.92, 0.15), post, x, 0.46, 0, 0, i * 0.08, 0); add(new THREE.ConeGeometry(0.11, 0.1, 4), post, x, 0.97, 0, 0, Math.PI / 4 + i * 0.08, 0); });
[[0.38, 0.03], [0.74, -0.02]].forEach(([y, tw], k) => {
  for (let s = 0; s < 2; s++) { const ms = add(new THREE.BoxGeometry(1.5, 0.14, 0.07), rail, -0.71 + s * 1.42, y + (s ? tw : -tw) * 0.5, 0.11, 0, 0, s ? tw : -tw); }
});
xs.forEach((x) => [0.38, 0.74].forEach((y) => { add(new THREE.BoxGeometry(0.045, 0.045, 0.03), iron, x, y, 0.155); add(new THREE.BoxGeometry(0.045, 0.045, 0.03), iron, x, y, -0.09); }));
