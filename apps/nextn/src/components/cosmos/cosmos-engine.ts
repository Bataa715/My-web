/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COSMOS ENGINE — vanilla Three.js deep-space scene
 * ───────────────────────────────────────────────────────────────────────────
 * One persistent WebGL canvas that lives behind the whole site.
 *
 *  • Starfield  — a single THREE.Points draw call, thousands of stars with a
 *                 per-star GLSL twinkle (size / phase / colour attributes).
 *  • Planet     — custom shader sphere: fbm-noise surface bands, animated
 *                 cloud layer, fresnel rim light + additive atmosphere shell.
 *  • Nebula     — layered planes running a domain-warped simplex-fbm shader
 *                 in deep purple / blue / magenta, drifting very slowly.
 *  • Comets     — pooled quads with a gradient trail that streak randomly.
 *  • Asteroids  — one InstancedMesh (high tier only).
 *  • Bloom      — UnrealBloomPass, desktop-high tier only, lazily imported.
 *  • Camera     — autonomous drift + mouse parallax; on the home page it
 *                 flies along a CatmullRom path driven by scroll progress.
 *
 * Everything is created procedurally — zero texture/network requests, so the
 * scene is visible the moment the JS chunk arrives.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import * as THREE from 'three';

export type CosmosMode = 'journey' | 'ambient';

export interface CosmosQuality {
  stars: number;
  nebulaLayers: number;
  bloom: boolean;
  asteroids: boolean;
  comets: number;
  dprCap: number;
  planetDetail: number;
}

export const QUALITY_HIGH: CosmosQuality = {
  stars: 6500,
  nebulaLayers: 4,
  bloom: true,
  asteroids: true,
  comets: 3,
  dprCap: 1.75,
  planetDetail: 96,
};

export const QUALITY_LOW: CosmosQuality = {
  stars: 2200,
  nebulaLayers: 2,
  bloom: false,
  asteroids: false,
  comets: 1,
  dprCap: 1,
  planetDetail: 48,
};

/* ───────────────────────── GLSL: shared noise ──────────────────────────────
 * Ashima / Ian McEwan 3-D simplex noise. `fbm` sums octaves of it, halving
 * amplitude and doubling frequency each step → natural cloud-like detail.
 * ────────────────────────────────────────────────────────────────────────── */
const GLSL_NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++){
    f += a * snoise(p);
    p *= 2.02;      // lacunarity — slightly off 2.0 avoids grid artefacts
    a *= 0.5;       // gain — each octave contributes half as much
  }
  return f;
}
`;

/* ───────────────────────────── Starfield ─────────────────────────────── */

const STAR_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3  aColor;
uniform float uTime;
uniform float uPixelRatio;
varying vec3  vColor;
varying float vTwinkle;
void main(){
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  /* Perspective size: nearer stars render bigger. 130/-z keeps distant
     stars ~1px so thousands of them still read as points, not blobs. */
  float size = aSize * uPixelRatio * (130.0 / -mv.z);
  gl_PointSize = clamp(size, 1.0, 9.0 * uPixelRatio);
  /* Twinkle is computed per-vertex (cheap) and passed to the fragment. */
  vTwinkle = 0.62 + 0.38 * sin(uTime * (0.6 + aPhase * 1.7) + aPhase * 6.28318);
  gl_Position = projectionMatrix * mv;
}
`;

const STAR_FRAG = /* glsl */ `
varying vec3  vColor;
varying float vTwinkle;
void main(){
  /* Soft round sprite: bright core, gaussian-ish falloff to the edge. */
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.04, d);
  float glow = smoothstep(0.5, 0.18, d) * 0.35;
  float a = (core + glow) * vTwinkle;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * (0.85 + 0.4 * vTwinkle), a);
}
`;

/* ───────────────────────────── Nebula ────────────────────────────────── */

