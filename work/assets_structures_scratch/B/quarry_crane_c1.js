// quarry_crane c1: primitives. Cross sleeper base, square mast with iron bands, raking jib
// from the mast foot to a 12 m tip, stay ropes, winch with drum and spoked hand wheel,
// hook block hanging from the tip. Jib works in the XY plane, so the front (+Z) shows the profile.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (hex, name, r = 0.85, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra }); m.name = name; return m; };
  const timber = M(0x7a5534, 'timber'), dark = M(0x4a3324, 'timber'), iron = M(0x3c3a38, 'metal', 0.55, { metalness: 0.5 });
  const rope = M(0xc9b48f, 'fabric', 0.95);
  const put = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); p.add(me); return me; };
  const box = (p, w, h, d, mat, x, y, z, rx, ry, rz) => put(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);
  const body = new THREE.Group(); g.add(body);
  // a member of square section s from a to b
  const beam = (a, b, s, mat, round) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
    const geo = round ? new THREE.CylinderGeometry(s, s, L, 5) : new THREE.BoxGeometry(s, L, s);
    const me = new THREE.Mesh(geo, mat); me.position.copy(A).addScaledVector(d, 0.5);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); body.add(me); return me; };

  const MH = 9.6, TIP = [5.6, 12.0, 0], FOOT = [0.35, 1.2, 0];
  // base: long sleeper along X, cross sleeper along Z, short outrigger
  box(body, 6.0, 0.4, 0.5, timber, -0.6, 0.2, 0);
  box(body, 0.5, 0.4, 4.0, timber, 0, 0.2, 0);
  box(body, 0.5, 0.4, 2.6, timber, -3.0, 0.2, 0);
  // mast
  box(body, 0.5, MH, 0.5, timber, 0, 0.4 + MH / 2, 0);
  for (const y of [1.6, 4.0, 6.6, MH - 0.2]) box(body, 0.58, 0.22, 0.58, iron, 0, y, 0);
  box(body, 0.7, 0.3, 0.7, dark, 0, 0.4 + MH, 0);
  // raking struts mast to sleepers
  for (const s of [-1, 1]) beam([0, 2.6, 0], [0, 0.4, s * 1.8], 0.22, timber);
  beam([0, 2.6, 0], [-2.4, 0.4, 0], 0.22, timber);
  // jib, heavy, with iron shoe at the foot and an iron cap at the tip
  const jib = beam(FOOT, TIP, 0.42, timber);
  beam([FOOT[0] + 0.1, FOOT[1] - 0.2, 0], [FOOT[0] + 0.7, FOOT[1] + 1.0, 0], 0.5, iron);
  box(body, 0.6, 0.6, 0.55, iron, TIP[0], TIP[1] - 0.15, 0, 0, 0, -0.45);
  // sheaves: mast head and jib tip
  for (const [x, y] of [[0.0, MH + 0.15], [TIP[0], TIP[1] - 0.3]]) { const sh = new THREE.CylinderGeometry(0.32, 0.32, 0.16, 12); sh.rotateX(Math.PI / 2); put(body, sh, dark, x + 0.35, y, 0); }
  // stays mast head -> jib tip (two ropes) and the hoist rope
  for (const z of [-0.15, 0.15]) beam([0.3, MH + 0.2, z], [TIP[0] - 0.2, TIP[1] - 0.1, z], 0.045, rope, true);
  beam([0.3, MH - 0.2, 0], [TIP[0] - 0.3, TIP[1] - 0.6, 0], 0.035, rope, true);
  // hook: rope down, block, hook
  const HY = 7.4;
  for (const dx of [-0.08, 0.08]) beam([TIP[0] + 0.25 + dx, TIP[1] - 0.6, 0], [TIP[0] + 0.25 + dx, HY + 0.4, 0], 0.035, rope, true);
  box(body, 0.32, 0.5, 0.26, iron, TIP[0] + 0.25, HY + 0.2, 0);
  const hk = new THREE.TorusGeometry(0.26, 0.07, 6, 10, Math.PI * 1.4); put(body, hk, iron, TIP[0] + 0.25, HY - 0.25, 0, 0, 0, Math.PI * 0.85);
  // winch on the -X side: A-frames, drum with rope, hand wheel
  const WX = -2.0, WY = 1.25;
  for (const z of [-0.85, 0.85]) {
    beam([WX - 0.8, 0.4, z], [WX, WY + 0.1, z], 0.2, timber);
    beam([WX + 0.8, 0.4, z], [WX, WY + 0.1, z], 0.2, timber);
    box(body, 1.9, 0.22, 0.24, timber, WX, 0.5, z);
  }
  const drum = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 12); drum.rotateX(Math.PI / 2); put(body, drum, rope, WX, WY, 0);
  for (const z of [-0.72, 0.72]) { const fl = new THREE.CylinderGeometry(0.66, 0.66, 0.1, 12); fl.rotateX(Math.PI / 2); put(body, fl, dark, WX, WY, z); }
  const ax = new THREE.CylinderGeometry(0.09, 0.09, 2.8, 6); ax.rotateX(Math.PI / 2); put(body, ax, iron, WX, WY, 0.3);
  const wz = 1.55, WR = 1.05;
  const rim = new THREE.TorusGeometry(WR, 0.08, 5, 18); put(body, rim, timber, WX, WY + 0.0, wz);
  for (let k = 0; k < 3; k++) box(body, 0.1, 2 * WR, 0.1, timber, WX, WY, wz, 0, 0, (k * Math.PI) / 3);
  // hoist rope from the drum up the mast to the head sheave
  beam([WX + 0.4, WY + 0.4, 0], [0.0, MH, 0], 0.035, rope, true);
