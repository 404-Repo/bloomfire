// boulder c1: displaced icosphere. A detail-1 icosahedron stretched wider than tall, pushed about with low-frequency noise, flat-bottomed where it sits, flat shaded so the facets read as weathered planes; two small chip stones at its foot.
const lime = M(0xcfc3a5, 'stone', 0.95, { flatShading: true }), lime2 = M(0xbfb294, 'stone', 0.95, { flatShading: true });
const ge = warp(new THREE.IcosahedronGeometry(1, 1), (p) => { p.multiplyScalar(1 + 0.22 * noise(p.x * 1.6 + 0.3, p.y * 1.6, p.z * 1.6 + 1.1) + 0.08 * Math.sin(p.x * 4 + p.z * 3)); p.x *= 1.25; p.z *= 1.0; p.y *= 0.95; if (p.y < -0.55) p.y = -0.55; });
add(ge, lime, 0, 0.55, 0, 0, 0.4, 0, 1, 1.1, 1);
add(new THREE.DodecahedronGeometry(0.22, 0), lime2, 1.25, 0.12, 0.5, 0.5, 0.2, 0.3, 1, 0.6, 1);
add(new THREE.DodecahedronGeometry(0.16, 0), lime2, -0.9, 0.08, -0.85, 0.2, 0.9, 0.1, 1.2, 0.6, 1);
