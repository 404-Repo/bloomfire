// Turns the raw sound log from shim.js into lines a tester that cannot hear can read. (v2)
// It keeps state across acts, so music that started earlier and is still playing is reported every act.
// Heuristics (stated so a tester can weigh them):
//   - a looping buffer, a buffer or media file of 6 s or longer, or a looping <audio> = music or ambience;
//   - oscillator notes or samples scheduled 50 ms or more ahead of the audio clock = sequenced (generated) music;
//   - everything else that starts "now" = a sound effect, listed in order with its pitch;
//   - anything started on an audio engine that is not running is inaudible on a real phone and is reported as such.
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nn = (f) => { if (!f || f <= 0) return '?'; const m = Math.round(12 * Math.log2(f / 440) + 69); return NOTES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); };
const midi = (f) => 12 * Math.log2(f / 440) + 69;
const s1 = (ms) => (ms / 1000).toFixed(1);
export function newState() { return { active: new Map(), anySound: false, seqLast: null }; }
const isMusic = (e) => (e.kind === 'buf' || e.kind === 'media') && (e.loop || (e.len || 0) >= 6);
function sfxSig(e) {
  if (e.kind === 'chord') return 'chord ' + e.desc;
  if (e.kind === 'osc') return `tone ${e.wave}`;
  if (e.kind === 'buf') return e.name === 'procedural buffer' ? 'noise/procedural burst' : `sample "${e.name}"`;
  if (e.kind === 'media') return `audio file "${e.name}"`;
  return e.node || e.kind;
}
function pitchOf(e) { if (e.kind === 'chord') return e.chord[0].f0; if (e.kind === 'osc') return e.f0; if (e.kind === 'buf' || e.kind === 'media') return 440 * (e.rate || 1); return null; }
function describe(e) {
  if (e.kind === 'chord') return e.desc;
  if (e.kind === 'osc') {
    let s = `tone (${e.wave}) ${nn(e.f0)} ${Math.round(e.f0)} Hz`;
    if (e.f1 && Math.abs(midi(e.f1) - midi(e.f0)) >= 1) s += `, sliding ${e.f1 > e.f0 ? 'UP' : 'DOWN'} to ${nn(e.f1)}`;
    if (e.dur) s += `, ${e.dur} s`;
    return s;
  }
  if (e.kind === 'buf') return `${e.name === 'procedural buffer' ? 'noise/procedural burst' : `sample "${e.name}"`}${e.len ? ` ${e.len} s` : ''}${e.rate && e.rate !== 1 ? `, playback rate ${e.rate}` : ''}`;
  if (e.kind === 'media') return `audio file "${e.name}"${e.len ? ` ${e.len} s` : ''}${e.loop ? ', looping' : ''}${e.muted ? ' (MUTED)' : ''}`;
  if (e.kind === 'vibrate') return `phone vibration ${e.p}`;
  if (e.kind === 'media_blocked') return `audio file "${e.name}" was BLOCKED by the browser (${e.err}): silent`;
  return e.kind;
}
// ev: raw events with t in play-time ms; st: newState(); now: play-time ms at the end of the stretch
export function summarise(ev, st, now) {
  const out = [];
  const real = ev.filter((e) => !['ctx', 'decode'].includes(e.kind));
  const inaudible = real.filter((e) => e.ctxState && e.ctxState !== 'running' && e.kind !== 'stop');
  const aud = real.filter((e) => !inaudible.includes(e));
  for (const e of aud) {
    if (e.kind === 'stop') { const a = st.active.get(e.id); if (a) { st.active.delete(e.id); out.push(`[${s1(e.t)} s] music stopped: "${a.name}"`); } continue; }
    if (isMusic(e)) { st.active.set(e.id ?? Math.random(), { name: e.name, since: e.t, loop: !!e.loop, end: e.loop ? Infinity : e.t + (e.len || 0) * 1000 / (e.rate || 1), muted: e.muted }); out.push(`[${s1(e.t)} s] MUSIC/AMBIENCE starts: ${describe(e)}`); }
  }
  for (const [k, a] of st.active) if (a.end < now - 1000) st.active.delete(k);
  const seq = aud.filter((e) => !isMusic(e) && (e.kind === 'osc' || e.kind === 'buf') && (e.ahead || 0) >= 0.05);
  const sfx = aud.filter((e) => !isMusic(e) && !seq.includes(e) && e.kind !== 'stop');
  if (aud.some((e) => e.kind !== 'stop')) st.anySound = true;
  const playing = [...st.active.values()].filter((a) => !a.muted);
  if (playing.length) {
    const nm = (a) => (a.name === 'procedural buffer' ? 'a generated loop (wind, drone or ambience)' : `"${a.name}"${a.loop ? ' (loop)' : ''}`);
    const cnt = new Map(); for (const a of playing) { const k = nm(a); cnt.set(k, { n: (cnt.get(k)?.n || 0) + 1, since: Math.min(cnt.get(k)?.since ?? Infinity, a.since) }); }
    out.push(`MUSIC/AMBIENCE playing under this stretch: ${[...cnt].map(([k, v]) => `${k}${v.n > 1 ? ` x${v.n}` : ''}, since ${s1(v.since)} s`).join('; ')}`);
  }
  if (seq.length) {
    const fs = seq.map(pitchOf).filter(Boolean), span = Math.max(0.5, (seq[seq.length - 1].t - seq[0].t) / 1000);
    const waves = [...new Set(seq.map((e) => (e.kind === 'osc' ? e.wave : e.name)))].slice(0, 4).join(', ');
    out.push(`SEQUENCED MUSIC (notes scheduled on a beat): ${seq.length} notes over ${s1(seq[0].t)} to ${s1(seq[seq.length - 1].t)} s${fs.length ? `, ${nn(Math.min(...fs))} to ${nn(Math.max(...fs))}` : ''}, about ${(seq.length / span).toFixed(1)} per s, voices: ${waves}`);
    st.seqLast = now;
  }
  if (!playing.length && !seq.length) out.push('MUSIC: none playing in this stretch');
  const sfx2 = [];
  for (const e of sfx) { const L = sfx2[sfx2.length - 1]; if (L && e.kind === 'osc' && L.chord && Math.abs(e.t - L.t0) < 30) { L.chord.push(e); continue; } sfx2.push(e.kind === 'osc' ? { ...e, t0: e.t, chord: [e] } : e); }
  for (const e of sfx2) if (e.chord && e.chord.length > 1) { const fs = e.chord.map((c) => c.f0).sort((a, b) => a - b); e.kind = 'chord'; e.desc = `chord or layered tone of ${e.chord.length} notes, ${nn(fs[0])} to ${nn(fs[fs.length - 1])}${e.dur ? `, ${e.dur} s` : ''}`; }
  const groups = [];
  for (const e of sfx2) { const sig = sfxSig(e), g = groups[groups.length - 1]; if (g && g.sig === sig && e.t - g.items[g.items.length - 1].t < 1500) g.items.push(e); else groups.push({ sig, items: [e] }); }
  if (!groups.length) out.push('EFFECTS: none in this stretch');
  let shown = 0;
  for (const g of groups) {
    if (shown >= 14) { out.push(`... ${groups.length - 14} more sound-effect groups`); break; }
    shown++;
    const a = g.items, first = a[0];
    if (a.length === 1) { out.push(`[${s1(first.t)} s] effect: ${describe(first)}`); continue; }
    const ps = a.map(pitchOf).filter(Boolean);
    let dir = '';
    if (ps.length >= 3) { let up = 0, dn = 0; for (let i = 1; i < ps.length; i++) { if (ps[i] > ps[i - 1] * 1.01) up++; else if (ps[i] < ps[i - 1] * 0.99) dn++; } dir = up === ps.length - 1 ? ', pitch RISING each time' : dn === ps.length - 1 ? ', pitch FALLING each time' : up + dn === 0 ? ', same pitch each time' : ', varied pitch'; }
    const rng = ps.length && first.kind !== 'buf' ? ` (${nn(Math.min(...ps))} to ${nn(Math.max(...ps))})` : '';
    out.push(`[${s1(first.t)} to ${s1(a[a.length - 1].t)} s] effect x${a.length}: ${describe(first)}${rng}${dir}`);
  }
  // pitch patterns per sound across the stretch (catches a rising chime even when other sounds interleave)
  const bySig = new Map(); for (const e of sfx2) { const k = sfxSig(e); if (!bySig.has(k)) bySig.set(k, []); bySig.get(k).push(e); }
  for (const [k, a] of bySig) { if (a.length < 3) continue; const ps = a.map(pitchOf).filter(Boolean); if (ps.length < 3) continue; let up = 0; for (let i = 1; i < ps.length; i++) if (ps[i] > ps[i - 1] * 1.005) up++; if (up >= ps.length - 1 - Math.floor((ps.length - 1) / 4) && up >= 2) out.push(`pattern: ${k} played ${a.length} times with its pitch climbing (${nn(Math.min(...ps))} up to ${nn(Math.max(...ps))})`); }
  if (inaudible.length) out.push(`(${inaudible.length} more sounds were started on an audio engine that is not running; a player would NOT hear them)`);
  if (!playing.length && !seq.length && !groups.length) { out.length = 0; out.push(st.anySound ? 'SILENCE: nothing audible in this stretch' : 'SILENCE: no sound has played at all so far this session (no music, no effects)'); }
  return out;
}
