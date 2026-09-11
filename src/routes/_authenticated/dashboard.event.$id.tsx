import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Copy, Download, Eye, EyeOff, Loader2, Lock, LockOpen, MonitorPlay, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { albumUrl } from "@/lib/event-code";
import { downloadAlbum } from "@/lib/download";
import { Button } from "@/components/ui/button";
import { MediaImage, MediaVideo } from "@/components/album/Media";
import type { EventRow, PostRow } from "@/components/album/types";

export const Route = createFileRoute("/_authenticated/dashboard/event/$id")({
  head: () => ({
    meta: [
      { title: "Event album — Tifkira" },
      { name: "description", content: "Share your album, view guest posts and moderate content." },
      { property: "og:title", content: "Event album — Tifkira" },
      { property: "og:description", content: "Share your album and moderate guest posts." },
    ],
  }),
  component: EventAdmin,
});

function EventAdmin() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qr, setQr] = useState<string | null>(null);

  const { data: event } = useQuery({
    queryKey: ["event-admin", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as EventRow | null;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["admin-posts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("event_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PostRow[];
    },
  });

  const link = event ? albumUrl(event.code) : "";

  useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link, { width: 512, margin: 1 }).then(setQr).catch(() => setQr(null));
  }, [link]);

  if (!event) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;

  async function toggleHidden(post: PostRow) {
    await supabase.from("posts").update({ is_hidden: !post.is_hidden }).eq("id", post.id);
    queryClient.invalidateQueries({ queryKey: ["admin-posts", id] });
  }

  async function removePost(post: PostRow) {
    await supabase.from("posts").delete().eq("id", post.id);
    queryClient.invalidateQueries({ queryKey: ["admin-posts", id] });
    toast.success("Post deleted");
  }

  async function toggleClosed() {
    await supabase.from("events").update({ is_closed: !event!.is_closed }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["event-admin", id] });
  }

  async function deleteEvent() {
    if (!window.confirm("Delete this event and everything in it? This cannot be undone.")) return;
    await supabase.from("events").delete().eq("id", id);
    toast.success("Event deleted");
    navigate({ to: "/dashboard", replace: true });
  }

  const visible = posts?.filter((p) => !p.is_hidden).length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-3xl px-5 py-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" /> My events
        </Link>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-5 pb-20">
        <div>
          <h1 className="font-display text-3xl">{event.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {visible} posts shared{event.is_closed ? " · album closed" : ""}
          </p>
        </div>

        <section className="grid gap-4 rounded-3xl border bg-card p-6 shadow-sm sm:grid-cols-[auto_1fr] sm:items-center">
          {qr ? <img src={qr} alt="QR code for the album" className="mx-auto size-40 rounded-2xl" /> : null}
          <div className="space-y-3">
            <p className="font-display text-xl">Share with your guests</p>
            <p className="text-sm break-all text-muted-foreground">{link}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="rounded-full"
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  toast.success("Link copied");
                }}
              >
                <Copy className="size-4" /> Copy link
              </Button>
              {qr && (
                <Button asChild variant="secondary" className="rounded-full">
                  <a href={qr} download={`${event.code}-qr.png`}>
                    Download QR
                  </a>
                </Button>
              )}
              <Button asChild variant="secondary" className="rounded-full">
                <Link to="/a/$code" params={{ code: event.code }}>
                  Open album
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          <Button variant="secondary" className="rounded-full" onClick={toggleClosed}>
            {event.is_closed ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
            {event.is_closed ? "Reopen album" : "Close album"}
          </Button>
          <Button variant="destructive" className="rounded-full" onClick={deleteEvent}>
            <Trash2 className="size-4" /> Delete event
          </Button>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Posts</h2>
          {posts?.length === 0 && <p className="text-muted-foreground">Nothing shared yet.</p>}
          {posts?.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 rounded-3xl border bg-card p-4 shadow-sm"
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
                {post.kind === "photo" && (
                  <MediaImage path={post.media_url} alt="" className="size-full object-cover" />
                )}
                {post.kind === "video" && <MediaVideo path={post.media_url} className="size-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{post.author_name}</p>
                <p className="truncate text-sm text-muted-foreground">{post.caption ?? post.kind}</p>
              </div>
              <button
                onClick={() => toggleHidden(post)}
                aria-label={post.is_hidden ? "Show post" : "Hide post"}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              >
                {post.is_hidden ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
              <button
                onClick={() => removePost(post)}
                aria-label="Delete post"
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
