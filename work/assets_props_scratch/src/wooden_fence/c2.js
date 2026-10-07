// wooden_fence c2: profiles. Round log posts (six-sided, cone tops) with two hand-hewn rails extruded from irregular five-sided sections, passing through the posts.
const post = M(0x4a3324, 'timber', 0.9, { flatShading: true }), rail = M(0x7a5534, 'timber', 0.9, { flatShading: true });
[-1.42, 0, 1.42].forEach((x) => { add(new THREE.CylinderGeometry(0.075, 0.085, 0.92, 6), post, x, 0.46, 0); add(new THREE.ConeGeometry(0.075, 0.09, 6), post, x, 0.965, 0); });
[0.36, 0.74].forEach((y, k) => {
  const s = new THREE.Shape(); s.moveTo(-0.05, -0.065); s.lineTo(0.045, -0.06); s.lineTo(0.055, 0.03); s.lineTo(0.0, 0.07); s.lineTo(-0.055, 0.04); s.lineTo(-0.05, -0.065);
  const ge = new THREE.ExtrudeGeometry(s, { depth: 3.0, bevelEnabled: false, steps: 3 });
  warp(ge, (p) => { p.x += 0.012 * Math.sin(p.z * 2 + k); p.y += 0.015 * Math.sin(p.z * 1.3 + k * 2); });
  ge.rotateY(Math.PI / 2); add(ge, rail, -1.5, y, 0);
});
