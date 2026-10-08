// arcade_section c1: profile arm. Front and end walls of the loggia are
// extruded shapes with round-arch holes (limewash spandrels), stone piers and
// extruded arch rings laid over them; solid back wall; limewash upper storey
// with recessed shuttered windows; gabled terracotta roof with eaves.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (c, n, r = 0.9) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.name = n; return m; };
  const LIME = mat(0xeee3cf, 'plaster');
  const STONE = mat(0xc9b48f, 'stone');
  const TILE = mat(0xc0603a, 'tile', 0.8);
  const TEAL = mat(0x3f8a8a, 'timber');
  const DARK = mat(0x4a3324, 'timber');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const L = 12, D = 4, T = 0.6, GF = 5.0, PW = 0.8, SPR = 3.0;
  // wall with n arches spanning length len, extruded thickness T, along local x
  const arcadeWall = (len, n) => {
    const s = new THREE.Shape();
    s.moveTo(-len / 2, 0); s.lineTo(len / 2, 0); s.lineTo(len / 2, GF); s.lineTo(-len / 2, GF); s.lineTo(-len / 2, 0);
    const clear = (len - (n + 1) * PW) / n, r = clear / 2;
    const centres = [];
    for (let i = 0; i < n; i++) {
      const cx = -len / 2 + PW + r + i * (clear + PW); centres.push(cx);
      const h = new THREE.Path();
      h.moveTo(cx - r, 0.001); h.lineTo(cx - r, SPR);
      for (let k = 1; k <= 12; k++) { const a = Math.PI - Math.PI * k / 12; h.lineTo(cx + r * Math.cos(a), SPR + r * Math.sin(a)); }
      h.lineTo(cx + r, 0.001); h.lineTo(cx - r, 0.001);
      s.holes.push(h);
    }
    const geo = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false });
    geo.translate(0, 0, -T / 2);
    return { geo, centres, r };
  };
  const ring = (r, w) => {
    const s = new THREE.Shape();
    s.absarc(0, 0, r + w, 0, Math.PI, false); s.lineTo(-r, 0); s.absarc(0, 0, r, Math.PI, 0, true); s.lineTo(r + w, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: T + 0.16, bevelEnabled: false, curveSegments: 12 });
    geo.translate(0, 0, -(T + 0.16) / 2);
    return geo;
  };

  // front arcade (3 bays) and the two end walls (1 bay each)
  const front = arcadeWall(L, 3);
  add(front.geo, LIME, 0, 0, D / 2 - T / 2);
  const endW = arcadeWall(D, 1);
  for (const sx of [-1, 1]) { const e = add(endW.geo, LIME, sx * (L / 2 - T / 2), 0, 0); e.rotation.y = Math.PI / 2; }
  const rg = ring(front.r, 0.32), re = ring(endW.r, 0.32);
  for (const cx of front.centres) add(rg, STONE, cx, SPR, D / 2 - T / 2);
  for (const sx of [-1, 1]) { const o = add(re, STONE, sx * (L / 2 - T / 2), SPR, 0); o.rotation.y = Math.PI / 2; }
  // stone piers with bases and impost blocks, proud of the wall
  const pierXs = [-L / 2 + PW / 2, ...front.centres.map((c) => c + front.r + PW / 2)];
  for (const x of pierXs) {
    add(B(PW + 0.06, SPR, T + 0.12), STONE, x, SPR / 2, D / 2 - T / 2);
    add(B(PW + 0.2, 0.25, T + 0.24), STONE, x, 0.125, D / 2 - T / 2);
    add(B(PW + 0.24, 0.22, T + 0.26), STONE, x, SPR - 0.05, D / 2 - T / 2);
  }
  for (const sx of [-1, 1]) for (const z of [-D / 2 + PW / 2, D / 2 - PW / 2]) {
    add(B(T + 0.12, SPR, PW + 0.06), STONE, sx * (L / 2 - T / 2), SPR / 2, z);
  }
  // back wall, solid, with a door and two windows on the inside (loggia) face
  add(B(L - 2 * T + 0.02, GF, 0.5), LIME, 0, GF / 2, -D / 2 + 0.25);
  add(B(1.0, 2.1, 0.1), DARK, 0, 1.05, -D / 2 + 0.52);
  for (const x of [-3.8, 3.8]) {
    add(B(1.1, 1.1, 0.06), DARK, x, 2.0, -D / 2 + 0.51);
    for (const s of [-1, 1]) add(B(0.5, 1.15, 0.08), TEAL, x + s * 0.83, 2.0, -D / 2 + 0.54);
  }
  // outer back face: blind arcade echoing the front, with a shuttered window in each bay
  for (const cx of front.centres) {
    const o = add(ring(front.r, 0.28), STONE, cx, SPR, -D / 2 + 0.03); o.scale.z = 0.12;
    add(B(1.0, 1.15, 0.06), DARK, cx, 2.2, -D / 2 - 0.02);
    for (const s2 of [-1, 1]) add(B(0.48, 1.18, 0.08), TEAL, cx + s2 * 0.76, 2.2, -D / 2 - 0.04);
    add(B(1.3, 0.12, 0.22), STONE, cx, 1.56, -D / 2 - 0.08);
  }
  for (const x of pierXs) add(B(PW, SPR, 0.1), STONE, x, SPR / 2, -D / 2 - 0.03);
  // loggia floor and ceiling slabs
  add(B(L, 0.12, D), STONE, 0, 0.06, 0);
  add(B(L, 0.25, D), STONE, 0, GF - 0.125, 0);
  // string course
  add(B(L + 0.3, 0.2, D + 0.3), STONE, 0, GF + 0.1, 0);
  // upper storey: limewash box with recessed windows on all sides
  const UH = 2.1, UY = GF + 0.2;
  add(B(L, UH, D), LIME, 0, UY + UH / 2, 0);
  const win = (x, z, rotY) => {
    const grp = new THREE.Group(); grp.position.set(x, UY + 1.1, z); grp.rotation.y = rotY; g.add(grp);
    const pane = new THREE.Mesh(B(0.8, 1.1, 0.04), DARK); pane.position.z = 0.02; grp.add(pane);
    for (const [w, h, x, y] of [[1.04, 0.12, 0, 0.61], [0.12, 1.1, -0.46, 0], [0.12, 1.1, 0.46, 0]]) {
      const f = new THREE.Mesh(B(w, h, 0.2), STONE); f.position.set(x, y, 0.1); grp.add(f);
    }
    const sill = new THREE.Mesh(B(1.1, 0.1, 0.2), STONE); sill.position.set(0, -0.6, 0.05); grp.add(sill);
    for (const s of [-1, 1]) { const sh = new THREE.Mesh(B(0.42, 1.12, 0.06), TEAL); sh.position.set(s * 0.76, 0, 0.05); grp.add(sh); }
  };
  for (const x of [-4, 0, 4]) { win(x, D / 2, 0); win(x, -D / 2, Math.PI); }
  for (const sx of [-1, 1]) win(sx * L / 2, 0, sx * Math.PI / 2);
  // gabled roof with eaves overhang
  const RT = UY + UH, RH = 0.8, OV = 0.45;
  const roofS = new THREE.Shape();
  roofS.moveTo(-(D / 2 + OV), -0.12); roofS.lineTo(D / 2 + OV, -0.12); roofS.lineTo(0, RH); roofS.lineTo(-(D / 2 + OV), -0.12);
  const rgeo = new THREE.ExtrudeGeometry(roofS, { depth: L + 2 * OV * 0.6, bevelEnabled: false });
  rgeo.translate(0, 0, -(L + 2 * OV * 0.6) / 2);
  const roof = add(rgeo, TILE, 0, RT, 0); roof.rotation.y = Math.PI / 2;
  // gable infill (limewash) under the roof
  const gab = new THREE.Shape(); gab.moveTo(-D / 2, 0); gab.lineTo(D / 2, 0); gab.lineTo(0, RH - 0.15); gab.lineTo(-D / 2, 0);
  const ggeo = new THREE.ExtrudeGeometry(gab, { depth: L - 0.02, bevelEnabled: false }); ggeo.translate(0, 0, -(L - 0.02) / 2);
  const gm = add(ggeo, LIME, 0, RT, 0); gm.rotation.y = Math.PI / 2;
  // tile ridge and eave courses for the chunky read
  add(B(L + 2 * OV * 0.6, 0.16, 0.3), TILE, 0, RT + RH - 0.02, 0);
  for (const sz of [-1, 1]) add(B(L + 2 * OV * 0.6, 0.12, 0.22), TILE, 0, RT - 0.08, sz * (D / 2 + OV - 0.1));

  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
