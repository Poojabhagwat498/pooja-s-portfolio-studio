import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ProjectCoverflow } from "@/components/ProjectCoverflow";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PortfolioMotion } from "@/components/PortfolioMotion";
import { RESUME_URL } from "@/lib/portfolio-data";

const TITLE = "Portfolio & Case Studies | Pooja Bhagwat";
const DESCRIPTION =
  "Full case studies of Pooja Bhagwat's verified projects — Vaami's Creations, AI Learning Assistant, Community Matrimony and FoodMart — with outcomes, stacks and live links.";

export const Route = createFileRoute("/portfolio")({
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
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <main id="top" className="portfolio">
      <PortfolioMotion />
      <Toaster />
      <nav className="site-nav" aria-label="Portfolio navigation">
        <Link className="nav-mark" to="/" aria-label="Pooja Bhagwat, back to home">
          P·B
        </Link>
        <Link to="/">Home</Link>
        <Link to="/portfolio" activeProps={{ className: "font-bold" }}>
          Portfolio
        </Link>
        <Link to="/blog">Blog</Link>
        <Link to="/contact">Contact</Link>
        <a className="nav-resume" href={RESUME_URL} download="Pooja-Bhagwat-Resume.pdf">
          Résumé
        </a>
        <ThemeToggle />
        <Button asChild className="nav-cta">
          <Link to="/contact">Let's Connect</Link>
        </Button>
      </nav>

      <section className="section page-gutter portfolio-hero" aria-labelledby="portfolio-title">
        <p className="section-label">// PORTFOLIO</p>
        <h1 id="portfolio-title" className="display section-heading">
          EVERY PROJECT,
          <br />
          CASE BY CASE.
        </h1>
        <p className="portfolio-hero-copy">
          Full-stack applications, thoughtful interfaces, and AI-powered experiences — from the
          first idea to the final build.
        </p>
        <div className="hero-actions">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft size={15} aria-hidden="true" /> Back to home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href={RESUME_URL} download="Pooja-Bhagwat-Resume.pdf">
              Download Résumé <Download size={15} aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>

      <ProjectCoverflow />

      <footer className="footer page-gutter">
        <span>© {new Date().getFullYear()} POOJA BHAGWAT</span>
        <a href="#top">BACK TO TOP ↑</a>
        <span>MADE WITH INTENTION.</span>
      </footer>
    </main>
  );
}
