import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { COTTAGES, SITES } from './layout';
import { mulberry32 } from './noise';
import { tiledBox } from './textures';

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra });

// Moving things: kept as their own meshes and kept out of the (static) shadow map.
function dynamic(m) {
  m.userData.dynamic = true;
  m.castShadow = false;
  return m;
}

function place(parent, geo, mat, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// Gable roof with the ridge along x. Group 0 = slopes, group 1 = gable ends.
function gableRoof(w, d, rise, overhang = 0.35) {
  const W = w / 2 + overhang;
  const D = d / 2 + overhang;
  const g = w / 2;
  const r = rise;
  const p = [
    -W, 0, D, W, 0, D, W, r, 0, -W, 0, D, W, r, 0, -W, r, 0,
    W, 0, -D, -W, 0, -D, -W, r, 0, W, 0, -D, -W, r, 0, W, r, 0,
    -g, 0, -d / 2, -g, 0, d / 2, -g, r * (1 - overhang / D), 0,
    g, 0, d / 2, g, 0, -d / 2, g, r * (1 - overhang / D), 0,
  ];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  geo.addGroup(0, 12, 0);
  geo.addGroup(12, 6, 1);
  geo.computeVertexNormals();
  return geo;
}

function hipRoof(w, d, h) {
  const geo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1, true).toNonIndexed();
  geo.rotateY(Math.PI / 4);
  geo.scale(w, h, d);
  geo.translate(0, h / 2, 0);
  geo.computeVertexNormals();
  return geo;
}

function painted(geo, hex) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(hex);
  const arr = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] = c.r;
    arr[i + 1] = c.g;
    arr[i + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  for (const key of Object.keys(g.attributes)) {
    if (!['position', 'normal', 'color'].includes(key)) g.deleteAttribute(key);
  }
  return g;
}

function carGeometry() {
  return mergeGeometries([
    painted(new THREE.BoxGeometry(1.15, 0.3, 0.52).translate(0, 0.24, 0), '#ffffff'),
    painted(new THREE.BoxGeometry(0.6, 0.24, 0.46).translate(-0.06, 0.5, 0), '#b8c2cc'),
    painted(new THREE.CylinderGeometry(0.12, 0.12, 0.56, 6).rotateX(Math.PI / 2).translate(0.36, 0.12, 0), '#222222'),
    painted(new THREE.CylinderGeometry(0.12, 0.12, 0.56, 6).rotateX(Math.PI / 2).translate(-0.36, 0.12, 0), '#222222'),
  ]);
}

function yachtGeometry() {
  const hull = new THREE.Shape();
  hull.moveTo(-1.6, -0.5);
  hull.lineTo(0.9, -0.5);
  hull.quadraticCurveTo(1.8, -0.35, 2.1, 0);
  hull.quadraticCurveTo(1.8, 0.35, 0.9, 0.5);
  hull.lineTo(-1.6, 0.5);
  hull.lineTo(-1.6, -0.5);
  const h = new THREE.ExtrudeGeometry(hull, { depth: 0.42, bevelEnabled: false });
  h.rotateX(-Math.PI / 2);
  return mergeGeometries([
    painted(h, '#ffffff'),
    painted(new THREE.BoxGeometry(1.5, 0.32, 0.72).translate(-0.3, 0.58, 0), '#f4f4f4'),
    painted(new THREE.BoxGeometry(1.1, 0.12, 0.74).translate(-0.2, 0.62, 0), '#2a3540'),
    painted(new THREE.BoxGeometry(0.7, 0.25, 0.56).translate(-0.35, 0.86, 0), '#f4f4f4'),
  ]);
}

function sailboatGeometry() {
  const sail = new THREE.BufferGeometry();
  sail.setAttribute('position', new THREE.Float32BufferAttribute([0.1, 0.5, 0, -1.1, 0.5, 0, 0.1, 3.2, 0], 3));
  sail.computeVertexNormals();
  const sail2 = sail.clone().rotateY(Math.PI);
  return mergeGeometries([
    painted(new THREE.BoxGeometry(1.8, 0.35, 0.6).translate(0, 0.17, 0), '#ffffff'),
    painted(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 4).translate(0.1, 1.9, 0), '#dddddd'),
    painted(sail, '#fbfbf8'),
    painted(sail2, '#fbfbf8'),
  ]);
}

