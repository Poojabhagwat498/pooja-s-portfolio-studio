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

  col += canal * vec3(0.45, 0.65, 1.0) * 0.55;
  col += spots * vec3(0.9, 1.0, 1.0) * 0.8;
  col += band * vec3(0.95, 0.65, 1.0) * 0.55;
  col += stria;

  float alpha = 0.2 + fr * 0.6 + canal * 0.3 + spots * 0.5 + band * 0.45;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.92));
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
  float a = uAlpha * (0.4 + 0.6 * fr) * (1.0 - k * 0.85) + bead * 0.25 * (1.0 - k);
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
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
  o: { color: string; color2: string; alpha: number; len: number; bead: number },
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

function Jellyfish({ expanded, still }: { expanded: boolean; still: boolean }) {
  const body = useRef<THREE.Group>(null);
  const tendrils = useRef<THREE.Group>(null);
  const oralArms = useRef<THREE.Group>(null);

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
      uniforms: { ...shared },
    });
    const tentacleMat = strandMaterial(shared, { color: "#C9F4FF", color2: "#E3B8FF", alpha: 0.8, len: 2.4, bead: 0.7 });
    const armMat = strandMaterial(shared, { color: "#E6D5FF", color2: "#9CC8FF", alpha: 0.6, len: 2.2, bead: 0 });
    return { bell, tentacles, arms, bellMat, tentacleMat, armMat };
  }, [shared]);

  useEffect(() => () => {
    Object.values(assets).forEach((v) => {
      if (Array.isArray(v)) v.forEach((g) => g.dispose());
      else v.dispose();
    });
  }, [assets]);

  useFrame(({ clock }, rawDelta) => {
    if (!body.current || !tendrils.current || !oralArms.current || still) return;
    const dt = Math.min(rawDelta, .05);
    const t = clock.elapsedTime;
    const pulse = swimPulse(t);
    shared.uTime.value = t;
    shared.uPulse.value = pulse;

    body.current.rotation.y += dt * .35;
    body.current.rotation.z = Math.sin(t * .45) * .12;
    body.current.position.y = .8 + Math.sin(t * 1.1) * .12 + pulse * .1;
    oralArms.current.rotation.y = Math.sin(t * .7) * .18;
    tendrils.current.rotation.y = Math.sin(t * .5) * .05;
    body.current.scale.setScalar(THREE.MathUtils.damp(body.current.scale.x, expanded ? 1.3 : 1, 5, dt));
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

export function DriftingJellyfish() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [away, setAway] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [still, setStill] = useState(false);

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

  return <Button type="button" variant="ghost" className={`jelly-float ${away ? "jelly-float-small" : ""}`} onClick={(event) => {
    setExpanded((value) => !value);
    setTheme(!document.documentElement.classList.contains("dark"), { x: event.clientX, y: event.clientY });
  }} aria-label="Toggle dark mode with jellyfish" title="Toggle dark mode with jellyfish">
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.NoToneMapping }}
    >
      <Jellyfish expanded={expanded} still={still} />
    </Canvas>
  </Button>;
}
