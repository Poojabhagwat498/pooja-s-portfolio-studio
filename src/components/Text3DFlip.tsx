"use client";

import { useEffect, useRef } from "react";

/** Keeps a readable static heading until motion is mounted in the browser. */
export default function Text3DFlip({ children }: { children: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import("gsap").then(({ gsap }) => {
      if (disposed || !root.current) return;
      const context = gsap.context(() => {
        gsap.fromTo(".text-flip-letter", { rotationX: 90, opacity: 0 }, {
          rotationX: 0, opacity: 1, duration: 1.15,
          ease: "elastic.out(1, 0.65)", stagger: 0.03, delay: 0.35,
        });
      }, root);
      cleanup = () => context.revert();
    });
    return () => { disposed = true; cleanup?.(); };
  }, []);

  return <span ref={root} className="text-3d-flip" aria-label={children}>
    {children.split(" ").map((word, index) => <span className="text-flip-word" aria-hidden="true" key={`${word}-${index}`}>
      {Array.from(word).map((letter, position) => <span className="text-flip-letter" key={position}>{letter}</span>)}
    </span>)}
  </span>;
}