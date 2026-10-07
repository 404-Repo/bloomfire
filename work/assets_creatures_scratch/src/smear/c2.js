// Smear, candidate 2: sweeps. Every limb is one continuous tapered tube swept along a bent
// curve (TubeGeometry re-radiused ring by ring), the torso is a lathe with a sunken waist and
// a hunched chest, the mask is a lathe cup. Reads as one wet, stretched husk.
export default function (THREE) {
//MATS
  const V2 = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const V3 = (a) => a.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const tube = (pts, radii, segs = 14, rad = 7) => {
    const curve = new THREE.CatmullRomCurve3(V3(pts));
    const geo = new THREE.TubeGeometry(curve, segs, 1, rad, false);
    const p = geo.attributes.position, c = new THREE.Vector3(), q = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      const t = i / segs; curve.getPointAt(t, c);
      const f = t * (radii.length - 1), k = Math.min(radii.length - 2, Math.floor(f));
      const r = radii[k] + (radii[k + 1] - radii[k]) * (f - k);
      for (let j = 0; j <= rad; j++) {
        const idx = i * (rad + 1) + j; q.fromBufferAttribute(p, idx).sub(c).multiplyScalar(r).add(c); p.setXYZ(idx, q.x, q.y, q.z);
      }
    }
    geo.computeVertexNormals();
    return geo;
  };
  const cap = (geo, mat, at, r) => M(new THREE.SphereGeometry(r, 7, 5), mat, ...at);
  const g = new THREE.Group();
  const body = J(g, 0, 0.98, 0);
  // torso lathe, tilted forward
  const torso = new THREE.LatheGeometry(V2([[0, -0.08], [0.16, -0.04], [0.19, 0.06], [0.14, 0.22], [0.15, 0.36], [0.22, 0.5], [0.23, 0.6], [0.17, 0.7], [0.07, 0.76], [0, 0.77]]), 12);
  const spine = J(body, 0, 0, 0); spine.rotation.x = 0.6;
  spine.add(M(torso, ink, 0, 0, 0, 1.15, 1, 0.75));
  // sheen rib plates as flattened lathe rings
  for (let i = 0; i < 3; i++) spine.add(M(new THREE.TorusGeometry(0.17 - i * 0.015, 0.018, 4, 12, Math.PI * 1.1), sheen, 0, 0.5 - i * 0.08, 0.02, 1.15, 0.8, 1, Math.PI / 2, 0, -0.15));
  // head
  const head = J(spine, 0, 0.74, 0.05); head.rotation.x = -0.4;
  head.add(M(tube([[0, -0.04, -0.02], [0, 0.04, 0.02], [0, 0.1, 0.06]], [0.06, 0.05, 0.06], 4, 6), ink));
  head.add(M(new THREE.SphereGeometry(0.13, 12, 10), ink, 0, 0.17, 0.07, 0.9, 1.15, 1.0));
  const mask = new THREE.LatheGeometry(V2([[0, 0], [0.06, -0.01], [0.1, -0.035], [0.125, -0.075], [0.13, -0.12]]), 12);
  mask.rotateX(Math.PI / 2);
  head.add(M(mask, bone, 0, 0.17, 0.2, 0.9, 1.25, 1));
  head.add(M(new THREE.SphereGeometry(0.024, 8, 6), core, 0.045, 0.19, 0.192, 1.2, 0.8, 0.5));
  head.add(M(new THREE.SphereGeometry(0.024, 8, 6), core, -0.045, 0.19, 0.192, 1.2, 0.8, 0.5));
  const joints = { body, head };
  // arms: one sweep from shoulder to fingertips, in body space after undoing the hunch
  [['armL', 1], ['armR', -1]].forEach(([n, s]) => {
    const sh = J(spine, 0.24 * s, 0.6, 0.0); sh.rotation.x = -0.6;
    sh.add(cap(null, ink, [0, 0, 0], 0.08));
    sh.add(M(tube([[0, 0, 0], [0.06 * s, -0.25, 0.08], [0.08 * s, -0.5, 0.12], [0.07 * s, -0.75, 0.26], [0.05 * s, -0.98, 0.36]], [0.07, 0.055, 0.045, 0.04, 0.032]), ink));
    for (let f = 0; f < 4; f++) {
      const a = (f - 1.5) * 0.035;
      sh.add(M(tube([[0.05 * s + a, -0.98, 0.36], [0.05 * s + a * 1.6, -1.08, 0.42], [0.05 * s + a * 2, -1.17, 0.4]], [0.018, 0.012, 0.003], 5, 4), ink));
    }
    joints[n] = sh;
  });
  // legs: one sweep hip-knee-ankle-toe
  [['legL', 1], ['legR', -1]].forEach(([n, s]) => {
    const hip = J(body, 0.12 * s, -0.03, 0);
    hip.add(M(tube([[0, 0.03, 0], [0.03 * s, -0.25, 0.08], [0.04 * s, -0.47, 0.13], [0.04 * s, -0.72, 0.02], [0.04 * s, -0.93, -0.06], [0.04 * s, -0.96, 0.08], [0.04 * s, -0.96, 0.17]], [0.1, 0.085, 0.065, 0.055, 0.05, 0.045, 0.035], 16), ink));
    joints[n] = hip;
  });
  // drip strands off the arms and torso
  const drip = new THREE.ConeGeometry(0.02, 0.12, 5);
  spine.add(M(drip, ink, 0.17, 0.3, 0.05, 1, 1, 1, Math.PI + 0.6));
  spine.add(M(drip, ink, -0.15, 0.2, 0.08, 1, 1, 1, Math.PI + 0.6));
  g.userData.joints = joints;
//PLACE
