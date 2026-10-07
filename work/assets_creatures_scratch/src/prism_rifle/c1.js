// Prism rifle, candidate 1: primitives. Box-and-cylinder stock with brass butt plate and
// corner caps, a brass receiver block, the prism cage as hexagonal brass bars around an
// octahedron crystal, iron barrel with brass bands, slotted brass muzzle shroud, trigger
// guard as a half torus, rivets on every band and plate. Muzzle points to -Z.
export default function (THREE) {
//RMATS
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
//PLACE
