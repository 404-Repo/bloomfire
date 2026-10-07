// BLOOMFIRE, the floor build: one pass, one agent, no loop.
import * as THREE from 'three';
import { ASSET, preloadAssets } from './assetlib.js';
import { createRig } from './rig.js';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
let seed = 12345; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* ---------------------------------------------------------------- terrain */
const gauss = (x, z, cx, cz, r, h) => h * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r));
function H(x, z) {
  let h = 2.5 * Math.sin(x * 0.021) * Math.cos(z * 0.017) + 1.2 * Math.sin(x * 0.07 + z * 0.05);
  h += gauss(x, z, -190, 170, 75, 40);       // Lampwright's Rise
  h += gauss(x, z, -130, 110, 60, 12);       // terrace slope
  h += gauss(x, z, -160, -140, 65, 30);      // Windmill Ridge
  h += gauss(x, z, 150, -160, 60, 26) - gauss(x, z, 150, -160, 22, 18); // quarry hill and pit
  h += gauss(x, z, 40, -290, 95, 65);        // north mountain
  h += gauss(x, z, 110, 20, 45, 6);          // market mound
  const rx = x + 20 + 12 * Math.sin(z / 55);
  h -= 5 * Math.exp(-(rx * rx) / 200);       // river
  return h;
}
const RIVER_X = (z) => -20 - 12 * Math.sin(z / 55);

const PLACES = {
  rise: [-190, 170], terraces: [-110, 90], millbrook: [-20, -10], market: [110, 20], ridge: [-160, -140], quarry: [150, -160], chapel: [40, -290],
};

/* ---------------------------------------------------------------- renderer */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.08, 420);
scene.add(camera);
const rig = createRig(THREE, renderer, scene, { hour: 16.8, azimuth: 250, fogStart: 60, fogDensity: 0.003 });
function fitFov() { const a = innerWidth / innerHeight; camera.aspect = a; camera.fov = a < 1 ? 88 : 70; camera.updateProjectionMatrix(); }
fitFov();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); fitFov(); rig.resize(innerWidth, innerHeight); });

/* ink and paint colours */
const INK = new THREE.Color(0x2c3344), PAPER = new THREE.Color(0x6a7080);
function inkOf(c) {
  const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return INK.clone().lerp(PAPER, clamp(l * 1.3, 0, 1));
}

// terrain mesh with per-vertex paint
const TW = 560, TD = 640, TX = 0, TZ = -40, SEG_X = 224, SEG_Z = 256;
const tgeo = new THREE.PlaneGeometry(TW, TD, SEG_X, SEG_Z); tgeo.rotateX(-Math.PI / 2);
const tpos = tgeo.attributes.position;
const N = tpos.count;
const paint = new Float32Array(N), colInk = new Float32Array(N * 3), colPaint = new Float32Array(N * 3);
const tcol = new Float32Array(N * 3);
{
  const grass = new THREE.Color(0x8a9a48), dry = new THREE.Color(0xb59a62), rock = new THREE.Color(0xd8cdb4), c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const x = tpos.getX(i) + TX, z = tpos.getZ(i) + TZ; const y = H(x, z); tpos.setXYZ(i, x, y, z);
    const slope = Math.abs(H(x + 1, z) - y) + Math.abs(H(x, z + 1) - y);
    c.copy(grass).lerp(dry, clamp(0.5 + 0.5 * Math.sin(x * 0.05) * Math.cos(z * 0.04), 0, 1) * 0.7).lerp(rock, clamp((slope - 0.6) * 1.2, 0, 0.9));
    if (Math.hypot(x - 150, z + 160) < 26) c.lerp(new THREE.Color(0xe8e2d4), 0.8);
    const k = inkOf(c); const n = 0.92 + 0.08 * Math.sin(x * 1.3 + z * 0.7);
    colPaint.set([c.r, c.g, c.b], i * 3); colInk.set([k.r * n, k.g * n, k.b * n], i * 3);
  }
  tgeo.computeVertexNormals();
}
tgeo.setAttribute('color', new THREE.BufferAttribute(tcol, 3));
function refreshTerrainColors(i0 = 0, i1 = N) {
  for (let i = i0; i < i1; i++) { const p = paint[i]; for (let k = 0; k < 3; k++) tcol[i * 3 + k] = colInk[i * 3 + k] + (colPaint[i * 3 + k] - colInk[i * 3 + k]) * p; }
}
refreshTerrainColors();
const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
const terrain = new THREE.Mesh(tgeo, terrainMat); terrain.receiveShadow = true; scene.add(terrain);

