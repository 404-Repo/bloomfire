// chalk_block c2: profile. The block's front outline (rectangle with a big chipped corner and a small nick) extruded with a bevel for softened quarried edges, raised tool-mark bands across all four faces, and the spalled chip lying at its foot.
const chalk = M(0xe8e2d4, 'stone', 0.95, { flatShading: true }), chalk2 = M(0xdcd5c4, 'stone', 0.95, { flatShading: true });
const W = 1.7, H = 1.3, D = 1.1;
const sh = new THREE.Shape();
sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H - 0.42); sh.lineTo(W / 2 - 0.18, H - 0.2); sh.lineTo(W / 2 - 0.5, H); sh.lineTo(-W / 2 + 0.12, H); sh.lineTo(-W / 2, H - 0.1); sh.lineTo(-W / 2, 0);
const ge = new THREE.ExtrudeGeometry(sh, { depth: D - 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 1, curveSegments: 1 });
add(ge, chalk, 0, 0.05, -(D - 0.12) / 2);
for (const z of [-1, 1]) for (let i = 0; i < 3; i++) { const y = 0.3 + i * 0.3; add(new THREE.BoxGeometry(W - 0.5 - i * 0.12, 0.05, 0.03), chalk2, -0.12, y, z * (D / 2 + 0.005)); }
for (const x of [-1, 1]) for (let i = 0; i < 2; i++) add(new THREE.BoxGeometry(0.03, 0.05, D - 0.4 - i * 0.15), chalk2, x * (W / 2 + 0.055), 0.35 + i * 0.32, 0.0, 0.0, 0, 0);
add(new THREE.DodecahedronGeometry(0.14, 0), chalk2, W / 2 - 0.1, 0.07, D / 2 + 0.2, 0.3, 0.4, 0, 1.3, 0.6, 1);
