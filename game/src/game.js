// The game: objectives, the director that keeps ink coming, inkwells, the boss, score and combo, death.
import * as THREE from 'three';
import { ASSET } from '../assetlib.js';
import { scene, camera, post, skyU, isTouch, fog } from './render.js';
import { splat, restoredFraction, maskAt, creep, U as PU, drawMap } from './paint.js';
import { IN, takeDash, takeBloom } from './input.js';
import { P, placePlayer, dash, heal, EYE } from './player.js';
import { ENEMIES, TYPES, initEnemies, spawn, damage, updateEnemies, lob, clearEnemies } from './enemies.js';
import { WPN, initWeapon, updateWeapon, assistLook, swayFromLook, arcFrom, layoutViewmodel } from './weapon.js';
import { emit, updateParticles, updateTracers, updateBlooms, bloomAt, setBloomProto, bakeJoints, setParticleScale } from './fx.js';
import { HUD, compass, hitMarker, updateHud, floater, callout, banner, caption } from './hud.js';
import { sfx, unlockAudio, setSound, soundOn, loadMusic, playMusic, musicIntensity } from './audio.js';
import { addCircle } from './collide.js';
import { INKWELLS, PLACES, LANTERNS, SPAWN } from './layout.js';
import { litLantern, W } from './world.js';

const $ = (id) => document.getElementById(id);
let T = null, have = new Set();
const LENS_ORDER = ['split', 'arc', 'burst', 'rapid', 'sun'];
const LENS_TEXT = { split: ['Split lens', 'every third shot is three'], arc: ['Arc lens', 'a kill leaps to the next ink'], burst: ['Burst lens', 'kills splash the ink around them'], rapid: ['Rapid lens', 'the prism fires faster'], sun: ['Sun lens', 'BLOOM charges twice as fast'] };

const S = {
  mode: 'title', paused: false, score: 0, kills: 0, combo: 0, comboT: 0, bestCombo: 0, mult: 1, tierShown: 0,
  stage: 0, cleansed: [], t: 0, startT: 0, deadT: 0, lastKillT: -9, multi: 0, multiT: 0, roamT: 6, visited: new Set(),
  tutorial: { packed: false, firstKill: false, bloomTold: false, dashTold: false }, finaleT: 0, restoredAtFinale: 0, best: 0, deaths: 0,
  respawn: 'rise', hurtShown: 0, stepT: 0, creepT: 0,
};
const WELLS = [];
let BOSS = null;

// ---- inkwells ---------------------------------------------------------------------------------------
async function makeWells() {
  for (const w of INKWELLS) {
    const y = T.height(w.at[0], w.at[1]);
    let obj, nodes = [];
    if (have.has('inkwell')) {
      obj = await ASSET('./assets/inkwell.js', { height: 7, keepHierarchy: true });
      const j = obj.userData.joints || {};
      for (const k of ['node0', 'node1', 'node2']) if (j[k]) nodes.push(j[k]);
      bakeJoints(obj);
    } else {
      obj = new THREE.Group();
      const sp = new THREE.Mesh(new THREE.ConeGeometry(1.4, 7, 8), new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.25 })); sp.position.y = 3.5; obj.add(sp);
      for (let k = 0; k < 3; k++) { const n = new THREE.Group(); n.position.set(Math.cos(k * 2.1) * 0.9, 1.6 + k * 1.7, Math.sin(k * 2.1) * 0.9); n.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), new THREE.MeshStandardMaterial({ color: 0xff3d8b, emissive: 0xff3d8b, emissiveIntensity: 2 }))); obj.add(n); nodes.push(n); }
    }
    obj.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.userData.noPaint = true); if (o.isMesh) o.castShadow = true; });
    obj.position.set(w.at[0], y - 0.2, w.at[1]); scene.add(obj);
    addCircle(w.at[0], w.at[1], 2.0, y, y + 7);
    const light = new THREE.PointLight(0xff3d8b, 6, 16, 1.5); light.position.set(w.at[0], y + 4, w.at[1]); scene.add(light);
    WELLS.push({ ...w, obj, y, light, nodes: nodes.map((n) => ({ n, hp: 90, alive: true, pos: new THREE.Vector3() })), awake: false, alive: true, wave: 0, waveT: 0, owned: 0, sinkT: 0, plumeT: 0 });
  }
}

function wellTier() { return S.cleansed.length; }

