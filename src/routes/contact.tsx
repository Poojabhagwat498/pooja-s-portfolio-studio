import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowUpRight, Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PortfolioMotion } from "@/components/PortfolioMotion";
import { sendContactMessage } from "@/lib/contact.functions";
import { contact } from "@/lib/portfolio-data";

const title = "Contact Pooja Bhagwat | Full-Stack Developer";
const description = "Send Pooja Bhagwat a message about a project, collaboration, or opportunity, and find her location in Maharashtra, India.";
export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: ContactPage,
});

function ContactPage() {
  const send = useServerFn(sendContactMessage);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setPending(true);
    setResult(null);
    try {
      const response = await send({ data: {
        name: String(fields.get("name") ?? ""),
        email: String(fields.get("email") ?? ""),
        subject: String(fields.get("subject") ?? ""),
        message: String(fields.get("message") ?? ""),
        website: String(fields.get("website") ?? ""),
      } });
      if (response.ok) {
        setResult({ ok: true, text: "Message sent. Thank you — Pooja can reply directly to your email." });
        form.reset();
      } else setResult({ ok: false, text: response.error });
    } catch {
      setResult({ ok: false, text: "Your message could not be sent. Please email Pooja directly using the link below." });
    } finally { setPending(false); }
  }

  return <main className="portfolio contact-page">
    <PortfolioMotion />
    <nav className="site-nav" aria-label="Contact navigation">
      <Link className="nav-mark" to="/">P·B</Link>
      <Link to="/">Home</Link><Link to="/portfolio">Portfolio</Link><Link to="/blog">Blog</Link>
      <ThemeToggle /><Button asChild className="nav-cta"><Link to="/contact">Contact</Link></Button>
    </nav>
    <header className="section page-gutter contact-hero">
      <p className="section-label">// CONTACT</p>
      <h1 className="display section-heading">LET'S MAKE<br />IT HAPPEN.</h1>
      <p>For projects, collaborations, and good conversations.</p>
    </header>
    <section className="section page-gutter contact-content" aria-label="Send a message">
      <div className="contact-copy">
        <p className="section-label">// GET IN TOUCH</p>
        <h2 className="display section-heading">SAY<br />HELLO.</h2>
        <p>Tell me what you're working on. I'll get back to you by email.</p>
        <a href={`mailto:${contact.email}`} className="contact-direct"><Mail size={18} aria-hidden="true" />{contact.email}<ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <div className="contact-form-row">
          <div className="booking-field"><Label htmlFor="contact-name">Name</Label><Input id="contact-name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Your name" /></div>
          <div className="booking-field"><Label htmlFor="contact-email">Email</Label><Input id="contact-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" /></div>
        </div>
        <div className="booking-field"><Label htmlFor="contact-subject">Subject</Label><Input id="contact-subject" name="subject" required minLength={3} maxLength={140} placeholder="What’s on your mind?" /></div>
        <div className="booking-field"><Label htmlFor="contact-message">Message</Label><Textarea id="contact-message" name="message" required minLength={10} maxLength={4000} rows={7} placeholder="Tell me a little about your idea…" /></div>
        <div className="contact-trap" aria-hidden="true"><Label htmlFor="contact-website">Website</Label><Input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send message"}<Send size={16} aria-hidden="true" /></Button>
        {result && <p className={result.ok ? "contact-success" : "contact-error"} role="status">{result.text}</p>}
      </form>
    </section>
    <section className="page-gutter contact-location" aria-labelledby="location-title">
      <div><p className="section-label">// BASED IN</p><h2 id="location-title" className="display">MAHARASHTRA,<br />INDIA.</h2><p><MapPin size={16} aria-hidden="true" /> {contact.location}</p></div>
      <iframe title="Map showing Kannad, Maharashtra, India" src="https://www.google.com/maps?q=Kannad%2C%20Chhatrapati%20Sambhajinagar%2C%20Maharashtra%2C%20India&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
    </section>
    <footer className="footer page-gutter"><Link to="/"><ArrowLeft size={14} /> BACK HOME</Link><span>© {new Date().getFullYear()} POOJA BHAGWAT</span></footer>
  </main>;
}
