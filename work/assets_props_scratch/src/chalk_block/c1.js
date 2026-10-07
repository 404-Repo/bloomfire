// chalk_block c1: segmented box. One box with a few segments per face; the long faces carry horizontal chisel grooves pushed in by a stepped sine, one top corner is clamped off by a plane as a chip, and the whole is slightly irregular.
const chalk = M(0xe8e2d4, 'stone', 0.95, { flatShading: true });
const W = 1.7, H = 1.3, D = 1.15;
const chip = V(1, 1, 1).normalize();
const ge = warp(new THREE.BoxGeometry(W, H, D, 4, 6, 3), (p) => {
  const onSide = Math.abs(Math.abs(p.z) - D / 2) < 1e-3 || Math.abs(Math.abs(p.x) - W / 2) < 1e-3;
  if (onSide && Math.abs(p.y) < H / 2 - 1e-3) { const g = Math.sin((p.y + H / 2) / H * Math.PI * 6) > 0.3 ? 0.03 : 0; if (Math.abs(p.z) > D / 2 - 1e-3) p.z -= Math.sign(p.z) * g; else p.x -= Math.sign(p.x) * g; }
  p.x += 0.02 * noise(p.x * 3, p.y * 3, p.z * 3); p.z += 0.02 * noise(p.z * 3, p.x * 3, p.y * 3);
  const s = (p.x - W / 2 + 0.0) * chip.x + (p.y - H / 2) * chip.y + (p.z - D / 2) * chip.z; if (s > -0.42) p.addScaledVector(chip, -0.42 - s);
});
add(ge, chalk, 0, H / 2, 0);
