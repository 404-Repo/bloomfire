// windmill c2: profiles. The whole tower (stone drum, ledge, tapered limewash shaft,
// cornice) is one LatheGeometry; the cap is a lathed ogee dome; each sail lattice is a
// single extruded Shape with the grid cut out as holes; cloth is a diagonal triangle.
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
  const V = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Group(); g.add(body);

  const HB = 3.0, HT = 10.6, CAP = 13.0, R0 = 2.75, R1 = 2.15;
  put(body, new THREE.LatheGeometry(V([[0, 0], [3.35, 0], [3.25, 0.6], [3.15, HB - 0.05], [3.4, HB], [3.4, HB + 0.28], [3.1, HB + 0.3]]), 22), stone);
  put(body, new THREE.LatheGeometry(V([[R0, HB + 0.3], [R1, HT], [R1 + 0.25, HT + 0.02], [R1 + 0.25, HT + 0.3], [0, HT + 0.3]]), 22), plaster);
  // ogee timber cap
  const capPts = [[R1 + 0.5, 0], [R1 + 0.5, 0.35], [R1 + 0.25, 0.45], [R1 + 0.05, 1.0], [1.6, 1.55], [0.9, 1.95], [0.3, 2.1], [0.22, 2.2], [0.3, 2.3], [0.12, 2.6], [0, 2.6]];
  const y0 = HT + 0.3 - 0.2, sc = (CAP - y0) / 2.6;
  put(body, new THREE.LatheGeometry(V(capPts.map(([r, y]) => [r, y * sc])), 16), timber, 0, y0, 0);
  // vertical plank seams on the cap
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(body, 0.1, 0.9, 0.08, dark, Math.sin(a) * (R1 + 0.3), y0 + 0.75, Math.cos(a) * (R1 + 0.3), -0.35, a, 0); }
  put(body, new THREE.CylinderGeometry(R1 + 0.55, R1 + 0.55, 0.22, 16), dark, 0, y0 + 0.1, 0);
  // openings: stone surround + dark recess, placed by angle and height
  const rAt = (y) => (y < HB ? 3.2 : R0 + (R1 - R0) * (y - HB - 0.3) / (HT - HB - 0.3));
  const opening = (a, y, w, h, fill, arch) => { const r = rAt(y); const h0 = new THREE.Group(); h0.position.set(Math.sin(a) * r, y, Math.cos(a) * r); h0.rotation.y = a; body.add(h0);
    box(h0, w, h, 0.3, fill, 0, 0, -0.08);
    box(h0, 0.22, h + 0.2, 0.3, chalk, -w / 2 - 0.1, 0.05, 0.02); box(h0, 0.22, h + 0.2, 0.3, chalk, w / 2 + 0.1, 0.05, 0.02);
    if (arch) { const ar = new THREE.TorusGeometry(w / 2 + 0.1, 0.13, 4, 8, Math.PI); put(h0, ar, chalk, 0, h / 2, 0.02); const fillA = new THREE.CircleGeometry(w / 2, 8, 0, Math.PI); put(h0, fillA, fill, 0, h / 2, 0.01); }
    else box(h0, w + 0.5, 0.22, 0.34, chalk, 0, h / 2 + 0.1, 0.03);
    box(h0, w + 0.4, 0.14, 0.36, chalk, 0, -h / 2 - 0.05, 0.04); };
  opening(0, 1.05, 1.1, 2.1, dark, true);
  opening(0.6, 4.4, 0.8, 1.7, teal, false);
  for (const [a, y] of [[-0.8, 7.4], [2.3, 6.2], [3.5, 8.3], [-2.4, 5.4], [1.4, 9.2], [-1.6, 9.0], [3.14, 1.6]]) opening(a, y, 0.5, 0.75, dark, true);
  // tail pole down the back
  const top = new THREE.Vector3(0, HT + 0.4, -R1 - 0.4), bot = new THREE.Vector3(0, 0.4, -6.0);
  const tl = top.distanceTo(bot), ta = Math.atan2(top.z - bot.z, top.y - bot.y);
  box(body, 0.32, tl, 0.32, timber, 0, (top.y + bot.y) / 2, (top.z + bot.z) / 2, ta, 0, 0);
  box(body, 0.8, 0.8, 0.8, stone, 0, 0.4, -6.0);
  // windshaft + sails
  const hubY = HT + 1.0, hubZ = R1 + 0.95;
  const shaft = new THREE.CylinderGeometry(0.3, 0.36, 1.8, 10); shaft.rotateX(Math.PI / 2); put(body, shaft, dark, 0, hubY, hubZ - 0.8);
  const sails = new THREE.Group(); sails.position.set(0, hubY, hubZ); g.add(sails);
  const hub = new THREE.LatheGeometry(V([[0, -0.3], [0.55, -0.3], [0.55, 0.15], [0.3, 0.45], [0, 0.55]]), 10); hub.rotateX(Math.PI / 2); put(sails, hub, dark);
  const L = 8.0, IN = 1.3, WID = 1.8, NB = 9, BAR = 0.13;
  const grid = new THREE.Shape([new THREE.Vector2(-0.14, 0), new THREE.Vector2(0.14, 0), new THREE.Vector2(0.14, IN), new THREE.Vector2(WID, IN), new THREE.Vector2(WID, L), new THREE.Vector2(-0.14, L)]);
  const cellH = (L - IN - BAR) / NB - BAR, cw = (WID - 0.14 - 3 * BAR) / 2;
  for (let b = 0; b < NB; b++) for (let c = 0; c < 2; c++) {
    const x0 = 0.14 + BAR + c * (cw + BAR), y0 = IN + BAR + b * (cellH + BAR), h = new THREE.Path();
    h.moveTo(x0, y0); h.lineTo(x0, y0 + cellH); h.lineTo(x0 + cw, y0 + cellH); h.lineTo(x0 + cw, y0); h.lineTo(x0, y0); grid.holes.push(h);
  }
  const lattice = new THREE.ExtrudeGeometry(grid, { depth: 0.16, bevelEnabled: false }); lattice.translate(0, 0, -0.08);
  const triS = new THREE.Shape([new THREE.Vector2(0.15, IN + 0.2), new THREE.Vector2(WID - 0.05, IN + 0.2), new THREE.Vector2(WID - 0.05, L - 0.2)]);
  const tri = new THREE.ShapeGeometry(triS);
  const triS2 = new THREE.Shape([new THREE.Vector2(0.15, IN + 0.2), new THREE.Vector2(WID - 0.05, L - 0.2), new THREE.Vector2(0.15, L - 0.2)]);
  const tri2 = new THREE.ShapeGeometry(triS2);
  for (let k = 0; k < 4; k++) {
    const arm = new THREE.Group(); arm.rotation.z = (k * Math.PI) / 2 + 0.4; sails.add(arm);
    put(arm, lattice, timber);
    box(arm, 0.26, L + 0.2, 0.28, timber, 0, L / 2, -0.12);    // stock behind the grid
    put(arm, tri, cloth, 0, 0, 0.14);
    put(arm, tri2, cloth, 0, 0, 0.32, 0, 0, 0).rotation.y = 0.12; // the second panel billows forward
  }
  g.userData.joints = { sails };
