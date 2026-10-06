"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { setTheme } from "@/lib/theme";

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const BELL_VERT = /* glsl */ `
uniform float uTime;
uniform float uPulse;
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
void main() {
  vec3 p = position;
  float h = clamp((p.y + 0.1) / 1.16, 0.0, 1.0);
  float low = 1.0 - h;
  float ang = atan(p.z, p.x);
  // swimming contraction: margin squeezes in, dome lifts a little
  p.xz *= 1.0 - uPulse * 0.11 * pow(low, 1.2);
  p.y  *= 1.0 + uPulse * 0.035;
  // soft ripple along the bell margin
  p.y += sin(ang * 7.0 + uTime * 2.0) * 0.012 * pow(low, 3.0) * (0.5 + 0.5 * uPulse);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  vP = position;
  gl_Position = projectionMatrix * mv;
}`;

const BELL_FRAG = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
uniform float uTime;
uniform float uFade;
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(vV);
  float fr = pow(1.0 - clamp(abs(dot(N, V)), 0.0, 1.0), 2.2);

  float h = clamp((vP.y + 0.1) / 1.16, 0.0, 1.0);
  float ang = atan(vP.z, vP.x);

  vec3 top = vec3(0.50, 0.58, 1.00);
  vec3 mid = vec3(0.50, 0.84, 1.00);
  vec3 rim = vec3(0.88, 0.98, 1.00);
  vec3 col = mix(mid, top, h * h);
  col = mix(col, rim, fr);

  // radial canals running from crown to margin
  float canal = pow(abs(cos(ang * 8.0)), 60.0) * smoothstep(0.02, 0.15, h) * (1.0 - smoothstep(0.9, 1.0, h));
  // fine muscle striations near the margin
  float stria = (0.5 + 0.5 * sin(vP.y * 70.0)) * (1.0 - smoothstep(0.0, 0.45, h)) * 0.08;
  // speckled nematocyst warts on the exumbrella
  float spots = step(0.988, hash(floor(vP * 36.0))) * (1.0 - fr * 0.5);
  // glowing margin band
  float band = 1.0 - smoothstep(0.0, 0.16, vP.y + 0.1);

  float wave = 0.5 + 0.5 * sin(h * 10.0 - uTime * 3.5); // light travelling down the canals
  col += canal * vec3(0.45, 0.65, 1.0) * (0.35 + 0.9 * wave);
  col += spots * vec3(0.9, 1.0, 1.0) * 0.8;
  col += band * vec3(0.95, 0.65, 1.0) * 0.55;
  col += stria;

  float alpha = 0.2 + fr * 0.6 + canal * 0.3 + spots * 0.5 + band * 0.45;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.92) * uFade);
}`;

const STRAND_VERT = /* glsl */ `
uniform float uTime;
uniform float uPulse;
varying float vDepth;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 p = position;
  float d = clamp(-p.y, 0.0, 4.0);
  // waves travelling down the tentacles, growing toward the tips
  p.x += sin(uTime * 1.3 + p.y * 2.3 + p.z * 2.0) * 0.045 * d;
  p.z += cos(uTime * 1.1 + p.y * 2.0 + p.x * 2.0) * 0.045 * d;
  // follow the bell's contraction near the base
  p.xz *= 1.0 - uPulse * 0.11 * (1.0 - smoothstep(0.0, 1.4, d));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = d;
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const STRAND_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uColor2;
uniform float uAlpha;
uniform float uLen;
uniform float uBead;
uniform float uTime;
uniform float uFade;
varying float vDepth;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  float fr = pow(1.0 - clamp(abs(dot(N, normalize(vV))), 0.0, 1.0), 1.5);
  float k = smoothstep(0.0, uLen, vDepth);
  vec3 col = mix(uColor, uColor2, k);
  float bead = pow(0.5 + 0.5 * sin(vDepth * 42.0), 8.0) * uBead;
  col += bead * 0.5;
  // bioluminescent pulses running down the tentacles
  float glow = pow(0.5 + 0.5 * sin(vDepth * 5.0 - uTime * 3.0), 6.0) * (1.0 - k);
  col += glow * vec3(0.6, 0.9, 1.0) * 0.6;
  float a = uAlpha * (0.4 + 0.6 * fr) * (1.0 - k * 0.85) + bead * 0.25 * (1.0 - k) + glow * 0.3;
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uFade);
}`;

const HALO_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const HALO_FRAG = /* glsl */ `
varying vec2 vUv;
void main() {
  float d = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
  float a = pow(1.0 - d, 2.6) * 0.2;
  gl_FragColor = vec4(0.35, 0.72, 1.0, a);
}`;

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

function makeBell() {
  const profile = [
    [0, 1.06], [.18, 1.05], [.38, .99], [.61, .83], [.78, .58],
    [.86, .29], [.88, .04], [.83, -.09], [.7, -.13], [.54, -.09], [.32, -.035], [0, -.01],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(profile, 96);
}

/** Many thin marginal tentacles + a few long trailing ones, merged into one mesh. */
function makeTentacles() {
  const tubes: THREE.BufferGeometry[] = [];
  const marginal = 52;
  for (let i = 0; i < marginal; i++) {
    const a = (i / marginal) * Math.PI * 2;
    const L = 1.3 + ((i * 7) % 5) * 0.16;
    const pts = Array.from({ length: 11 }, (_, j) => {
      const t = j / 10;
      const r = .83 - .12 * t;
      return new THREE.Vector3(
        Math.cos(a) * r + Math.sin(t * 6 + i * 1.7) * .05 * t,
        -.08 - L * t,
        Math.sin(a) * r + Math.cos(t * 5 + i * 1.3) * .05 * t,
      );
    });
    tubes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, .008, 4, false));
  }
  const trailing = 10;
  for (let i = 0; i < trailing; i++) {
    const a = (i / trailing) * Math.PI * 2 + .2;
    const L = 2.2 + (i % 3) * .2;
    const pts = Array.from({ length: 12 }, (_, j) => {
      const t = j / 11;
      const r = .62 - .3 * t;
      return new THREE.Vector3(
        Math.cos(a) * r + Math.sin(t * 7 + i) * .09 * t,
        -.1 - L * t,
        Math.sin(a) * r + Math.cos(t * 6 + i) * .09 * t,
      );
    });
    tubes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 36, .013, 4, false));
  }
  const merged = mergeGeometries(tubes, false);
  tubes.forEach((t) => t.dispose());
  if (!merged) throw new Error("Unable to build jellyfish tentacles");
  return merged;
}

/** Frilly, ruffled oral arm (flat ribbon with a twist). */
function makeOralArm(i: number) {
  const a = i * Math.PI / 2 + .4;
  const segs = 70, across = 4;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= segs; j++) {
    const t = j / segs;
    const r = .1 + .16 * t;
    const cx = Math.cos(a) * r + Math.sin(t * 9 + i * 2) * .09 * t;
    const cy = -.12 - 2.0 * t;
    const cz = Math.sin(a) * r + Math.cos(t * 8 + i * 2) * .09 * t;
    const w = .2 * (1 - t * .75) * (.7 + .3 * Math.sin(t * 14 + i));
    const twist = a + t * 3 + i;
    const px = -Math.sin(twist), pz = Math.cos(twist);
    for (let k = 0; k <= across; k++) {
      const s = k / across * 2 - 1;
      const ruffle = Math.sin(t * 46 + i * 3 + s * 2) * .035 * Math.abs(s) * (.3 + t);
      pos.push(cx + px * s * w + pz * ruffle, cy, cz + pz * s * w - px * ruffle);
      uv.push(k / across, t);
    }
  }
  for (let j = 0; j < segs; j++) {
    for (let k = 0; k < across; k++) {
      const p0 = j * (across + 1) + k, p1 = p0 + 1, p2 = p0 + across + 1, p3 = p2 + 1;
      idx.push(p0, p2, p1, p1, p2, p3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Jellyfish                                                           */
/* ------------------------------------------------------------------ */

type Shared = { uTime: { value: number }; uPulse: { value: number } };

function strandMaterial(
  shared: Shared,
  o: { color: string; color2: string; alpha: number; len: number; bead: number; fade?: number },
) {
  return new THREE.ShaderMaterial({
    vertexShader: STRAND_VERT,
    fragmentShader: STRAND_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      ...shared,
      uColor: { value: new THREE.Color(o.color) },
      uColor2: { value: new THREE.Color(o.color2) },
      uAlpha: { value: o.alpha },
      uLen: { value: o.len },
      uBead: { value: o.bead },
      uFade: { value: o.fade ?? 1 },
    },
  });
}

/** Fast contraction, slow relaxation (0..1). */
function swimPulse(time: number) {
  const ph = (time * 0.6) % 1;
  const rest = Math.exp(-2.3);
  return ph < 0.28
    ? Math.sin((ph / 0.28) * Math.PI * 0.5)
    : (Math.exp(-(ph - 0.28) * 3.2) - rest) / (1 - rest);
}

function Jellyfish({ expanded, still, burst }: { expanded: boolean; still: boolean; burst: number }) {
  const body = useRef<THREE.Group>(null);
  const tendrils = useRef<THREE.Group>(null);
  const oralArms = useRef<THREE.Group>(null);

  const follow = useRef({ x: 0, y: 0, boost: 0 });
  useEffect(() => { if (burst) follow.current.boost = 1; }, [burst]);

  const shared = useMemo<Shared>(() => ({ uTime: { value: 0 }, uPulse: { value: 0 } }), []);

  const assets = useMemo(() => {
    const bell = makeBell();
    const tentacles = makeTentacles();
    const arms = Array.from({ length: 4 }, (_, i) => makeOralArm(i));
    const bellMat = new THREE.ShaderMaterial({
      vertexShader: BELL_VERT,
      fragmentShader: BELL_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { ...shared, uFade: { value: 1 } },
    });
    const tentacleMat = strandMaterial(shared, { color: "#C9F4FF", color2: "#E3B8FF", alpha: 0.8, len: 2.4, bead: 0.7 });
    const armMat = strandMaterial(shared, { color: "#E6D5FF", color2: "#9CC8FF", alpha: 0.6, len: 2.2, bead: 0 });
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: HALO_VERT, fragmentShader: HALO_FRAG, transparent: true, depthWrite: false,
    });
    return { bell, tentacles, arms, bellMat, tentacleMat, armMat, haloMat };
  }, [shared]);

  useEffect(() => () => {
    Object.values(assets).forEach((v) => {
      if (Array.isArray(v)) v.forEach((g) => g.dispose());
      else v.dispose();
    });
  }, [assets]);

  useFrame(({ clock, pointer, camera }, rawDelta) => {
    if (!body.current || !tendrils.current || !oralArms.current || still) return;
    const dt = Math.min(rawDelta, .05);
    const time = clock.elapsedTime;
    const f = follow.current;
    const k = 1 - Math.exp(-3 * dt);
    f.x += (pointer.x - f.x) * k;
    f.y += (pointer.y - f.y) * k;
    f.boost = Math.max(0, f.boost - dt * .7);
    const pulse = swimPulse(time);
    shared.uTime.value = time;
    shared.uPulse.value = pulse * (1 + f.boost * .8);

    // follows the cursor, tilts toward it, jets upward on click
    body.current.rotation.y += dt * (.35 + f.boost * 1.6);
    body.current.rotation.x = .13 - f.y * .15;
    body.current.rotation.z = Math.sin(time * .45) * .12 - f.x * .18;
    body.current.position.x = f.x * .6;
    body.current.position.y = .8 + Math.sin(time * 1.1) * .12 + pulse * .1 + f.y * .35 + f.boost * .35;
    oralArms.current.rotation.y = Math.sin(time * .7) * .18;
    tendrils.current.rotation.y = Math.sin(time * .5) * .05;
    body.current.scale.setScalar(THREE.MathUtils.damp(body.current.scale.x, expanded ? 1.3 : 1, 5, dt));

    // gentle camera parallax against the backdrop
    camera.position.x += (f.x * .4 - camera.position.x) * (1 - Math.exp(-3 * dt));
    camera.position.y += (f.y * .25 - camera.position.y) * (1 - Math.exp(-3 * dt));
    camera.lookAt(0, .2, 0);
  });

  return (
    <>
      <group ref={body} rotation={[.13, -.45, -.22]} position={[0, .8, 0]} scale={expanded && still ? 1.3 : 1}>
        <group ref={oralArms}>
          {assets.arms.map((g, i) => <mesh key={i} geometry={g} material={assets.armMat} />)}
        </group>
        <group ref={tendrils}>
          <mesh geometry={assets.tentacles} material={assets.tentacleMat} />
        </group>
        <mesh geometry={assets.bell} material={assets.bellMat} />
      </group>
    </>
  );
}

const P_VERT = /* glsl */ `uniform float uTime;uniform float uSpeed;uniform float uSize;uniform float uScale;attribute float aRand;varying float vA;
void main(){vec3 p=position;
p.y=mod(p.y+3.0+uTime*uSpeed*(0.5+aRand),6.0)-3.0;
p.x+=sin(uTime*0.35+aRand*40.0)*0.15;
vec4 mv=modelViewMatrix*vec4(p,1.0);
gl_PointSize=max(uSize*(0.5+aRand)*uScale/-mv.z,1.0);
vA=smoothstep(-3.0,-2.3,p.y)*(1.0-smoothstep(2.3,3.0,p.y))*(0.3+0.7*aRand);
gl_Position=projectionMatrix*mv;}`;
const P_FRAG = /* glsl */ `uniform float uDark;uniform float uRing;varying float vA;
void main(){float d=length(gl_PointCoord-0.5)*2.0;if(d>1.0)discard;
float soft=pow(1.0-d,1.5);
float ring=smoothstep(0.55,0.9,d)*(1.0-smoothstep(0.9,1.0,d))*0.9+0.08;
float a=mix(soft,ring,uRing);
vec3 c=mix(vec3(0.29,0.56,0.78),vec3(0.74,0.92,1.0),uDark);
gl_FragColor=vec4(c,a*vA*mix(0.8,0.7,uDark));}`;
const R_VERT = /* glsl */ `varying vec2 vUv;varying float vPh;
void main(){vUv=uv;vPh=modelMatrix[3].x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const R_FRAG = /* glsl */ `uniform float uTime;uniform float uDark;varying vec2 vUv;varying float vPh;
void main(){float a=smoothstep(0.0,0.5,vUv.x)*smoothstep(1.0,0.5,vUv.x);
a*=pow(vUv.y,1.6);a*=0.6+0.4*sin(uTime*0.4+vPh*2.0);
vec3 c=mix(vec3(0.55,0.78,0.95),vec3(0.35,0.75,1.0),uDark);
gl_FragColor=vec4(c,a*mix(0.22,0.12,uDark));}`;

type BgUniforms = { uTime: { value: number }; uDark: { value: number }; uScale: { value: number } };

function makeParticles(u: BgUniforms, n: number, speed: number, size: number, ring: boolean) {
  const pos = new Float32Array(n * 3), rnd = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - .5) * 9;
    pos[i * 3 + 1] = (Math.random() - .5) * 6;
    pos[i * 3 + 2] = -3 + Math.random() * 4;
    rnd[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
  const material = new THREE.ShaderMaterial({
    vertexShader: P_VERT, fragmentShader: P_FRAG, transparent: true, depthWrite: false,
    uniforms: { uTime: u.uTime, uDark: u.uDark, uScale: u.uScale, uSpeed: { value: speed }, uSize: { value: size }, uRing: { value: ring ? 1 : 0 } },
  });
  return { geometry, material };
}

/** Underwater backdrop: soft light rays, drifting marine snow and rising bubbles. */
function Backdrop({ still }: { still: boolean }) {
  const u = useMemo<BgUniforms>(() => ({ uTime: { value: 0 }, uDark: { value: 0 }, uScale: { value: 300 } }), []);
  const bg = useMemo(() => {
    const snow = makeParticles(u, 220, -.06, .03, false);
    const bubbles = makeParticles(u, 18, .25, .09, true);
    const rayGeos = [0, 1, 2, 3, 4].map((i) => new THREE.PlaneGeometry(1 + (i % 2) * .6, 9));
    const rayMat = new THREE.ShaderMaterial({
      vertexShader: R_VERT, fragmentShader: R_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uTime: u.uTime, uDark: u.uDark },
    });
    return { snow, bubbles, rayGeos, rayMat };
  }, [u]);

  useEffect(() => () => {
    bg.snow.geometry.dispose(); bg.snow.material.dispose();
    bg.bubbles.geometry.dispose(); bg.bubbles.material.dispose();
    bg.rayGeos.forEach((g) => g.dispose()); bg.rayMat.dispose();
  }, [bg]);

  useFrame(({ clock, size, gl }, dt) => {
    if (!still) u.uTime.value = clock.elapsedTime;
    const dark = document.documentElement.classList.contains("dark") ? 1 : 0;
    u.uDark.value += (dark - u.uDark.value) * Math.min(1, dt * 4);
    u.uScale.value = size.height * gl.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(21)));
  });

  return (
    <>
      {bg.rayGeos.map((g, i) => (
        <mesh key={i} geometry={g} material={bg.rayMat} position={[-3.5 + i * 1.75, .3, -2.5]} rotation={[0, 0, -.3 + (i % 3) * .06]} renderOrder={-1} />
      ))}
      <points geometry={bg.snow.geometry} material={bg.snow.material} renderOrder={-1} frustumCulled={false} />
      <points geometry={bg.bubbles.geometry} material={bg.bubbles.material} renderOrder={-1} frustumCulled={false} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Distant swarm of small jellyfish                                    */
/* ------------------------------------------------------------------ */

const MINIS = [{ x: -3.0, y: -1.5, z: -3.2, s: 0.45, sp: 0.1, ph: 0.5 },{ x: -1.7, y: 1.9, z: -4.2, s: 0.35, sp: 0.16, ph: 2.1 },{ x: 2.9, y: -1.9, z: -3.6, s: 0.5, sp: 0.08, ph: 3.7 },{ x: 1.9, y: 1.5, z: -4.6, s: 0.4, sp: 0.14, ph: 5.2 },{ x: -3.4, y: 0.3, z: -5.0, s: 0.3, sp: 0.12, ph: 1.3 },{ x: 3.5, y: 0.4, z: -4.8, s: 0.32, sp: 0.18, ph: 4.4 }];

function makeMiniTentacles() {
  const tubes = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const L = 1 + ((i * 5) % 4) * .2;
    const pts = Array.from({ length: 8 }, (_, j) => {
      const t = j / 7, r = .83 - .15 * t;
      return new THREE.Vector3(Math.cos(a) * r + Math.sin(t * 5 + i) * .05 * t, -.08 - L * t, Math.sin(a) * r + Math.cos(t * 4 + i) * .05 * t);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, .012, 4, false);
  });
  const merged = mergeGeometries(tubes, false);
  tubes.forEach((g) => g.dispose());
  if (!merged) throw new Error("Unable to build jellyfish tentacles");
  return merged;
}

