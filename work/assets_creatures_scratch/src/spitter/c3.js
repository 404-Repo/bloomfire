// Spitter, candidate 3: hand-built and a different reading, closer to the reference's armour.
// A displaced icosphere body hunched up at the shoulders, a carapace of separate bevelled box
// plates in the sheen colour, a lumpy displaced sac with the core bulging out of it, a short
// heavy skull with curling horns (tubes) and a segmented tube of stacked rings.
export default function (THREE) {
//MATS
  const g = new THREE.Group();
  const lump = (r, det, amp, sx, sy, sz, seed) => {
    const geo = new THREE.IcosahedronGeometry(r, det), p = geo.attributes.position, q = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      q.fromBufferAttribute(p, i);
      const n = Math.sin(q.x * 9 + seed) * Math.sin(q.y * 7 + seed * 2) * Math.sin(q.z * 8 + seed * 3);
      q.multiplyScalar(1 + amp * n); q.set(q.x * sx, q.y * sy, q.z * sz);
      p.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); return geo;
  };
  const body = J(g, 0, 0.55, 0);
  const bg = lump(0.5, 2, 0.06, 1.05, 0.82, 1.22, 1);
  const bp = bg.attributes.position;
  for (let i = 0; i < bp.count; i++) { const z = bp.getZ(i), y = bp.getY(i); if (y > 0) bp.setY(i, y + 0.12 * Math.max(0, z) * (y / 0.4)); }
  bg.computeVertexNormals();
  body.add(M(bg, ink));
  const plate = new THREE.BoxGeometry(0.42, 0.08, 0.36);
  [[0.3, 0.32, 0.25, 0.1, -0.55], [-0.3, 0.32, 0.25, 0.1, 0.55], [0.38, 0.12, -0.2, 0, -0.9], [-0.38, 0.12, -0.2, 0, 0.9], [0, 0.42, 0.18, -0.25, 0], [0.42, -0.02, 0.28, 0, -1.2], [-0.42, -0.02, 0.28, 0, 1.2]].forEach(([x, y, z, rx, rz]) =>
    body.add(M(plate, sheen, x, y, z, 1, 1, 1, rx, 0, rz)));
  const legGeo = lump(0.2, 1, 0.08, 1, 1.4, 1.05, 4);
  const claw = new THREE.ConeGeometry(0.04, 0.12, 5);
  [[0.4, 0.33], [-0.4, 0.33], [0.4, -0.38], [-0.4, -0.38]].forEach(([x, z]) => {
    body.add(M(legGeo, ink, x, -0.3, z));
    body.add(M(new THREE.CylinderGeometry(0.17, 0.2, 0.12, 9), ink, x, -0.49, z + 0.02));
    for (let c = -1; c <= 1; c++) body.add(M(claw, bone, x + c * 0.08, -0.52, z + 0.22, 1, 1, 1, Math.PI / 2));
  });
  const sac = J(body, 0, 0.32, -0.2);
  sac.add(M(lump(0.42, 2, 0.05, 1, 1.0, 1.05, 7), sheen, 0, 0.36, 0));
  sac.add(M(new THREE.SphereGeometry(0.24, 12, 9), core, 0.0, 0.42, 0.24, 1.1, 1.1, 0.6));
  sac.add(M(new THREE.CylinderGeometry(0.28, 0.34, 0.12, 12), ink, 0, 0.02, 0));
  const skullG = J(body, 0, 0.06, 0.62);
  skullG.add(M(new THREE.SphereGeometry(0.22, 12, 9), ink, 0, 0, -0.08));
  skullG.add(M(new THREE.SphereGeometry(0.22, 14, 10, Math.PI / 2 - 1.2, 2.4, 0.2, 1.9), bone, 0, 0.03, 0.0, 1.05, 0.9, 1.15));
  skullG.add(M(new THREE.BoxGeometry(0.22, 0.1, 0.16), bone, 0, -0.1, 0.12));
  const hornCurve = (s) => new THREE.CatmullRomCurve3([new THREE.Vector3(0.14 * s, 0.1, 0), new THREE.Vector3(0.28 * s, 0.22, -0.05), new THREE.Vector3(0.3 * s, 0.38, 0.05), new THREE.Vector3(0.24 * s, 0.44, 0.14)]);
  [1, -1].forEach((s) => {
    const h = new THREE.TubeGeometry(hornCurve(s), 8, 0.045, 6, false);
    const p = h.attributes.position; // taper by ring
    for (let i = 0; i <= 8; i++) { const k = 1 - i / 9.5; const c = hornCurve(s).getPointAt(i / 8); for (let j = 0; j <= 6; j++) { const idx = i * 7 + j; p.setXYZ(idx, c.x + (p.getX(idx) - c.x) * k, c.y + (p.getY(idx) - c.y) * k, c.z + (p.getZ(idx) - c.z) * k); } }
    h.computeVertexNormals(); skullG.add(M(h, bone));
  });
  skullG.add(M(new THREE.SphereGeometry(0.04, 8, 6), core, 0.085, 0.07, 0.235, 1.2, 0.8, 0.5));
  skullG.add(M(new THREE.SphereGeometry(0.04, 8, 6), core, -0.085, 0.07, 0.235, 1.2, 0.8, 0.5));
  const tube = J(skullG, 0, -0.12, 0.2);
  for (let i = 0; i < 4; i++) tube.add(M(new THREE.CylinderGeometry(0.085 + (i === 3 ? 0.03 : 0), 0.09, 0.1, 10, 1, true), sheen, 0, 0, 0.06 + i * 0.105, 1, 1, 1, Math.PI / 2));
  tube.add(M(new THREE.TorusGeometry(0.11, 0.03, 6, 12), sheen, 0, 0, 0.42));
  sheen.side = THREE.DoubleSide;
  g.userData.joints = { body, sac, tube };
//PLACE