function updateWells(dt) {
  const pp = P.pos;
  for (const w of WELLS) {
    // the plume: a column of ink over every living inkwell, visible across the valley
    if (w.alive) {
      w.plumeT -= dt;
      if (w.plumeT <= 0) { w.plumeT = 0.16; emit('ink', w.at[0] + (Math.random() - 0.5) * 1.2, w.y + 7, w.at[1] + (Math.random() - 0.5) * 1.2, 1, { speed: 0.6, up: 0, life: 7, size: 2.2 + Math.random() * 1.6, color: [0.07, 0.06, 0.1], grav: -1.2, drag: 0.3 }); }
      if (Math.random() < dt * 3) emit('add', w.at[0], w.y + 6.5 + Math.random() * 4, w.at[1], 1, { speed: 0.4, up: 0, life: 2.5, size: 0.5, color: [1.3, 0.2, 0.6], grav: -1.5 });
      for (const nd of w.nodes) if (nd.alive) nd.n.getWorldPosition(nd.pos);
      w.light.intensity = 5 + Math.sin(S.t * 3) * 2;
    }
    if (!w.alive) {   // collapse: the spire sinks into its pot
      if (w.sinkT < 1) { w.sinkT += dt / 2.4; w.obj.position.y = w.y - 0.2 - w.sinkT * 6.5; w.obj.scale.set(1 + w.sinkT * 0.2, 1 - w.sinkT * 0.6, 1 + w.sinkT * 0.2); if (w.sinkT >= 1) w.obj.visible = false; }
      continue;
    }
    const d = Math.hypot(pp.x - w.at[0], pp.z - w.at[1]);
    if (!w.awake && d < 52 && S.mode === 'play' && S.stage >= 1) {
      w.awake = true; w.waveT = 1.5; caption('An inkwell. Break its <b>three glowing nodes</b>.', 4);
      sfx.roar(); playMusic('fight');
    }
    if (!w.awake) continue;
    if (d > 90) { w.awake = false; continue; }
    // creep: a living, awake inkwell takes colour back around itself
    S.creepT += dt;
    if (S.creepT > 1) { S.creepT = 0; creep(w.at[0], w.at[1], 24, 7); }
    // waves
    w.owned = ENEMIES.filter((e) => e.owner === w && e.alive).length;
    w.waveT -= dt;
    const cap = 7 + wellTier() * 2;
    // a few waves, then it only tops up slowly; breaking a node always calls one more
    if (w.waveT <= 0 && w.owned < cap - 2) { spawnWave(w); w.waveT = w.wave < 3 + wellTier() ? 11 - Math.min(5, wellTier()) : 22; }
  }
}

function spawnWave(w) {
  const tier = wellTier(), k = w.wave++;
  const comp = [];
  comp.push(...Array(3 + Math.min(4, k) + tier).fill('blotling'));
  if (k >= 1 || tier >= 1) comp.push('smear');
  if (tier >= 1 && k >= 1) comp.push('quill', 'quill');
  if (tier >= 2 && k >= 1) comp.push('spitter');
  if (tier >= 3 && k >= 2) comp.push('inkhorn');
  if (k >= 3) comp.push('smear', 'spitter');
  const pp = P.pos;
  comp.forEach((type, i) => {
    const a = Math.random() * Math.PI * 2, r = 7 + Math.random() * 12;
    let x = w.at[0] + Math.cos(a) * r, z = w.at[1] + Math.sin(a) * r;
    if (Math.hypot(x - pp.x, z - pp.z) < 6) { x = w.at[0] - Math.cos(a) * r; z = w.at[1] - Math.sin(a) * r; }
    setTimeout(() => { if (w.alive && S.mode === 'play') spawn(type, x, z, { owner: w, tier }); }, i * 140);
  });
}

function destroyNode(w, nd) {
  nd.alive = false; nd.n.visible = false; sfx.node();
  emit('add', nd.pos.x, nd.pos.y, nd.pos.z, 40, { speed: 9, up: 3, life: 0.9, size: 0.3, color: [1.6, 0.4, 0.9] });
  emit('ink', nd.pos.x, nd.pos.y, nd.pos.z, 30, { speed: 7, up: 4, life: 1.0, size: 0.4, color: [0.08, 0.07, 0.12] });
  splat(w.at[0], w.at[1], 14); addScore(500, nd.pos, 'NODE +500', 'big');
  if (w.nodes.some((q) => q.alive)) spawnWave(w);
  callout(w.nodes.filter((q) => q.alive).length ? 'NODE BROKEN' : 'INKWELL BROKEN');
  post.uFlash.value = 0.25;
  if (!w.nodes.some((q) => q.alive)) cleanse(w);
}

function cleanse(w) {
  w.alive = false; S.cleansed.push(w.id); sfx.cleanse(); playMusic('calm', 3);
  scene.remove(w.light);
  // the wave of colour over the whole place, and every ink it spawned bursts in a chain
  splat(w.at[0], w.at[1], 95, { speed: 34 });
  const mine = ENEMIES.filter((e) => e.owner === w && e.alive);
  mine.forEach((e, i) => setTimeout(() => { if (e.alive) { e.alive = false; onKill(e, { chain: true }); } }, 250 + i * 110));
  for (let i = 0; i < 60; i++) { const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 40; const x = w.at[0] + Math.cos(a) * r, z = w.at[1] + Math.sin(a) * r; bloomAt(x, T.height(x, z), z, Math.random() * 6, 0.8 + Math.random() * 0.6); }
  const lens = LENS_ORDER[S.cleansed.length - 1]; if (lens) WPN.lenses.push(lens);
  const place = PLACES.find((p) => p.id === w.place);
  addScore(3000, new THREE.Vector3(w.at[0], w.y + 4, w.at[1]), 'CLEANSED +3000', 'big');
  banner(place.name + ' restored', lens ? LENS_TEXT[lens][0] + ': ' + LENS_TEXT[lens][1] : 'the prism burns brighter', 4.5);
  const l = litLantern(w.place); if (l) { S.respawn = w.place; setTimeout(() => sfx.lantern(), 900); }
  post.uFlash.value = 0.6;
  if (S.stage === 1) setStage(2); else if (S.cleansed.length >= 5) setStage(3); else setStage(2);
}

