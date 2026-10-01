import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Lightformer, Environment } from "@react-three/drei";
import { useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

const TENTACLES = Array.from({ length: 18 }, (_, i) => i);

function Jellyfish({ expanded, still }: { expanded: boolean; still: boolean }) {
  const body = useRef<THREE.Group>(null);
  const crown = useRef<THREE.Group>(null);
  const tendrils = useRef<THREE.Group>(null);
  const bell = useMemo(() => {
    const profile = [
      [0, 1.06], [.18, 1.05], [.38, .99], [.61, .83], [.78, .58],
      [.86, .29], [.88, .04], [.83, -.09], [.7, -.13], [.54, -.09], [.32, -.035], [0, -.01],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(profile, 64);
  }, []);
  const strands = useMemo(() => TENTACLES.map((i) => {
    const a = (i / TENTACLES.length) * Math.PI * 2;
    const outer = i < 10;
    const radius = outer ? .75 : .28;
    const length = outer ? 2.15 + (i % 4) * .18 : 2.8 + (i % 3) * .23;
    const points = Array.from({ length: 9 }, (_, j) => {
      const t = j / 8;
      return new THREE.Vector3(
        Math.cos(a) * (radius + t * (outer ? .18 : .33)) + Math.sin(t * 7 + i) * t * .105,
        -.1 - length * t,
        Math.sin(a) * (radius + t * (outer ? .18 : .33)) + Math.cos(t * 6 + i) * t * .105,
      );
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, outer ? .014 : .025, 5, false);
  }), []);

  useEffect(() => () => {
    bell.dispose();
    strands.forEach((strand) => strand.dispose());
  }, [bell, strands]);

  useFrame(({ clock }, rawDelta) => {
    if (!body.current || !crown.current || !tendrils.current || still) return;
    const dt = Math.min(rawDelta, .05);
    const time = clock.elapsedTime;
    body.current.rotation.y += dt * .48;
    body.current.rotation.z = Math.sin(time * .45) * .16;
    body.current.position.y = Math.sin(time * 1.1) * .18;
    crown.current.scale.set(1 + Math.sin(time * 2.2) * .035, 1 - Math.sin(time * 2.2) * .065, 1 + Math.sin(time * 2.2) * .035);
    tendrils.current.rotation.z = Math.sin(time * 1.3) * .07;
    tendrils.current.rotation.x = Math.cos(time * .9) * .075;
    body.current.scale.setScalar(THREE.MathUtils.damp(body.current.scale.x, expanded ? 1.3 : 1, 5, dt));
  });

  return (
    <group ref={body} rotation={[.13, -.45, -.22]} position={[0, .9, 0]} scale={expanded && still ? 1.3 : 1}>
      <group ref={crown}>
        <mesh geometry={bell}>
          <meshPhysicalMaterial color="#C9F4FF" emissive="#377CC4" emissiveIntensity={.27} transparent opacity={.47} side={THREE.DoubleSide} roughness={.22} metalness={.12} depthWrite={false} />
        </mesh>
        <mesh position={[0, .42, 0]} scale={[.67, .46, .67]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshPhysicalMaterial color="#F0FDFF" emissive="#98DCFF" emissiveIntensity={.4} transparent opacity={.26} depthWrite={false} />
        </mesh>
        {Array.from({ length: 16 }, (_, i) => {
          const angle = i / 16 * Math.PI * 2;
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 1.04, 0),
            new THREE.Vector3(Math.cos(angle) * .42, .94, Math.sin(angle) * .42),
            new THREE.Vector3(Math.cos(angle) * .78, .5, Math.sin(angle) * .78),
            new THREE.Vector3(Math.cos(angle) * .86, -.08, Math.sin(angle) * .86),
          ]);
          return <mesh key={i} geometry={new THREE.TubeGeometry(curve, 24, .009, 4, false)}>
            <meshBasicMaterial color="#C6F3FF" transparent opacity={.64} depthWrite={false} />
          </mesh>;
        })}
        <mesh position-y={-.08} rotation-x={Math.PI / 2}>
          <torusGeometry args={[.81, .026, 8, 64]} />
          <meshBasicMaterial color="#B8F0FF" transparent opacity={.8} depthWrite={false} />
        </mesh>
      </group>
      <group ref={tendrils}>
        {strands.map((geometry, i) => <mesh key={i} geometry={geometry}>
          <meshBasicMaterial color={i % 3 === 0 ? "#B7F8FF" : "#5ACBFF"} transparent opacity={i < 10 ? .72 : .47} depthWrite={false} />
        </mesh>)}
      </group>
    </group>
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

  return <Button type="button" variant="ghost" className={`jelly-float ${away ? "jelly-float-small" : ""}`} onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Shrink jellyfish" : "Enlarge jellyfish"} title={expanded ? "Shrink jellyfish" : "Enlarge jellyfish"}>
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, .35, 6.7], fov: 42 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.15} />
      <pointLight position={[-2, 3, 3]} color="#C9F4FF" intensity={28} />
      <pointLight position={[3, -1, -2]} color="#377CC4" intensity={24} />
      <Environment><Lightformer intensity={2} color="#C9F4FF" position={[0, 3, 3]} scale={[5, 3, 1]} /></Environment>
      <Jellyfish expanded={expanded} still={still} />
    </Canvas>
  </Button>;
}