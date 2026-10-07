// lantern_post c1: primitives. Stepped round base, slim iron shaft with collars, spike
// finial, straight bracket arm with a scroll brace, and a square brass lantern hanging from it.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.6, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.5, ...extra }); mt.name = name; return mt; };
  const iron = M(0x3c3a38, 'metal', 0.55), brass = M(0xb8913a, 'metal', 0.45, { metalness: 0.7 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffd27a, emissiveIntensity: 0, roughness: 0.2, metalness: 0 });
  glass.name = 'lamp_glass';
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); g.add(ms); return ms; };
  // base
  add(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 10), iron, 0, 0.06, 0);
  add(new THREE.CylinderGeometry(0.1, 0.17, 0.42, 10), iron, 0, 0.33, 0);
  add(new THREE.TorusGeometry(0.11, 0.03, 5, 10), iron, 0, 0.56, 0, Math.PI / 2, 0, 0);
  // shaft
  add(new THREE.CylinderGeometry(0.05, 0.065, 2.4, 8), iron, 0, 1.75, 0);
  add(new THREE.TorusGeometry(0.07, 0.025, 5, 10), iron, 0, 2.2, 0, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.065, 0.025, 5, 10), iron, 0, 2.95, 0, Math.PI / 2, 0, 0);
  add(new THREE.SphereGeometry(0.075, 8, 6), iron, 0, 3.0, 0);
  add(new THREE.ConeGeometry(0.05, 0.17, 6), iron, 0, 3.12, 0);
  // bracket: arm, scroll brace, end curl
  add(new THREE.BoxGeometry(0.72, 0.06, 0.06), iron, 0.36, 2.82, 0);
  add(new THREE.TorusGeometry(0.2, 0.022, 5, 12, Math.PI * 1.25), iron, 0.24, 2.6, 0, 0, 0, Math.PI * 0.25);
  add(new THREE.TorusGeometry(0.06, 0.02, 5, 10), iron, 0.74, 2.88, 0);
  // hanger
  add(new THREE.TorusGeometry(0.045, 0.012, 4, 8), brass, 0.62, 2.74, 0);
  // lantern: body 0.26 square, 0.38 tall, centred at y 2.36
  const lx = 0.62, ly = 2.36;
  add(new THREE.BoxGeometry(0.22, 0.34, 0.22), glass, lx, ly, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.035, 0.38, 0.035), brass, lx + sx * 0.12, ly, sz * 0.12);
  add(new THREE.BoxGeometry(0.29, 0.04, 0.29), brass, lx, ly + 0.19, 0);
  add(new THREE.BoxGeometry(0.27, 0.05, 0.27), brass, lx, ly - 0.19, 0);
  add(new THREE.ConeGeometry(0.21, 0.13, 4), brass, lx, ly + 0.275, 0, 0, Math.PI / 4, 0);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6), brass, lx, ly + 0.36, 0);
  add(new THREE.ConeGeometry(0.06, 0.1, 4), brass, lx, ly - 0.26, 0, Math.PI, Math.PI / 4, 0);
  // mid bars on each glass face
  for (const [dx, dz, ry] of [[0, 0.115, 0], [0, -0.115, 0], [0.115, 0, Math.PI / 2], [-0.115, 0, Math.PI / 2]]) add(new THREE.BoxGeometry(0.02, 0.34, 0.012), brass, lx + dx, ly, dz, 0, ry, 0);
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
