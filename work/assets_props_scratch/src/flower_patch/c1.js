// flower_patch c1: primitives. Eighteen flowers on thin three-sided stems: five-petal poppy discs with dark centres, six-petal white daisies and ochre discs with contrasting centres, lavender spikes, all over 26 folded grass blades. Heads 13 to 15 cm so they read at 10 m.
const red = M(0xd2412f, 'foliage', 0.8, { side: THREE.DoubleSide }), white = M(0xf3efe2, 'foliage', 0.8, { side: THREE.DoubleSide }), ochre = M(0xe0a93a, 'foliage', 0.8, { side: THREE.DoubleSide });
const lav = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true }), dark = M(0x2a2420, 'foliage', 0.9, { side: THREE.DoubleSide }), stemM = M(0x5f7a34, 'foliage', 0.9, { side: THREE.DoubleSide });
const grass = M(0x8a9a48, 'foliage', 0.9, { side: THREE.DoubleSide });
const G = soup(), S = soup();
for (let i = 0; i < 26; i++) {
  const a = rr(0, 6.28), r = Math.sqrt(rnd()) * 0.48, x = Math.cos(a) * r, z = Math.sin(a) * r, h = rr(0.12, 0.24), ta = rr(0, 6.28), w = 0.025;
  const tip = [x + Math.cos(ta) * 0.06, h, z + Math.sin(ta) * 0.06];
  G.tri([x - w * Math.sin(ta), 0, z + w * Math.cos(ta)], [x, 0.02, z], tip); G.tri([x, 0.02, z], [x + w * Math.sin(ta), 0, z - w * Math.cos(ta)], tip);
}
const kinds = ['r', 'r', 'w', 'o', 'r', 'w', 'l', 'o', 'w', 'r', 'l', 'o', 'w', 'r', 'o', 'l', 'w', 'r'];
kinds.forEach((k, i) => {
  const a = i * 2.39996, r = 0.08 + 0.4 * Math.sqrt((i + 0.5) / kinds.length), x = Math.cos(a) * r, z = Math.sin(a) * r;
  const h = k === 'l' ? rr(0.18, 0.22) : rr(0.2, 0.33); const lean = rr(-0.25, 0.25);
  S.tri([x - 0.008, 0, z], [x + 0.008, 0, z], [x + lean * 0.1, h, z]); S.tri([x, 0, z - 0.008], [x, 0, z + 0.008], [x + lean * 0.1, h, z]);
  const hx = x + lean * 0.1;
  if (k === 'l') { add(new THREE.OctahedronGeometry(1), lav, hx, h + 0.07, z, 0, 0, lean, 0.03, 0.09, 0.03); return; }
  const tilt = -0.25 - rnd() * 0.3;
  const head = add(new THREE.CircleGeometry(k === 'w' ? 0.08 : 0.09, k === 'w' ? 6 : 5), k === 'r' ? red : k === 'w' ? white : ochre, hx, h, z, -Math.PI / 2 + tilt * Math.cos(a), 0, tilt * Math.sin(a));
  const ctr = add(new THREE.CircleGeometry(0.032, 3), k === 'r' ? dark : k === 'w' ? ochre : dark, hx, h + 0.006, z, -Math.PI / 2 + tilt * Math.cos(a), 0, tilt * Math.sin(a));
});
add(G.geo(), grass); add(S.geo(), stemM);