// ---- the boss ----------------------------------------------------------------------------------------
const ARENA = [40, -286];
async function makeBoss() {
  const y = T.height(ARENA[0], ARENA[1] - 8);
  let obj;
  if (have.has('old_inkhorn')) { obj = await ASSET('./assets/old_inkhorn.js', { height: 14, keepHierarchy: true }); bakeJoints(obj); }
  else { obj = new THREE.Group(); const b = new THREE.Mesh(new THREE.CapsuleGeometry(3, 8, 4, 12), new THREE.MeshStandardMaterial({ color: 0x15131f, roughness: 0.25 })); b.position.y = 7; obj.add(b); }
  obj.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.userData.noPaint = true); if (o.isMesh) o.castShadow = true; });
  obj.visible = false; obj.position.set(ARENA[0], y, ARENA[1] - 10); scene.add(obj);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.35, 6, 48), new THREE.MeshBasicMaterial({ color: 0xff3d8b, transparent: true, opacity: 0.85, toneMapped: false }));
  ring.material.userData.noPaint = true; ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
  const j = {}; for (const [k, v] of Object.entries(obj.userData.joints || {})) if (v && v.isObject3D) j[k] = { node: v, rx: v.rotation.x, rz: v.rotation.z };
  BOSS = { obj, j, hp: 2600, maxHp: 2600, alive: false, state: 'idle', st: 0, phase: 1, ring, ringR: 0, ringOn: false, open: 0, yaw: 0, cd: 2, pos: obj.position, summonT: 8, core: new THREE.Vector3(), body: new THREE.Vector3(), walk: 0 };
}
function wakeBoss() {
  BOSS.alive = true; BOSS.obj.visible = true; BOSS.state = 'rise'; BOSS.st = 0; BOSS.obj.scale.set(1, 0.01, 1);
  setStage(4); sfx.roar(); playMusic('boss', 1.5); banner('Old Inkhorn', 'the first blot', 3.5);
  caption('Its chest opens when it roars. <b>Shoot the core.</b> Dash through the rings.', 6);
}
function updateBoss(dt) {
  const B = BOSS; if (!B || !B.alive) { if (B && B.ring.visible) B.ring.visible = false; return; }
  B.st += dt; B.cd -= dt;
  const pp = P.pos, dx = pp.x - B.pos.x, dz = pp.z - B.pos.z, d = Math.hypot(dx, dz) || 1;
  const set = (k, ax, v) => { const q = B.j[k]; if (q) q.node.rotation[ax] = q['r' + ax] + v; };
  B.phase = B.hp < B.maxHp * 0.33 ? 3 : B.hp < B.maxHp * 0.66 ? 2 : 1;
  let moving = false;
  if (B.state === 'rise') { const k = Math.min(1, B.st / 1.6); B.obj.scale.set(1, Math.max(0.01, k), 1); if (k >= 1) { B.state = 'walk'; B.st = 0; } }
  else if (B.state === 'walk') {
    if (d > 9) { moving = true; const sp = 2.0 + B.phase * 0.5; B.pos.x += dx / d * sp * dt; B.pos.z += dz / d * sp * dt; }
    if (B.cd <= 0) {
      const r = Math.random();
      if (B.phase >= 2 && r < 0.3) { B.state = 'lob'; } else if (B.phase >= 3 && r < 0.5 && d > 12) { B.state = 'charge_wind'; sfx.roar(); } else { B.state = 'slam_wind'; sfx.telegraph(); }
      B.st = 0;
    }
    B.summonT -= dt;
    if (B.phase >= 2 && B.summonT <= 0) { B.summonT = 12 - B.phase * 2; for (let i = 0; i < 2 + B.phase; i++) { const a = Math.random() * 6.28; spawn(i % 2 ? 'quill' : 'blotling', B.pos.x + Math.cos(a) * 8, B.pos.z + Math.sin(a) * 8, { tier: 4 }); } }
  } else if (B.state === 'slam_wind') {
    set('armL', 'x', -2.2 * Math.min(1, B.st / 1.1)); set('armR', 'x', -2.2 * Math.min(1, B.st / 1.1));
    if (B.st > 1.1) { B.state = 'slam'; B.st = 0; B.ringOn = true; B.ringR = 2; B.ringHit = false; sfx.splat(); post.uFlash.value = 0.15; emit('ink', B.pos.x, B.pos.y + 0.5, B.pos.z, 40, { speed: 10, up: 4, life: 1, size: 0.5, color: [0.08, 0.07, 0.12] }); }
  } else if (B.state === 'slam') {
    set('armL', 'x', 0.6); set('armR', 'x', 0.6);
    if (B.st > 0.6) { B.state = 'roar'; B.st = 0; sfx.roar(); }
  } else if (B.state === 'roar') {   // the chest opens: the window to hurt it
    B.open = Math.min(1, B.open + dt * 4); set('head', 'x', -0.4);
    if (B.st > 3.2 - B.phase * 0.4) { B.state = 'walk'; B.st = 0; B.cd = 3.2 - B.phase * 0.6; }
  } else if (B.state === 'lob') {
    if (B.st > 0.5 && !B.lobbed) { B.lobbed = true; for (let i = 0; i < B.phase; i++) setTimeout(() => lob({ pos: B.pos, t: { height: 12, dmg: 18 } }, P.pos, { speed: 22, big: 2.2, dmg: 18 }), i * 260); sfx.spit(); }
    if (B.st > 1.2) { B.lobbed = false; B.state = 'roar'; B.st = 0; }
  } else if (B.state === 'charge_wind') {
    if (B.st > 1.0) { B.state = 'charge'; B.st = 0; B.cdir = [dx / d, dz / d]; }
  } else if (B.state === 'charge') {
    moving = true; B.pos.x += B.cdir[0] * 13 * dt; B.pos.z += B.cdir[1] * 13 * dt;
    if (d < 4.5 && hurtP(30, B.pos)) { B.state = 'roar'; B.st = 0; }
    if (B.st > 1.6) { B.state = 'roar'; B.st = 0; }
    const ad = Math.hypot(B.pos.x - ARENA[0], B.pos.z - ARENA[1]); if (ad > 22) { B.state = 'roar'; B.st = 0; }
  }
  if (B.state !== 'roar') B.open = Math.max(0, B.open - dt * 3);
  B.pos.y = T.height(B.pos.x, B.pos.z);
  const want = Math.atan2(dx, dz); let dy = want - B.obj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); B.obj.rotation.y += dy * Math.min(1, dt * 2.5);
  if (moving) { B.walk += dt * 3; set('legL', 'x', Math.sin(B.walk) * 0.4); set('legR', 'x', -Math.sin(B.walk) * 0.4); if (Math.sin(B.walk) * Math.sin(B.walk - dt * 3) < 0) { post.uFlash.value = 0.04; } }
  if (B.j.core) { const s = 1 + B.open * 0.6; B.j.core.node.scale.set(s, s, s); }
  // shock ring
  if (B.ringOn) {
    B.ringR += dt * 15; B.ring.visible = true; B.ring.position.set(B.pos.x, T.height(B.pos.x, B.pos.z) + 0.4, B.pos.z); B.ring.scale.set(B.ringR, B.ringR, 1);
    B.ring.material.opacity = 0.85 * (1 - B.ringR / 26);
    const pd = Math.hypot(pp.x - B.pos.x, pp.z - B.pos.z);
    if (!B.ringHit && Math.abs(pd - B.ringR) < 1.2 && P.pos.y < T.height(pp.x, pp.z) + 0.6) { B.ringHit = true; hurtP(24, B.pos); }
    if (B.ringR > 26) { B.ringOn = false; B.ring.visible = false; }
  }
  // targets
  B.obj.updateMatrixWorld(true);
  if (B.j.core) B.j.core.node.getWorldPosition(B.core); else B.core.set(B.pos.x, B.pos.y + 8, B.pos.z);
  B.body.set(B.pos.x, B.pos.y + 7, B.pos.z);
  HUD.boss('Old Inkhorn', B.hp / B.maxHp);
}
function hurtP(n, from) { const h = P.invuln <= 0; if (h) { P.hp = Math.max(0, P.hp - n); P.hurtT = 0.5; P.invuln = 0.3; if (P.hp <= 0) P.alive = false; sfx.hurt(); } return h; }
function bossHit(dmg, core, point) {
  const B = BOSS; const mult = core && B.open > 0.3 ? 1 : 0.18;
  B.hp -= dmg * mult;
  if (core && B.open > 0.3) floater(point, '' + Math.round(dmg), 'mag');
  if (B.hp <= 0 && B.alive) {
    B.alive = false; addScore(10000, B.core, 'OLD INKHORN +10000', 'big'); callout('THE BLOT BREAKS');
    sfx.cleanse(); HUD.boss(null); clearEnemies(); emit('add', B.core.x, B.core.y, B.core.z, 140, { speed: 16, up: 6, life: 1.6, size: 0.5, color: [1.6, 0.9, 0.4] });
    let k = 0; const sink = setInterval(() => { k++; B.obj.position.y -= 0.35; B.obj.scale.y *= 0.96; if (k > 40) { clearInterval(sink); B.obj.visible = false; } }, 50);
    finale();
  }
}

