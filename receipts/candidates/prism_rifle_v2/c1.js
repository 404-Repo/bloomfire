// Prism rifle v2, candidate 1: PROFILES. Stock, receiver blocks, forend and cage side frames are
// bevelled side profiles extruded across the gun; barrel, bands, muzzle shroud and flared crown
// are lathes along -Z; the crystal is a hand-built faceted gem (hexagonal bipyramid with an
// antiprism band), split into bright and amber facets so it still reads as cut stone when the
// game pushes its emissive up. Muzzle toward -Z, butt toward +Z.
export default function (THREE) {
  const brass = new THREE.MeshStandardMaterial({ color: 0xb8913a, roughness: 0.35, metalness: 0.35 }); brass.name = 'metal';
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.5, metalness: 0 }); wood.name = 'timber';
  const blued = new THREE.MeshStandardMaterial({ color: 0x3f8a8a, roughness: 0.35, metalness: 0.3 }); blued.name = 'metal';
  const iron = new THREE.MeshStandardMaterial({ color: 0x3c3a38, roughness: 0.5, metalness: 0.4 }); iron.name = 'metal';
  const prism = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffd27a, emissiveIntensity: 1.5, roughness: 0.2, metalness: 0, flatShading: true }); prism.name = 'prism';
  const facet = new THREE.MeshStandardMaterial({ color: 0xe0962e, emissive: 0xc8741c, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0, flatShading: true }); facet.name = 'prism_facet';
  [brass, blued, iron].forEach((m) => { m.side = THREE.DoubleSide; });

  const M = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); return o;
  };
  const g = new THREE.Group();
  const root = new THREE.Group(); g.add(root);
  const Y = 0.145;          // bore axis height
  // side profile drawn in (z, y), extruded across x. rotateY(-PI/2) maps shape x -> world z.
  // ExtrudeGeometry bevels grow the outline by `b`, so the drawn outline is inset by b.
  const ext = (pts, width, b = 0.004, seg = 2) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    const d = Math.max(0.002, width - 2 * b);
    const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: b > 0, bevelSize: b, bevelThickness: b, bevelSegments: seg, curveSegments: 6 });
    geo.translate(0, 0, -d / 2); geo.rotateY(-Math.PI / 2); return geo;
  };
  const lathe = (prof, seg = 16) => { const geo = new THREE.LatheGeometry(prof.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(-Math.PI / 2); return geo; }; // profile y -> -z
  const rivet = new THREE.SphereGeometry(0.006, 8, 5);

  // ---- stock: butt, comb, wrist and a short pistol swell in one outline
  root.add(M(ext([[0.452, 0.02], [0.452, 0.158], [0.40, 0.155], [0.30, 0.143], [0.21, 0.127], [0.155, 0.122], [0.155, 0.098],
    [0.165, 0.078], [0.178, 0.05], [0.19, 0.032], [0.222, 0.03], [0.226, 0.052], [0.24, 0.066], [0.31, 0.052], [0.452, 0.02]], 0.05, 0.008, 3), wood));
  // brass butt plate and the heel / toe caps
  root.add(M(ext([[0.47, 0.008], [0.47, 0.172], [0.456, 0.17], [0.456, 0.01]], 0.064, 0.003), brass));
  root.add(M(ext([[0.456, 0.15], [0.456, 0.171], [0.40, 0.165], [0.405, 0.15]], 0.068, 0.003), brass));
  root.add(M(ext([[0.456, 0.01], [0.456, 0.04], [0.42, 0.027], [0.41, 0.016]], 0.068, 0.003), brass));
  // grip cap
  root.add(M(ext([[0.186, 0.02], [0.228, 0.018], [0.23, 0.034], [0.188, 0.036]], 0.054, 0.003), brass));
  // wrist band where stock meets receiver
  root.add(M(ext([[0.17, 0.09], [0.17, 0.134], [0.15, 0.134], [0.15, 0.09]], 0.062, 0.004), brass));

  // ---- receiver: rear block (kept low so the crystal shows from the eye), front block with a boss
  root.add(M(ext([[0.15, 0.088], [0.15, 0.142], [0.118, 0.146], [0.098, 0.13], [0.098, 0.088]], 0.056, 0.005), brass));
  root.add(M(new THREE.BoxGeometry(0.014, 0.012, 0.012), iron, 0, 0.152, 0.13));                      // rear sight
  root.add(M(ext([[-0.112, 0.085], [-0.112, 0.178], [-0.13, 0.185], [-0.165, 0.172], [-0.165, 0.098], [-0.15, 0.085]], 0.06, 0.005), brass));
  [-1, 1].forEach((s) => {
    root.add(M(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 14), brass, s * 0.034, 0.13, -0.14, 0, 0, Math.PI / 2));
    root.add(M(new THREE.CylinderGeometry(0.008, 0.008, 0.014, 10), iron, s * 0.036, 0.13, -0.14, 0, 0, Math.PI / 2));
  });
  // trigger guard loop + trigger
  root.add(M(new THREE.TorusGeometry(0.026, 0.0055, 6, 14, Math.PI), brass, 0, 0.088, 0.122, 0, Math.PI / 2, Math.PI));
  root.add(M(new THREE.BoxGeometry(0.006, 0.026, 0.008), iron, 0, 0.074, 0.118, 0.35));

  // ---- the cage: two elongated hexagon frames, a floor plate, three cross bars and a top strap
  const CZ = -0.005, HZ = 0.112, HY = 0.074, Q = 0.064, T = 0.016;
  const outer = [[-HZ, 0], [-Q, HY], [Q, HY], [HZ, 0], [Q, -HY], [-Q, -HY]];
  const inner = [[-HZ + T * 1.3, 0], [-Q + T * 0.4, HY - T], [Q - T * 0.4, HY - T], [HZ - T * 1.3, 0], [Q - T * 0.4, -HY + T], [-Q + T * 0.4, -HY + T]];
  const hex = new THREE.Shape(); outer.forEach(([z, y], i) => (i ? hex.lineTo(z, y) : hex.moveTo(z, y)));
  const hole = new THREE.Path(); inner.slice().reverse().forEach(([z, y], i) => (i ? hole.lineTo(z, y) : hole.moveTo(z, y)));
  hex.holes.push(hole);
  const frame = new THREE.ExtrudeGeometry(hex, { depth: 0.008, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 1 });
  frame.translate(0, 0, -0.004); frame.rotateY(-Math.PI / 2);
  const W = 0.058;
  [-W, W].forEach((x) => {
    root.add(M(frame, brass, x, Y, CZ));
    outer.forEach(([z, y]) => root.add(M(rivet, brass, x + Math.sign(x) * 0.006, Y + y * 0.93, CZ + z * 0.95)));
  });
  const bar = new THREE.CylinderGeometry(0.0055, 0.0055, 2 * W, 8);
  [[-Q, HY - 0.006], [Q, HY - 0.006], [-HZ + 0.01, 0]].forEach(([z, y]) => root.add(M(bar, brass, 0, Y + y, CZ + z, 0, 0, Math.PI / 2)));
  root.add(M(new THREE.BoxGeometry(2 * W, 0.01, 2 * Q + 0.02), brass, 0, Y - HY + 0.004, CZ));           // floor
  root.add(M(new THREE.BoxGeometry(0.012, 0.006, 2 * Q + 0.012), brass, 0, Y + HY - 0.002, CZ));         // top strap
  root.add(M(new THREE.SphereGeometry(0.009, 10, 6), brass, 0, Y + HY + 0.002, CZ));

  // ---- the crystal: hand-built faceted gem, spins about local Z in the 'prism' joint
  const pj = new THREE.Group(); pj.position.set(0, Y, CZ); root.add(pj);
  const gem = (r, h, sel) => {
    const v = (a, rad, z) => [Math.cos(a) * rad, Math.sin(a) * rad, z];
    const tipB = [0, 0, h], tipF = [0, 0, -h], A = [], B = [];
    for (let i = 0; i < 6; i++) { A.push(v((i / 6) * Math.PI * 2, r, h * 0.3)); B.push(v(((i + 0.5) / 6) * Math.PI * 2, r * 0.94, -h * 0.3)); }
    const faces = [];
    for (let i = 0; i < 6; i++) {
      const j = (i + 1) % 6;
      faces.push([tipB, A[j], A[i]]);
      faces.push([A[i], A[j], B[i]]);
      faces.push([B[i], A[j], B[j]]);
      faces.push([tipF, B[i], B[j]]);
    }
    const pos = [];
    faces.forEach((f, k) => { if ((k + (k >> 2)) % 2 === sel) f.forEach((p) => pos.push(...p)); });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals(); return geo;
  };
  pj.add(M(gem(0.047, 0.098, 0), prism));
  pj.add(M(gem(0.047, 0.098, 1), facet));

  // ---- forend under the barrel
  root.add(M(ext([[-0.165, 0.092], [-0.165, 0.13], [-0.36, 0.13], [-0.372, 0.116], [-0.36, 0.095], [-0.2, 0.088]], 0.05, 0.006), wood));
  // ---- barrel, band, muzzle shroud, crown
  root.add(M(lathe([[0.0195, 0.16], [0.0195, 0.40]], 14), blued, 0, Y, 0));
  root.add(M(lathe([[0.03, 0.355], [0.035, 0.36], [0.035, 0.385], [0.03, 0.39]], 16), brass, 0, Y - 0.01, 0, 0, 0, 0, 1, 1.3, 1));
  root.add(M(lathe([[0.019, 0.388], [0.029, 0.392], [0.03, 0.40], [0.027, 0.404], [0.027, 0.455], [0.031, 0.459], [0.031, 0.466],
    [0.04, 0.476], [0.041, 0.488], [0.036, 0.492], [0.016, 0.49], [0.015, 0.47]], 16), brass, 0, Y, 0));
  // vent slots on the shroud, three a side, and the under-tube
  [-1, 1].forEach((s) => [0.413, 0.427, 0.441].forEach((z) => root.add(M(new THREE.BoxGeometry(0.006, 0.012, 0.009), iron, s * 0.0255, Y + 0.002, -z))));
  root.add(M(new THREE.CylinderGeometry(0.009, 0.009, 0.075, 10), iron, 0, Y - 0.032, -0.425, Math.PI / 2));
  root.add(M(lathe([[0.012, 0.455], [0.012, 0.465]], 12), brass, 0, Y - 0.032, 0));
  root.add(M(new THREE.BoxGeometry(0.005, 0.022, 0.016), brass, 0, Y + 0.035, -0.462));                  // front sight blade

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
