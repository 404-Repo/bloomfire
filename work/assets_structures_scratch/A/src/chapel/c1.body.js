// primitives: box nave + attic prism + barrel-tile roof, square base, cylinder drum, hemisphere dome, pier-and-ring belfry, half-cylinder apse
  const W = 7.6, L = 11, Hw = 5.5, tanA = 0.5, ov = 0.4;
  const rise = (W / 2) * tanA, ridgeY = Hw + rise + 0.22 / Math.cos(Math.atan(tanA));
  B(W + 0.3, 0.4, L + 0.3, P.stone, 0, 0.2, 0);
  B(W, Hw, L, P.plaster, 0, Hw / 2, 0);
  prism(W, rise, L, P.plaster, 0, Hw, 0, 0);
  gableRoof(L + 2 * ov, W / 2 + ov, tanA, ridgeY, { tiles: true, ry: PI / 2 });
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) quoins(sx * W / 2, sz * L / 2, 0.4, Hw, sx, sz, 0.5);
  // apse at the back
  const ar = 2.6;
  const ag = new THREE.CylinderGeometry(ar, ar, 4.4, 12, 1, false, PI / 2, PI);
  add(ag, P.plaster, 0, 2.2, -L / 2);
  add(new THREE.SphereGeometry(ar + 0.3, 12, 4, PI, PI, 0, PI / 2), P.tile, 0, 4.4, -L / 2);
  B(ar * 2 + 0.6, 0.2, 0.3, P.tile, 0, 4.45, -L / 2 + 0.05);
  archWin(grp(0, 0, -L / 2 - ar, PI), 0, 1.8, 0.5, 1.4);
  // square base + drum + dome over the middle
  B(4.2, 3.2, 4.2, P.plaster, 0, 6.7, -0.5);
  B(4.5, 0.2, 4.5, P.stone, 0, 8.3, -0.5);
  add(new THREE.CylinderGeometry(1.95, 1.95, 2.0, 14), P.plaster, 0, 9.4, -0.5);
  add(new THREE.CylinderGeometry(2.25, 2.25, 0.22, 14), P.stone, 0, 10.48, -0.5);
  add(new THREE.SphereGeometry(2.2, 14, 6, 0, 2 * PI, 0, PI / 2), P.tile, 0, 10.55, -0.5);
  for (let k = 1; k <= 3; k++) {
    const a = k * PI / 8, tr = new THREE.TorusGeometry(2.2 * Math.sin(PI / 2 - a) + 0.02, 0.06, 4, 16); tr.rotateX(PI / 2);
    add(tr, P.tile, 0, 10.55 + 2.2 * Math.sin(a), -0.5);
  }
  add(new THREE.SphereGeometry(0.28, 8, 6), P.stone, 0, 12.85, -0.5);
  for (let i = 0; i < 4; i++) { const a = i * PI / 2 + PI / 4; archWin(grp(1.9 * Math.sin(a), 0, -0.5 + 1.9 * Math.cos(a), a), 0, 8.75, 0.36, 1.0, { dp: 0.15 }); }
  // belfry on the front gable: two piers, round arch, rounded top. Empty.
  const bz = L / 2 - 0.35, bw = 2.4;
  B(bw, 3.4, 0.7, P.plaster, 0, 8.15, bz);
  for (const sx of [-1, 1]) B(0.6, 2.5, 0.7, P.plaster, sx * (bw / 2 - 0.3), 11.05, bz);
  const archR = 0.6;
  B(bw + 0.2, 0.2, 0.9, P.stone, 0, 9.85, bz);
  // the head: fill around the arch, rounded top
  const head = new THREE.Shape();
  head.moveTo(-bw / 2, 0); head.lineTo(-archR, 0); head.absarc(0, 0, archR, PI, 0, true); head.lineTo(bw / 2, 0);
  head.absarc(0, 0, bw / 2, 0, PI, false);
  const hg = new THREE.ExtrudeGeometry(head, { depth: 0.7, bevelEnabled: false, curveSegments: 10 }); hg.translate(0, 0, -0.35);
  add(hg, P.plaster, 0, 12.3, bz);
  const fr = face('front', L / 2), bk = face('back', L / 2), rt = face('right', W / 2), lf = face('left', W / 2);
  door(fr, 0, 1.4, 2.8, { arch: true, leaf: P.teal, t: 0.28 });
  archWin(fr, 0, 4.0, 0.5, 0.9);
  for (const z of [-3.2, 0.2, 3.4]) { archWin(rt, -z, 2.6, 0.55, 1.5); archWin(lf, z, 2.6, 0.55, 1.5); }
  for (const u of [-2.4, 2.4]) archWin(bk, u, 2.6, 0.5, 1.3);