function seaplaneGeometry() {
  return mergeGeometries([
    painted(new THREE.BoxGeometry(2.4, 0.42, 0.42).translate(0, 1.05, 0), '#ffffff'),
    painted(new THREE.BoxGeometry(0.35, 0.05, 3.6).translate(0.25, 1.32, 0), '#ffffff'),
    painted(new THREE.BoxGeometry(0.3, 0.6, 0.05).translate(-1.1, 1.45, 0), '#d23b3b'),
    painted(new THREE.BoxGeometry(0.3, 0.05, 1.2).translate(-1.1, 1.2, 0), '#ffffff'),
    painted(new THREE.BoxGeometry(2.1, 0.18, 0.2).translate(0.1, 0.25, 0.55), '#e8e8e8'),
    painted(new THREE.BoxGeometry(2.1, 0.18, 0.2).translate(0.1, 0.25, -0.55), '#e8e8e8'),
    painted(new THREE.BoxGeometry(0.05, 0.7, 0.05).translate(0.3, 0.65, 0.5), '#cccccc'),
    painted(new THREE.BoxGeometry(0.05, 0.7, 0.05).translate(0.3, 0.65, -0.5), '#cccccc'),
    painted(new THREE.BoxGeometry(0.25, 0.3, 0.3).translate(1.25, 1.05, 0), '#d23b3b'),
  ]);
}

