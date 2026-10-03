import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { projects } from "@/lib/portfolio-data";

export const Route = createFileRoute("/projects/$id")({
  loader: ({ params }) => {
    const index = projects.findIndex((p) => p.id === params.id);
    if (index === -1) throw notFound();
    return { index };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Project not found" }, { name: "robots", content: "noindex" }] };
    const p = projects[loaderData.index]!;
    const title = `${p.name.replace(/\.$/, "")} — Project by Pooja Bhagwat`;
    return {
      meta: [
        { title },
        { name: "description", content: p.tagline },
        { property: "og:title", content: title },
        { property: "og:description", content: p.tagline },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: ProjectMissing,
  component: ProjectPage,
});

function ProjectMissing() {
  return (
    <main className="portfolio section page-gutter">
      <h1 className="display section-heading">PROJECT NOT FOUND.</h1>
      <Button asChild className="mt-6"><Link to="/portfolio">Back to portfolio</Link></Button>
    </main>
  );
}

function ProjectPage() {
  const { index } = Route.useLoaderData();
  const p = projects[index]!;
  const s = p.caseStudy;
  const prev = projects[(index - 1 + projects.length) % projects.length]!;
  const next = projects[(index + 1) % projects.length]!;

  return (
    <main className="portfolio project-page">
      <nav className="site-nav" aria-label="Project navigation">
        <Link className="nav-mark" to="/">P·B</Link>
        <Link to="/">Home</Link><Link to="/portfolio">Portfolio</Link><Link to="/blog">Blog</Link>
        <ThemeToggle />
        <Button asChild className="nav-cta"><Link to="/contact">Contact</Link></Button>
      </nav>
      <div key={p.id} className="luma-reveal">
        <header className="section page-gutter project-hero">
          <p className="section-label">// PROJECT {p.index} · {p.kind}</p>
          <h1 className="display section-heading">{p.name}</h1>
          <p className="project-tagline">{p.tagline}</p>
          <div className="hero-actions">
            {s.liveUrl && <Button asChild><a href={s.liveUrl} target="_blank" rel="noreferrer">Live site <ArrowUpRight size={15} /></a></Button>}
            {s.repoUrl && <Button asChild variant="outline"><a href={s.repoUrl} target="_blank" rel="noreferrer"><Github size={15} /> Source code</a></Button>}
          </div>
        </header>
        {p.image && <figure className="page-gutter project-cover"><img src={p.image} alt={`${p.name} preview`} /></figure>}
        <section className="section page-gutter project-body">
          <div><p className="section-label">// OVERVIEW</p><p>{s.overview}</p></div>
          <div><p className="section-label">// PROBLEM</p><p>{s.problem}</p></div>
          <div><p className="section-label">// SOLUTION</p><p>{s.solution}</p></div>
          <div><p className="section-label">// FEATURES</p><ul>{s.features.map((f) => <li key={f}>{f}</li>)}</ul></div>
          <div><p className="section-label">// STACK</p><div className="project-tags">{s.stack.map((t) => <span className="tag" key={t}>{t}</span>)}</div></div>
          <div><p className="section-label">// OUTCOMES</p><ul>{s.outcomes.map((o) => <li key={o}>{o}</li>)}</ul></div>
        </section>
      </div>
      <nav className="page-gutter project-pager" aria-label="More projects">
        <Link to="/projects/$id" params={{ id: prev.id }}><ArrowLeft size={16} /> {prev.name}</Link>
        <Link to="/projects/$id" params={{ id: next.id }}>{next.name} <ArrowRight size={16} /></Link>
      </nav>
      <footer className="footer page-gutter"><Link to="/portfolio"><ArrowLeft size={14} /> ALL PROJECTS</Link><span>© {new Date().getFullYear()} POOJA BHAGWAT</span></footer>
    </main>
  );
}
