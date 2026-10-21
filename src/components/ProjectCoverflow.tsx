import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, ArrowRight, Calendar, Code2, RotateCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/portfolio-data";
import { InteractiveProjectButton } from "@/components/InteractiveProjectButton";
import { ProjectFilter } from "@/components/ProjectFilter";
import {
  type FilterMode,
  STACK_FILTERS,
  TYPE_FILTERS,
  matchesSearchQuery,
} from "@/lib/project-filter";

export function ProjectCoverflow() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<FilterMode>("stack");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProjects = useMemo(() => {
    const options = mode === "stack" ? STACK_FILTERS : TYPE_FILTERS;
    const activeOption = options.find((o) => o.id === selectedFilter) ?? options[0];

    return projects.filter((p) => {
      const matchesCategory = activeOption ? activeOption.matches(p) : true;
      const matchesSearch = matchesSearchQuery(p, searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [mode, selectedFilter, searchQuery]);

  const count = filteredProjects.length;

  // Reset or clamp active index when filter/search changes
  useEffect(() => {
    setActive(0);
  }, [mode, selectedFilter, searchQuery]);

  const go = (d: number) => {
    if (count <= 1) return;
    setActive((i) => (i + d + count) % count);
  };

  const current = filteredProjects[active];

  const handleReset = () => {
    setSelectedFilter("all");
    setSearchQuery("");
  };

  return (
    <section
      id="projects"
      className="section page-gutter coverflow"
      aria-labelledby="case-gallery-title"
    >
      <div className="coverflow-header">
        <p className="section-label">// CASE STUDIES</p>
        <h2 id="case-gallery-title" className="display section-heading">
          EVERY PROJECT,
          <br />
          CASE BY CASE.
        </h2>
        <p className="coverflow-intro">
          Explore full-stack platforms, AI-powered applications, and digital storefronts. Filter by
          technology stack, project type, or search for specific keywords.
        </p>
      </div>

      {/* Filter and Search System */}
      <ProjectFilter
        mode={mode}
        onModeChange={setMode}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allProjects={projects}
        filteredCount={count}
        onReset={handleReset}
      />

      {count > 0 && current ? (
        <>
          <div
            key={`stage-${mode}-${selectedFilter}-${searchQuery}`}
            className="coverflow-stage project-fade-in"
            tabIndex={0}
            role="region"
            aria-label="Projects carousel, use arrow keys"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(1);
              if (e.key === "ArrowLeft") go(-1);
            }}
          >
            {filteredProjects.map((p, i) => {
              let off = i - active;
              if (count > 2) {
                if (off > count / 2) off -= count;
                if (off < -count / 2) off += count;
              }
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
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy" />
                  ) : (
                    <span className="display">{p.name}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div
            key={`info-${mode}-${selectedFilter}-${searchQuery}`}
            className="coverflow-info project-fade-in"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => go(-1)}
              disabled={count <= 1}
              aria-label="Previous project"
            >
              <ArrowLeft />
            </Button>
            <div>
              <p className="mono">
                {current.index} / {current.kind}
              </p>
              <h2 className="display">{current.name}</h2>
              <p className="coverflow-tagline">{current.tagline}</p>

              {current.stats && (
                <div className="project-stats-strip" aria-label="Project metrics">
                  <span className="project-stat-pill" title="Lines of Code">
                    <Code2 size={13} aria-hidden="true" />
                    <span className="tabular-nums">{current.stats.linesOfCode}</span>
                  </span>
                  <span className="stat-separator" aria-hidden="true">
                    ·
                  </span>
                  <span className="project-stat-pill" title="Completion Date">
                    <Calendar size={13} aria-hidden="true" />
                    <span>{current.stats.completionDate}</span>
                  </span>
                  <span className="stat-separator" aria-hidden="true">
                    ·
                  </span>
                  <span className="project-stat-pill" title="Team Size">
                    <Users size={13} aria-hidden="true" />
                    <span>{current.stats.teamSize}</span>
                  </span>
                </div>
              )}

              <InteractiveProjectButton id={current.id} label="View project" />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => go(1)}
              disabled={count <= 1}
              aria-label="Next project"
            >
              <ArrowRight />
            </Button>
          </div>
        </>
      ) : (
        <div
          key={`empty-${mode}-${selectedFilter}-${searchQuery}`}
          className="coverflow-empty project-fade-in"
          role="status"
        >
          <p className="section-label">// NO MATCHES FOUND</p>
          <h3 className="display">NO PROJECTS FOUND.</h3>
          <p>
            No projects match &ldquo;{searchQuery}&rdquo; under the selected filter. Try adjusting
            your search term or resetting the filter.
          </p>
          <Button variant="outline" onClick={handleReset} className="mt-4">
            <RotateCcw size={14} className="mr-2" />
            Reset search and filters
          </Button>
        </div>
      )}
    </section>
  );
}
