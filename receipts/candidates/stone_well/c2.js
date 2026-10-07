// stone_well c2: profiles. The wall is one lathed section (stepped courses, rounded cap lip,
// inner shaft), the posts are extruded chamfered sections, the windlass is a roller with a crank,
// and the bucket is lathed.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => { const mt = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); mt.name = name; return mt; };
  const stone = M(0xc9b48f, 'stone', 0.92), dark = M(0x4a3324, 'timber'), timber = M(0x7a5534, 'timber', 0.85, { side: THREE.DoubleSide });
  const iron = M(0x3c3a38, 'metal', 0.6, { metalness: 0.5 }), rope = M(0xb89a68, 'fabric', 0.95), water = M(0x2c3a40, 'ground', 0.3);
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.rotation.set(rx, ry, rz); g.add(ms); return ms; };
  const V = (pts) => pts.map(([a, b]) => new THREE.Vector2(a, b));
  // wall section: outside rises in four slightly bulged courses with grooves, rounded cap, then down the shaft
  const prof = [[0.55, 0.45], [0.55, 0.0]];
  const C = 4, ch = 0.205;
  for (let c = 0; c < C; c++) {
    const y0 = c * ch;
    prof.push([0.8, y0 + 0.01], [0.83, y0 + 0.05], [0.84, y0 + ch / 2], [0.83, y0 + ch - 0.05], [0.8, y0 + ch - 0.01]);
  }
  const y4 = C * ch;
  prof.push([0.86, y4 + 0.0], [0.92, y4 + 0.03], [0.93, y4 + 0.11], [0.89, y4 + 0.18], [0.6, y4 + 0.19], [0.53, y4 + 0.14], [0.53, y4 + 0.0], [0.55, 0.45]);
  add(new THREE.LatheGeometry(V(prof), 16), stone, 0, 0, 0);
  // vertical joints: shallow dark blocks between stones, staggered per course
  const joint = M(0x8f7c5c, 'stone', 1.0);
  for (let c = 0; c < C; c++) for (let i = 0; i < 9; i++) {
    const a = (i + (c % 2) * 0.5) / 9 * Math.PI * 2;
    add(new THREE.BoxGeometry(0.03, ch - 0.05, 0.05), joint, Math.sin(a) * 0.835, c * ch + ch / 2, Math.cos(a) * 0.835, 0, a, 0);
  }
  add(new THREE.CircleGeometry(0.55, 16), water, 0, 0.45, 0, -Math.PI / 2, 0, 0);
  // posts: chamfered section extruded upward
  const s = 0.18, k = 0.04, h = s / 2;
  const sh = new THREE.Shape(V([[-h + k, -h], [h - k, -h], [h, -h + k], [h, h - k], [h - k, h], [-h + k, h], [-h, h - k], [-h, -h + k]]));
  for (const sx of [-1, 1]) {
    add(new THREE.ExtrudeGeometry(sh, { depth: 2.42, bevelEnabled: false }), dark, sx * 1.02, 0, 0, -Math.PI / 2, 0, 0);
    add(new THREE.BoxGeometry(0.1, 0.62, 0.1), dark, sx * 0.82, 2.2, 0, 0, 0, sx * 0.785);
  }
  // top beam with a pitched cap profile, swept along X
  const bs = new THREE.Shape(V([[-0.11, 0], [0.11, 0], [0.11, 0.12], [0, 0.18], [-0.11, 0.12]]));
  add(new THREE.ExtrudeGeometry(bs, { depth: 2.4, bevelEnabled: false }), dark, -1.2, 2.42, 0, 0, Math.PI / 2, 0);
  // windlass roller under the beam, with crank
  add(new THREE.CylinderGeometry(0.1, 0.1, 1.9, 10), timber, 0, 2.1, 0, 0, 0, Math.PI / 2);
  for (const dx of [-0.25, 0.0, 0.25]) add(new THREE.TorusGeometry(0.11, 0.03, 5, 12), rope, dx, 2.1, 0, 0, Math.PI / 2, 0);
  add(new THREE.BoxGeometry(0.06, 0.3, 0.06), iron, 1.15, 1.97, 0);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6), iron, 1.22, 1.84, 0, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.58, 5), rope, 0, 1.73, 0.1);
  // bucket, lathed with a lip
  const by = 1.25;
  add(new THREE.LatheGeometry(V([[0, -0.15], [0.14, -0.15], [0.17, 0.13], [0.185, 0.15], [0.17, 0.15]]), 10), timber, 0, by, 0.1);
  add(new THREE.TorusGeometry(0.165, 0.016, 4, 12), iron, 0, by + 0.08, 0.1, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.148, 0.016, 4, 12), iron, 0, by - 0.1, 0.1, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.17, 0.014, 4, 10, Math.PI), iron, 0, by + 0.15, 0.1);
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
