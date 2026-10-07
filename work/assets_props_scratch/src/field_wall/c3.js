// field_wall c3: rubble reading. Rounded fieldstones (squashed dodecahedra) piled in three rough courses over a hidden core, with a top course of flatter capstones; the ends taper a little like a real field wall.
const st = M(0xc9b48f, 'stone', 0.95, { flatShading: true }), st2 = M(0xb8a37d, 'stone', 0.95, { flatShading: true }), core = M(0x8f7e60, 'stone', 1.0);
add(new THREE.BoxGeometry(4.8, 0.75, 0.3), core, 0, 0.375, 0);
let n = 0;
[[0.15, 0.25, 0.3], [0.4, 0.22, 0.27], [0.62, 0.2, 0.25]].forEach(([y, h, r], c) => {
  let x = -2.5 + r * 0.9 + (c % 2) * 0.15;
  while (x < 2.5 - r * 0.8) { const rx = r * rr(0.9, 1.25); add(new THREE.DodecahedronGeometry(1, 0), (n++ % 3) ? st : st2, x, y + rr(-0.02, 0.02), rr(-0.02, 0.02), rr(0, 3), rr(0, 3), rr(0, 3), rx, h * 0.6, 0.27); x += rx * 1.55; }
});
for (let x = -2.3; x < 2.35; x += 0.46) add(new THREE.DodecahedronGeometry(1, 0), (n++ % 2) ? st : st2, x, 0.88, 0, 0.3, rr(0, 1), 0.2, 0.3, 0.1, 0.27);
