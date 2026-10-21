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
      p.kind.toUpperCase().includes("MATRIMONY") || p.kind.toUpperCase().includes("PLATFORM"),
  },
];

export function matchesSearchQuery(project: Project, query: string): boolean {
  if (!query || !query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    project.name.toLowerCase().includes(q) ||
    project.tagline.toLowerCase().includes(q) ||
    project.kind.toLowerCase().includes(q) ||
    project.caseStudy.overview.toLowerCase().includes(q) ||
    project.caseStudy.stack.some((tech) => tech.toLowerCase().includes(q)) ||
    project.caseStudy.features.some((feat) => feat.toLowerCase().includes(q))
  );
}