// ---- targets and hits --------------------------------------------------------------------------------
const TG = [];
const pool = []; let pi = 0;
function tgt() { if (pi >= pool.length) pool.push({ pos: new THREE.Vector3(), r: 1, ent: null, kind: '', core: false }); return pool[pi++]; }
function targets() {
  if (TG._frame === S.frame) return TG;
  TG.length = 0; pi = 0; TG._frame = S.frame;
  for (const e of ENEMIES) {
    if (!e.alive) continue; const t = tgt();
    t.pos.set(e.pos.x, e.pos.y + e.t.coreY * e.o.scale.y, e.pos.z); t.r = e.t.bodyR * 1.15 + (e.fly ? 0.3 : 0); t.ent = e; t.kind = 'enemy'; t.core = false; TG.push(t);
  }
  for (const w of WELLS) if (w.alive) for (const nd of w.nodes) if (nd.alive) { const t = tgt(); t.pos.copy(nd.pos); t.r = 0.85; t.ent = nd; t.well = w; t.kind = 'node'; t.core = true; TG.push(t); }
  if (BOSS && BOSS.alive && BOSS.state !== 'rise') {
    const c = tgt(); c.pos.copy(BOSS.core); c.r = 1.4; c.ent = BOSS; c.kind = 'boss'; c.core = true; TG.push(c);
    const b = tgt(); b.pos.copy(BOSS.body); b.r = 3.6; b.ent = BOSS; b.kind = 'boss'; b.core = false; TG.push(b);
  }
  return TG;
}

const _cw = new THREE.Vector3();
function onHit(tg, point, dist, o = {}) {
  const dmg = 10;
  sfx.hit(tg.core);
  if (tg.kind === 'enemy') {
    const e = tg.ent; if (!e.alive) return;
    // a hit near the magenta core counts double
    _cw.set(e.pos.x + Math.sin(e.o.rotation.y) * e.t.bodyR * 0.7, e.pos.y + e.t.coreY, e.pos.z + Math.cos(e.o.rotation.y) * e.t.bodyR * 0.7);
    const core = point.distanceTo(_cw) < e.t.coreR * 1.8;
    hitMarker(false);
    if (damage(e, dmg, { core })) onKill(e, { dist, core, arc: o.arc });
  } else if (tg.kind === 'node') {
    const nd = tg.ent; if (!nd.alive) return; nd.hp -= dmg; hitMarker(false);
    emit('add', point.x, point.y, point.z, 3, { speed: 4, life: 0.3, size: 0.14, color: [1.5, 0.4, 0.9] });
    if (nd.hp <= 0) destroyNode(tg.well, nd);
  } else if (tg.kind === 'boss') { hitMarker(false); bossHit(dmg, tg.core, point); }
}

