// flower_patch c2: hand-built. Every head is a squashed octahedron (reads from the side as well as from above) on a folded stem, in drifts: poppies to one side, daisies and ochre centre, lavender at the back, with 30 grass blades between.
const red = M(0xd2412f, 'foliage', 0.8, { flatShading: true }), white = M(0xf3efe2, 'foliage', 0.8, { flatShading: true }), ochre = M(0xe0a93a, 'foliage', 0.8, { flatShading: true });
const lav = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true }), stemM = M(0x5f7a34, 'foliage', 0.9, { side: THREE.DoubleSide }), grass = M(0x8a9a48, 'foliage', 0.9, { side: THREE.DoubleSide });
const G = soup(), S = soup();
const blade = (soupT, x, z, h, ta, w, bend) => { const tip = [x + Math.cos(ta) * bend, h, z + Math.sin(ta) * bend]; soupT.tri([x - w * Math.sin(ta), 0, z + w * Math.cos(ta)], [x, 0.02, z], tip); soupT.tri([x, 0.02, z], [x + w * Math.sin(ta), 0, z - w * Math.cos(ta)], tip); return tip; };
for (let i = 0; i < 30; i++) { const a = rr(0, 6.28), r = Math.sqrt(rnd()) * 0.5; blade(G, Math.cos(a) * r, Math.sin(a) * r, rr(0.1, 0.22), rr(0, 6.28), 0.022, 0.07); }
const drift = [['r', 0.22, 0.1, 6], ['w', -0.2, 0.18, 5], ['o', 0.0, -0.05, 4], ['l', -0.05, -0.32, 4], ['r', -0.32, -0.12, 2], ['w', 0.3, -0.25, 2]];
drift.forEach(([k, cx, cz, n]) => {
  for (let j = 0; j < n; j++) {
    const a = rr(0, 6.28), r = rr(0, 0.14), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    const h = k === 'l' ? rr(0.2, 0.26) : rr(0.18, 0.33);
    const tip = blade(S, x, z, h, rr(0, 6.28), 0.01, 0.03);
    if (k === 'l') { add(new THREE.OctahedronGeometry(1), lav, tip[0], h + 0.06, tip[2], 0, 0, 0, 0.03, 0.08, 0.03); continue; }
    const s = k === 'w' ? 0.06 : 0.07;
    add(new THREE.OctahedronGeometry(1), k === 'r' ? red : k === 'w' ? white : ochre, tip[0], h, tip[2], rr(-0.3, 0.3), rr(0, 1), rr(-0.3, 0.3), s, 0.03, s);
  }
});
add(G.geo(), grass); add(S.geo(), stemM);
