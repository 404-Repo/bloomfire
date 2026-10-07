// field_wall c1: primitives, through-stones. Four courses of jittered boxes running the full 0.5 m depth in broken bond with varied lengths and heights, topped by a coping row of rounded stones set on edge.
const st = M(0xc9b48f, 'stone', 0.95, { flatShading: true }), st2 = M(0xb8a37d, 'stone', 0.95, { flatShading: true }), core = M(0x8f7e60, 'stone', 1.0);
add(new THREE.BoxGeometry(4.9, 0.78, 0.36), core, 0, 0.39, 0);
const L = 5.0; let y = 0;
const heights = [0.22, 0.2, 0.19, 0.17];
heights.forEach((h, c) => {
  let x = -L / 2 + (c % 2 ? rr(0.05, 0.25) : 0);
  if (c % 2) { const w0 = x + L / 2; if (w0 > 0.04) { add(new THREE.BoxGeometry(w0 - 0.02, h - 0.02, 0.48), st2, -L / 2 + w0 / 2, y + h / 2, 0); } }
  while (x < L / 2 - 0.05) {
    let w = Math.min(rr(0.32, 0.62), L / 2 - x); if (L / 2 - x - w < 0.15) w = L / 2 - x;
    const hh = h * rr(0.8, 1.0), dd = 0.5 * rr(0.9, 1.0);
    add(warp(new THREE.BoxGeometry(w - 0.03, hh - 0.02, dd), (p) => { p.y += 0.015 * noise(p.x * 9 + x * 5, p.z * 5, c); p.z += 0.02 * noise(p.y * 9, p.x * 7 + x, c); }), (Math.round(x * 7) + c) % 3 ? st : st2, x + w / 2, y + hh / 2, rr(-0.02, 0.02), 0, rr(-0.05, 0.05), rr(-0.03, 0.03));
    x += w;
  }
  y += h;
});
for (let x = -L / 2 + 0.11; x < L / 2 - 0.1; x += 0.25) add(new THREE.DodecahedronGeometry(0.13, 0), (Math.round(x * 4)) % 2 ? st : st2, x, y + 0.08, rr(-0.03, 0.03), rr(0, 1), rr(0, 1), 0.25, 0.85, 1.05, 1.6);
