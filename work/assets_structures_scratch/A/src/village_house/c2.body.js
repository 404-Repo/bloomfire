// profiles: extruded pentagon shell, extruded stepped tile-course roof, balcony, external gable chimney
  const W = 7.6, D = 5.6, Hw = 5.4, tanA = 0.45, ov = 0.45, th = 0.22;
  const rise = (D / 2) * tanA;
  const sh = new THREE.Shape();
  sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(D / 2, Hw); sh.lineTo(0, Hw + rise); sh.lineTo(-D / 2, Hw); sh.lineTo(-D / 2, 0);
  const shell = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false });
  shell.translate(0, 0, -W / 2); shell.rotateY(-PI / 2);
  add(shell, P.plaster);
  B(W + 0.24, 0.5, D + 0.24, P.stone, 0, 0.25, 0);
  // roof: one stepped-course profile per side, extruded along X
  const L = W + 2 * ov, d = D / 2 + ov, n = 7;
  const ridgeY = Hw + rise + th / Math.cos(Math.atan(tanA));
  for (const s of [1, -1]) {
    const pr = new THREE.Shape();
    const yl = (z) => ridgeY - z * tanA;
    pr.moveTo(0, yl(0));
    for (let k = 0; k < n; k++) {
      const z0 = d * k / n, z1 = d * (k + 1) / n;
      pr.lineTo(s * (z1 - 0.02), yl(z1) + 0.0);
      pr.lineTo(s * (z1 - 0.02), yl(z1) - 0.11);
      if (k < n - 1) pr.lineTo(s * z1, yl(z1) - 0.11 + 0.11);
    }
    pr.lineTo(s * d, yl(d) - 0.11 - th);
    pr.lineTo(0, ridgeY - th - 0.11);
    pr.lineTo(0, yl(0));
    const geo = new THREE.ExtrudeGeometry(pr, { depth: L, bevelEnabled: false });
    geo.translate(0, 0, -L / 2); geo.rotateY(-PI / 2);
    add(geo, P.tile);
    // rafter tails under the eave
    for (let x = -W / 2 + 0.3; x <= W / 2 - 0.2; x += 0.62) B(0.14, 0.14, ov + 0.1, P.dark, x, Hw - 0.02, s * (D / 2 + ov / 2));
  }
  const cap = new THREE.CylinderGeometry(0.18, 0.18, L + 0.1, 7); cap.rotateZ(PI / 2); add(cap, P.tile, 0, ridgeY + 0.02, 0);
  // verge boards on the gables
  for (const sx of [-1, 1]) for (const s of [0, PI]) {
    const sg = grp(sx * (L / 2 - 0.05), ridgeY - 0.05, 0, s);
    const sl = new THREE.Group(); sl.rotation.x = Math.atan(tanA); sg.add(sl);
    B(0.1, 0.32, d / Math.cos(Math.atan(tanA)), P.dark, 0, -0.18, d / Math.cos(Math.atan(tanA)) / 2, sl);
  }
  const fr = face('front', D / 2), bk = face('back', D / 2), rt = face('right', W / 2), lf = face('left', W / 2);
  win(fr, -2.6, 1.6); door(fr, 0.0, 1.1, 2.2); win(fr, 2.6, 1.6);
  win(fr, -2.6, 4.3); win(fr, 2.6, 4.3);
  // balcony with a french door above the entrance
  door(grp(0, 3.05, D / 2), 0, 1.0, 2.1, { leaf: P.teal });
  B(2.2, 0.16, 0.9, P.stone, 0, 3.0, D / 2 + 0.45);
  for (let i = 0; i < 3; i++) B(0.18, 0.12, 0.4, P.stone, -0.8 + i * 0.8, 2.86, D / 2 + 0.2);
  B(2.2, 0.06, 0.06, P.iron, 0, 3.95, D / 2 + 0.87);
  for (const sx of [-1, 1]) B(0.06, 0.06, 0.88, P.iron, sx * 1.07, 3.95, D / 2 + 0.44);
  for (let i = 0; i <= 10; i++) B(0.035, 0.9, 0.035, P.iron, -1.07 + i * 0.214, 3.5, D / 2 + 0.87);
  win(bk, -2.4, 1.6); win(bk, 0.6, 1.6, 0.6, 0.8, { shutters: false }); win(bk, 2.6, 1.6);
  win(bk, -2.4, 4.3); win(bk, 0.0, 4.3); win(bk, 2.4, 4.3);
  win(rt, 0.9, 1.6); win(rt, -0.9, 4.3); win(rt, 0, 6.05, 0.45, 0.5, { shutters: false });
  win(lf, 1.4, 1.6); win(lf, 1.4, 4.3);
  // external chimney stack on the left gable
  B(1.3, 6.6, 0.95, P.plaster, -W / 2 - 0.5, 3.3, -0.9);
  B(1.0, 1.4, 0.8, P.plaster, -W / 2 - 0.5, 7.2, -0.9);
  B(1.15, 0.12, 0.95, P.tile, -W / 2 - 0.5, 7.95, -0.9);
  B(1.45, 0.4, 1.1, P.stone, -W / 2 - 0.5, 0.2, -0.9);
