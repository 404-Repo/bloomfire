// crate_stack c3: profiles. Every crate face is one extruded panel: a square frame with a diagonal brace, made by cutting two triangular holes from the board outline, set over a recessed core; lid panels the same; three crates, the top one turned.
const panelM = M(0x7a5534, 'timber', 0.9), core = M(0x9a7a50, 'timber', 0.9);
const panel = (s) => { const t = s * 0.11, h = s / 2; const sh = new THREE.Shape(); sh.moveTo(-h, -h); sh.lineTo(h, -h); sh.lineTo(h, h); sh.lineTo(-h, h); sh.lineTo(-h, -h);
  const k = t * 1.4, i = h - t; const h1 = new THREE.Path(); h1.moveTo(-i, -i + k); h1.lineTo(-i, i); h1.lineTo(i - k, i); h1.lineTo(-i, -i + k); const h2 = new THREE.Path(); h2.moveTo(-i + k, -i); h2.lineTo(i, i - k); h2.lineTo(i, -i); h2.lineTo(-i + k, -i);
  sh.holes.push(h1, h2); const ge = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false }); ge.translate(0, 0, -0.02); return ge; };
const crate = (s, x, y, z, ry) => {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; g.add(grp);
  const a = (geo, mat, px, py, pz, rx = 0, rY = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(px, py, pz); ms.rotation.set(rx, rY, 0); grp.add(ms); };
  a(new THREE.BoxGeometry(s - 0.06, s - 0.06, s - 0.06), core, 0, s / 2, 0);
  const p = panel(s), o = s / 2 - 0.02;
  a(p, panelM, 0, s / 2, o); a(p, panelM, 0, s / 2, -o, 0, Math.PI); a(p, panelM, o, s / 2, 0, 0, Math.PI / 2); a(p, panelM, -o, s / 2, 0, 0, -Math.PI / 2); a(p, panelM, 0, s - 0.02, 0, -Math.PI / 2, 0);
};
crate(0.74, -0.39, 0, 0.0, 0.03);
crate(0.74, 0.39, 0, 0.02, -0.05);
crate(0.66, 0.05, 0.74, -0.02, 0.22);