// river
{
  const pts = []; for (let z = -300; z <= 260; z += 10) pts.push(z);
  const g = new THREE.BufferGeometry(); const v = [], idx = [];
  pts.forEach((z, i) => { const x = RIVER_X(z); v.push(x - 6, -1.6, z, x + 6, -1.6, z); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
  const river = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x3f6f7a, roughness: 0.15, metalness: 0.1 }));
  scene.add(river);
}

/* ---------------------------------------------------------------- props */
const props = [];       // { obj, x, z, r, painted, meshes:[{mesh, paintMat, inkMat}] }
const colliders = [];   // [x, z, r]
const inkCache = new Map();
function inkMaterial(m) {
  let k = inkCache.get(m);
  if (!k) { k = m.clone(); k.color = inkOf(m.color); if (k.emissive) k.emissiveIntensity *= 0.15; inkCache.set(m, k); }
  return k;
}
async function place(url, x, z, opts = {}) {
  const o = await ASSET(url, { surfaces: opts.surfaces !== false, height: opts.height });
  o.position.set(x, H(x, z) - (opts.sink || 0.05), z); o.rotation.y = opts.ry ?? rnd() * Math.PI * 2;
  if (opts.scale) o.scale.multiplyScalar(opts.scale);
  scene.add(o);
  const meshes = [];
  o.traverse((n) => { if (n.isMesh) { const pm = n.material; const im = inkMaterial(pm); n.material = im; meshes.push({ mesh: n, paintMat: pm, inkMat: im }); } });
  const p = { obj: o, x, z, painted: false, meshes };
  props.push(p);
  if (opts.col) colliders.push([x, z, opts.col]);
  return o;
}

/* ---------------------------------------------------------------- enemies */
const enemies = [];
let protoBlot, protoSmear, protoWell;
const wells = [];

/* ---------------------------------------------------------------- flowers (instanced) */
let flowerIM = [], flowerCount = 0; const FLOWER_MAX = 900;
function addFlower(x, z) {
  if (flowerCount >= FLOWER_MAX || !flowerIM.length) return;
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, H(x, z) - 0.02, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.28), new THREE.Vector3().setScalar(0.8 + rnd() * 0.8));
  for (const im of flowerIM) { im.setMatrixAt(flowerCount, m); im.count = flowerCount + 1; im.instanceMatrix.needsUpdate = true; }
  flowerCount++;
}

/* ---------------------------------------------------------------- game state */
const G = {
  pos: [PLACES.rise[0] + 8, PLACES.rise[1] - 10], fps: 0, speed: 0, score: 0, over: false, draws: 0, tris: 0,
  hp: 100, shots: 0, kills: 0, combo: 1, restored: 0, wells: 0, started: false, won: false,
};
window.__GAME__ = G;

const player = { x: G.pos[0], z: G.pos[1], yaw: Math.atan2(-(PLACES.terraces[0] - G.pos[0]), -(PLACES.terraces[1] - G.pos[1])), pitch: -0.03, vx: 0, vz: 0, dash: 0, dashCharges: 2, dashT: 0, bloom: 0, inv: 0 };
window.__DBG = { player, wells, enemies };
let comboT = 0, fireCd = 0, lastLantern = [player.x, player.z];
let best = 0; try { best = +localStorage.getItem('bloomfire.best') || 0; } catch (e) { /* none */ }

/* ---------------------------------------------------------------- paint */
const half = new THREE.Vector2(TW / 2, TD / 2);
function paintAt(x, z, r) {
  const gx0 = Math.floor((x - r - (TX - TW / 2)) / TW * SEG_X), gx1 = Math.ceil((x + r - (TX - TW / 2)) / TW * SEG_X);
  const gz0 = Math.floor((z - r - (TZ - TD / 2)) / TD * SEG_Z), gz1 = Math.ceil((z + r - (TZ - TD / 2)) / TD * SEG_Z);
  let minI = N, maxI = 0;
  for (let gz = Math.max(0, gz0); gz <= Math.min(SEG_Z, gz1); gz++) for (let gx = Math.max(0, gx0); gx <= Math.min(SEG_X, gx1); gx++) {
    const i = gz * (SEG_X + 1) + gx; const d = Math.hypot(tpos.getX(i) - x, tpos.getZ(i) - z);
    const t = clamp(1.25 - d / r, 0, 1); if (t > paint[i]) { paint[i] = t; minI = Math.min(minI, i); maxI = Math.max(maxI, i); }
  }
  if (maxI >= minI) { refreshTerrainColors(minI, maxI + 1); tgeo.attributes.color.needsUpdate = true; }
  for (const p of props) if (!p.painted && Math.hypot(p.x - x, p.z - z) < r + 2) { p.painted = true; for (const m of p.meshes) m.mesh.material = m.paintMat; }
  const nf = Math.round(r * 0.8); for (let i = 0; i < nf; i++) { const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r * 0.9; addFlower(x + Math.cos(a) * d, z + Math.sin(a) * d); }
  let s = 0; for (let i = 0; i < N; i += 7) s += paint[i]; G.restored = Math.round(1000 * s / (N / 7)) / 10;
}

