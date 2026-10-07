// Prism rifle, candidate 2: profiles. The stock is an extruded side profile (butt, pistol
// grip and wrist in one outline) with brass butt cap and toe/heel caps extruded from the same
// edge; the cage side frames are extruded hexagon rings (outline with a hole); barrel, bands,
// muzzle shroud and crown are one lathe each; the crystal is a lathe-cut gem.
export default function (THREE) {
  const brass = new THREE.MeshStandardMaterial({ color: 0xb8913a, roughness: 0.35, metalness: 0.8 }); brass.name = 'metal';
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.7, metalness: 0 }); wood.name = 'timber';
  const iron = new THREE.MeshStandardMaterial({ color: 0x3c3a38, roughness: 0.5, metalness: 0.6 });
  const prism = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffd27a, emissiveIntensity: 1.6, roughness: 0.2, metalness: 0, flatShading: true }); prism.name = 'prism';
  const M = (geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
    const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(rx, ry, rz); return o;
  };
  const J = (parent, x, y, z) => { const o = new THREE.Group(); o.position.set(x, y, z); parent.add(o); return o; };
  const rivet = new THREE.SphereGeometry(0.0055, 6, 4);
  const g = new THREE.Group();
  const root = J(g, 0, 0, 0);
  const Y = 0.13;
  const ext = (pts, depth, bevel = 0.003) => {
    const s = new THREE.Shape(); s.moveTo(...pts[0]); pts.slice(1).forEach((p) => s.lineTo(...p));
    const geo = new THREE.ExtrudeGeometry(s, { depth: depth - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, curveSegments: 4 });
    geo.translate(0, 0, -(depth - 2 * bevel) / 2); geo.rotateY(Math.PI / 2); return geo;   // profile drawn in (z, y), extruded along x
  };
  // after rotateY(+90deg) a shape point (u, v) lands at z = -u, so profiles are drawn with u = -z
  const P = (a) => a.map(([z, y]) => [-z, y]);
  root.add(M(ext(P([[0.465, 0.005], [0.465, 0.165], [0.3, 0.145], [0.2, Y + 0.0], [0.13, Y + 0.0], [0.13, Y - 0.04], [0.16, Y - 0.06], [0.2, Y - 0.07], [0.24, 0.06], [0.3, 0.04]]), 0.044), wood));
  root.add(M(ext(P([[0.48, 0.0], [0.48, 0.17], [0.462, 0.168], [0.462, 0.002]]), 0.05), brass));
  root.add(M(ext(P([[0.47, 0.0], [0.47, 0.035], [0.41, 0.022], [0.41, 0.012]]), 0.052, 0.002), brass));
  root.add(M(ext(P([[0.47, 0.135], [0.47, 0.17], [0.4, 0.155], [0.4, 0.145]]), 0.052, 0.002), brass));
  // receiver + cage
  root.add(M(ext(P([[0.13, Y - 0.04], [0.13, Y + 0.02], [0.085, Y + 0.03], [0.085, Y - 0.045]]), 0.05), brass));
  root.add(M(ext(P([[-0.085, Y - 0.04], [-0.085, Y + 0.03], [-0.13, Y + 0.02], [-0.13, Y - 0.035]]), 0.05), brass));
  const hex = new THREE.Shape(), hole = new THREE.Path();
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const o = [Math.cos(a) * 0.1, Math.sin(a) * 0.065], h = [Math.cos(a) * 0.08, Math.sin(a) * 0.048];
    if (i === 0) { hex.moveTo(...o); hole.moveTo(...h); } else { hex.lineTo(...o); hole.lineTo(...h); }
  }
  hex.holes.push(hole);
  const frame = new THREE.ExtrudeGeometry(hex, { depth: 0.008, bevelEnabled: false }); frame.rotateY(Math.PI / 2);
  [0.031, -0.039].forEach((x) => root.add(M(frame, brass, x, Y + 0.02, 0)));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    root.add(M(new THREE.CylinderGeometry(0.0045, 0.0045, 0.075, 6), brass, 0, Y + 0.02 + Math.sin(a) * 0.056, Math.cos(a) * 0.09, 1, 1, 1, 0, 0, Math.PI / 2));
    [0.041, -0.041].forEach((x) => root.add(M(rivet, brass, x, Y + 0.02 + Math.sin(a) * 0.056, Math.cos(a) * 0.09)));
  }
  const pj = J(root, 0, Y + 0.02, 0);
  const gem = new THREE.LatheGeometry([[0, -0.075], [0.038, -0.04], [0.046, 0.0], [0.038, 0.04], [0, 0.075]].map(([r, y]) => new THREE.Vector2(r, y)), 6);
  gem.rotateX(Math.PI / 2);
  pj.add(M(gem, prism, 0, 0, 0, 1, 1.15, 1.05));
  // trigger guard
  root.add(M(ext(P([[0.13, Y - 0.04], [0.12, Y - 0.075], [0.07, Y - 0.08], [0.06, Y - 0.04], [0.07, Y - 0.04], [0.078, Y - 0.07], [0.113, Y - 0.066], [0.12, Y - 0.04]]), 0.012, 0.002), brass));
  root.add(M(new THREE.BoxGeometry(0.006, 0.03, 0.008), iron, 0, Y - 0.055, 0.095, 1, 1, 1, 0.3));
  // forend
  root.add(M(ext(P([[-0.13, Y - 0.005], [-0.36, Y - 0.005], [-0.37, Y - 0.025], [-0.35, Y - 0.045], [-0.13, Y - 0.045]]), 0.042), wood));
  // barrel + bands + shroud: lathes along -Z
  const L = (prof, seg = 14) => { const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), seg); geo.rotateX(-Math.PI / 2); return geo; };
  root.add(M(L([[0.017, 0.12], [0.017, 0.4]]), iron, 0, Y + 0.004, 0));
  [0.15, 0.36].forEach((z) => root.add(M(L([[0.026, z - 0.016], [0.031, z - 0.012], [0.031, z + 0.012], [0.026, z + 0.016]]), brass, 0, Y - 0.008, 0, 1.0, 1.35, 1)));
  root.add(M(L([[0.017, 0.375], [0.032, 0.38], [0.034, 0.39], [0.03, 0.4], [0.03, 0.465], [0.036, 0.47], [0.036, 0.485], [0.02, 0.49], [0.016, 0.48]]), brass, 0, Y + 0.004, 0));
  [-1, 1].forEach((s) => root.add(M(new THREE.BoxGeometry(0.006, 0.012, 0.05), iron, 0.029 * s, Y + 0.004, -0.43)));
  root.add(M(new THREE.BoxGeometry(0.006, 0.02, 0.014), brass, 0, Y + 0.044, -0.468));
  brass.side = THREE.DoubleSide; iron.side = THREE.DoubleSide;
  const muzzle = J(root, 0, Y + 0.004, -0.49);
  g.userData.joints = { prism: pj, muzzle };
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
