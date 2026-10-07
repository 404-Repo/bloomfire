// profiles: one 4-segment lathe for the whole stepped stone/plaster shaft, extruded arched panels for the belfry, stepped lathe roof
  const lathe = (pts, m, seg = 4) => {
    const geo = new THREE.LatheGeometry(pts.map(([h, y]) => new THREE.Vector2(h * Math.SQRT2, y)), seg).toNonIndexed();
    geo.rotateY(PI / 4); geo.computeVertexNormals();
    return add(geo, m);
  };
  lathe([[0, 0], [2.42, 0], [2.42, 0.4], [2.25, 0.5], [2.25, 4.7], [2.38, 4.8], [2.38, 5.1], [2.15, 5.15], [2.15, 8.85], [2.3, 8.95], [2.3, 9.25], [0, 9.25]], P.stone);
  lathe([[0, 9.2], [2.1, 9.2], [2.1, 12.75], [0, 12.75]], P.plaster);
  lathe([[0, 12.75], [2.32, 12.75], [2.32, 13.1], [2.12, 13.15], [2.12, 13.3], [0, 13.3]], P.stone);
  // stone block banding drawn as proud strips on the lower shaft
  const sides = ['front', 'back', 'right', 'left'];
  for (const s of sides) {
    for (let r = 0; r < 7; r++) {
      const f = face(s, r < 4 ? 2.25 : 2.15), y = r < 4 ? 0.9 + r * 1.05 : 5.7 + (r - 4) * 1.05;
      B(r < 4 ? 4.5 : 4.3, 0.07, 0.05, P.stone, 0, y, 0.0, f);
    }
    const f = face(s, 2.1);
    const ringPts = [[0.0, 0.0], [0.82, 0.0], [0.82, 0.05], [0.9, 0.05], [0.9, 0.2], [1.12, 0.2], [1.12, 0.0], [1.2, -0.05]].map(([r, y]) => new THREE.Vector2(r, y));
    const rg = new THREE.LatheGeometry(ringPts, 20); rg.rotateX(PI / 2);
    add(rg, P.stone, 0, 11.0, 0.0, f);
    add(new THREE.CylinderGeometry(0.84, 0.84, 0.1, 20).rotateX(PI / 2), P.plaster, 0, 11.0, 0.05, f);
    archWin(face(s, 2.15), 0, 6.2, 0.34, 1.1, { dp: 0.16 });
  }
  door(face('front', 2.25), 0, 1.2, 2.5, { arch: true, leaf: P.teal });
  // belfry: four extruded panels, each a wall with an arched hole
  const pw = 4.25, ph = 2.75;
  const ps = new THREE.Shape(); ps.moveTo(-pw / 2, 0); ps.lineTo(pw / 2, 0); ps.lineTo(pw / 2, ph); ps.lineTo(-pw / 2, ph); ps.lineTo(-pw / 2, 0);
  const hr = 0.95, hs = 1.0, hole = new THREE.Path();
  hole.moveTo(-hr, 0.0); hole.lineTo(hr, 0.0); hole.lineTo(hr, hs); hole.absarc(0, hs, hr, 0, PI, false); hole.lineTo(-hr, 0.0);
  ps.holes.push(hole);
  const pg = new THREE.ExtrudeGeometry(ps, { depth: 0.45, bevelEnabled: false, curveSegments: 10 });
  for (const s of sides) {
    const f = face(s, 2.12); add(pg, P.plaster, 0, 13.3, -0.45, f);
    halfRing(hr + 0.08, 0.1, P.stone, 0, 13.3 + hs, 0.02, f, 10);
  }
  lathe([[0, 16.05], [2.3, 16.05], [2.4, 16.2], [2.4, 16.38], [0, 16.38]], P.stone);
  const roof = [[0, 16.3], [2.62, 16.3], [2.65, 16.42]], n = 6, rise = 1.5;
  for (let k = 0; k < n; k++) { const f0 = k / n, f1 = (k + 1) / n; roof.push([2.65 * (1 - f0), 16.42 + rise * f0 + 0.1], [2.65 * (1 - f1) + 0.06, 16.42 + rise * f1]); }
  roof.push([0.12, 17.97], [0, 18.1]);
  lathe(roof, P.tile);
