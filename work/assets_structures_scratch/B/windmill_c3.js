// windmill c3: a different part breakdown. Faceted (10-sided, flat shaded) tower on a
// base of individual chunky stones laid in rings; planked conical cap built from radial
// boards; sails as ladders (two rails + rungs) carrying spread rectangular cloths tied
// back on alternate arms. userData.joints.sails: Group at the hub, spins about local Z.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (hex, name, r = 0.85, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra }); m.name = name; return m; };
  const stone = M(0xc9b48f, 'stone'), chalk = M(0xe8e2d4, 'stone'), plaster = M(0xeee3cf, 'plaster', 0.9, { flatShading: true });
  const timber = M(0x7a5534, 'timber'), dark = M(0x4a3324, 'timber'), teal = M(0x3f8a8a, 'timber');
  const iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.4 });
  const cloth = M(0xeee3cf, 'fabric', 0.9, { side: THREE.DoubleSide });
  const put = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); p.add(me); return me; };
  const box = (p, w, h, d, mat, x, y, z, rx, ry, rz) => put(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);
  const body = new THREE.Group(); g.add(body);
  const HB = 3.0, HT = 10.6, CAP = 13.0, R0 = 2.7, R1 = 2.1, RB = 3.2;
  // stone base: a core plus rings of chunky individual stones
  put(body, new THREE.CylinderGeometry(RB - 0.2, RB - 0.1, HB, 12), stone, 0, HB / 2, 0);
  for (let row = 0; row < 5; row++) { const n = 13, y = 0.3 + row * 0.6;
    for (let k = 0; k < n; k++) { if (row < 4 && k === 0) continue; const a = ((k + (row % 2) * 0.5) / n) * Math.PI * 2;
      box(body, 1.35, 0.52, 0.45, (k + row) % 4 === 0 ? chalk : stone, Math.sin(a) * (RB - 0.15), y, Math.cos(a) * (RB - 0.15), 0, a, 0); } }
  box(body, 1.1, 2.3, 0.4, dark, 0, 1.15, RB - 0.2);
  box(body, 1.8, 0.4, 0.6, chalk, 0, 2.5, RB - 0.1);
  // faceted tower
  put(body, new THREE.CylinderGeometry(R1, R0, HT - HB, 10), plaster, 0, (HB + HT) / 2, 0);
  put(body, new THREE.CylinderGeometry(R0 + 0.3, R0 + 0.35, 0.35, 10), chalk, 0, HB + 0.1, 0);
  put(body, new THREE.CylinderGeometry(R1 + 0.3, R1 + 0.2, 0.35, 10), chalk, 0, HT - 0.1, 0);
  const rAt = (y) => R0 + (R1 - R0) * (y - HB) / (HT - HB);
  // windows on facet centres (facets of a 10-gon centred at a = (k+0.5)*36deg)
  const fac = (k) => ((k + 0.5) / 10) * Math.PI * 2;
  for (const [k, y, tealDoor] of [[0, 4.3, true], [9, 6.8], [3, 5.5], [5, 8.0], [7, 6.0], [2, 8.6], [6, 4.6]]) {
    const a = fac(k), r = rAt(y) * Math.cos(Math.PI / 10), w = tealDoor ? 0.85 : 0.5, h = tealDoor ? 1.7 : 0.8;
    box(body, w, h, 0.3, tealDoor ? teal : dark, Math.sin(a) * (r - 0.08), y, Math.cos(a) * (r - 0.08), 0, a, 0);
    box(body, w + 0.3, 0.16, 0.34, chalk, Math.sin(a) * r, y + h / 2 + 0.08, Math.cos(a) * r, 0, a, 0);
    box(body, w + 0.3, 0.14, 0.34, chalk, Math.sin(a) * r, y - h / 2 - 0.07, Math.cos(a) * r, 0, a, 0);
  }
  // planked cap: radial boards leaning in to an apex
  const capB = HT + 0.1, capH = CAP - capB, rr = R1 + 0.55, n = 18;
  put(body, new THREE.ConeGeometry(rr - 0.1, capH - 0.1, n), dark, 0, capB + (capH - 0.1) / 2, 0);
  const slant = Math.hypot(rr, capH), tilt = Math.atan2(rr, capH);
  for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; const piv = new THREE.Group(); piv.position.set(0, CAP, 0); piv.rotation.y = a; body.add(piv);
    const plank = new THREE.BoxGeometry(2 * Math.PI * rr / n * 0.92, slant, 0.12); plank.translate(0, -slant / 2, 0.06);
    const pm = put(piv, plank, timber); pm.rotation.x = -tilt; }
  put(body, new THREE.CylinderGeometry(rr + 0.05, rr + 0.05, 0.25, n), dark, 0, capB + 0.08, 0);
  // tail pole + brace
  const top = new THREE.Vector3(0, HT + 0.5, -R1 - 0.5), bot = new THREE.Vector3(0, 0.3, -5.6);
  const tl = top.distanceTo(bot), ta = Math.atan2(top.z - bot.z, top.y - bot.y);
  box(body, 0.3, tl, 0.3, timber, 0, (top.y + bot.y) / 2, (top.z + bot.z) / 2, ta, 0, 0);
  box(body, 1.4, 0.3, 0.3, timber, 0, 0.3, -5.6);
  // sails
  const hubY = HT + 1.0, hubZ = R1 + 1.0;
  const shaft = new THREE.CylinderGeometry(0.3, 0.3, 2.0, 8); shaft.rotateX(Math.PI / 2); put(body, shaft, dark, 0, hubY, hubZ - 0.9);
  const sails = new THREE.Group(); sails.position.set(0, hubY, hubZ); g.add(sails);
  const hub = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 8); hub.rotateX(Math.PI / 2); put(sails, hub, dark);
  box(sails, 0.4, 0.4, 0.4, iron, 0, 0, 0.35);
  const L = 8.0, IN = 1.2, WID = 1.9;
  for (let k = 0; k < 4; k++) {
    const arm = new THREE.Group(); arm.rotation.z = (k * Math.PI) / 2 + 0.25; sails.add(arm);
    box(arm, 0.26, L, 0.26, timber, 0, L / 2, 0);
    for (const x of [-WID / 2, WID / 2]) box(arm, 0.13, L - IN, 0.13, timber, x, (L + IN) / 2, 0.1);
    for (let b = 0; b < 9; b++) box(arm, WID + 0.25, 0.11, 0.11, timber, 0, IN + 0.2 + b * (L - IN - 0.3) / 8, 0.12);
    // cloth: a triangle tied from the inner corner diagonally to the tip, its free edge
    // rolled into a bundle along the diagonal (the reference's half-wrapped lattice)
    const dx = WID - 0.1, dy = L - IN - 0.6, dl = Math.hypot(dx, dy);
    const half = new THREE.Shape([new THREE.Vector2(-WID / 2 + 0.05, IN + 0.3), new THREE.Vector2(WID / 2 - 0.05, IN + 0.3), new THREE.Vector2(-WID / 2 + 0.05, L - 0.3)]);
    const hg = new THREE.ShapeGeometry(half); put(arm, hg, cloth, 0, 0, 0.24, 0, k % 2 ? 0.1 : -0.1, 0);
    put(arm, new THREE.CylinderGeometry(0.17, 0.12, dl, 6), cloth, 0, (L + IN) / 2, 0.3, 0, 0, Math.atan2(dx, dy));
  }
  g.userData.joints = { sails };
