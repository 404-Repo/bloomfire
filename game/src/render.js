// Renderer, lights, sky, fog, and the ink-outline post pass.
import * as THREE from 'three';
import { U, PAINT_FRAG_DECL } from './paint.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const canvas = document.getElementById('c');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
const DPR = Math.min(window.devicePixelRatio || 1, isTouch ? 2 : 1.75);
renderer.setPixelRatio(DPR);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.info.autoReset = false;

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(60, 1, 0.08, 760);
camera.rotation.order = 'YXZ';

// the sun: low in the west-south-west, late afternoon. The second temperature is the cool sky fill.
export const SUN_DIR = new THREE.Vector3(-0.78, 0.36, 0.38).normalize();
export const sun = new THREE.DirectionalLight(0xffd3a1, 3.1);
sun.castShadow = true;
sun.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
const SH = 46; Object.assign(sun.shadow.camera, { left: -SH, right: SH, top: SH, bottom: -SH, near: 1, far: 260 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);
export const hemi = new THREE.HemisphereLight(0x8eaee0, 0x5e4c3a, 1.05);
scene.add(hemi);
export const fog = new THREE.Fog(new THREE.Color().setHex(0xd9cdbb, THREE.SRGBColorSpace), 140, 950);
scene.fog = fog;

export function followShadow(p) {
  const s = sun.shadow.camera;
  const snap = 2 * SH / sun.shadow.mapSize.x;
  const tx = Math.round(p.x / snap) * snap, tz = Math.round(p.z / snap) * snap;
  sun.target.position.set(tx, p.y, tz);
  sun.position.set(tx + SUN_DIR.x * 140, p.y + SUN_DIR.y * 140, tz + SUN_DIR.z * 140);
  s.updateProjectionMatrix();
}

// ---- sky ------------------------------------------------------------------------------------------
export const skyU = { uSun: { value: SUN_DIR.clone() }, uWarm: { value: 0 }, uTex: { value: null }, uHasTex: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(720, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.0); gl_Position = (projectionMatrix*p).xyww; }`,
  fragmentShader: `varying vec3 vD; uniform vec3 uSun; uniform float uWarm; uniform sampler2D uTex; uniform float uHasTex;
  void main(){
    vec3 d = normalize(vD); float h = d.y;
    vec3 zen = vec3(0.18,0.33,0.62), hor = vec3(0.98,0.80,0.58), low = vec3(0.86,0.72,0.60);
    vec3 c = mix(hor, zen, pow(clamp(h,0.0,1.0), 0.55));
    if (h < 0.0) c = mix(hor, low, clamp(-h*4.0,0.0,1.0));
    if (uHasTex > 0.5) { float u = atan(d.x, -d.z)/6.2831853 + 0.5; float v = clamp(asin(clamp(h,-1.0,1.0))/3.14159 + 0.5, 0.0, 1.0); vec3 t = texture2D(uTex, vec2(u, v)).rgb; t = pow(t, vec3(2.2)); c = mix(c, t*1.15, smoothstep(-0.02, 0.04, h)); }
    float s = max(dot(d, uSun), 0.0);
    c += vec3(1.0,0.72,0.4)*pow(s, 8.0)*0.55 + vec3(1.0,0.9,0.7)*pow(s, 600.0)*6.0;
    // the ink: a cold paper wash over the sky until the valley is restored
    float l = dot(c, vec3(0.3,0.59,0.11));
    vec3 ink = mix(vec3(0.16,0.2,0.3), vec3(0.85,0.87,0.9), clamp(l*0.9,0.0,1.0));
    c = mix(ink, c, 0.35 + 0.65*uWarm);
    gl_FragColor = vec4(c, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`,
}));
sky.renderOrder = -10; sky.frustumCulled = false;
scene.add(sky);
export function setSkyTexture(tex) { skyU.uTex.value = tex; skyU.uHasTex.value = 1; }
export function skyFollow(p) { sky.position.copy(p); }

// ---- post: ink outlines that fade where colour has returned -------------------------------------
let rt = null;
const postU = {
  tColor: { value: null }, tDepth: { value: null }, uRes: { value: new THREE.Vector2() },
  uNear: { value: camera.near }, uFar: { value: camera.far },
  uProjInv: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() },
  uPx: { value: 1 }, uFlash: { value: 0 }, uHurt: { value: 0 }, uLines: { value: 1 },
  ...U,
};
const postMat = new THREE.ShaderMaterial({
  uniforms: postU, depthTest: false, depthWrite: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `#include <packing>
  ${PAINT_FRAG_DECL.replace('varying vec3 vPW;', '')}
  varying vec2 vUv; uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 uRes; uniform float uNear; uniform float uFar;
  uniform mat4 uProjInv; uniform mat4 uCamWorld; uniform float uPx; uniform float uFlash; uniform float uHurt; uniform float uLines;
  float vz(vec2 uv){ float d = texture2D(tDepth, uv).x; return -perspectiveDepthToViewZ(d, uNear, uFar); }
  vec3 vpos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 p = uProjInv * vec4(uv*2.0-1.0, d*2.0-1.0, 1.0); return p.xyz / p.w; }
  void main(){
    vec3 col = texture2D(tColor, vUv).rgb;
    float d0 = texture2D(tDepth, vUv).x;
    if (d0 < 0.99999 && uLines > 0.5) {
      vec2 px = uPx / uRes;
      // 3x3 view positions: silhouettes from depth jumps, creases from normals that disagree
      vec3 C = vpos(vUv), L = vpos(vUv - vec2(px.x,0.0)), Rr = vpos(vUv + vec2(px.x,0.0)), Uu = vpos(vUv + vec2(0.0,px.y)), D = vpos(vUv - vec2(0.0,px.y));
      vec3 UL = vpos(vUv + vec2(-px.x,px.y)), UR = vpos(vUv + px), DL = vpos(vUv - px), DR = vpos(vUv + vec2(px.x,-px.y));
      float z = -C.z;
      vec3 nC = normalize(cross(Rr - L, Uu - D));
      vec3 nL = normalize(cross(C - L, UL - DL)), nR = normalize(cross(Rr - C, UR - DR)), nU = normalize(cross(UR - UL, Uu - C)), nD = normalize(cross(DR - DL, C - D));
      float crease = max(max(1.0 - dot(nC, nL), 1.0 - dot(nC, nR)), max(1.0 - dot(nC, nU), 1.0 - dot(nC, nD)));
      float sil = max(max(abs(L.z - C.z), abs(Rr.z - C.z)), max(abs(Uu.z - C.z), abs(D.z - C.z))) / max(z, 0.5);
      float line = smoothstep(0.12, 0.35, crease) * 0.85 + smoothstep(0.04, 0.12, sil);
      line = clamp(line, 0.0, 1.0) * (1.0 - smoothstep(70.0, 260.0, z) * 0.7);
      vec4 ndc = vec4(vUv*2.0-1.0, d0*2.0-1.0, 1.0); vec4 vp = uProjInv * ndc; vp /= vp.w; vec3 wp = (uCamWorld * vp).xyz;
      float e; float pk = paintAmount(wp, e);
      // on the ink side, the surface texture itself is drawn: luminance edges become pen strokes
      vec2 tp = px * 1.0;
      float lC = dot(col, vec3(0.3,0.59,0.11));
      float lx = dot(texture2D(tColor, vUv + vec2(tp.x,0.0)).rgb - texture2D(tColor, vUv - vec2(tp.x,0.0)).rgb, vec3(0.3,0.59,0.11));
      float ly = dot(texture2D(tColor, vUv + vec2(0.0,tp.y)).rgb - texture2D(tColor, vUv - vec2(0.0,tp.y)).rgb, vec3(0.3,0.59,0.11));
      float le = length(vec2(lx, ly)) / max(lC, 0.15);
      line = max(line, smoothstep(0.10, 0.32, le) * 0.55 * (1.0 - pk) * (1.0 - smoothstep(40.0, 140.0, z)));
      vec3 inkC = mix(vec3(0.05,0.06,0.11), vec3(0.20,0.11,0.06), pk);
      col = mix(col, inkC, line * mix(0.9, 0.55, pk));
    }
    col += vec3(1.0,0.78,0.45) * uFlash;
    vec2 q = vUv - 0.5; float vig = 1.0 - dot(q, q) * 0.55; col *= vig;
    col = mix(col, col * vec3(1.25, 0.55, 0.75), uHurt * smoothstep(0.15, 0.55, length(q)));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`,
});
const postScene = new THREE.Scene();
const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat); postQuad.frustumCulled = false;
postScene.add(postQuad);
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
export const post = postU;

export function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  const aspect = w / h;
  camera.aspect = aspect;
  const hf = THREE.MathUtils.degToRad(84);
  camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hf / 2) / aspect)), 50, 90);
  camera.updateProjectionMatrix();
  const bw = Math.floor(w * DPR), bh = Math.floor(h * DPR);
  if (rt) rt.dispose();
  rt = new THREE.WebGLRenderTarget(bw, bh, { type: THREE.HalfFloatType, depthBuffer: true });
  rt.depthTexture = new THREE.DepthTexture(bw, bh, THREE.UnsignedIntType);
  postU.tColor.value = rt.texture; postU.tDepth.value = rt.depthTexture; postU.uRes.value.set(bw, bh);
  postU.uPx.value = Math.max(1, DPR * 0.85);
}

// the first-person rifle draws in its own scene after a depth clear, so it never clips into a wall
export const vmScene = new THREE.Scene();
const vmKey = new THREE.DirectionalLight(0xffd8a8, 2.4); vmKey.position.set(-1, 1.2, 0.6);
const vmFill = new THREE.HemisphereLight(0x9ab6e6, 0x5a4636, 1.2);
vmScene.add(vmKey, vmFill);
{ // a soft room reflection so the brass reads as metal, not as dark plastic
  const pm = new THREE.PMREMGenerator(renderer); vmScene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; vmScene.environmentIntensity = 0.55; pm.dispose(); }
export const vmCam = new THREE.PerspectiveCamera(52, 1, 0.01, 10);
renderer.autoClear = false;

export function draw() {
  renderer.info.reset();
  renderer.setRenderTarget(rt);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.clear();
  postU.uProjInv.value.copy(camera.projectionMatrixInverse);
  postU.uCamWorld.value.copy(camera.matrixWorld);
  renderer.render(postScene, postCam);
  vmCam.aspect = camera.aspect; vmCam.fov = Math.min(64, Math.max(46, camera.fov * 0.8)); vmCam.updateProjectionMatrix();
  renderer.clearDepth();
  renderer.render(vmScene, vmCam);
}