function Swarm({ still }: { still: boolean }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const swarm = useMemo(() => {
    const bellGeo = makeBell();
    const tentGeo = makeMiniTentacles();
    const items = MINIS.map(() => {
      const u: Shared = { uTime: { value: 0 }, uPulse: { value: 0 } };
      const bellMat = new THREE.ShaderMaterial({
        vertexShader: BELL_VERT, fragmentShader: BELL_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide,
        uniforms: { ...u, uFade: { value: .4 } },
      });
      const tentMat = strandMaterial(u, { color: "#C9F4FF", color2: "#E3B8FF", alpha: .8, len: 1.6, bead: .5, fade: .4 });
      return { u, bellMat, tentMat };
    });
    return { bellGeo, tentGeo, items };
  }, []);

  useEffect(() => () => {
    swarm.bellGeo.dispose(); swarm.tentGeo.dispose();
    swarm.items.forEach((m) => { m.bellMat.dispose(); m.tentMat.dispose(); });
  }, [swarm]);

  useFrame(({ clock }) => {
    const T = still ? 0 : clock.elapsedTime;
    MINIS.forEach((m, i) => {
      const g = groups.current[i];
      if (!g) return;
      const it = swarm.items[i];
      if (!it) return;
      const p = swimPulse(T * (.75 + m.sp) + m.ph);
      it.u.uTime.value = T;
      it.u.uPulse.value = p;
      const y = (((m.y + T * (.12 + m.sp * .1) + 3.4) % 6.8) + 6.8) % 6.8 - 3.4;
      g.position.set(m.x + Math.sin(T * .3 + m.ph) * .25, y, m.z);
      g.rotation.set(0, T * .3 + m.ph, Math.sin(T * .4 + m.ph) * .15);
      const fade = .4 * THREE.MathUtils.smoothstep(y, -3.4, -2.6) * (1 - THREE.MathUtils.smoothstep(y, 2.6, 3.4));
      const bellFade = it.bellMat.uniforms['uFade'];
      const tentacleFade = it.tentMat.uniforms['uFade'];
      if (bellFade) bellFade.value = fade;
      if (tentacleFade) tentacleFade.value = fade;
    });
  });

  return (
    <>
      {swarm.items.map((it, i) => (
        <group key={i} ref={(g) => { groups.current[i] = g; }} scale={MINIS[i]?.s ?? .35}>
          <mesh geometry={swarm.bellGeo} material={it.bellMat} renderOrder={-1} />
          <mesh geometry={swarm.tentGeo} material={it.tentMat} renderOrder={-1} />
        </group>
      ))}
    </>
  );
}

