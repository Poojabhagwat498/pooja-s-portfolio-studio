import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const TITLE = "Writer Sign In | Pooja Bhagwat";
const DESCRIPTION = "Private sign-in for Pooja Bhagwat's portfolio blog editor.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("poojabhagwat2525@gmail.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signIn() {
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMessage(error.message);
    await navigate({ to: "/blog-editor" });
  }

  async function createAccount() {
    if (email.toLowerCase() !== "poojabhagwat2525@gmail.com")
      return setMessage("This editor account is reserved for Pooja.");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    setMessage(error ? error.message : "Check your inbox to confirm the account, then sign in.");
  }

  async function signInWithGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setMessage(result.error.message);
    else if (!result.redirected) await navigate({ to: "/blog-editor" });
  }

  return (
    <main className="portfolio auth-page page-gutter">
      <section className="auth-panel">
        <p className="section-label">// PRIVATE WRITING DESK</p>
        <h1 className="display">
          POOJA'S
          <br />
          BLOG.
        </h1>
        <p>Sign in to write, save drafts, and publish project stories.</p>
        <div className="booking-form">
          <div className="booking-field">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="booking-field">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {message ? (
            <p className="case-error" role="status">
              {message}
            </p>
          ) : null}
          <Button onClick={signIn}>
            <LogIn size={15} /> Sign in
          </Button>
          <Button variant="outline" onClick={createAccount}>
            Create Pooja's account
          </Button>
          <Button variant="secondary" onClick={signInWithGoogle}>
            Continue with Google
          </Button>
          <Button asChild variant="ghost">
            <Link to="/blog">Back to blog</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
