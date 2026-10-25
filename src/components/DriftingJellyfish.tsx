"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRouterState } from "@tanstack/react-router";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { THEME_EVENT } from "@/lib/theme";

/* ------------------------------------------------------------------ */
/* Section accent colors — the jellyfish shifts glow to match          */
/* ------------------------------------------------------------------ */

const SECTION_ACCENTS_LIGHT: { id: string; glow: THREE.Color; label: string }[] = [
  { id: "top", glow: new THREE.Color("#2563EB"), label: "Hi!" },
  { id: "about", glow: new THREE.Color("#2563EB"), label: "About" },
  { id: "experience", glow: new THREE.Color("#7C3AED"), label: "Experience" },
  { id: "skills", glow: new THREE.Color("#10B981"), label: "Skills" },
  { id: "achievements", glow: new THREE.Color("#F59E0B"), label: "Awards" },
  { id: "contact", glow: new THREE.Color("#EC4899"), label: "Contact" },
];

const SECTION_ACCENTS_DARK: { id: string; glow: THREE.Color; label: string }[] = [
  { id: "top", glow: new THREE.Color("#00F5D4"), label: "Hi!" }, // Bioluminescent aqua
  { id: "about", glow: new THREE.Color("#38BDF8"), label: "About" }, // Electric sky cyan
  { id: "experience", glow: new THREE.Color("#C084FC"), label: "Experience" }, // Luminous orchid
  { id: "skills", glow: new THREE.Color("#34D399"), label: "Skills" }, // Radiant neon mint
  { id: "achievements", glow: new THREE.Color("#FBBF24"), label: "Awards" }, // Golden glow
  { id: "contact", glow: new THREE.Color("#F472B6"), label: "Contact" }, // Bioluminescent neon rose
];

