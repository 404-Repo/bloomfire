// different reading: stone ground storey with quoins, plaster shaft, open arched loggia at the top, hip roof
  const S = 4.2;
  B(S + 0.1, 3.0, S + 0.1, P.stone, 0, 1.5, 0);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) quoins(sx * 2.2, sz * 2.2, 0, 3.0, sx, sz, 0.5);
  B(S + 0.3, 0.22, S + 0.3, P.stone, 0, 3.05, 0);
  B(S, 8.1 - 3.0, S, P.plaster, 0, 3.0 + (8.1 - 3.0) / 2, 0);
  B(S + 0.3, 0.2, S + 0.3, P.stone, 0, 8.1, 0);
  // loggia: dark core so the arches read as openings, arched-hole panel on every face
  B(2.4, 2.0, 2.4, P.dark, 0, 9.1, 0);
  const ph = 2.05, pw = S;
  const panel = new THREE.Shape();
  panel.moveTo(-pw / 2, 0); panel.lineTo(pw / 2, 0); panel.lineTo(pw / 2, ph); panel.lineTo(-pw / 2, ph); panel.lineTo(-pw / 2, 0);
  const hole = new THREE.Path(); const r = 1.05, sp = 0.65;
  hole.moveTo(-r, 0); hole.lineTo(-r, sp); hole.absarc(0, sp, r, PI, 0, true); hole.lineTo(r, 0); hole.lineTo(-r, 0);
  panel.holes.push(hole);
  const pg = new THREE.ExtrudeGeometry(panel, { depth: 0.32, bevelEnabled: false, curveSegments: 10 });
  for (const side of ['front', 'back', 'right', 'left']) {
    const f = face(side, S / 2);
    const o = add(pg, P.plaster, 0, 8.2, -0.32, f);
    const ring = halfRing(r + 0.08, 0.1, P.stone, 0, 8.2 + sp, 0.02, f);
    B(0.12, sp, 0.12, P.stone, -r - 0.08, 8.2 + sp / 2, 0.02, f); B(0.12, sp, 0.12, P.stone, r + 0.08, 8.2 + sp / 2, 0.02, f);
    B(2.4, 0.5, 0.12, P.plaster, 0, 8.45, -0.15, f);  // parapet inside the arch
  }
  B(S + 0.3, 0.24, S + 0.3, P.plaster, 0, 10.3, 0);
  hipRoof(5.2, 1.0, 10.42, { courses: 4 });
  const fr = face('front', S / 2), bk = face('back', S / 2), rt = face('right', S / 2), lf = face('left', S / 2);
  door(face('front', S / 2 + 0.05), 0, 1.0, 2.2, { arch: true, leaf: P.teal });
  win(fr, 0, 4.6, 0.6, 0.9); win(fr, 0, 6.9, 0.6, 0.9);
  win(face('back', S / 2 + 0.05), 0, 1.6, 0.4, 0.6, { shutters: false }); win(bk, -0.5, 4.6, 0.6, 0.9); win(bk, 0.5, 6.9, 0.6, 0.9);
  win(face('right', S / 2 + 0.05), 0.5, 1.8, 0.4, 0.6, { shutters: false }); win(face('left', S / 2 + 0.05), -0.5, 1.8, 0.4, 0.6, { shutters: false }); win(rt, 0, 5.6, 0.6, 0.9);
  win(lf, 0, 4.6, 0.6, 0.9); win(lf, -0.4, 7.0, 0.35, 0.6, { shutters: false });