function addScore(n, pos, text, cls) { S.score += n; if (pos && text) floater(pos, text, cls); }

const TIERS = [[5, 'VIVID'], [10, 'BRILLIANT'], [20, 'RADIANT'], [35, 'BLOOMING'], [50, 'SUNSTRUCK']];
function onKill(e, o = {}) {
  S.kills++;
  S.combo++; S.comboT = 3.0; S.bestCombo = Math.max(S.bestCombo, S.combo);
  S.mult = Math.min(8, 1 + Math.floor(S.combo / 4));
  const p = new THREE.Vector3(e.pos.x, e.pos.y + e.t.coreY, e.pos.z);
  let pts = e.t.score * S.mult, tag = '+' + pts;
  // bonuses
  if (S.t - S.lastKillT < 0.45) S.multi++; else S.multi = 1;
  S.lastKillT = S.t;
  if (!o.chain) {
    if (S.multi === 2) { pts += 100; callout('DOUBLE'); } else if (S.multi >= 3) { pts += 300; callout(S.multi >= 5 ? 'BLOOMSTORM' : 'MULTI'); }
    if (o.dist > 38) { pts += 50; tag += ' LONG'; }
    if (o.core) { pts += 50; tag += ' CORE'; }
    if (P.dashT > 0) { pts += 150; tag += ' DASH'; }
    if (e.fly) { pts += 50; }
  }
  addScore(pts, p, tag, S.mult >= 4 ? 'big' : '');
  for (const [n, name] of TIERS) if (S.combo === n) { callout(name + ' x' + S.mult); sfx.tier(TIERS.findIndex((q) => q[0] === n)); }
  // the colour comes back
  const R = e.t.splat * (WPN.lenses.includes('burst') ? 1.35 : 1);
  splat(e.pos.x, e.pos.z, R);
  const nb = e.type === 'inkhorn' ? 14 : e.type === 'blotling' ? 3 : 6;
  for (let i = 0; i < nb; i++) { const a = Math.random() * 6.28, r = Math.random() * R * 0.8; const x = e.pos.x + Math.cos(a) * r, z = e.pos.z + Math.sin(a) * r; bloomAt(x, T.height(x, z), z, Math.random() * 6, 0.6 + Math.random() * 0.7); }
  emit('ink', p.x, p.y, p.z, 16 + (e.type === 'inkhorn' ? 30 : 0), { speed: 6, up: 3, life: 0.8, size: 0.32, color: [0.08, 0.07, 0.12] });
  const warm = [[1.5, 0.95, 0.35], [1.4, 0.55, 0.3], [0.8, 0.6, 1.3], [0.9, 1.3, 0.5]];
  emit('add', p.x, p.y, p.z, 22, { speed: 7, up: 3, life: 0.9, size: 0.2, color: warm[S.kills % 4] });
  // motes: fly home, heal a little
  const nm = e.type === 'blotling' ? 2 : 4;
  for (let i = 0; i < nm; i++) emit('add', p.x, p.y, p.z, 1, { speed: 4, up: 3, life: 3, size: 0.35, color: [1.6, 1.2, 0.5], home: { onArrive: () => { heal(2); S.score += 10; sfx.pickup(); } } });
  sfx.kill(S.combo); hitMarker(true);
  WPN.bloom = Math.min(1, WPN.bloom + (WPN.lenses.includes('sun') ? 0.12 : 0.065));
  if (!S.tutorial.firstKill) { S.tutorial.firstKill = true; caption('Every kill gives the colour back. <b>Chain kills</b> for a bigger multiplier.', 5); }
  if (WPN.lenses.includes('arc') && !o.arc && !o.chain) arcFrom(p, e);
  if (WPN.lenses.includes('burst') && !o.chain) for (const q of ENEMIES) if (q.alive && q !== e && q.pos.distanceTo(e.pos) < 3.6) { if (damage(q, 25)) onKill(q, { chain: true }); }
}

function doBloom() {
  if (WPN.bloom < 1 || !P.alive) return;
  WPN.bloom = 0; sfx.bloom(); post.uFlash.value = 0.9; callout('BLOOM');
  const pp = P.pos;
  splat(pp.x, pp.z, 24, { speed: 40 });
  emit('add', pp.x, pp.y + 1, pp.z, 160, { speed: 18, up: 2, life: 1.1, size: 0.35, color: [1.6, 1.1, 0.5], grav: 2 });
  for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, r = 2 + Math.random() * 16; const x = pp.x + Math.cos(a) * r, z = pp.z + Math.sin(a) * r; bloomAt(x, T.height(x, z), z, Math.random() * 6, 0.8 + Math.random() * 0.6); }
  for (const e of [...ENEMIES]) {
    if (!e.alive) continue; const d = e.pos.distanceTo(pp); if (d > 15) continue;
    if (damage(e, e.t.hp <= 70 ? 999 : 130)) onKill(e, { chain: false }); else e.stagger = 2.2;
  }
  if (BOSS && BOSS.alive && BOSS.pos.distanceTo(pp) < 20) { BOSS.hp -= 160; BOSS.open = 1; BOSS.state = 'roar'; BOSS.st = 0; }
  S.slowmo = 0.45;
}

