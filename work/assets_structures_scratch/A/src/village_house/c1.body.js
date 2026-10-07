// primitives: box body, attic prism, slab roof with barrel tiles, string course, chimney
  const W = 7.6, D = 5.6, Hw = 5.4, tanA = 0.45, ov = 0.45;
  const ridgeY = Hw + (D / 2) * tanA + 0.22 / Math.cos(Math.atan(tanA));
  B(W + 0.24, 0.45, D + 0.24, P.stone, 0, 0.225, 0);
  B(W, Hw, D, P.plaster, 0, Hw / 2, 0);
  prism(D, (D / 2) * tanA, W, P.plaster, 0, Hw, 0, PI / 2);
  B(W + 0.18, 0.22, D + 0.18, P.plaster, 0, 2.95, 0);           // string course
  gableRoof(W + 2 * ov, D / 2 + ov, tanA, ridgeY, { tiles: true });
  const fr = face('front', D / 2), bk = face('back', D / 2), rt = face('right', W / 2), lf = face('left', W / 2);
  win(fr, -2.5, 1.6); door(fr, 0.4); win(fr, 2.5, 1.6);
  win(fr, -2.5, 4.3); win(fr, 0.0, 4.3); win(fr, 2.5, 4.3);
  win(bk, -2.0, 1.6); win(bk, 2.0, 1.6, 0.6, 0.8, { shutters: false });
  win(bk, -2.5, 4.3); win(bk, 0.0, 4.3); win(bk, 2.5, 4.3);
  for (const f of [rt, lf]) { win(f, -1.0, 1.6); win(f, 1.0, 4.3); win(f, 0, 6.05, 0.45, 0.5, { shutters: false }); }
  // chimney with a little tiled hood
  const cx = 2.4, cz = -0.9;
  B(0.85, 2.0, 0.85, P.plaster, cx, 6.55, cz);
  B(1.05, 0.12, 1.05, P.tile, cx, 7.6, cz);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(0.14, 0.32, 0.14, P.tile, cx + sx * 0.3, 7.82, cz + sz * 0.3);
  prism(1.15, 0.32, 1.1, P.tile, cx, 7.98, cz, PI / 2);
