import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { coastZ, COTTAGES, forestDensity, LAKE, noiseC, pathLines, polyDistance, riverLine, riverWidth, SITES } from './layout';
import { mulberry32, smoothstep } from './noise';

// Parts keep their index buffers: ~10k instanced trees shade each shared vertex once, not per face.
function painted(geo, hex) {
  const g = geo;
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  for (const key of Object.keys(g.attributes)) {
    if (!['position', 'normal', 'color'].includes(key)) g.deleteAttribute(key);
  }
  return g;
}

function coniferGeometry() {
  // Trunks have no end caps: the top is inside the foliage and the base is under the ground.
  const parts = [painted(new THREE.CylinderGeometry(0.1, 0.16, 1.0, 5, 1, true).translate(0, 0.5, 0), '#5a4330')];
  const tiers = [
    [1.15, 1.9, 0.75],
    [0.82, 1.6, 1.8],
    [0.46, 1.3, 2.75],
  ];
  for (const [r, h, y] of tiers) {
    parts.push(painted(new THREE.ConeGeometry(r, h, 7, 1, true).translate(0, y + h / 2 - 0.2, 0), '#ffffff'));
  }
  return mergeGeometries(parts);
}

// Sphere-like normals so a 20-face blob still shades softly.
function rounded(geo, cx, cy, cz) {
  const p = geo.attributes.position;
  const n = geo.attributes.normal;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i) - cx, (p.getY(i) - cy) * 1.2, p.getZ(i) - cz).normalize();
    n.setXYZ(i, v.x, v.y, v.z);
  }
  return geo;
}

function broadleafGeometry() {
  const trunk = painted(new THREE.CylinderGeometry(0.1, 0.17, 1.3, 5, 1, true).translate(0, 0.65, 0), '#5d4632');
  // Icosahedra come unindexed; once the normals are rounded, corners that share a position match.
  const a = mergeVertices(rounded(painted(new THREE.IcosahedronGeometry(1.15, 0).scale(1, 0.9, 1).translate(0, 2.0, 0), '#ffffff'), 0, 2.0, 0));
  const b = mergeVertices(rounded(painted(new THREE.IcosahedronGeometry(0.8, 0).translate(0.55, 2.5, 0.2), '#ffffff'), 0.55, 2.5, 0.2));
  const c = mergeVertices(rounded(painted(new THREE.IcosahedronGeometry(0.75, 0).translate(-0.5, 2.35, -0.3), '#ffffff'), -0.5, 2.35, -0.3));
  return mergeGeometries([trunk, a, b, c]);
}

function palmGeometry() {
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.08, 0.13, 3.2, 5).translate(0, 1.6, 0);
  trunk.rotateZ(0.12);
  parts.push(painted(trunk, '#8a6d4b'));
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.ConeGeometry(0.28, 1.9, 3, 1);
    leaf.rotateZ(Math.PI / 2 + 0.5);
    leaf.translate(0.9, 3.0, 0);
    leaf.rotateY((i / 7) * Math.PI * 2);
    leaf.translate(-0.19, 0, 0);
    parts.push(painted(leaf, '#ffffff'));
  }
  return mergeGeometries(parts);
}

export function buildVegetation(heightAt, normalAt, { density = 1 } = {}) {
  const rand = mulberry32(1234);
  const conifers = [];
  const broadleaves = [];
  const palms = [];

  const nearPath = (x, z, r) => {
    for (const line of pathLines) {
      const [ax, az] = line[0];
      const [bx, bz] = line[line.length - 1];
      if (x < Math.min(ax, bx) - 40 || x > Math.max(ax, bx) + 40) continue;
      if (z < Math.min(az, bz) - 40 || z > Math.max(az, bz) + 40) continue;
      if (polyDistance(line, x, z, r).d < r) return true;
    }
    return false;
  };
  const nearSite = (x, z) => {
    for (const key in SITES) {
      const s = SITES[key];
      if ((x - s.x) ** 2 + (z - s.z) ** 2 < (s.r + 2) ** 2) return true;
    }
    for (const [cx, cz] of COTTAGES) if ((x - cx) ** 2 + (z - cz) ** 2 < 16) return true;
    return false;
  };

  const step = 2.05 / Math.sqrt(density);
  for (let z = -175; z < 75; z += step) {
    for (let x = -230; x < 230; x += step) {
      const px = x + (rand() - 0.5) * step * 0.95;
      const pz = z + (rand() - 0.5) * step * 0.95;
      const r = rand();
      const h = heightAt(px, pz);
      if (h < 0.85) continue;
      const n = normalAt(px, pz);
      if (n.y < 0.8) continue;
      const fd = forestDensity(px, pz);
      const hillBoost = smoothstep(4, 14, h) * (1 - smoothstep(55, 70, h));
      const distFar = smoothstep(-90, -150, pz);
      let p = 0.04 + fd * 0.85 + hillBoost * 0.55;
      p *= 1 - distFar * 0.55;
      if (r > p) continue;
      if (h > 66) continue;
      const coast = coastZ(px) - pz;
      if (nearSite(px, pz)) continue;
      if (px > -110 && px < 50 && pz > -90 && pz < 80) {
        const rv = polyDistance(riverLine, px, pz, riverWidth(1) + 1.8);
        if (rv.d < riverWidth(rv.t) + 1.8) continue;
      }
      if (Math.hypot(px - LAKE.x, pz - LAKE.z) < LAKE.r + 2) continue;
      if (nearPath(px, pz, 1.9)) continue;

      const s = 0.75 + rand() * 0.6 + hillBoost * 0.25;
      const item = { x: px, y: h - 0.15, z: pz, s, rot: rand() * Math.PI * 2, tint: rand() };
      if (coast < 15 && pz > 10 && rand() < 0.75) palms.push(item);
      else if (pz < -25 || h > 8 || noiseC(px * 0.04, pz * 0.04) > -0.1) conifers.push(item);
      else broadleaves.push(item);
    }
  }

  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  const group = new THREE.Group();
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();

  const make = (geo, items, palette, stretch = [1, 1]) => {
    if (!items.length) return;
    const mesh = new THREE.InstancedMesh(geo, material, items.length);
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y, it.z);
      dummy.rotation.set(0, it.rot, 0);
      const vy = stretch[0] + (stretch[1] - stretch[0]) * it.tint;
      dummy.scale.set(it.s, it.s * vy, it.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      col.set(palette[0]).lerp(col.clone().set(palette[1]), it.tint);
      mesh.setColorAt(i, col);
    });
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    mesh.renderOrder = 1;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  };

  make(coniferGeometry(), conifers, ['#2f5a2a', '#4a7333'], [0.9, 1.35]);
  make(broadleafGeometry(), broadleaves, ['#5f8a32', '#86a63f'], [0.85, 1.15]);
  make(palmGeometry(), palms, ['#4f8a33', '#6e9b38'], [0.9, 1.2]);

  return { group, count: conifers.length + broadleaves.length + palms.length };
}