/* ---------------------------------------------------------------- fx */
const boltMat = new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.9, fog: false });
const boltGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 5); boltGeo.rotateX(Math.PI / 2); boltGeo.translate(0, 0, 0.5);
const bolts = []; for (let i = 0; i < 10; i++) { const b = new THREE.Mesh(boltGeo, boltMat); b.visible = false; b.userData.t = 0; scene.add(b); bolts.push(b); }
const sparkGeo = new THREE.BufferGeometry(); const SPARKS = 240; const sp = new Float32Array(SPARKS * 3), sv = new Float32Array(SPARKS * 3), sl = new Float32Array(SPARKS), sc = new Float32Array(SPARKS * 3);
sparkGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sparkGeo.setAttribute('color', new THREE.BufferAttribute(sc, 3));
const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, depthWrite: false, fog: false })); sparks.frustumCulled = false; scene.add(sparks);
let sparkI = 0; const PAL = [0xffd27a, 0xc0603a, 0x8c7bbf, 0x8a9a48, 0xa8382e, 0x3f8a8a].map((h) => new THREE.Color(h));
function burst(x, y, z, n) { for (let k = 0; k < n; k++) { const i = sparkI++ % SPARKS; sp.set([x, y, z], i * 3); sv.set([(rnd() - 0.5) * 9, rnd() * 8 + 2, (rnd() - 0.5) * 9], i * 3); sl[i] = 0.9 + rnd() * 0.5; const c = PAL[(rnd() * PAL.length) | 0]; sc.set([c.r, c.g, c.b], i * 3); } }
const v3 = new THREE.Vector3();
function floater(text, x, y, z, color) {
  v3.set(x, y, z).project(camera); if (v3.z > 1) return;
  const d = document.createElement('div'); d.className = 'floater'; d.textContent = text; if (color) d.style.color = color;
  d.style.left = ((v3.x * 0.5 + 0.5) * innerWidth) + 'px'; d.style.top = ((-v3.y * 0.5 + 0.5) * innerHeight) + 'px';
  document.body.appendChild(d); requestAnimationFrame(() => { d.style.transform = 'translateY(-50px)'; d.style.opacity = '0'; });
  setTimeout(() => d.remove(), 950);
}
let msgT = 0; function say(t, dur = 2.2) { $('msg').textContent = t; $('msg').style.opacity = 1; msgT = dur; }

/* ---------------------------------------------------------------- audio (tiny) */
let actx = null;
function beep(f, d = 0.06, type = 'triangle', vol = 0.05) {
  if (!actx) return; const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(vol, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + d); o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + d);
}

/* ---------------------------------------------------------------- spawning */
function spawn(kind, x, z, well) {
  const o = (kind === 'blot' ? protoBlot : protoSmear).clone(true);
  o.position.set(x, H(x, z), z); scene.add(o);
  const e = { kind, o, x, z, hp: kind === 'blot' ? 2 : 9, h: kind === 'blot' ? 0.6 : 2.0, speed: kind === 'blot' ? 5.2 + rnd() * 1.5 : 2.2, atk: 0, well, t: rnd() * 10, dead: false };
  enemies.push(e); return e;
}
function killEnemy(e, dist) {
  e.dead = true; scene.remove(e.o);
  G.kills++;
  comboT = 3; G.combo = Math.min(8, G.combo + (G.kills > 1 ? 1 : 0));
  const pts = (e.kind === 'blot' ? 50 : 150) * G.combo + (dist > 30 ? 100 : 0);
  G.score += pts;
  floater('+' + pts + (dist > 30 ? ' LONG' : ''), e.x, H(e.x, e.z) + e.h + 0.4, e.z);
  paintAt(e.x, e.z, e.kind === 'blot' ? 6 : 9);
  burst(e.x, H(e.x, e.z) + e.h * 0.6, e.z, e.kind === 'blot' ? 18 : 34);
  G.hp = Math.min(100, G.hp + 2);
  player.bloom = Math.min(1, player.bloom + 0.08);
  beep(440 * Math.pow(1.06, G.combo * 2), 0.12, 'sine', 0.07);
  if (G.combo >= 4 && G.combo % 2 === 0) say('COMBO x' + G.combo);
}
function killWell(w) {
  w.dead = true; scene.remove(w.o); G.wells++;
  G.score += 1000 * G.combo; paintAt(w.x, w.z, 42); burst(w.x, H(w.x, w.z) + 4, w.z, 120);
  floater('+' + 1000 * G.combo + ' INKWELL', w.x, H(w.x, w.z) + 7, w.z, '#ff8fbf');
  lastLantern = [player.x, player.z];
  for (const e of enemies) if (!e.dead && e.well === w) { killEnemy(e, 0); }
  say(G.wells < 5 ? 'Inkwell cleansed ' + G.wells + '/5' : 'The valley is free');
  beep(220, 0.6, 'sawtooth', 0.06); beep(330, 0.8, 'sine', 0.06);
  if (G.wells >= 5) endGame(true);
}