const FUN_FACTS = [
  "Pooja is a state-level chess player in the U-17 and U-18 categories.",
  "She won multiple inter-college chess tournaments during her diploma.",
  "She built the official Smart India Hackathon 2025 platforms with Node.js.",
  "Her CGPA is 8.76 / 10 in B.Tech Computer Science & Engineering.",
  "She holds a diploma in Computer Engineering with 84.29%.",
];

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const BELL_VERT = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform vec3 uGlow;
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
void main() {
  vec3 p = position;
  float h = clamp((p.y + 0.1) / 1.16, 0.0, 1.0);
  float low = 1.0 - h;
  float ang = atan(p.z, p.x);
  p.xz *= 1.0 - uPulse * 0.11 * pow(low, 1.2);
  p.y  *= 1.0 + uPulse * 0.035;
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
uniform vec3 uGlow;
uniform float uBoost;
uniform float uDark;
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

  // In light mode: soft daylight blue/lavender tones.
  // In dark mode: radiant deep-sea bioluminescent cyan, violet, and electric neon hues.
  vec3 topLight = mix(vec3(0.50, 0.58, 1.00), uGlow, 0.35);
  vec3 midLight = mix(vec3(0.50, 0.84, 1.00), uGlow, 0.28);
  vec3 rimLight = mix(vec3(0.88, 0.98, 1.00), uGlow, 0.15);

  vec3 topDark  = mix(vec3(0.08, 0.12, 0.48), uGlow, 0.82);
  vec3 midDark  = mix(vec3(0.00, 0.72, 0.92), uGlow, 0.76);
  vec3 rimDark  = mix(vec3(0.40, 0.98, 1.00), uGlow, 0.88);

  vec3 top = mix(topLight, topDark, uDark);
  vec3 mid = mix(midLight, midDark, uDark);
  vec3 rim = mix(rimLight, rimDark, uDark);
  vec3 col = mix(mid, top, h * h);
  col = mix(col, rim, fr);
  col += uDark * uGlow * 0.42;

  float canal = pow(abs(cos(ang * 8.0)), 60.0) * smoothstep(0.02, 0.15, h) * (1.0 - smoothstep(0.9, 1.0, h));
  float stria = (0.5 + 0.5 * sin(vP.y * 70.0)) * (1.0 - smoothstep(0.0, 0.45, h)) * 0.08;
  float spots = step(0.988, hash(floor(vP * 36.0))) * (1.0 - fr * 0.5);
  float band = 1.0 - smoothstep(0.0, 0.16, vP.y + 0.1);

  float wave = 0.5 + 0.5 * sin(h * 10.0 - uTime * 3.5);
  vec3 canalTint = mix(mix(vec3(0.45, 0.65, 1.0), vec3(0.1, 0.95, 0.95), uDark), uGlow, 0.55);
  col += canal * canalTint * (0.35 + 0.9 * wave + uDark * 0.45);
  col += spots * mix(vec3(0.9, 1.0, 1.0), vec3(0.6, 1.0, 0.92), uDark) * (0.8 + uDark * 0.5);
  col += band * mix(vec3(0.95, 0.65, 1.0), uGlow, 0.5 + uDark * 0.35) * (0.55 + uBoost * 0.6 + uDark * 0.3);
  col += stria;
  col += uBoost * uGlow * 0.25;

  float alpha = 0.2 + fr * 0.6 + canal * 0.3 + spots * 0.5 + band * 0.45 + uBoost * 0.1 + uDark * 0.22;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.96) * uFade);
}`;

const STRAND_VERT = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform float uFlare;
varying float vDepth;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 p = position;
  float d = clamp(-p.y, 0.0, 4.0);
  float spread = 1.0 + uFlare * 0.5;
  p.x += sin(uTime * 1.3 + p.y * 2.3 + p.z * 2.0) * 0.045 * d * spread;
  p.z += cos(uTime * 1.1 + p.y * 2.0 + p.x * 2.0) * 0.045 * d * spread;
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
uniform vec3 uGlow;
uniform float uAlpha;
uniform float uLen;
uniform float uBead;
uniform float uTime;
uniform float uFade;
uniform float uFlare;
uniform float uDark;
varying float vDepth;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  float fr = pow(1.0 - clamp(abs(dot(N, normalize(vV))), 0.0, 1.0), 1.5);
  float k = smoothstep(0.0, uLen, vDepth);
  vec3 baseCol = mix(uColor, uColor2, k);
  vec3 darkCol = mix(vec3(0.05, 0.88, 0.98), vec3(0.78, 0.40, 0.98), k);
  vec3 col = mix(baseCol, darkCol, uDark * 0.85);
  col = mix(col, uGlow, (uFlare * 0.4 + uDark * 0.55) * (1.0 - k));
  float bead = pow(0.5 + 0.5 * sin(vDepth * 42.0), 8.0) * uBead;
  col += bead * (0.5 + uDark * 0.5);
  float glow = pow(0.5 + 0.5 * sin(vDepth * 5.0 - uTime * 3.0), 6.0) * (1.0 - k);
  col += glow * mix(vec3(0.6, 0.9, 1.0), uGlow, 0.4 + uDark * 0.45) * (0.6 + uFlare * 0.5 + uDark * 0.4);
  col += uDark * uGlow * 0.35 * (1.0 - k);
  float a = uAlpha * (0.4 + 0.6 * fr) * (1.0 - k * 0.85) + bead * 0.25 * (1.0 - k) + glow * 0.3 + uFlare * 0.15 + uDark * 0.22 * (1.0 - k);
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uFade);
}`;

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

