import * as THREE from 'three';
import { mulberry32 } from './noise';

// Small procedural facade textures. Each returns { map, emissiveMap } where the
// emissive map holds the windows that light up at night.

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function finish(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function pair(w, h, draw) {
  const a = canvas(w, h);
  const b = canvas(w, h);
  const rand = mulberry32(w * 31 + h);
  const ga = a.getContext('2d');
  const gb = b.getContext('2d');
  gb.fillStyle = '#000';
  gb.fillRect(0, 0, w, h);
  draw(ga, gb, rand);
  return { map: finish(a), emissiveMap: finish(b) };
}

export function makeTextures() {
  const T = {};

  // Curtain wall: pale blue glass with white mullions.
  T.glass = pair(256, 128, (g, e, rand) => {
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, '#b9d3e2');
    grd.addColorStop(1, '#7ea4bd');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#f4f6f7';
    for (let x = 0; x <= 256; x += 32) g.fillRect(x - 2, 0, 4, 128);
    g.fillRect(0, 0, 256, 7);
    g.fillRect(0, 124, 256, 4);
    for (let x = 0; x < 256; x += 32) {
      if (rand() < 0.4) {
        e.fillStyle = rand() < 0.5 ? '#e8b878' : '#f2d6a8';
        e.fillRect(x + 3, 9, 26, 113);
      }
    }
  });

  // Office: white spandrel bands and dark ribbon windows.
  T.office = pair(256, 128, (g, e, rand) => {
    g.fillStyle = '#eceeee';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#3c4c59';
    g.fillRect(0, 34, 256, 62);
    g.fillStyle = '#e9ecec';
    for (let x = 0; x < 256; x += 42) g.fillRect(x, 34, 4, 62);
    for (let x = 0; x < 256; x += 42) {
      if (rand() < 0.45) {
        e.fillStyle = '#e9c08a';
        e.fillRect(x + 5, 36, 36, 58);
      }
    }
  });

  // Vertical timber boards (workshop and boathouse).
  const boards = (base, dark) =>
    pair(128, 128, (g) => {
      g.fillStyle = base;
      g.fillRect(0, 0, 128, 128);
      for (let x = 0; x < 128; x += 8) {
        g.fillStyle = dark;
        g.fillRect(x, 0, 1.5, 128);
        g.globalAlpha = 0.12;
        g.fillRect(x + 3, 0, 2, 128);
        g.globalAlpha = 1;
      }
    });
  T.timber = boards('#8b5a36', '#5d3a22');
  T.charcoal = boards('#3d3d3f', '#232325');

  // Café front: dark boards and big warm windows.
  T.cafe = pair(256, 128, (g, e) => {
    g.fillStyle = '#3b3b3d';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#262628';
    for (let x = 0; x < 256; x += 10) g.fillRect(x, 0, 2, 128);
    for (const x of [24, 104, 184]) {
      g.fillStyle = '#d9d3c4';
      g.fillRect(x - 3, 30, 54, 76);
      g.fillStyle = '#4f5a60';
      g.fillRect(x, 33, 48, 70);
      e.fillStyle = '#ffcf8a';
      e.fillRect(x, 33, 48, 70);
    }
  });

  // Classical cream wall with tall windows.
  T.cream = pair(128, 128, (g, e, rand) => {
    g.fillStyle = '#ecdfc6';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#d7c7a8';
    g.fillRect(0, 118, 128, 10);
    for (const x of [18, 74]) {
      g.fillStyle = '#fbf6ea';
      g.fillRect(x - 4, 26, 44, 80);
      g.fillStyle = '#4a4f55';
      g.fillRect(x, 30, 36, 72);
      if (rand() < 0.7) {
        e.fillStyle = '#ffd59a';
        e.fillRect(x, 30, 36, 72);
      }
    }
  });

  // Plain white render with small windows (cottages, lighthouse keeper).
  T.cottage = pair(128, 128, (g, e, rand) => {
    g.fillStyle = '#f2efe8';
    g.fillRect(0, 0, 128, 128);
    for (const x of [22, 78]) {
      g.fillStyle = '#56606a';
      g.fillRect(x, 44, 28, 34);
      g.fillStyle = '#ffffff';
      g.fillRect(x + 12, 44, 4, 34);
      if (rand() < 0.75) {
        e.fillStyle = '#ffd08c';
        e.fillRect(x, 44, 28, 34);
      }
    }
  });

  // License centre: white with a blue band and glazing.
  T.school = pair(256, 128, (g, e) => {
    g.fillStyle = '#f5f6f7';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#2f6fd6';
    g.fillRect(0, 14, 256, 14);
    g.fillStyle = '#566978';
    g.fillRect(0, 50, 256, 52);
    g.fillStyle = '#f5f6f7';
    for (let x = 0; x < 256; x += 32) g.fillRect(x, 50, 3, 52);
    e.fillStyle = '#ffe2b0';
    e.fillRect(0, 50, 256, 52);
  });

  // Garage doors for the workshop and pit lane.
  T.doors = pair(128, 128, (g) => {
    g.fillStyle = '#5b5e62';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#4a4d51';
    for (let y = 0; y < 128; y += 12) g.fillRect(0, y, 128, 3);
  });

  // Parking bays.
  T.parking = (() => {
    const c = canvas(256, 256);
    const g = c.getContext('2d');
    g.fillStyle = '#6a6d70';
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#e8e8e8';
    for (let x = 0; x <= 256; x += 21) {
      g.fillRect(x, 8, 2, 88);
      g.fillRect(x, 160, 2, 88);
    }
    return { map: finish(c) };
  })();

  // Kerb stripes.
  T.kerb = (() => {
    const c = canvas(64, 8);
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 64, 8);
    g.fillStyle = '#d8262c';
    g.fillRect(0, 0, 32, 8);
    return { map: finish(c) };
  })();

  // Lighthouse bands.
  T.lighthouse = (() => {
    const c = canvas(8, 128);
    const g = c.getContext('2d');
    g.fillStyle = '#f7f7f5';
    g.fillRect(0, 0, 8, 128);
    g.fillStyle = '#cc2a2a';
    for (let y = 0; y < 128; y += 32) g.fillRect(0, y, 8, 16);
    return { map: finish(c) };
  })();

  return T;
}

// BoxGeometry whose UVs repeat the texture every `tile` units, per face.
export function tiledBox(w, h, d, tileW = 4, tileH = 1.4) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv;
  // Face order: +x, -x, +y, -y, +z, -z (4 vertices each).
  const dims = [
    [d, h], [d, h], [w, d], [w, d], [w, h], [w, h],
  ];
  for (let f = 0; f < 6; f++) {
    const [fw, fh] = dims[f];
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, (uv.getX(i) * fw) / tileW, (uv.getY(i) * fh) / tileH);
    }
  }
  return geo;
}
