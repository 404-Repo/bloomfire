// Sound: synthesised effects (Web Audio), music files with layers, and the iOS unlock dance.
let ctx = null, master = null, sfxBus = null, musicBus = null, enabled = true, noiseBuf = null;
const music = {};   // name -> { el?, buf, src, gain }

export function unlockAudio() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = enabled ? 0.9 : 0; master.connect(ctx.destination);
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.85; sfxBus.connect(comp);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.42; musicBus.connect(comp);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
    }
    if (ctx.state !== 'running') ctx.resume();
    const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);
  } catch {}
}
['touchend', 'click', 'keydown'].forEach((ev) => addEventListener(ev, unlockAudio, { passive: true }));
document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx) ctx.resume(); });

export function setSound(on) { enabled = on; if (master) master.gain.value = on ? 0.9 : 0; }
export const soundOn = () => enabled;
const now = () => ctx.currentTime;
const ok = () => ctx && ctx.state === 'running' && enabled;

function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function noise(t, dur, f, q, peak, type = 'bandpass', pan = 0) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = ctx.createGain(); env(g, t, 0.004, peak, dur); const p = ctx.createStereoPanner(); p.pan.value = pan;
  s.connect(fl).connect(g).connect(p).connect(sfxBus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05); return fl;
}
function tone(t, f0, f1, dur, type, peak, pan = 0) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = ctx.createGain(); env(g, t, 0.005, peak, dur); const p = ctx.createStereoPanner(); p.pan.value = pan;
  o.connect(g).connect(p).connect(sfxBus); o.start(t); o.stop(t + dur + 0.05);
}

let lastShot = 0;
export const sfx = {
  shot(rapid) { if (!ok()) return; const t = now(); if (t - lastShot < 0.05) return; lastShot = t;
    tone(t, 1500 + Math.random() * 150, 260, 0.09, 'sawtooth', 0.12); tone(t, 2400, 900, 0.05, 'triangle', 0.12); noise(t, 0.06, 2600, 0.9, 0.22); tone(t, 140, 55, 0.08, 'sine', 0.32); },
  hit(core) { if (!ok()) return; const t = now(); tone(t, core ? 3200 : 2100, core ? 2600 : 1700, 0.035, 'square', 0.1); noise(t, 0.03, 5000, 2, 0.12, 'highpass'); },
  kill(combo) { if (!ok()) return; const t = now(); const st = Math.min(combo, 24); const base = 440 * Math.pow(2, (st % 12) / 12) * (st >= 12 ? 2 : 1);
    tone(t, base, base * 1.02, 0.18, 'triangle', 0.26); tone(t + 0.04, base * 1.5, base * 1.5, 0.2, 'sine', 0.16); tone(t + 0.08, base * 2, base * 2, 0.16, 'sine', 0.1);
    noise(t, 0.22, 700, 0.8, 0.34, 'lowpass'); tone(t, 180, 60, 0.18, 'sine', 0.3); },
  splat() { if (!ok()) return; const t = now(); noise(t, 0.22, 500, 0.7, 0.3, 'lowpass'); tone(t, 140, 60, 0.18, 'sine', 0.2); },
  hurt() { if (!ok()) return; const t = now(); tone(t, 180, 70, 0.22, 'sawtooth', 0.18); noise(t, 0.2, 400, 1, 0.25, 'lowpass'); },
  dash() { if (!ok()) return; const t = now(); const f = noise(t, 0.28, 600, 1.4, 0.3); f.frequency.exponentialRampToValueAtTime(3200, t + 0.25); },
  bloom() { if (!ok()) return; const t = now(); tone(t, 110, 880, 0.9, 'sawtooth', 0.2); tone(t, 220, 1320, 1.1, 'triangle', 0.22); noise(t, 1.0, 1200, 0.5, 0.35, 'lowpass');
    [523, 659, 784, 1046].forEach((f, i) => tone(t + 0.12 + i * 0.07, f, f, 0.7, 'sine', 0.14)); },
  telegraph() { if (!ok()) return; const t = now(); tone(t, 90, 160, 0.5, 'sawtooth', 0.12); },
  spit() { if (!ok()) return; const t = now(); noise(t, 0.25, 700, 2, 0.22); tone(t, 300, 120, 0.2, 'sine', 0.12); },
  node() { if (!ok()) return; const t = now(); tone(t, 330, 110, 0.6, 'sawtooth', 0.22); noise(t, 0.6, 300, 0.7, 0.4, 'lowpass'); [659, 880].forEach((f, i) => tone(t + 0.1 + i * 0.1, f, f, 0.5, 'triangle', 0.14)); },
  cleanse() { if (!ok()) return; const t = now(); noise(t, 2.2, 600, 0.4, 0.4, 'lowpass'); [392, 494, 587, 784, 988, 1175].forEach((f, i) => tone(t + i * 0.11, f, f * 1.003, 1.4, 'triangle', 0.13)); tone(t, 65, 40, 1.6, 'sine', 0.4); },
  tier(n) { if (!ok()) return; const t = now(); [0, 4, 7, 12].forEach((s, i) => tone(t + i * 0.05, 523 * Math.pow(2, (s + n * 2) / 12), 523 * Math.pow(2, (s + n * 2) / 12), 0.3, 'square', 0.06)); },
  pickup() { if (!ok()) return; const t = now(); tone(t, 1320 + Math.random() * 300, 1800, 0.06, 'sine', 0.06); },
  lantern() { if (!ok()) return; const t = now(); [784, 988, 1175].forEach((f, i) => tone(t + i * 0.09, f, f, 0.8, 'sine', 0.12)); },
  roar() { if (!ok()) return; const t = now(); tone(t, 70, 45, 1.2, 'sawtooth', 0.3); noise(t, 1.2, 220, 0.8, 0.4, 'lowpass'); },
  step() { if (!ok()) return; const t = now(); noise(t, 0.05, 260 + Math.random() * 80, 1.2, 0.05, 'lowpass'); },
};

// ---- music: looping files, crossfaded by state ------------------------------------------------------
export async function loadMusic(name, url) {
  try { const r = await fetch(url); if (!r.ok) return; const ab = await r.arrayBuffer(); music[name] = { ab }; } catch {}
}
let current = null;
export function playMusic(name, fade = 2.0) {
  if (!ctx || current === name) return;
  const t = now();
  if (current && music[current] && music[current].gain) { const m = music[current]; m.gain.gain.cancelScheduledValues(t); m.gain.gain.setValueAtTime(m.gain.gain.value, t); m.gain.gain.linearRampToValueAtTime(0, t + fade); const src = m.src; setTimeout(() => { try { src.stop(); } catch {} }, fade * 1000 + 100); m.src = null; }
  current = name; const m = music[name]; if (!m) return;
  const start = (buf) => { if (current !== name) return; const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; const g = ctx.createGain(); g.gain.setValueAtTime(0, now()); g.gain.linearRampToValueAtTime(1, now() + fade); s.connect(g).connect(musicBus); s.start(); m.src = s; m.gain = g; };
  if (m.buf) start(m.buf); else ctx.decodeAudioData(m.ab.slice(0), (b) => { m.buf = b; start(b); }, () => {});
}
export function musicIntensity(v) { if (musicBus) musicBus.gain.setTargetAtTime(0.32 + v * 0.18, now(), 0.5); }
