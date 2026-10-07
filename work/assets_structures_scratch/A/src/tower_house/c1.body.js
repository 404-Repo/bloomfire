// primitives: coursed stone base, plaster shaft, cornice, cone hip roof with hip ridges
  const S = 4.2, Hb = 1.9, Hw = 9.3;
  B(4.5, Hb, 4.5, P.stone, 0, Hb / 2, 0);
  // masonry blocks proud of the base on every face
  const widths = [0.9, 1.25, 0.8, 1.1, 1.3, 0.75, 1.0, 1.2];
  for (const side of ['front', 'back', 'right', 'left']) {
    const f = face(side, 2.25);
    for (let r = 0; r < 4; r++) {
      let u = -2.25 + (r % 2 ? 0.35 : 0), k = r * 3 + side.length;
      while (u < 2.2) {
        const w = Math.min(widths[k++ % widths.length], 2.25 - u);
        if (w > 0.25) B(w - 0.06, 0.42, 0.07, P.stone, u + w / 2, r * 0.47 + 0.24, 0.035, f);
        u += w;
      }
    }
  }
  B(4.62, 0.16, 4.62, P.stone, 0, Hb + 0.08, 0);
  B(S, Hw - Hb, S, P.plaster, 0, Hb + (Hw - Hb) / 2, 0);
  B(4.5, 0.28, 4.5, P.plaster, 0, Hw + 0.04, 0);
  hipRoof(5.3, 1.5, Hw + 0.18);
  const fr = face('front', S / 2), bk = face('back', S / 2), rt = face('right', S / 2), lf = face('left', S / 2);
  door(face('front', 2.25), 0, 1.0, 1.85, { arch: true });
  win(fr, -0.9, 4.0, 0.55, 0.8); win(fr, 0.9, 7.3, 0.6, 0.9);
  win(bk, 0.6, 3.6, 0.35, 0.7, { shutters: false }); win(bk, -0.7, 7.3, 0.6, 0.9);
  win(rt, 0.0, 5.0, 0.55, 0.8); win(rt, 0.0, 7.6, 0.55, 0.8, { shutters: false });
  win(lf, -0.6, 3.6, 0.35, 0.7, { shutters: false }); win(lf, 0.5, 6.4, 0.55, 0.8);
