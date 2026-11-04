// Site audio: the looping map music and synthesised UI sounds.
//
// The UI sounds follow measurements of Gran Turismo 7's menu sounds:
// - hover: a soft high pip around 2.2 kHz that falls 20 dB in about 70 ms
// - select: a bell chord on A, E and F# (about 440-1320 Hz) rolled upward over ~50 ms,
//   down 20 dB by 200 ms with a tail to about half a second
// - transition: ~650 ms of band-passed noise that swells for ~250 ms, centred near 4 kHz
// Nothing plays until the visitor turns sound on (browsers also require a gesture first).

const MUSIC_URL = `${import.meta.env.BASE_URL}audio/lounge.mp3`;
// The file holds a 76.8 s loop plus its first second again, so any loop window that starts
// inside that second is seamless; 0.6 s clears MP3 encoder start-up.
const LOOP_START = 0.6;
const LOOP_LENGTH = 76.8;
const MUSIC_LEVEL = 0.34;
const PREFS_KEY = 'jd-sound';

const DEFAULTS = { sound: false, music: true, effects: true };

const A4 = 440;
const hz = (semitones) => A4 * 2 ** (semitones / 12); // semitones from A4

function loadPrefs() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

class AudioEngine {
  constructor() {
    this.prefs = loadPrefs();
    this.ctx = null;
    this.listeners = new Set();
    this.musicBuffer = null;
    this.musicLoading = null;
    this.musicSource = null;
    this.duckLevel = 1;
    this.lastHover = 0;
    this.lastCue = 0;
  }

  // True if a non-hover sound started within the last `ms` milliseconds.
  recent(ms) {
    return performance.now() - this.lastCue < ms;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  set(changes) {
    const was = this.prefs;
    this.prefs = { ...this.prefs, ...changes };
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    } catch {
      /* storage unavailable */
    }
    for (const fn of this.listeners) fn(this.prefs);
    if (this.prefs.sound && !was.sound) {
      this.unlock();
      this.play('confirm');
    }
    this.syncMusic();
  }

  // Called from user gestures: browsers only allow audio to start inside one.
  unlock() {
    if (!this.prefs.sound) return;
    // A gesture is also the only time a replacement context may start, so swap a stuck one here.
    if (this.ctx && this.stuck()) this.discard();
    if (!this.ctx) this.build();
    if (!this.ctx) return;
    this.wake();
    this.syncMusic();
  }

