CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  event_date DATE,
  cover_url TEXT,
  welcome_message TEXT,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('photo','video','text')),
  media_url TEXT,
  caption TEXT,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, guest_id)
);

CREATE INDEX idx_posts_event ON public.posts(event_id, created_at DESC);
CREATE INDEX idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_guests_event ON public.guests(event_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;
GRANT ALL ON public.events TO service_role;

GRANT SELECT, INSERT ON public.guests TO authenticated;
GRANT SELECT, INSERT ON public.guests TO anon;
GRANT ALL ON public.guests TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT, INSERT ON public.posts TO anon;
GRANT ALL ON public.posts TO service_role;

GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.likes TO anon;
GRANT ALL ON public.likes TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Hosts create their events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts update their events" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts delete their events" ON public.events FOR DELETE TO authenticated USING (auth.uid() = host_id);

CREATE POLICY "Anyone can view guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Anyone can join an open event" ON public.guests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.is_closed = false)
);

CREATE POLICY "Anyone can view visible posts" ON public.posts FOR SELECT USING (
  is_hidden = false
  OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.host_id = auth.uid())
);
CREATE POLICY "Anyone can post to an open event" ON public.posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.is_closed = false)
);
CREATE POLICY "Hosts moderate posts" ON public.posts FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.host_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.host_id = auth.uid())
);
CREATE POLICY "Hosts delete posts" ON public.posts FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.host_id = auth.uid())
);

CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Anyone can like" ON public.likes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts p JOIN public.events e ON e.id = p.event_id WHERE p.id = post_id AND e.is_closed = false)
);
CREATE POLICY "Anyone can unlike" ON public.likes FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;