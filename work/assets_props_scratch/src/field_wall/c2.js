// field_wall c2: profile. A battered core (extruded trapezoid section along X) faced on both sides with flat extruded irregular-polygon stones laid in courses, and a rounded coping slab line on top.
const st = M(0xc9b48f, 'stone', 0.95, { flatShading: true }), st2 = M(0xb8a37d, 'stone', 0.95, { flatShading: true }), core = M(0x9a8866, 'stone', 1.0);
const sec = new THREE.Shape(); sec.moveTo(-0.24, 0); sec.lineTo(0.24, 0); sec.lineTo(0.19, 0.88); sec.lineTo(-0.19, 0.88); sec.lineTo(-0.24, 0);
const cg = new THREE.ExtrudeGeometry(sec, { depth: 5.0, bevelEnabled: false }); cg.rotateY(Math.PI / 2); cg.translate(-2.5, 0, 0); add(cg, core);
const stone = (w, h) => { const s = new THREE.Shape(); const n = 5, o = rr(0, 1.25); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + o; const x = Math.cos(a) * w / 2 * rr(0.85, 1.05), y = Math.sin(a) * h / 2 * rr(0.8, 1.05); i ? s.lineTo(x, y) : s.moveTo(x, y); } return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }); };
for (const side of [-1, 1]) {
  for (let c = 0; c < 4; c++) {
    const yc = 0.13 + c * 0.21; const zf = 0.24 - (yc / 0.88) * 0.05; let x = -2.45 + (c % 2) * 0.2;
    while (x < 2.4) { const w = Math.min(rr(0.44, 0.66), 2.48 - x); if (w < 0.12) break; const ms = add(stone(w, 0.24), (c + Math.round(x * 3)) % 3 ? st : st2, x + w / 2, yc, side * (zf - 0.02), 0.06 * side, side < 0 ? Math.PI : 0, 0); x += w + 0.02; }
  }
}
for (let x = -2.4; x < 2.45; x += 0.42) add(new THREE.CylinderGeometry(0.13, 0.15, 0.42, 5), x % 0.84 < 0.42 ? st : st2, x + 0.2, 0.92, 0, 0, 0, Math.PI / 2, 1, 1, 1.3);
