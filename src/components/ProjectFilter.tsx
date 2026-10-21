import { Layers, LayoutGrid, RotateCcw, Search, X } from "lucide-react";
import type { Project } from "@/lib/portfolio-data";
import { type FilterMode, STACK_FILTERS, TYPE_FILTERS } from "@/lib/project-filter";

type ProjectFilterProps = {
  mode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allProjects: Project[];
  filteredCount: number;
  onReset: () => void;
};

export function ProjectFilter({
  mode,
  onModeChange,
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  allProjects,
  filteredCount,
  onReset,
}: ProjectFilterProps) {
  const currentOptions = mode === "stack" ? STACK_FILTERS : TYPE_FILTERS;
  const hasActiveFilters = selectedFilter !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="project-filter-container" role="region" aria-label="Project filter and search">
      {/* Search Input Bar */}
      <div className="project-search-bar">
        <label htmlFor="project-search" className="sr-only">
          Search projects
        </label>
        <div className="project-search-wrapper">
          <Search size={16} className="project-search-icon" aria-hidden="true" />
          <input
            id="project-search"
            type="search"
            className="project-search-input"
            placeholder="Search projects by title, description, or stack (e.g. MERN, store, AI)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="project-search-clear"
              aria-label="Clear search input"
              title="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Categorization Dimension Toggle & Summary Info */}
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
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="filter-reset-btn"
              title="Reset all filters"
              aria-label="Clear active filters and search"
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
