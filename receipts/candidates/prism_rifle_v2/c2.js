// Prism rifle v2, candidate 2: PRIMITIVES, a different reading of the cage. The crystal sits in
// a six-sided lantern cage along the bore (two hexagonal torus rings, six longitudinal bars),
// so it shows between the bars from every side, including from behind and above where the eye
// is. Everything else is chunky Box / Cylinder / Torus / Cone: a heavy butt, a fat brass
// receiver, ringed barrel and a bell-flared muzzle. The gem is a stretched 8-sided bipyramid
// with bright and amber facets. Muzzle toward -Z, butt toward +Z.
export default function (THREE) {
  const brass = new THREE.MeshStandardMaterial({ color: 0xb8913a, roughness: 0.35, metalness: 0.35 }); brass.name = 'metal';
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.5, metalness: 0 }); wood.name = 'timber';
  const blued = new THREE.MeshStandardMaterial({ color: 0x3f8a8a, roughness: 0.35, metalness: 0.3 }); blued.name = 'metal';
  const iron = new THREE.MeshStandardMaterial({ color: 0x3c3a38, roughness: 0.5, metalness: 0.4 }); iron.name = 'metal';
  const prism = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffd27a, emissiveIntensity: 1.5, roughness: 0.2, metalness: 0, flatShading: true }); prism.name = 'prism';
  const facet = new THREE.MeshStandardMaterial({ color: 0xe0962e, emissive: 0xc8741c, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0, flatShading: true }); facet.name = 'prism_facet';
  [brass, blued, iron].forEach((m) => { m.side = THREE.DoubleSide; });

  const M = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const Z = (r1, r2, len, seg = 14, open = false) => { const geo = new THREE.CylinderGeometry(r1, r2, len, seg, 1, open); geo.rotateX(Math.PI / 2); return geo; }; // axis along Z, r1 at +Z? (rotateX(+90) sends +y to +z)
  const g = new THREE.Group();
  const root = new THREE.Group(); g.add(root);
  const Y = 0.145;

  // ---- stock: a heavy butt block, a tapering comb, the wrist and a pistol swell
  root.add(M(B(0.05, 0.13, 0.16), wood, 0, 0.088, 0.375, 0.08));                  // butt
  root.add(M(B(0.046, 0.05, 0.2), wood, 0, 0.128, 0.27, -0.12));                  // comb sloping to the wrist
  root.add(M(B(0.042, 0.05, 0.16), wood, 0, 0.07, 0.29, 0.28));                   // belly
  root.add(M(B(0.04, 0.042, 0.07), wood, 0, 0.112, 0.175));                       // wrist
  root.add(M(B(0.04, 0.075, 0.042), wood, 0, 0.065, 0.2, 0.35));                  // grip
  root.add(M(B(0.062, 0.162, 0.016), brass, 0, 0.085, 0.462, 0.08));             // butt plate
  root.add(M(B(0.066, 0.02, 0.05), brass, 0, 0.158, 0.44, -0.08));               // heel cap
  root.add(M(B(0.066, 0.02, 0.045), brass, 0, 0.018, 0.445, 0.3));               // toe cap
  root.add(M(B(0.046, 0.012, 0.046), brass, 0, 0.03, 0.212, 0.35));             // grip cap
  root.add(M(B(0.05, 0.05, 0.022), brass, 0, 0.112, 0.145));                     // wrist band

  // ---- receiver: low rear housing, tall front housing with side bosses
  root.add(M(B(0.054, 0.052, 0.05), brass, 0, 0.112, 0.11));
  root.add(M(B(0.016, 0.01, 0.01), iron, 0, 0.142, 0.125));                      // rear sight
  root.add(M(B(0.058, 0.085, 0.05), brass, 0, 0.132, -0.135));
  [-1, 1].forEach((s) => {
    root.add(M(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 14), brass, s * 0.034, 0.128, -0.135, 0, 0, Math.PI / 2));
    root.add(M(new THREE.CylinderGeometry(0.008, 0.008, 0.014, 10), iron, s * 0.036, 0.128, -0.135, 0, 0, Math.PI / 2));
  });
  root.add(M(new THREE.TorusGeometry(0.025, 0.0055, 6, 14, Math.PI), brass, 0, 0.09, 0.12, 0, Math.PI / 2, Math.PI));
  root.add(M(B(0.006, 0.026, 0.008), iron, 0, 0.076, 0.116, 0.35));

  // ---- lantern cage: two hexagonal rings and a centre ring, six bars at the hex corners
  const CZ = -0.012, R = 0.064, HL = 0.088;
  const ring = new THREE.TorusGeometry(R, 0.0075, 6, 6);                          // tubular 6 = hexagon
  [-HL, HL].forEach((dz) => root.add(M(ring, brass, 0, Y, CZ + dz, 0, 0, Math.PI / 6)));
  root.add(M(new THREE.TorusGeometry(R + 0.002, 0.0045, 5, 6), brass, 0, Y, CZ, 0, 0, Math.PI / 6));
  const barG = Z(0.0055, 0.0055, 2 * HL, 6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6 + Math.PI / 6;
    const x = Math.cos(a) * R, y = Math.sin(a) * R;
    root.add(M(barG, brass, x, Y + y, CZ));
    [-HL, HL].forEach((dz) => root.add(M(new THREE.SphereGeometry(0.0085, 8, 5), brass, x, Y + y, CZ + dz)));
  }
  // cone collars joining the cage to the receivers
  root.add(M(Z(0.03, 0.05, 0.03, 12, true), brass, 0, Y, CZ + HL + 0.012));
  root.add(M(Z(0.05, 0.03, 0.03, 12, true), brass, 0, Y, CZ - HL - 0.012));
  root.add(M(B(0.05, 0.012, 2 * HL), brass, 0, Y - R - 0.004, CZ));             // keel under the cage

  // ---- crystal
  const pj = new THREE.Group(); pj.position.set(0, Y, CZ); root.add(pj);
  const gem = (r, h, sel) => {
    const n = 8, pos = [], tipB = [0, 0, h], tipF = [0, 0, -h], ring0 = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, rr = r * (i % 2 ? 0.86 : 1); ring0.push([Math.cos(a) * rr, Math.sin(a) * rr, h * 0.08]); }
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      if (i % 2 === sel) pos.push(...tipB, ...ring0[j], ...ring0[i]);
      if ((i + 1) % 2 === sel) pos.push(...tipF, ...ring0[i], ...ring0[j]);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals(); return geo;
  };
  pj.add(M(gem(0.052, 0.082, 0), prism));
  pj.add(M(gem(0.052, 0.082, 1), facet));

  // ---- forend, barrel, rings, muzzle
  root.add(M(B(0.046, 0.04, 0.2), wood, 0, 0.11, -0.26));
  root.add(M(B(0.04, 0.03, 0.03), wood, 0, 0.112, -0.37, 0.5));
  root.add(M(Z(0.02, 0.02, 0.25, 14), blued, 0, Y, -0.275));
  [-0.18, -0.36].forEach((z) => root.add(M(new THREE.TorusGeometry(0.03, 0.009, 8, 18), brass, 0, Y - 0.006, z)));
  root.add(M(Z(0.029, 0.029, 0.07, 16, true), brass, 0, Y, -0.43));                 // shroud
  root.add(M(new THREE.TorusGeometry(0.029, 0.006, 6, 18), brass, 0, Y, -0.398));
  root.add(M(Z(0.029, 0.042, 0.03, 16, true), brass, 0, Y, -0.48));                 // bell flare: wide end toward -Z
  root.add(M(new THREE.TorusGeometry(0.041, 0.005, 6, 18), brass, 0, Y, -0.495));
  root.add(M(Z(0.016, 0.016, 0.06, 10, true), iron, 0, Y, -0.46));                  // bore
  [-1, 1].forEach((s) => [0.416, 0.432, 0.448].forEach((z) => root.add(M(B(0.006, 0.012, 0.009), iron, s * 0.0275, Y + 0.002, -z))));
  root.add(M(Z(0.009, 0.009, 0.08, 10), iron, 0, Y - 0.034, -0.425));            // under-tube
  root.add(M(B(0.005, 0.024, 0.016), brass, 0, Y + 0.038, -0.455));              // front sight

  const muzzle = new THREE.Group(); muzzle.position.set(0, Y, -0.497); root.add(muzzle);
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
