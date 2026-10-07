// chalk_block c3: two-part reading. A jittered main block with its top-front edge cut away in a stepped chip, plus the chipped-off fragment lying at its foot and a wedge of spall; banded faces from two inset slab skins.
const chalk = M(0xe8e2d4, 'stone', 0.95, { flatShading: true }), chalk2 = M(0xd9d2c1, 'stone', 0.95, { flatShading: true });
const jit = (ge, k) => warp(ge, (p) => { p.x += k * noise(p.x * 4, p.y * 4, p.z * 4); p.y += k * 0.6 * noise(p.y * 4, p.z * 4, p.x * 4); p.z += k * noise(p.z * 4, p.x * 4, p.y * 4); });
add(jit(new THREE.BoxGeometry(1.6, 1.0, 1.1, 2, 2, 2), 0.03), chalk, 0, 0.5, 0);
add(jit(new THREE.BoxGeometry(1.6, 0.3, 0.75, 2, 1, 1), 0.03), chalk, 0, 1.15, -0.175);
add(jit(new THREE.BoxGeometry(1.0, 0.3, 0.33, 1, 1, 1), 0.02), chalk2, -0.3, 1.15, 0.36);
add(jit(new THREE.BoxGeometry(1.64, 0.18, 1.14), 0.01), chalk2, 0, 0.35, 0);
add(jit(new THREE.BoxGeometry(1.64, 0.14, 1.14), 0.01), chalk2, 0, 0.75, 0);
add(new THREE.DodecahedronGeometry(0.2, 0), chalk, 0.75, 0.1, 0.75, 0.3, 0.5, 0, 1.3, 0.6, 1);
add(new THREE.TetrahedronGeometry(0.16, 0), chalk2, 0.35, 0.07, 0.8, 0.6, 0.2, 0.4);
