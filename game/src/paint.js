// The colour mask: where the valley has its colour back. One byte per 1.25 m over the whole world.
// Kills splat into it; every lit material reads it and blends its ink-wash grade toward true colour.
import * as THREE from 'three';
import { WORLD, HALF } from './layout.js';

export const RES = 512;
const data = new Uint8Array(RES * RES);
export const maskTex = new THREE.DataTexture(data, RES, RES, THREE.RedFormat, THREE.UnsignedByteType);
maskTex.magFilter = THREE.LinearFilter; maskTex.minFilter = THREE.LinearFilter; maskTex.wrapS = maskTex.wrapT = THREE.ClampToEdgeWrapping;
maskTex.needsUpdate = true;

export const U = {
  uPaint: { value: maskTex },
  uWorld: { value: new THREE.Vector2(HALF, WORLD) },   // half size, size
  uTime: { value: 0 },
  uGlobal: { value: 0 },        // 0..1 how much of the whole world is forced painted (the finale)
  uInkTint: { value: new THREE.Color(0x24304a) },
  uPaper: { value: new THREE.Color(0xd9dde4) },
};

let dirty = false;
const waves = [];          // expanding splats: { x, z, r, R, speed, s }
let painted = 0;           // sum of mask bytes, for the restored percentage
let landTexels = RES * RES; // texels that count (set by setLandMask)
let land = null;

export function setLandMask(fn) {   // fn(x,z) -> true where the ground counts toward "restored"
  land = new Uint8Array(RES * RES); landTexels = 0;
  for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
    const x = -HALF + (i + 0.5) * WORLD / RES, z = -HALF + (j + 0.5) * WORLD / RES;
    if (fn(x, z)) { land[j * RES + i] = 1; landTexels++; }
  }
}

function stamp(x, z, r, s) {
  const tex = WORLD / RES, ci = (x + HALF) / tex, cj = (z + HALF) / tex, rr = r / tex;
  const i0 = Math.max(0, Math.floor(ci - rr - 1)), i1 = Math.min(RES - 1, Math.ceil(ci + rr + 1));
  const j0 = Math.max(0, Math.floor(cj - rr - 1)), j1 = Math.min(RES - 1, Math.ceil(cj + rr + 1));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const d = Math.hypot(i + 0.5 - ci, j + 0.5 - cj) / rr; if (d >= 1) continue;
    const v = Math.round(255 * s * Math.min(1, (1 - d) * 2.2));
    const k = j * RES + i; if (v > data[k]) { if (!land || land[k]) painted += v - data[k]; data[k] = v; dirty = true; }
  }
}

// A burst of colour that grows from 0 to R metres over R/speed seconds.
export function splat(x, z, R, { speed = 26, strength = 1 } = {}) { waves.push({ x, z, r: 0, R, speed, s: strength }); }
export function splatNow(x, z, R, strength = 1) { stamp(x, z, R, strength); }

// The ink creeps back near a living inkwell: fade the mask inside a ring.
export function creep(x, z, R, amount) {
  const tex = WORLD / RES, ci = (x + HALF) / tex, cj = (z + HALF) / tex, rr = R / tex;
  const i0 = Math.max(0, Math.floor(ci - rr)), i1 = Math.min(RES - 1, Math.ceil(ci + rr));
  const j0 = Math.max(0, Math.floor(cj - rr)), j1 = Math.min(RES - 1, Math.ceil(cj + rr));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    if (Math.hypot(i - ci, j - cj) > rr) continue;
    const k = j * RES + i, v = data[k]; if (!v) continue;
    const nv = Math.max(0, v - amount); if (!land || land[k]) painted -= v - nv; data[k] = nv; dirty = true;
  }
}

export function maskAt(x, z) {
  const tex = WORLD / RES, i = Math.floor((x + HALF) / tex), j = Math.floor((z + HALF) / tex);
  if (i < 0 || j < 0 || i >= RES || j >= RES) return 0; return data[j * RES + i] / 255;
}
export function restoredFraction() { return Math.min(1, painted / (255 * landTexels)); }

