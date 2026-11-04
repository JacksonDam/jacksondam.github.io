import * as THREE from 'three';
import { buildTerrain } from './terrain';
import { buildSky, buildWater } from './sky';
import { buildVegetation } from './vegetation';
import { buildPaths } from './paths';
import { buildStructures } from './structures';
import { makeTextures } from './textures';
import { PRESETS, cloneState, mixState, toState } from './presets';
import { SITES } from './layout';
import { clamp, lerp } from './noise';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class World {
  constructor(canvas, { onHover, onSelect, reducedMotion = false, refreshMs = 1000 / 60 } = {}) {
    performance.mark('world-start');
    this.canvas = canvas;
    this.onHover = onHover || (() => {});
    this.onSelect = onSelect || (() => {});
    this.reducedMotion = reducedMotion;
    this.pins = new Map();
    this.hovered = null;
    this.highlight = null;
    this.paused = false;
    this.time = 0;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    this.lite = coarse || small;

    // MSAA on standard-density screens; on high-density screens the pixels are small enough without
    // it, and skipping it keeps 120/144 Hz within reach.
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: (window.devicePixelRatio || 1) < 1.5,
      powerPreference: 'high-performance',
    });
    // Resolution adapts so the map keeps up with the display's refresh rate (see adaptResolution).
    this.refreshMs = refreshMs;
    this.maxRatio = Math.min(window.devicePixelRatio || 1, this.lite ? 1.75 : 2);
    this.ratio = this.maxRatio;
    renderer.setPixelRatio(this.ratio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // Everything that casts a shadow stands still, so the shadow map is only redrawn when the sun moves.
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;
    this.camera = new THREE.PerspectiveCamera(50, 1, 1, 6000);

    // Lights.
    this.hemi = new THREE.HemisphereLight('#ffffff', '#555555', 1);
    scene.add(this.hemi);
    const sun = new THREE.DirectionalLight('#ffffff', 2);
    sun.castShadow = true;
    const sm = this.lite ? 1536 : 3072;
    sun.shadow.mapSize.set(sm, sm);
    const sc = sun.shadow.camera;
    sc.left = -165;
    sc.right = 165;
    sc.top = 125;
    sc.bottom = -125;
    sc.near = 10;
    sc.far = 700;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.35;
    sun.shadow.radius = 2;
    sun.target.position.set(0, 0, -8);
    scene.add(sun, sun.target);
    this.sun = sun;
    scene.fog = new THREE.FogExp2('#ffffff', 0.002);

    // World.
    const terrain = buildTerrain(this.lite ? { segX: 320, segZ: 230 } : undefined);
    this.terrain = terrain;
    terrain.mesh.renderOrder = 2; // after the trees, so ground hidden behind them is skipped
    scene.add(terrain.mesh);
    const sky = buildSky();
    this.sky = sky;
    scene.add(sky.mesh);
    const water = buildWater();
    this.water = water;
    scene.add(water.mesh);
    const T = makeTextures();
    const structures = buildStructures(terrain.heightAt, T);
    this.structures = structures;
    scene.add(structures.group);
    scene.add(buildPaths(terrain.heightAt, structures.sites).group);
    const veg = buildVegetation(terrain.heightAt, terrain.normalAt, { density: this.lite ? 0.62 : 1 });
    scene.add(veg.group);

    // Time of day.
    this.tod = toState(PRESETS.day);
    this.todFrom = cloneState(this.tod);
    this.todTo = cloneState(this.tod);
    this.todT = 1;
    this.applyTod();

    // Camera rig: current and goal (target x/z, distance, pitch, yaw).
    this.view = { x: 0, y: 0, z: 0, dist: 200, pitch: 0.6, yaw: 0 };
    this.goal = { ...this.view };
    this.flight = null;
    this.pan = { x: 0, z: 0 };
    this.parallax = { x: 0, y: 0, tx: 0, ty: 0 };
    this.focusKey = null;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.drag = null;
    this.bindInput();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement);
    this.resize();
    this.view = this.overview();
    this.goal = { ...this.view };

    performance.measure('world-build', 'world-start');

    document.fonts?.ready.then(() => {
      this.pinMetrics = null;
    });

    // ?fps in the address shows the frame rate the browser actually delivers.
    if (new URLSearchParams(window.location.search).has('fps')) {
      const el = document.createElement('div');
      el.className = 'fps-meter';
      document.body.appendChild(el);
      this.meter = { el, frames: 0, worst: 0, work: 0, from: performance.now() };
    }

    this.clock = new THREE.Clock();
    // Shaders compile in parallel where the browser allows it; start() waits for them, so the
    // first frames do not stall on compilation.
    this.ready = renderer.compileAsync(scene, this.camera).then(() => {});
    if (import.meta.env.DEV) {
      window.__world = this;
      window.__THREE = THREE;
    }
  }

  start(refreshMs = this.refreshMs) {
    this.refreshMs = refreshMs;
    this.clock.getDelta();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  // Framing for the whole island at the current aspect ratio.
  overview() {
    const a = this.aspect || 16 / 9;
    const tanH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const wide = clamp((a - 0.55) / 1.2, 0, 1);
    const halfW = lerp(58, 120, Math.sqrt(wide));
    const dist = clamp(halfW / (tanH * a), 90, 340);
    const pitch = lerp(0.6, 0.37, wide);
    return { x: 20 + this.pan.x, y: 0, z: lerp(2, -14, wide) + this.pan.z, dist, pitch, yaw: 0 };
  }

  // How far the overview may be dragged sideways at this aspect.
  panLimit() {
    const a = this.aspect || 16 / 9;
    const tanH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const o = this.overview();
    const visible = o.dist * tanH * a;
    return { x: Math.max(0, 118 - visible * 0.8), z: a < 1 ? 26 : 10 };
  }

  focusView(key) {
    const s = SITES[key];
    const site = this.structures.sites[key];
    const y = site ? site.group.position.y : 0;
    const big = s.r > 14 ? 1.25 : 1;
    const a = this.aspect || 1.6;
    const dist = (a < 1 ? 78 : 58) * big;
    return { x: s.x, y, z: s.z, dist, pitch: 0.5, yaw: s.x > 40 ? -0.22 : s.x < -30 ? 0.22 : 0.1 };
  }

  playIntro() {
    const o = this.overview();
    if (this.reducedMotion) {
      this.view = { ...o };
      this.goal = { ...o };
      return;
    }
    this.view = { ...o, dist: o.dist * 1.55, pitch: o.pitch - 0.3, yaw: -0.32, z: o.z - 30 };
    this.goal = { ...this.view };
    this.flyTo(o, 3.4);
  }

  flyTo(target, duration = 1.1) {
    if (this.reducedMotion) duration = 0.01;
    this.flight = { from: { ...this.view }, to: { ...target }, t: 0, duration };
    return new Promise((resolve) => {
      this.flight.resolve = resolve;
    });
  }

  focus(key) {
    this.focusKey = key;
    return this.flyTo(this.focusView(key), 0.9);
  }

  snapFocus(key) {
    this.focusKey = key;
    this.flight = null;
    this.view = this.focusView(key);
    this.goal = { ...this.view };
  }

  unfocus() {
    this.focusKey = null;
    return this.flyTo(this.overview(), 1.0);
  }

  setTimeOfDay(name, animate = true) {
    const p = PRESETS[name] || PRESETS.day;
    this.todFrom = cloneState(this.tod);
    this.todTo = toState(p);
    this.todT = animate && !this.reducedMotion ? 0 : 1;
    if (!animate || this.reducedMotion) {
      this.tod = cloneState(this.todTo);
      this.applyTod();
    }
  }

  applyTod() {
    const s = this.tod;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.toneMappingExposure = s.exposure;
    this.sun.color.copy(s.sunColor);
    this.sun.intensity = s.sunIntensity;
    this.sun.position.copy(s.sunDir).multiplyScalar(320).add(this.sun.target.position);
    this.hemi.color.copy(s.hemiSky);
    this.hemi.groundColor.copy(s.hemiGround);
    this.hemi.intensity = s.hemiIntensity;
    this.scene.fog.color.copy(s.fog);
    this.scene.fog.density = s.fogDensity;
    const su = this.sky.uniforms;
    su.uTop.value.copy(s.skyTop);
    su.uHorizon.value.copy(s.skyHorizon);
    su.uSunDir.value.copy(s.sunDir);
    su.uSunColor.value.copy(s.sunColor);
    su.uSunGlow.value = s.sunGlow;
    su.uStars.value = s.stars;
    const wu = this.water.uniforms;
    wu.uSunDir.value.copy(s.sunDir);
    wu.uSunColor.value.copy(s.sunColor).multiplyScalar(Math.min(1, s.sunIntensity / 2.5));
    wu.uSky.value.copy(s.waterSky);
    wu.uTint.value.copy(s.waterTint);
    wu.uAlpha.value = s.waterAlpha;
    wu.uSpec.value = s.waterSpec;
    for (const m of this.structures.nightMats) m.emissiveIntensity = s.windows;
    const beam = this.structures.sites.contact?.beam;
    if (beam) {
      beam.uniforms.uIntensity.value = s.beam;
      beam.visible = s.beam > 0.01;
    }
  }

  setPin(key, el) {
    if (el) this.pins.set(key, el);
    else this.pins.delete(key);
  }

  setHighlight(key) {
    this.highlight = key;
  }

  setPaused(paused) {
    this.paused = paused;
  }

  bindInput() {
    const c = this.canvas;
    this.handlers = {
      down: (e) => {
        if (e.button !== 0) return;
        this.drag = { x: e.clientX, y: e.clientY, sx: this.pan.x, sz: this.pan.z, moved: false, id: e.pointerId };
      },
      move: (e) => {
        const r = c.getBoundingClientRect();
        this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        this.parallax.tx = this.pointer.x;
        this.parallax.ty = this.pointer.y;
        if (this.drag && e.pointerId === this.drag.id) {
          const dx = e.clientX - this.drag.x;
          const dy = e.clientY - this.drag.y;
          if (!this.drag.moved && Math.hypot(dx, dy) > 6) {
            this.drag.moved = true;
            c.setPointerCapture?.(e.pointerId);
            c.classList.add('dragging');
          }
          if (this.drag.moved && !this.focusKey) {
            const lim = this.panLimit();
            const k = (this.view.dist * 1.1) / r.height;
            this.pan.x = clamp(this.drag.sx - dx * k, -lim.x, lim.x);
            this.pan.z = clamp(this.drag.sz - dy * k * 1.4, -lim.z, lim.z);
            const o = this.overview();
            this.goal.x = o.x;
            this.goal.z = o.z;
          }
        }
        this.pickPending = true;
      },
      up: (e) => {
        const d = this.drag;
        this.drag = null;
        c.classList.remove('dragging');
        if (d && !d.moved && e.type === 'pointerup') {
          this.pickPending = true;
          this.pick();
          if (this.hovered) this.onSelect(this.hovered);
        }
      },
      leave: () => {
        this.parallax.tx = 0;
        this.parallax.ty = 0;
        this.setHovered(null);
      },
    };
    c.addEventListener('pointerdown', this.handlers.down);
    c.addEventListener('pointermove', this.handlers.move);
    c.addEventListener('pointerup', this.handlers.up);
    c.addEventListener('pointercancel', this.handlers.up);
    c.addEventListener('pointerleave', this.handlers.leave);
  }

  pick() {
    if (!this.pickPending) return;
    this.pickPending = false;
    if (this.focusKey || this.paused) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const ray = this.raycaster.ray;
    let best = null;
    let bestD = Infinity;
    const hit = new THREE.Vector3();
    for (const key in this.structures.sites) {
      const s = this.structures.sites[key];
      if (ray.intersectBox(s.box, hit)) {
        const d = hit.distanceTo(ray.origin);
        if (d < bestD) {
          bestD = d;
          best = key;
        }
      }
    }
    this.setHovered(best);
  }

  setHovered(key) {
    if (key === this.hovered) return;
    this.hovered = key;
    this.onHover(key);
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    this.width = w;
    this.height = h;
    this.aspect = w / h;
    this.renderer.setSize(w, h, false);
    this.pinMetrics = null;
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
    const lim = this.panLimit();
    this.pan.x = clamp(this.pan.x, -lim.x, lim.x);
    this.pan.z = clamp(this.pan.z, -lim.z, lim.z);
    if (!this.flight) {
      const target = this.focusKey ? this.focusView(this.focusKey) : this.overview();
      Object.assign(this.goal, target);
      if (this.view) Object.assign(this.view, target);
    }
  }

  updateCamera(dt) {
    if (this.flight) {
      const f = this.flight;
      f.t = Math.min(1, f.t + dt / f.duration);
      const e = easeInOut(f.t);
      for (const k of ['x', 'y', 'z', 'dist', 'pitch', 'yaw']) this.view[k] = lerp(f.from[k], f.to[k], e);
      if (f.t >= 1) {
        this.flight = null;
        Object.assign(this.goal, f.to);
        f.resolve?.();
      }
    } else {
      const k = 1 - Math.exp(-dt * 7);
      for (const key of ['x', 'y', 'z', 'dist', 'pitch', 'yaw']) this.view[key] += (this.goal[key] - this.view[key]) * k;
    }
    const p = this.parallax;
    const pk = 1 - Math.exp(-dt * 2.5);
    p.x += (p.tx - p.x) * pk;
    p.y += (p.ty - p.y) * pk;
    const amp = this.reducedMotion || this.focusKey ? 0 : 1;
    const v = this.view;
    const yaw = v.yaw + p.x * 0.025 * amp;
    const pitch = v.pitch + p.y * 0.012 * amp;
    const cam = this.camera;
    cam.position.set(
      v.x + Math.sin(yaw) * Math.cos(pitch) * v.dist,
      v.y + Math.sin(pitch) * v.dist,
      v.z + Math.cos(yaw) * Math.cos(pitch) * v.dist,
    );
    cam.lookAt(v.x, v.y, v.z);
  }

  updatePins() {
    const v = new THREE.Vector3();
    const w = this.width;
    const h = this.height;
    const m = w < 720 ? 30 : 36;
    const top = (w < 720 ? 56 : 64) + m + 6;
    const placed = [];
    for (const [key, el] of this.pins) {
      const site = this.structures.sites[key];
      if (!site) continue;
      v.copy(site.anchor).project(this.camera);
      const behind = v.z > 1;
      let x = (v.x * 0.5 + 0.5) * w;
      let y = (-v.y * 0.5 + 0.5) * h;
      // Places off-screen stay reachable: they stick to the nearest edge.
      let edge = '';
      if (x < m) {
        x = m;
        edge = 'l';
      } else if (x > w - m) {
        x = w - m;
        edge = 'r';
      }
      y = clamp(y, top, h - 24);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.visibility = behind ? 'hidden' : '';
      if (el.dataset.edge !== edge) {
        el.dataset.edge = edge;
        el.classList.toggle('edge', !!edge);
        el.classList.toggle('edge-l', edge === 'l');
        el.classList.toggle('edge-r', edge === 'r');
      }
      if (!behind) placed.push({ key, el, x, y, edge });
    }
    this.layoutLabels(placed, w);
  }

  // Put each label on the side of its icon where it overlaps the fewest
  // other icons and labels.
  layoutLabels(pins, w) {
    if (!this.pinMetrics) this.pinMetrics = new Map();
    const rects = [];
    const icons = pins.map((p) => {
      let mtr = this.pinMetrics.get(p.key);
      if (!mtr) {
        const pin = p.el.querySelector('.pin');
        const label = p.el.querySelector('.pin-label');
        mtr = { size: pin?.offsetWidth || 54, lw: label?.offsetWidth || 80, lh: label?.offsetHeight || 26 };
        this.pinMetrics.set(p.key, mtr);
      }
      p.m = mtr;
      const s = mtr.size;
      const r = [p.x - s / 2, p.y - s - 6, p.x + s / 2, p.y - 6];
      rects.push(r);
      return r;
    });
    const overlap = (a, b) =>
      Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
    const order = pins.map((_, i) => i).sort((a, b) => pins[a].y - pins[b].y);
    for (const i of order) {
      const p = pins[i];
      const { size: s, lw, lh } = p.m;
      const cy = p.y - 6 - s / 2;
      const right = [p.x + s / 2 + 9, cy - lh / 2, p.x + s / 2 + 9 + lw, cy + lh / 2];
      const left = [p.x - s / 2 - 9 - lw, cy - lh / 2, p.x - s / 2 - 9, cy + lh / 2];
      const below = [p.x - lw / 2, p.y + 2, p.x + lw / 2, p.y + 2 + lh];
      const cost = (r) => {
        let c = 0;
        for (let j = 0; j < rects.length; j++) if (rects[j] !== icons[i]) c += overlap(r, rects[j]);
        if (r[0] < 4) c += (4 - r[0]) * lh * 2;
        if (r[2] > w - 4) c += (r[2] - w + 4) * lh * 2;
        return c;
      };
      const pref = p.edge === 'r' ? 'l' : p.edge === 'l' ? 'r' : p.el.dataset.prefer || 'r';
      const options = { r: right, l: left, b: below };
      const costs = { r: cost(right), l: cost(left), b: cost(below) + lw * 0.5 };
      let side = pref;
      const allowed = p.edge === 'r' ? ['l', 'b'] : p.edge === 'l' ? ['r', 'b'] : ['r', 'l', 'b'];
      for (const k of allowed) if (costs[k] + 1 < costs[side]) side = k;
      rects.push(options[side]);
      if (p.el.dataset.side !== side) {
        p.el.dataset.side = side;
        p.el.classList.toggle('side-l', side === 'l');
        p.el.classList.toggle('side-b', side === 'b');
      }
    }
  }

  updateRings(t, dt) {
    for (const key in this.structures.sites) {
      const ring = this.structures.sites[key].ring;
      const on = key === this.hovered || key === this.highlight || key === this.focusKey;
      const target = on ? 0.5 + 0.2 * Math.sin(t * 5) : 0;
      ring.material.opacity += (target - ring.material.opacity) * (1 - Math.exp(-dt * 12));
      ring.visible = ring.material.opacity > 0.01;
    }
  }

  // Keep frame times at the display's refresh interval: step the render resolution down when
  // frames are missed and back up when there is headroom.
  adaptResolution(raw) {
    if (raw > 0.25) {
      this.perf = null; // tab was hidden or the page paused
      return;
    }
    const now = performance.now();
    // Skip the first seconds: shader compiles and texture uploads make early frames slow.
    const p = (this.perf ||= { times: [], good: 0, cool: 0, ceiling: this.maxRatio, from: now + 2500, lowered: 0 });
    if (now < p.from) return;
    if (p.ceiling < this.maxRatio && now - p.lowered > 30000) p.ceiling = this.maxRatio;
    p.times.push(raw * 1000);
    if (p.times.length < 45) return;
    const sorted = p.times.slice().sort((a, b) => a - b);
    const p80 = sorted[Math.floor(sorted.length * 0.8)];
    p.times.length = 0;
    if (p.cool > 0) {
      p.cool--;
      return;
    }
    const target = this.refreshMs;
    const step = (r) => {
      this.ratio = r;
      this.renderer.setPixelRatio(r);
      this.resize();
      p.cool = 2;
    };
    if (p80 > target * 1.25 && this.ratio > 0.75) {
      p.ceiling = this.ratio - 0.25; // do not climb straight back to a level that could not keep up
      p.lowered = now;
      p.good = 0;
      step(Math.max(0.75, this.ratio - 0.25));
    } else if (p80 < target * 1.1 && this.ratio < p.ceiling) {
      if (++p.good >= 4) {
        p.good = 0;
        step(Math.min(p.ceiling, this.ratio + 0.25));
      }
    } else {
      p.good = 0;
    }
  }

  updateMeter(raw, work) {
    const m = this.meter;
    const now = performance.now();
    m.frames++;
    m.worst = Math.max(m.worst, raw * 1000);
    m.work += work;
    if (now - m.from < 500) return;
    const fps = (m.frames * 1000) / (now - m.from);
    const c = this.renderer.domElement;
    m.el.textContent =
      `${Math.round(fps)} fps (browser refresh ${Math.round(1000 / this.refreshMs)} Hz)\n` +
      `${(1000 / fps).toFixed(1)} ms per frame, worst ${m.worst.toFixed(1)} ms\n` +
      `${(m.work / m.frames).toFixed(2)} ms of map work per frame\n` +
      `${c.width} x ${c.height} pixels`;
    Object.assign(m, { frames: 0, worst: 0, work: 0, from: now });
  }

  frame() {
    const raw = this.clock.getDelta();
    if (this.paused) return;
    const begun = this.meter ? performance.now() : 0;
    this.step(raw);
    if (this.meter) this.updateMeter(raw, performance.now() - begun);
  }

  step(raw) {
    const dt = Math.min(raw, 0.05);
    this.adaptResolution(raw);
    this.time += dt;
    const t = this.time;

    if (this.todT < 1) {
      this.todT = Math.min(1, this.todT + dt / 1.4);
      mixState(this.tod, this.todFrom, this.todTo, easeInOut(this.todT));
      this.applyTod();
    }

    this.terrain.uniforms.uTime.value = t;
    this.water.uniforms.uTime.value = t;
    for (const a of this.structures.animators) a(t, dt);

    this.updateCamera(dt);
    this.pick();
    this.updateRings(t, dt);
    this.sky.mesh.position.copy(this.camera.position);
    this.renderer.render(this.scene, this.camera);
    this.updatePins();
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.meter?.el.remove();
    this.resizeObserver.disconnect();
    const c = this.canvas;
    c.removeEventListener('pointerdown', this.handlers.down);
    c.removeEventListener('pointermove', this.handlers.move);
    c.removeEventListener('pointerup', this.handlers.up);
    c.removeEventListener('pointercancel', this.handlers.up);
    c.removeEventListener('pointerleave', this.handlers.leave);
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    this.renderer.dispose();
    if (window.__world === this) delete window.__world;
  }
}
