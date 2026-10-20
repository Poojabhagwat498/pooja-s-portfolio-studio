import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioMotion } from "@/components/PortfolioMotion";
import { getPublishedPosts } from "@/lib/blog.functions";

const TITLE = "Project Journal | Pooja Bhagwat";
const DESCRIPTION =
  "Notes from Pooja Bhagwat on building full-stack products, AI-powered applications, and project case studies.";

export const Route = createFileRoute("/blog")({
  loader: () => getPublishedPosts(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const posts = Route.useLoaderData();
  return (
    <main className="portfolio blog-page">
      <PortfolioMotion />
      <nav className="site-nav" aria-label="Blog navigation">
        <Link className="nav-mark" to="/">
          P·B
        </Link>
        <Link to="/">Home</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/blog" activeProps={{ className: "font-bold" }}>
          Blog
        </Link>
        <Link to="/contact">Contact</Link>
        <Button asChild className="nav-cta">
          <Link to="/blog-editor">
            <PenLine size={14} /> Write
          </Link>
        </Button>
      </nav>
      <header className="section page-gutter blog-hero">
        <p className="section-label">// PROJECT JOURNAL</p>
        <h1 className="display section-heading">
          BUILD NOTES.
          <br />
          REAL LESSONS.
        </h1>
        <p className="blog-intro">
          Behind-the-scenes notes on decisions, challenges, and lessons from Pooja's projects.
        </p>
      </header>
      <section className="section page-gutter blog-feed" aria-label="Published posts">
        {posts.length ? (
          posts.map((post, index) => (
            <article className="blog-card" key={post.id}>
              <div>
                <span className="mono blog-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="tag">{post.project_name || "PROJECT NOTES"}</span>
              </div>
              <div>
                <h2 className="display">{post.title}</h2>
                <p>{post.excerpt}</p>
                <div className="blog-body">
                  {post.body.split("\n").map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <time className="mono">
                  {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
            </article>
          ))
        ) : (
          <div className="blog-empty">
            <p className="section-label">// FIRST DRAFT IN PROGRESS</p>
            <h2 className="display">
              WORDS
              <br />
              COMING SOON.
            </h2>
            <p>Pooja is preparing the first story from her project work.</p>
          </div>
        )}
      </section>
      <footer className="footer page-gutter">
        <Link to="/">
          <ArrowLeft size={14} /> BACK HOME
        </Link>
        <span>© {new Date().getFullYear()} POOJA BHAGWAT</span>
      </footer>
    </main>
  );
}
