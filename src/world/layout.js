import { createNoise2D, fbm, ridged, clamp, lerp, smoothstep } from './noise';

// World units are roughly 5 m. +x is east (screen right), +z is south (towards
// the camera), the sea is in the south and the mountains in the north.

export const noiseA = createNoise2D(7);
export const noiseB = createNoise2D(19);
export const noiseC = createNoise2D(43);

const g = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));

// z of the shoreline at a given x: land is z < coastZ(x).
export function coastZ(x) {
  return (
    38 +
    23 * g(x, -8, 24) + // middle peninsula
    19 * g(x, 60, 21) + // lighthouse headland
    -9 * g(x, -78, 26) + // seaplane bay
    -6 * g(x, 112, 18) + // marina bay
    10 * g(x, -150, 30) +
    3.5 * fbm(noiseC, x * 0.035, 3.1, 3)
  );
}

// River from the lake at the foot of the hills down to the sea.
export const RIVER = [
  [-78, -60], [-66, -46], [-63, -28], [-53, -13], [-35, -5], [-14, -3],
  [3, 5], [13, 15], [17, 27], [21, 39], [25, 52], [27, 64],
];
export const LAKE = { x: -80, z: -63, r: 11 };

export function catmull(points, samplesPerSeg = 12) {
  const out = [];
  const n = points.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    for (let s = 0; s < samplesPerSeg; s++) {
      const t = s / samplesPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a, b, c, d) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(points[n - 1].slice());
  return out;
}

export const riverLine = catmull(RIVER, 14);

// Bounding box of each segment of a polyline, computed once per line.
const segmentBoxes = new WeakMap();
function boxesOf(line) {
  let b = segmentBoxes.get(line);
  if (!b) {
    b = new Float64Array((line.length - 1) * 4);
    for (let i = 0; i < line.length - 1; i++) {
      const [ax, az] = line[i];
      const [bx, bz] = line[i + 1];
      b.set([Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz)], i * 4);
    }
    segmentBoxes.set(line, b);
  }
  return b;
}

