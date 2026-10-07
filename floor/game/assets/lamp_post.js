// Iron lamp post, 3.2 m, with a brass lantern and warm glass.
export default function (THREE) {
  const g = new THREE.Group();
  const iron = new THREE.MeshStandardMaterial({ color: 0x3c3a38, roughness: 0.5, metalness: 0.7 }); iron.name = 'metal';
  const brass = new THREE.MeshStandardMaterial({ color: 0xb8913a, roughness: 0.4, metalness: 0.8 }); brass.name = 'metal';
  const glass = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffd27a, emissiveIntensity: 2.2, roughness: 0.3 });
  const add = (geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); g.add(o); return o; };
  add(new THREE.CylinderGeometry(0.22, 0.28, 0.4, 8), iron, 0, 0.2, 0);
  add(new THREE.CylinderGeometry(0.06, 0.08, 2.6, 8), iron, 0, 1.7, 0);
  add(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), brass, 0, 2.6, 0);
  add(new THREE.BoxGeometry(0.34, 0.42, 0.34), glass, 0, 2.86, 0);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(new THREE.BoxGeometry(0.04, 0.46, 0.04), brass, x * 0.18, 2.86, z * 0.18);
  add(new THREE.ConeGeometry(0.3, 0.28, 4), brass, 0, 3.2, 0).rotation.y = Math.PI / 4;
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
