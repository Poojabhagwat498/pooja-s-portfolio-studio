import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroSystem from "@/assets/hero-system.jpg";
import dashboard from "@/assets/project-dashboard.jpg";
import platform from "@/assets/project-platform.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pooja Bhagwat — Portfolio" },
      { name: "description", content: "The portfolio of Pooja Bhagwat. Thoughtful digital experiences, creative thinking, and work built with purpose." },
      { property: "og:title", content: "Pooja Bhagwat — Portfolio" },
      { property: "og:description", content: "Thoughtful digital experiences, creative thinking, and work built with purpose." },
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

function Index() {
  return (
    <main id="top" className="portfolio">
      <nav className="site-nav" aria-label="Main navigation">
        <a className="nav-mark" href="#top" aria-label="Pooja Bhagwat, back to top">P·B</a>
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#now">Now</a>
        <Button asChild className="nav-cta"><a href="#contact">Let's Connect</a></Button>
      </nav>
      <div className="status-pill mono"><span className="status-dot" /> PORTFOLIO / 2026</div>

      <section className="hero page-gutter" aria-labelledby="hero-title">
        <div className="hero-top">
          <div>
            <h1 id="hero-title" className="display hero-name">POOJA<br />BHAGWAT</h1>
            <div className="tag-row" aria-label="Areas of interest">
              <span className="tag">Ideas</span><span className="tag">Design</span><span className="tag">Digital</span><span className="tag">Making</span>
            </div>
            <div className="hero-actions">
              <Button asChild><a href="#work">Explore the Work <ArrowUpRight aria-hidden="true" /></a></Button>
              <Button asChild variant="outline"><a href="#contact">Get in Touch</a></Button>
            </div>
          </div>
          <div className="hero-meta mono"><strong>CREATIVE PORTFOLIO</strong>BASED IN INDIA<br />OPEN TO POSSIBILITIES</div>
        </div>
        <div className="hero-middle">
          <div>
            <div className="hero-art">
              <img src={heroSystem} alt="An interconnected arrangement of modern digital systems" width={1408} height={912} />
              <span className="art-chip top"><span className="status-dot" /> IDEAS · EXECUTION</span>
              <span className="art-chip bottom"><span className="status-dot" /> CONNECTED THINKING</span>
            </div>
            <div className="art-caption">→ &nbsp; THINKING, MAKING, REFINING —<br />&nbsp;&nbsp;&nbsp;&nbsp; ONE DETAIL AT A TIME.</div>
          </div>
          <div className="hero-statement">
            <p>Making ideas feel real — from first thought to final detail.</p>
            <h2 className="display">CREATIVE<br />THINKING.</h2>
          </div>
        </div>
        <div className="hero-bottom"><span>DESIGNED FOR POOJA BHAGWAT</span><a className="scroll-cue" href="#about"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /><ArrowDown size={15} /></a></div>
      </section>

      <div className="ticker" aria-hidden="true"><div className="ticker-track">{Array.from({ length: 4 }).map((_, i) => <span key={i} className="flex items-center gap-6"><span>DESIGN WITH PURPOSE</span><b>✳</b><span>MAKE IT MEANINGFUL</span><b>✳</b></span>)}</div></div>

      <section id="about" className="section page-gutter" aria-labelledby="about-title">
        <p className="section-label">// ABOUT ME</p>
        <h2 id="about-title" className="display section-heading">A LITTLE ABOUT<br />THE WAY I THINK.</h2>
        <div className="about-grid">
          <p className="about-lead">Curiosity meets intention. Ideas meet execution.</p>
          <div><p className="about-copy">I’m Pooja Bhagwat. This is a space for thoughtful ideas, digital work, and the process of making something better than it was before.</p><p className="about-copy">I believe the most interesting work happens where creativity and clarity come together — with care for the big picture and the smallest details.</p></div>
        </div>
        <div className="skill-tags"><span>Creative Thinking</span><span>Digital Experiences</span><span>Problem Solving</span><span>Visual Storytelling</span><span>Collaboration</span><span>Iteration</span></div>
      </section>

      <section className="section page-gutter principles" aria-labelledby="principles-title">
        <p className="section-label">// HOW I APPROACH THINGS</p>
        <h2 id="principles-title" className="display section-heading">FIRST<br />PRINCIPLES.</h2>
        <p className="principles-intro">A few simple ideas guide the way I approach every new challenge.</p>
        <div className="principle-list">{principles.map(([number, title, text]) => <div className="principle" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
      </section>

      <section id="work" className="section page-gutter" aria-labelledby="work-title">
        <p className="section-label">// SELECTED EXPLORATIONS</p>
        <div className="work-intro"><h2 id="work-title" className="display section-heading">THE WORK.</h2><p>A visual space for projects, experiments, and ideas in progress.</p></div>
        <div className="work-grid">
          <article className="work-item"><div className="work-image"><img src={dashboard} alt="Concept visualization of a dark analytics dashboard" width={1200} height={912} loading="lazy" /></div><p className="section-label">01 / CONCEPT STUDY · DIGITAL</p><h3 className="display">THE SYSTEM.</h3><p>Exploring clarity in complexity through a considered dashboard experience.</p><div className="tag-row"><span className="tag">Interface</span><span className="tag">Information</span><span className="tag">Exploration</span></div></article>
          <article className="work-item"><div className="work-image"><img src={platform} alt="Concept visualization of a bright digital platform on a laptop" width={1200} height={912} loading="lazy" /></div><p className="section-label">02 / CONCEPT STUDY · PRODUCT</p><h3 className="display">THE PLATFORM.</h3><p>Thinking through the small interactions that make digital products feel intuitive.</p><div className="tag-row"><span className="tag">Experience</span><span className="tag">Product</span><span className="tag">Detail</span></div></article>
        </div>
      </section>

      <section id="skills" className="section page-gutter expertise" aria-labelledby="skills-title">
        <p className="section-label">// FOCUS AREAS</p><h2 id="skills-title" className="display section-heading">WHAT DRIVES<br />THE WORK.</h2>
        <div className="expertise-grid">
          <div className="expertise-item"><span className="number">01 / DISCOVER</span><h3 className="display">THINKING.</h3><p>Asking the right questions, finding patterns, and shaping a clear direction.</p></div>
          <div className="expertise-item"><span className="number">02 / CREATE</span><h3 className="display">MAKING.</h3><p>Turning ideas into considered experiences with purpose in every detail.</p></div>
          <div className="expertise-item"><span className="number">03 / IMPROVE</span><h3 className="display">REFINING.</h3><p>Testing, learning, and making good work even better through iteration.</p></div>
        </div>
      </section>

      <section id="now" className="now page-gutter" aria-labelledby="now-title"><p className="section-label">// RIGHT NOW</p><div className="now-grid"><h2 id="now-title" className="display">WHAT'S<br />NEXT?</h2><p>Always looking for the next interesting idea, creative challenge, or thoughtful collaboration. <ArrowUpRight size={20} aria-hidden="true" /></p></div></section>
      <section id="contact" className="contact page-gutter" aria-labelledby="contact-title"><p className="section-label">// CONNECT</p><h2 id="contact-title" className="display">LET'S<br />TALK.</h2><div className="contact-line"><p>Good ideas start with a conversation.</p><span>CONTACT DETAILS AVAILABLE ON REQUEST</span></div><footer className="footer"><span>© {new Date().getFullYear()} POOJA BHAGWAT</span><a href="#top">BACK TO TOP ↑</a><span>MADE WITH INTENTION.</span></footer></section>
    </main>
  );
}
