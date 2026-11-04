import * as THREE from 'three';

export function buildSky() {
  const uniforms = {
    uTop: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunColor: { value: new THREE.Color() },
    uSunGlow: { value: 1 },
    uStars: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uHorizon, uSunDir, uSunColor;
      uniform float uSunGlow, uStars;
      varying vec3 vDir;
      float hash13(vec3 p3) { p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
      void main() {
        vec3 d = normalize(vDir);
        float h = max(d.y, 0.0);
        vec3 col = mix(uHorizon, uTop, pow(h, 0.55));
        float s = max(dot(d, normalize(uSunDir)), 0.0);
        col += uSunColor * (pow(s, 900.0) * 3.0 + pow(s, 48.0) * 0.35 + pow(s, 6.0) * 0.12) * uSunGlow;
        if (uStars > 0.0) {
          vec3 q = floor(d * 380.0);
          float st = step(0.9975, hash13(q)) * smoothstep(0.05, 0.4, d.y);
          col += vec3(st) * uStars;
        }
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 16), material);
  mesh.frustumCulled = false;
  // Drawn after the opaque world (it sits at the far plane), so hidden sky pixels are never shaded.
  mesh.renderOrder = 5;
  return { mesh, uniforms };
}

export function buildWater() {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color() },
      uSky: { value: new THREE.Color() },
      uTint: { value: new THREE.Color('#1b7fa6') },
      uAlpha: { value: 0.32 },
      uSpec: { value: 1 },
    },
  ]);
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    fog: true,
    vertexShader: /* glsl */ `
      #include <common>
      #include <fog_pars_vertex>
      varying vec3 vWPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWPos = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <fog_pars_fragment>
      uniform float uTime, uAlpha, uSpec;
      uniform vec3 uSunDir, uSunColor, uSky, uTint;
      varying vec3 vWPos;
      vec2 waveGrad(vec2 p, float t) {
        vec2 g = vec2(0.0);
        vec4 dirs[4];
        dirs[0] = vec4(0.82, 0.57, 0.9, 1.3);
        dirs[1] = vec4(-0.45, 0.89, 1.7, 0.9);
        dirs[2] = vec4(0.2, -0.98, 3.1, 1.7);
        dirs[3] = vec4(-0.93, -0.36, 5.3, 2.3);
        for (int i = 0; i < 4; i++) {
          vec2 d = dirs[i].xy;
          float k = dirs[i].z;
          float ph = dot(d, p) * k + t * dirs[i].w;
          g += d * k * cos(ph) * (0.05 / k);
        }
        return g;
      }
      void main() {
        vec3 v = normalize(cameraPosition - vWPos);
        // Fade the fine ripples with distance so they do not alias into stripes.
        float dist = length(cameraPosition - vWPos);
        float fine = 1.0 - smoothstep(60.0, 220.0, dist);
        vec2 g = waveGrad(vWPos.xz * 0.9, uTime) * (0.45 + 0.55 * fine) + waveGrad(vWPos.xz * 3.7 + 13.0, uTime * 1.6) * 0.5 * fine;
        vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
        float fres = 0.03 + 0.97 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
        vec3 h = normalize(normalize(uSunDir) + v);
        float spec = (pow(max(dot(n, h), 0.0), 260.0) * 2.4 + pow(max(dot(n, h), 0.0), 40.0) * 0.12) * uSpec;
        vec3 col = mix(uTint, uSky, fres) + uSunColor * spec;
        float a = clamp(uAlpha + fres * 0.8 + spec, 0.0, 1.0);
        gl_FragColor = vec4(col, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  const geo = new THREE.PlaneGeometry(6000, 6000, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.y = 0;
  mesh.renderOrder = 2;
  mesh.name = 'water';
  return { mesh, uniforms };
}