const NEBULA_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3  uColorA;   // deep purple
uniform vec3  uColorB;   // electric blue
uniform vec3  uColorC;   // magenta highlight
uniform float uOpacity;
uniform float uScale;
uniform vec2  uDrift;
varying vec2  vUv;
${GLSL_NOISE}
void main(){
  vec2 uv = vUv - 0.5;
  /* Radial mask keeps the cloud inside the plane so edges never show. */
  float mask = smoothstep(0.5, 0.12, length(uv * vec2(1.0, 1.45)));
  float t = uTime * 0.015;
  /* Domain warp: feed one fbm into the coordinates of the next — this is
     what turns flat noise into wispy, folded gas structures. */
  vec3 p = vec3(uv * uScale + uDrift, t);
  float warp = fbm(p * 0.9);
  float n1 = fbm(p + vec3(warp * 1.6, warp * 1.1, t * 0.5));
  float n2 = fbm(p * 1.9 - vec3(warp, 0.0, t));
  float cloud = smoothstep(-0.25, 0.85, n1);
  vec3 col = mix(uColorA, uColorB, clamp(n1 * 0.5 + 0.5, 0.0, 1.0));
  col += uColorC * smoothstep(0.35, 0.95, n2) * 0.55;   // magenta filaments
  float a = cloud * mask * uOpacity;
  gl_FragColor = vec4(col, a);
}
`;

const NEBULA_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/* ───────────────────────────── Planet ────────────────────────────────── */

const PLANET_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vView;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vPos = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const PLANET_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uDeep;     // ocean-deep base
uniform vec3 uBand;     // violet band colour
uniform vec3 uCloud;    // pale cloud colour
uniform vec3 uRim;      // electric rim colour
varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vView;
${GLSL_NOISE}
void main(){
  /* Latitude bands warped by fbm → gas-giant strata. Rotating the sample
     point around Y with time gives free "surface rotation" without
     actually spinning the mesh (keeps the lit side fixed). */
  float t = uTime * 0.008;
  vec3 p = vPos;
  float ca = cos(t), sa = sin(t);
  p.xz = mat2(ca, -sa, sa, ca) * p.xz;
  float warp  = fbm(p * 0.9 + vec3(0.0, uTime * 0.004, 0.0));
  float bands = sin(p.y * 2.6 + warp * 2.4);
  float m = smoothstep(-1.0, 1.0, bands);
  vec3 col = mix(uDeep, uBand, m * 0.85);

  /* Cloud layer: second, faster-drifting fbm masked to its upper range. */
  float clouds = fbm(p * 1.7 + vec3(uTime * 0.012, 0.0, uTime * 0.006));
  col = mix(col, uCloud, smoothstep(0.32, 0.85, clouds) * 0.5);

  /* Fixed key light from upper-left → day/night terminator. */
  vec3 lightDir = normalize(vec3(-0.55, 0.55, 0.62));
  float diff = clamp(dot(vNormal, lightDir), 0.0, 1.0);
  col *= 0.16 + diff * 1.05;

  /* Fresnel rim: pow() sharpens the falloff so only grazing angles glow.
     Values > 1.0 here are intentional — the bloom pass picks them up. */
  float fres = pow(1.0 - clamp(dot(vView, vNormal), 0.0, 1.0), 2.6);
  col += uRim * fres * 1.9;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* Atmosphere shell — rendered on the BackSide so we only see the halo that
 * extends past the limb. Alpha peaks at the silhouette edge. */
const ATMO_VERT = /* glsl */ `
varying vec3 vNormal;
void main(){
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ATMO_FRAG = /* glsl */ `
uniform vec3 uColor;
varying vec3 vNormal;
void main(){
  /* Classic back-side glow: visible fragments belong to the far hemisphere,
     whose view-space normals point away from the camera (dot < 0), so the
     base term stays positive — max() guards the pow() against NaN anyway.
     Result: a bright ring hugging the limb, fading softly outwards. */
  float intensity = pow(max(0.0, 0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.2);
  gl_FragColor = vec4(uColor, 1.0) * min(intensity, 2.5);
}
`;

/* ───────────────────────────── Comet trail ───────────────────────────── */

const COMET_FRAG = /* glsl */ `
uniform float uFade;
uniform vec3  uColor;
varying vec2  vUv;
void main(){
  /* u runs along the trail (1 = head), v across it. Head is a hot white
     core; the tail thins and cools towards the colour tint. */
  float along = pow(vUv.x, 2.2);
  float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
  across = pow(across, 2.4);
  float head = smoothstep(0.92, 1.0, vUv.x);
  vec3 col = mix(uColor, vec3(1.0), head * 0.9 + 0.15);
  float a = along * across * uFade;
  gl_FragColor = vec4(col, a);
}
`;

/* ───────────────────────────── helpers ───────────────────────────────── */

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Star colour palette — mostly white/blue with a few warm + violet accents */
function starColor(target: THREE.Color): THREE.Color {
  const r = Math.random();
  if (r < 0.62) return target.setHSL(0.62, rand(0.0, 0.25), rand(0.72, 1.0)); // white-blue
  if (r < 0.78) return target.setHSL(0.58, rand(0.6, 0.9), rand(0.65, 0.85)); // electric blue
  if (r < 0.88) return target.setHSL(0.75, rand(0.5, 0.85), rand(0.6, 0.8)); // violet
  if (r < 0.95) return target.setHSL(0.87, rand(0.5, 0.8), rand(0.6, 0.8)); // magenta
  return target.setHSL(0.09, rand(0.4, 0.7), rand(0.68, 0.85)); // warm gold
}

interface Comet {
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
  cooldown: number;
}

/* ═══════════════════════════ ENGINE ═══════════════════════════════════ */

export class CosmosEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private quality: CosmosQuality;
  private mode: CosmosMode = 'ambient';

  private stars!: THREE.Points;
  private starMat!: THREE.ShaderMaterial;
  private nebulaMats: THREE.ShaderMaterial[] = [];
  private planetGroup = new THREE.Group();
  private planetMats: THREE.ShaderMaterial[] = [];
  private comets: Comet[] = [];
  private asteroids?: THREE.InstancedMesh;

  // Post-processing (lazily created)
  private composer: { render: (d?: number) => void; setSize: (w: number, h: number) => void } | null = null;

  // Camera choreography
  private pathPos!: THREE.CatmullRomCurve3;
  private pathLook!: THREE.CatmullRomCurve3;
  private scrollTarget = 0;
  private scrollCurrent = 0;
  private pointerTarget = new THREE.Vector2();
  private pointerCurrent = new THREE.Vector2();
  private ambientReturn = 0; // eases journey→ambient transitions

  private raf = 0;
  private disposed = false;
  private running = true;
  // adaptive quality: drop bloom / DPR if the GPU can't keep up
  private frameSamples: number[] = [];

  constructor(private canvas: HTMLCanvasElement, quality: CosmosQuality) {
    this.quality = quality;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false, // bloom + additive glows hide aliasing; big perf win
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setClearColor(new THREE.Color('#05050a'), 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
    this.camera.position.set(0, 0, 18);

    this.scene.fog = new THREE.FogExp2(new THREE.Color('#05050a').getHex(), 0.0035);

    this.buildStars();
    this.buildNebula();
    this.buildPlanet();
    this.buildComets();
    if (quality.asteroids) this.buildAsteroids();
    this.buildCameraPath();

    this.resize();
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);

    if (quality.bloom) void this.initBloom();

    this.clock.start();
    this.loop();
  }

  /* ── scene builders ─────────────────────────────────────────────────── */

  /** Thousands of stars in ONE draw call: a THREE.Points cloud distributed
   *  in a tall cylinder around the camera's scroll path. */
  private buildStars() {
    const n = this.quality.stars;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const phase = new Float32Array(n);
    const color = new Float32Array(n * 3);
    const c = new THREE.Color();

    for (let i = 0; i < n; i++) {
      // Cylindrical shell: radius 14–150 so stars never pop through the UI,
      // y spans the whole scroll journey (+40 … −140).
      const a = Math.random() * Math.PI * 2;
      const r = 14 + Math.pow(Math.random(), 0.6) * 136;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = rand(-140, 40);
      pos[i * 3 + 2] = Math.sin(a) * r - 20;

      // Size distribution: many faint, few bright (power curve).
      size[i] = 0.6 + Math.pow(Math.random(), 3.0) * 3.4;
      phase[i] = Math.random();
      starColor(c);
      color[i * 3] = c.r;
      color[i * 3 + 1] = c.g;
      color[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));

    this.starMat = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.stars = new THREE.Points(geo, this.starMat);
    this.stars.frustumCulled = false;
    this.scene.add(this.stars);
  }

  /** Big shader planes stacked at different depths → parallaxing gas clouds */
  private buildNebula() {
    const palettes = [
      { a: '#2a0f55', b: '#123a8f', c: '#c435c9', o: 0.34 },
      { a: '#170a3a', b: '#0b2f6e', c: '#8b2fc9', o: 0.3 },
      { a: '#301050', b: '#0d2a80', c: '#e040a0', o: 0.26 },
      { a: '#12082e', b: '#0a2360', c: '#7a35d9', o: 0.22 },
    ];
    const placements = [
      { pos: [-22, -4, -70], rot: 0.15, size: [150, 90] },
      { pos: [30, -36, -85], rot: -0.3, size: [170, 100] },
      { pos: [-14, -70, -75], rot: 0.4, size: [160, 95] },
      { pos: [18, -105, -90], rot: -0.1, size: [180, 110] },
    ];
    for (let i = 0; i < this.quality.nebulaLayers; i++) {
      const p = palettes[i % palettes.length];
      const pl = placements[i % placements.length];
      const mat = new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERT,
        fragmentShader: NEBULA_FRAG,
        uniforms: {
          uTime: { value: Math.random() * 100 },
          uColorA: { value: new THREE.Color(p.a) },
          uColorB: { value: new THREE.Color(p.b) },
          uColorC: { value: new THREE.Color(p.c) },
          uOpacity: { value: p.o },
          uScale: { value: rand(2.2, 3.4) },
          uDrift: { value: new THREE.Vector2(Math.random() * 10, Math.random() * 10) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(pl.size[0], pl.size[1]), mat);
      mesh.position.set(pl.pos[0], pl.pos[1], pl.pos[2]);
      mesh.rotation.z = pl.rot;
      mesh.frustumCulled = false;
      this.nebulaMats.push(mat);
      this.scene.add(mesh);
    }
  }

  /** Horizon planet: a huge shader sphere low in the frame + atmosphere. */
  private buildPlanet() {
    const R = 9;
    const det = this.quality.planetDetail;

    const surfMat = new THREE.ShaderMaterial({
      vertexShader: PLANET_VERT,
      fragmentShader: PLANET_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color('#0a1238') },
        uBand: { value: new THREE.Color('#4b2fd6') },
        uCloud: { value: new THREE.Color('#a8c4ff') },
        uRim: { value: new THREE.Color('#4f8fff') },
      },
    });
    const surface = new THREE.Mesh(new THREE.SphereGeometry(R, det, det / 2), surfMat);

    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      uniforms: { uColor: { value: new THREE.Color('#3f7dff') } },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.075, det / 2, det / 4), atmoMat);

    this.planetMats.push(surfMat, atmoMat);
    this.planetGroup.add(surface, atmo);
    // Low and slightly right — a horizon under the hero content.
    this.planetGroup.position.set(2.5, -12.5, -6);
    this.scene.add(this.planetGroup);
  }

  private buildComets() {
    for (let i = 0; i < this.quality.comets; i++) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERT, // just passes uv through
        fragmentShader: COMET_FRAG,
        uniforms: {
          uFade: { value: 0 },
          uColor: { value: new THREE.Color(i % 2 ? '#8f6fff' : '#6fb2ff') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(11, 0.32), mat);
      mesh.visible = false;
      mesh.frustumCulled = false;
      this.scene.add(mesh);
      this.comets.push({
        mesh,
        mat,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        active: false,
        cooldown: rand(2, 6 + i * 4),
      });
    }
  }

  private buildAsteroids() {
    const count = 110;
    const geo = new THREE.IcosahedronGeometry(0.5, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: '#3a3f5c',
      roughness: 0.9,
      metalness: 0.15,
      flatShading: true,
    });
    this.asteroids = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    for (let i = 0; i < count; i++) {
      e.set(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28));
      q.setFromEuler(e);
      const s = rand(0.25, 1.4);
      // Belt scattered along the mid-journey (y −40 … −70)
      m.compose(
        new THREE.Vector3(rand(-26, 26), rand(-72, -40), rand(-34, -4)),
        q,
        new THREE.Vector3(s, s * rand(0.7, 1.3), s)
      );
      this.asteroids.setMatrixAt(i, m);
    }
    // Lights only exist for the asteroids (planet/stars are shader-lit).
    const key = new THREE.DirectionalLight('#8fb4ff', 2.2);
    key.position.set(-6, 4, 8);
    const fill = new THREE.AmbientLight('#221a44', 1.4);
    this.scene.add(this.asteroids, key, fill);
  }

  /** Scroll-driven flight path (home page). Both curves are sampled with the
   *  eased scroll value; look-at trails behind the position for a natural
   *  "banking" feel. */
  private buildCameraPath() {
    this.pathPos = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 0, 18), //   hero — planet horizon below
        new THREE.Vector3(3.5, -16, 10), // diving past the planet limb
        new THREE.Vector3(-4, -36, 2), //  through the nebula heart
        new THREE.Vector3(2, -56, -4), //  into the asteroid belt
        new THREE.Vector3(0, -80, -2), //  deep field — showcase
        new THREE.Vector3(0, -102, 4), //  footer — drifting out
      ],
      false,
      'catmullrom',
      0.35
    );
    this.pathLook = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, -3, -12),
        new THREE.Vector3(0, -22, -14),
        new THREE.Vector3(-6, -44, -30),
        new THREE.Vector3(4, -62, -26),
        new THREE.Vector3(0, -90, -34),
        new THREE.Vector3(0, -116, -20),
      ],
      false,
      'catmullrom',
      0.35
    );
  }

  /** UnrealBloomPass — imported on demand so the low tier never pays for it */
  private async initBloom() {
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }] = await Promise.all([
        import('three/examples/jsm/postprocessing/EffectComposer.js'),
        import('three/examples/jsm/postprocessing/RenderPass.js'),
        import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
      ]);
      if (this.disposed) return;
      const composer = new EffectComposer(this.renderer);
      composer.addPass(new RenderPass(this.scene, this.camera));
      const size = this.renderer.getSize(new THREE.Vector2());
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(size.x / 2, size.y / 2), // half-res = cheap + soft
        0.55, // strength — subtle, cinematic
        0.85, // radius — wide soft halo
        0.82 // threshold — only genuinely bright pixels bloom
      );
      composer.addPass(bloom);
      this.composer = composer;
    } catch {
      this.composer = null; // fall back to plain rendering silently
    }
  }

  /* ── event handlers ─────────────────────────────────────────────────── */

  private onResize = () => this.resize();

  private onPointer = (e: PointerEvent) => {
    this.pointerTarget.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      (e.clientY / window.innerHeight) * 2 - 1
    );
  };

  private onScroll = () => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    this.scrollTarget = Math.min(1, Math.max(0, window.scrollY / max));
  };

  private onVisibility = () => {
    this.running = document.visibilityState === 'visible';
    if (this.running && !this.disposed) {
      this.clock.getDelta(); // swallow the pause so nothing jumps
      this.loop();
    }
  };

  private resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, this.quality.dprCap);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.starMat.uniforms.uPixelRatio.value = dpr;
    this.composer?.setSize(w, h);
  }

  /* ── public API ─────────────────────────────────────────────────────── */

  setMode(mode: CosmosMode) {
    this.mode = mode;
    this.onScroll(); // re-measure page height for the new route
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('scroll', this.onScroll);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.scene.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(m)) m.forEach(x => x.dispose());
      else m?.dispose();
    });
    this.renderer.dispose();
  }

  /* ── frame loop ─────────────────────────────────────────────────────── */

  private updateComets(dt: number, t: number) {
    for (const c of this.comets) {
      if (!c.active) {
        c.cooldown -= dt;
        if (c.cooldown <= 0) {
          // Spawn near the camera's current slice of the world.
          const camY = this.camera.position.y;
          const dir = Math.random() > 0.5 ? 1 : -1;
          c.mesh.position.set(dir * rand(18, 30), camY + rand(2, 14), rand(-38, -22));
          c.vel.set(-dir * rand(26, 40), -rand(6, 14), 0);
          c.maxLife = rand(1.1, 1.9);
          c.life = 0;
          c.active = true;
          c.mesh.visible = true;
          // Rotate the quad so its long axis matches the velocity.
          c.mesh.rotation.z = Math.atan2(c.vel.y, c.vel.x);
        }
        continue;
      }
      c.life += dt;
      const k = c.life / c.maxLife;
      if (k >= 1) {
        c.active = false;
        c.mesh.visible = false;
        c.cooldown = rand(3, 9);
        c.mat.uniforms.uFade.value = 0;
        continue;
      }
      c.mesh.position.addScaledVector(c.vel, dt);
      // Fade envelope: quick in, slow out — reads like a real meteor.
      c.mat.uniforms.uFade.value = Math.sin(Math.min(1, k) * Math.PI) * 0.9;
    }
  }

  private adaptQuality(dt: number) {
    if (!this.composer) return;
    this.frameSamples.push(dt);
    if (this.frameSamples.length < 140) return;
    const avg = this.frameSamples.reduce((a, b) => a + b, 0) / this.frameSamples.length;
    this.frameSamples = [];
    if (avg > 1 / 38) {
      // Can't hold ~38fps with bloom → drop it, then retest.
      this.composer = null;
    }
  }

  private loop = () => {
    if (this.disposed || !this.running) return;
    this.raf = requestAnimationFrame(this.loop);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    // Exponential smoothing: frame-rate independent, silky interpolation.
    const ease = 1 - Math.exp(-dt * 4.2);
    const easeFast = 1 - Math.exp(-dt * 6.5);
    this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * ease;
    this.pointerCurrent.lerp(this.pointerTarget, easeFast * 0.6);

    // Journey (home): fly the path. Ambient (other pages): hold the top,
    // with a soft ease between the two whenever the route changes.
    const targetReturn = this.mode === 'journey' ? 0 : 1;
    this.ambientReturn += (targetReturn - this.ambientReturn) * ease;

    const s = this.scrollCurrent * (1 - this.ambientReturn);
    const pos = this.pathPos.getPoint(s);
    const look = this.pathLook.getPoint(s);

    // Autonomous drift — tiny lissajous wobble so the frame never sits still.
    const driftX = Math.sin(t * 0.11) * 0.55;
    const driftY = Math.cos(t * 0.07) * 0.4;

    // Mouse parallax — camera leans toward the cursor ("floating" feel).
    const px = this.pointerCurrent.x * 0.9;
    const py = -this.pointerCurrent.y * 0.55;

    this.camera.position.set(pos.x + driftX + px, pos.y + driftY + py, pos.z);
    this.camera.lookAt(look.x + px * 2.2, look.y + py * 1.6, look.z);

    // Slow star-dome rotation adds parallax even when idle.
    this.stars.rotation.y = t * 0.004;

    this.starMat.uniforms.uTime.value = t;
    for (const m of this.nebulaMats) m.uniforms.uTime.value += dt;
    this.planetMats[0].uniforms.uTime.value = t;
    this.planetGroup.rotation.y = t * 0.015;
    if (this.asteroids) this.asteroids.rotation.y = Math.sin(t * 0.02) * 0.3;

    this.updateComets(dt, t);
    this.adaptQuality(dt);

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  };
}

/** Pick a quality tier from very cheap heuristics (no benchmark needed). */
export function detectQuality(): CosmosQuality {
  if (typeof window === 'undefined') return QUALITY_LOW;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const smallScreen = window.innerWidth < 820;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  if (coarse || smallScreen || mem <= 4 || cores <= 4) return QUALITY_LOW;
  return QUALITY_HIGH;
}