function makeBell() {
  const profile = [
    [0, 1.06],
    [0.18, 1.05],
    [0.38, 0.99],
    [0.61, 0.83],
    [0.78, 0.58],
    [0.86, 0.29],
    [0.88, 0.04],
    [0.83, -0.09],
    [0.7, -0.13],
    [0.54, -0.09],
    [0.32, -0.035],
    [0, -0.01],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(profile, 96);
}

function makeTentacles() {
  const tubes: THREE.BufferGeometry[] = [];
  const marginal = 52;
  for (let i = 0; i < marginal; i++) {
    const a = (i / marginal) * Math.PI * 2;
    const L = 1.3 + ((i * 7) % 5) * 0.16;
    const pts = Array.from({ length: 11 }, (_, j) => {
      const t = j / 10;
      const r = 0.83 - 0.12 * t;
      return new THREE.Vector3(
        Math.cos(a) * r + Math.sin(t * 6 + i * 1.7) * 0.05 * t,
        -0.08 - L * t,
        Math.sin(a) * r + Math.cos(t * 5 + i * 1.3) * 0.05 * t,
      );
    });
    tubes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.008, 4, false));
  }
  const trailing = 10;
  for (let i = 0; i < trailing; i++) {
    const a = (i / trailing) * Math.PI * 2 + 0.2;
    const L = 2.2 + (i % 3) * 0.2;
    const pts = Array.from({ length: 12 }, (_, j) => {
      const t = j / 11;
      const r = 0.62 - 0.3 * t;
      return new THREE.Vector3(
        Math.cos(a) * r + Math.sin(t * 7 + i) * 0.09 * t,
        -0.1 - L * t,
        Math.sin(a) * r + Math.cos(t * 6 + i) * 0.09 * t,
      );
    });
    tubes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 36, 0.013, 4, false));
  }
  const merged = mergeGeometries(tubes, false);
  tubes.forEach((t) => t.dispose());
  if (!merged) throw new Error("Unable to build jellyfish tentacles");
  return merged;
}

function makeOralArm(i: number) {
  const a = (i * Math.PI) / 2 + 0.4;
  const segs = 70,
    across = 4;
  const pos: number[] = [],
    uv: number[] = [],
    idx: number[] = [];
  for (let j = 0; j <= segs; j++) {
    const t = j / segs;
    const r = 0.1 + 0.16 * t;
    const cx = Math.cos(a) * r + Math.sin(t * 9 + i * 2) * 0.09 * t;
    const cy = -0.12 - 2.0 * t;
    const cz = Math.sin(a) * r + Math.cos(t * 8 + i * 2) * 0.09 * t;
    const w = 0.2 * (1 - t * 0.75) * (0.7 + 0.3 * Math.sin(t * 14 + i));
    const twist = a + t * 3 + i;
    const px = -Math.sin(twist),
      pz = Math.cos(twist);
    for (let k = 0; k <= across; k++) {
      const s = (k / across) * 2 - 1;
      const ruffle = Math.sin(t * 46 + i * 3 + s * 2) * 0.035 * Math.abs(s) * (0.3 + t);
      pos.push(cx + px * s * w + pz * ruffle, cy, cz + pz * s * w - px * ruffle);
      uv.push(k / across, t);
    }
  }
  for (let j = 0; j < segs; j++) {
    for (let k = 0; k < across; k++) {
      const p0 = j * (across + 1) + k,
        p1 = p0 + 1,
        p2 = p0 + across + 1,
        p3 = p2 + 1;
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
      uGlow: { value: new THREE.Color("#2563EB") },
      uAlpha: { value: o.alpha },
      uLen: { value: o.len },
      uBead: { value: o.bead },
      uFlare: { value: 0 },
      uFade: { value: o.fade ?? 1 },
      uDark: { value: 0 },
    },
  });
}

function swimPulse(time: number) {
  const ph = (time * 0.6) % 1;
  const rest = Math.exp(-2.3);
  return ph < 0.28
    ? Math.sin((ph / 0.28) * Math.PI * 0.5)
    : (Math.exp(-(ph - 0.28) * 3.2) - rest) / (1 - rest);
}

