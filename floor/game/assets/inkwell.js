// Inkwell, 7 m: a pulsing ink spire rising from a pool, ringed by bone ribs, three magenta nodes.
// Moving parts: userData.joints.node0..2 (each node sits on its own pivot).
export default function (THREE) {
  const g = new THREE.Group();
  const ink = new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.25, metalness: 0 });
  const sheen = new THREE.MeshStandardMaterial({ color: 0x2b2a45, roughness: 0.3 });
  const bone = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.7 });
  const core = new THREE.MeshStandardMaterial({ color: 0xff3d8b, emissive: 0xff3d8b, emissiveIntensity: 2.5 });
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.0, 0.3, 16), sheen); pool.position.y = 0.15; g.add(pool);
  const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(0.05 + 1.7 * Math.pow(1 - t, 1.6) + 0.25 * Math.sin(t * 9) * (1 - t), t * 7)); }
  const spire = new THREE.Mesh(new THREE.LatheGeometry(pts, 12), ink); g.add(spire);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2; const rib = new THREE.Mesh(new THREE.ConeGeometry(0.22, 3.2, 5), bone);
    rib.position.set(Math.cos(a) * 2.4, 1.3, Math.sin(a) * 2.4); rib.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(rib);
  }
  const joints = {};
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2 + 0.5, y = 1.6 + i * 1.4, rr = 1.5 - i * 0.3;
    const piv = new THREE.Group(); piv.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr); g.add(piv);
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), core); piv.add(n);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.08, 6, 12), bone); rim.rotation.y = a; piv.add(rim);
    joints['node' + i] = piv;
  }
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), core); crown.position.y = 7; g.add(crown);
  g.userData.joints = joints;
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
