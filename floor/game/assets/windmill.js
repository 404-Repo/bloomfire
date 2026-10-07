// Stone tower windmill, 13 m to the cap, four canvas sails 16 m across on the +Z face.
// Moving part: userData.joints.sails (pivot at the hub).
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, r, n, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r, ...o }); m.name = n; return m; };
  const wall = M(0xeee3cf, 0.92, 'plaster'), tile = M(0xc0603a, 0.85, 'tile'), timber = M(0x7a5534, 0.85, 'timber');
  const cloth = M(0xe8e2d4, 0.95, 'fabric', { side: THREE.DoubleSide }), dark = M(0x4a3324, 0.8, 'timber');
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.4, 10.5, 14), wall); tower.position.y = 5.25; g.add(tower);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(2.75, 2.75, 0.3, 14), timber); band.position.y = 10.4; g.add(band);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(3.0, 2.6, 14), tile); cap.position.y = 11.8; g.add(cap);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, 0.4), dark); door.position.set(0, 1.05, 3.25); g.add(door);
  for (const [a, y] of [[0.6, 4.5], [-2.2, 7.2], [2.6, 6.0]]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), dark); const rr = 3.4 - (y / 10.5) * 0.8; w.position.set(Math.sin(a) * rr, y, Math.cos(a) * rr); w.rotation.y = a; g.add(w); }
  const sails = new THREE.Group(); sails.position.set(0, 10.6, 3.3); g.add(sails);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 10), timber); hub.rotation.x = Math.PI / 2; sails.add(hub);
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2 + 0.3; sails.add(arm);
    const spar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 8, 0.22), timber); spar.position.y = 4; arm.add(spar);
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 6), cloth); sail.position.set(0.95, 4.6, 0.05); arm.add(sail);
    for (let k = 0; k < 4; k++) { const rung = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.08), timber); rung.position.set(0.9, 2 + k * 1.9, 0.1); arm.add(rung); }
  }
  g.userData.joints = { sails };
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
