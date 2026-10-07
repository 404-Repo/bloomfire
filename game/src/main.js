// BLOOMFIRE: boot, load, the frame loop, and the telemetry the gates read.
import * as THREE from 'three';
import { renderer, scene, camera, resize, draw, followShadow, skyFollow, isTouch, post, setSkyTexture } from './render.js';
import { buildTerrain } from './terrain.js';
import { makeGround, makeWater, waterLevelAt, waterU } from './ground.js';
import { updatePaint, setLandMask, loadDetail, splatNow } from './paint.js';
import { groundU } from './ground.js';
import { IN, readLook } from './input.js';
import { P, initPlayer, placePlayer, updatePlayer, applyCamera } from './player.js';
import { SPAWN } from './layout.js';
import { buildWorld, updateWorld } from './world.js';
import { Game, readLookAssisted } from './game.js';

if (isTouch) document.body.classList.add('touchdev');
const params = new URLSearchParams(location.search);
const bar = document.getElementById('barf'), loadmsg = document.getElementById('loadmsg');
const progress = (f, msg) => { bar.style.width = Math.round(f * 100) + '%'; if (msg) loadmsg.textContent = msg; };

const T = buildTerrain();
initPlayer(T, waterLevelAt);
setLandMask((x, z) => waterLevelAt(x, z) < -50);
scene.add(makeGround(T));
scene.add(makeWater());
resize(); addEventListener('resize', resize);

let fps = 60, frames = 0, fpsT = performance.now(), last = performance.now(), running = false, simTime = 0;
window.__GAME__ = { pos: [0, 0], fps: 0, speed: 0, score: 0, over: false, draws: 0, tris: 0 };

async function boot() {
  progress(0.05, 'mixing the paint');
  await loadTextures();
  progress(0.1, 'raising the valley');
  await buildWorld(T, (f, m) => progress(0.1 + f * 0.8, m));
  progress(0.95, 'grinding the prism');
  await Game.init(T);
  placePlayer(SPAWN.at[0], SPAWN.at[1], SPAWN.yaw);
  // capture/dev only: ?at=x,z,yaw,pitch stands you somewhere; ?paint=x,z,r paints a circle (used by the frame capture tool)
  if (params.get('at')) { const [x, z, yw, pt] = params.get('at').split(',').map(Number); placePlayer(x, z, yw || 0); P.pitch = pt || 0; }
  if (params.get('paint')) for (const c of params.get('paint').split(';')) { const [x, z, r] = c.split(',').map(Number); splatNow(x, z, r); }
  progress(1, 'ready');
  // compile every shader once while the title is up, so the first fight does not hitch
  applyCamera(camera, 0); renderer.compile(scene, camera);
  document.getElementById('load').style.display = 'none';
  Game.showTitle();
  window.__READY__ = true;
  requestAnimationFrame(loop);
}

async function loadTextures() {
  const tl = new THREE.TextureLoader();
  const load = (n) => new Promise((res) => tl.load(`./tex/${n}/basecolor.jpg`, (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; res(t); }, undefined, () => res(null)));
  let idx = []; try { idx = await (await fetch('./tex/index.json')).json(); } catch {}
  const has = (n) => idx.includes(n);
  const [g, d, r, c] = await Promise.all(['meadow', 'dirt', 'limestone', 'cobble'].map((n) => has(n) ? load(n) : null));
  if (g && d && r && c) { groundU.tGrass.value = g; groundU.tDirt.value = d; groundU.tRock.value = r; groundU.tCobble.value = c; groundU.uHasTex.value = 1; }
  const sky = await new Promise((res) => tl.load('./img/sky.jpg', (t) => { t.colorSpace = THREE.NoColorSpace; res(t); }, undefined, () => res(null)));
  if (sky) setSkyTexture(sky);
  await Promise.all(['plaster', 'drystone', 'rooftile', 'timber'].filter(has).map((n) => loadDetail(n, `./tex/${n}/basecolor.jpg`)));
}

window.__START__ = () => Game.start();
window.__DBG__ = { scene, renderer, camera, THREE };

function loop(now) {
  requestAnimationFrame(loop);
  const rdt = (now - last) / 1000; last = now;
  const dt = Math.min(rdt, 1 / 20);
  frames++; if (now - fpsT >= 500) { fps = Math.round(frames * 1000 / (now - fpsT)); frames = 0; fpsT = now; }
  const playing = Game.playing();
  if (playing && !Game.paused) {
    simTime += dt;
    const [lx, ly] = readLookAssisted(dt);
    P.yaw -= lx; P.pitch = THREE.MathUtils.clamp(P.pitch - ly, -1.05, 1.0);
    Game.preUpdate(dt);
    if (P.alive) updatePlayer(dt, IN.mx, IN.my);
    Game.update(dt, simTime);
  } else { readLook(); Game.idle(dt, now / 1000); }
  updatePaint(dt, simTime);
  waterU.uT.value = now / 1000;
  applyCamera(camera, dt);
  Game.postCamera(dt);
  updateWorld(dt, simTime, camera);
  followShadow(P.pos); skyFollow(camera.position);
  draw();
  const g = window.__GAME__;
  g.pos[0] = +P.pos.x.toFixed(2); g.pos[1] = +P.pos.z.toFixed(2); g.y = +P.pos.y.toFixed(2);
  g.fps = fps; g.speed = +P.speed.toFixed(2); g.draws = renderer.info.render.calls; g.tris = renderer.info.render.triangles;
  g.yaw = +P.yaw.toFixed(3); g.pitch = +P.pitch.toFixed(3);
  Game.telemetry(g);
}

boot().catch((e) => { console.error(e); loadmsg.textContent = 'failed to load: ' + e.message; });
