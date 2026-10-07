// Inkwell, candidate 2: profiles. The pot is one lathe (foot, round belly, neck, rolled lip,
// open and double-sided), the spire is a lathe with a dripping bulge where it spills over the
// lip, the thorn vine is a tube swept on a tapering helix with cones set along it, and each
// node is a glowing sphere seated in a lathe cup of ink.
export default function (THREE) {
//MATS
  const clay = new THREE.MeshStandardMaterial({ color: 0xc0603a, roughness: 0.85, metalness: 0, side: THREE.DoubleSide });
  clay.name = 'tile';
  const V = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.Group();
  const pot = J(g, 0, 0, 0);
  pot.add(M(new THREE.LatheGeometry(V([[0, 0], [0.62, 0], [0.7, 0.12], [0.95, 0.4], [1.12, 0.85], [1.14, 1.2], [1.0, 1.6], [0.75, 1.9], [0.64, 2.05], [0.68, 2.18], [0.78, 2.24], [0.74, 2.3], [0.6, 2.24]]), 20), clay));
  // cracks: thin dark lathe-cut strips set just off the belly
  const crackMat = ink;
  const crackGeo = new THREE.BoxGeometry(0.05, 1, 0.05);
  [[0.35, 1.3, 0.55, 0.2], [0.35, 0.75, 0.45, -0.45], [2.3, 1.2, 0.6, 0.3], [3.7, 1.1, 0.7, -0.2], [5.0, 1.4, 0.5, 0.4]].forEach(([a, y, h, tilt]) => {
    const r = 1.15 - Math.abs(y - 1.05) * 0.18;
    const c = M(crackGeo, crackMat, Math.sin(a) * r, y, Math.cos(a) * r, 1, h, 1, 0, a, tilt); pot.add(c);
  });
  pot.add(M(new THREE.LatheGeometry(V([[0, 0.05], [0.5, 0.045], [0.8, 0.02], [0.85, 0]]), 14), ink, 0.6, 0, 1.3, 1.1, 1, 0.7));
  pot.add(M(new THREE.CapsuleGeometry(0.1, 0.8, 3, 8), ink, 0.38, 0.6, 1.02, 1, 1, 0.6, -0.25, 0, 0.25));
  const spire = J(g, 0, 1.95, 0);
  // spire lathe, then bent into a slow S so it reads as a living thing, not a cone
  const spGeo = new THREE.LatheGeometry(V([[0.86, 0.22], [0.82, 0.3], [0.62, 0.38], [0.52, 0.7], [0.5, 1.2], [0.4, 2.0], [0.33, 2.6], [0.27, 3.2], [0.2, 3.9], [0.12, 4.5], [0.05, 4.95], [0.02, 5.1], [0, 5.15]]), 12, 0, Math.PI * 2);
  const bend = (y) => [0.18 * Math.sin(y * 0.75), -0.12 * Math.sin(y * 0.5 + 0.6)];
  const sp = spGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) { const y = sp.getY(i), [bx, bz] = bend(y); sp.setX(i, sp.getX(i) + bx * Math.min(1, y)); sp.setZ(i, sp.getZ(i) + bz * Math.min(1, y)); }
  spGeo.computeVertexNormals();
  spire.add(M(spGeo, ink));
  // drips over the lip
  const drip = new THREE.CapsuleGeometry(0.07, 0.3, 2, 6);
  [0.5, 1.9, 3.3, 4.6].forEach((a) => spire.add(M(drip, ink, Math.sin(a) * 0.78, 0.05, Math.cos(a) * 0.78)));
  // thorn vine on a helix
  const helix = [];
  for (let i = 0; i <= 30; i++) { const t = i / 30, y = 0.3 + t * 4.4, r = 0.62 - t * 0.5 + 0.12, a = t * Math.PI * 4.2, [bx, bz] = bend(y); helix.push(new THREE.Vector3(Math.sin(a) * r + bx, y, Math.cos(a) * r + bz)); }
  const curve = new THREE.CatmullRomCurve3(helix);
  spire.add(M(new THREE.TubeGeometry(curve, 90, 0.1, 6, false), ink));
  const thorn = new THREE.ConeGeometry(0.075, 0.42, 5);
  for (let i = 0; i < 30; i++) {
    const t = (i + 0.5) / 30, p = curve.getPointAt(t), out = new THREE.Vector3(p.x, 0, p.z).normalize();
    const side = (i % 2 ? 1 : -1);
    const dir = out.clone().multiplyScalar(0.7).add(new THREE.Vector3(0, side * 0.7, 0)).normalize();
    const th = M(thorn, ink, p.x + dir.x * 0.2, p.y + dir.y * 0.2, p.z + dir.z * 0.2);
    th.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); spire.add(th);
  }
  const cupGeo = new THREE.LatheGeometry(V([[0, -0.1], [0.2, -0.08], [0.3, 0.0], [0.32, 0.06]]), 10);
  const joints = { spire };
  [[1.2, 0.2, 0.34], [2.55, 2.5, 0.29], [3.75, 4.6, 0.24]].forEach(([h, a, r], i) => {
    const rad = 0.5 - (h / 4.5) * 0.36, [bx, bz] = bend(h);
    const node = J(spire, Math.sin(a) * (rad + 0.1) + bx, h, Math.cos(a) * (rad + 0.1) + bz);
    node.add(M(new THREE.SphereGeometry(r, 12, 9), core));
    const cup = M(cupGeo, ink, 0, 0, 0, r / 0.27, r / 0.27, r / 0.27); cup.rotation.set(Math.PI / 2, 0, 0); cup.rotation.y = 0;
    cup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.sin(a), 0, Math.cos(a)));
    cup.position.set(-Math.sin(a) * r * 0.5, 0, -Math.cos(a) * r * 0.5); node.add(cup);
    joints['node' + i] = node;
  });
  ink.side = THREE.DoubleSide;
  g.userData.joints = joints;
//PLACE
