CREATE TABLE public.blog_posts (
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

CREATE POLICY "Published posts are public"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published' OR (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com'));

CREATE POLICY "Pooja can create posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com');

CREATE POLICY "Pooja can update posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com')
WITH CHECK (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com');

CREATE POLICY "Pooja can delete posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'poojabhagwat2525@gmail.com');

CREATE INDEX blog_posts_public_feed_idx ON public.blog_posts (published_at DESC) WHERE status = 'published';
CREATE INDEX blog_posts_author_idx ON public.blog_posts (author_id, updated_at DESC);