// Distance from (x, z) to a polyline; also returns the 0..1 position along it.
// Segments further than maxD are skipped, so beyond maxD the distance may read Infinity.
export function polyDistance(line, x, z, maxD = Infinity) {
  const box = maxD < Infinity ? boxesOf(line) : null;
  let best = Infinity;
  let bestT = 0;
  for (let i = 0; i < line.length - 1; i++) {
    if (box) {
      const k = i * 4;
      if (x < box[k] - maxD || z < box[k + 1] - maxD || x > box[k + 2] + maxD || z > box[k + 3] + maxD) continue;
    }
    const [ax, az] = line[i];
    const [bx, bz] = line[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz;
    let t = ((x - ax) * dx + (z - az) * dz) / len2;
    t = clamp(t, 0, 1);
    const px = ax + dx * t - x;
    const pz = az + dz * t - z;
    const d2 = px * px + pz * pz;
    if (d2 < best) {
      best = d2;
      bestT = (i + t) / (line.length - 1);
    }
  }
  return { d: Math.sqrt(best), t: bestT };
}

export const riverWidth = (t) => lerp(1.9, 4.2, t);

// Places on the map. `r` is the flattened pad radius, `top` the pin height.
export const SITES = {
  about: { x: -14, z: 42, r: 11, top: 9 },
  cv: { x: -58, z: 17, r: 11, top: 8 },
  awards: { x: -28, z: -31, r: 23, top: 10 },
  volunteering: { x: 10, z: -45, r: 15, top: 13 },
  experience: { x: 36, z: -15, r: 15, top: 17 },
  skills: { x: 44, z: 15, r: 13, top: 12 },
  projects: { x: 80, z: -22, r: 15, top: 12 },
  contact: { x: 66, z: 52, r: 6, top: 20 },
  friends: { x: -40, z: 35, r: 6, top: 9 },
};

// Decorative houses: [x, z, rotation].
export const COTTAGES = [
  [98, 20, 0.3], [86, 27, 1.25], [-30, -12, 0.55], [-72, -16, 2.0], [-90, 2, 0.8],
  [58, -2, 0.4], [67, 4, 1.9], [24, 2, 2.6], [-2, -22, 0.2], [92, 2, 1.1], [-108, 18, 2.4],
];

// Paths between places, as control points.
export const PATHS = [
  [[-12, 30], [-14, 22], [-24, 15], [-40, 14], [-52, 13]],
  [[-28, 16], [-33, 22], [-38, 29]],
  [[-6, 30], [2, 24], [11, 21], [22, 18], [34, 16]],
  [[46, 6], [47, -2], [42, -8]],
  [[28, -22], [20, -32], [14, -36]],
  [[0, -44], [-10, -42], [-16, -38]],
  [[50, -16], [62, -20], [70, -22]],
  [[50, 22], [58, 30], [62, 38], [63, 42]],
  [[-44, 12], [-44, 2], [-40, -8], [-36, -20]],
  [[-60, 4], [-72, -6], [-90, -12], [-118, -10]],
  [[90, -26], [104, -34], [122, -44]],
  [[16, -52], [22, -70], [30, -88]],
];
export const pathLines = PATHS.map((p) => catmull(p, 10));

// Forest density 0..1, shared by the terrain colours and the tree scatter.
export function forestDensity(x, z) {
  const n = fbm(noiseB, x * 0.028 + 11, z * 0.028 - 4, 4);
  const north = smoothstep(10, -60, z) * 0.25;
  return clamp(smoothstep(-0.05, 0.32, n + north), 0, 1);
}

// coastZ depends on x alone, so callers sampling a grid can pass it in once per column.
function rawHeight(x, z, coast = coastZ(x)) {
  const d = coast - z;
  let h;
  if (d < 0) {
    const s = smoothstep(0, 46, -d);
    h = -0.5 * smoothstep(0, 3, -d) - 14.5 * Math.pow(s, 0.75) + 0.6 * noiseA(x * 0.05, z * 0.05) * s;
  } else {
    const beach = 1.25 * smoothstep(-1, 8, d);
    const plains = 1.3 + 1.9 * Math.max(0, fbm(noiseA, x * 0.017, z * 0.017, 3)) * smoothstep(6, 26, d);
    const hillsF = smoothstep(-50, -150, z);
    const hills = hillsF * (2 + 16 * (fbm(noiseB, x * 0.011 + 5, z * 0.011, 4) * 0.5 + 0.5));
    const mtnF = smoothstep(-185, -330, z);
    const range = 0.6 + 0.4 * fbm(noiseC, x * 0.003 + 2, z * 0.003, 2);
    const mtn = mtnF * (6 + 112 * ridged(noiseA, x * 0.0034 + 30, z * 0.0034, 4) * range);
    const sides = smoothstep(170, 300, Math.abs(x)) * smoothstep(10, -40, z) * 30 *
      (0.5 + 0.5 * fbm(noiseB, x * 0.02, z * 0.02, 3));
    h = lerp(beach, plains + hills + mtn + sides, smoothstep(2, 15, d));
  }
  return h;
}

const SITE_LIST = Object.values(SITES);
const RIVER_REACH = riverWidth(1) + 6; // widest channel plus its banks

export function terrainHeight(x, z, coast = coastZ(x)) {
  let h = rawHeight(x, z, coast);

  // Flat pads under the buildings.
  for (const s of SITE_LIST) {
    const dx = x - s.x;
    const dz = z - s.z;
    const reach = s.r + 9;
    if (dx * dx + dz * dz < reach * reach) {
      const dd = Math.hypot(dx, dz);
      if (s.padH === undefined) s.padH = Math.max(1.25, rawHeight(s.x, s.z));
      h = lerp(s.padH, h, smoothstep(s.r, reach, dd));
    }
  }

  // River channel and lake.
  if (x > -110 && x < 50 && z > -90 && z < 80) {
    const { d, t } = polyDistance(riverLine, x, z, RIVER_REACH);
    const w = riverWidth(t);
    if (d < w + 6) h = Math.min(h, lerp(-1.4, h, smoothstep(w * 0.55, w + 4.5, d)));
  }
  const ld = Math.hypot(x - LAKE.x, z - LAKE.z);
  if (ld < LAKE.r + 10) h = Math.min(h, lerp(-1.6, h, smoothstep(LAKE.r * 0.7, LAKE.r + 9, ld)));

  return h;
}
