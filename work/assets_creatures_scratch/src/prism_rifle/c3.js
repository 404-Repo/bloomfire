// Prism rifle, candidate 3: a different breakdown. The prism is a hand-built faceted crystal
// (hexagonal bipyramid with a twisted crown, written as a BufferGeometry), held in a round
// brass cage of four curved hoops and longitudinal ribs (tori and bars) rather than a hex frame;
// the stock is two stacked bevelled boxes plus a rounded grip; a heavier ribbed barrel jacket.
export default function (THREE) {
//RMATS
  const g = new THREE.Group();
  const root = J(g, 0, 0, 0);
  const Y = 0.13;
  const rbox = (w, h, d, mat, x, y, z, rx = 0) => root.add(M(new THREE.CapsuleGeometry(Math.min(w, h) / 2, Math.max(0.001, d - Math.min(w, h)), 2, 8), mat, x, y, z, w / Math.min(w, h), 1, h / Math.min(w, h), Math.PI / 2 + rx));
  rbox(0.044, 0.15, 0.2, wood, 0, 0.078, 0.37, -0.12);
  rbox(0.04, 0.055, 0.2, wood, 0, 0.117, 0.2, -0.18);
  rbox(0.034, 0.05, 0.08, wood, 0, Y - 0.06, 0.15, 1.0);
  root.add(M(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 12), brass, 0, 0.085, 0.475, 1, 5.4, 1.0, Math.PI / 2 - 0.12));
  root.add(M(new THREE.CylinderGeometry(0.03, 0.033, 0.07, 12), brass, 0, Y - 0.005, 0.1, 1, 1, 1, Math.PI / 2));
  root.add(M(new THREE.CylinderGeometry(0.033, 0.03, 0.06, 12), brass, 0, Y - 0.005, -0.1, 1, 1, 1, Math.PI / 2));
  // round cage: hoops + ribs
  const hoop = new THREE.TorusGeometry(0.058, 0.006, 6, 18);
  [-0.06, 0, 0.06].forEach((z) => root.add(M(hoop, brass, 0, Y + 0.02, z, 1, 1, 1)));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    root.add(M(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 5), brass, Math.cos(a) * 0.058, Y + 0.02 + Math.sin(a) * 0.058, 0, 1, 1, 1, Math.PI / 2));
    root.add(M(rivet, brass, Math.cos(a) * 0.062, Y + 0.02 + Math.sin(a) * 0.062, 0));
  }
  const pj = J(root, 0, Y + 0.02, 0);
  const pos = [], idx = [], n = 6;
  pos.push(0, 0, -0.065); // tip toward muzzle
  for (let ring = 0; ring < 2; ring++) for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + ring * 0.35; const r = ring ? 0.036 : 0.04; pos.push(Math.cos(a) * r, Math.sin(a) * r, ring ? 0.02 : -0.02); }
  pos.push(0, 0, 0.055);
  for (let i = 0; i < n; i++) { const a = 1 + i, b = 1 + (i + 1) % n, c = 1 + n + i, d = 1 + n + (i + 1) % n; idx.push(0, b, a, a, b, d, a, d, c, c, d, 2 * n + 1); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.setIndex(idx);
  cg.computeVertexNormals();
  pj.add(new THREE.Mesh(cg, prism));
  root.add(M(new THREE.TorusGeometry(0.028, 0.006, 5, 10, Math.PI), brass, 0, Y - 0.04, 0.06, 1, 1, 1, 0, Math.PI / 2, Math.PI));
  root.add(M(new THREE.BoxGeometry(0.006, 0.03, 0.008), iron, 0, Y - 0.055, 0.06, 1, 1, 1, 0.3));
  rbox(0.042, 0.035, 0.24, wood, 0, Y - 0.032, -0.25, 0);
  root.add(M(new THREE.CylinderGeometry(0.022, 0.022, 0.34, 12), iron, 0, Y + 0.004, -0.3, 1, 1, 1, Math.PI / 2));
  for (let i = 0; i < 6; i++) root.add(M(new THREE.TorusGeometry(0.023, 0.004, 4, 12), brass, 0, Y + 0.004, -0.15 - i * 0.04));
  root.add(M(new THREE.CylinderGeometry(0.034, 0.03, 0.09, 12), brass, 0, Y + 0.004, -0.44, 1, 1, 1, Math.PI / 2));
  root.add(M(new THREE.TorusGeometry(0.032, 0.007, 6, 12), brass, 0, Y + 0.004, -0.485));
  [-1, 1].forEach((s) => root.add(M(new THREE.BoxGeometry(0.006, 0.012, 0.05), iron, 0.033 * s, Y + 0.004, -0.44)));
  root.add(M(new THREE.BoxGeometry(0.006, 0.02, 0.012), brass, 0, Y + 0.045, -0.47));
  const muzzle = J(root, 0, Y + 0.004, -0.492);
  g.userData.joints = { prism: pj, muzzle };
//PLACE
