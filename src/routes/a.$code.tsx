import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Camera, Heart, Lock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getGuest, joinEvent, type GuestIdentity } from "@/lib/guest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Composer } from "@/components/album/Composer";
import { Lightbox } from "@/components/album/Lightbox";
import { MediaImage, MediaVideo } from "@/components/album/Media";
import type { EventRow, PostRow } from "@/components/album/types";

export const Route = createFileRoute("/a/$code")({
  head: () => ({
    meta: [
      { title: "Join the album — Tifkira" },
      { name: "description", content: "Add your photos, videos and messages to this event's shared album." },
      { property: "og:title", content: "Join the album — Tifkira" },
      {
        property: "og:description",
        content: "Add your photos, videos and messages to this event's shared album.",
      },
    ],
  }),
  component: AlbumPage,
});

function AlbumPage() {
  const { code } = Route.useParams();
  const queryClient = useQueryClient();
  const [guest, setGuest] = useState<GuestIdentity | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => setGuest(getGuest(code)), [code]);

  const eventQuery = useQuery({
    queryKey: ["event", code],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("code", code).maybeSingle();
      if (error) throw error;
      return data as EventRow | null;
    },
  });

  const event = eventQuery.data ?? null;

  const postsQuery = useQuery({
    queryKey: ["posts", event?.id],
    enabled: !!event?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("event_id", event!.id)
        .eq("is_hidden", false)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PostRow[];
    },
  });

  const likesQuery = useQuery({
    queryKey: ["likes", event?.id],
    enabled: !!event?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("post_id, guest_id, posts!inner(event_id)")
        .eq("posts.event_id", event!.id);
      if (error) throw error;
      return (data ?? []) as { post_id: string; guest_id: string }[];
    },
  });

  useEffect(() => {
    if (!event?.id) return;
    const channel = supabase
      .channel(`album-${event.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["posts", event.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () => {
        queryClient.invalidateQueries({ queryKey: ["likes", event.id] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [event?.id, queryClient]);

  const posts = postsQuery.data ?? [];
  const mediaPosts = useMemo(() => posts.filter((p) => p.kind !== "text"), [posts]);
  const likes = likesQuery.data ?? [];

  const likeCount = (postId: string) => likes.filter((l) => l.post_id === postId).length;
  const likedByMe = (postId: string) => !!guest && likes.some((l) => l.post_id === postId && l.guest_id === guest.id);

  async function toggleLike(postId: string) {
    if (!guest) return;
    if (likedByMe(postId)) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("guest_id", guest.id);
    } else {
      await supabase.from("likes").insert({ post_id: postId, guest_id: guest.id });
    }
    queryClient.invalidateQueries({ queryKey: ["likes", event?.id] });
  }

  if (eventQuery.isLoading) {
    return <CenterNote title="Opening the album…" />;
  }

  if (!event) {
    return <CenterNote title="Album not found" body="Double-check the link or QR code from your host." />;
  }

  const viewOnly = event.album_permission === "view_only";
  const uploadOnly = event.album_permission === "upload_only";
  const canPost = !event.is_closed && !viewOnly && (event.allow_photos || event.allow_videos || event.allow_text);

  return (
    <div className="min-h-screen bg-background pb-24">
      <EventHeader event={event} />

      <main className="mx-auto w-full max-w-2xl px-4">
        {event.is_closed ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border bg-secondary/60 px-4 py-3 text-sm text-secondary-foreground">
            <Lock className="size-4" /> This album is closed for new posts. Enjoy the memories!
          </div>
        ) : !canPost ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border bg-secondary/60 px-4 py-3 text-sm text-secondary-foreground">
            <Lock className="size-4" /> This album is view-only. Enjoy the memories!
          </div>
        ) : guest ? (
          <div className="-mt-8 relative z-10">
            <Composer
              eventId={event.id}
              guest={guest}
              allowPhotos={event.allow_photos}
              allowVideos={event.allow_videos}
              allowText={event.allow_text}
              requireApproval={event.require_approval}
              onPosted={() => queryClient.invalidateQueries({ queryKey: ["posts", event.id] })}
            />
          </div>
        ) : (
          <JoinCard event={event} code={code} onJoined={setGuest} />
        )}

        {uploadOnly ? (
          <p className="mt-10 rounded-2xl border bg-card px-5 py-6 text-center text-sm text-muted-foreground">
            The host is collecting photos privately — your uploads go straight to them.
          </p>
        ) : (
        <div className="mt-8 space-y-6">
          {postsQuery.isLoading && <CardSkeleton />}
          {!postsQuery.isLoading && posts.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">
              No posts yet — be the first to add a photo.
            </p>
          )}

          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-3xl border bg-card shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                  {post.author_name.slice(0, 1).toUpperCase()}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{post.author_name}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                </div>
              </div>

              {post.kind === "photo" && (
                <button
                  type="button"
                  className="block w-full"
                  onClick={() => setLightbox(mediaPosts.findIndex((m) => m.id === post.id))}
                >
                  <MediaImage
                    path={post.media_url}
                    alt={post.caption ?? `Photo by ${post.author_name}`}
                    className="aspect-4/5 w-full bg-muted object-cover"
                  />
                </button>
              )}
              {post.kind === "video" && (
                <MediaVideo path={post.media_url} className="w-full bg-foreground/90" />
              )}
              {post.kind === "text" && (
                <p className="px-5 pb-2 pt-1 font-display text-xl leading-snug">{post.caption}</p>
              )}

              {post.kind !== "text" && post.caption ? (
                <p className="px-4 pt-3 text-sm">{post.caption}</p>
              ) : null}

              <div className="flex items-center gap-4 px-4 py-3">
                {event.allow_likes && (
                <button
                  type="button"
                  disabled={!guest}
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
                >
                  <Heart
                    className={`size-5 ${likedByMe(post.id) ? "fill-primary text-primary" : ""}`}
                  />
                  {likeCount(post.id) || ""}
                </button>
                )}
              </div>
            </article>
          ))}
        </div>
        )}
      </main>

      {lightbox !== null && lightbox >= 0 && (
        <Lightbox
          posts={mediaPosts}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndexChange={setLightbox}
          allowDownload={event.allow_guest_downloads}
        />
      )}
    </div>
  );
}

function EventHeader({ event }: { event: EventRow }) {
  return (
    <header className="relative">
      <div className="relative h-56 w-full overflow-hidden bg-primary/15 sm:h-72">
        {event.cover_url ? (
          <MediaImage path={event.cover_url} alt={event.name} className="size-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-foreground/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl px-4 pb-10 text-background">
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{event.name}</h1>
          {event.event_date && (
            <p className="mt-1 flex items-center gap-1.5 text-sm opacity-90">
              <CalendarDays className="size-4" />
              {new Date(event.event_date).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
      {event.welcome_message ? (
        <p className="mx-auto max-w-2xl px-4 pt-6 text-center text-muted-foreground">{event.welcome_message}</p>
      ) : null}
    </header>
  );
}

function JoinCard({
  event,
  code,
  onJoined,
}: {
  event: EventRow;
  code: string;
  onJoined: (guest: GuestIdentity) => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      onJoined(await joinEvent(code, event.id, name));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="-mt-8 relative z-10 rounded-3xl border bg-card p-6 text-center shadow-sm">
      <Camera className="mx-auto size-8 text-primary" />
      <h2 className="mt-3 font-display text-2xl">Join the album</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your name shows next to everything you post.</p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        maxLength={40}
        className="mx-auto mt-4 h-12 max-w-xs rounded-full text-center text-base"
      />
      <Button type="submit" size="lg" disabled={busy || !name.trim()} className="mt-4 rounded-full px-8">
        Start sharing
      </Button>
    </form>
  );
}

function CardSkeleton() {
  return <div className="h-72 animate-pulse rounded-3xl bg-muted" />;
}

function CenterNote({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <MessageCircle className="mx-auto size-8 text-primary" />
        <h1 className="mt-3 font-display text-2xl">{title}</h1>
        {body && <p className="mt-2 text-muted-foreground">{body}</p>}
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString();
}
