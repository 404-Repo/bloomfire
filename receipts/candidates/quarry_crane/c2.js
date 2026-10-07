// quarry_crane c2: profiles. Every timber is a chamfered-square Shape swept along its
// line (ExtrudeGeometry + extrudePath); the jib is a tapered side profile extruded through
// its thickness; ropes are tubes along sagging curves; drum is lathed with rope wraps.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (hex, name, r = 0.85, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra }); m.name = name; return m; };
  const timber = M(0x7a5534, 'timber'), dark = M(0x4a3324, 'timber'), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5 });
  const rope = M(0xc9b48f, 'fabric', 0.95);
  const put = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); p.add(me); return me; };
  const body = new THREE.Group(); g.add(body);
  const V3 = (a) => new THREE.Vector3(...a);
  const chamfer = (s) => { const c = s * 0.28, h = s / 2; return new THREE.Shape([[-h + c, -h], [h - c, -h], [h, -h + c], [h, h - c], [h - c, h], [-h + c, h], [-h, h - c], [-h, -h + c]].map(([x, y]) => new THREE.Vector2(x, y))); };
  const sweep = (a, b, s, mat = timber) => { const path = new THREE.LineCurve3(V3(a), V3(b)); const geo = new THREE.ExtrudeGeometry(chamfer(s), { steps: 1, bevelEnabled: false, extrudePath: path }); return put(body, geo, mat); };
  const ropeTo = (pts, r = 0.04) => put(body, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V3)), 12, r, 4, false), rope);
  const ring = (p, ro, ri, t, mat, x, y, z, seg = 18) => { const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false); const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h); const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: seg }); geo.translate(0, 0, -t / 2); return put(p, geo, mat, x, y, z); };

  const MH = 9.8;
  // base sleepers (swept)
  sweep([-3.6, 0.22, 0], [2.4, 0.22, 0], 0.45);
  sweep([0, 0.22, -2.0], [0, 0.22, 2.0], 0.45);
  sweep([-3.0, 0.22, -1.3], [-3.0, 0.22, 1.3], 0.42);
  // mast
  sweep([0, 0.4, 0], [0, 0.4 + MH, 0], 0.52);
  for (const y of [1.6, 4.2, 6.9, MH - 0.1]) ring(body, 0.4, 0.3, 0.22, iron, 0, y, 0, 8).rotation.x = Math.PI / 2;
  // struts
  for (const s of [-1, 1]) sweep([0, 2.8, 0], [0, 0.45, s * 1.75], 0.24);
  sweep([0, 2.8, 0], [-2.6, 0.45, 0], 0.24);
  // jib: tapered side profile (XY) extruded 0.42 thick through Z
  const F = [0.3, 1.1], T = [5.6, 12.0], dx = T[0] - F[0], dy = T[1] - F[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const w0 = 0.32, w1 = 0.2;
  const js = new THREE.Shape([[F[0] - nx * w0, F[1] - ny * w0], [T[0] - nx * w1, T[1] - ny * w1], [T[0] + nx * w1, T[1] + ny * w1], [F[0] + nx * w0, F[1] + ny * w0]].map(([x, y]) => new THREE.Vector2(x, y)));
  const jg = new THREE.ExtrudeGeometry(js, { depth: 0.44, bevelEnabled: false }); jg.translate(0, 0, -0.22); put(body, jg, timber);
  // iron straps on the jib
  for (const t of [0.15, 0.55, 0.97]) { const geo = new THREE.BoxGeometry(0.06 + (t > 0.9 ? 0.4 : 0.12), 0.8, 0.5); const me = put(body, geo, iron, F[0] + dx * t, F[1] + dy * t, 0); me.rotation.z = Math.atan2(dy, dx); }
  // sheaves (lathed)
  const sheave = new THREE.LatheGeometry([[0, -0.1], [0.34, -0.1], [0.26, 0], [0.34, 0.1], [0, 0.1]].map(([r, y]) => new THREE.Vector2(r, y)), 12); sheave.rotateX(Math.PI / 2);
  put(body, sheave, dark, 0.35, MH + 0.2, 0); put(body, sheave, dark, T[0] + 0.1, T[1] - 0.35, 0);
  // stays with a little sag, hoist line, hook
  for (const z of [-0.16, 0.16]) ropeTo([[0.3, MH + 0.3, z], [2.9, MH + 0.75, z], [T[0] - 0.2, T[1] - 0.1, z]], 0.05);
  const HY = 7.2, hx = T[0] + 0.32;
  ropeTo([[hx - 0.07, T[1] - 0.4, 0], [hx - 0.07, HY + 0.45, 0]]); ropeTo([[hx + 0.07, T[1] - 0.4, 0], [hx + 0.07, HY + 0.45, 0]]);
  const block = new THREE.LatheGeometry([[0, -0.3], [0.18, -0.26], [0.22, 0], [0.18, 0.26], [0, 0.3]].map(([r, y]) => new THREE.Vector2(r, y)), 8); put(body, block, iron, hx, HY + 0.2, 0);
  const hook = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3([hx, HY - 0.1, 0]), V3([hx, HY - 0.45, 0]), V3([hx - 0.15, HY - 0.75, 0]), V3([hx - 0.45, HY - 0.65, 0]), V3([hx - 0.45, HY - 0.45, 0])]), 10, 0.07, 5, false); put(body, hook, iron);
  // winch: trestle side frames (extruded A profile), lathed drum with rope wraps, wheel
  const WX = -2.1, WY = 1.3;
  const tr = new THREE.Shape([[-1.0, 0.0], [1.0, 0.0], [1.0, 0.25], [0.25, WY + 0.25], [-0.25, WY + 0.25], [-1.0, 0.25]].map(([x, y]) => new THREE.Vector2(x, y)));
  const hole = new THREE.Path([[-0.45, 0.4], [0.45, 0.4], [0.0, WY - 0.2]].map(([x, y]) => new THREE.Vector2(x, y))); tr.holes.push(hole);
  const tg = new THREE.ExtrudeGeometry(tr, { depth: 0.22, bevelEnabled: false }); tg.translate(0, 0, -0.11);
  put(body, tg, timber, WX, 0.4, -0.85); put(body, tg, timber, WX, 0.4, 0.85);
  const prof = [[0.05, -0.75], [0.68, -0.75], [0.68, -0.65], [0.5, -0.62]];
  for (let k = 0; k < 8; k++) { const y = -0.55 + k * 0.155; prof.push([0.56, y], [0.5, y + 0.077]); }
  prof.push([0.5, 0.62], [0.68, 0.65], [0.68, 0.75], [0.05, 0.75]);
  const drum = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 12); drum.rotateX(Math.PI / 2);
  put(body, drum, rope, WX, WY + 0.4, 0);
  const axle = new THREE.CylinderGeometry(0.09, 0.09, 2.9, 6); axle.rotateX(Math.PI / 2); put(body, axle, iron, WX, WY + 0.4, 0.35);
  const wz = 1.6, WR = 1.1;
  ring(body, WR, WR - 0.16, 0.14, timber, WX, WY + 0.4, wz, 18);
  for (let k = 0; k < 4; k++) { const sp = new THREE.BoxGeometry(0.1, 2 * WR - 0.1, 0.1); put(body, sp, timber, WX, WY + 0.4, wz, 0, 0, (k * Math.PI) / 4); }
  const hub = new THREE.CylinderGeometry(0.18, 0.18, 0.25, 8); hub.rotateX(Math.PI / 2); put(body, hub, iron, WX, WY + 0.4, wz);
  // hoist rope from the drum to the mast head
  ropeTo([[WX + 0.45, WY + 0.85, 0], [-0.8, 5.5, 0], [0.05, MH + 0.1, 0]]);
  {
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
  }
  return g;
}
