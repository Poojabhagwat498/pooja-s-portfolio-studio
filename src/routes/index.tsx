import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Download, FileText, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { WorkSection } from "@/components/WorkSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookCallDialog } from "@/components/BookCallDialog";
import { PortfolioMotion } from "@/components/PortfolioMotion";
import {
  RESUME_URL,
  achievements,
  contact,
  education,
  experience,
  skillGroups,
} from "@/lib/portfolio-data";
import portraitAsset from "@/assets/pooja-portrait.jpg.asset.json";
import heroSystem from "@/assets/hero-system.jpg";

const TITLE = "Pooja Bhagwat | Computer Science Engineer & MERN Stack Developer";
const DESCRIPTION =
  "Portfolio of Pooja Bhagwat — Computer Science & Engineering student and MERN stack developer building full-stack and AI-powered web applications.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

const principles = [
  ["01", "START WITH WHY.", "The best work begins with a better question, not a bigger feature list."],
  ["02", "MAKE IT MATTER.", "Every detail should have a purpose and make the experience feel effortless."],
  ["03", "KEEP IT HUMAN.", "Good digital work is made for real people, not just perfect screens."],
  ["04", "STAY CURIOUS.", "Explore widely, learn constantly, and never stop looking for a better way."],
  ["05", "FINISH STRONG.", "Ideas only become meaningful when they are thoughtfully brought to life."],
];

function ResumeButton({ variant = "outline" }: { variant?: "default" | "outline" | "secondary" }) {
  return (
    <Button asChild variant={variant}>
      <a href={RESUME_URL} download="Pooja-Bhagwat-Resume.pdf">
        Download Résumé <Download size={15} aria-hidden="true" />
      </a>
    </Button>
  );
}