// ---- the director: ink finds you ---------------------------------------------------------------------
function director(dt) {
  if (S.stage >= 4) return;
  const pp = P.pos;
  const nearWell = WELLS.some((w) => w.alive && w.awake);
  S.roamT -= dt;
  const alive = ENEMIES.filter((e) => e.alive && !e.owner).length;
  const grey = maskAt(pp.x, pp.z) < 0.5;
  if (!nearWell && S.roamT <= 0 && alive < 5 + wellTier()) {
    S.roamT = grey ? 9 + Math.random() * 5 : 16 + Math.random() * 6;
    const tier = wellTier(), comp = [];
    const n = 3 + Math.floor(Math.random() * 3) + tier;
    for (let i = 0; i < n; i++) comp.push('blotling');
    if (tier >= 1 && Math.random() < 0.7) comp.push('smear');
    if (tier >= 1 && Math.random() < 0.6) comp.push('quill', 'quill');
    if (tier >= 2 && Math.random() < 0.6) comp.push('spitter');
    if (tier >= 3 && Math.random() < 0.35) comp.push('inkhorn');
    // ahead of the player, so the fight comes to meet you
    const a0 = P.yaw + Math.PI + (Math.random() - 0.5) * 1.6;   // yaw looks along -z; ahead is (-sin, -cos)
    const r = 20 + Math.random() * 10;
    const cx = pp.x - Math.sin(P.yaw) * r + Math.cos(a0) * 3, cz = pp.z - Math.cos(P.yaw) * r + Math.sin(a0) * 3;
    comp.forEach((type, i) => { const x = cx + (Math.random() - 0.5) * 8, z = cz + (Math.random() - 0.5) * 8; setTimeout(() => { if (S.mode === 'play') spawn(type, x, z, { tier }); }, i * 160); });
  }
}

// ---- objectives --------------------------------------------------------------------------------------
function nearestWell() { let b = null, bd = 1e9; for (const w of WELLS) if (w.alive) { const d = Math.hypot(w.at[0] - P.pos.x, w.at[1] - P.pos.z); if (d < bd) { bd = d; b = w; } } return b; }
function setStage(n) {
  S.stage = n;
  if (n === 1) { HUD.objective('Break the inkwell in the Olive Terraces', 'follow the gold mark'); }
  if (n === 2) { const left = WELLS.filter((w) => w.alive).map((w) => PLACES.find((p) => p.id === w.place).name); HUD.objective(`Break the inkwells: ${left.length} left`, left.join(' · ') + ' · any order'); }
  if (n === 3) { HUD.objective('Climb the Pilgrim Stair to the Sun Chapel', 'the blot waits at the summit'); litLantern('stair'); banner('The valley is answering', 'the Pilgrim Stair is open', 4); }
  if (n === 4) HUD.objective('Break Old Inkhorn', 'shoot the core when its chest opens');
}
function objectiveTarget() {
  if (S.stage === 0) return null;
  if (S.stage === 1) return INKWELLS[0].at;
  if (S.stage === 2) { const w = nearestWell(); return w ? w.at : null; }
  if (S.stage === 3) return ARENA;
  if (S.stage === 4 && BOSS) return [BOSS.pos.x, BOSS.pos.z];
  return null;
}

function finale() {
  S.mode = 'finale'; S.finaleT = 0; S.restoredAtFinale = restoredFraction();
  playMusic('finale', 2); banner('The valley blooms', 'Vell has its colour back', 6);
  HUD.objective('', '');
}

function endCard() {
  S.mode = 'over';
  const secs = Math.round((S.t - S.startT));
  const rest = S.restoredAtFinale || restoredFraction();
  const restBonus = Math.round(rest * 100) * 100, timeBonus = Math.max(0, 1800 - secs) * 10;
  S.score += restBonus + timeBonus;
  let best = 0; try { best = +localStorage.getItem('bloomfire_best') || 0; if (S.score > best) localStorage.setItem('bloomfire_best', S.score); } catch {}
  const mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, '0');
  $('overs').innerHTML = `<b>${S.score.toLocaleString('en-US')}</b>${S.score > best ? ' new best' : ' best ' + best.toLocaleString('en-US')}<br>
    ${mm}:${ss} &middot; ${S.kills} ink &middot; best chain ${S.bestCombo}<br>
    you restored ${(rest * 100).toFixed(0)}% of the valley (+${restBonus.toLocaleString('en-US')}) &middot; time +${timeBonus.toLocaleString('en-US')}`;
  const c = $('overmap'); drawMap(c.getContext('2d'), c.width, c.height);
  $('over').classList.add('on'); document.body.classList.remove('playing');
}

