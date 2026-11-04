import * as THREE from 'three';

// Lighting for each time of day. Colours are sRGB hex; vectors point at the sun.
export const PRESETS = {
  day: {
    skyTop: '#5f9bd6',
    skyHorizon: '#dbe7ee',
    fog: '#d3dfe7',
    fogDensity: 0.00185,
    sunDir: [0.52, 0.72, 0.46],
    sunColor: '#fff3df',
    sunIntensity: 2.9,
    hemiSky: '#d5e6ff',
    hemiGround: '#74804f',
    hemiIntensity: 1.15,
    exposure: 1.0,
    windows: 0,
    beam: 0,
    stars: 0,
    sunGlow: 0.6,
    waterTint: '#1f86ad',
    waterSky: '#cfe2ee',
    waterAlpha: 0.28,
    waterSpec: 1,
  },
  sunset: {
    skyTop: '#46659f',
    skyHorizon: '#f2b27a',
    fog: '#e3b48e',
    fogDensity: 0.0021,
    sunDir: [-0.8, 0.17, -0.42],
    sunColor: '#ffb06a',
    sunIntensity: 3.1,
    hemiSky: '#b4bfe2',
    hemiGround: '#6a5442',
    hemiIntensity: 1.0,
    exposure: 1.08,
    windows: 0.7,
    beam: 0.25,
    stars: 0,
    sunGlow: 1.2,
    waterTint: '#2a6f95',
    waterSky: '#f0b98c',
    waterAlpha: 0.32,
    waterSpec: 0.8,
  },
  night: {
    skyTop: '#050a18',
    skyHorizon: '#1b2945',
    fog: '#17243b',
    fogDensity: 0.0023,
    sunDir: [-0.35, 0.62, -0.55],
    sunColor: '#a7bdff',
    sunIntensity: 0.75,
    hemiSky: '#4a5f94',
    hemiGround: '#11141c',
    hemiIntensity: 0.6,
    exposure: 1.1,
    windows: 0.95,
    beam: 0.55,
    stars: 0.9,
    sunGlow: 0.15,
    waterTint: '#0c2a48',
    waterSky: '#22355a',
    waterAlpha: 0.36,
    waterSpec: 0.07,
  },
};

const COLOR_KEYS = ['skyTop', 'skyHorizon', 'fog', 'sunColor', 'hemiSky', 'hemiGround', 'waterTint', 'waterSky'];
const NUM_KEYS = ['fogDensity', 'sunIntensity', 'hemiIntensity', 'exposure', 'windows', 'beam', 'stars', 'sunGlow', 'waterAlpha', 'waterSpec'];

export function toState(p) {
  const s = {};
  for (const k of COLOR_KEYS) s[k] = new THREE.Color(p[k]);
  for (const k of NUM_KEYS) s[k] = p[k];
  s.sunDir = new THREE.Vector3(...p.sunDir).normalize();
  return s;
}

export function mixState(out, a, b, t) {
  for (const k of COLOR_KEYS) out[k].copy(a[k]).lerp(b[k], t);
  for (const k of NUM_KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  out.sunDir.copy(a.sunDir).lerp(b.sunDir, t).normalize();
  return out;
}

export function cloneState(s) {
  const o = {};
  for (const k of COLOR_KEYS) o[k] = s[k].clone();
  for (const k of NUM_KEYS) o[k] = s[k];
  o.sunDir = s.sunDir.clone();
  return o;
}
