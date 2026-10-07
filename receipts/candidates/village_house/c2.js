// village_house c2: profiles: extruded pentagon shell, extruded stepped tile-course roof, balcony, external gable chimney
export default function (THREE) {
  const g = new THREE.Group();
  const PI = Math.PI;
  const _mats = {};
  const mat = (hex, name, rough = 0.9, metal = 0, side) => {
    const k = hex + name + rough + metal + (side || 0);
    if (!_mats[k]) {
      const o = { color: hex, roughness: rough, metalness: metal };
      if (side) o.side = side;
      _mats[k] = new THREE.MeshStandardMaterial(o);
      _mats[k].name = name;
    }
    return _mats[k];
  };
  const P = {
    plaster: mat(0xeee3cf, 'plaster', 0.92),
    stone: mat(0xc9b48f, 'stone', 0.9),
    tile: mat(0xc0603a, 'tile', 0.8),
    teal: mat(0x3f8a8a, 'timber', 0.75),
    timber: mat(0x7a5534, 'timber', 0.85),
    dark: mat(0x4a3324, 'timber', 0.95),
    iron: mat(0x3c3a38, 'metal', 0.6, 0.3),
  };
  const add = (geo, m, x = 0, y = 0, z = 0, parent = g) => {
    const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o;
  };
  const B = (w, h, d, m, x, y, z, parent = g) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent);
  const grp = (x = 0, y = 0, z = 0, ry = 0, parent = g) => {
    const o = new THREE.Group(); o.position.set(x, y, z); o.rotation.y = ry; parent.add(o); return o;
  };
  // A face group: origin on the wall surface, local +Z pointing out of the wall.
  // side: 'front' (+Z), 'back' (-Z), 'right' (+X), 'left' (-X); off = half depth/width of the wall.
  const face = (side, off, parent = g) => {
    if (side === 'front') return grp(0, 0, off, 0, parent);
    if (side === 'back') return grp(0, 0, -off, PI, parent);
    if (side === 'right') return grp(off, 0, 0, PI / 2, parent);
    return grp(-off, 0, 0, -PI / 2, parent);
  };
  // Triangular prism: triangle (base w, height h) in the local XY plane, extruded len along Z, base at y=0.
  const prism = (w, h, len, m, x, y, z, ry = 0, parent = g) => {
    const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
    geo.translate(0, 0, -len / 2);
    const o = add(geo, m, x, y, z, parent); o.rotation.y = ry; return o;
  };
  // Recessed window: dark void, deep stone surround, optional open teal shutters.
  const win = (f, u, v, w = 0.8, h = 1.1, o = {}) => {
    const t = o.t || 0.13, dp = o.dp || 0.2, trim = o.trim || P.stone;
    B(w, h, 0.04, P.dark, u, v, 0.02, f);
    B(w + 2 * t, t, dp, trim, u, v + h / 2 + t / 2, dp / 2, f);
    B(w + 2 * t + 0.14, t, dp + 0.1, trim, u, v - h / 2 - t / 2, (dp + 0.1) / 2, f);
    B(t, h, dp, trim, u - w / 2 - t / 2, v, dp / 2, f);
    B(t, h, dp, trim, u + w / 2 + t / 2, v, dp / 2, f);
    if (o.shutters !== false) {
      const sw = w / 2 + 0.05;
      for (const s of [-1, 1]) {
        const sh = B(sw, h + 0.06, 0.07, P.teal, u + s * (w / 2 + t + sw / 2 + 0.03), v, 0.13, f);
        sh.rotation.y = -s * 0.28;
        B(sw * 0.9, 0.05, 0.03, P.dark, 0, h * 0.22, 0.045, sh);
        B(sw * 0.9, 0.05, 0.03, P.dark, 0, -h * 0.22, 0.045, sh);
      }
    }
  };
  // Arched opening helper: half-disc of radius r in the local XY plane, extruded d along Z.
  const halfDisc = (r, d, m, x, y, z, parent, seg = 10) => {
    const geo = new THREE.CylinderGeometry(r, r, d, seg, 1, false, -PI / 2, PI);
    geo.rotateX(PI / 2);
    return add(geo, m, x, y, z, parent);
  };
  const halfRing = (r, tube, m, x, y, z, parent, seg = 12) => {
    const geo = new THREE.TorusGeometry(r, tube, 4, seg, PI);
    return add(geo, m, x, y, z, parent);
  };
  // Recessed door, square or arched.
  const door = (f, u, w = 1.0, h = 2.1, o = {}) => {
    const t = o.t || 0.2, dp = o.dp || 0.34, leaf = o.leaf || P.dark, trim = o.trim || P.stone;
    const hs = o.arch ? h - w / 2 : h;
    B(w, hs, 0.06, leaf, u, hs / 2, 0.03, f);
    if (o.arch) halfDisc(w / 2, 0.06, leaf, u, hs, 0.03, f);
    for (let i = -1; i <= 1; i += 2) B(0.04, hs - 0.1, 0.03, P.dark, u + i * w * 0.2, hs / 2, 0.075, f);
    B(t, hs, dp, trim, u - w / 2 - t / 2, hs / 2, dp / 2, f);
    B(t, hs, dp, trim, u + w / 2 + t / 2, hs / 2, dp / 2, f);
    if (o.arch) {
      const ring = halfRing(w / 2 + t / 2, t / 2, trim, u, hs, dp / 2, f);
      ring.scale.z = dp / t;
    } else {
      B(w + 2 * t + 0.1, t + 0.04, dp + 0.04, trim, u, hs + (t + 0.04) / 2, (dp + 0.04) / 2, f);
    }
    B(w + 2 * t + 0.3, 0.16, 0.55, P.stone, u, 0.08, 0.27, f);
  };
  // Gable roof, ridge along local X, centred at (x, ridgeY, z). L = length along ridge,
  // d = horizontal half span to the eave edge, tanA = slope. Barrel tiles if tiles=true,
  // stepped courses if courses > 0.
  const gableRoof = (L, d, tanA, ridgeY, o = {}, parent = g) => {
    const th = o.th || 0.22, a = Math.atan(tanA), S = d / Math.cos(a);
    const root = grp(o.x || 0, ridgeY, o.z || 0, o.ry || 0, parent);
    for (const side of [0, PI]) {
      const sg = grp(0, 0, 0, side, root);
      const sl = new THREE.Group(); sl.rotation.x = a; sg.add(sl);
      B(L, th, S, P.tile, 0, -th / 2, S / 2, sl);
      if (o.tiles) {
        const n = Math.max(2, Math.round(L / 0.34));
        const geo = new THREE.CylinderGeometry(0.13, 0.13, S, 6, 1);
        geo.rotateX(PI / 2);
        for (let i = 0; i < n; i++) add(geo, P.tile, -L / 2 + (i + 0.5) * L / n, 0.0, S / 2 + 0.02, sl);
      }
      if (o.courses) {
        for (let k = 1; k <= o.courses; k++) B(L + 0.02, 0.07, 0.16, P.tile, 0, 0.02, S * k / o.courses - 0.08, sl);
      }
      if (o.fascia !== false) B(L, 0.16, 0.08, P.dark, 0, -th - 0.06, S - 0.06, sl);
    }
    const cap = new THREE.CylinderGeometry(0.17, 0.17, L + 0.1, 7); cap.rotateZ(PI / 2);
    add(cap, P.tile, 0, 0.02, 0, root);
    return root;
  };
  // Hip (pyramid) roof over a square of side s (eave edge), rise h, base at y.
  const hipRoof = (s, h, y, o = {}, parent = g) => {
    const root = grp(o.x || 0, y, o.z || 0, 0, parent);
    const geo = new THREE.ConeGeometry(s / Math.SQRT2, h, 4, 1); geo.rotateY(PI / 4);
    add(geo, P.tile, 0, h / 2, 0, root);
    const hipLen = Math.sqrt(2 * (s / 2) ** 2 + h * h);
    for (let i = 0; i < 4; i++) {
      const ang = PI / 4 + i * PI / 2;
      const hg = grp(0, 0, 0, ang, root);
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, hipLen, 6), P.tile);
      const tilt = -Math.atan2(s / Math.SQRT2, h);
      r.position.set(0, h / 2, s / Math.SQRT2 / 2); r.rotation.x = tilt; hg.add(r);
    }
    if (o.courses) {
      for (let k = 1; k < o.courses; k++) {
        const f = k / o.courses, yy = h * f, rr = (s / Math.SQRT2) * (1 - f) + 0.08;
        const cg = new THREE.CylinderGeometry(rr, rr + 0.04, 0.08, 4, 1); cg.rotateY(PI / 4);
        add(cg, P.tile, 0, yy, 0, root);
      }
    }
    // eave fascia ring
    for (let i = 0; i < 4; i++) {
      const fg = grp(0, 0, 0, i * PI / 2, root);
      B(s, 0.2, 0.1, P.dark, 0, -0.08, s / 2 - 0.05, fg);
    }
    return root;
  };
  // Corner quoins: alternating long/short blocks up a corner at (x, z).
  const quoins = (x, z, y0, y1, sx, sz, hh = 0.42, parent = g) => {
    let k = 0;
    for (let y = y0; y + hh <= y1 + 0.01; y += hh, k++) {
      const long = k % 2 === 0;
      const w = long ? 0.7 : 0.45, d = long ? 0.45 : 0.7;
      B(w, hh - 0.05, d, P.stone, x - sx * (w / 2 - 0.08), y + hh / 2, z - sz * (d / 2 - 0.08), parent);
    }
  };
  // Small arched window: dark void with a round head, deep stone surround. vb = sill height.
  const archWin = (f, u, vb, w = 0.6, h = 1.3, o = {}) => {
    const t = o.t || 0.12, dp = o.dp || 0.22, trim = o.trim || P.stone, hs = h - w / 2;
    B(w, hs, 0.04, P.dark, u, vb + hs / 2, 0.02, f);
    halfDisc(w / 2, 0.04, P.dark, u, vb + hs, 0.02, f, 8);
    B(t, hs, dp, trim, u - w / 2 - t / 2, vb + hs / 2, dp / 2, f);
    B(t, hs, dp, trim, u + w / 2 + t / 2, vb + hs / 2, dp / 2, f);
    const ring = halfRing(w / 2 + t / 2, t / 2, trim, u, vb + hs, dp / 2, f, 8); ring.scale.z = dp / t;
    B(w + 2 * t + 0.12, t, dp + 0.08, trim, u, vb - t / 2, (dp + 0.08) / 2, f);
  };

