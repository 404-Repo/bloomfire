// primitives: stacked stone/plaster boxes with bands and quoins, torus clock rings, pier-and-arch open belfry, cone hip roof
  const corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  const sides = ['front', 'back', 'right', 'left'];
  B(4.8, 0.4, 4.8, P.stone, 0, 0.2, 0);
  B(4.5, 4.4, 4.5, P.stone, 0, 0.4 + 2.2, 0);
  for (const [sx, sz] of corners) quoins(sx * 2.27, sz * 2.27, 0.4, 4.8, sx, sz, 0.55);
  B(4.75, 0.3, 4.75, P.stone, 0, 4.95, 0);
  B(4.3, 3.8, 4.3, P.stone, 0, 5.1 + 1.9, 0);
  for (const [sx, sz] of corners) quoins(sx * 2.17, sz * 2.17, 5.1, 8.9, sx, sz, 0.55);
  B(4.6, 0.3, 4.6, P.stone, 0, 9.05, 0);
  B(4.2, 3.6, 4.2, P.plaster, 0, 9.2 + 1.8, 0);
  B(4.65, 0.32, 4.65, P.stone, 0, 12.96, 0);
  for (const s of sides) {
    const f = face(s, 2.1);
    add(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 20).rotateX(PI / 2), P.plaster, 0, 11.0, 0.04, f);
    add(new THREE.TorusGeometry(1.02, 0.11, 5, 22), P.stone, 0, 11.0, 0.08, f);
    archWin(face(s, 2.15), 0, 6.3, 0.34, 1.1, { dp: 0.16 });
  }
  door(face('front', 2.25), 0, 1.2, 2.5, { arch: true, leaf: P.teal });
  // open belfry: four corner piers, a round arch on every face, nothing inside
  B(4.2, 0.2, 4.2, P.stone, 0, 13.22, 0);
  for (const [sx, sz] of corners) B(0.85, 2.8, 0.85, P.plaster, sx * 1.675, 13.12 + 1.4, sz * 1.675);
  for (const s of sides) {
    const f = face(s, 1.7);
    const span = 4.2 - 1.7, r = span / 2;
    halfRing(r + 0.04, 0.12, P.stone, 0, 15.92 - r - 0.35, 0.36, f, 10);
    const sp = new THREE.Shape();
    sp.moveTo(-2.1, 0); sp.lineTo(-r, 0); sp.absarc(0, 0, r, PI, 0, true); sp.lineTo(2.1, 0); sp.lineTo(2.1, r + 0.35); sp.lineTo(-2.1, r + 0.35); sp.lineTo(-2.1, 0);
    const sg = new THREE.ExtrudeGeometry(sp, { depth: 0.8, bevelEnabled: false, curveSegments: 10 });
    add(sg, P.plaster, 0, 15.92 - r - 0.35, -0.4, f);
  }
  B(4.7, 0.3, 4.7, P.stone, 0, 16.07, 0);
  hipRoof(5.2, 1.85, 16.2);
