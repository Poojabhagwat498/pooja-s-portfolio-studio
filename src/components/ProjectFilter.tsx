import { Layers, LayoutGrid, RotateCcw } from "lucide-react";
import type { Project } from "@/lib/portfolio-data";

export type FilterMode = "stack" | "type";

export type FilterOption = {
  id: string;
  label: string;
  matches: (project: Project) => boolean;
};

export const STACK_FILTERS: FilterOption[] = [
  {
    id: "all",
    label: "All Stacks",
    matches: () => true,
  },
  {
    id: "mern",
    label: "MERN Stack",
    matches: (p) =>
      p.kind.toUpperCase().includes("MERN") ||
      (p.caseStudy.stack.some((s) => s.toLowerCase().includes("mongo")) &&
        p.caseStudy.stack.some((s) => s.toLowerCase().includes("react"))),
  },
  {
    id: "nextjs",
    label: "Next.js & SQL",
    matches: (p) =>
      p.kind.toUpperCase().includes("NEXT") ||
      p.caseStudy.stack.some(
        (s) =>
          s.toLowerCase().includes("next") ||
          s.toLowerCase().includes("postgres") ||
          s.toLowerCase().includes("prisma"),
      ),
  },
  {
    id: "react-express",
    label: "React & Express",
    matches: (p) =>
      p.caseStudy.stack.some((s) => s.toLowerCase().includes("express")) &&
      p.caseStudy.stack.some((s) => s.toLowerCase().includes("react")),
  },
  {
    id: "ai-realtime",
    label: "AI & Real-Time",
    matches: (p) =>
      p.kind.toUpperCase().includes("AI") ||
      p.caseStudy.stack.some(
        (s) =>
          s.toLowerCase().includes("gemini") ||
          s.toLowerCase().includes("socket") ||
          s.toLowerCase().includes("webrtc"),
      ),
  },
];

export const TYPE_FILTERS: FilterOption[] = [
  {
    id: "all",
    label: "All Types",
    matches: () => true,
  },
  {
    id: "ecommerce",
    label: "E-Commerce",
    matches: (p) =>
      p.kind.toUpperCase().includes("COMMERCE") ||
      p.tagline.toLowerCase().includes("shopping") ||
      p.tagline.toLowerCase().includes("store"),
  },
  {
    id: "ai-education",
    label: "AI & Learning",
    matches: (p) =>
      p.kind.toUpperCase().includes("AI") ||
      p.name.toLowerCase().includes("learning") ||
      p.tagline.toLowerCase().includes("study"),
  },
  {
    id: "platform",
    label: "Social Platform",
    matches: (p) =>
      p.kind.toUpperCase().includes("MATRIMONY") ||
      p.kind.toUpperCase().includes("PLATFORM"),
  },
];

type ProjectFilterProps = {
  mode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
  allProjects: Project[];
  filteredCount: number;
  onReset: () => void;
};

export function ProjectFilter({
  mode,
  onModeChange,
  selectedFilter,
  onSelectFilter,
  allProjects,
  filteredCount,
  onReset,
}: ProjectFilterProps) {
  const currentOptions = mode === "stack" ? STACK_FILTERS : TYPE_FILTERS;

  return (
    <div className="project-filter-container" role="region" aria-label="Project filter options">
      {/* Primary Categorization Dimension Toggle */}
      <div className="project-filter-header">
        <div className="filter-mode-toggle" role="tablist" aria-label="Categorization criteria">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "stack"}
            className={`filter-mode-btn ${mode === "stack" ? "is-active" : ""}`}
            onClick={() => {
              onModeChange("stack");
              onSelectFilter("all");
            }}
          >
            <Layers size={13} aria-hidden="true" />
            <span>Technology Stack</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "type"}
            className={`filter-mode-btn ${mode === "type" ? "is-active" : ""}`}
            onClick={() => {
              onModeChange("type");
              onSelectFilter("all");
            }}
          >
            <LayoutGrid size={13} aria-hidden="true" />
            <span>Project Type</span>
          </button>
        </div>

        {/* Filter Summary & Quick Reset */}
        <div className="filter-status-info mono">
          <span>
            {filteredCount} of {allProjects.length} projects
          </span>
          {selectedFilter !== "all" && (
            <button
              type="button"
              onClick={onReset}
              className="filter-reset-btn"
              title="Reset to all projects"
              aria-label="Clear active filter"
            >
              <RotateCcw size={11} aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div className="filter-chips-row" role="group" aria-label="Select category filter">
        {currentOptions.map((opt) => {
          const count =
            opt.id === "all"
              ? allProjects.length
              : allProjects.filter((p) => opt.matches(p)).length;
          const isSelected = selectedFilter === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              className={`filter-chip ${isSelected ? "is-active" : ""}`}
              onClick={() => onSelectFilter(opt.id)}
              aria-pressed={isSelected}
            >
              <span className="filter-chip-label">{opt.label}</span>
              <span className="filter-chip-count mono">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