/* ---------------------------------------------------------------- input */
const keys = {}; addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'Space') doDash(); if (e.code === 'KeyE') doBloom(); });
addEventListener('keyup', (e) => { keys[e.code] = false; });
const stick = { id: null, x: 0, y: 0, cx: 0, cy: 0 }, look = { id: null, lx: 0, ly: 0 };
let fireHeld = false;
const stickEl = $('stick'), knob = $('knob');
stickEl.addEventListener('pointerdown', (e) => {
  e.preventDefault(); stick.id = e.pointerId; const r = stickEl.getBoundingClientRect(); stick.cx = r.left + r.width / 2; stick.cy = r.top + r.height / 2;
  try { stickEl.setPointerCapture(e.pointerId); } catch (_) { /* fine */ } moveStick(e);
});
function moveStick(e) {
  const dx = e.clientX - stick.cx, dy = e.clientY - stick.cy, l = Math.hypot(dx, dy), m = Math.min(l, 55) / (l || 1);
  stick.x = dx * m / 55; stick.y = dy * m / 55; knob.style.transform = `translate(${dx * m}px,${dy * m}px)`;
}
stickEl.addEventListener('pointermove', (e) => { if (e.pointerId === stick.id) moveStick(e); });
const stickUp = (e) => { if (e.pointerId === stick.id) { stick.id = null; stick.x = stick.y = 0; knob.style.transform = ''; } };
stickEl.addEventListener('pointerup', stickUp); stickEl.addEventListener('pointercancel', stickUp);
const cvs = renderer.domElement;
cvs.addEventListener('pointerdown', (e) => {
  if (!G.started) return;
  if (e.pointerType === 'mouse') { if (document.pointerLockElement !== cvs) cvs.requestPointerLock?.(); fireHeld = true; return; }
  if (look.id === null && e.clientX > innerWidth * 0.35) { look.id = e.pointerId; look.lx = e.clientX; look.ly = e.clientY; }
});
addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' && document.pointerLockElement === cvs) { player.yaw -= e.movementX * 0.0025; player.pitch = clamp(player.pitch - e.movementY * 0.0025, -1.2, 1.2); return; }
  if (e.pointerId === look.id) { player.yaw -= (e.clientX - look.lx) * 0.006; player.pitch = clamp(player.pitch - (e.clientY - look.ly) * 0.005, -1.2, 1.2); look.lx = e.clientX; look.ly = e.clientY; }
});
addEventListener('pointerup', (e) => { if (e.pointerId === look.id) look.id = null; if (e.pointerType === 'mouse') fireHeld = false; });
addEventListener('pointercancel', (e) => { if (e.pointerId === look.id) look.id = null; });
const holdBtn = (el, on, off) => { el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); on(); }); el.addEventListener('pointerup', () => off && off()); el.addEventListener('pointerleave', () => off && off()); };
holdBtn($('fireb'), () => { fireHeld = true; }, () => { fireHeld = false; });
holdBtn($('dashb'), () => doDash()); holdBtn($('bloomb'), () => doBloom());