let lastUpload = 0;
export function updatePaint(dt, now) {
  U.uTime.value = now;
  for (let i = waves.length - 1; i >= 0; i--) {
    const w = waves[i]; w.r = Math.min(w.R, w.r + w.speed * dt);
    stamp(w.x, w.z, Math.max(1.2, w.r), w.s);
    if (w.r >= w.R) waves.splice(i, 1);
  }
  if (dirty && now - lastUpload > 0.05) { maskTex.needsUpdate = true; dirty = false; lastUpload = now; }
}

// Draw the mask into a 2D canvas (the end card map).
export function drawMap(ctx, w, h, landFn) {
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = Math.floor(x / w * RES), j = Math.floor(y / h * RES), m = data[j * RES + i] / 255, k = (y * w + x) * 4;
    const isLand = !land || land[j * RES + i];
    const ink = [40, 48, 70], col = [232, 176, 92];
    img.data[k] = isLand ? ink[0] + (col[0] - ink[0]) * m : 30; img.data[k + 1] = isLand ? ink[1] + (col[1] - ink[1]) * m : 60; img.data[k + 2] = isLand ? ink[2] + (col[2] - ink[2]) * m : 90; img.data[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// ---- the shader patch --------------------------------------------------------------------------
// World position is computed with the instance matrix applied explicitly: three's own path does not
// fold instanceMatrix into the world position, so a world-space effect would run in local space on
// every instanced object (a known silent trap).
const VERT_DECL = 'varying vec3 vPW;\n';
const VERT_BODY = `
  { vec4 pw = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    pw = instanceMatrix * pw;
  #endif
    vPW = (modelMatrix * pw).xyz; }
`;
export const PAINT_FRAG_DECL = `
varying vec3 vPW;
uniform sampler2D uPaint; uniform vec2 uWorld; uniform float uTime; uniform float uGlobal;
uniform vec3 uInkTint; uniform vec3 uPaper;
float ph21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float pnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(ph21(i),ph21(i+vec2(1,0)),u.x), mix(ph21(i+vec2(0,1)),ph21(i+vec2(1,1)),u.x), u.y); }
float paintAmount(vec3 p, out float edge){
  vec2 uv = (p.xz + uWorld.x) / uWorld.y;
  float m = texture2D(uPaint, uv).r;
  float n = pnoise(p.xz*0.55 + p.y*0.3)*0.55 + pnoise(p.xz*2.1)*0.25;
  float v = m + (n - 0.4)*0.42;
  float k = smoothstep(0.42, 0.58, v);
  edge = (1.0 - abs(k*2.0-1.0)) * step(0.02, m);
  return max(k, uGlobal);
}
vec3 inkWash(vec3 c, vec3 p){
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  l = pow(clamp(l*1.25, 0.0, 1.0), 0.85);
  float grain = pnoise(p.xz*3.0 + p.y*2.0)*0.08 - 0.04;
  vec3 ink = mix(uInkTint, uPaper, clamp(l + grain, 0.0, 1.0));
  return ink;
}
`;
const FRAG_BODY = `
  { float pEdge; float pk = paintAmount(vPW, pEdge);
    vec3 washed = inkWash(outgoingLight, vPW);
    outgoingLight = mix(washed, outgoingLight * (1.0 + 0.12*pEdge), pk);
    outgoingLight += vec3(1.0, 0.62, 0.22) * pEdge * 0.35 * (1.0 - uGlobal); }
`;

export function patchMaterial(mat) {
  if (mat.userData.painted || mat.userData.noPaint) return mat;
  mat.userData.painted = true;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    Object.assign(sh.uniforms, U);
    sh.vertexShader = VERT_DECL + sh.vertexShader.replace('#include <fog_vertex>', '#include <fog_vertex>\n' + VERT_BODY);
    sh.fragmentShader = PAINT_FRAG_DECL + sh.fragmentShader.replace('#include <opaque_fragment>', FRAG_BODY + '\n#include <opaque_fragment>');
  };
  const key = mat.customProgramCacheKey ? mat.customProgramCacheKey.bind(mat) : () => '';
  mat.customProgramCacheKey = () => key() + '|paint';
  mat.needsUpdate = true;
  return mat;
}
export function patchTree(root) {
  root.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(patchMaterial); });
}