  build() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createDynamicsCompressor();
    this.master.threshold.value = -10;
    this.master.ratio.value = 4;
    this.master.connect(ctx.destination);
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.master);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.9;
    this.sfx.connect(this.master);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.wakeAsked = 0;
    this.clock = { wall: performance.now(), time: ctx.currentTime };
    ctx.onstatechange = () => ctx === this.ctx && this.syncState();
    if (!this.listening) {
      this.listening = true;
      document.addEventListener('visibilitychange', () => this.syncVisibility());
      window.addEventListener('pageshow', () => this.wake());
      window.addEventListener('focus', () => this.wake());
    }
  }

  // Drop a context that will not come back; the decoded music is kept for the next one.
  discard() {
    const ctx = this.ctx;
    ctx.onstatechange = null;
    if (ctx.state !== 'closed') ctx.close().catch(() => {});
    this.ctx = null;
    this.musicSource = null;
  }

  // Mobile Safari suspends audio in the background and reports 'interrupted' as well as 'suspended'.
  // Because the site suspends it too when the tab hides, Safari leaves restarting it to the page.
  wake() {
    const ctx = this.ctx;
    if (!ctx || !this.prefs.sound || document.hidden || ctx.state === 'running' || ctx.state === 'closed') return;
    this.wakeAsked ||= performance.now();
    ctx.resume().catch(() => {});
  }

  syncState() {
    if (this.ctx.state === 'running') {
      this.wakeAsked = 0;
      this.clock = { wall: performance.now(), time: this.ctx.currentTime };
    } else {
      this.wake();
    }
  }

  // True when a resume has gone unanswered for over a second, or the context claims to be running
  // but its clock has stopped (both seen in Mobile Safari after switching apps).
  stuck() {
    const ctx = this.ctx;
    if (ctx.state === 'closed') return true;
    if (document.hidden) return false;
    const now = performance.now();
    if (ctx.state !== 'running') return this.wakeAsked > 0 && now - this.wakeAsked > 1000;
    const { wall, time } = this.clock;
    this.clock = { wall: now, time: ctx.currentTime };
    return now - wall > 1000 && ctx.currentTime - time < 0.05;
  }

  syncVisibility() {
    if (!this.ctx) return;
    if (document.hidden) {
      this.wakeAsked = 0;
      if (this.ctx.state === 'running') this.ctx.suspend().catch(() => {});
    } else {
      this.wake();
    }
  }

  async syncMusic() {
    const want = this.prefs.sound && this.prefs.music;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const g = this.musicGain.gain;
    if (!want) {
      g.cancelScheduledValues(now);
      g.setTargetAtTime(0, now, 0.25);
      // Sleep the audio device once everything has faded.
      if (!this.prefs.sound) setTimeout(() => !this.prefs.sound && this.ctx?.suspend().catch(() => {}), 900);
      return;
    }
    if (!this.musicBuffer) {
      this.musicLoading ||= fetch(MUSIC_URL)
        .then((r) => r.arrayBuffer())
        .then((b) => this.ctx.decodeAudioData(b))
        .then((buf) => {
          this.musicBuffer = buf;
        })
        .catch(() => {
          this.musicLoading = null;
        });
      await this.musicLoading;
      if (!this.musicBuffer || !(this.prefs.sound && this.prefs.music)) return;
    }
    if (!this.musicSource) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.musicBuffer;
      src.loop = true;
      src.loopStart = LOOP_START;
      src.loopEnd = LOOP_START + LOOP_LENGTH;
      src.connect(this.musicGain);
      src.start(this.ctx.currentTime + 0.05, LOOP_START);
      this.musicSource = src;
    }
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(MUSIC_LEVEL * this.duckLevel, t + 2.2);
  }

  // Lower the music a little while a page is open.
  duck(on) {
    this.duckLevel = on ? 0.62 : 1;
    if (!this.ctx || !this.musicSource || !(this.prefs.sound && this.prefs.music)) return;
    const g = this.musicGain.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(MUSIC_LEVEL * this.duckLevel, t, 0.35);
  }

  play(name, opts = {}) {
    if (!this.prefs.sound || !this.prefs.effects || !this.ctx || this.ctx.state === 'closed') return;
    if (this.ctx.state !== 'running') {
      if (document.hidden) return;
      this.wake();
    }
    const t = this.ctx.currentTime + 0.005;
    if (name !== 'hover') this.lastCue = performance.now();
    switch (name) {
      case 'hover': {
        const now = performance.now();
        if (now - this.lastHover < 45) return;
        this.lastHover = now;
        this.pip(t, hz(28 + (opts.step || 0)) * (1 + (Math.random() - 0.5) * 0.008), 0.05);
        break;
      }
      case 'select':
        // Rolled chord A4 E5 F#5 A5 E6.
        [[0, 0.32], [7, 0.62], [9, 0.38], [12, 0.38], [19, 0.36]].forEach(([s, g], i) => this.bell(t + i * 0.013, hz(s), g * 0.17));
        break;
      case 'confirm':
        // The single "pon": E5 with a faint chord around it.
        [[0, 0.42], [7, 1], [9, 0.18], [12, 0.15], [19, 0.2]].forEach(([s, g]) => this.bell(t, hz(s), g * 0.15));
        break;
      case 'back':
        this.bell(t, hz(7), 0.12);
        this.bell(t + 0.085, hz(0), 0.13);
        break;
      case 'menuOpen':
        this.pip(t, hz(31), 0.035);
        this.pip(t + 0.055, hz(36), 0.035);
        break;
      case 'menuClose':
        this.pip(t, hz(36), 0.03);
        this.pip(t + 0.055, hz(31), 0.03);
        break;
      case 'swishIn':
        this.swish(t, 1);
        break;
      case 'swishOut':
        this.swish(t, -1);
        break;
      case 'tod': {
        // Bell arpeggio: rising into day, settling for sunset, falling into night.
        const runs = { day: [12, 16, 19, 24], sunset: [7, 12, 16, 19], night: [24, 19, 16, 12] };
        (runs[opts.tod] || runs.day).forEach((s, i) => this.bell(t + i * 0.07, hz(s), 0.09));
        break;
      }
      default:
    }
  }

  pip(t, freq, gain) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const g2 = ctx.createGain();
    o.frequency.value = freq;
    o2.type = 'triangle';
    o2.frequency.value = freq * 2;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.002);
    g.gain.setTargetAtTime(0, t + 0.002, 0.03);
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(gain * 0.18, t + 0.001);
    g2.gain.setTargetAtTime(0, t + 0.001, 0.012);
    o.connect(g).connect(this.sfx);
    o2.connect(g2).connect(this.sfx);
    o.start(t);
    o2.start(t);
    o.stop(t + 0.3);
    o2.stop(t + 0.3);
  }

  bell(t, freq, gain) {
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = gain;
    out.connect(this.sfx);
    // Fundamental, a quieter octave and an inharmonic shimmer that dies first.
    for (const [ratio, level, attack, decay] of [
      [1, 1, 0.008, 0.12],
      [2, 0.22, 0.004, 0.07],
      [2.76, 0.12, 0.002, 0.035],
    ]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq * ratio;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level, t + attack);
      g.gain.setTargetAtTime(0, t + attack, decay);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + decay * 9 + 0.05);
    }
  }

  swish(t, dir) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.1;
    const lo = dir > 0 ? 1000 : 3800;
    const hi = dir > 0 ? 3800 : 1100;
    bp.frequency.setValueAtTime(lo, t);
    bp.frequency.exponentialRampToValueAtTime(hi, t + 0.45);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 6500;
    // Swell for ~0.3 s, then fall away: about 650 ms in all.
    const g = ctx.createGain();
    const peak = dir > 0 ? 0.2 : 0.13;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.3);
    g.gain.setTargetAtTime(0, t + 0.3, 0.15);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    let node = src.connect(bp).connect(lp).connect(g);
    if (pan) {
      pan.pan.setValueAtTime(-0.45 * dir, t);
      pan.pan.linearRampToValueAtTime(0.45 * dir, t + 0.65);
      node = node.connect(pan);
    }
    node.connect(this.sfx);
    src.start(t, Math.random() * 0.2);
    src.stop(t + 0.85);
  }
}

export const audio = new AudioEngine();

if (import.meta.env.DEV) window.__audio = audio;
