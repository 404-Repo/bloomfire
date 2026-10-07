// Inkwell, candidate 1: primitives. A terracotta pot from a partial sphere with a torus lip,
// cracks as thin ink wedges, an ink spire of stacked tapering cones leaning slightly, thorn
// vines as torus arcs studded with cones, three magenta nodes in ink cradles, an ink spill.
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
  const clay = new THREE.MeshStandardMaterial({ color: 0xc0603a, roughness: 0.85, metalness: 0, side: THREE.DoubleSide });
  clay.name = 'tile';
  const g = new THREE.Group();
  const pot = J(g, 0, 0, 0);
  pot.add(M(new THREE.SphereGeometry(1.15, 18, 12, 0, Math.PI * 2, 0.55, Math.PI - 0.55), clay, 0, 1.05, 0, 1, 0.9, 1));
  pot.add(M(new THREE.CylinderGeometry(0.62, 0.66, 0.3, 18, 1, true), clay, 0, 2.05, 0));
  pot.add(M(new THREE.TorusGeometry(0.66, 0.1, 6, 18), clay, 0, 2.2, 0, 1, 1, 1, Math.PI / 2));
  pot.add(M(new THREE.CylinderGeometry(0.6, 0.7, 0.14, 14), clay, 0, 0.07, 0));
  // cracks: ink wedges lying on the surface
  const crack = new THREE.BoxGeometry(0.06, 0.7, 0.05);
  [[0.4, 1.25, 1.02, 0.4, 0.35], [0.55, 0.75, 0.92, 0.5, -0.4], [-0.85, 1.2, 0.68, -0.85, 0.2], [-0.2, 1.0, -1.12, 3.0, 0.3], [0.95, 1.3, -0.5, 2.1, -0.3]].forEach(([x, y, z, ry, rz]) =>
    pot.add(M(crack, ink, x, y, z, 1, 1, 1, 0, ry, rz)));
  // ink spill out of a crack
  pot.add(M(new THREE.CylinderGeometry(0.75, 0.8, 0.04, 14), ink, 0.55, 0.02, 1.25, 1.1, 1, 0.7));
  pot.add(M(new THREE.BoxGeometry(0.22, 0.85, 0.12), ink, 0.42, 0.55, 1.03, 1, 1, 1, -0.3, 0.4, 0));
  // spire
  const spire = J(g, 0, 2.0, 0);
  const segs = [[0.62, 0.48, 1.2], [0.48, 0.34, 1.4], [0.34, 0.2, 1.3], [0.2, 0.03, 1.4]];
  let y = 0;
  segs.forEach(([r0, r1, h], i) => { spire.add(M(new THREE.CylinderGeometry(r1, r0, h, 10), ink, 0.05 * i, y + h / 2, -0.04 * i, 1, 1, 1, 0.02, 0, -0.02)); y += h; });
  // thorn vines: torus arcs spiralling up, with cones
  const thorn = new THREE.ConeGeometry(0.05, 0.28, 5);
  for (let i = 0; i < 5; i++) {
    const h = 0.3 + i * 1.0, r = 0.7 - i * 0.12;
    const arc = M(new THREE.TorusGeometry(r, 0.06, 5, 12, Math.PI * 1.3), ink, 0.03 * i, h, 0, 1, 1, 1, Math.PI / 2 - 0.25, 0, i * 2.1);
    spire.add(arc);
    for (let k = 0; k < 4; k++) {
      const a = i * 2.1 + k * 0.9 + 0.3;
      const t = M(thorn, ink, 0.03 * i + Math.cos(a) * (r + 0.1), h + Math.sin(k) * 0.12, -Math.sin(a) * (r + 0.1));
      t.lookAt(t.position.x * 3, t.position.y + 0.3, t.position.z * 3); t.rotateX(Math.PI / 2); spire.add(t);
    }
  }
  const joints = { spire };
  [[1.2, 0.3, 0.28], [2.6, 2.4, 0.24], [3.9, 4.3, 0.2]].forEach(([h, a, r], i) => {
    const rad = 0.62 - (h / 5.3) * 0.6;
    const node = J(spire, Math.sin(a) * (rad + 0.05), h, Math.cos(a) * (rad + 0.05));
    node.add(M(new THREE.SphereGeometry(r, 12, 9), core));
    node.add(M(new THREE.TorusGeometry(r * 1.05, r * 0.25, 6, 12), ink, 0, 0, 0, 1, 1, 1, 0, a, 0));
    joints['node' + i] = node;
  });
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
