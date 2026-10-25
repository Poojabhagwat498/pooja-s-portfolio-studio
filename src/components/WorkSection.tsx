import { useEffect, useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  BadgeCheck,
  Calendar,
  Code2,
  Loader2,
  Maximize2,
  Pencil,
  RotateCcw,
  Sparkle,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { projects as baseProjects, type Project } from "@/lib/portfolio-data";
import { generateCaseStudy, type CaseStudyBrief } from "@/lib/case-study.functions";
import { InteractiveProjectButton } from "@/components/InteractiveProjectButton";
import { ProjectFilter } from "@/components/ProjectFilter";
import {
  type FilterMode,
  STACK_FILTERS,
  TYPE_FILTERS,
  matchesSearchQuery,
} from "@/lib/project-filter";

const STORE_KEY = "pb-portfolio-projects-v1";

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

export function WorkSection() {
  const [items, setItems] = useState<Project[]>(baseProjects);
  const [hydrated, setHydrated] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<FilterMode>("stack");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
    title: string;
    subtitle: string;
  } | null>(null);

  useEffect(() => {
    if (!previewImage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewImage]);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Project[];
        if (Array.isArray(saved) && saved.length) {
          setItems(
            saved.map((project) => {
              const current = baseProjects.find((base) => base.id === project.id);
              return current?.image && !project.image
                ? { ...project, image: current.image }
                : project;
            }),
          );
        }
      }
    } catch {
      /* ignore unreadable saved content */
    }
  }, []);

  function persist(next: Project[]) {
    setItems(next);
    if (hydrated) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        /* storage may be unavailable */
      }
    }
  }

  const handleImageTrigger = (
    target: HTMLElement,
    originX?: number,
    originY?: number,
    project?: Project,
  ) => {
    if (!project?.image) return;
    const rect = target.getBoundingClientRect();
    const x = typeof originX === "number" ? originX - rect.left : rect.width / 2;
    const y = typeof originY === "number" ? originY - rect.top : rect.height / 2;

    const ripple = document.createElement("span");
    ripple.className = "work-image-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    target.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 700);

    window.setTimeout(() => {
      setPreviewImage({
        src: project.image!,
        alt: `${project.name} preview`,
        title: project.name,
        subtitle: `${project.index} / ${project.kind}`,
      });
    }, 140);
  };

  const filteredItems = useMemo(() => {
    const options = mode === "stack" ? STACK_FILTERS : TYPE_FILTERS;
    const activeOption = options.find((o) => o.id === selectedFilter) ?? options[0];

    return items.filter((p) => {
      const matchesCategory = activeOption ? activeOption.matches(p) : true;
      const matchesSearch = matchesSearchQuery(p, searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [items, mode, selectedFilter, searchQuery]);

  const active = items.find((item) => item.id === openId) ?? null;

  const handleReset = () => {
    setSelectedFilter("all");
    setSearchQuery("");
  };

  return (
    <section id="work" className="section page-gutter" aria-labelledby="work-title">
      <p className="section-label">// FEATURED PROJECTS</p>
      <div className="work-intro">
        <h2 id="work-title" className="display section-heading">
          THE WORK.{" "}
          <span
            className="work-count mono"
            aria-label={`${filteredItems.length} projects`}
            data-count={filteredItems.length}
          >
            {String(filteredItems.length).padStart(2, "0")}
          </span>
        </h2>
        <p>
          Full-stack projects built end to end. Filter or search to explore specific stacks and
          systems.
        </p>
      </div>

      <ProjectFilter
        mode={mode}
        onModeChange={setMode}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allProjects={items}
        filteredCount={filteredItems.length}
        onReset={handleReset}
      />

      {filteredItems.length === 0 ? (
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
      ) : (
        <div
          key={`work-grid-${mode}-${selectedFilter}-${searchQuery}`}
          className="work-grid project-fade-in"
        >
          {filteredItems.map((project) => (
            <article className="work-item" key={project.id}>
              {project.image ? (
                <div
                  className="work-image"
                  role="button"
                  tabIndex={0}
                  aria-label={`Open full-screen preview of ${project.name}`}
                  onClick={(e) => {
                    handleImageTrigger(e.currentTarget, e.clientX, e.clientY, project);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleImageTrigger(e.currentTarget, undefined, undefined, project);
                    }
                  }}
                >
                  <div className="work-image-expand-hint" aria-hidden="true">
                    <Maximize2 size={12} />
                    <span>EXPAND</span>
                  </div>
                  <img
                    src={project.image}
                    alt={`${project.name} preview`}
                    width={1600}
                    height={900}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="work-image work-image-empty">
                  <span className="mono">CASE STUDY</span>
                </div>
              )}
              <div className="work-head">
                <p className="section-label">
                  {project.index} / {project.kind}
                </p>
                {project.verified ? (
                  <span className="verified-badge">
                    <BadgeCheck size={13} aria-hidden="true" /> VERIFIED PROJECT
                  </span>
                ) : null}
              </div>
              <h3 className="display">{project.name}</h3>
              <p>{project.tagline}</p>

              {project.stats && (
                <div className="project-stats-strip" aria-label="Project metrics">
                  <span className="project-stat-pill" title="Lines of Code">
                    <Code2 size={13} aria-hidden="true" />
                    <span className="tabular-nums">{project.stats.linesOfCode}</span>
                  </span>
                  <span className="stat-separator" aria-hidden="true">
                    ·
                  </span>
                  <span className="project-stat-pill" title="Completion Date">
                    <Calendar size={13} aria-hidden="true" />
                    <span>{project.stats.completionDate}</span>
                  </span>
                  <span className="stat-separator" aria-hidden="true">
                    ·
                  </span>
                  <span className="project-stat-pill" title="Team Size">
                    <Users size={13} aria-hidden="true" />
                    <span>{project.stats.teamSize}</span>
                  </span>
                </div>
              )}

              <div className="tag-row">
                {project.caseStudy.stack.slice(0, 5).map((tech) => (
                  <span className="tag" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
              <div className="work-actions">
                {baseProjects.some((base) => base.id === project.id) ? (
                  <InteractiveProjectButton id={project.id} />
                ) : null}
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenId(project.id);
                    setEditing(false);
                  }}
                >
                  Read case study
                </Button>
                {project.caseStudy.liveUrl ? (
                  <Button asChild variant="ghost">
                    <a href={project.caseStudy.liveUrl} target="_blank" rel="noreferrer">
                      Live site
                    </a>
                  </Button>
                ) : null}
                {project.caseStudy.repoUrl ? (
                  <Button asChild variant="ghost">
                    <a href={project.caseStudy.repoUrl} target="_blank" rel="noreferrer">
                      Source code
                    </a>
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="work-footer">
        <GeneratorDialog
          onCreate={(project) => {
            persist([...items, project]);
            toast.success("Case study added to your featured work.");
          }}
        />
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent className="case-dialog">
          {active ? (
            editing ? (
              <CaseStudyEditor
                project={active}
                onCancel={() => setEditing(false)}
                onSave={(updated) => {
                  persist(items.map((item) => (item.id === updated.id ? updated : item)));
                  setEditing(false);
                  toast.success("Case study updated.");
                }}
                onDelete={() => {
                  persist(items.filter((item) => item.id !== active.id));
                  setOpenId(null);
                  setEditing(false);
                  toast.success("Project removed.");
                }}
              />
            ) : (
              <CaseStudyView project={active} onEdit={() => setEditing(true)} />
            )
          ) : null}
        </DialogContent>
      </Dialog>

      {previewImage && (
        <div
          className="image-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${previewImage.title} preview`}
          onClick={() => setPreviewImage(null)}
        >
          <div className="image-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <div className="image-modal-info">
                <span>{previewImage.subtitle}</span>
                <h3>{previewImage.title}</h3>
              </div>
              <button
                type="button"
                className="image-modal-close"
                aria-label="Close image preview"
                onClick={() => setPreviewImage(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="image-modal-body">
              <img src={previewImage.src} alt={previewImage.alt} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CaseStudyView({ project, onEdit }: { project: Project; onEdit: () => void }) {
  const study = project.caseStudy;
  return (
    <>
      <DialogHeader>
        <DialogTitle className="display case-title">{project.name}</DialogTitle>
        <DialogDescription>{project.kind}</DialogDescription>
      </DialogHeader>
      <div className="case-body">
        <Block title="Overview" text={study.overview} />
        <Block title="Problem" text={study.problem} />
        <Block title="Solution" text={study.solution} />
        <List title="Key features" values={study.features} />
        <List title="Outcomes" values={study.outcomes} />
        <div className="case-block">
          <h4 className="section-label">Technology</h4>
          <div className="tag-row">
            {study.stack.map((tech) => (
              <span className="tag" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="case-block">
          <h4 className="section-label">Links</h4>
          <p className="case-text">
            {study.liveUrl ? (
              <a className="case-link" href={study.liveUrl} target="_blank" rel="noreferrer">
                Live site
              </a>
            ) : (
              "Live link not provided yet."
            )}
            {" · "}
            {study.repoUrl ? (
              <a className="case-link" href={study.repoUrl} target="_blank" rel="noreferrer">
                Source code
              </a>
            ) : (
              "Source link not provided yet."
            )}
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onEdit}>
          <Pencil size={14} aria-hidden="true" /> Edit case study
        </Button>
      </DialogFooter>
    </>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div className="case-block">
      <h4 className="section-label">{title}</h4>
      <p className="case-text">{text}</p>
    </div>
  );
}

function List({ title, values }: { title: string; values: string[] }) {
  if (!values.length) return null;
  return (
    <div className="case-block">
      <h4 className="section-label">{title}</h4>
      <ul className="case-list">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  );
}

function CaseStudyEditor({
  project,
  onSave,
  onCancel,
  onDelete,
}: {
  project: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [kind, setKind] = useState(project.kind);
  const [tagline, setTagline] = useState(project.tagline);
  const [overview, setOverview] = useState(project.caseStudy.overview);
  const [problem, setProblem] = useState(project.caseStudy.problem);
  const [solution, setSolution] = useState(project.caseStudy.solution);
  const [features, setFeatures] = useState(project.caseStudy.features.join("\n"));
  const [outcomes, setOutcomes] = useState(project.caseStudy.outcomes.join("\n"));
  const [stack, setStack] = useState(project.caseStudy.stack.join(", "));
  const [liveUrl, setLiveUrl] = useState(project.caseStudy.liveUrl);
  const [repoUrl, setRepoUrl] = useState(project.caseStudy.repoUrl);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="display case-title">EDIT CASE STUDY</DialogTitle>
        <DialogDescription>Your changes are saved in this browser.</DialogDescription>
      </DialogHeader>
      <div className="case-body case-form">
        <Field label="Project name" value={name} onChange={setName} />
        <Field label="Category line" value={kind} onChange={setKind} />
        <Field label="Short description" value={tagline} onChange={setTagline} />
        <Area label="Overview" value={overview} onChange={setOverview} />
        <Area label="Problem" value={problem} onChange={setProblem} />
        <Area label="Solution" value={solution} onChange={setSolution} />
        <Area label="Key features (one per line)" value={features} onChange={setFeatures} />
        <Area label="Outcomes (one per line)" value={outcomes} onChange={setOutcomes} />
        <Field label="Technology (comma separated)" value={stack} onChange={setStack} />
        <Field label="Live link" value={liveUrl} onChange={setLiveUrl} placeholder="https://" />
        <Field
          label="Source code link"
          value={repoUrl}
          onChange={setRepoUrl}
          placeholder="https://"
        />
      </div>
      <DialogFooter className="case-footer">
        <Button variant="ghost" className="case-delete" onClick={onDelete}>
          Remove project
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSave({
              ...project,
              name: name.trim() || project.name,
              kind: kind.trim(),
              tagline: tagline.trim(),
              caseStudy: {
                overview: overview.trim(),
                problem: problem.trim(),
                solution: solution.trim(),
                features: lines(features),
                outcomes: lines(outcomes),
                stack: stack
                  .split(",")
                  .map((tech) => tech.trim())
                  .filter(Boolean),
                liveUrl: liveUrl.trim(),
                repoUrl: repoUrl.trim(),
              },
            })
          }
        >
          Save changes
        </Button>
      </DialogFooter>
    </>
  );
}

const emptyBrief: CaseStudyBrief = {
  name: "",
  notes: "",
  problem: "",
  goals: "",
  features: "",
  technologies: "",
  challenges: "",
  outcomes: "",
  liveUrl: "",
  repoUrl: "",
};

function GeneratorDialog({ onCreate }: { onCreate: (project: Project) => void }) {
  const run = useServerFn(generateCaseStudy);
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState<CaseStudyBrief>(emptyBrief);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function set<K extends keyof CaseStudyBrief>(key: K, value: string) {
    setBrief((current) => ({ ...current, [key]: value }));
  }

  async function generate() {
    if (!brief.name.trim()) {
      setError("Add a project name first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await run({ data: { ...brief, name: brief.name.trim() } });
      if (result.ok) {
        setDraft(result.caseStudy);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong while writing. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function publish() {
    const name = brief.name.trim();
    onCreate({
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      index: "NEW",
      name: `${name.toUpperCase()}.`,
      kind: brief.technologies.trim() ? brief.technologies.trim().toUpperCase() : "CASE STUDY",
      tagline:
        brief.problem.trim() ||
        brief.notes.trim().slice(0, 160) ||
        "Case study written from project notes.",
      verified: false,
      caseStudy: {
        overview: draft,
        problem: "",
        solution: "",
        features: [],
        outcomes: lines(brief.outcomes),
        stack: brief.technologies
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean),
        liveUrl: brief.liveUrl.trim(),
        repoUrl: brief.repoUrl.trim(),
      },
    });
    setOpen(false);
    setBrief(emptyBrief);
    setDraft("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="generator-trigger">
          <Sparkle size={15} aria-hidden="true" /> Write a new case study
        </Button>
      </DialogTrigger>
      <DialogContent className="case-dialog">
        <DialogHeader>
          <DialogTitle className="display case-title">WRITE A CASE STUDY</DialogTitle>
          <DialogDescription>
            Add your notes and let the writing assistant shape them into a polished case study. It
            never invents numbers — anything you leave blank is marked as not provided.
          </DialogDescription>
        </DialogHeader>

        <div className="case-body case-form">
          <Field label="Project name" value={brief.name} onChange={(v) => set("name", v)} />
          <Area label="Project notes" value={brief.notes} onChange={(v) => set("notes", v)} />
          <Area
            label="Problem it solves"
            value={brief.problem}
            onChange={(v) => set("problem", v)}
          />
          <Area label="Goals" value={brief.goals} onChange={(v) => set("goals", v)} />
          <Area label="Key features" value={brief.features} onChange={(v) => set("features", v)} />
          <Field
            label="Technologies (comma separated)"
            value={brief.technologies}
            onChange={(v) => set("technologies", v)}
          />
          <Area
            label="Challenges"
            value={brief.challenges}
            onChange={(v) => set("challenges", v)}
          />
          <Area label="Outcomes" value={brief.outcomes} onChange={(v) => set("outcomes", v)} />
          <Field
            label="Live link"
            value={brief.liveUrl}
            onChange={(v) => set("liveUrl", v)}
            placeholder="https://"
          />
          <Field
            label="Source code link"
            value={brief.repoUrl}
            onChange={(v) => set("repoUrl", v)}
            placeholder="https://"
          />

          {error ? (
            <p className="case-error" role="alert">
              {error}
            </p>
          ) : null}

          {draft ? (
            <div className="case-block">
              <Label htmlFor="case-draft" className="section-label">
                Draft — edit it before adding
              </Label>
              <Textarea
                id="case-draft"
                className="case-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={18}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={generate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" aria-hidden="true" /> Writing…
              </>
            ) : (
              <>
                <Sparkle size={15} aria-hidden="true" /> {draft ? "Rewrite" : "Generate case study"}
              </>
            )}
          </Button>
          <Button onClick={publish} disabled={!draft || loading}>
            Add to featured work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = `f-${label.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`;
  return (
    <div className="case-block">
      <Label htmlFor={id} className="section-label">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `a-${label.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`;
  return (
    <div className="case-block">
      <Label htmlFor={id} className="section-label">
        {label}
      </Label>
      <Textarea id={id} value={value} rows={4} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
