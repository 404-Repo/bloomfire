// different reading: cross plan (nave + transept arms), dome on a drum at the crossing, bell-cote over the front gable
  const Wn = 6.8, Ln = 12.4, Hw = 5.2, tanA = 0.5, ov = 0.4;
  const Wt = 10.0, Lt = 4.6;  // transept, across X
  const rn = (Wn / 2) * tanA, rt = (Lt / 2) * tanA;
  const rY = (h, r) => h + r + 0.22 / Math.cos(Math.atan(tanA));
  B(Wn + 0.3, 0.4, Ln + 0.3, P.stone, 0, 0.2, 0);
  B(Wt + 0.3, 0.4, Lt + 0.3, P.stone, 0, 0.2, -1.0);
  B(Wn, Hw, Ln, P.plaster, 0, Hw / 2, 0);
  prism(Wn, rn, Ln, P.plaster, 0, Hw, 0, 0);
  gableRoof(Ln + 2 * ov, Wn / 2 + ov, tanA, rY(Hw, rn), { tiles: true, ry: PI / 2 });
  const Ht = 4.4;
  B(Wt, Ht, Lt, P.plaster, 0, Ht / 2, -1.0);
  prism(Lt, rt, Wt, P.plaster, 0, Ht, -1.0, PI / 2);
  gableRoof(Wt + 2 * ov, Lt / 2 + ov, tanA, rY(Ht, rt), { tiles: true, z: -1.0 });
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    quoins(sx * Wn / 2, sz * Ln / 2, 0.4, Hw, sx, sz, 0.5);
    quoins(sx * Wt / 2, -1.0 + sz * Lt / 2, 0.4, Ht, sx, sz, 0.5);
  }
  // crossing: octagonal drum + dome
  add(new THREE.CylinderGeometry(2.3, 2.3, 2.6, 8), P.plaster, 0, rY(Hw, rn) + 0.6, -1.0);
  add(new THREE.CylinderGeometry(2.55, 2.55, 0.24, 8), P.stone, 0, rY(Hw, rn) + 1.92, -1.0);
  add(new THREE.SphereGeometry(2.3, 8, 5, 0, 2 * PI, 0, PI / 2), P.tile, 0, rY(Hw, rn) + 2.0, -1.0);
  add(new THREE.CylinderGeometry(0.35, 0.45, 0.5, 8), P.plaster, 0, rY(Hw, rn) + 4.5, -1.0);
  add(new THREE.ConeGeometry(0.55, 0.4, 8), P.tile, 0, rY(Hw, rn) + 4.95, -1.0);
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) * PI / 4; archWin(grp(2.2 * Math.sin(a), 0, -1.0 + 2.2 * Math.cos(a), a), 0, rY(Hw, rn) - 0.3, 0.34, 1.0, { dp: 0.14 }); }
  // bell-cote: twin piers, flat lintel, low pitched cap; open, nothing hung in it
  const bz = Ln / 2 - 0.3, by = rY(Hw, rn) - 0.6;
  B(2.4, 1.4, 0.6, P.plaster, 0, by + 0.7, bz);
  for (const sx of [-1, 1]) B(0.55, 2.6, 0.6, P.plaster, sx * 0.925, by + 1.4 + 1.3, bz);
  const ring = halfRing(0.65 + 0.1, 0.12, P.stone, 0, by + 1.4 + 1.9, bz + 0.3, g, 10);
  const head = new THREE.Shape();
  head.moveTo(-1.2, 0); head.lineTo(-0.65, 0); head.absarc(0, 0, 0.65, PI, 0, true); head.lineTo(1.2, 0); head.lineTo(1.2, 1.0); head.lineTo(-1.2, 1.0); head.lineTo(-1.2, 0);
  const hg = new THREE.ExtrudeGeometry(head, { depth: 0.6, bevelEnabled: false, curveSegments: 8 }); hg.translate(0, 0, -0.3);
  add(hg, P.plaster, 0, by + 1.4 + 1.9, bz);
  prism(2.8, 0.55, 0.9, P.tile, 0, by + 1.4 + 1.9 + 1.0, bz, 0);
  const fr = face('front', Ln / 2), bk = face('back', Ln / 2), r = face('right', Wn / 2), l = face('left', Wn / 2);
  door(fr, 0, 1.4, 2.8, { arch: true, leaf: P.teal, t: 0.28 });
  archWin(fr, 0, 3.8, 0.5, 0.9);
  for (const z of [-5.0, 3.6]) { archWin(r, -z, 2.4, 0.5, 1.4); archWin(l, z, 2.4, 0.5, 1.4); }
  archWin(bk, 0, 2.4, 0.6, 1.6);
  for (const s of ['right', 'left']) { const f = face(s, Wt / 2); archWin(f, s === 'right' ? 1.0 : -1.0, 1.0 + 1.3, 0.8, 1.7); }
  for (const sx of [-1, 1]) { archWin(grp(sx * 3.4, 0, -1.0 + Lt / 2), 0, 2.3, 0.5, 1.3); archWin(grp(sx * 3.4, 0, -1.0 - Lt / 2, PI), 0, 2.3, 0.5, 1.3); }
