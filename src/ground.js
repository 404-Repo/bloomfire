// Terrain mesh (4x4 chunks, so the far side can be culled), its splatted ground material, and water.
import * as THREE from 'three';
import { N, STEP, polyDist, riverLevel } from './terrain.js';
import { HALF, RIVER, LAKE } from './layout.js';
import { patchMaterial } from './paint.js';

export const groundU = {
  tGrass: { value: null }, tDirt: { value: null }, tRock: { value: null }, tCobble: { value: null }, uHasTex: { value: 0 },
};

export function makeGround(T) {
  const CH = 4, cells = (N - 1) / CH;
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 });
  mat.name = 'ground_splat';
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, groundU);
    sh.vertexShader = 'attribute vec2 aPath; varying vec2 vPath; varying vec3 vGW; varying vec3 vGN;\n' + sh.vertexShader
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n vPath = aPath; vGW = (modelMatrix*vec4(position,1.0)).xyz; vGN = normal;');
    sh.fragmentShader = `varying vec2 vPath; varying vec3 vGW; varying vec3 vGN;
      uniform sampler2D tGrass; uniform sampler2D tDirt; uniform sampler2D tRock; uniform sampler2D tCobble; uniform float uHasTex;
      float gh(vec2 p){ p = fract(p*vec2(233.34, 851.73)); p += dot(p, p+23.45); return fract(p.x*p.y); }
      float gn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(gh(i),gh(i+vec2(1,0)),u.x), mix(gh(i+vec2(0,1)),gh(i+vec2(1,1)),u.x), u.y); }
      vec3 tri(sampler2D t, vec3 p, vec3 n, float s){ vec3 b = pow(abs(n), vec3(4.0)); b /= (b.x+b.y+b.z);
        return texture2D(t, p.zy*s).rgb*b.x + texture2D(t, p.xz*s).rgb*b.y + texture2D(t, p.xy*s).rgb*b.z; }
    ` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      {
        vec3 n = normalize(vGN); float slope = 1.0 - n.y;
        float big = gn(vGW.xz*0.035), mid = gn(vGW.xz*0.21), fine = gn(vGW.xz*1.7);
        vec3 grass = mix(vec3(0.42,0.47,0.20), vec3(0.62,0.60,0.30), smoothstep(0.35,0.75,big));
        grass = mix(grass, vec3(0.50,0.52,0.24), mid*0.35) * (0.86 + fine*0.22);
        vec3 dirt = mix(vec3(0.55,0.43,0.30), vec3(0.66,0.55,0.40), mid) * (0.88 + fine*0.2);
        vec3 cob = mix(vec3(0.60,0.55,0.48), vec3(0.72,0.66,0.56), mid);
        { vec2 c = vGW.xz*2.4; vec2 f = fract(c + vec2(0.5*floor(c.y), 0.0)); float g = smoothstep(0.0,0.12,f.x)*smoothstep(1.0,0.88,f.x)*smoothstep(0.0,0.14,f.y)*smoothstep(1.0,0.86,f.y); cob *= 0.62 + 0.38*g; }
        vec3 rock = mix(vec3(0.62,0.58,0.50), vec3(0.78,0.74,0.66), mid) * (0.8 + fine*0.3);
        vec3 sand = vec3(0.72,0.64,0.50) * (0.9+fine*0.15);
        if (uHasTex > 0.5) {
          grass = mix(grass, tri(tGrass, vGW, n, 0.22) * vec3(1.0,1.0,0.95), 0.75) ;
          dirt = mix(dirt, tri(tDirt, vGW, n, 0.25), 0.8);
          rock = mix(rock, tri(tRock, vGW, n, 0.12), 0.8);
          cob = mix(cob, tri(tCobble, vGW, n, 0.3), 0.85);
        }
        vec3 c = grass;
        c = mix(c, sand, smoothstep(${(RIVER.level0 + 1.6).toFixed(1)}, 0.0, vGW.y - 0.0) * 0.0);
        c = mix(c, rock, smoothstep(0.30, 0.48, slope + (mid-0.5)*0.12));
        float path = vPath.x; c = mix(c, mix(dirt, cob, vPath.y), smoothstep(0.25, 0.75, path + (fine-0.5)*0.35));
        diffuseColor.rgb = c;
      }`).replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(0.97, 0.82, vPath.y*vPath.x);`);
  };
  patchMaterial(mat);
  const group = new THREE.Group();
  for (let cj = 0; cj < CH; cj++) for (let ci = 0; ci < CH; ci++) {
    const vx = cells + 1, pos = new Float32Array(vx * vx * 3), pth = new Float32Array(vx * vx * 2), idx = [];
    for (let j = 0; j <= cells; j++) for (let i = 0; i <= cells; i++) {
      const gi = ci * cells + i, gj = cj * cells + j, k = j * vx + i, g = gj * N + gi;
      pos[k * 3] = -HALF + gi * STEP; pos[k * 3 + 1] = T.H[g]; pos[k * 3 + 2] = -HALF + gj * STEP;
      pth[k * 2] = T.P[g] / 255; pth[k * 2 + 1] = T.K[g];
    }
    for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) {
      const a = j * vx + i, b = a + 1, c = a + vx, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aPath', new THREE.BufferAttribute(pth, 2));
    geo.setIndex(idx); geo.computeVertexNormals(); geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.name = 'ground';
    group.add(m);
  }
  // a skirt beyond the edge of the world so the horizon is never a cliff
  const skirt = new THREE.Mesh(new THREE.RingGeometry(HALF * 1.38, 900, 48, 1), new THREE.MeshStandardMaterial({ color: 0x8a8460, roughness: 1 }));
  skirt.rotation.x = -Math.PI / 2; skirt.position.y = 22; patchMaterial(skirt.material); group.add(skirt);
  return group;
}

