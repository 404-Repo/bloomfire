// Smear, candidate 3: a different breakdown and reading. A gaunt skeletal husk: a beaded
// spine curve of ink vertebrae arching forward, a narrow ribcage of sheen arcs hung from it,
// a long skull-mask that juts ahead of the shoulders, and limbs made of tapered cones with
// knobbed joints and splayed hooked fingers. More negative space, a spikier silhouette.
export default function (THREE) {
//MATS
  const g = new THREE.Group();
  const bar = (parent, a, b, r0, r1, mat, sides = 7) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
    const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, L, sides), mat);
    o.position.copy(A).addScaledVector(d, 0.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parent.add(o); return o;
  };
  const knob = (parent, p, r, mat = ink) => parent.add(M(new THREE.SphereGeometry(r, 8, 6), mat, ...p));
  const body = J(g, 0, 0.98, 0);
  knob(body, [0, 0, 0], 0.15);
  body.children[0].scale.set(1.2, 0.75, 0.9);
  // spine: points arching forward and up
  const sp = [[0, 0, -0.02], [0, 0.18, -0.03], [0, 0.36, 0.02], [0, 0.52, 0.12], [0, 0.63, 0.25]];
  for (let i = 0; i < sp.length - 1; i++) bar(body, sp[i], sp[i + 1], 0.12 - i * 0.005, 0.13 - i * 0.005, ink, 10);
  sp.forEach((p, i) => knob(body, p, 0.13 + (i === 3 ? 0.05 : 0)));
  body.children.slice(-2, -1)[0].scale.set(1.35, 0.9, 1.0);
  // ribcage arcs (sheen) hanging off the spine
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.15 - i * 0.012, 0.017, 4, 12, Math.PI * 1.25), sheen);
    r.position.set(0, 0.48 - i * 0.08, 0.08 - i * 0.02); r.rotation.set(Math.PI / 2 - 0.5, 0, Math.PI / 2 - Math.PI * 0.625 + Math.PI / 2);
    r.scale.set(1, 1, 1); body.add(r);
  }
  // head: long skull mask
  const head = J(body, 0, 0.66, 0.3); head.rotation.x = 0.15;
  knob(head, [0, 0.08, 0.04], 0.12); head.children[0].scale.set(0.9, 1.15, 1.1);
  const skull = new THREE.SphereGeometry(0.13, 12, 9, Math.PI / 2 - 1.1, 2.2, 0.3, 2.3);
  head.add(M(skull, bone, 0, 0.07, 0.07, 0.88, 1.3, 1.05));
  head.add(M(new THREE.ConeGeometry(0.05, 0.08, 6), bone, 0, -0.06, 0.13, 1.4, 1, 0.8, Math.PI));
  head.add(M(new THREE.SphereGeometry(0.026, 8, 6), core, 0.045, 0.1, 0.2, 1.1, 0.8, 0.5));
  head.add(M(new THREE.SphereGeometry(0.026, 8, 6), core, -0.045, 0.1, 0.2, 1.1, 0.8, 0.5));
  const joints = { body, head };
  [['armL', 1], ['armR', -1]].forEach(([n, s]) => {
    const sh = J(body, 0.26 * s, 0.55, 0.14);
    knob(sh, [0, 0, 0], 0.08);
    const e = [0.1 * s, -0.42, 0.14], w = [0.08 * s, -0.86, 0.3];
    bar(sh, [0, 0, 0], e, 0.065, 0.045, ink); knob(sh, e, 0.05);
    bar(sh, e, w, 0.045, 0.03, ink); knob(sh, w, 0.045);
    for (let f = 0; f < 4; f++) {
      const a = (f - 1.5) * 0.04, tip1 = [w[0] + a * 1.5, w[1] - 0.12, w[2] + 0.08], tip2 = [w[0] + a * 2.2, w[1] - 0.24, w[2] + 0.06];
      bar(sh, w, tip1, 0.016, 0.012, ink, 5); bar(sh, tip1, tip2, 0.012, 0.003, ink, 5);
    }
    joints[n] = sh;
  });
  [['legL', 1], ['legR', -1]].forEach(([n, s]) => {
    const hip = J(body, 0.13 * s, -0.03, 0);
    const k = [0.04 * s, -0.44, 0.14], a = [0.05 * s, -0.88, -0.04];
    knob(hip, [0, 0, 0], 0.09); bar(hip, [0, 0, 0], k, 0.08, 0.06, ink); knob(hip, k, 0.065);
    bar(hip, k, a, 0.06, 0.04, ink); knob(hip, a, 0.05);
    hip.add(M(new THREE.SphereGeometry(0.06, 8, 6), ink, 0.05 * s, -0.92, 0.06, 0.9, 0.5, 2.0));
    joints[n] = hip;
  });
  g.userData.joints = joints;
//PLACE
