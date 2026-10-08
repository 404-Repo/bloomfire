// Quill, candidate 2: profiles. Body and head are lathes (a tapering teardrop body, a
// hooked beak lathe), the wings are layered extruded feather outlines fanned out from a
// swept wing arm, so each quill has a proper leaf-shaped silhouette.
export default function (THREE) {
  const ink = new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.25, metalness: 0 });
  const sheen = new THREE.MeshStandardMaterial({ color: 0x2b2a45, roughness: 0.32, metalness: 0 });
  const bone = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.6, metalness: 0, side: THREE.DoubleSide });
  const core = new THREE.MeshStandardMaterial({ color: 0xff3d8b, emissive: 0xff3d8b, emissiveIntensity: 2, roughness: 0.4 });
  core.name = 'core';
  const M = (geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
    const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(rx, ry, rz); return o;
  };
  const J = (parent, x, y, z) => { const o = new THREE.Group(); o.position.set(x, y, z); parent.add(o); return o; };
  const V = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.Group();
  const body = J(g, 0, 0.3, 0);
  const torso = new THREE.LatheGeometry(V([[0, -0.2], [0.06, -0.17], [0.1, -0.08], [0.12, 0.02], [0.1, 0.12], [0.06, 0.18], [0, 0.2]]), 12);
  torso.rotateX(Math.PI / 2 - 0.4);
  body.add(M(torso, ink));
  body.add(M(new THREE.SphereGeometry(0.07, 10, 8), core, 0, -0.05, 0.1, 1, 1.1, 0.6));
  const head = J(body, 0, 0.1, 0.16);
  head.add(M(new THREE.SphereGeometry(0.07, 10, 8), ink));
  const skull = new THREE.LatheGeometry(V([[0, 0], [0.05, -0.01], [0.075, -0.04], [0.08, -0.08]]), 12);
  skull.rotateX(Math.PI / 2);
  head.add(M(skull, bone, 0, 0.01, 0.075, 1, 1.05, 1));
  const beak = new THREE.LatheGeometry(V([[0.035, 0], [0.03, 0.06], [0.02, 0.13], [0.008, 0.19], [0, 0.21]]), 8);
  beak.rotateX(Math.PI / 2 + 0.5);
  head.add(M(beak, bone, 0, -0.025, 0.06, 1, 0.8, 1));
  const horn = new THREE.LatheGeometry(V([[0.018, 0], [0.012, 0.05], [0, 0.09]]), 6);
  head.add(M(horn, bone, 0.045, 0.05, -0.02, 1, 1, 1, -0.5, 0, -0.4));
  head.add(M(horn, bone, -0.045, 0.05, -0.02, 1, 1, 1, -0.5, 0, 0.4));
  head.add(M(new THREE.SphereGeometry(0.016, 6, 5), core, 0.034, 0.02, 0.07, 1.2, 0.8, 0.5));
  head.add(M(new THREE.SphereGeometry(0.016, 6, 5), core, -0.034, 0.02, 0.07, 1.2, 0.8, 0.5));
  // feather outline
  const fs = new THREE.Shape();
  fs.moveTo(0, 0); fs.quadraticCurveTo(0.045, 0.3, 0.012, 1.0); fs.lineTo(0, 1.04); fs.lineTo(-0.012, 1.0); fs.quadraticCurveTo(-0.045, 0.3, 0, 0);
  const feather = new THREE.ExtrudeGeometry(fs, { depth: 0.008, bevelEnabled: false, curveSegments: 4 });
  feather.translate(0, 0, -0.004);
  const tail = J(body, 0, -0.07, -0.16);
  for (let i = -2; i <= 2; i++) { const f = M(feather, i % 2 ? sheen : ink, 0, 0, 0, 1, 0.26, 1); f.rotation.set(-Math.PI / 2 - 0.4, 0, 0); f.rotateZ(i * 0.18); f.rotateX(0); tail.add(f); }
  [1, -1].forEach((s) => {
    body.add(M(new THREE.CylinderGeometry(0.018, 0.013, 0.18, 6), ink, 0.04 * s, -0.17, 0.0, 1, 1, 1, 0.25));
    for (let c = -1; c <= 1; c++) body.add(M(new THREE.ConeGeometry(0.008, 0.06, 4), bone, 0.04 * s + c * 0.015, -0.27, 0.03, 1, 1, 1, Math.PI - 0.6));
  });
  const joints = { body };
  [['wingL', 1], ['wingR', -1]].forEach(([n, s]) => {
    const w = J(body, 0.08 * s, 0.05, 0.03);
    // rest dihedral is baked into an inner group so the game's flap (rotation.z on w) adds to it
    const wi = J(w, 0, 0, 0); wi.rotation.z = 0.38 * s;
    const arm = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.2 * s, 0.05, 0.03), new THREE.Vector3(0.4 * s, 0.07, 0), new THREE.Vector3(0.6 * s, 0.08, -0.03)]);
    wi.add(M(new THREE.TubeGeometry(arm, 8, 0.022, 6, false), ink));
    for (let i = 0; i < 9; i++) {
      const t = i / 8, L = 0.22 + 0.24 * t + (i === 8 ? -0.03 : 0);
      const p = arm.getPointAt(Math.min(1, 0.12 + t * 0.88));
      const f = M(feather, i % 2 ? sheen : ink, p.x, p.y, p.z, 1, L, 1);
      f.rotation.set(-Math.PI / 2 + 0.1, 0, 0); f.rotateZ(s * (0.05 + t * 1.25)); wi.add(f);
    }
    joints[n] = w;
  });
  bone.side = THREE.DoubleSide; ink.side = THREE.DoubleSide; sheen.side = THREE.DoubleSide;
  g.userData.joints = joints;
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