export function DriftingJellyfish() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [away, setAway] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [still, setStill] = useState(false);
  const [burst, setBurst] = useState(0);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 600px)");
    let frame = 0;
    let previous = 0;
    let current: { x: number; y: number; size: number } | undefined;
    const tick = (time: number) => {
      const element = button.current;
      if (element && phone.matches) {
        const slot = pathname === "/" ? document.querySelector(".jelly-hero-slot") : null;
        const rect = slot?.getBoundingClientRect();
        const inHero = Boolean(rect && rect.bottom > 100 && rect.top < window.innerHeight - 40);
        const size = inHero ? 260 : 64;
        const target = inHero && rect
          ? { x: rect.left + (rect.width - size) / 2, y: rect.top + (rect.height - size) / 2, size }
          : { x: window.innerWidth - size - 10, y: window.innerHeight - size - 12, size };
        current ??= target;
        const dt = Math.min((time - previous) / 1000 || .016, .05);
        const k = still ? 1 : 1 - Math.exp(-12 * dt);
        current.x += (target.x - current.x) * k;
        current.y += (target.y - current.y) * k;
        current.size += (target.size - current.size) * k;
        element.style.left = `${current.x}px`;
        element.style.top = `${current.y}px`;
        element.style.width = `${current.size}px`;
        element.style.height = `${current.size}px`;
      } else if (element) {
        element.style.removeProperty("left"); element.style.removeProperty("top");
        element.style.removeProperty("width"); element.style.removeProperty("height");
        current = undefined;
      }
      previous = time;
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, still]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setStill(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);
  useEffect(() => {
    const update = () => setAway(pathname !== "/" || window.scrollY > window.innerHeight * .62);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [pathname]);

  return <Button ref={button} type="button" variant="ghost" className={`jelly-float ${away ? "jelly-float-small" : ""}`} onClick={(event) => {
    setExpanded((value) => !value);
    setBurst((value) => value + 1);
    setTheme(!document.documentElement.classList.contains("dark"), { x: event.clientX, y: event.clientY });
  }} aria-label="Toggle dark mode with jellyfish" title="Toggle dark mode with jellyfish">
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.NoToneMapping }}
    >
      <Backdrop still={still} />
      <Swarm still={still} />
      <Jellyfish expanded={expanded} still={still} burst={burst} />
    </Canvas>
  </Button>;
}