// Water: the river as a ribbon that steps down with the level, and the lake as a disc.
export const waterU = { uT: { value: 0 } };
export function makeWater() {
  const mat = new THREE.MeshStandardMaterial({ color: 0x3f7f8c, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.86 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, waterU);
    sh.vertexShader = 'varying vec3 vWW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vWW = (modelMatrix*vec4(position,1.0)).xyz;');
    sh.fragmentShader = 'varying vec3 vWW; uniform float uT;\n' + sh.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      { float a = sin(vWW.x*0.9 + uT*1.3) + sin(vWW.z*1.3 - uT*1.7) + sin((vWW.x+vWW.z)*2.7 + uT*2.3)*0.5;
        float b = cos(vWW.z*0.8 + uT*1.1) + cos(vWW.x*1.7 - uT*1.5) + cos((vWW.x-vWW.z)*2.3 - uT*2.0)*0.5;
        normal = normalize(normal + vec3(a, 0.0, b)*0.05); }`);
  };
  patchMaterial(mat);
  const g = new THREE.Group();
  // river ribbon
  const pts = RIVER.pts, pos = [], idx = []; let acc = 0, total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const samples = [];
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i], L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 4);
    for (let k = 0; k < n; k++) { const t = k / n; samples.push([ax + (bx - ax) * t, az + (bz - az) * t, (acc + L * t) / total]); }
    acc += L;
  }
  samples.push([pts[pts.length - 1][0], pts[pts.length - 1][1], 1]);
  const W = RIVER.width * 0.9;
  samples.forEach(([x, z, s], i) => {
    const nx = samples[Math.min(i + 1, samples.length - 1)], pv = samples[Math.max(i - 1, 0)];
    let dx = nx[0] - pv[0], dz = nx[1] - pv[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const y = riverLevel(s);
    pos.push(x - dz * W, y, z + dx * W, x + dz * W, y, z - dx * W);
    if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  });
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); rg.setIndex(idx); rg.computeVertexNormals();
  g.add(new THREE.Mesh(rg, mat));
  const lake = new THREE.Mesh(new THREE.CircleGeometry(LAKE.r * 1.1, 48), mat);
  lake.rotation.x = -Math.PI / 2; lake.position.set(LAKE.at[0], LAKE.level, LAKE.at[1]);
  g.add(lake);
  return g;
}
export function waterLevelAt(x, z) {
  const [d, s] = polyDist(x, z, RIVER.pts);
  if (d < RIVER.width) return riverLevel(s);
  if (Math.hypot(x - LAKE.at[0], z - LAKE.at[1]) < LAKE.r) return LAKE.level;
  return -99;
}
