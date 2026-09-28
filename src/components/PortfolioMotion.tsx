import { useEffect } from "react";

/** Scroll-linked decoration only: all content remains visible without JavaScript. */
export function PortfolioMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      const sections = document.querySelectorAll<HTMLElement>(".portfolio .section, .portfolio .now, .portfolio .contact");
      const cards = document.querySelectorAll<HTMLElement>(".portfolio .work-item");
      const headings = document.querySelectorAll<HTMLElement>(".portfolio .section-heading, .portfolio .now h2, .portfolio .contact h2");
      const stats = document.querySelectorAll<HTMLElement>(".portfolio [data-count]");
      const animations: Array<{ kill: () => void }> = [];

      headings.forEach((heading) => {
        const animation = gsap.fromTo(heading, { y: 46, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: heading, start: "top 92%", once: true },
        });
        animations.push(animation);
      });
      sections.forEach((section) => {
        const targets = section.querySelectorAll<HTMLElement>(".section-label, .about-copy, .role, .principle, .skill-card, .education-item, .contact-line");
        if (!targets.length) return;
        const animation = gsap.fromTo(targets, { y: 22, opacity: 0 }, {
          y: 0, opacity: 1, duration: .75, stagger: .06, ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        });
        animations.push(animation);
      });
      cards.forEach((card) => {
        const animation = gsap.fromTo(card, { y: 38, scale: .95, opacity: 0 }, {
          y: 0, scale: 1, opacity: 1, duration: .85, ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
        });
        animations.push(animation);
      });
      stats.forEach((stat) => {
        const target = Number(stat.dataset.count);
        if (!Number.isFinite(target)) return;
        const value = { current: 0 };
        const animation = gsap.to(value, {
          current: target, duration: 1.5, ease: "power2.out",
          onUpdate: () => { stat.textContent = String(Math.round(value.current)).padStart(2, "0"); },
          scrollTrigger: { trigger: stat, start: "top 94%", once: true },
        });
        animations.push(animation);
      });
      cleanup = () => {
        animations.forEach((animation) => {
          animation.kill();
          // GSAP kills its associated ScrollTrigger when the tween is killed.
        });
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return null;
}