// profiles: extruded pentagon shell, extruded stepped tile-course roof, balcony, external gable chimney
  const W = 7.6, D = 5.6, Hw = 5.4, tanA = 0.45, ov = 0.45, th = 0.22;
  const rise = (D / 2) * tanA;
  const sh = new THREE.Shape();
  sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(D / 2, Hw); sh.lineTo(0, Hw + rise); sh.lineTo(-D / 2, Hw); sh.lineTo(-D / 2, 0);
  const shell = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false });
  shell.translate(0, 0, -W / 2); shell.rotateY(-PI / 2);
  add(shell, P.plaster);
  B(W + 0.24, 0.5, D + 0.24, P.stone, 0, 0.25, 0);
  // roof: one stepped-course profile per side, extruded along X
  const L = W + 2 * ov, d = D / 2 + ov, n = 7;
  const ridgeY = Hw + rise + th / Math.cos(Math.atan(tanA));
  for (const s of [1, -1]) {
    const pr = new THREE.Shape();
    const yl = (z) => ridgeY - z * tanA;
    pr.moveTo(0, yl(0));
    for (let k = 0; k < n; k++) {
      const z0 = d * k / n, z1 = d * (k + 1) / n;
      pr.lineTo(s * (z1 - 0.02), yl(z1) + 0.0);
      pr.lineTo(s * (z1 - 0.02), yl(z1) - 0.11);
      if (k < n - 1) pr.lineTo(s * z1, yl(z1) - 0.11 + 0.11);
    }
    pr.lineTo(s * d, yl(d) - 0.11 - th);
    pr.lineTo(0, ridgeY - th - 0.11);
    pr.lineTo(0, yl(0));
    const geo = new THREE.ExtrudeGeometry(pr, { depth: L, bevelEnabled: false });
    geo.translate(0, 0, -L / 2); geo.rotateY(-PI / 2);
    add(geo, P.tile);
    // rafter tails under the eave
    for (let x = -W / 2 + 0.3; x <= W / 2 - 0.2; x += 0.62) B(0.14, 0.14, ov + 0.1, P.dark, x, Hw - 0.02, s * (D / 2 + ov / 2));
  }
  const cap = new THREE.CylinderGeometry(0.18, 0.18, L + 0.1, 7); cap.rotateZ(PI / 2); add(cap, P.tile, 0, ridgeY + 0.02, 0);
  // verge boards on the gables
  for (const sx of [-1, 1]) for (const s of [0, PI]) {
    const sg = grp(sx * (L / 2 - 0.05), ridgeY - 0.05, 0, s);
    const sl = new THREE.Group(); sl.rotation.x = Math.atan(tanA); sg.add(sl);
    B(0.1, 0.32, d / Math.cos(Math.atan(tanA)), P.dark, 0, -0.18, d / Math.cos(Math.atan(tanA)) / 2, sl);
  }
  const fr = face('front', D / 2), bk = face('back', D / 2), rt = face('right', W / 2), lf = face('left', W / 2);
  win(fr, -2.6, 1.6); door(fr, 0.0, 1.1, 2.2); win(fr, 2.6, 1.6);
  win(fr, -2.6, 4.3); win(fr, 2.6, 4.3);
  // balcony with a french door above the entrance
  door(grp(0, 3.05, D / 2), 0, 1.0, 2.1, { leaf: P.teal });
  B(2.2, 0.16, 0.9, P.stone, 0, 3.0, D / 2 + 0.45);
  for (let i = 0; i < 3; i++) B(0.18, 0.12, 0.4, P.stone, -0.8 + i * 0.8, 2.86, D / 2 + 0.2);
  B(2.2, 0.06, 0.06, P.iron, 0, 3.95, D / 2 + 0.87);
  for (const sx of [-1, 1]) B(0.06, 0.06, 0.88, P.iron, sx * 1.07, 3.95, D / 2 + 0.44);
  for (let i = 0; i <= 10; i++) B(0.035, 0.9, 0.035, P.iron, -1.07 + i * 0.214, 3.5, D / 2 + 0.87);
  win(bk, -2.4, 1.6); win(bk, 0.6, 1.6, 0.6, 0.8, { shutters: false }); win(bk, 2.6, 1.6);
  win(bk, -2.4, 4.3); win(bk, 0.0, 4.3); win(bk, 2.4, 4.3);
  win(rt, 0.9, 1.6); win(rt, -0.9, 4.3); win(rt, 0, 6.05, 0.45, 0.5, { shutters: false });
  win(lf, 1.4, 1.6); win(lf, 1.4, 4.3);
  // external chimney stack on the left gable
  B(1.3, 6.6, 0.95, P.plaster, -W / 2 - 0.5, 3.3, -0.9);
  B(1.0, 1.4, 0.8, P.plaster, -W / 2 - 0.5, 7.2, -0.9);
  B(1.15, 0.12, 0.95, P.tile, -W / 2 - 0.5, 7.95, -0.9);
  B(1.45, 0.4, 1.1, P.stone, -W / 2 - 0.5, 0.2, -0.9);

  {
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
  }
  return g;
}
