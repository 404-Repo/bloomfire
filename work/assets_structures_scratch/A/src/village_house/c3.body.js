// different breakdown, as the reference: main block + lean-to on +X + external stair on -X, ridge chimney
  const W = 5.8, D = 5.6, Hw = 5.4, tanA = 0.47, ov = 0.45;
  const ridgeY = Hw + (D / 2) * tanA + 0.22 / Math.cos(Math.atan(tanA));
  B(W + 0.24, 0.45, D + 0.24, P.stone, 0, 0.225, 0);
  B(W, Hw, D, P.plaster, 0, Hw / 2, 0);
  prism(D, (D / 2) * tanA, W, P.plaster, 0, Hw, 0, PI / 2);
  B(W + 0.18, 0.24, D + 0.18, P.plaster, 0, 2.95, 0);
  gableRoof(W + 2 * ov, D / 2 + ov, tanA, ridgeY, { tiles: true });
  const fr = face('front', D / 2), bk = face('back', D / 2), rt = face('right', W / 2), lf = face('left', W / 2);
  win(fr, -1.7, 1.6); door(fr, 0.9); win(fr, -1.7, 4.3); win(fr, 1.4, 4.3);
  win(bk, -1.5, 1.6); win(bk, 1.5, 1.6); win(bk, -1.5, 4.3); win(bk, 1.5, 4.3);
  win(rt, 0, 4.3); win(rt, 0, 6.1, 0.45, 0.5, { shutters: false });
  win(lf, 0, 6.1, 0.45, 0.5, { shutters: false });
  // lean-to on +X
  const lw = 1.9, ld = 4.2, lz = -0.3, lh = 2.9;
  B(lw, lh, ld, P.plaster, W / 2 + lw / 2, lh / 2, lz);
  B(lw + 0.12, 0.45, ld + 0.24, P.stone, W / 2 + lw / 2, 0.225, lz);
  const ang = Math.atan(0.75 / (lw + 0.4));
  const lt = grp(W / 2, 3.75, lz); lt.rotation.z = -ang;
  const Sx = (lw + 0.45) / Math.cos(ang);
  B(Sx, 0.2, ld + 0.6, P.tile, Sx / 2, -0.1, 0, lt);
  const tg = new THREE.CylinderGeometry(0.12, 0.12, Sx, 6); tg.rotateZ(PI / 2);
  for (let i = 0; i < 13; i++) add(tg, P.tile, Sx / 2, 0.0, -(ld + 0.6) / 2 + (i + 0.5) * (ld + 0.6) / 13, lt);
  // lean-to fill under the slope
  const fill = new THREE.Shape(); fill.moveTo(0, 0); fill.lineTo(lw, 0); fill.lineTo(0, 3.75 - lh - 0.25 + 0.2); fill.lineTo(0, 0);
  const fg = new THREE.ExtrudeGeometry(fill, { depth: ld, bevelEnabled: false }); fg.translate(0, 0, -ld / 2);
  add(fg, P.plaster, W / 2, lh, lz);
  win(grp(W / 2 + lw / 2, 0, lz + ld / 2), 0, 1.5, 0.6, 0.8);
  win(grp(W / 2 + lw, 0, lz, PI / 2), 0, 1.5, 0.6, 0.8);
  door(grp(W / 2 + lw / 2, 0, lz - ld / 2, PI), 0, 0.9, 2.0);
  // external stair on -X up to a first-floor door
  const sx = -W / 2 - 0.55;
  for (let i = 0; i < 9; i++) { const h = (i + 1) * 0.32; B(1.0, h, 0.34, P.stone, sx, h / 2, 2.0 - i * 0.34); }
  B(1.0, 2.9, 1.3, P.stone, sx, 1.45, -1.65);
  B(0.18, 0.5, 1.3, P.plaster, sx - 0.42, 3.15, -1.65);
  door(grp(-W / 2, 2.9, -1.65, -PI / 2), 0, 0.9, 2.0, { leaf: P.teal });
  // ridge chimney on the left gable
  B(0.85, 1.5, 0.75, P.plaster, -W / 2 + 0.6, ridgeY - 0.2, 0);
  B(1.05, 0.12, 0.95, P.tile, -W / 2 + 0.6, ridgeY + 0.6, 0);
  prism(1.1, 0.3, 1.1, P.tile, -W / 2 + 0.6, ridgeY + 0.66, 0, PI / 2);