// ---- lifecycle ---------------------------------------------------------------------------------------
export const Game = {
  paused: false,
  async init(terrain) {
    T = terrain;
    try { have = new Set(await (await fetch('./assets/index.json')).json()); } catch {}
    await initEnemies(T, have);
    await initWeapon(T, have, targets, onHit);
    await makeWells();
    await makeBoss();
    if (have.has('flower_patch')) setBloomProto(await ASSET('./assets/flower_patch.js', { height: 0.35 }));
    litLantern('rise');
    try { S.best = +localStorage.getItem('bloomfire_best') || 0; } catch {}
    let aidx = []; try { aidx = await (await fetch('./audio/index.json')).json(); } catch {}
    for (const n of ['calm', 'fight', 'boss', 'finale']) if (aidx.includes(n)) loadMusic(n, `./audio/${n}.mp3`);
    setParticleScale(innerHeight);
    addEventListener('resize', () => { setParticleScale(innerHeight); layoutViewmodel(); });
    $('startb').addEventListener('click', () => Game.start());
    $('pauseb').addEventListener('click', () => Game.pause(true));
    $('resumeb').addEventListener('click', () => Game.pause(false));
    $('soundb').addEventListener('click', () => { setSound(!soundOn()); $('soundb').textContent = 'Sound: ' + (soundOn() ? 'on' : 'off'); });
    $('assistb').addEventListener('click', () => { WPN.assist = !WPN.assist; $('assistb').textContent = 'Aim assist: ' + (WPN.assist ? 'on' : 'off'); });
    const sens = [['slow', 0.7], ['normal', 1], ['fast', 1.4]]; let si = 1;
    $('sensb').addEventListener('click', () => { si = (si + 1) % 3; IN.sens = sens[si][1]; $('sensb').textContent = 'Look speed: ' + sens[si][0]; });
    $('againb').addEventListener('click', () => { location.search = '?again=1'; });
    $('keepb').addEventListener('click', () => { $('over').classList.remove('on'); document.body.classList.add('playing'); S.mode = 'roam'; });
    addEventListener('keydown', (e) => { if (e.code === 'Escape' || e.code === 'KeyP') { if (S.mode === 'play') Game.pause(!Game.paused); } });
  },
  showTitle() {
    $('title').classList.add('on');
    if (S.best) $('best').textContent = 'best ' + S.best.toLocaleString('en-US');
    if (new URLSearchParams(location.search).has('again')) {} // the title is one tap either way
  },
  start() {
    if (S.mode !== 'title') return;
    unlockAudio();
    $('title').classList.remove('on'); document.body.classList.add('playing');
    S.mode = 'play'; S.startT = S.t; IN.enabled = true;
    playMusic('calm', 1);
    banner("Lampwright's Rise", 'the last lit workshop', 3);
    setTimeout(() => caption('The ink took the valley. Your prism fires <b>stored sunlight</b>.', 4.5), 1200);
    if (isTouch && innerHeight > innerWidth) $('rotate').classList.add('show');
    setTimeout(() => $('rotate').classList.remove('show'), 6000);
    HUD.objective('Clear the ink from the Rise', 'the five plumes are the inkwells');
    S.visited.add('rise');
  },
  pause(on) { if (S.mode !== 'play') return; Game.paused = on; $('pause').classList.toggle('on', on); if (on && document.pointerLockElement) document.exitPointerLock(); },
  playing() { return S.mode === 'play' || S.mode === 'finale' || S.mode === 'roam'; },
  idle(dt) { updateParticles(dt, null); updateTracers(dt); },
  preUpdate(dt) {
    // look input passes through aim assist before it turns the head
  },
  update(rdt, now) {
    S.frame = (S.frame || 0) + 1;
    let dt = rdt; if (S.slowmo > 0) { S.slowmo -= rdt; dt = rdt * 0.35; }
    S.t += rdt;
    // tutorial pack
    if (S.mode === 'play' && !S.tutorial.packed && S.t - S.startT > 4.5) {
      S.tutorial.packed = true;
      const cx = P.pos.x - Math.sin(P.yaw) * 17, cz = P.pos.z - Math.cos(P.yaw) * 17;
      for (let i = 0; i < 3; i++) spawn('blotling', cx + (i - 1) * 3, cz + (Math.random() - 0.5) * 3, { tier: -2 });
      caption(isTouch ? 'Drag your <b>right thumb</b> to aim. On ink, the prism <b>fires by itself</b>.' : '<b>Mouse</b> to aim, <b>click</b> to fire, <b>Shift</b> to dash.', 6);
      S.roamT = 14;
    }
    if (S.stage === 0 && S.kills >= 3) { setStage(1); setTimeout(() => caption('Five inkwells feed the blot. Start with the one in the <b>Olive Terraces</b>, below.', 6), 1500); }
    if (S.mode === 'play') { director(dt); updateWells(dt); }
    if (S.stage === 3 && Math.hypot(P.pos.x - ARENA[0], P.pos.z - ARENA[1]) < 26 && BOSS && !BOSS.alive && BOSS.hp > 0) wakeBoss();
    updateBoss(dt);
    // combo decay
    if (S.comboT > 0) { S.comboT -= rdt; if (S.comboT <= 0) { S.combo = 0; S.mult = 1; } }
    // input: dash, bloom, fire
    if (takeDash() && dash(IN.mx, IN.my)) { sfx.dash(); emit('add', P.pos.x, P.pos.y + 1, P.pos.z, 12, { speed: 3, life: 0.4, size: 0.2, color: [0.8, 0.9, 1.4] }); }
    if (takeBloom()) doBloom();
    updateWeapon(dt, IN.fire, now);
    updateEnemies(dt, now);
    // dash through quills and blotlings kills them
    if (P.dashT > 0) for (const e of ENEMIES) if (e.alive && (e.type === 'quill' || e.type === 'blotling') && e.pos.distanceTo(P.pos) < 1.8 + (e.fly ? e.flyY : 0)) { if (damage(e, 999)) onKill(e, {}); }
    // places
    for (const p of PLACES) if (!S.visited.has(p.id) && Math.hypot(P.pos.x - p.at[0], P.pos.z - p.at[1]) < p.r) { S.visited.add(p.id); banner(p.name, p.sub); }
    // death and respawn
    if (!P.alive && S.mode === 'play') {
      if (S.deadT === 0) { S.deaths++; post.uFlash.value = 0; callout('THE INK TOOK YOU'); S.combo = 0; S.mult = 1; }
      S.deadT += rdt;
      if (S.deadT > 2.2) {
        S.deadT = 0; const l = LANTERNS.find((q) => q.id === S.respawn) || LANTERNS[0];
        placePlayer(l.at[0] + 2, l.at[1] + 2, P.yaw); P.hp = P.maxHp; P.alive = true; P.invuln = 2;
        S.score = Math.round(S.score * 0.9);
        for (const e of ENEMIES) if (e.pos.distanceTo(P.pos) < 28) e.alive = false;
        caption('You wake by the lantern. The ink kept <b>a tenth of your score</b>.', 4);
      }
    }
    if (S.mode === 'play' && P.hurtT > 0.45 && !S.tutorial.dashTold) { S.tutorial.dashTold = true; caption('Hurt? <b>DASH</b>. Nothing touches you mid-dash.', 4.5); }
    if (WPN.bloom >= 1 && !S.tutorial.bloomTold) { S.tutorial.bloomTold = true; caption('<b>BLOOM</b> is charged. Use it in a crowd.', 4.5); }
    // finale: the colour floods the valley
    if (S.mode === 'finale') {
      S.finaleT += rdt; PU.uGlobal.value = Math.min(1, S.finaleT / 6);
      if (S.finaleT > 8.5 && !S.overShown) { S.overShown = true; endCard(); }
    }
    // steps
    S.stepT += P.speed * rdt; if (S.stepT > 2.2 && P.onGround) { S.stepT = 0; sfx.step(); }
    updateParticles(dt, new THREE.Vector3(P.pos.x, P.pos.y + EYE, P.pos.z));
    updateTracers(rdt); updateBlooms(dt);
    // the world warms as it is restored
    const rf = restoredFraction();
    skyU.uWarm.value = Math.min(1, rf * 1.6 + PU.uGlobal.value);
    musicIntensity(Math.min(1, S.combo / 20));
    post.uFlash.value *= Math.exp(-rdt * 6);
    post.uHurt.value = Math.max(P.hurtT * 1.4, P.hp < 30 ? 0.35 + Math.sin(S.t * 5) * 0.1 : 0, P.alive ? 0 : 1);
    // HUD
    HUD.score(S.score); HUD.combo(S.mult, S.combo); HUD.hp(P.hp / P.maxHp); HUD.restored(rf);
    HUD.lock(!!WPN.lock); HUD.bloom(WPN.bloom, WPN.bloom >= 1); HUD.dash(P.dashCharges);
    if (S.stage === 2) { const left = WELLS.filter((w) => w.alive).length; HUD.objective(`Break the inkwells: ${left} left`, WELLS.filter((w) => w.alive).map((w) => PLACES.find((p) => p.id === w.place).name).join(' · ') + ' · any order'); }
    compass(objectiveTarget(), P.yaw);
    updateHud(rdt);
  },
  postCamera() {},
  telemetry(g) {
    g.score = S.score; g.over = S.mode === 'over'; g.hp = Math.round(P.hp); g.shots = WPN.shots; g.kills = S.kills; g.alive = P.alive;
    g.combo = S.combo; g.mult = S.mult; g.stage = S.stage; g.cleansed = S.cleansed.length; g.restored = +(restoredFraction() * 100).toFixed(2);
    g.enemies = ENEMIES.length; g.lock = !!WPN.lock; g.mode = S.mode; g.bloom = +WPN.bloom.toFixed(2); g.lenses = WPN.lenses.length;
    g.boss = BOSS ? Math.round(BOSS.hp) : null; g.deaths = S.deaths;
    // the screen position of the nearest visible target, for a gate that wants to aim
    const tg = WPN.lock; if (tg) { const v = tg.pos.clone().project(camera); g.aim = [+(v.x * 0.5 + 0.5).toFixed(3), +(-v.y * 0.5 + 0.5).toFixed(3), 1]; } else g.aim = null;
    // where the nearest ink is relative to the view (yaw and pitch deltas), for a gate that wants to aim like a thumb would
    let nb = null, nd = 70; for (const t of targets()) { const d = t.pos.distanceTo(camera.position); if (d < nd && (t.kind !== 'boss' || t.core)) { nd = d; nb = t; } }
    let nn = null, nnd = 80; for (const t of targets()) if (t.kind === 'node' || (t.kind === 'boss' && t.core)) { const d = t.pos.distanceTo(camera.position); if (d < nnd) { nnd = d; nn = t; } }
    if (nn) { const v = nn.pos.clone().sub(camera.position).normalize(); let dyaw = Math.atan2(-v.x, -v.z) - P.yaw; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw)); g.nearNode = [+dyaw.toFixed(3), +(Math.asin(v.y) - P.pitch).toFixed(3), +nnd.toFixed(1)]; } else g.nearNode = null;
    if (nb) { const v = nb.pos.clone().sub(camera.position).normalize(); let dyaw = Math.atan2(-v.x, -v.z) - P.yaw; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw)); g.near = [+dyaw.toFixed(3), +(Math.asin(v.y) - P.pitch).toFixed(3), +nd.toFixed(1)]; } else g.near = null;
    const near = nearestWell(); g.well = near ? [near.at[0], near.at[1]] : null;
  },
};

// look input runs through aim assist; main.js reads IN.look* directly, so wrap readLook here
import * as inputMod from './input.js';
const rawRead = inputMod.readLook;
export function readLookAssisted(dt) { let [lx, ly] = rawRead(); swayFromLook(lx, ly); return assistLook(lx, ly, dt, Math.hypot(IN.mx, IN.my) > 0.2); }
if (window.__DBG__) Object.assign(window.__DBG__, { WPN, targets: () => targets(), ENEMIES, P });
else window.__DBG2__ = { WPN, targets: () => targets(), ENEMIES, P };
