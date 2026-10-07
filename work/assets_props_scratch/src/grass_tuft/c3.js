// grass_tuft c3: arcing blades. Eighteen blades each built as a tapering two-segment strip (a quad then a tip triangle) that bends over, so the tuft has a curved fountain silhouette.
const grass = M(0x8a9a48, 'foliage', 0.9, { side: THREE.DoubleSide }), grass2 = M(0x9fae58, 'foliage', 0.9, { side: THREE.DoubleSide });
const A = soup(), B = soup();
for (let i = 0; i < 18; i++) {
  const a = i * 2.39996, u = (i * 0.618) % 1, lean = 0.15 + 0.85 * u, h = 0.55 * (1 - 0.35 * u) * rr(0.9, 1);
  const dx = Math.cos(a), dz = Math.sin(a), sx = -dz, sz = dx, w = 0.035;
  const b = [dx * 0.04, 0, dz * 0.04];
  const m = [b[0] + dx * lean * h * 0.25, h * 0.6, b[2] + dz * lean * h * 0.25];
  const t = [b[0] + dx * lean * h * 0.85, h * (1 - 0.25 * lean), b[2] + dz * lean * h * 0.85];
  const T = i % 3 ? A : B;
  T.quad([b[0] - sx * w, 0, b[2] - sz * w], [b[0] + sx * w, 0, b[2] + sz * w], [m[0] + sx * w * 0.6, m[1], m[2] + sz * w * 0.6], [m[0] - sx * w * 0.6, m[1], m[2] - sz * w * 0.6]);
  T.tri([m[0] - sx * w * 0.6, m[1], m[2] - sz * w * 0.6], [m[0] + sx * w * 0.6, m[1], m[2] + sz * w * 0.6], t);
}
add(A.geo(), grass); add(B.geo(), grass2);
