import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, LogOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMyPosts, savePost, type BlogPost } from "@/lib/blog.functions";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "Write Blog Posts | Pooja Bhagwat";
const DESCRIPTION = "Pooja Bhagwat's private portfolio blog writing area.";

export const Route = createFileRoute("/_authenticated/blog-editor")({
  beforeLoad: ({ context }) => {
    if (context.user.email?.toLowerCase() !== "poojabhagwat2525@gmail.com")
      throw new Error("This writing area is for Pooja only.");
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BlogEditor,
});

function BlogEditor() {
  const loadPosts = useServerFn(getMyPosts);
  const writePost = useServerFn(savePost);
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [id, setId] = useState<string>();
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    setPosts(await loadPosts());
  }
  useEffect(() => {
    void refresh();
  }, []);
  function edit(post: BlogPost) {
    setId(post.id);
    setTitle(post.title);
    setProjectName(post.project_name);
    setExcerpt(post.excerpt);
    setBody(post.body);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function clear() {
    setId(undefined);
    setTitle("");
    setProjectName("");
    setExcerpt("");
    setBody("");
  }
  async function submit(status: "draft" | "published") {
    setMessage("");
    try {
      await writePost({
        data: { ...(id ? { id } : {}), title, projectName, excerpt, body, status },
      });
      setMessage(status === "published" ? "Post published." : "Draft saved.");
      clear();
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The post could not be saved.");
    }
  }
  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="portfolio editor-page page-gutter">
      <header className="editor-header">
        <Button asChild variant="ghost">
          <Link to="/blog">
            <ArrowLeft size={15} /> Public blog
          </Link>
        </Button>
        <Button variant="ghost" onClick={signOut}>
          <LogOut size={15} /> Sign out
        </Button>
      </header>
      <section className="editor-grid">
        <div className="editor-form">
          <p className="section-label">// POOJA'S WRITING DESK</p>
          <h1 className="display">
            WRITE
            <br />
            WHAT YOU BUILT.
          </h1>
          <div className="booking-form">
            <div className="booking-field">
              <Label htmlFor="post-title">Title</Label>
              <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="booking-field">
              <Label htmlFor="project-name">Project</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="FoodMart"
              />
            </div>
            <div className="booking-field">
              <Label htmlFor="excerpt">Short introduction</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
              />
            </div>
            <div className="booking-field">
              <Label htmlFor="post-body">Post</Label>
              <Textarea
                id="post-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
              />
            </div>
            {message ? <p role="status">{message}</p> : null}
            <div className="editor-actions">
              <Button variant="outline" onClick={() => submit("draft")} disabled={!title || !body}>
                <Save size={15} /> Save draft
              </Button>
              <Button onClick={() => submit("published")} disabled={!title || !body}>
                Publish post
              </Button>
              {id ? (
                <Button variant="ghost" onClick={clear}>
                  New post
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        <aside className="draft-list">
          <p className="section-label">// YOUR POSTS</p>
          {posts.length ? (
            posts.map((post) => (
              <Button
                type="button"
                variant="ghost"
                className="draft-item"
                key={post.id}
                onClick={() => edit(post)}
              >
                <strong>{post.title}</strong>
                <span className="mono">{post.status}</span>
              </Button>
            ))
          ) : (
            <p>No drafts yet.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
