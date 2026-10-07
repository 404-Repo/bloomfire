// profiles: extruded pentagon nave, stepped-course roof profiles, lathed drum+dome and apse, extruded belfry with arched hole
  const W = 7.6, L = 11, Hw = 5.5, tanA = 0.5, ov = 0.4, th = 0.24;
  const rise = (W / 2) * tanA;
  const sh = new THREE.Shape();
  sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, Hw); sh.lineTo(0, Hw + rise); sh.lineTo(-W / 2, Hw); sh.lineTo(-W / 2, 0);
  const shell = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false }); shell.translate(0, 0, -L / 2);
  add(shell, P.plaster);
  B(W + 0.3, 0.45, L + 0.3, P.stone, 0, 0.225, 0);
  // stone pilasters at the corners and mid-sides
  for (const sx of [-1, 1]) for (const z of [-L / 2, 0, L / 2]) B(0.5, Hw - 0.4, 0.5, P.stone, sx * (W / 2 + 0.05), 0.4 + (Hw - 0.4) / 2, z - Math.sign(z) * 0.2);
  const ridgeY = Hw + rise + th / Math.cos(Math.atan(tanA)), d = W / 2 + ov, Lr = L + 2 * ov, n = 8;
  for (const s of [1, -1]) {
    const pr = new THREE.Shape(); const yl = (x) => ridgeY - x * tanA;
    pr.moveTo(0, yl(0));
    for (let k = 0; k < n; k++) { const x1 = d * (k + 1) / n; pr.lineTo(s * x1, yl(x1)); pr.lineTo(s * x1, yl(x1) - 0.1); }
    pr.lineTo(s * d, yl(d) - 0.1 - th); pr.lineTo(0, ridgeY - th - 0.1); pr.lineTo(0, yl(0));
    const geo = new THREE.ExtrudeGeometry(pr, { depth: Lr, bevelEnabled: false }); geo.translate(0, 0, -Lr / 2);
    add(geo, P.tile);
  }
  const cap = new THREE.CylinderGeometry(0.18, 0.18, Lr, 7); cap.rotateX(PI / 2); add(cap, P.tile, 0, ridgeY, 0);
  // drum + dome as one lathe profile, sitting on a square plaster base
  B(4.2, 3.0, 4.2, P.plaster, 0, 6.8, -0.6);
  B(4.5, 0.22, 4.5, P.stone, 0, 8.3, -0.6);
  const drum = [[0, 8.3], [2.0, 8.3], [2.0, 10.2], [2.3, 10.3], [2.3, 10.5], [0, 10.5]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(drum, 14), P.plaster, 0, 0, -0.6);
  const dome = []; const R = 2.2;
  for (let k = 0; k <= 6; k++) { const a = k / 6 * PI / 2; dome.push(new THREE.Vector2(R * Math.cos(a) + (k % 2 ? 0 : 0.06), 10.5 + R * Math.sin(a))); }
  dome.push(new THREE.Vector2(0.25, 12.75), new THREE.Vector2(0.3, 12.95), new THREE.Vector2(0, 13.1));
  add(new THREE.LatheGeometry(dome, 14), P.tile, 0, 0, -0.6);
  for (let i = 0; i < 4; i++) { const a = i * PI / 2 + PI / 4; archWin(grp(2.0 * Math.sin(a), 0, -0.6 + 2.0 * Math.cos(a), a), 0, 8.7, 0.36, 1.0, { dp: 0.15 }); }
  // apse: half lathe, half dome
  const ap = [[0, 0], [2.7, 0], [2.6, 0.4], [2.6, 4.3], [2.9, 4.4], [2.6, 5.3], [1.6, 6.0], [0, 6.2]].map(([r, y]) => new THREE.Vector2(r, y));
  const apg = new THREE.LatheGeometry(ap, 12, PI / 2, PI);
  add(apg, P.plaster, 0, 0, -L / 2 + 0.1);
  const apr = [[2.9, 4.4], [2.75, 5.0], [2.2, 5.7], [1.2, 6.15], [0, 6.3]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(apr, 12, PI / 2, PI), P.tile, 0, 0, -L / 2 + 0.1);
  archWin(grp(0, 0, -L / 2 - 2.5, PI), 0, 1.8, 0.5, 1.4);
  // belfry: one extruded slab, arched hole, round head
  const bw = 2.6, bz = L / 2 - 0.35;
  const bs = new THREE.Shape();
  bs.moveTo(-bw / 2, 0); bs.lineTo(bw / 2, 0); bs.lineTo(bw / 2, 5.7); bs.absarc(0, 5.7, bw / 2, 0, PI, false); bs.lineTo(-bw / 2, 0);
  const hole = new THREE.Path(); hole.moveTo(-0.62, 3.4); hole.lineTo(0.62, 3.4); hole.lineTo(0.62, 5.6); hole.absarc(0, 5.6, 0.62, 0, PI, false); hole.lineTo(-0.62, 3.4);
  bs.holes.push(hole);
  const bg = new THREE.ExtrudeGeometry(bs, { depth: 0.75, bevelEnabled: false, curveSegments: 10 }); bg.translate(0, 0, -0.375);
  add(bg, P.plaster, 0, 6.4, bz);
  B(bw + 0.25, 0.2, 0.95, P.stone, 0, 6.4 + 3.3, bz);
  const fr = face('front', L / 2), bk = face('back', L / 2), rt = face('right', W / 2), lf = face('left', W / 2);
  door(fr, 0, 1.4, 2.8, { arch: true, leaf: P.teal, t: 0.28 });
  archWin(fr, 0, 4.0, 0.5, 0.9);
  for (const z of [-2.7, 2.7]) { archWin(rt, -z, 2.6, 0.55, 1.5); archWin(lf, z, 2.6, 0.55, 1.5); }
  for (const u of [-2.3, 2.3]) archWin(bk, u, 2.6, 0.5, 1.3);
