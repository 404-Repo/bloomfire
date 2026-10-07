// grass_tuft c1: hand-built. Thirty folded two-triangle blades fanning out of one root, tall in the middle, splaying and shorter at the edge.
const grass = M(0x8a9a48, 'foliage', 0.9, { side: THREE.DoubleSide }), grass2 = M(0x9fae58, 'foliage', 0.9, { side: THREE.DoubleSide });
const A = soup(), B = soup();
for (let i = 0; i < 30; i++) {
  const a = i * 2.39996, u = (i * 0.618) % 1, lean = 0.1 + 0.75 * u, h = 0.55 * (1 - 0.45 * u) * rr(0.85, 1.0);
  const bx = Math.cos(a) * 0.05, bz = Math.sin(a) * 0.05, w = 0.028;
  const tip = [bx + Math.cos(a) * lean * h * 0.8, h, bz + Math.sin(a) * lean * h * 0.8];
  const T = i % 3 ? A : B;
  T.tri([bx - w * Math.sin(a), 0, bz + w * Math.cos(a)], [bx, 0.03, bz], tip); T.tri([bx, 0.03, bz], [bx + w * Math.sin(a), 0, bz - w * Math.cos(a)], tip);
}
add(A.geo(), grass); add(B.geo(), grass2);