function Jellyfish({
  expanded,
  still,
  burst,
  dart,
  flare,
  glow,
  fade,
  dark,
  cursor,
}: {
  expanded: boolean;
  still: boolean;
  burst: number;
  dart: { x: number; y: number; t: number } | null;
  flare: number;
  glow: THREE.Color;
  fade: number;
  dark: number;
  cursor: { x: number; y: number } | null;
}) {
  const body = useRef<THREE.Group>(null);
  const tendrils = useRef<THREE.Group>(null);
  const oralArms = useRef<THREE.Group>(null);

  const follow = useRef({ x: 0, y: 0, boost: 0 });
  useEffect(() => {
    if (burst) follow.current.boost = 1;
  }, [burst]);

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
      uniforms: {
        ...shared,
        uFade: { value: 1 },
        uGlow: { value: new THREE.Color("#2563EB") },
        uBoost: { value: 0 },
        uDark: { value: 0 },
      },
    });
    const tentacleMat = strandMaterial(shared, {
      color: "#C9F4FF",
      color2: "#E3B8FF",
      alpha: 0.8,
      len: 2.4,
      bead: 0.7,
    });
    const armMat = strandMaterial(shared, {
      color: "#E6D5FF",
      color2: "#9CC8FF",
      alpha: 0.6,
      len: 2.2,
      bead: 0,
    });
    return { bell, tentacles, arms, bellMat, tentacleMat, armMat };
  }, [shared]);

  useEffect(
    () => () => {
      Object.values(assets).forEach((v) => {
        if (Array.isArray(v)) v.forEach((g) => g.dispose());
        else v.dispose();
      });
    },
    [assets],
  );

  const dartRef = useRef(dart);
  dartRef.current = dart;

  useFrame(({ clock, pointer, camera }, rawDelta) => {
    if (!body.current || !tendrils.current || !oralArms.current) return;
    const dt = Math.min(rawDelta, 0.05);
    const time = clock.elapsedTime;
    const f = follow.current;

    // update glow color on all materials
    (assets.bellMat.uniforms.uGlow.value as THREE.Color).copy(glow);
    (assets.tentacleMat.uniforms.uGlow.value as THREE.Color).copy(glow);
    (assets.armMat.uniforms.uGlow.value as THREE.Color).copy(glow);

    // dark mode tint — richer glow on dark backgrounds
    assets.bellMat.uniforms.uDark.value = THREE.MathUtils.damp(
      assets.bellMat.uniforms.uDark.value as number,
      dark,
      4,
      dt,
    );
    assets.tentacleMat.uniforms.uDark.value = THREE.MathUtils.damp(
      assets.tentacleMat.uniforms.uDark.value as number,
      dark,
      4,
      dt,
    );
    assets.armMat.uniforms.uDark.value = THREE.MathUtils.damp(
      assets.armMat.uniforms.uDark.value as number,
      dark,
      4,
      dt,
    );

    // boost from CTA hover flare
    const targetBoost = flare;
    const curBoost = assets.bellMat.uniforms.uBoost.value as number;
    assets.bellMat.uniforms.uBoost.value = THREE.MathUtils.damp(curBoost, targetBoost, 6, dt);
    assets.tentacleMat.uniforms.uFlare.value = THREE.MathUtils.damp(
      assets.tentacleMat.uniforms.uFlare.value as number,
      flare,
      6,
      dt,
    );
    assets.armMat.uniforms.uFlare.value = THREE.MathUtils.damp(
      assets.armMat.uniforms.uFlare.value as number,
      flare,
      6,
      dt,
    );

    // fade (depth effect)
    assets.bellMat.uniforms.uFade.value = THREE.MathUtils.damp(
      assets.bellMat.uniforms.uFade.value as number,
      fade,
      5,
      dt,
    );
    assets.tentacleMat.uniforms.uFade.value = THREE.MathUtils.damp(
      assets.tentacleMat.uniforms.uFade.value as number,
      fade,
      5,
      dt,
    );
    assets.armMat.uniforms.uFade.value = THREE.MathUtils.damp(
      assets.armMat.uniforms.uFade.value as number,
      fade,
      5,
      dt,
    );

    if (still) {
      shared.uTime.value = time;
      shared.uPulse.value = 0;
      body.current.scale.setScalar(expanded ? 1.3 : 1);
      return;
    }

    // lazy cursor-follow with gentle easing — follows the actual mouse across the whole page
    const k = 1 - Math.exp(-2.2 * dt);
    let px = pointer.x,
      py = pointer.y;
    if (cursor) {
      px = cursor.x;
      py = cursor.y;
    }
    f.x += (px - f.x) * k;
    f.y += (py - f.y) * k;
    f.boost = Math.max(0, f.boost - dt * 0.7);

    const pulse = swimPulse(time);
    shared.uTime.value = time;
    shared.uPulse.value = pulse * (1 + f.boost * 0.8);

    // idle float + sway so it feels alive even without cursor
    const idleX = Math.sin(time * 0.5) * 0.08;
    const idleY = Math.sin(time * 0.7) * 0.06;

    // dart offset (click reaction): dart away then drift back
    let dartX = 0,
      dartY = 0;
    const d = dartRef.current;
    if (d && d.t > 0) {
      const decay = Math.max(0, d.t);
      dartX = d.x * decay;
      dartY = d.y * decay;
    }

    body.current.rotation.y += dt * (0.3 + f.boost * 1.6);
    body.current.rotation.x = 0.13 - f.y * 0.12;
    body.current.rotation.z = Math.sin(time * 0.35) * 0.1 - f.x * 0.14;
    body.current.position.x = f.x * 0.55 + idleX + dartX;
    body.current.position.y = 0.6 + idleY + pulse * 0.1 + f.y * 0.3 + f.boost * 0.35 + dartY;
    oralArms.current.rotation.y = Math.sin(time * 0.7) * 0.18;
    tendrils.current.rotation.y = Math.sin(time * 0.5) * 0.05;
    body.current.scale.setScalar(
      THREE.MathUtils.damp(body.current.scale.x, expanded ? 1.3 : 1, 5, dt),
    );

    // gentle camera parallax — wider framing so tentacles never clip at the edges
    camera.position.x += (f.x * 0.25 - camera.position.x) * (1 - Math.exp(-2.5 * dt));
    camera.position.y += (f.y * 0.15 - camera.position.y) * (1 - Math.exp(-2.5 * dt));
    camera.position.z = 7.4;
    camera.lookAt(0, 0.1, 0);
  });

  return (
    <>
      <group
        ref={body}
        rotation={[0.13, -0.45, -0.22]}
        position={[0, 0.6, 0]}
        scale={expanded && still ? 1.3 : 1}
      >
        <group ref={oralArms}>
          {assets.arms.map((g, i) => (
            <mesh key={i} geometry={g} material={assets.armMat} />
          ))}
        </group>
        <group ref={tendrils}>
          <mesh geometry={assets.tentacles} material={assets.tentacleMat} />
        </group>
        <mesh geometry={assets.bell} material={assets.bellMat} />
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Section tracker — find which section is in view                     */
/* ------------------------------------------------------------------ */

function useActiveSection() {
  const [activeId, setActiveId] = useState("top");
  useEffect(() => {
    const sections = ["top", "about", "experience", "skills", "achievements", "contact"]
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((s) => s.el) as { id: string; el: HTMLElement }[];
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75] },
    );
    sections.forEach((s) => observer.observe(s.el));
    return () => observer.disconnect();
  }, []);
  return activeId;
}

