// Inkhorn, candidate 1: primitives. Barrel chest of ink spheres, sheen armour as half-sphere
// pauldrons, a chest plate and bracers (boxes and open cylinders), bone skull with lower
// jaw tusks and curved horns (torus arcs), glowing chest core, huge fists, bone toe claws.
export default function (THREE) {
//MATS
  const g = new THREE.Group();
  const body = J(g, 0, 1.1, 0);
  body.add(M(new THREE.SphereGeometry(0.42, 12, 9), ink, 0, 0.05, 0, 1.15, 0.8, 0.85));        // pelvis
  body.add(M(new THREE.SphereGeometry(0.62, 14, 10), ink, 0, 0.85, 0.02, 1.15, 1.0, 0.8));      // chest
  body.add(M(new THREE.BoxGeometry(0.95, 0.55, 0.22), sheen, 0, 1.05, 0.42, 1, 1, 1, -0.12));    // chest plate
  body.add(M(new THREE.BoxGeometry(0.75, 0.32, 0.2), sheen, 0, 0.55, 0.4, 1, 1, 1, 0.08));       // belly plate
  body.add(M(new THREE.BoxGeometry(0.9, 0.7, 0.2), sheen, 0, 0.95, -0.42, 1, 1, 1, 0.1));        // back plate
  body.add(M(new THREE.SphereGeometry(0.16, 12, 9), core, 0, 0.82, 0.52, 1, 1.1, 0.55));
  const head = J(body, 0, 1.45, 0.18);
  head.add(M(new THREE.SphereGeometry(0.26, 12, 9), ink, 0, 0.12, -0.08));
  head.add(M(new THREE.SphereGeometry(0.25, 14, 10, Math.PI / 2 - 1.15, 2.3, 0.2, 1.9), bone, 0, 0.17, 0.0, 1, 1.0, 1.05));
  head.add(M(new THREE.BoxGeometry(0.28, 0.14, 0.18), bone, 0, -0.02, 0.15));
  [1, -1].forEach((s) => {
    head.add(M(new THREE.ConeGeometry(0.035, 0.18, 6), bone, 0.1 * s, -0.12, 0.22, 1, 1, 1, Math.PI));
    const horn = new THREE.TorusGeometry(0.3, 0.06, 6, 10, 2.0);
    head.add(M(horn, bone, 0.12 * s, 0.3, -0.05, s, 1, 1, 0, s * 0.3, s > 0 ? -0.35 : 0.35));
    head.add(M(new THREE.SphereGeometry(0.045, 8, 6), core, 0.09 * s, 0.17, 0.24, 1.2, 0.8, 0.5));
  });
  const joints = { body, head };
  [['armL', 1], ['armR', -1]].forEach(([n, s]) => {
    const sh = J(body, 0.78 * s, 1.18, 0);
    sh.add(M(new THREE.SphereGeometry(0.42, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), sheen, 0.04 * s, 0.05, 0, 1.1, 0.9, 1.1, 0, 0, -0.35 * s));
    sh.add(M(new THREE.SphereGeometry(0.3, 10, 8), ink));
    sh.add(M(new THREE.CylinderGeometry(0.24, 0.2, 0.6, 10), ink, 0.08 * s, -0.4, 0.02));
    sh.add(M(new THREE.SphereGeometry(0.22, 10, 8), ink, 0.1 * s, -0.72, 0.04));
    sh.add(M(new THREE.CylinderGeometry(0.28, 0.24, 0.55, 10), ink, 0.1 * s, -1.0, 0.06));
    sh.add(M(new THREE.CylinderGeometry(0.31, 0.31, 0.38, 10, 1, true), sheen, 0.1 * s, -0.98, 0.06));
    sh.add(M(new THREE.BoxGeometry(0.5, 0.42, 0.52), ink, 0.1 * s, -1.42, 0.08));            // fist
    sh.add(M(new THREE.BoxGeometry(0.52, 0.12, 0.2), sheen, 0.1 * s, -1.34, 0.3));            // knuckle plate
    joints[n] = sh;
  });
  [['legL', 1], ['legR', -1]].forEach(([n, s]) => {
    const hip = J(body, 0.3 * s, 0, 0);
    hip.add(M(new THREE.CylinderGeometry(0.27, 0.22, 0.6, 10), ink, 0.04 * s, -0.32, 0));
    hip.add(M(new THREE.SphereGeometry(0.2, 10, 8), sheen, 0.05 * s, -0.62, 0.1, 1, 1, 0.8));  // knee guard
    hip.add(M(new THREE.CylinderGeometry(0.21, 0.25, 0.45, 10), ink, 0.05 * s, -0.85, 0));
    hip.add(M(new THREE.SphereGeometry(0.28, 10, 6), ink, 0.05 * s, -1.05, 0.08, 1, 0.45, 1.3));
    for (let c = -1; c <= 1; c++) hip.add(M(new THREE.ConeGeometry(0.05, 0.18, 6), bone, 0.05 * s + c * 0.13, -1.05, 0.42, 1, 1, 1, Math.PI / 2));
    joints[n] = hip;
  });
  g.userData.joints = joints;
//PLACE
