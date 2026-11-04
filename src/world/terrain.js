import * as THREE from 'three';
import { coastZ, forestDensity, noiseA, noiseC, terrainHeight } from './layout';
import { clamp, smoothstep } from './noise';

// Grid is regular in (u, v) but warped so it is dense around the play area and
// coarse out in the mountains.
const warpX = (u) => 700 * (0.2 * u + 0.8 * u * u * u);
const warpZ = (v) => (v < 0 ? 640 * (0.17 * v + 0.83 * v * v * v) : 230 * (0.45 * v + 0.55 * v * v * v));

const C = (hex) => new THREE.Color(hex);
const PAL = {
  grassA: C('#94b25a'),
  grassB: C('#7d9e45'),
  meadow: C('#a3b866'),
  forest: C('#5e7f35'),
  hillForest: C('#4d6e2f'),
  sand: C('#e8d9ad'),
  wetSand: C('#cdbb8c'),
  rock: C('#8c8577'),
  rockDark: C('#6f6a60'),
  alpine: C('#8f8e66'),
  snow: C('#f3f5f8'),
  bank: C('#8a9a55'),
};

export function buildTerrain({ segX = 420, segZ = 300 } = {}) {
  const nx = segX + 1;
  const nz = segZ + 1;
  const xs = new Float32Array(nx);
  const zs = new Float32Array(nz);
  for (let i = 0; i < nx; i++) xs[i] = warpX(-1 + (2 * i) / segX);
  for (let j = 0; j < nz; j++) zs[j] = warpZ(-1 + (2 * j) / segZ);

  // The shoreline depends on x alone: work it out once per column.
  const coast = new Float64Array(nx);
  for (let i = 0; i < nx; i++) coast[i] = coastZ(xs[i]);

  const heights = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) heights[j * nx + i] = terrainHeight(xs[i], zs[j], coast[i]);
  }

  const pos = new Float32Array(nx * nz * 3);
  const shore = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      pos[k * 3] = xs[i];
      pos[k * 3 + 1] = heights[k];
      pos[k * 3 + 2] = zs[j];
      const d = coast[i] - zs[j];
      shore[k] = 1 - smoothstep(5, 14, Math.abs(d));
    }
  }

  const index = new Uint32Array(segX * segZ * 6);
  let p = 0;
  for (let j = 0; j < segZ; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * nx + i;
      const b = a + 1;
      const c = a + nx;
      const d = c + 1;
      index[p++] = a; index[p++] = c; index[p++] = b;
      index[p++] = b; index[p++] = c; index[p++] = d;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aShore', new THREE.BufferAttribute(shore, 1));
  geo.setIndex(new THREE.BufferAttribute(index, 1));
  geo.computeVertexNormals();

  const normals = geo.attributes.normal.array;
  const colors = new Float32Array(nx * nz * 3);
  const col = new THREE.Color();
  const tmp = new THREE.Color();
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      const x = xs[i];
      const z = zs[j];
      const h = heights[k];
      const ny = normals[k * 3 + 1];
      const slope = 1 - ny;
      const d = coast[i] - z;

      const n1 = noiseA(x * 0.06, z * 0.06) * 0.5 + 0.5;
      col.copy(PAL.grassA).lerp(PAL.grassB, n1);
      col.lerp(PAL.meadow, smoothstep(0.55, 0.9, noiseC(x * 0.021, z * 0.021) * 0.5 + 0.5) * 0.6);
      const fd = forestDensity(x, z);
      col.lerp(PAL.forest, fd * 0.75);
      // Hills and mountains: dark forest on lower slopes, alpine, rock and snow above.
      col.lerp(PAL.hillForest, smoothstep(6, 18, h) * (1 - smoothstep(30, 50, h)) * 0.9);
      col.lerp(PAL.alpine, smoothstep(36, 56, h));
      col.lerp(tmp.copy(PAL.rock).lerp(PAL.rockDark, n1), clamp(smoothstep(0.14, 0.34, slope) * smoothstep(24, 46, h), 0, 1));
      const snowLine = 60 + 10 * noiseC(x * 0.02, z * 0.02);
      col.lerp(PAL.snow, smoothstep(snowLine, snowLine + 12, h) * (1 - smoothstep(0.45, 0.75, slope)));
      // Beaches and river banks.
      const beach = (1 - smoothstep(0.9, 1.9, h)) * (1 - smoothstep(9, 16, d));
      col.lerp(PAL.sand, clamp(beach, 0, 1));
      if (h < 1.0 && d > 16) col.lerp(PAL.bank, (1 - smoothstep(-0.2, 1.0, h)) * 0.7);
      if (h < 0.15) col.lerp(PAL.wetSand, 0.6);

      colors[k * 3] = col.r;
      colors[k * 3 + 1] = col.g;
      colors[k * 3 + 2] = col.b;
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Lambert: matte ground at a fraction of the cost of PBR shading over the whole screen.
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  const uniforms = {
    uTime: { value: 0 },
    uShallow: { value: new THREE.Color('#62d6c8') },
    uMid: { value: new THREE.Color('#1aa0b5') },
    uDeep: { value: new THREE.Color('#0d5f93') },
    uAbyss: { value: new THREE.Color('#0b3f72') },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aShore;\nvarying vec3 vWPos;\nvarying float vShore;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvShore = aShore;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vWPos;
varying float vShore;
uniform float uTime;
uniform vec3 uShallow, uMid, uDeep, uAbyss;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{
  float y = vWPos.y;
  // Fine ground variation so grass does not read as flat paint.
  float gn = vnoise(vWPos.xz * 0.9) * 0.6 + vnoise(vWPos.xz * 3.1) * 0.4;
  diffuseColor.rgb *= 0.9 + 0.2 * gn;
  if (y < 0.12) {
    float depth = max(-y, 0.0);
    vec3 under = mix(diffuseColor.rgb, uShallow, smoothstep(0.0, 0.9, depth));
    under = mix(under, uMid, smoothstep(0.7, 3.5, depth));
    under = mix(under, uDeep, smoothstep(3.0, 9.0, depth));
    under = mix(under, uAbyss, smoothstep(9.0, 15.0, depth));
    diffuseColor.rgb = mix(diffuseColor.rgb, under, smoothstep(0.12, -0.05, y));
    // Surf line along the sea shore.
    float wave = sin(uTime * 0.9 + vWPos.x * 0.15 + vnoise(vWPos.xz * 0.35) * 5.0) * 0.5 + 0.5;
    float band = smoothstep(-0.55, -0.25, y) * smoothstep(0.1, -0.05 - 0.12 * wave, y);
    float foam = band * vShore * (0.55 + 0.45 * vnoise(vWPos.xz * 1.7 + uTime * 0.3));
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.97, 0.98, 0.97), clamp(foam, 0.0, 0.85));
  }
}`,
      );
  };

  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';

  // Exact surface height (same triangle split as the index buffer).
  const findCell = (arr, v) => {
    let lo = 0;
    let hi = arr.length - 1;
    if (v <= arr[0]) return 0;
    if (v >= arr[hi]) return hi - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (arr[mid] <= v) lo = mid;
      else hi = mid;
    }
    return lo;
  };
  const heightAt = (x, z) => {
    const i = findCell(xs, x);
    const j = findCell(zs, z);
    const fx = clamp((x - xs[i]) / (xs[i + 1] - xs[i]), 0, 1);
    const fz = clamp((z - zs[j]) / (zs[j + 1] - zs[j]), 0, 1);
    const h00 = heights[j * nx + i];
    const h10 = heights[j * nx + i + 1];
    const h01 = heights[(j + 1) * nx + i];
    const h11 = heights[(j + 1) * nx + i + 1];
    if (fx + fz <= 1) return h00 + (h10 - h00) * fx + (h01 - h00) * fz;
    return h11 + (h01 - h11) * (1 - fx) + (h10 - h11) * (1 - fz);
  };
  const normalAt = (x, z) => {
    const e = 0.6;
    const hx = heightAt(x + e, z) - heightAt(x - e, z);
    const hz = heightAt(x, z + e) - heightAt(x, z - e);
    return new THREE.Vector3(-hx, 2 * e, -hz).normalize();
  };

  return { mesh, uniforms, heightAt, normalAt };
}
