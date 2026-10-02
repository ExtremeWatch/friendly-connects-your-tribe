ALTER TABLE public.events
  ADD COLUMN event_type text NOT NULL DEFAULT 'other',
  ADD COLUMN require_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN album_permission text NOT NULL DEFAULT 'view_and_upload' CHECK (album_permission IN ('view_and_upload','view_only','upload_only')),
  ADD COLUMN allow_guest_downloads boolean NOT NULL DEFAULT true,
  ADD COLUMN allow_likes boolean NOT NULL DEFAULT true,
  ADD COLUMN allow_photos boolean NOT NULL DEFAULT true,
  ADD COLUMN allow_videos boolean NOT NULL DEFAULT true,
  ADD COLUMN allow_text boolean NOT NULL DEFAULT true,
  ADD COLUMN slideshow_interval integer NOT NULL DEFAULT 6 CHECK (slideshow_interval BETWEEN 2 AND 60),
  ADD COLUMN slideshow_show_qr boolean NOT NULL DEFAULT true,
  ADD COLUMN slideshow_show_captions boolean NOT NULL DEFAULT true,
  ADD COLUMN slideshow_show_likes boolean NOT NULL DEFAULT true;

ALTER TABLE public.posts ADD COLUMN status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','pending'));

-- Guests can only post when the event allows uploads; pending status forced by trigger
DROP POLICY "Anyone can post to an open event" ON public.posts;
CREATE POLICY "Anyone can post to an open event" ON public.posts FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = posts.event_id AND e.is_closed = false AND e.album_permission <> 'view_only'));

DROP POLICY "Anyone can view visible posts" ON public.posts;
CREATE POLICY "Anyone can view visible posts" ON public.posts FOR SELECT
USING (
  (is_hidden = false AND status = 'published' AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = posts.event_id AND e.album_permission <> 'upload_only'))
  OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = posts.event_id AND e.host_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.set_post_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev public.events;
BEGIN
  SELECT * INTO ev FROM public.events WHERE id = NEW.event_id;
  IF ev.host_id = auth.uid() THEN
    NEW.status := 'published';
  ELSIF ev.require_approval THEN
    NEW.status := 'pending';
  ELSE
    NEW.status := 'published';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER posts_set_status BEFORE INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_post_status();

DROP POLICY "Anyone can like" ON public.likes;
CREATE POLICY "Anyone can like" ON public.likes FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.posts p JOIN public.events e ON e.id = p.event_id WHERE p.id = likes.post_id AND e.is_closed = false AND e.allow_likes = true));