function doDash() { if (!G.started || player.dashCharges < 1) return; player.dashCharges--; player.dashT = 0.28; player.inv = 0.4; beep(180, 0.15, 'square', 0.03); }
function doBloom() {
  if (!G.started || player.bloom < 1) return; player.bloom = 0;
  paintAt(player.x, player.z, 18); burst(player.x, H(player.x, player.z) + 1, player.z, 80); say('BLOOM');
  for (const e of enemies) if (!e.dead && Math.hypot(e.x - player.x, e.z - player.z) < 14) { e.hp -= e.kind === 'blot' ? 99 : 6; if (e.hp <= 0) killEnemy(e, 0); }
  beep(520, 0.5, 'sine', 0.08);
}

/* ---------------------------------------------------------------- shooting */
const ray = new THREE.Ray(), tmpS = new THREE.Sphere(), hitP = new THREE.Vector3(), muzzle = new THREE.Vector3();
let rifle;
function targets() {
  const list = [];
  for (const e of enemies) if (!e.dead) list.push({ e, c: new THREE.Vector3(e.x, e.o.position.y + e.h * 0.55, e.z), r: e.h * 0.55 });
  for (const w of wells) if (!w.dead && w.active) list.push({ w, c: new THREE.Vector3(w.x, H(w.x, w.z) + 3.2, w.z), r: 2.2 });
  return list;
}
function pick(maxD = 70, slack = 0) {
  camera.getWorldDirection(ray.direction); ray.origin.copy(camera.position);
  let best = null, bd = 1e9;
  for (const t of targets()) {
    tmpS.set(t.c, t.r + slack * camera.position.distanceTo(t.c));
    if (ray.intersectSphere(tmpS, hitP)) { const d = hitP.distanceTo(ray.origin); if (d < bd && d < maxD) { bd = d; best = { ...t, d, p: hitP.clone() }; } }
  }
  return best;
}
function fire(dt) {
  fireCd -= dt; if (fireCd > 0) return; fireCd = 1 / 9;
  G.shots++;
  const t = pick(80, 0.025);
  rifle.getWorldPosition(muzzle); muzzle.add(new THREE.Vector3(0, 0.05, -0.5).applyQuaternion(camera.quaternion));
  let end;
  if (t) {
    end = t.c.clone();
    if (t.e) { t.e.hp -= 1; if (t.e.hp <= 0) killEnemy(t.e, t.d); else burst(end.x, end.y, end.z, 3); }
    else { t.w.hp -= 1; burst(end.x, end.y, end.z, 4); if (t.w.hp <= 0) killWell(t.w); }
  } else end = camera.position.clone().add(ray.direction.clone().multiplyScalar(60));
  const b = bolts.find((x) => !x.visible) || bolts[0];
  b.visible = true; b.userData.t = 0.07; b.position.copy(muzzle); b.lookAt(end); b.scale.set(1, 1, muzzle.distanceTo(end));
  beep(900 + rnd() * 120, 0.04, 'triangle', 0.018);
  rifle.userData.kick = 0.04;
}