export function buildStructures(heightAt, T) {
  const root = new THREE.Group();
  const nightMats = [];
  const animators = [];
  const sites = {};
  const rand = mulberry32(99);

  const facade = (tex, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({
      map: tex.map,
      emissiveMap: tex.emissiveMap || null,
      emissive: tex.emissiveMap ? '#ffffff' : '#000000',
      emissiveIntensity: 0,
      roughness: 0.75,
      ...extra,
    });
    if (tex.emissiveMap) nightMats.push(m);
    return m;
  };

  const M = {
    roofDark: std('#33373c', { roughness: 0.7 }),
    roofSlate: std('#4b5058'),
    roofRed: std('#b4542f'),
    roofTerracotta: std('#bf6a3f'),
    roofBlue: std('#2e66b8'),
    white: std('#f4f4f2'),
    cream: std('#ece0c8'),
    concrete: std('#c9c6bf', { roughness: 0.95 }),
    paving: std('#d9d4c7', { roughness: 0.95 }),
    asphalt: std('#55585c', { roughness: 0.9 }),
    wood: std('#a3825c'),
    deck: std('#8f6d4b'),
    grass: std('#88ab4f', { roughness: 1 }),
    glassRoof: std('#a9cadb', { roughness: 0.15, metalness: 0.3 }),
    metal: std('#9aa3ab', { metalness: 0.5, roughness: 0.4 }),
    red: std('#d33a2f'),
    orange: std('#f07a1a'),
    seat: std('#2f63c9'),
    lamp: new THREE.MeshStandardMaterial({ color: '#fff4c8', emissive: '#fff1b0', emissiveIntensity: 0.2 }),
  };
  nightMats.push(M.lamp);

  const glass = facade(T.glass, { roughness: 0.25, metalness: 0.2 });
  const office = facade(T.office);
  const timber = facade(T.timber);
  const charcoal = facade(T.charcoal);
  const cafeFront = facade(T.cafe);
  const cream = facade(T.cream);
  const cottage = facade(T.cottage);
  const school = facade(T.school);
  const doors = facade(T.doors);

  const newSite = (key) => {
    const s = SITES[key];
    const g = new THREE.Group();
    g.position.set(s.x, heightAt(s.x, s.z), s.z);
    root.add(g);
    sites[key] = { group: g };
    return g;
  };
  const slab = (g, w, d, mat, x = 0, z = 0) => {
    const m = place(g, new THREE.BoxGeometry(w, 0.6, d), mat, x, -0.24, z);
    m.castShadow = false;
    return m;
  };

  // About: the café. Dark timber cabin with a terrace.
  {
    const g = newSite('about');
    slab(g, 15, 12, M.paving, 0, 0.5);
    const body = place(g, tiledBox(9, 3.4, 5.6, 4.5, 3.4), [charcoal, charcoal, M.roofDark, M.roofDark, cafeFront, charcoal], 0, 1.7, -1);
    body.name = 'cafe';
    const roof = place(g, gableRoof(9, 5.6, 2.6, 0.5), [M.roofDark, charcoal], 0, 3.4, -1);
    roof.name = 'roof';
    place(g, new THREE.BoxGeometry(0.7, 1.6, 0.7), M.roofSlate, 2.6, 5.4, -1.8);
    place(g, new THREE.BoxGeometry(8, 0.25, 3.6), M.deck, 0, 0.25, 3.8);
    for (const [x, c] of [[-2.6, '#ffffff'], [0, '#c23b30'], [2.6, '#ffffff']]) {
      place(g, new THREE.CylinderGeometry(0.05, 0.05, 2.1, 5), M.metal, x, 1.3, 3.8);
      place(g, new THREE.ConeGeometry(1.35, 0.55, 8), std(c), x, 2.45, 3.8);
      place(g, new THREE.CylinderGeometry(0.5, 0.5, 0.08, 10), M.white, x, 1.05, 3.8);
    }
  }

  // CV: the licence centre with a skid pad and cones.
  {
    const g = newSite('cv');
    slab(g, 20, 17, M.concrete, 0, 0);
    place(g, tiledBox(10, 3.6, 5.5, 5, 3.6), [school, school, M.white, M.white, school, school], -3.5, 1.8, -4.2);
    place(g, new THREE.BoxGeometry(10.6, 0.35, 6.1), M.white, -3.5, 3.75, -4.2);
    const pad = place(g, new THREE.CylinderGeometry(5.2, 5.2, 0.12, 40), M.asphalt, 3.6, 0.1, 2.6);
    pad.castShadow = false;
    const ring = place(g, new THREE.RingGeometry(3.7, 3.9, 48).rotateX(-Math.PI / 2), M.white, 3.6, 0.17, 2.6);
    ring.castShadow = false;
    const cone = new THREE.ConeGeometry(0.22, 0.6, 8);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      place(g, cone, M.orange, 3.6 + Math.cos(a) * 3.8, 0.45, 2.6 + Math.sin(a) * 3.8);
    }
    // Big cone sculpture by the door, the centre's sign.
    place(g, new THREE.ConeGeometry(0.75, 2.2, 16), M.orange, -8.9, 1.25, 0.2);
    place(g, new THREE.CylinderGeometry(0.62, 0.66, 0.3, 16), M.white, -8.9, 1.05, 0.2);
    place(g, new THREE.BoxGeometry(1.8, 0.2, 1.8), M.roofDark, -8.9, 0.1, 0.2);
  }

  // Awards: the circuit, with a grandstand, pits and cars lapping.
  {
    const g = newSite('awards');
    const S = 10;
    const R = 8;
    const W = 3.2;
    const N = 160;
    const center = [];
    const per = 2 * S * 2 + 2 * Math.PI * R;
    for (let i = 0; i < N; i++) {
      let d = (i / N) * per;
      let x;
      let z;
      if (d < 2 * S) {
        x = -S + d;
        z = R;
      } else if ((d -= 2 * S) < Math.PI * R) {
        const a = d / R;
        x = S + Math.sin(a) * R;
        z = Math.cos(a) * R;
      } else if ((d -= Math.PI * R) < 2 * S) {
        x = S - d;
        z = -R;
      } else {
        d -= 2 * S;
        const a = d / R;
        x = -S - Math.sin(a) * R;
        z = -Math.cos(a) * R;
      }
      center.push(new THREE.Vector2(x, z));
    }
    const ribbon = (inner, outer, y, mat, uvScale) => {
      const pos = [];
      const uv = [];
      const idx = [];
      let run = 0;
      for (let i = 0; i <= N; i++) {
        const c = center[i % N];
        const nxt = center[(i + 1) % N];
        const prv = center[(i - 1 + N) % N];
        const t = new THREE.Vector2().subVectors(nxt, prv).normalize();
        const n = new THREE.Vector2(t.y, -t.x);
        if (i > 0) run += c.distanceTo(center[(i - 1) % N]);
        pos.push(c.x + n.x * inner, y, c.y + n.y * inner, c.x + n.x * outer, y, c.y + n.y * outer);
        uv.push(run / uvScale, 0, run / uvScale, 1);
        if (i < N) {
          const a = i * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      const nrm = geo.attributes.normal;
      const flip = nrm.getY(0) < 0;
      if (flip) {
        for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
        geo.setIndex(idx);
        geo.computeVertexNormals();
      }
      const m = place(g, geo, mat);
      m.castShadow = false;
      return m;
    };
    const kerbMat = new THREE.MeshStandardMaterial({ map: T.kerb.map, roughness: 0.8 });
    slab(g, 2 * (S + R) + 10, 2 * R + 12, M.grass);
    ribbon(-W / 2, W / 2, 0.12, M.asphalt, 1);
    ribbon(W / 2, W / 2 + 0.45, 0.14, kerbMat, 2.4);
    ribbon(-W / 2 - 0.45, -W / 2, 0.14, kerbMat, 2.4);
    ribbon(W / 2 + 0.45, W / 2 + 1.6, 0.11, M.concrete, 1);
    // Grandstand on the far straight.
    const stand = new THREE.Group();
    for (let i = 0; i < 4; i++) place(stand, new THREE.BoxGeometry(16, 0.55, 1.1), i % 2 ? M.seat : M.white, 0, 0.3 + i * 0.55, -i * 1.0);
    place(stand, new THREE.BoxGeometry(16, 2.6, 0.4), M.white, 0, 1.3, -3.9);
    place(stand, new THREE.BoxGeometry(17, 0.18, 4.8), M.white, 0, 3.6, -2.0);
    for (const x of [-7.6, 0, 7.6]) place(stand, new THREE.BoxGeometry(0.2, 3.6, 0.2), M.metal, x, 1.8, -4.0);
    stand.position.set(0, 0, -R - W / 2 - 2.0);
    g.add(stand);
    // Pit building on the near straight.
    place(g, tiledBox(14, 1.8, 3, 3, 1.8), [M.white, M.white, M.white, M.white, doors, M.white], 0, 0.9, R + W / 2 + 3.2);
    place(g, new THREE.BoxGeometry(14.6, 0.2, 3.6), M.roofDark, 0, 1.9, R + W / 2 + 3.2);
    // Start gantry.
    place(g, new THREE.BoxGeometry(0.2, 2.6, 0.2), M.metal, 2, 1.3, R - W / 2 - 0.4);
    place(g, new THREE.BoxGeometry(0.2, 2.6, 0.2), M.metal, 2, 1.3, R + W / 2 + 0.4);
    place(g, new THREE.BoxGeometry(0.4, 0.5, W + 1), M.red, 2, 2.6, R);
    const checker = place(g, new THREE.PlaneGeometry(0.6, W).rotateX(-Math.PI / 2), std('#f2f2f2'), 2, 0.13, R);
    checker.castShadow = false;

    // Cars lapping.
    const carGeo = carGeometry();
    const carColors = ['#d7262e', '#f5f5f5', '#1f5fd1', '#f2b705', '#1d1d1f', '#18a05a'];
    const cars = carColors.map((c, i) => {
      const m = dynamic(place(g, carGeo, new THREE.MeshStandardMaterial({ vertexColors: true, color: c, roughness: 0.4, metalness: 0.3 })));
      return { m, s: i / carColors.length, v: 0.055 + i * 0.0035, lane: (i % 2 ? 0.6 : -0.6) };
    });
    const tmp = new THREE.Vector2();
    animators.push((t, dt) => {
      for (const car of cars) {
        car.s = (car.s + dt * car.v) % 1;
        const f = car.s * N;
        const i0 = Math.floor(f) % N;
        const i1 = (i0 + 1) % N;
        tmp.lerpVectors(center[i0], center[i1], f - Math.floor(f));
        const dir = new THREE.Vector2().subVectors(center[i1], center[i0]).normalize();
        car.m.position.set(tmp.x + dir.y * car.lane, 0.12, tmp.y - dir.x * car.lane);
        car.m.rotation.y = -Math.atan2(dir.y, dir.x);
      }
    });
  }

  // Volunteering: a neoclassical hall with a portico.
  {
    const g = newSite('volunteering');
    slab(g, 26, 22, M.paving, 0, 1);
    place(g, tiledBox(12, 5, 8, 3, 5), [cream, cream, M.cream, M.cream, cream, cream], 0, 2.5, -2);
    place(g, hipRoof(12.8, 8.8, 2.8), M.roofTerracotta, 0, 5, -2);
    for (const side of [-1, 1]) {
      place(g, tiledBox(7, 3.8, 6.5, 3, 3.8), [cream, cream, M.cream, M.cream, cream, cream], side * 9.5, 1.9, -1.2);
      place(g, hipRoof(7.6, 7.1, 2), M.roofTerracotta, side * 9.5, 3.8, -1.2);
    }
    // Portico.
    for (let i = 0; i < 6; i++) place(g, new THREE.CylinderGeometry(0.32, 0.36, 4.4, 10), M.white, -4.5 + i * 1.8, 2.5, 3.2);
    place(g, new THREE.BoxGeometry(11.4, 0.5, 3), M.white, 0, 4.95, 2.6);
    const ped = place(g, gableRoof(11.4, 3, 1.4, 0.15), [M.roofTerracotta, M.white], 0, 5.2, 2.6);
    ped.rotation.y = 0;
    for (let i = 0; i < 3; i++) place(g, new THREE.BoxGeometry(12 - i * 0.3, 0.2, 1.4 - i * 0.3), M.white, 0, 0.1 + i * 0.2, 5.0 - i * 0.25);
    // Fountain.
    place(g, new THREE.CylinderGeometry(1.6, 1.7, 0.4, 24), M.white, 0, 0.2, 8.2);
    place(g, new THREE.CylinderGeometry(1.35, 1.35, 0.1, 24), std('#5fb8cf', { roughness: 0.2 }), 0, 0.38, 8.2);
  }

  // Experience: offices with a glass tower and a car park.
  {
    const g = newSite('experience');
    slab(g, 28, 24, M.concrete, 0, 0);
    place(g, tiledBox(8, 13, 8, 3.2, 1.6), [glass, glass, M.white, M.white, glass, glass], -4.5, 6.5, -3.5);
    place(g, new THREE.BoxGeometry(8.4, 0.4, 8.4), M.white, -4.5, 13.1, -3.5);
    place(g, new THREE.BoxGeometry(3, 1.2, 2.4), M.metal, -5.5, 13.8, -4.5);
    place(g, tiledBox(14, 4.4, 9, 3.5, 1.5), [office, office, M.white, M.white, office, office], 4, 2.2, -3.5);
    place(g, new THREE.BoxGeometry(14.4, 0.35, 9.4), M.white, 4, 4.5, -3.5);
    // Car park in front.
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(22, 8).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: T.parking.map, roughness: 0.9 }));
    T.parking.map.repeat.set(2, 1);
    lot.position.set(0, 0.08, 6.8);
    lot.receiveShadow = true;
    g.add(lot);
    const carGeo = carGeometry();
    const parked = new THREE.InstancedMesh(carGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.3 }), 26);
    const palette = ['#f2f2f2', '#1c1c1e', '#9aa1a8', '#c92b2b', '#2457b8', '#f2f2f2', '#55595e'];
    const dmy = new THREE.Object3D();
    let n = 0;
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 18 && n < 26; i++) {
        if (rand() < 0.28) continue;
        dmy.position.set(-10.2 + i * 1.17 + 0.5, 0.08, 4.2 + row * 5.2);
        dmy.rotation.set(0, Math.PI / 2, 0);
        dmy.updateMatrix();
        parked.setMatrixAt(n, dmy.matrix);
        parked.setColorAt(n, new THREE.Color(palette[Math.floor(rand() * palette.length)]));
        n++;
      }
    }
    parked.count = n;
    parked.castShadow = true;
    g.add(parked);
  }

  // Skills: the workshop, a big timber shed with garage doors.
  {
    const g = newSite('skills');
    slab(g, 24, 20, M.concrete, 0, 1);
    place(g, tiledBox(15, 5.2, 9, 3, 5.2), [timber, timber, M.roofDark, M.roofDark, timber, timber], 0, 2.6, -2.5);
    place(g, gableRoof(15, 9, 2.7, 0.5), [M.roofDark, timber], 0, 5.2, -2.5);
    for (const x of [-4.6, 0, 4.6]) place(g, tiledBox(3.4, 3.4, 0.2, 3.4, 3.4), doors, x, 1.7, 2.05);
    place(g, tiledBox(6, 3.2, 6, 3, 3.2), [timber, timber, M.roofDark, M.roofDark, timber, timber], 10.2, 1.6, -1.5);
    place(g, gableRoof(6, 6, 1.6, 0.3), [M.roofSlate, timber], 10.2, 3.2, -1.5);
    // Skylights.
    for (const x of [-4.5, 0, 4.5]) {
      const sk = place(g, new THREE.BoxGeometry(2, 0.1, 1.6), M.glassRoof, x, 6.4, -0.2);
      sk.rotation.x = 0.5;
    }
  }

  // Projects: the glass showcase hall.
  {
    const g = newSite('projects');
    slab(g, 28, 22, M.paving, 0, 1);
    place(g, tiledBox(18, 4.2, 9, 3.2, 4.2), [glass, glass, M.white, M.white, glass, glass], -2.5, 2.1, -2);
    const vault = place(g, new THREE.CylinderGeometry(4.6, 4.6, 18, 28, 1, true, 0, Math.PI), M.glassRoof, -2.5, 4.2, -2);
    vault.rotation.z = Math.PI / 2;
    vault.scale.set(0.55, 1, 1);
    vault.rotation.y = 0;
    for (let i = 0; i <= 6; i++) {
      const rib = place(g, new THREE.TorusGeometry(4.6, 0.09, 4, 20, Math.PI), M.white, -11.5 + i * 3, 4.2, -2);
      rib.rotation.y = Math.PI / 2;
      rib.scale.set(1, 0.55, 1);
    }
    place(g, tiledBox(7, 6.4, 9.4, 3.5, 6.4), [M.white, M.white, M.white, M.white, M.white, M.white], 9.6, 3.2, -2);
    place(g, new THREE.BoxGeometry(5.5, 1.3, 0.1), std('#1d1d1f'), 9.6, 4.6, 2.76);
    // Display plinths with cars in front.
    const carGeo = carGeometry();
    ['#e0412b', '#f5f5f5', '#2f5ed6'].forEach((c, i) => {
      const x = -8 + i * 5.5;
      place(g, new THREE.CylinderGeometry(1.3, 1.3, 0.25, 24), M.white, x, 0.12, 5.2);
      const car = dynamic(place(g, carGeo, new THREE.MeshStandardMaterial({ vertexColors: true, color: c, roughness: 0.35, metalness: 0.4 }), x, 0.25, 5.2));
      car.rotation.y = 0.6 - i * 0.3;
      animators.push((t) => {
        car.rotation.y = 0.6 - i * 0.3 + t * 0.25;
      });
    });
  }

  // Contact: the lighthouse on the headland.
  {
    const g = newSite('contact');
    slab(g, 9, 9, M.paving);
    const bandsMat = new THREE.MeshStandardMaterial({ map: T.lighthouse.map, roughness: 0.6 });
    place(g, new THREE.CylinderGeometry(0.85, 1.35, 12, 20), bandsMat, 0, 6, 0);
    place(g, new THREE.CylinderGeometry(1.35, 1.35, 0.25, 20), M.roofDark, 0, 12.1, 0);
    const lantern = place(g, new THREE.CylinderGeometry(0.7, 0.7, 1.3, 12), M.lamp, 0, 12.85, 0);
    lantern.castShadow = false;
    place(g, new THREE.ConeGeometry(0.95, 1.1, 12), M.red, 0, 14.05, 0);
    place(g, tiledBox(4, 2.4, 3.4, 4, 2.4), cottage, 2.8, 1.2, 2.2);
    place(g, gableRoof(4, 3.4, 1.3, 0.25), [M.roofRed, M.white], 2.8, 2.4, 2.2);
    // Rotating beam, visible from dusk.
    // Soft light cone: bright at the lamp, fading along its length and at its edges.
    const beamMat = new THREE.ShaderMaterial({
      uniforms: { uIntensity: { value: 0 }, uColor: { value: new THREE.Color('#fff1c2') } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: `
        varying float vAlong;
        varying vec3 vN;
        varying vec3 vView;
        void main() {
          vAlong = uv.y;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uIntensity;
        uniform vec3 uColor;
        varying float vAlong;
        varying vec3 vN;
        varying vec3 vView;
        void main() {
          float edge = pow(abs(dot(normalize(vN), normalize(vView))), 1.5);
          float a = clamp(uIntensity * pow(vAlong, 1.8) * edge, 0.0, 1.0);
          gl_FragColor = vec4(uColor, a);
        }`,
    });
    const beamGeo = new THREE.ConeGeometry(2.6, 34, 24, 1, true).translate(0, -17, 0).rotateZ(Math.PI / 2);
    const beam = new THREE.Group();
    const b1 = new THREE.Mesh(beamGeo, beamMat);
    const b2 = new THREE.Mesh(beamGeo, beamMat);
    b2.rotation.y = Math.PI;
    beam.add(b1, b2);
    beam.userData.dynamic = true;
    beam.position.set(0, 12.85, 0);
    sites.contact.beam = beamMat;
    sites.contact.extra = beam;
    animators.push((t) => {
      beam.rotation.y = t * 0.7;
    });
  }

  // Friends: the marina, a boathouse with piers and moored boats.
  {
    const g = newSite('friends');
    slab(g, 13, 9, M.paving);
    place(g, tiledBox(8, 3.2, 5, 4, 3.2), [timber, timber, M.white, M.white, timber, timber], 0, 1.6, -1);
    place(g, gableRoof(8, 5, 1.8, 0.4), [M.roofBlue, M.white], 0, 3.2, -1);
    const pierY = 0.45 - g.position.y;
    const boats = [];
    const yacht = yachtGeometry();
    const sail = sailboatGeometry();
    const boatMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 });
    for (const px of [-5, 1, 7]) {
      place(g, new THREE.BoxGeometry(1.4, 0.25, 16), M.deck, px, pierY, 11);
      for (let k = 0; k < 3; k++) {
        const side = k % 2 ? 1 : -1;
        const geo = (px + k) % 3 === 0 ? sail : yacht;
        const b = dynamic(place(g, geo, boatMat, px + side * 1.9, pierY - 0.35, 6 + k * 4.5, Math.PI / 2));
        b.scale.setScalar(0.85);
        boats.push({ b, base: b.position.y, ph: rand() * 6 });
      }
    }
    animators.push((t) => {
      for (const { b, base, ph } of boats) {
        b.position.y = base + Math.sin(t * 1.3 + ph) * 0.06;
        b.rotation.z = Math.sin(t * 1.1 + ph) * 0.03;
      }
    });
  }

  // Decorative cottages.
  for (const [x, z, ry] of COTTAGES) {
    const g = new THREE.Group();
    g.position.set(x, heightAt(x, z), z);
    g.rotation.y = ry;
    place(g, tiledBox(4, 2.2, 3, 4, 2.2), [cottage, cottage, M.white, M.white, cottage, cottage], 0, 1.1, 0);
    const roofMat = rand() < 0.5 ? M.roofRed : M.roofSlate;
    place(g, gableRoof(4, 3, 1.4, 0.3), [roofMat, M.white], 0, 2.2, 0);
    root.add(g);
  }

  // Seaplanes and a jetty in the west bay; yachts cruising offshore.
  {
    const plane = seaplaneGeometry();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 });
    const planes = [
      [-86, 33, 0.5],
      [-73, 38, -0.4],
      [-60, 35, 2.4],
    ].map(([x, z, r], i) => {
      const m = dynamic(place(root, plane, mat, x, -0.05, z, r));
      m.scale.setScalar(1.25);
      return { m, ph: i * 2 };
    });
    place(root, new THREE.BoxGeometry(1.4, 0.25, 12), M.deck, -92, 0.45, 30);
    const yacht = yachtGeometry();
    const sail = sailboatGeometry();
    const cruisers = [
      { geo: yacht, cx: -20, cz: 74, rx: 46, rz: 7, v: 0.012, ph: 0 },
      { geo: sail, cx: 40, cz: 80, rx: 36, rz: 9, v: -0.009, ph: 2 },
      { geo: yacht, cx: 95, cz: 62, rx: 22, rz: 6, v: 0.015, ph: 4 },
      { geo: sail, cx: -110, cz: 52, rx: 20, rz: 7, v: 0.011, ph: 1 },
    ].map((c) => ({ ...c, m: dynamic(place(root, c.geo, mat, 0, -0.08, 0)) }));
    for (const c of cruisers) c.m.scale.setScalar(1.3);
    animators.push((t) => {
      for (const p of planes) p.m.position.y = -0.05 + Math.sin(t * 1.2 + p.ph) * 0.05;
      for (const c of cruisers) {
        const a = c.ph + t * c.v * 6;
        c.m.position.x = c.cx + Math.cos(a) * c.rx;
        c.m.position.z = c.cz + Math.sin(a) * c.rz;
        const dx = -Math.sin(a) * c.rx * Math.sign(c.v);
        const dz = Math.cos(a) * c.rz * Math.sign(c.v);
        c.m.rotation.y = -Math.atan2(dz, dx);
      }
    });
  }

  // Bounds, anchors and hover rings.
  const ringMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false });
  for (const key in sites) {
    const s = sites[key];
    s.group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(s.group, true);
    box.expandByScalar(0.5);
    if (s.extra) s.group.add(s.extra);
    s.box = box;
    const c = box.getCenter(new THREE.Vector3());
    s.anchor = new THREE.Vector3(SITES[key].x, box.max.y + 1.2, SITES[key].z);
    if (key === 'awards' || key === 'experience' || key === 'projects') s.anchor.set(c.x, box.max.y + 1.2, c.z);
    const r = SITES[key].r * 0.95;
    const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.45, 64).rotateX(-Math.PI / 2), ringMat.clone());
    ring.position.set(SITES[key].x, s.group.position.y + 0.25, SITES[key].z);
    ring.renderOrder = 3;
    ring.userData.dynamic = true;
    root.add(ring);
    s.ring = ring;
  }

  bakeStatic(root);
  return { group: root, sites, nightMats, animators, materials: M };
}

