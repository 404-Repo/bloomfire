// The HUD: everything the player reads, kept in the DOM and touched only when a value changes.
import * as THREE from 'three';
import { camera } from './render.js';

const $ = (id) => document.getElementById(id);
const el = { score: $('scoren'), combo: $('combo'), hp: $('hp'), hpf: $('hpf'), objt: $('objt'), objs: $('objs'), restn: $('restn'),
  cmark: $('cmark'), xhair: $('xhair'), hitm: $('hitm'), floaters: $('floaters'), callout: $('callout'), banner: $('banner'),
  bannert: $('bannert'), banners: $('banners'), caption: $('caption'), dmg: $('dmg'), bossbar: $('bossbar'), bossn: $('bossn'), bossf: $('bossf'),
  bloom: $('bbloom'), bloomf: $('bloomf'), dash: $('bdash') };
const last = {};
const set = (k, v, fn) => { if (last[k] !== v) { last[k] = v; fn(v); } };

export const HUD = {
  score(n) { set('score', n, (v) => el.score.textContent = v.toLocaleString('en-US')); },
  combo(mult, count) { set('combo', mult + ':' + count, () => { el.combo.textContent = mult > 1 ? 'x' + mult : ''; el.combo.className = mult >= 8 ? 'max' : mult >= 4 ? 'hot' : ''; }); },
  hp(f) { set('hp', Math.round(f * 100), (v) => { el.hpf.style.width = v + '%'; el.hp.classList.toggle('low', v < 30); }); },
  objective(t, s = '') { set('obj', t + '|' + s, () => { el.objt.textContent = t; el.objs.textContent = s; }); },
  restored(f) { set('rest', Math.floor(f * 1000), () => { el.restn.textContent = (f * 100).toFixed(f < 0.1 ? 1 : 0) + '%'; }); },
  lock(on) { set('lock', on, (v) => el.xhair.classList.toggle('lock', v)); },
  bloom(f, ready) { set('bloom', Math.round(f * 50) + (ready ? 'r' : ''), () => { el.bloomf.style.height = Math.round(f * 100) + '%'; el.bloom.classList.toggle('ready', ready); }); },
  dash(n) { set('dash', n, (v) => el.dash.classList.toggle('cd', v < 1)); },
  hurt(f) { set('hurt', Math.round(f * 20), () => { el.dmg.style.opacity = f; }); },
  boss(name, f) { set('boss', name ? name + Math.round(f * 200) : '', () => { el.bossbar.classList.toggle('on', !!name); if (name) { el.bossn.textContent = name; el.bossf.style.width = (f * 100) + '%'; } }); },
};

// compass: a dot on a strip that shows where the objective is relative to where you look
const _v = new THREE.Vector3();
export function compass(target, yaw) {
  if (!target) { el.cmark.style.display = 'none'; return; }
  const dx = target[0] - camera.position.x, dz = target[1] - camera.position.z;
  const ang = Math.atan2(-dx, -dz); let rel = ang - yaw; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
  const f = THREE.MathUtils.clamp(-rel / (Math.PI * 0.5), -1, 1);
  el.cmark.style.display = 'block'; el.cmark.style.left = (50 + f * 50) + '%'; el.cmark.classList.toggle('edge', Math.abs(f) >= 1);
}

let hitT = 0;
export function hitMarker(kill) { el.hitm.className = kill ? 'k' : ''; el.hitm.style.opacity = 1; el.hitm.style.transform = `rotate(45deg) scale(${kill ? 1.25 : 1})`; hitT = kill ? 0.22 : 0.12; }
export function updateHud(dt) { if (hitT > 0) { hitT -= dt; if (hitT <= 0) el.hitm.style.opacity = 0; } }

export function floater(pos, text, cls = '') {
  _v.copy(pos).project(camera); if (_v.z > 1) return;
  const d = document.createElement('div'); d.className = 'fl ' + cls; d.textContent = text;
  d.style.left = ((_v.x * 0.5 + 0.5) * 100) + '%'; d.style.top = ((-_v.y * 0.5 + 0.5) * 100) + '%';
  el.floaters.appendChild(d); setTimeout(() => d.remove(), 950);
  while (el.floaters.childElementCount > 14) el.floaters.firstChild.remove();
}
export function callout(text) { el.callout.textContent = text; el.callout.classList.remove('on'); void el.callout.offsetWidth; el.callout.classList.add('on'); }
let bannerTimer = 0;
export function banner(t, s, secs = 3.2) { el.bannert.textContent = t; el.banners.textContent = s; el.banner.classList.add('on'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => el.banner.classList.remove('on'), secs * 1000); }
let capTimer = 0;
export function caption(html, secs = 4.5) { el.caption.innerHTML = html; el.caption.classList.add('on'); clearTimeout(capTimer); capTimer = setTimeout(() => el.caption.classList.remove('on'), secs * 1000); }

// where the hurt came from, as an arc around the reticle
const dd = document.getElementById('dmgdir'); let ddT = 0;
export function hurtFrom(angleRel) { dd.style.transform = `rotate(${(-angleRel * 180 / Math.PI).toFixed(1)}deg)`; dd.classList.add('on'); clearTimeout(ddT); ddT = setTimeout(() => dd.classList.remove('on'), 700); }

// the waypoint: a gold diamond over the objective with its distance, pinned to the screen edge when off screen
const wp = document.getElementById('wp'), wpd = document.getElementById('wpd'), _w = new THREE.Vector3();
export function waypoint(t) {
  if (!t || !document.body.classList.contains('playing')) { wp.style.display = 'none'; return; }
  const x = t[0], z = t[1]; _w.set(x, camera.position.y, z);
  const d = Math.hypot(x - camera.position.x, z - camera.position.z);
  if (d < 12) { wp.style.display = 'none'; return; }
  _w.y = camera.position.y + Math.min(14, 3 + d * 0.05);
  const v = _w.clone().project(camera); const behind = v.z > 1;
  let sx = v.x, sy = v.y; if (behind) { sx = -sx; sy = -sy; }
  const edge = behind || Math.abs(sx) > 0.9 || Math.abs(sy) > 0.85;
  if (edge) { const k = Math.max(Math.abs(sx) / 0.9, Math.abs(sy) / 0.85, 1e-3); sx /= k; sy /= k; if (behind) sy = Math.min(sy, -0.3); }
  wp.style.display = 'block'; wp.style.left = ((sx * 0.5 + 0.5) * 100) + '%'; wp.style.top = ((-sy * 0.5 + 0.5) * 100) + '%';
  wp.classList.toggle('edge', edge); wpd.textContent = Math.round(d) + ' m';
}

// threats: red chevrons around the reticle pointing at ink that is close and off screen
const thr = [...document.querySelectorAll('#threats i')];
export function threats(list) {   // list of { rel (rad, + is left), d (m) }
  thr.forEach((el, i) => {
    const t = list[i]; if (!t) { el.style.display = 'none'; return; }
    const R = Math.min(innerWidth, innerHeight) * 0.36, a = -t.rel;   // screen angle, clockwise from up
    el.style.display = 'block'; el.style.opacity = Math.max(0.45, 1 - t.d / 14);
    el.style.transform = `translate(${Math.sin(a) * R}px, ${-Math.cos(a) * R}px) rotate(${a}rad) scale(${t.d < 4 ? 1.3 : 1})`;
  });
}
