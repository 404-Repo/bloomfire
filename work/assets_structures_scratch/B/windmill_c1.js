// windmill c1: primitives. Stone drum base, tapered limewash tower (cylinder), conical
// timber cap with plank ribs, tail pole behind, four lattice sails with diagonal cloth.
// userData.joints.sails: Group at the hub, sails in its local XY plane, spins about local Z.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (hex, name, r = 0.85, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra }); m.name = name; return m; };
  const stone = M(0xc9b48f, 'stone'), chalk = M(0xe8e2d4, 'stone'), plaster = M(0xeee3cf, 'plaster');
  const timber = M(0x7a5534, 'timber'), dark = M(0x4a3324, 'timber'), teal = M(0x3f8a8a, 'timber');
  const iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.4 });
  const cloth = M(0xeee3cf, 'fabric', 0.9, { side: THREE.DoubleSide });
  const put = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); p.add(me); return me; };
  const box = (p, w, h, d, mat, x, y, z, rx, ry, rz) => put(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);
  const body = new THREE.Group(); g.add(body);

  const RB = 3.3, HB = 3.0, R0 = 2.75, R1 = 2.15, HT = 10.7, CAP = 13.0;
  put(body, new THREE.CylinderGeometry(RB - 0.15, RB, HB, 20), stone, 0, HB / 2, 0);
  put(body, new THREE.CylinderGeometry(RB + 0.1, RB + 0.1, 0.3, 20), chalk, 0, HB, 0);
  // stone courses on the drum: a few proud blocks
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2 + (k % 2) * 0.2; const y = 0.5 + (k % 3) * 0.9;
    box(body, 0.9, 0.45, 0.2, chalk, Math.sin(a) * (RB - 0.05), y, Math.cos(a) * (RB - 0.05), 0, a, 0); }
  put(body, new THREE.CylinderGeometry(R1, R0, HT - HB, 20), plaster, 0, (HB + HT) / 2, 0);
  put(body, new THREE.CylinderGeometry(R1 + 0.2, R1 + 0.2, 0.3, 20), chalk, 0, HT, 0);
  // doors: stone base front (dark timber, recessed by a surround) + small windows
  const rAt = (y) => R0 + (R1 - R0) * (y - HB) / (HT - HB);
  box(body, 1.1, 2.1, 0.3, dark, 0, 1.05, RB - 0.1);
  box(body, 1.6, 0.35, 0.5, chalk, 0, 2.25, RB - 0.05);
  for (const s of [-1, 1]) box(body, 0.3, 2.1, 0.5, chalk, s * 0.7, 1.05, RB - 0.1);
  // upper door on a timber landing (as in the reference), front-right
  const a1 = 0.55; box(body, 0.8, 1.7, 0.3, teal, Math.sin(a1) * (rAt(4.2) - 0.05), 4.2, Math.cos(a1) * (rAt(4.2) - 0.05), 0, a1, 0);
  box(body, 1.0, 0.2, 0.36, chalk, Math.sin(a1) * rAt(5.15), 5.15, Math.cos(a1) * rAt(5.15), 0, a1, 0);
  const wins = [[-0.7, 7.6], [2.4, 6.4], [3.6, 8.2], [-2.3, 5.6], [1.2, 9.4], [-1.5, 9.0]];
  for (const [a, y] of wins) { const r = rAt(y); box(body, 0.5, 0.8, 0.3, dark, Math.sin(a) * (r - 0.08), y, Math.cos(a) * (r - 0.08), 0, a, 0);
    box(body, 0.7, 0.12, 0.3, chalk, Math.sin(a) * r, y - 0.46, Math.cos(a) * r, 0, a, 0); }
  // cap: timber cone with plank ribs and a dark rim
  const capH = CAP - HT - 0.15;
  put(body, new THREE.CylinderGeometry(R1 + 0.45, R1 + 0.45, 0.35, 20), dark, 0, HT + 0.32, 0);
  put(body, new THREE.ConeGeometry(R1 + 0.4, capH - 0.3, 16), timber, 0, HT + 0.5 + (capH - 0.3) / 2 - 0.05, 0);
  const ribL = Math.hypot(R1 + 0.4, capH - 0.3), ribA = Math.atan2(R1 + 0.4, capH - 0.3);
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; const piv = new THREE.Group(); piv.position.set(0, CAP - 0.05, 0); piv.rotation.y = a; body.add(piv);
    box(piv, 0.12, ribL, 0.12, dark, 0, 0, 0, 0, 0, 0).geometry.translate(0, -ribL / 2, 0);
    piv.children[0].rotation.x = ribA; }
  put(body, new THREE.SphereGeometry(0.25, 8, 6), dark, 0, CAP - 0.05, 0);
  // windshaft housing to the front
  const hubY = HT + 0.95, hubZ = R1 + 0.9;
  const shaft = new THREE.CylinderGeometry(0.32, 0.38, 2.0, 10); shaft.rotateX(Math.PI / 2); put(body, shaft, dark, 0, hubY, hubZ - 0.8);
  // tail pole down the back to a cart wheel on the ground
  const tpTop = new THREE.Vector3(0, HT + 0.4, -R1 - 0.3), tpBot = new THREE.Vector3(0, 0.45, -RB - 2.4);
  const tl = tpTop.distanceTo(tpBot), ta = Math.atan2(tpTop.z - tpBot.z, tpTop.y - tpBot.y);
  box(body, 0.3, tl, 0.3, timber, 0, (tpTop.y + tpBot.y) / 2, (tpTop.z + tpBot.z) / 2, ta, 0, 0);
  for (const s of [-1, 1]) box(body, 0.16, tl * 0.45, 0.16, timber, s * 0.9, HT - tl * 0.18, -R1 - 0.6, ta * 0.9, 0, s * 0.22);
  const wh = new THREE.TorusGeometry(0.45, 0.08, 4, 12); wh.rotateY(Math.PI / 2); put(body, wh, dark, 0, 0.45, -RB - 2.4);

  // sails at the hub
  const sails = new THREE.Group(); sails.position.set(0, hubY, hubZ); g.add(sails);
  const hub = new THREE.CylinderGeometry(0.5, 0.5, 0.6, 10); hub.rotateX(Math.PI / 2); put(sails, hub, dark);
  put(sails, new THREE.ConeGeometry(0.3, 0.5, 8), iron, 0, 0, 0.5, Math.PI / 2, 0, 0);
  const L = 8.0, IN = 1.4, WID = 1.7, NB = 10;
  for (let k = 0; k < 4; k++) {
    const arm = new THREE.Group(); arm.rotation.z = (k * Math.PI) / 2 + 0.35; sails.add(arm);
    box(arm, 0.24, L, 0.26, timber, 0, L / 2, 0.05);              // stock
    box(arm, 0.12, L - IN, 0.14, timber, WID, (L + IN) / 2, 0.12);     // outer rail
    box(arm, 0.1, L - IN, 0.12, timber, WID * 0.5, (L + IN) / 2, 0.14); // mid rail
    for (let b = 0; b <= NB; b++) box(arm, WID + 0.2, 0.1, 0.12, timber, WID / 2, IN + (b * (L - IN)) / NB, 0.16);
    // cloth: a triangle tied from the stock's tip diagonally across the lattice
    const s = new THREE.Shape([new THREE.Vector2(0.15, IN + 0.3), new THREE.Vector2(WID, IN + 0.3), new THREE.Vector2(WID, L - 0.4), new THREE.Vector2(0.15, L - 0.1)]);
    const cg = new THREE.ShapeGeometry(s); // trapezoid with slight billow
    const pos = cg.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, 0.24 + 0.15 * Math.sin((pos.getX(i) / WID) * Math.PI));
    put(arm, cg, cloth);
  }
  g.userData.joints = { sails };
