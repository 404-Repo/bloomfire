// Inkwell, candidate 3: hand-built and a different reading. The spire is a twisted, tapering
// five-pointed star prism written straight into a BufferGeometry, so it reads as a gnarled
// horn of ink rather than a smooth cone; the pot is a lathe whose rim is broken into jagged
// shards and whose wall is split open by a vertical gash (vertices pushed in) with ink pouring
// out; thorn spikes grow straight off the star ridges.
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
  const V = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.Group();
  const pot = J(g, 0, 0, 0);
  const potGeo = new THREE.LatheGeometry(V([[0.6, 0], [0.72, 0.1], [1.0, 0.45], [1.15, 0.95], [1.12, 1.35], [0.92, 1.75], [0.7, 2.0], [0.66, 2.2]]), 24);
  const pp = potGeo.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i), a = Math.atan2(x, z);
    if (y > 2.1) pp.setY(i, y - 0.25 * Math.abs(Math.sin(a * 3.5)) - 0.12 * Math.abs(Math.sin(a * 7.3)));   // broken rim
    const da = Math.abs(a - 0.45);
    if (da < 0.12 && y > 0.3 && y < 1.9) { const k = 1 - 0.18 * (1 - da / 0.12); pp.setX(i, x * k); pp.setZ(i, z * k); } // gash
  }
  potGeo.computeVertexNormals();
  pot.add(M(potGeo, clay));
  pot.add(M(new THREE.CircleGeometry(0.6, 14), clay, 0, 0.001, 0, 1, 1, 1, Math.PI / 2));
  pot.add(M(new THREE.BoxGeometry(0.16, 1.5, 0.2), ink, Math.sin(0.45) * 1.02, 1.05, Math.cos(0.45) * 1.02, 1, 1, 1, 0, 0.45, 0));
  pot.add(M(new THREE.CylinderGeometry(0.85, 0.9, 0.04, 14), ink, 0.6, 0.02, 1.3, 1.1, 1, 0.7));
  [[1.8, 1.0], [3.0, 1.3], [4.3, 0.9]].forEach(([a, y]) => pot.add(M(new THREE.BoxGeometry(0.04, 0.6, 0.04), ink, Math.sin(a) * 1.15, y, Math.cos(a) * 1.15, 1, 1, 1, 0, a, 0.3)));
  // twisted star spire
  const spire = J(g, 0, 1.9, 0);
  const rings = 22, pts = 5, H = 5.1, pos = [], idx = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings, y = t * H, R = 0.66 * Math.pow(1 - t, 0.9) + 0.01, tw = t * 2.4;
    for (let j = 0; j < pts * 2; j++) {
      const a = (j / (pts * 2)) * Math.PI * 2 + tw, r = j % 2 ? R * 0.62 : R;
      pos.push(Math.sin(a) * r, y, Math.cos(a) * r);
    }
  }
  const n = pts * 2;
  for (let i = 0; i < rings; i++) for (let j = 0; j < n; j++) {
    const a = i * n + j, b = i * n + (j + 1) % n, c = (i + 1) * n + j, d = (i + 1) * n + (j + 1) % n;
    idx.push(a, b, d, a, d, c);
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setIndex(idx); sg.computeVertexNormals();
  spire.add(M(sg, ink));
  // slump over the rim
  spire.add(M(new THREE.SphereGeometry(0.8, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), ink, 0, 0.1, 0, 1, 0.45, 1));
  // thorns on the ridges
  const thorn = new THREE.ConeGeometry(0.05, 0.32, 5);
  for (let i = 2; i < rings - 2; i += 2) for (let j = 0; j < n; j += 2) {
    if ((i + j) % 4) continue;
    const p = new THREE.Vector3(pos[(i * n + j) * 3], pos[(i * n + j) * 3 + 1], pos[(i * n + j) * 3 + 2]);
    const dir = new THREE.Vector3(p.x, 0.5 * Math.hypot(p.x, p.z), p.z).normalize();
    const th = M(thorn, ink, p.x + dir.x * 0.13, p.y + dir.y * 0.13, p.z + dir.z * 0.13);
    th.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); spire.add(th);
  }
  const joints = { spire };
  [[1.3, 0.25, 0.28], [2.7, 2.6, 0.24], [3.9, 4.5, 0.2]].forEach(([h, a, r], i) => {
    const R = 0.66 * Math.pow(1 - h / H, 0.9) * 0.8;
    const node = J(spire, Math.sin(a) * (R + r * 0.4), h, Math.cos(a) * (R + r * 0.4));
    node.add(M(new THREE.SphereGeometry(r, 12, 9), core));
    node.add(M(new THREE.TorusGeometry(r * 1.0, r * 0.22, 5, 12), ink, 0, 0, 0, 1, 1, 1, 0, a, 0));
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
