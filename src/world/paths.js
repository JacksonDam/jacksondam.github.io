import * as THREE from 'three';
import { pathLines, polyDistance, riverLine, riverWidth } from './layout';

// Light gravel paths draped over the ground, with small arched bridges where
// they cross the river. Paths stop at the edge of each place's footprint.
export function buildPaths(heightAt, sites = {}) {
  const boxes = Object.values(sites).map((s) => s.box).filter(Boolean);
  const onSite = (x, z) => boxes.some((b) => x > b.min.x + 0.4 && x < b.max.x - 0.4 && z > b.min.z + 0.4 && z < b.max.z - 0.4);
  const positions = [];
  const indices = [];
  const bridges = [];
  const width = 1.35;
  let base = 0;

  for (const raw of pathLines) {
    // Resample at even spacing.
    const pts = [];
    for (let i = 0; i < raw.length - 1; i++) {
      const [ax, az] = raw[i];
      const [bx, bz] = raw[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const n = Math.max(1, Math.ceil(len / 0.6));
      for (let s = 0; s < n; s++) pts.push([ax + ((bx - ax) * s) / n, az + ((bz - az) * s) / n]);
    }
    pts.push(raw[raw.length - 1]);

    let crossing = null;
    let prevWater = false;
    for (let i = 0; i < pts.length; i++) {
      const [x, z] = pts[i];
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(pts.length - 1, i + 1)];
      let tx = next[0] - prev[0];
      let tz = next[1] - prev[1];
      const tl = Math.hypot(tx, tz) || 1;
      tx /= tl;
      tz /= tl;
      const nx = -tz;
      const nz = tx;

      const rv = polyDistance(riverLine, x, z);
      const overWater = rv.d < riverWidth(rv.t) + 1.2;
      if (overWater && !crossing) crossing = { start: i, t: rv.t };
      if (!overWater && crossing) {
        bridges.push({ a: pts[Math.max(0, crossing.start - 2)], b: pts[Math.min(pts.length - 1, i + 1)] });
        crossing = null;
      }

      for (const side of [-1, 1]) {
        const px = x + nx * side * width * 0.5;
        const pz = z + nz * side * width * 0.5;
        const y = Math.max(heightAt(px, pz), heightAt(x, z)) + 0.06;
        positions.push(px, y, pz);
      }
      const hidden = overWater || onSite(x, z);
      if (i > 0 && !hidden && !prevWater) {
        const a = base + (i - 1) * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      prevWater = hidden;
    }
    base += pts.length * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  // Normals of a draped strip are close to up; force up to avoid seams.
  const nrm = geo.attributes.normal;
  for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);

  const mat = new THREE.MeshStandardMaterial({
    color: '#ddd3b6',
    roughness: 1,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;

  const group = new THREE.Group();
  group.add(mesh);

  const deckMat = new THREE.MeshStandardMaterial({ color: '#d8d4cc', roughness: 0.8 });
  const archMat = new THREE.MeshStandardMaterial({ color: '#f2f2f0', roughness: 0.6 });
  for (const { a, b } of bridges) {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const len = Math.hypot(dx, dz);
    const cx = (a[0] + b[0]) / 2;
    const cz = (a[1] + b[1]) / 2;
    const yA = heightAt(a[0], a[1]);
    const yB = heightAt(b[0], b[1]);
    const bridge = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(len + 1, 0.25, 1.7), deckMat);
    deck.position.y = Math.max(yA, yB) + 0.25;
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridge.add(deck);
    // Two white arches, like a tied-arch footbridge.
    for (const side of [-0.85, 0.85]) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-len / 2, deck.position.y, side),
        new THREE.Vector3(0, deck.position.y + len * 0.55, side),
        new THREE.Vector3(len / 2, deck.position.y, side),
      );
      const arch = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.13, 5), archMat);
      arch.castShadow = true;
      bridge.add(arch);
    }
    bridge.position.set(cx, 0, cz);
    bridge.rotation.y = -Math.atan2(dz, dx);
    group.add(bridge);
  }

  return { group };
}
