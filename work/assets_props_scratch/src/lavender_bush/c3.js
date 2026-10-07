// lavender_bush c3: hand-built fountain reading. A small squashed icosahedron leaf core, 44 folded grey-green leaf blades splaying from the root, and 28 stems each a folded green blade carrying a six-triangle lavender bipyramid spike.
const leaf = M(0x7d8a63, 'foliage', 0.9, { side: THREE.DoubleSide, flatShading: true }), flower = M(0x8c7bbf, 'foliage', 0.8, { flatShading: true });
const L = soup(), F = soup();
for (let i = 0; i < 44; i++) {
  const a = i * 2.39996; const lean = 0.3 + 0.8 * ((i * 0.618) % 1); const len = rr(0.3, 0.42);
  const d = V(Math.cos(a) * lean, 1, Math.sin(a) * lean).normalize(); const side = V(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(0.03);
  const b = V(Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08); const tip = b.clone().addScaledVector(d, len); tip.y -= len * 0.1 * lean;
  const mid = b.clone().addScaledVector(d, len * 0.4); mid.y += 0.015;
  L.tri([b.x - side.x, b.y, b.z - side.z], [mid.x, mid.y, mid.z], [tip.x, tip.y, tip.z]); L.tri([b.x + side.x, b.y, b.z + side.z], [tip.x, tip.y, tip.z], [mid.x, mid.y, mid.z]);
}
for (let i = 0; i < 28; i++) {
  const a = i * 2.39996 + 0.5; const lean = 0.15 + 0.95 * ((i * 0.618 + 0.3) % 1); const len = rr(0.36, 0.46);
  const d = V(Math.cos(a) * lean, 1, Math.sin(a) * lean).normalize(); const side = V(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(0.012);
  const b = V(Math.cos(a) * 0.09, 0.05, Math.sin(a) * 0.09); const top = b.clone().addScaledVector(d, len);
  L.tri([b.x - side.x, b.y, b.z - side.z], [b.x + side.x, b.y, b.z + side.z], [top.x, top.y, top.z]);
  const sb = b.clone().addScaledVector(d, len - 0.04), st = b.clone().addScaledVector(d, len + 0.16), sm = b.clone().addScaledVector(d, len + 0.04);
  const ring = [0, 1, 2].map((k) => { const ang = k * 2.094 + a; return [sm.x + Math.cos(ang) * 0.035, sm.y, sm.z + Math.sin(ang) * 0.035]; });
  for (let k = 0; k < 3; k++) { const p = ring[k], q = ring[(k + 1) % 3]; F.tri(p, q, [st.x, st.y, st.z]); F.tri(q, p, [sb.x, sb.y, sb.z]); }
}
add(L.geo(), leaf); add(F.geo(), flower);
add(new THREE.IcosahedronGeometry(0.2, 0), M(0x7d8a63, 'foliage', 0.9, { flatShading: true }), 0, 0.1, 0, 0, 0.4, 0, 1.3, 0.75, 1.3);
