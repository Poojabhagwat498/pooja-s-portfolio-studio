import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Tables } from "@/integrations/supabase/types";

export type BlogPost = Tables<"blog_posts">;

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export const getPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await publicClient()
      .from("blog_posts")
      .select(
        "id,title,slug,excerpt,body,project_name,published_at,created_at,updated_at,author_id,status",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
});

export const getMyPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("blog_posts")
      .select("*")
      .eq("author_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error("Your posts could not be loaded.");
    return data;
  });

const postInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(140),
  excerpt: z.string().trim().max(320),
  body: z.string().trim().min(1),
  projectName: z.string().trim().max(100),
  status: z.enum(["draft", "published"]),
});

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => postInput.parse(data))
  .handler(async ({ context, data }) => {
    const email = String(context.claims["email"] ?? "").toLowerCase();
    if (email !== "poojabhagwat2525@gmail.com")
      throw new Error("This writing area is for Pooja only.");
    const slugBase =
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "post";
    const now = new Date().toISOString();
    const values = {
      author_id: context.userId,
      title: data.title,
      slug: data.id ? slugBase : `${slugBase}-${Date.now().toString().slice(-6)}`,
      excerpt: data.excerpt,
      body: data.body,
      project_name: data.projectName,
      status: data.status,
      published_at: data.status === "published" ? now : null,
      updated_at: now,
    };
    const query = data.id
      ? context.supabase
          .from("blog_posts")
          .update(values)
          .eq("id", data.id)
          .eq("author_id", context.userId)
      : context.supabase.from("blog_posts").insert(values);
    const { error } = await query;
    if (error) throw new Error("The post could not be saved.");
    return { ok: true };
  });
