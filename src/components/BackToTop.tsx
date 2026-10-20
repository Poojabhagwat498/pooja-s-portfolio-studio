import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * BackToTop
 * Floating button that appears only after the user has scrolled past the hero section.
 * Features a smooth entrance/exit transition, frosted glass styling, and an ArrowUp icon.
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const checkScroll = () => {
      // Look for the main hero or page header
      const hero = document.querySelector<HTMLElement>(
        ".hero, .portfolio-hero, .blog-hero, .contact-hero, .project-header",
      );

      let threshold = 480;
      if (hero) {
        const heroRect = hero.getBoundingClientRect();
        // Calculate hero bottom relative to document top
        const heroBottom = heroRect.bottom + window.scrollY;
        // Trigger after the user has scrolled past the hero section
        threshold = Math.max(250, heroBottom - 80);
      } else {
        threshold = window.innerHeight * 0.6;
      }

      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      setIsVisible(currentScroll > threshold);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        checkScroll();
        rafId = null;
      });
    };

    // Initial check
    checkScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: isReduced ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`back-to-top ${isVisible ? "is-visible" : ""}`}
      aria-label="Back to top of page"
      title="Back to top"
    >
      <ArrowUp size={15} aria-hidden="true" className="back-to-top-icon" />
      <span className="back-to-top-label">Top</span>
    </button>
  );
}