/* ---------------------------------------------------------------- loop */
const clock = new THREE.Clock(); let fpsN = 0, fpsT = 0, ready = false;
function step(dt) {
  const t = clock.elapsedTime;
  // movement
  let mx = stick.x, my = stick.y;
  if (keys.KeyW) my -= 1; if (keys.KeyS) my += 1; if (keys.KeyA) mx -= 1; if (keys.KeyD) mx += 1;
  const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
  const fwd = -my, side = mx; const sy = Math.sin(player.yaw), cy = Math.cos(player.yaw);
  let speed = 6.5; if (player.dashT > 0) { player.dashT -= dt; speed = 22; }
  let dx = (-sy * fwd + cy * side), dz = (-cy * fwd - sy * side);
  if (player.dashT > 0 && ml < 0.1) { dx = -sy; dz = -cy; }
  player.x += dx * speed * dt; player.z += dz * speed * dt;
  for (const [cx, cz, r] of colliders) { const ex = player.x - cx, ez = player.z - cz, d = Math.hypot(ex, ez); if (d < r + 0.4 && d > 1e-4) { player.x = cx + ex / d * (r + 0.4); player.z = cz + ez / d * (r + 0.4); } }
  player.x = clamp(player.x, -250, 250); player.z = clamp(player.z, -330, 250);
  G.speed = Math.hypot(dx, dz) * speed; G.pos[0] = player.x; G.pos[1] = player.z;
  if (player.dashCharges < 2) player.dashCharges = Math.min(2, player.dashCharges + dt / 3);
  player.inv -= dt;

  // aim assist: gentle pull to the nearest target in a small cone
  camera.getWorldDirection(v3);
  let assist = null, ba = 0.32;
  for (const tt of targets()) { const to = tt.c.clone().sub(camera.position); const d = to.length(); if (d > 60) continue; const a = to.normalize().angleTo(v3); if (a < ba) { ba = a; assist = tt; } }
  if (assist) {
    const want = Math.atan2(-(assist.c.x - camera.position.x), -(assist.c.z - camera.position.z));
    let dy = want - player.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); player.yaw += dy * Math.min(1, dt * 2.5);
    const wantP = Math.atan2(assist.c.y - camera.position.y, Math.hypot(assist.c.x - camera.position.x, assist.c.z - camera.position.z));
    player.pitch += (wantP - player.pitch) * Math.min(1, dt * 1.5);
  }
  const bob = G.speed > 0.5 ? Math.sin(t * 9) * 0.04 : 0;
  camera.position.set(player.x, H(player.x, player.z) + 1.65 + bob, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');

  // auto-fire when the reticle sits on a target, or while held
  const onT = pick(70, 0.02);
  $('cross').classList.toggle('on', !!onT);
  if (onT || fireHeld || keys.Mouse) fire(dt);
  if (rifle) { rifle.userData.kick = Math.max(0, (rifle.userData.kick || 0) - dt * 0.5); rifle.position.set(0.21, -0.27 + bob * 0.4, -0.95 + rifle.userData.kick); }

  // wells: activate and spawn waves
  for (const w of wells) {
    if (w.dead) continue;
    const d = Math.hypot(w.x - player.x, w.z - player.z);
    w.o.scale.setScalar(1 + 0.04 * Math.sin(t * 3));
    if (d < 75) {
      if (!w.active) { w.active = true; say('An inkwell stirs'); }
      w.cd -= dt;
      const alive = enemies.filter((e) => !e.dead && e.well === w).length;
      if (w.cd <= 0 && alive < 9) {
        w.cd = 6;
        const n = 4 + (rnd() * 3 | 0);
        for (let i = 0; i < n; i++) { const a = rnd() * 6.28; spawn(rnd() < 0.25 ? 'smear' : 'blot', w.x + Math.cos(a) * 6, w.z + Math.sin(a) * 6, w); }
      }
    }
  }
  // enemies
  for (const e of enemies) {
    if (e.dead) continue;
    e.t += dt;
    const ex = player.x - e.x, ez = player.z - e.z, d = Math.hypot(ex, ez);
    if (d > 1.0 + e.h * 0.3) {
      const s = e.speed * (e.kind === 'blot' ? 1 + 0.3 * Math.sin(e.t * 7) : 1);
      e.x += ex / d * s * dt + (e.kind === 'blot' ? Math.sin(e.t * 3) * 1.2 * dt * (ez / d) : 0); e.z += ez / d * s * dt;
    } else if ((e.atk -= dt) <= 0) {
      e.atk = e.kind === 'blot' ? 0.9 : 1.4;
      if (player.inv <= 0) { G.hp -= e.kind === 'blot' ? 5 : 12; $('hurt').style.boxShadow = 'inset 0 0 90px rgba(200,20,60,.75)'; setTimeout(() => { $('hurt').style.boxShadow = 'inset 0 0 90px rgba(200,20,60,0)'; }, 200); beep(110, 0.15, 'sawtooth', 0.05); }
      else if (player.dashT > 0 && e.kind === 'blot') { killEnemy(e, 0); continue; }
    }
    const hop = e.kind === 'blot' ? Math.abs(Math.sin(e.t * 10)) * 0.25 : Math.sin(e.t * 3) * 0.05;
    e.o.position.set(e.x, H(e.x, e.z) + hop, e.z); e.o.rotation.y = Math.atan2(ex, ez);
    if (e.kind === 'smear') e.o.rotation.z = Math.sin(e.t * 2.4) * 0.08;
  }
  for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].dead) enemies.splice(i, 1);
  // tutorial ink keeps coming on the Rise until the first well falls
  // roaming ink: the tutorial pack on the Rise, and packs on the road between inkwells
  if (enemies.filter((e) => !e.dead && !e.well).length < 3 && rnd() < dt * (G.wells === 0 ? 0.6 : 0.35)) {
    const a = player.yaw + Math.PI + (rnd() - 0.5) * 1.2; const r = 22 + rnd() * 10;
    spawn('blot', player.x - Math.sin(a) * r * -1, player.z - Math.cos(a) * r * -1, null);
  }

  if (G.hp <= 0) {
    G.score = Math.round(G.score * 0.9); G.hp = 100; G.combo = 1; player.x = lastLantern[0]; player.z = lastLantern[1];
    for (const e of enemies) if (!e.dead && Math.hypot(e.x - player.x, e.z - player.z) < 20) { e.dead = true; scene.remove(e.o); }
    say('You wake at the lantern');
  }
  comboT -= dt; if (comboT <= 0) G.combo = 1;

  // fx
  for (const b of bolts) if (b.visible) { b.userData.t -= dt; if (b.userData.t <= 0) b.visible = false; }
  for (let i = 0; i < SPARKS; i++) { if (sl[i] <= 0) { sp[i * 3 + 1] = -999; continue; } sl[i] -= dt; sv[i * 3 + 1] -= 14 * dt; for (let k = 0; k < 3; k++) sp[i * 3 + k] += sv[i * 3 + k] * dt; }
  sparkGeo.attributes.position.needsUpdate = true;
  if (msgT > 0) { msgT -= dt; if (msgT <= 0) $('msg').style.opacity = 0; }

  // hud
  $('score').textContent = G.score.toLocaleString();
  $('combo').textContent = G.combo > 1 ? 'x' + G.combo : '';
  $('hpf').style.width = clamp(G.hp, 0, 100) + '%';
  $('rest').textContent = G.restored + '% restored'; $('wells').textContent = 'inkwells ' + G.wells + '/5';
  $('best').textContent = best ? 'best ' + best.toLocaleString() : '';
  $('bloomb').style.opacity = player.bloom >= 1 ? 1 : 0.35 + player.bloom * 0.4;
  $('dashb').style.opacity = player.dashCharges >= 1 ? 1 : 0.4;
  const live = wells.filter((w) => !w.dead).sort((a, b) => Math.hypot(a.x - player.x, a.z - player.z) - Math.hypot(b.x - player.x, b.z - player.z))[0];
  if (live) {
    const ang = Math.atan2(-(live.x - player.x), -(live.z - player.z)) - player.yaw; const rel = Math.atan2(Math.sin(ang), Math.cos(ang));
    const arrow = Math.abs(rel) < 0.3 ? 'ahead' : rel > 0 ? 'to the left' : 'to the right';
    $('obj').textContent = live.name + ', ' + Math.round(Math.hypot(live.x - player.x, live.z - player.z)) + ' m ' + arrow;
  }
}
function endGame(won) {
  G.over = true; G.won = won; if (G.score > best) { best = G.score; try { localStorage.setItem('bloomfire.best', best); } catch (e) { /* none */ } }
  $('endt').textContent = won ? 'THE VALLEY BLOOMS' : 'THE INK WINS';
  $('endp').textContent = `score ${G.score.toLocaleString()}  ·  ${G.restored}% restored  ·  best ${best.toLocaleString()}`;
  $('end').classList.add('on');
}
$('again').addEventListener('click', () => location.reload());

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (G.started && !G.over) step(dt);
  else { camera.position.set(player.x, H(player.x, player.z) + 1.65, player.z); camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ'); }
  rig.render(camera, dt);
  G.draws = renderer.info.render.calls; G.tris = renderer.info.render.triangles;
  fpsN++; const now = performance.now(); if (!fpsT) fpsT = now; if (now - fpsT >= 1000) { G.fps = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; }
  if (ready && !window.__READY__) window.__READY__ = true;
}

