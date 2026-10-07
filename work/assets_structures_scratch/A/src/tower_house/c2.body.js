// profiles: three 4-segment lathes (battered stone base, plaster shaft with cornice, stepped tile roof)
  const lathe = (pts, m) => {
    const geo = new THREE.LatheGeometry(pts.map(([h, y]) => new THREE.Vector2(h * Math.SQRT2, y)), 4).toNonIndexed();
    geo.rotateY(PI / 4); geo.computeVertexNormals();
    return add(geo, m);
  };
  lathe([[0, 0], [2.4, 0], [2.3, 1.6], [2.36, 1.75], [2.36, 1.95], [2.1, 2.05], [0, 2.05]], P.stone);
  lathe([[0, 1.9], [2.1, 1.9], [2.1, 9.0], [2.2, 9.1], [2.3, 9.3], [2.3, 9.42], [0, 9.42]], P.plaster);
  const roof = [[0, 9.3], [2.68, 9.3], [2.7, 9.42]];
  const n = 6, rise = 1.55;
  for (let k = 0; k < n; k++) {
    const f0 = k / n, f1 = (k + 1) / n;
    const h0 = 2.7 * (1 - f0), h1 = 2.7 * (1 - f1);
    roof.push([h0, 9.42 + rise * f0 + 0.1], [h1 + 0.06, 9.42 + rise * f1]);
  }
  roof.push([0.12, 9.42 + rise + 0.05], [0.0, 9.42 + rise + 0.25]);
  lathe(roof, P.tile);
  // stone blocks band and quoin hints on the base
  for (const side of ['front', 'back', 'right', 'left']) {
    const f = face(side, 2.36);
    for (let i = -2; i <= 2; i++) B(0.85, 0.16, 0.06, P.stone, i * 0.95 + 0.2, 1.08, -0.05, f);
  }
  const H = 2.1, fr = face('front', H), bk = face('back', H), rt = face('right', H), lf = face('left', H);
  door(face('front', 2.33), 0, 1.0, 1.9, { dp: 0.4 });
  win(fr, 0.0, 4.6, 0.6, 0.9); win(fr, 0.0, 7.4, 0.6, 0.9);
  win(bk, -0.6, 4.0, 0.5, 0.75); win(bk, 0.6, 7.4, 0.6, 0.9);
  win(rt, 0.5, 3.6, 0.35, 0.7, { shutters: false }); win(rt, -0.4, 6.6, 0.6, 0.9);
  win(lf, -0.5, 5.2, 0.6, 0.9); win(lf, 0.4, 7.8, 0.35, 0.7, { shutters: false });
