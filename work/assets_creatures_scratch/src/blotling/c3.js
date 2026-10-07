// Blotling, candidate 3: hand-built geometry, a different reading. One displaced icosphere
// for the whole blob (sagging belly drips and a lumpy back pushed into the vertices), an
// extruded flat skull-mask plate with eye holes bent around the face, stubby legs that are
// capsules whose lower vertices are pushed out into splayed puddle feet.
export default function (THREE) {
//MATS
  const g = new THREE.Group();
  const body = J(g, 0, 0.32, 0);
  const blob = new THREE.IcosahedronGeometry(0.26, 3);
  const p = blob.attributes.position, q = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    q.fromBufferAttribute(p, i);
    let { x, y, z } = q;
    x *= 0.95; y *= 0.72; z *= 1.3;
    // lumpy back plates
    if (y > 0) y += 0.025 * Math.max(0, Math.sin(x * 22) * Math.sin(z * 16));
    // belly drips pulled down in a few spots
    if (y < -0.05) {
      const d = Math.sin(x * 13 + 1.0) * Math.sin(z * 11 + 0.4);
      if (d > 0.55) y -= (d - 0.55) * 0.35;
    }
    p.setXYZ(i, x, y, z);
  }
  blob.computeVertexNormals();
  body.add(M(blob, ink, 0, 0, -0.03));
  // sheen shell (the plates read as a dark blue-violet cap)
  const cap = new THREE.SphereGeometry(0.24, 12, 5, 0, Math.PI * 2, 0, 1.0);
  body.add(M(cap, sheen, 0, 0.0, -0.08, 0.98, 0.85, 1.22));
  // head bulge
  body.add(M(new THREE.SphereGeometry(0.15, 12, 9), ink, 0, 0.0, 0.27));
  // mask: extruded outline with eye holes, then bent round the face
  const s = new THREE.Shape();
  s.moveTo(0, 0.14); s.bezierCurveTo(0.12, 0.14, 0.15, 0.05, 0.14, -0.02);
  s.bezierCurveTo(0.13, -0.09, 0.07, -0.13, 0, -0.14);
  s.bezierCurveTo(-0.07, -0.13, -0.13, -0.09, -0.14, -0.02);
  s.bezierCurveTo(-0.15, 0.05, -0.12, 0.14, 0, 0.14);
  const hole = (cx) => { const h = new THREE.Path(); h.absellipse(cx, 0.01, 0.035, 0.025, 0, Math.PI * 2, true, 0); return h; };
  s.holes.push(hole(0.06), hole(-0.06));
  const maskGeo = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1, curveSegments: 6 });
  const mp = maskGeo.attributes.position;
  for (let i = 0; i < mp.count; i++) mp.setZ(i, mp.getZ(i) - 2.2 * mp.getX(i) ** 2 - 0.9 * Math.max(0, -mp.getY(i)) ** 2);
  maskGeo.computeVertexNormals();
  body.add(M(maskGeo, bone, 0, 0.01, 0.43));
  const eye = new THREE.SphereGeometry(0.03, 8, 6);
  body.add(M(eye, core, 0.06, 0.02, 0.425, 1.1, 0.8, 0.6));
  body.add(M(eye, core, -0.06, 0.02, 0.425, 1.1, 0.8, 0.6));
  // legs: capsules with splayed feet
  const legGeo = new THREE.CapsuleGeometry(0.055, 0.18, 3, 8);
  const lp = legGeo.attributes.position;
  for (let i = 0; i < lp.count; i++) {
    const y = lp.getY(i), k = y < -0.07 ? 1 + (-0.07 - y) * 9 : 1;
    lp.setX(i, lp.getX(i) * k); lp.setZ(i, lp.getZ(i) * k * 1.15);
    if (y < -0.1) lp.setY(i, -0.1 + (y + 0.1) * 0.4);
  }
  legGeo.translate(0, -0.12, 0);
  legGeo.computeVertexNormals();
  const joints = { body };
  [['legFL', 0.17, 0.2], ['legFR', -0.17, 0.2], ['legBL', 0.17, -0.22], ['legBR', -0.17, -0.22]].forEach(([n, x, z]) => {
    const hip = J(body, x, -0.06, z);
    hip.add(M(legGeo, ink, 0, 0, 0, 1, 1, 1, 0, 0, x > 0 ? 0.2 : -0.2));
    joints[n] = hip;
  });
  g.userData.joints = joints;
//PLACE
