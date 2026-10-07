// different breakdown: rusticated shaft built course by course, clock faces in proud square frames, paired arches per face, bracketed eaves
  const sides = ['front', 'back', 'right', 'left'];
  B(4.8, 0.45, 4.8, P.stone, 0, 0.225, 0);
  B(4.2, 8.6, 4.2, P.stone, 0, 0.45 + 4.3, 0);
  // rusticated courses: each a slightly proud ring of blocks, alternating joints
  const lens = [1.05, 1.45, 0.9, 1.25, 1.35, 0.95];
  for (let r = 0; r < 14; r++) {
    const y = 0.45 + r * 0.6 + 0.3, w = r < 7 ? 4.4 : 4.3;
    for (const s of sides) {
      const f = face(s, 2.1);
      let u = -w / 2 + (r % 2 ? 0.45 : 0), k = r + s.length;
      if (r % 2) B(0.45 - 0.05, 0.52, 0.2 + (w - 4.2) / 2, P.stone, -w / 2 + 0.225, y, 0.0, f);
      while (u < w / 2 - 0.05) {
        const bw = Math.min(lens[k++ % lens.length], w / 2 - u);
        B(bw - 0.06, 0.52, 0.2 + (w - 4.2) / 2, P.stone, u + bw / 2, y, 0.0, f);
        u += bw;
      }
    }
  }
  B(4.6, 0.3, 4.6, P.stone, 0, 9.2, 0);
  B(4.2, 3.6, 4.2, P.plaster, 0, 9.35 + 1.8, 0);
  for (const s of sides) {
    const f = face(s, 2.1);
    B(2.5, 0.16, 0.14, P.stone, 0, 9.85, 0.07, f); B(2.5, 0.16, 0.14, P.stone, 0, 12.35, 0.07, f);
    B(0.16, 2.66, 0.14, P.stone, -1.17, 11.1, 0.07, f); B(0.16, 2.66, 0.14, P.stone, 1.17, 11.1, 0.07, f);
    add(new THREE.CylinderGeometry(0.92, 0.92, 0.06, 20).rotateX(PI / 2), P.plaster, 0, 11.1, 0.06, f);
    add(new THREE.TorusGeometry(0.98, 0.12, 5, 20), P.stone, 0, 11.1, 0.1, f);
    archWin(face(s, 2.2), 0, 6.0, 0.3, 1.2, { dp: 0.16 });
  }
  door(face('front', 2.3), 0, 1.2, 2.6, { arch: true, leaf: P.teal });
  B(4.6, 0.3, 4.6, P.stone, 0, 13.1, 0);
  // belfry: corner piers + a central column per face, two small round arches each
  B(4.0, 0.15, 4.0, P.stone, 0, 13.3, 0);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) B(0.75, 2.4, 0.75, P.plaster, sx * 1.725, 13.25 + 1.2, sz * 1.725);
  for (const s of sides) {
    const f = face(s, 2.1);
    add(new THREE.CylinderGeometry(0.16, 0.2, 1.7, 8), P.stone, 0, 13.25 + 0.85, -0.25, f);
    B(0.42, 0.14, 0.42, P.stone, 0, 15.0, -0.25, f);
    const r = 0.7;
    const sp = new THREE.Shape();
    sp.moveTo(-2.1, 0); sp.lineTo(-1.35 + 0.0, 0); sp.absarc(-0.7, 0, r - 0.05, PI, 0, true); sp.lineTo(-0.05, 0);
    sp.lineTo(0.05, 0); sp.absarc(0.7, 0, r - 0.05, PI, 0, true); sp.lineTo(2.1, 0); sp.lineTo(2.1, 0.95); sp.lineTo(-2.1, 0.95); sp.lineTo(-2.1, 0);
    const sg = new THREE.ExtrudeGeometry(sp, { depth: 0.5, bevelEnabled: false, curveSegments: 8 });
    add(sg, P.plaster, 0, 15.05, -0.5, f);
    for (const u of [-0.7, 0.7]) halfRing(0.68, 0.07, P.stone, u, 15.05, 0.02, f, 8);
  }
  B(4.65, 0.28, 4.65, P.stone, 0, 16.14, 0);
  // eave brackets
  for (const s of sides) { const f = face(s, 2.32); for (let i = -3; i <= 3; i++) B(0.16, 0.2, 0.4, P.dark, i * 0.62, 16.35, 0.15, f); }
  hipRoof(5.4, 1.5, 16.45, { courses: 4 });
