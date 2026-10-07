// cart c2: profiles. Each side is one extruded panel whose outline rises toward the tail and is cut with a stepped lower edge; shafts are extruded curved side profiles running from the bed down to the ground at +Z; wheels are extruded rings (felloe with a hole) with an iron rim ring, cylinder spokes and a lathed hub.
const ochre = M(0xd9a441, 'timber', 0.85), dark = M(0x4a3324, 'timber', 0.9), wood = M(0x7a5534, 'timber', 0.9), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5 });
const zB = -1.3, zF = 0.35, zA = -0.45, Rw = 0.62;
const side = new THREE.Shape(); side.moveTo(zB, 0.76); side.lineTo(zF, 0.76); side.lineTo(zF + 0.05, 1.25); side.lineTo(zF - 0.1, 1.3); side.lineTo(zB + 0.1, 1.45); side.lineTo(zB - 0.05, 1.45); side.lineTo(zB, 0.76);
for (const s of [-1, 1]) {
  const ge = new THREE.ExtrudeGeometry(side, { depth: 0.06, bevelEnabled: false }); ge.rotateY(-Math.PI / 2); add(ge, ochre, s * 0.56 + 0.03, 0, 0);
  for (const y of [0.98, 1.2]) add(new THREE.BoxGeometry(0.02, 0.03, zF - zB - 0.1), wood, s * 0.6, y, (zB + zF) / 2);
  const sh = new THREE.Shape(); sh.moveTo(zB, 0.66); sh.lineTo(zF, 0.66); sh.quadraticCurveTo(1.1, 0.6, 1.9, 0.02); sh.lineTo(1.9, 0.12); sh.quadraticCurveTo(1.1, 0.72, zF, 0.78); sh.lineTo(zB, 0.78); sh.lineTo(zB, 0.66);
  const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.09, bevelEnabled: false, curveSegments: 5 }); sg.rotateY(-Math.PI / 2); add(sg, ochre, s * 0.4 + 0.045, 0, 0);
}
add(new THREE.BoxGeometry(1.1, 0.06, zF - zB), ochre, 0, 0.8, (zB + zF) / 2);
add(new THREE.BoxGeometry(1.12, 0.48, 0.06), ochre, 0, 1.02, zF);
add(new THREE.BoxGeometry(1.12, 0.62, 0.06), ochre, 0, 1.12, zB);
add(new THREE.BoxGeometry(0.88, 0.07, 0.07), wood, 0, 0.1, 1.72);
add(new THREE.CylinderGeometry(0.045, 0.045, 1.66, 6), iron, 0, Rw, zA, 0, 0, Math.PI / 2);
add(new THREE.BoxGeometry(1.0, 0.1, 0.16), dark, 0, 0.7, zA);
const ring = (R, r, d) => { const s = new THREE.Shape(); s.absarc(0, 0, R, 0, Math.PI * 2, false); const h = new THREE.Path(); h.absarc(0, 0, r, 0, Math.PI * 2, true); s.holes.push(h); return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 14 }); };
for (const s of [-1, 1]) {
  const x = s * 0.76;
  const t = ring(Rw, Rw - 0.04, 0.09); t.translate(0, 0, -0.045); add(t, iron, x, Rw, zA, 0, Math.PI / 2, 0);
  const f = ring(Rw - 0.035, Rw - 0.13, 0.07); f.translate(0, 0, -0.035); add(f, wood, x, Rw, zA, 0, Math.PI / 2, 0);
  add(new THREE.LatheGeometry([[0, -0.12], [0.06, -0.12], [0.1, -0.06], [0.1, 0.06], [0.06, 0.12], [0, 0.12]].map(([r, y]) => new THREE.Vector2(r, y)), 8), dark, x, Rw, zA, 0, 0, Math.PI / 2);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; const r0 = 0.09, r1 = Rw - 0.11; limb(V(x, Rw + Math.cos(a) * r0, zA + Math.sin(a) * r0), V(x, Rw + Math.cos(a) * r1, zA + Math.sin(a) * r1), 0.028, 0.022, wood, 5); }
}
