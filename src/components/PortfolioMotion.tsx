import { useEffect } from "react";

/** Scroll-linked decoration only: all content remains visible without JavaScript. */
export function PortfolioMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);

        const sections = document.querySelectorAll<HTMLElement>(
          ".portfolio .section, .portfolio .now, .portfolio .contact",
        );
        const cards = document.querySelectorAll<HTMLElement>(
          ".portfolio .work-item, .portfolio .blog-card",
        );
        const headings = document.querySelectorAll<HTMLElement>(
          ".portfolio .section-heading, .portfolio .now h2, .portfolio .contact h2",
        );
        const stats = document.querySelectorAll<HTMLElement>(".portfolio [data-count]");
        const transitions = document.querySelectorAll<HTMLElement>(
          ".portfolio .about-grid, .portfolio .skills-grid, .portfolio .principles, .portfolio .now, .portfolio .contact, .portfolio .blog-feed, .portfolio .contact-location",
        );
        const animations: Array<{ kill: () => void }> = [];

        const hero = document.querySelector<HTMLElement>(".portfolio .hero");
        if (hero) {
          const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
          heroTimeline
            .fromTo(
              hero.querySelector(".hero-kicker"),
              { y: 14, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45 },
            )
            .fromTo(
              hero.querySelectorAll(".hero-role, .hero-top .tag-row, .hero-actions, .hero-stats"),
              { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.65, stagger: 0.08 },
              "-=.55",
            )
            .fromTo(
              hero.querySelectorAll(
                ".hero-statement p, .hero-statement h2, .hero-side-rail, .hero-meta",
              ),
              { y: 34, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
              "-=.65",
            );
          animations.push(heroTimeline);
        }

        headings.forEach((heading) => {
          const animation = gsap.fromTo(
            heading,
            { y: 46, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: heading, start: "top 92%", once: true },
            },
          );
          animations.push(animation);
        });
        sections.forEach((section) => {
          const targets = section.querySelectorAll<HTMLElement>(
            ".section-label, .about-portrait, .about-lead, .about-copy, .about-actions, .role, .principle, .skill-card, .education-item, .now-grid > div, .contact-line, .contact-copy, .contact-form, .blog-intro, .blog-empty",
          );
          if (!targets.length) return;
          const animation = gsap.fromTo(
            targets,
            { y: 22, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              stagger: 0.06,
              ease: "power2.out",
              scrollTrigger: { trigger: section, start: "top 78%", once: true },
            },
          );
          animations.push(animation);
        });
        cards.forEach((card) => {
          const animation = gsap.fromTo(
            card,
            {
              x: card.matches(".work-item") ? 55 : 0,
              y: card.matches(".blog-card") ? 38 : 0,
              scale: 0.95,
              opacity: 0,
            },
            {
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 90%", once: true },
            },
          );
          animations.push(animation);
        });
        transitions.forEach((section) => {
          const animation = gsap.fromTo(
            section,
            { y: 34, borderTopLeftRadius: 58, borderTopRightRadius: 58 },
            {
              y: 0,
              borderTopLeftRadius: 36,
              borderTopRightRadius: 36,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: { trigger: section, start: "top 94%", once: true },
            },
          );
          animations.push(animation);
        });
        stats.forEach((stat) => {
          const target = Number(stat.dataset["count"]);
          if (!Number.isFinite(target)) return;
          const value = { current: 0 };
          const animation = gsap.to(value, {
            current: target,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
              stat.textContent = String(Math.round(value.current)).padStart(2, "0");
            },
            scrollTrigger: { trigger: stat, start: "top 94%", once: true },
          });
          animations.push(animation);
        });
        if (window.matchMedia("(min-width: 901px)").matches) {
          document.querySelectorAll<HTMLElement>(".portfolio .principles").forEach((section) => {
            const trigger = ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "+=140",
              pin: true,
              anticipatePin: 1,
            });
            animations.push(trigger);
          });
        }
        const pointerCleanup = cleanup;
        cleanup = () => {
          pointerCleanup?.();
          animations.forEach((animation) => animation.kill());
        };
      },
    );

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return null;
}
