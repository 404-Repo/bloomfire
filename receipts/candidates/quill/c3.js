// Quill, candidate 3: hand-built and a different reading, a bat-winged ink wraith. Each wing
// is one hand-built BufferGeometry membrane spanned between three finger struts, its
// trailing edge cut into quill points, with a raised leading edge bone-hook at the wrist.
// Body is a capsule hunched under a long skull-mask with a downturned beak.
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
  const g = new THREE.Group();
  const body = J(g, 0, 0.3, 0);
  body.add(M(new THREE.CapsuleGeometry(0.085, 0.16, 4, 10), ink, 0, 0, 0, 1, 1, 1, Math.PI / 2 - 0.45));
  body.add(M(new THREE.SphereGeometry(0.05, 10, 8), core, 0, -0.03, 0.1, 1, 1.1, 0.6));
  const head = J(body, 0, 0.09, 0.15);
  head.add(M(new THREE.SphereGeometry(0.07, 10, 8), ink));
  head.add(M(new THREE.SphereGeometry(0.075, 12, 9, Math.PI / 2 - 1.2, 2.4, 0.15, 2.2), bone, 0, 0.0, 0.015, 1, 1.05, 1.25));
  const beak = new THREE.ConeGeometry(0.03, 0.19, 7); beak.translate(0, 0.095, 0);
  head.add(M(beak, bone, 0, -0.03, 0.07, 1, 1, 0.7, Math.PI / 2 + 0.55));
  head.add(M(new THREE.ConeGeometry(0.016, 0.08, 6), bone, 0.04, 0.07, -0.03, 1, 1, 1, -0.6, 0, -0.35));
  head.add(M(new THREE.ConeGeometry(0.016, 0.08, 6), bone, -0.04, 0.07, -0.03, 1, 1, 1, -0.6, 0, 0.35));
  head.add(M(new THREE.SphereGeometry(0.016, 6, 5), core, 0.033, 0.02, 0.085, 1.2, 0.8, 0.5));
  head.add(M(new THREE.SphereGeometry(0.016, 6, 5), core, -0.033, 0.02, 0.085, 1.2, 0.8, 0.5));
  // tail: a membrane triangle
  const tailGeo = new THREE.BufferGeometry();
  tailGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.08, -0.03, -0.24, 0, -0.02, -0.18, 0, 0, 0, 0, -0.02, -0.18, -0.08, -0.03, -0.24], 3));
  tailGeo.computeVertexNormals();
  body.add(M(tailGeo, sheen, 0, -0.04, -0.12));
  [1, -1].forEach((s) => {
    body.add(M(new THREE.CylinderGeometry(0.018, 0.013, 0.18, 6), ink, 0.04 * s, -0.17, -0.01, 1, 1, 1, 0.25));
    for (let c = -1; c <= 1; c++) body.add(M(new THREE.ConeGeometry(0.008, 0.06, 4), bone, 0.04 * s + c * 0.015, -0.27, 0.02, 1, 1, 1, Math.PI - 0.6));
  });
  const joints = { body };
  [['wingL', 1], ['wingR', -1]].forEach(([n, s]) => {
    const w = J(body, 0.07 * s, 0.05, 0.03);
    // arm: shoulder -> elbow -> wrist, then three fingers
    const sh = [0, 0, 0], el = [0.17 * s, 0.07, -0.03], wr = [0.3 * s, 0.1, 0.0];
    const tips = [[0.58 * s, 0.14, -0.06], [0.5 * s, 0.04, -0.22], [0.36 * s, 0.0, -0.3]];
    const strut = (a, b, r) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
      const o = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.6, r, d.length(), 5), ink); o.position.copy(A).addScaledVector(d, 0.5);
      o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); w.add(o); };
    strut(sh, el, 0.026); strut(el, wr, 0.02); tips.forEach((t) => strut(wr, t, 0.012));
    // membrane: fan from wrist + elbow + shoulder to a scalloped trailing edge
    const edge = [tips[0]];
    const pts = [tips[0], tips[1], tips[2], [0.16 * s, -0.02, -0.26], [0.04 * s, -0.02, -0.18]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.01, (a[2] + b[2]) / 2];
      // pull the midpoint in toward the wrist so the edge is scalloped into points
      const k = 0.28; const inn = [mid[0] + (wr[0] - mid[0]) * k, mid[1], mid[2] + (wr[2] - mid[2]) * k];
      edge.push(inn, b);
    }
    const pos = [];
    for (let i = 0; i < edge.length - 1; i++) {
      const hub = i < 6 ? wr : (i < 8 ? el : sh);
      pos.push(...hub, ...edge[i], ...edge[i + 1]);
    }
    pos.push(...wr, ...el, ...pts[3]); pos.push(...el, ...sh, ...pts[4]); pos.push(...el, ...pts[4], ...pts[3]);
    const mem = new THREE.BufferGeometry(); mem.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); mem.computeVertexNormals();
    w.add(new THREE.Mesh(mem, sheen));
    w.add(M(new THREE.ConeGeometry(0.014, 0.07, 5), bone, wr[0] + 0.01 * s, wr[1] + 0.04, wr[2], 1, 1, 1, 0, 0, -0.4 * s));
    joints[n] = w;
  });
  sheen.side = THREE.DoubleSide;
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
