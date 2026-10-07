// arcade_section c3: a different reading, after the market concept frame.
// Round stone columns with lathed bases and capitals carry the three front
// arches (extruded rings in a limewash spandrel wall); the loggia runs back to
// a solid rear wall; end walls have arches; the upper storey sits proud on a
// moulded cornice; lean-to style gable roof with deep eaves and tile courses.
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

  const L = 12, D = 4, T = 0.55, GF = 5.1, SPR = 3.2, CR = 0.3;
  const colX = [-L / 2 + 0.45, -2, 2, L / 2 - 0.45];
  // column profile: base, shaft with entasis, capital
  const prof = [[0, 0], [0.5, 0], [0.5, 0.18], [0.4, 0.26], [0.34, 0.34], [0.32, 1.6], [0.3, SPR - 0.5], [0.34, SPR - 0.38], [0.48, SPR - 0.2], [0.52, SPR - 0.2], [0.52, SPR], [0, SPR]].map(([x, y]) => new THREE.Vector2(x, y));
  const colGeo = new THREE.LatheGeometry(prof, 10);
  // front wall above the columns: shape with 3 arch holes between column centres
  const s = new THREE.Shape();
  s.moveTo(-L / 2, SPR); s.lineTo(L / 2, SPR); s.lineTo(L / 2, GF); s.lineTo(-L / 2, GF); s.lineTo(-L / 2, SPR);
  const centres = [], radii = [];
  for (let i = 0; i < 3; i++) {
    const a = colX[i] + (i === 0 ? 0.3 : 0.3), b = colX[i + 1] - 0.3;
    const cx = (a + b) / 2, r = (b - a) / 2; centres.push(cx); radii.push(r);
    const h = new THREE.Path(); h.moveTo(a, SPR + 0.001);
    for (let k = 1; k <= 12; k++) { const t = Math.PI - Math.PI * k / 12; h.lineTo(cx + r * Math.cos(t), SPR + r * Math.sin(t)); }
    h.lineTo(a, SPR + 0.001); s.holes.push(h);
  }
  const fw = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false }); fw.translate(0, 0, -T / 2);
  add(fw, LIME, 0, 0, D / 2 - T / 2);
  for (let i = 0; i < 3; i++) {
    const r = radii[i], rs = new THREE.Shape();
    rs.absarc(0, 0, r + 0.3, 0, Math.PI, false); rs.lineTo(-r, 0); rs.absarc(0, 0, r, Math.PI, 0, true); rs.lineTo(r + 0.3, 0);
    const rg = new THREE.ExtrudeGeometry(rs, { depth: T + 0.14, bevelEnabled: false, curveSegments: 12 }); rg.translate(0, 0, -(T + 0.14) / 2);
    add(rg, STONE, centres[i], SPR, D / 2 - T / 2);
    // keystone
    add(B(0.36, 0.5, T + 0.2), STONE, centres[i], SPR + r + 0.2, D / 2 - T / 2);
  }
  for (const x of colX) {
    add(colGeo, STONE, x, 0, D / 2 - T / 2);
    add(B(1.1, 0.22, T + 0.3), STONE, x, SPR + 0.11, D / 2 - T / 2);   // impost
  }
  // rear wall (solid) with door and windows both faces; end walls with arches
  add(B(L, GF, T), LIME, 0, GF / 2, -D / 2 + T / 2);
  for (const zf of [-D / 2 + T + 0.01, -D / 2 - 0.01]) {
    const sg = zf > 0 || zf > -D / 2 ? 1 : -1;
    add(B(1.0, 2.1, 0.06), DARK, 0, 1.05, zf);
    add(B(1.3, 0.25, 0.14), STONE, 0, 2.2, zf);
    for (const x of [-4, 4]) {
      add(B(0.9, 1.1, 0.06), DARK, x, 2.0, zf);
      for (const s2 of [-1, 1]) add(B(0.45, 1.12, 0.1), TEAL, x + s2 * 0.7, 2.0, zf + sg * 0.02);
      add(B(1.2, 0.1, 0.2), STONE, x, 1.4, zf);
    }
  }
  for (const sx of [-1, 1]) {
    const es = new THREE.Shape(); const hw = (D - T) / 2;
    es.moveTo(-hw, 0); es.lineTo(hw, 0); es.lineTo(hw, GF); es.lineTo(-hw, GF); es.lineTo(-hw, 0);
    const h = new THREE.Path(); const r = 1.0;
    h.moveTo(-r, 0.001); h.lineTo(-r, SPR - 0.4);
    for (let k = 1; k <= 10; k++) { const t = Math.PI - Math.PI * k / 10; h.lineTo(r * Math.cos(t), SPR - 0.4 + r * Math.sin(t)); }
    h.lineTo(r, 0.001); h.lineTo(-r, 0.001); es.holes.push(h);
    const eg = new THREE.ExtrudeGeometry(es, { depth: T, bevelEnabled: false }); eg.translate(0, 0, -T / 2);
    const e = add(eg, LIME, sx * (L / 2 - T / 2), 0, T / 2 - 0.02); e.rotation.y = Math.PI / 2;
    const tor = add(new THREE.TorusGeometry(r + 0.14, 0.14, 4, 10, Math.PI), STONE, sx * (L / 2 + 0.02), SPR - 0.4, T / 2 - 0.02);
    tor.rotation.y = Math.PI / 2;
  }
  add(B(L, 0.12, D), STONE, 0, 0.06, 0);
  // cornice and upper storey (overhangs the arcade slightly)
  add(B(L + 0.2, 0.18, D + 0.2), STONE, 0, GF + 0.09, 0);
  add(B(L + 0.36, 0.14, D + 0.36), STONE, 0, GF + 0.25, 0);
  const UY = GF + 0.32, UH = 1.8;
  add(B(L, UH, D), LIME, 0, UY + UH / 2, 0);
  for (const x of [-4, 0, 4]) for (const sz of [-1, 1]) {
    add(B(0.8, 1.05, 0.06), DARK, x, UY + 0.95, sz * (D / 2 + 0.02));
    for (const s2 of [-1, 1]) add(B(0.42, 1.08, 0.08), TEAL, x + s2 * 0.62, UY + 0.95, sz * (D / 2 + 0.04));
    add(B(1.0, 0.1, 0.2), STONE, x, UY + 0.38, sz * (D / 2 + 0.06));
  }
  // gable roof, tile courses as stepped slabs on each pitch
  const RT = UY + UH, RH = 0.55, OV = 0.55, pitch = Math.atan2(RH, D / 2 + OV);
  const slope = Math.hypot(RH, D / 2 + OV);
  for (const sz of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const f = (k + 0.5) / 4;
      const slab = add(B(L + 0.6, 0.12, slope / 4 + 0.08), TILE, 0, RT + RH * (1 - f) + 0.04 + k * 0.012, sz * (D / 2 + OV) * f);
      slab.rotation.x = sz * pitch;   // positive x tilts +z down: the +z pitch falls toward +z
    }
  }
  add(B(L + 0.7, 0.16, 0.32), TILE, 0, RT + RH + 0.06, 0);
  const gab = new THREE.Shape(); gab.moveTo(-D / 2, 0); gab.lineTo(D / 2, 0); gab.lineTo(0, RH - 0.05); gab.lineTo(-D / 2, 0);
  const gg = new THREE.ExtrudeGeometry(gab, { depth: L, bevelEnabled: false }); gg.translate(0, 0, -L / 2);
  const gm = add(gg, LIME, 0, RT, 0); gm.rotation.y = Math.PI / 2;

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