// Copy `count` vertices from `start` of a non-indexed geometry.
function slice(g, start, count) {
  const out = new THREE.BufferGeometry();
  for (const name of ['position', 'normal', 'uv', 'color']) {
    const a = g.attributes[name];
    if (!a) continue;
    out.setAttribute(name, new THREE.BufferAttribute(a.array.slice(start * a.itemSize, (start + count) * a.itemSize), a.itemSize));
  }
  return out;
}

// Merge every static mesh into one mesh per material: a few dozen draw calls instead of hundreds.
function bakeStatic(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();
  const doomed = [];
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh) return;
    for (let p = o; p && p !== root; p = p.parent) if (p.userData.dynamic) return;
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(
      new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld),
    );
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const groups =
      Array.isArray(o.material) && g.groups.length ? g.groups : [{ start: 0, count: g.attributes.position.count, materialIndex: 0 }];
    for (const gr of groups) {
      const mat = mats[gr.materialIndex];
      if (!mat) continue;
      if (!buckets.has(mat)) buckets.set(mat, []);
      buckets.get(mat).push(slice(g, gr.start, Math.min(gr.count, g.attributes.position.count - gr.start)));
    }
    doomed.push(o);
  });
  for (const o of doomed) o.removeFromParent();
  for (const [mat, geos] of buckets) {
    // Give every part the same attributes so they can be merged.
    const needUv = geos.some((g) => g.attributes.uv);
    const needColor = geos.some((g) => g.attributes.color);
    for (const g of geos) {
      const n = g.attributes.position.count;
      if (needUv && !g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
      if (needColor && !g.attributes.color) g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3));
      if (!needUv && g.attributes.uv) g.deleteAttribute('uv');
      if (!needColor && g.attributes.color) g.deleteAttribute('color');
    }
    const merged = mergeGeometries(geos);
    const mesh = new THREE.Mesh(merged, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
  }
}