/* ---------------------------------------------------------------- build the valley */
async function build() {
  const A = (n) => 'assets/' + n + '.js';
  await preloadAssets(['olive_tree', 'cypress', 'village_house', 'terrace_wall', 'windmill', 'lamp_post', 'inkwell', 'blotling', 'smear', 'prism_rifle', 'flower_clump'].map(A));
  protoBlot = await ASSET(A('blotling'), { surfaces: false }); protoSmear = await ASSET(A('smear'), { surfaces: false });
  // flowers as instances of the merged clump
  const fl = await ASSET(A('flower_clump'), { surfaces: false });
  fl.traverse((n) => { if (n.isMesh) { n.updateWorldMatrix(true, false); const g = n.geometry.clone().applyMatrix4(n.matrixWorld); const im = new THREE.InstancedMesh(g, n.material, FLOWER_MAX); im.count = 0; im.frustumCulled = false; scene.add(im); flowerIM.push(im); } });
  // rifle in the camera
  rifle = await ASSET(A('prism_rifle'), { surfaces: true }); rifle.traverse((n) => { if (n.isMesh) { n.castShadow = false; } }); rifle.rotation.y = 0.1; camera.add(rifle);

  // Lampwright's Rise: the workshop, a lantern and olives
  const [rx, rz] = PLACES.rise;
  await place(A('village_house'), rx - 6, rz + 4, { ry: 0.6, col: 5 });
  await place(A('lamp_post'), rx + 4, rz - 4, { ry: 0 });
  for (let i = 0; i < 6; i++) await place(A('olive_tree'), rx - 20 + rnd() * 40, rz - 5 + rnd() * 30, { col: 0.5 });
  // the Olive Terraces: rows of walls and olives
  const [tx, tz] = PLACES.terraces;
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
    const x = tx - 30 + k * 16 + r * 3, z = tz + 30 - r * 14;
    await place(A('terrace_wall'), x, z, { ry: 0.35, scale: 1.0 });
    await place(A('olive_tree'), x + 4, z - 6, { col: 0.5 });
  }
  // Millbrook: houses along the river
  const [mx, mz] = PLACES.millbrook;
  for (let i = 0; i < 7; i++) { const z = mz - 40 + i * 13; const side = i % 2 ? 1 : -1; await place(A('village_house'), RIVER_X(z) + side * (13 + rnd() * 4), z, { ry: side > 0 ? -Math.PI / 2 : Math.PI / 2, col: 4.6 }); }
  for (let i = 0; i < 6; i++) await place(A('cypress'), mx + (rnd() - 0.5) * 60, mz + (rnd() - 0.5) * 80, { col: 0.6 });
  // Vell Market: a ring of houses round a square, lamps
  const [kx, kz] = PLACES.market;
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; await place(A('village_house'), kx + Math.cos(a) * 24, kz + Math.sin(a) * 24, { ry: -a - Math.PI / 2, col: 4.6 }); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4; await place(A('lamp_post'), kx + Math.cos(a) * 12, kz + Math.sin(a) * 12, { ry: 0 }); }
  // Windmill Ridge
  const [wx, wz] = PLACES.ridge;
  for (let i = 0; i < 3; i++) await place(A('windmill'), wx - 30 + i * 30, wz - 18 + (i % 2) * 10, { ry: 0.3, col: 3.6 });
  // Quarry rim cypresses
  const [qx, qz] = PLACES.quarry;
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; await place(A('cypress'), qx + Math.cos(a) * 34, qz + Math.sin(a) * 34, { col: 0.6 }); }
  // scatter across the valley
  for (let i = 0; i < 45; i++) {
    const x = -230 + rnd() * 460, z = -260 + rnd() * 480;
    if (Object.values(PLACES).some(([px, pz]) => Math.hypot(px - x, pz - z) < 30) || Math.abs(x - RIVER_X(z)) < 9) continue;
    await place(A(rnd() < 0.7 ? 'olive_tree' : 'cypress'), x, z, { col: 0.5 });
  }
  // inkwells
  const NAMES = { terraces: 'The Olive Terraces', millbrook: 'Millbrook', market: 'Vell Market', ridge: 'Windmill Ridge', quarry: 'The Chalk Quarry' };
  for (const k of Object.keys(NAMES)) {
    let [x, z] = PLACES[k]; if (k === 'millbrook') x = RIVER_X(z) + 6;
    const o = await ASSET(A('inkwell'), { surfaces: false }); o.position.set(x, H(x, z) - 0.2, z); scene.add(o);
    wells.push({ o, x, z, hp: 60, active: false, cd: 0, dead: false, name: NAMES[k] });
    colliders.push([x, z, 3]);
  }
  // tutorial fight on the Rise
  for (let i = 0; i < 5; i++) spawn('blot', player.x - Math.sin(player.yaw) * (16 + i * 3) + (rnd() - 0.5) * 8, player.z - Math.cos(player.yaw) * (16 + i * 3) + (rnd() - 0.5) * 8, null);
  // a little colour already at the workshop, so the two worlds meet in the first frame
  paintAt(rx - 4, rz + 2, 9);
  rig.refresh();
}

requestAnimationFrame(frame);
build().then(async () => {
  await rig.ready;
  ready = true;
  const sb = $('startb'); sb.disabled = false; sb.textContent = 'PLAY';
  sb.addEventListener('click', () => {
    $('title').style.display = 'none'; $('hud').classList.add('on');
    for (const id of ['stick', 'fireb', 'dashb', 'bloomb']) $(id).style.display = id === 'stick' ? 'block' : 'flex';
    G.started = true; clock.getDelta();
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ }
    say('Shoot the colour back');
  });
}).catch((e) => { console.error(e); $('startb').textContent = 'ERROR ' + e.message; });
