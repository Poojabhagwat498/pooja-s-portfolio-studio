import { useEffect, useRef, useState } from "react";

/**
 * ScrollProgressBar
 * A small, subtle progress bar fixed to the top of the viewport
 * that visualizes the current scroll progress through long-form sections.
 * Uses requestAnimationFrame and transform: scaleX for 60/120fps compositor execution.
 */
export function ScrollProgressBar() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let rafId: number | null = null;

    const updateScrollProgress = () => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
      const scrollHeight = Math.max(
        doc.scrollHeight,
        body.scrollHeight,
        doc.offsetHeight,
        body.offsetHeight,
        doc.clientHeight,
      );
      const clientHeight = window.innerHeight || doc.clientHeight || 0;
      const maxScroll = scrollHeight - clientHeight;

      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      const percent = Math.round(progress * 100);

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
        barRef.current.style.opacity = progress > 0 ? "1" : "0";
      }

      if (containerRef.current) {
        containerRef.current.setAttribute("aria-valuenow", String(percent));
      }
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        updateScrollProgress();
        rafId = null;
      });
    };

    // Initial calculation after layout settles
    updateScrollProgress();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Re-check periodically during initial load/animations in case images expand page height
    const initialCheckTimer = setTimeout(updateScrollProgress, 400);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      clearTimeout(initialCheckTimer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="scroll-progress-container"
      role="progressbar"
      aria-label="Scroll position"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div ref={barRef} className="scroll-progress-bar" />
    </div>
  );
}