function Index() {
  return (
    <main id="top" className="portfolio">
      <PortfolioMotion />
      <a href="#about" className="skip-link">
        Skip to content
      </a>
      <Toaster />
      <nav className="site-nav" aria-label="Main navigation">
        <a className="nav-mark" href="#top" aria-label="Pooja Bhagwat, back to top">
          P·B
        </a>
        <a href="#about">About</a>
        <a href="#experience">Experience</a>
        <a href="#work">Projects</a>
        <Link to="/portfolio">Portfolio</Link>
        <a href="#skills">Skills</a>
        <a href="#achievements">Awards</a>
        <a className="nav-resume" href={RESUME_URL} download="Pooja-Bhagwat-Resume.pdf">
          Résumé
        </a>
        <ThemeToggle />
        <Button asChild className="nav-cta">
          <a href="#contact">Let's Connect</a>
        </Button>
      </nav>
      <div className="status-pill mono">
        <span className="status-dot" /> OPEN TO OPPORTUNITIES
      </div>

      <section className="hero page-gutter" aria-labelledby="hero-title">
        <div className="hero-top">
          <div>
            <h1 id="hero-title" className="display hero-name">
              POOJA
              <br />
              BHAGWAT
            </h1>
            <p className="hero-role mono">
              COMPUTER SCIENCE &amp; ENGINEERING STUDENT · MERN STACK DEVELOPER
            </p>
            <div className="tag-row" aria-label="Focus areas">
              <span className="tag">Full-Stack</span>
              <span className="tag">MERN</span>
              <span className="tag">AI-Powered Apps</span>
              <span className="tag">Next.js</span>
            </div>
            <div className="hero-actions">
              <Button asChild>
                <a href="#work">
                  View Projects <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
              <ResumeButton />
              <BookCallDialog variant="outline" />
            </div>
            <div className="hero-stats" aria-label="Portfolio highlights">
              <div>
                <strong className="display" data-count="4">04</strong>
                <span className="mono">SHIPPED PROJECTS</span>
              </div>
              <div>
                <strong className="display" data-count="5">05</strong>
                <span className="mono">SKILL GROUPS</span>
              </div>
              <div>
                <strong className="display" data-count="1">01</strong>
                <span className="mono">CURRENT INTERNSHIP</span>
              </div>
            </div>
            <p className="hero-file mono">PDF · UPDATED RÉSUMÉ</p>
          </div>
          <div className="hero-meta mono">
            <strong>MERN STACK DEVELOPER</strong>
            NASHIK / MAHARASHTRA, INDIA
            <br />
            B.TECH CSE · CGPA 8.76
          </div>
        </div>
        <div className="hero-middle">
          <div>
            <div className="hero-art">
              <img
                src={heroSystem}
                alt="A connected modular computer system representing full-stack development"
                width={1200}
                height={768}
              />
              <span className="art-chip top">
                <span className="status-dot" /> FRONTEND · BACKEND
              </span>
              <span className="art-chip bottom">
                <span className="status-dot" /> AI INTEGRATED
              </span>
            </div>
            <div className="art-caption">
              → &nbsp; POOJA BHAGWAT · BUILDING FULL-STACK PRODUCTS,
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp; ONE FEATURE AT A TIME.
            </div>
          </div>
          <div className="hero-statement">
            <p>Full-stack development, AI-powered applications, and modern web technologies.</p>
            <h2 className="display">
              BUILT TO
              <br />
              WORK.
            </h2>
          </div>
        </div>
        <div className="hero-bottom">
          <span>PORTFOLIO OF POOJA BHAGWAT</span>
          <a className="scroll-cue" href="#about">
            <span>SCROLL TO EXPLORE</span>
            <span className="scroll-line" />
            <ArrowDown size={15} />
          </a>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-6">
              <span>MONGODB · EXPRESS · REACT · NODE</span>
              <b>✳</b>
              <span>NEXT.JS · PRISMA · POSTGRESQL</span>
              <b>✳</b>
            </span>
          ))}
        </div>
      </div>

      <section id="about" className="section page-gutter" aria-labelledby="about-title">
        <p className="section-label">// ABOUT ME</p>
        <h2 id="about-title" className="display section-heading">
          A LITTLE ABOUT
          <br />
          THE WAY I BUILD.
        </h2>
        <div className="about-grid">
          <figure className="about-portrait">
            <img
              src={portraitAsset.url}
              alt="Portrait of Pooja Bhagwat in a black blazer and white shirt"
              width={1254}
              height={1254}
            />
            <figcaption className="mono">POOJA BHAGWAT · NASHIK, INDIA</figcaption>
          </figure>
          <div className="about-text">
            <p className="about-lead">Curiosity meets intention. Ideas meet working software.</p>
            <p className="about-copy">
              I'm Pooja Bhagwat, a B.Tech Computer Science &amp; Engineering student at Sir Visvesvaraya Institute of
              Technology, Nashik, carrying a CGPA of 8.76 out of 10 after completing my Diploma in Computer Engineering
              with 84.29%.
            </p>
            <p className="about-copy">
              I'm currently a MERN stack developer intern, building full-stack applications across MongoDB, Express.js,
              React and Node.js — including AI-integrated products. I like learning new technologies and shaping
              interfaces that stay clear and accessible.
            </p>
            <div className="about-actions">
              <ResumeButton />
              <Button asChild variant="ghost">
                <a href={RESUME_URL} target="_blank" rel="noreferrer">
                  View Résumé <FileText size={15} aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="education-list">
          {education.map(([degree, place, score]) => (
            <div className="education-item" key={degree}>
              <h3>{degree}</h3>
              <p>{place}</p>
              <span className="mono">{score}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="experience" className="section page-gutter experience" aria-labelledby="experience-title">
        <p className="section-label">// EXPERIENCE</p>
        <h2 id="experience-title" className="display section-heading">
          WHERE I'M
          <br />
          WORKING.
        </h2>
        <article className="role">
          <div className="role-head">
            <h3 className="display">{experience.role}</h3>
            <span className="mono">{experience.period}</span>
          </div>
          <p className="role-company">{experience.company}</p>
          <ul className="role-points">
            {experience.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="tag-row">
            {experience.stack.map((tech) => (
              <span className="tag" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="section page-gutter principles" aria-labelledby="principles-title">
        <p className="section-label">// HOW I APPROACH THINGS</p>
        <h2 id="principles-title" className="display section-heading">
          FIRST
          <br />
          PRINCIPLES.
        </h2>
        <p className="principles-intro">A few simple ideas guide the way I approach every new challenge.</p>
        <div className="principle-list">
          {principles.map(([number, title, text]) => (
            <div className="principle" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <WorkSection />

      <section id="skills" className="section page-gutter expertise" aria-labelledby="skills-title">
        <p className="section-label">// SKILLS</p>
        <h2 id="skills-title" className="display section-heading">
          WHAT I WORK
          <br />
          WITH.
        </h2>
        <div className="skills-grid">
          {skillGroups.map(([group, items]) => (
            <div className="skill-card" key={group}>
              <span className="number mono">{group}</span>
              <div className="tag-row">
                {items.map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="achievements" className="section page-gutter principles" aria-labelledby="achievements-title">
        <p className="section-label">// ACHIEVEMENTS</p>
        <h2 id="achievements-title" className="display section-heading">
          ALONG
          <br />
          THE WAY.
        </h2>
        <div className="principle-list">
          {achievements.map(([number, title, text]) => (
            <div className="principle" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="now page-gutter" aria-labelledby="now-title">
        <p className="section-label">// LET'S BUILD SOMETHING GREAT</p>
        <div className="now-grid">
          <h2 id="now-title" className="display">
            WHAT'S
            <br />
            NEXT?
          </h2>
          <div>
            <p>Interested in working together or exploring one of my projects?</p>
            <div className="now-actions">
              <Button asChild>
                <a href="#work">View Projects</a>
              </Button>
              <ResumeButton variant="secondary" />
              <Button asChild variant="secondary">
                <a href="#contact">Contact Me</a>
              </Button>
              <BookCallDialog variant="secondary" />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact page-gutter" aria-labelledby="contact-title">
        <p className="section-label">// CONTACT</p>
        <h2 id="contact-title" className="display">
          LET'S
          <br />
          TALK.
        </h2>
        <div className="contact-line">
          <p>Have a project in mind? Let's build something useful.</p>
          <div className="contact-details">
            <BookCallDialog variant="outline" className="contact-book" />
            <a href={`mailto:${contact.email}`}>
              <Mail size={15} aria-hidden="true" /> {contact.email}
            </a>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
              <Phone size={15} aria-hidden="true" /> {contact.phone}
            </a>
            <span>
              <MapPin size={15} aria-hidden="true" /> {contact.location}
            </span>
            <a href={RESUME_URL} download="Pooja-Bhagwat-Resume.pdf">
              <Download size={15} aria-hidden="true" /> Download Résumé
            </a>
          </div>
        </div>
        <footer className="footer">
          <span>© {new Date().getFullYear()} POOJA BHAGWAT</span>
          <a href="#top">BACK TO TOP ↑</a>
          <span>MADE WITH INTENTION.</span>
        </footer>
      </section>
    </main>
  );
}
