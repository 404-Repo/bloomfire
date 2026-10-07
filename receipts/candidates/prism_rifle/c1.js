// Prism rifle, candidate 1: primitives. Box-and-cylinder stock with brass butt plate and
// corner caps, a brass receiver block, the prism cage as hexagonal brass bars around an
// octahedron crystal, iron barrel with brass bands, slotted brass muzzle shroud, trigger
// guard as a half torus, rivets on every band and plate. Muzzle points to -Z.
export default function (THREE) {
  const brass = new THREE.MeshStandardMaterial({ color: 0xb8913a, roughness: 0.35, metalness: 0.8 }); brass.name = 'metal';
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.7, metalness: 0 }); wood.name = 'timber';
  const iron = new THREE.MeshStandardMaterial({ color: 0x3c3a38, roughness: 0.5, metalness: 0.6 });
  const prism = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffd27a, emissiveIntensity: 1.6, roughness: 0.2, metalness: 0, flatShading: true }); prism.name = 'prism';
  const M = (geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
    const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(rx, ry, rz); return o;
  };
  const J = (parent, x, y, z) => { const o = new THREE.Group(); o.position.set(x, y, z); parent.add(o); return o; };
  const rivet = new THREE.SphereGeometry(0.0055, 6, 4);
  const g = new THREE.Group();
  const root = J(g, 0, 0, 0);
  const Y = 0.13; // bore height
  // stock: butt block, wrist, comb
  root.add(M(new THREE.BoxGeometry(0.045, 0.15, 0.2), wood, 0, 0.075, 0.37, 1, 1, 1, -0.12));
  root.add(M(new THREE.BoxGeometry(0.04, 0.055, 0.18), wood, 0, 0.115, 0.2, 1, 1, 1, -0.2));
  root.add(M(new THREE.BoxGeometry(0.05, 0.16, 0.018), brass, 0, 0.09, 0.475, 1, 1, 1, -0.12));
  [[0.02, 0.43], [0.155, 0.45]].forEach(([y, z]) => root.add(M(new THREE.BoxGeometry(0.052, 0.03, 0.05), brass, 0, y, z, 1, 1, 1, -0.12)));
  // receiver
  root.add(M(new THREE.BoxGeometry(0.05, 0.06, 0.08), brass, 0, Y - 0.01, 0.11));
  root.add(M(new THREE.BoxGeometry(0.052, 0.05, 0.05), brass, 0, Y - 0.005, -0.1));
  // cage: two hexagonal side frames joined by bars
  const hexPts = [];
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; hexPts.push([Math.sin(a) * 0.075 * 1.25, Math.cos(a) * 0.06]); }
  const bar = (a, b, r) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const o = new THREE.Mesh(new THREE.BoxGeometry(r, d.length(), r), brass); o.position.copy(A).addScaledVector(d, 0.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); root.add(o); };
  [0.034, -0.034].forEach((x) => hexPts.forEach((p, i) => { const q = hexPts[(i + 1) % 6]; bar([x, Y + 0.02 + p[1], p[0]], [x, Y + 0.02 + q[1], q[0]], 0.012); }));
  hexPts.forEach((p) => bar([0.034, Y + 0.02 + p[1], p[0]], [-0.034, Y + 0.02 + p[1], p[0]], 0.009));
  hexPts.forEach((p) => root.add(M(rivet, brass, 0.041, Y + 0.02 + p[1], p[0])));
  hexPts.forEach((p) => root.add(M(rivet, brass, -0.041, Y + 0.02 + p[1], p[0])));
  const pj = J(root, 0, Y + 0.02, 0);
  pj.add(M(new THREE.OctahedronGeometry(0.05, 0), prism, 0, 0, 0, 0.55, 0.85, 1.25));
  // trigger + guard
  root.add(M(new THREE.TorusGeometry(0.03, 0.006, 5, 10, Math.PI), brass, 0, Y - 0.04, 0.09, 1, 1, 1, 0, Math.PI / 2, Math.PI));
  root.add(M(new THREE.BoxGeometry(0.006, 0.03, 0.008), iron, 0, Y - 0.055, 0.09, 1, 1, 1, 0.3));
  // forend + barrel
  root.add(M(new THREE.BoxGeometry(0.044, 0.035, 0.24), wood, 0, Y - 0.03, -0.24));
  root.add(M(new THREE.CylinderGeometry(0.018, 0.018, 0.36, 12), iron, 0, Y + 0.003, -0.3, 1, 1, 1, Math.PI / 2));
  [-0.13, -0.36].forEach((z) => {
    root.add(M(new THREE.CylinderGeometry(0.03, 0.03, 0.028, 12), brass, 0, Y - 0.01, z, 1.0, 1.4, 1, Math.PI / 2));
    root.add(M(rivet, brass, 0.031, Y - 0.01, z)); root.add(M(rivet, brass, -0.031, Y - 0.01, z));
  });
  // muzzle shroud with slots
  root.add(M(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 12, 1, true), brass, 0, Y + 0.003, -0.43, 1, 1, 1, Math.PI / 2));
  root.add(M(new THREE.TorusGeometry(0.03, 0.007, 6, 12), brass, 0, Y + 0.003, -0.48));
  root.add(M(new THREE.TorusGeometry(0.03, 0.006, 6, 12), brass, 0, Y + 0.003, -0.38));
  [-1, 1].forEach((s) => root.add(M(new THREE.BoxGeometry(0.004, 0.012, 0.06), iron, 0.029 * s, Y + 0.003, -0.43)));
  root.add(M(new THREE.BoxGeometry(0.006, 0.02, 0.012), brass, 0, Y + 0.04, -0.465));
  brass.side = THREE.DoubleSide;
  const muzzle = J(root, 0, Y + 0.003, -0.487);
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
  const ctr = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= ctr.x; o.position.y -= box.min.y; o.position.z -= ctr.z; });
  return g;
}
