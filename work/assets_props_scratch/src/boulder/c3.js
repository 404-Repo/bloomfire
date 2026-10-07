// boulder c3: bedded reading. Limestone splits along its beds, so this is three stacked, jittered slabs of decreasing size (segmented boxes with noisy corners), the top one tilted, with a crack between the lower two.
const lime = M(0xcfc3a5, 'stone', 0.95, { flatShading: true }), lime2 = M(0xc2b597, 'stone', 0.95, { flatShading: true });
const slab = (w, h, d, x, y, z, ry, rz, mat) => add(warp(new THREE.BoxGeometry(w, h, d, 2, 1, 2), (p) => { const k = 0.12; p.x += k * w * noise(p.x * 3 + y, p.y * 5, p.z * 3); p.z += k * d * noise(p.z * 3, p.x * 3 + x, p.y * 4); p.y += 0.12 * h * noise(p.x * 4, p.z * 4, y); const cr = Math.abs(p.x) / (w / 2) + Math.abs(p.z) / (d / 2); if (cr > 1.6) { p.x *= 0.88; p.z *= 0.88; } }), mat, x, y, z, 0, ry, rz);
slab(2.2, 0.62, 1.7, 0, 0.31, 0, 0.1, 0, lime);
slab(1.85, 0.55, 1.45, 0.08, 0.88, -0.05, -0.15, 0.03, lime2);
slab(1.3, 0.46, 1.05, -0.1, 1.38, 0.05, 0.35, -0.08, lime);
