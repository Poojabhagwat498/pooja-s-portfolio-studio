import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/portfolio-data";

export function ProjectCoverflow() {
  const [active, setActive] = useState(0);
  const count = projects.length;
  const go = (d: number) => setActive((i) => (i + d + count) % count);
  const current = projects[active];

  return (
    <section className="section page-gutter coverflow" aria-label="Project gallery">
      <p className="section-label">// GALLERY</p>
      <div
        className="coverflow-stage"
        tabIndex={0}
        role="region"
        aria-label="Projects carousel, use arrow keys"
        onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
      >
        {projects.map((p, i) => {
          let off = i - active;
          if (off > count / 2) off -= count;
          if (off < -count / 2) off += count;
          const abs = Math.abs(off);
          return (
            <button
              key={p.id}
              type="button"
              className="coverflow-card"
              aria-label={`Show ${p.name}`}
              aria-current={off === 0}
              onClick={() => setActive(i)}
              style={{
                transform: `translateX(${off * 58}%) translateZ(${-abs * 160}px) rotateY(${off * -38}deg)`,
                zIndex: 10 - abs,
                opacity: abs > 2 ? 0 : 1 - abs * 0.25,
              }}
            >
              {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <span className="display">{p.name}</span>}
            </button>
          );
        })}
      </div>
      <div className="coverflow-info">
        <Button variant="outline" size="icon" onClick={() => go(-1)} aria-label="Previous project"><ArrowLeft /></Button>
        <div>
          <p className="mono">{current.index} / {current.kind}</p>
          <h2 className="display">{current.name}</h2>
          <Button asChild className="mt-3">
            <Link to="/projects/$id" params={{ id: current.id }}>Open full project <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={() => go(1)} aria-label="Next project"><ArrowRight /></Button>
      </div>
    </section>
  );
}
