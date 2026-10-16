/*
# Create blog_posts table for portfolio blog

## Purpose
This table stores Pooja Bhagwat's portfolio blog posts. Public visitors can read
published posts; only Pooja's authenticated account can create, edit, or delete posts.

## New Tables
- `blog_posts`
  - `id` (uuid, primary key, auto-generated)
  - `author_id` (uuid, not null — references the authenticated user who wrote the post)
  - `title` (text, 1–140 chars, not null)
  - `slug` (text, unique, lowercase-hyphenated URL identifier)
  - `excerpt` (text, short introduction, defaults to empty string)
  - `body` (text, full post content, defaults to empty string)
  - `project_name` (text, optional project tag, defaults to empty string)
  - `status` (text, 'draft' or 'published', defaults to 'draft')
  - `published_at` (timestamptz, null until published)
  - `created_at` (timestamptz, auto-set to now)
  - `updated_at` (timestamptz, auto-set to now)

## Security (RLS)
- RLS enabled on `blog_posts`.
- SELECT: anyone (anon + authenticated) can read published posts; Pooja can also
  read her own drafts.
- INSERT/UPDATE/DELETE: only Pooja's authenticated account (email matched in JWT).

## Indexes
- `blog_posts_public_feed_idx` — on `published_at DESC` where `status = 'published'`
  for fast public blog feed queries.
- `blog_posts_author_idx` — on `(author_id, updated_at DESC)` for Pooja's editor view.

## Important Notes
1. This migration is idempotent — safe to re-run if needed.
2. Policies are dropped before recreating to avoid duplicate-name errors.
3. Grants: anon + authenticated get SELECT; authenticated gets INSERT/UPDATE/DELETE;
   service_role gets ALL.
*/

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 140),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published posts are public" ON public.blog_posts;
CREATE POLICY "Published posts are public"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published' OR (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com'));

DROP POLICY IF EXISTS "Pooja can create posts" ON public.blog_posts;
CREATE POLICY "Pooja can create posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com');

DROP POLICY IF EXISTS "Pooja can update posts" ON public.blog_posts;
CREATE POLICY "Pooja can update posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com')
WITH CHECK (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com');

DROP POLICY IF EXISTS "Pooja can delete posts" ON public.blog_posts;
CREATE POLICY "Pooja can delete posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com');

CREATE INDEX IF NOT EXISTS blog_posts_public_feed_idx ON public.blog_posts (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS blog_posts_author_idx ON public.blog_posts (author_id, updated_at DESC);