/* ------------------------------------------------------------------ */
/* Speech bubble — glassmorphism mascot messages                       */
/* ------------------------------------------------------------------ */

function JellyBubble({
  message,
  actions,
  onDismiss,
  position,
}: {
  message: string;
  actions?: { label: string; href?: string; onClick?: () => void }[];
  onDismiss: () => void;
  position: { left: number; top: number };
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 7000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="jelly-bubble"
      role="dialog"
      aria-label="Jellyfish message"
      style={{ left: position.left, top: position.top }}
    >
      <button className="jelly-bubble-close" aria-label="Dismiss message" onClick={onDismiss}>
        ×
      </button>
      <p className="jelly-bubble-text">{message}</p>
      {actions && actions.length > 0 && (
        <div className="jelly-bubble-actions">
          {actions.map((a) =>
            a.href ? (
              <a key={a.label} href={a.href} className="jelly-bubble-btn" onClick={onDismiss}>
                {a.label}
              </a>
            ) : (
              <button
                key={a.label}
                type="button"
                className="jelly-bubble-btn"
                onClick={() => {
                  a.onClick?.();
                  onDismiss();
                }}
              >
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function DriftingJellyfish() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [away, setAway] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [still, setStill] = useState(false);
  const [burst, setBurst] = useState(0);
  const [dart, setDart] = useState<{ x: number; y: number; t: number } | null>(null);
  const [flare, setFlare] = useState(0);
  const [bubble, setBubble] = useState<{
    message: string;
    actions?: { label: string; href?: string; onClick?: () => void }[];
  } | null>(null);
  const [bubblePos, setBubblePos] = useState({ left: 0, top: 0 });
  const [hidden, setHidden] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const button = useRef<HTMLDivElement>(null);
  const clickCount = useRef(0);
  const clickTimer = useRef<number | undefined>(undefined);
  const hasGreeted = useRef(false);

  const activeSection = useActiveSection();
  const glow = useMemo(() => {
    const list = isDark ? SECTION_ACCENTS_DARK : SECTION_ACCENTS_LIGHT;
    const found = list.find((s) => s.id === activeSection);
    return found ? found.glow : list[0].glow;
  }, [activeSection, isDark]);

  // depth fade — shrink and fade as you scroll past hero
  const fade = useMemo(() => {
    if (pathname !== "/") return 0.5;
    const sy = typeof window !== "undefined" ? window.scrollY : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const depth = Math.min(1, sy / (vh * 2));
    return 1 - depth * 0.55;
  }, [pathname]);

  /* Position the floating button — right side in hero, corner otherwise */
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
        const inHero = Boolean(rect && rect.top >= 80 && rect.top < window.innerHeight - 40);
        const size = inHero ? 260 : 72;
        const target =
          inHero && rect
            ? {
                x: rect.left + (rect.width - size) / 2,
                y: rect.top + (rect.height - size) / 2,
                size,
              }
            : { x: window.innerWidth - size - 12, y: window.innerHeight - size - 14, size };
        current ??= target;
        const dt = Math.min((time - previous) / 1000 || 0.016, 0.05);
        const k = still ? 1 : 1 - Math.exp(-9 * dt);
        current.x += (target.x - current.x) * k;
        current.y += (target.y - current.y) * k;
        current.size += (target.size - current.size) * k;
        element.style.left = `${current.x}px`;
        element.style.top = `${current.y}px`;
        element.style.width = `${current.size}px`;
        element.style.height = `${current.size}px`;
      } else if (element) {
        element.style.removeProperty("left");
        element.style.removeProperty("top");
        element.style.removeProperty("width");
        element.style.removeProperty("height");
        current = undefined;
      }
      previous = time;
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, still]);

  /* Reduced motion */
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setStill(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  /* Scroll → away state (corner) and depth tracking */
  useEffect(() => {
    const update = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      setAway(pathname !== "/" || sy > vh * 0.55);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  /* Pause when tab hidden */
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /* Track dark mode so the jellyfish recolors its glow */
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    window.addEventListener(THEME_EVENT, update);
    const observer = new MutationObserver(() => update());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener(THEME_EVENT, update);
      observer.disconnect();
    };
  }, []);

  /* Whole-page cursor following — the jellyfish button eases toward the mouse */
  useEffect(() => {
    if (still) return;
    const phone = window.matchMedia("(max-width: 600px)");
    if (phone.matches) return;
    let frame = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0, set: false };
    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!current.set) {
        current.x = e.clientX;
        current.y = e.clientY;
        current.set = true;
      }
      setCursor({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      });
    };
    const tick = () => {
      const el = button.current;
      if (el && current.set && !away) {
        el.classList.add("jelly-following");
        const k = 0.045;
        current.x += (target.x - current.x) * k;
        current.y += (target.y - current.y) * k;
        // offset so the jellyfish sits near the cursor but not on top of it
        const size = el.offsetWidth || 400;
        el.style.left = `${current.x - size * 0.5}px`;
        el.style.top = `${current.y - size * 0.45}px`;
        el.style.right = "auto";
      } else if (el) {
        el.classList.remove("jelly-following");
        el.style.left = "";
        el.style.top = "";
      }
      frame = window.requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [still, away]);

  /* Dart decay — click reaction drifts back over ~1.2s */
  useEffect(() => {
    if (!dart) return;
    let frame = 0;
    const start = performance.now();
    const decay = () => {
      const elapsed = (performance.now() - start) / 1200;
      if (elapsed >= 1) {
        setDart((d) => (d ? { ...d, t: 0 } : null));
        return;
      }
      setDart((d) => (d ? { ...d, t: Math.cos((elapsed * Math.PI) / 2) } : null));
      frame = window.requestAnimationFrame(decay);
    };
    frame = window.requestAnimationFrame(decay);
    return () => window.cancelAnimationFrame(frame);
  }, [burst]);

  /* CTA hover signals — jellyfish flares when hovering primary CTAs */
  useEffect(() => {
    const onEnter = () => setFlare(1);
    const onLeave = () => setFlare(0);
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      const cta = target.closest("[data-jelly-cta]");
      if (cta) {
        if (e.type === "mouseenter" || e.type === "focusin") onEnter();
        else onLeave();
      }
    };
    document.addEventListener("mouseover", handler);
    document.addEventListener("mouseout", handler);
    document.addEventListener("focusin", handler);
    document.addEventListener("focusout", handler);
    return () => {
      document.removeEventListener("mouseover", handler);
      document.removeEventListener("mouseout", handler);
      document.removeEventListener("focusin", handler);
      document.removeEventListener("focusout", handler);
    };
  }, []);

  /* Greeting bubble after 3.5s on first home load */
  useEffect(() => {
    if (pathname !== "/" || hasGreeted.current || still) return;
    hasGreeted.current = true;
    const timer = window.setTimeout(() => {
      const el = button.current;
      const rect = el?.getBoundingClientRect();
      if (rect) setBubblePos({ left: rect.left - 230, top: rect.top + rect.height * 0.25 });
      setBubble({
        message: "Hi! I'm here to show you around. Want to see my projects?",
        actions: [
          { label: "View Projects", href: "#projects" },
          { label: "Book a call", href: "/contact" },
        ],
      });
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [pathname, still]);

  /* Click handler — pulse, dart, and 3-click easter egg */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExpanded((v) => !v);
    setBurst((v) => v + 1);
    // dart in a random direction
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.4 + Math.random() * 0.3;
    setDart({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, t: 1 });

    // 3-click easter egg
    clickCount.current += 1;
    window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      clickCount.current = 0;
    }, 2500);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
      const el = button.current;
      const rect = el?.getBoundingClientRect();
      if (rect) setBubblePos({ left: rect.left - 230, top: rect.top + rect.height * 0.25 });
      setBubble({
        message: fact,
        actions: [{ label: "View résumé", href: "/Pooja-Bhagwat-Resume.pdf" }, { label: "Close" }],
      });
    }
    event.stopPropagation();
  };

  const effectiveStill = still || hidden;

  return (
    <>
      <div ref={button} className={`jelly-float ${away ? "jelly-float-small" : ""}`}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 7.4], fov: 38 }}
          gl={{ alpha: true, antialias: !away, toneMapping: THREE.NoToneMapping }}
          frameloop={effectiveStill ? "demand" : "always"}
        >
          <Jellyfish
            expanded={expanded}
            still={effectiveStill}
            burst={burst}
            dart={dart}
            flare={flare}
            glow={glow}
            fade={fade}
            dark={isDark ? 1 : 0}
            cursor={cursor}
          />
        </Canvas>
        <button
          type="button"
          className="jelly-pet"
          onClick={handleClick}
          aria-label="Pet the jellyfish — click for a surprise"
          title="Click me for a surprise"
        />
      </div>
      {bubble && (
        <JellyBubble
          message={bubble.message}
          actions={bubble.actions}
          onDismiss={() => setBubble(null)}
          position={bubblePos}
        />
      )}
    </>
  );
}
