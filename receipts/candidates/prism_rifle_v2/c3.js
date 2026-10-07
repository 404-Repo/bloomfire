// Prism rifle v2, candidate 3: HAND-BUILT LOFTS. The stock and pistol grip are lofted
// BufferGeometry through rounded cross-sections (a real, softly rounded rifle stock rather than
// a slab), the forend is a loft too. The cage follows r01: elongated hexagon side frames with two
// arched straps swept over the top (TubeGeometry), leaving the top open so the crystal shows from
// the eye. The barrel is an eight-sided blued tube; the muzzle a slotted lathe shroud with a
// flared crown. The crystal is a double-terminated hexagonal quartz with bright and amber
// facets. Muzzle toward -Z, butt toward +Z.
export default function (THREE) {
  const brass = new THREE.MeshStandardMaterial({ color: 0xb8913a, roughness: 0.35, metalness: 0.35 }); brass.name = 'metal';
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.5, metalness: 0 }); wood.name = 'timber';
  const blued = new THREE.MeshStandardMaterial({ color: 0x3f8a8a, roughness: 0.35, metalness: 0.3, flatShading: true }); blued.name = 'metal';
  const iron = new THREE.MeshStandardMaterial({ color: 0x3c3a38, roughness: 0.5, metalness: 0.4 }); iron.name = 'metal';
  const prism = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffd27a, emissiveIntensity: 1.5, roughness: 0.2, metalness: 0, flatShading: true }); prism.name = 'prism';
  const facet = new THREE.MeshStandardMaterial({ color: 0xe0962e, emissive: 0xc8741c, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0, flatShading: true }); facet.name = 'prism_facet';
  [brass, iron, wood].forEach((m) => { m.side = THREE.DoubleSide; });

  const M = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); return o;
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // loft through sections {c, u, v, a, b}: superellipse points c + u*a*cos + v*b*sin, capped both ends
  const loft = (secs, k = 14, e = 0.55) => {
    const pos = [], idx = [];
    secs.forEach((s) => {
      for (let i = 0; i < k; i++) {
        const t = (i / k) * Math.PI * 2, ct = Math.cos(t), st = Math.sin(t);
        const cx = Math.sign(ct) * Math.pow(Math.abs(ct), e), sy = Math.sign(st) * Math.pow(Math.abs(st), e);
        const p = s.c.clone().addScaledVector(s.u, s.a * cx).addScaledVector(s.v, s.b * sy); pos.push(p.x, p.y, p.z);
      }
    });
    for (let j = 0; j < secs.length - 1; j++) for (let i = 0; i < k; i++) {
      const a = j * k + i, b = j * k + ((i + 1) % k), c = a + k, d = b + k; idx.push(a, c, b, b, c, d);
    }
    [0, secs.length - 1].forEach((j, n) => {
      const s = secs[j], ci = pos.length / 3; pos.push(s.c.x, s.c.y, s.c.z);
      for (let i = 0; i < k; i++) { const a = j * k + i, b = j * k + ((i + 1) % k); n ? idx.push(ci, a, b) : idx.push(ci, b, a); }
    });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  };
  const X = V(1, 0, 0), UP = V(0, 1, 0), FW = V(0, 0, 1);
  const zsec = (z, yTop, yBot, hw) => ({ c: V(0, (yTop + yBot) / 2, z), u: X, v: UP, a: hw, b: (yTop - yBot) / 2 });
  const lathe = (prof, seg = 16) => { const geo = new THREE.LatheGeometry(prof.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(-Math.PI / 2); return geo; };

  const g = new THREE.Group();
  const root = new THREE.Group(); g.add(root);
  const Y = 0.145;

  // ---- stock: lofted from the butt to the wrist, then the grip lofted downward
  root.add(M(loft([zsec(0.458, 0.164, 0.012, 0.025), zsec(0.43, 0.163, 0.016, 0.026), zsec(0.37, 0.158, 0.03, 0.025), zsec(0.3, 0.15, 0.05, 0.023),
    zsec(0.24, 0.142, 0.074, 0.021), zsec(0.19, 0.137, 0.088, 0.02), zsec(0.15, 0.137, 0.09, 0.022)], 16, 0.5), wood));
  const gsec = (y, z, hz, hw) => ({ c: V(0, y, z), u: X, v: FW, a: hw, b: hz });
  root.add(M(loft([gsec(0.1, 0.185, 0.024, 0.02), gsec(0.07, 0.198, 0.022, 0.019), gsec(0.04, 0.214, 0.021, 0.019), gsec(0.026, 0.22, 0.022, 0.02)], 14, 0.55), wood));
  // butt plate, heel and toe caps, grip cap, wrist band
  root.add(M(loft([zsec(0.472, 0.17, 0.006, 0.03), zsec(0.457, 0.17, 0.006, 0.03)], 16, 0.4), brass));
  root.add(M(loft([zsec(0.457, 0.172, 0.146, 0.031), zsec(0.41, 0.168, 0.15, 0.0285)], 12, 0.4), brass));
  root.add(M(loft([zsec(0.457, 0.04, 0.004, 0.031), zsec(0.42, 0.024, 0.009, 0.029)], 12, 0.4), brass));
  root.add(M(loft([gsec(0.026, 0.222, 0.025, 0.023), gsec(0.014, 0.224, 0.024, 0.022)], 12, 0.5), brass));
  root.add(M(loft([zsec(0.172, 0.14, 0.083, 0.027), zsec(0.15, 0.134, 0.083, 0.027)], 14, 0.4), brass));
  // inlaid brass strap along the comb (the ornate detail nearest the eye)
  root.add(M(loft([zsec(0.4, 0.164, 0.155, 0.01), zsec(0.33, 0.157, 0.148, 0.009), zsec(0.25, 0.147, 0.139, 0.008), zsec(0.2, 0.142, 0.134, 0.008)], 8, 0.5), brass));

  // ---- receiver blocks
  root.add(M(loft([zsec(0.15, 0.13, 0.084, 0.028), zsec(0.12, 0.13, 0.084, 0.028), zsec(0.1, 0.118, 0.086, 0.026)], 14, 0.35), brass));
  root.add(M(new THREE.BoxGeometry(0.012, 0.008, 0.012), brass, 0, 0.134, 0.138));
  root.add(M(loft([zsec(-0.108, 0.168, 0.085, 0.03), zsec(-0.125, 0.182, 0.084, 0.031), zsec(-0.168, 0.172, 0.09, 0.029)], 14, 0.35), brass));
  [-1, 1].forEach((s) => {
    root.add(M(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 14), brass, s * 0.032, 0.128, -0.14, 0, 0, Math.PI / 2));
    root.add(M(new THREE.CylinderGeometry(0.008, 0.008, 0.014, 10), iron, s * 0.034, 0.128, -0.14, 0, 0, Math.PI / 2));
  });
  root.add(M(new THREE.TorusGeometry(0.024, 0.005, 6, 14, Math.PI), brass, 0, 0.086, 0.122, 0, Math.PI / 2, Math.PI));
  root.add(M(new THREE.BoxGeometry(0.006, 0.026, 0.008), iron, 0, 0.074, 0.116, 0.35));

  // ---- cage: hexagon side frames (r01), arched straps over the open top, a floor
  const CZ = -0.005, HZ = 0.112, HY = 0.072, Q = 0.062, T = 0.015, W = 0.056;
  const outer = [[-HZ, 0], [-Q, HY], [Q, HY], [HZ, 0], [Q, -HY], [-Q, -HY]];
  const inner = [[-HZ + T * 1.3, 0], [-Q + T * 0.4, HY - T], [Q - T * 0.4, HY - T], [HZ - T * 1.3, 0], [Q - T * 0.4, -HY + T], [-Q + T * 0.4, -HY + T]];
  const hex = new THREE.Shape(); outer.forEach(([z, y], i) => (i ? hex.lineTo(z, y) : hex.moveTo(z, y)));
  const hole = new THREE.Path(); inner.slice().reverse().forEach(([z, y], i) => (i ? hole.lineTo(z, y) : hole.moveTo(z, y)));
  hex.holes.push(hole);
  const frame = new THREE.ExtrudeGeometry(hex, { depth: 0.006, bevelEnabled: true, bevelSize: 0.0025, bevelThickness: 0.0025, bevelSegments: 1 });
  frame.translate(0, 0, -0.003); frame.rotateY(-Math.PI / 2);
  const stud = new THREE.SphereGeometry(0.0065, 8, 5);
  [-W, W].forEach((x) => {
    root.add(M(frame, brass, x, Y, CZ));
    outer.forEach(([z, y]) => root.add(M(stud, brass, x + Math.sign(x) * 0.006, Y + y * 0.93, CZ + z * 0.95)));
  });
  [-Q + 0.004, Q - 0.004].forEach((z) => {
    const curve = new THREE.QuadraticBezierCurve3(V(-W, Y + HY - 0.006, CZ + z), V(0, Y + HY + 0.045, CZ + z), V(W, Y + HY - 0.006, CZ + z));
    root.add(M(new THREE.TubeGeometry(curve, 10, 0.0055, 6), brass));
  });
  root.add(M(new THREE.SphereGeometry(0.0085, 10, 6), brass, -W - 0.004, Y + HY + 0.004, CZ));
  root.add(M(new THREE.SphereGeometry(0.0085, 10, 6), brass, W + 0.004, Y + HY + 0.004, CZ));
  root.add(M(new THREE.BoxGeometry(2 * W, 0.01, 2 * Q + 0.02), brass, 0, Y - HY + 0.004, CZ));

  // ---- crystal: double-terminated hexagonal quartz
  const pj = new THREE.Group(); pj.position.set(0, Y, CZ); root.add(pj);
  const quartz = (r, body, tip, sel) => {
    const n = 6, pos = [], A = [], B = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + 0.2, rr = r * (1 + 0.08 * Math.sin(i * 2.3)); A.push([Math.cos(a) * rr, Math.sin(a) * rr, body]); B.push([Math.cos(a) * rr * 0.97, Math.sin(a) * rr * 0.97, -body]); }
    const tB = [0.004, -0.003, body + tip], tF = [-0.003, 0.004, -body - tip * 1.15];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, s = i % 2;
      if (s === sel) pos.push(...A[i], ...B[i], ...B[j], ...A[i], ...B[j], ...A[j]);
      if (s !== sel) pos.push(...tB, ...A[i], ...A[j]);
      if (s === sel) pos.push(...tF, ...B[j], ...B[i]);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals(); return geo;
  };
  pj.add(M(quartz(0.049, 0.036, 0.058, 0), prism));
  pj.add(M(quartz(0.049, 0.036, 0.058, 1), facet));

  // ---- forend loft, octagonal barrel, band, muzzle
  root.add(M(loft([zsec(-0.168, 0.13, 0.088, 0.024), zsec(-0.25, 0.13, 0.09, 0.024), zsec(-0.34, 0.13, 0.096, 0.022), zsec(-0.37, 0.126, 0.106, 0.018)], 14, 0.55), wood));
  const bar = new THREE.CylinderGeometry(0.02, 0.02, 0.24, 8); bar.rotateX(Math.PI / 2);
  root.add(M(bar, blued, 0, Y, -0.285, 0, 0, Math.PI / 8));
  root.add(M(lathe([[0.03, 0.352], [0.035, 0.357], [0.035, 0.383], [0.03, 0.388]], 16), brass, 0, Y - 0.01, 0, 0, 0, 0, 1, 1.3, 1));
  root.add(M(lathe([[0.019, 0.386], [0.029, 0.39], [0.03, 0.398], [0.027, 0.402], [0.027, 0.452], [0.031, 0.456], [0.031, 0.463],
    [0.042, 0.477], [0.043, 0.488], [0.037, 0.492], [0.016, 0.49], [0.015, 0.47]], 16), brass, 0, Y, 0));
  [-1, 1].forEach((s) => [0.41, 0.424, 0.438].forEach((z) => root.add(M(new THREE.BoxGeometry(0.006, 0.012, 0.009), iron, s * 0.0255, Y + 0.002, -z))));
  root.add(M(new THREE.CylinderGeometry(0.009, 0.009, 0.075, 10), iron, 0, Y - 0.032, -0.422, Math.PI / 2));
  root.add(M(new THREE.BoxGeometry(0.005, 0.022, 0.016), brass, 0, Y + 0.035, -0.46));

  const muzzle = new THREE.Group(); muzzle.position.set(0, Y, -0.492); root.add(muzzle);
  g.userData.joints = { prism: pj, muzzle };

  // contract placement: measure vertices, base at y=0, centred on x and z
  const box = new THREE.Box3(), v = new THREE.Vector3(), m4 = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m4.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
