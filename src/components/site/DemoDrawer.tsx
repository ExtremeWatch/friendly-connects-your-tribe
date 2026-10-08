import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { ExternalLink, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MediaImage, MediaVideo } from "@/components/album/Media";
import type { PostRow } from "@/components/album/types";
import { cleanupDemo, DEMO_CODE, DEMO_EVENT_ID } from "@/lib/demo.functions";

function timeAgo(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} h ago`;
}

export function DemoAlbumPanel() {
  const qc = useQueryClient();
  const [qr, setQr] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const u = `${window.location.origin}/a/${DEMO_CODE}`;
    setUrl(u);
    QRCode.toDataURL(u, { width: 480, margin: 1, errorCorrectionLevel: "H" }).then(setQr);
  }, []);

  const posts = useQuery({
    queryKey: ["demo-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("event_id", DEMO_EVENT_ID)
        .eq("is_hidden", false)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PostRow[];
    },
  });

  const likes = useQuery({
    queryKey: ["demo-likes"],
    queryFn: async () => {
      const { data } = await supabase.from("likes").select("post_id, posts!inner(event_id)").eq("posts.event_id", DEMO_EVENT_ID);
      return (data ?? []) as { post_id: string }[];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("demo-drawer")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts", filter: `event_id=eq.${DEMO_EVENT_ID}` }, () =>
        qc.invalidateQueries({ queryKey: ["demo-posts"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () =>
        qc.invalidateQueries({ queryKey: ["demo-likes"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  const likeCount = (id: string) => likes.data?.filter((l) => l.post_id === id).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-5 text-center shadow-sm">
        <p className="font-display text-xl">Scan with your phone camera</p>
        <p className="mt-1 text-sm text-muted-foreground">Add a photo, video or wish — watch it appear here live.</p>
        {qr ? (
          <img src={qr} alt="QR code for the demo wedding album" className="mx-auto mt-4 size-48 rounded-xl bg-background p-2" />
        ) : (
          <div className="mx-auto mt-4 size-48 animate-pulse rounded-xl bg-muted" />
        )}
        <Button asChild variant="secondary" className="mt-4 rounded-full">
          <a href={url || `/a/${DEMO_CODE}`} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" /> Or open the album here
          </a>
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">Demo uploads are removed when you close the demo.</p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg">Emma &amp; Luca's album</h3>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-primary" /> Live
          </span>
        </div>
        <div className="space-y-4">
          {posts.data?.map((p) => (
            <article key={p.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {p.author_name.slice(0, 1).toUpperCase()}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{p.author_name}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(p.created_at)}</p>
                </div>
              </div>
              {p.kind === "photo" && <MediaImage path={p.media_url} alt={p.caption ?? `Photo by ${p.author_name}`} className="aspect-4/5 w-full object-cover" />}
              {p.kind === "video" && <MediaVideo path={p.media_url} className="w-full" />}
              {p.kind === "text" ? (
                <p className="flex gap-2 px-4 pb-2 font-display text-lg leading-snug">
                  <MessageCircle className="mt-1 size-4 shrink-0 text-primary" /> {p.caption}
                </p>
              ) : p.caption ? (
                <p className="px-4 pt-3 text-sm">{p.caption}</p>
              ) : null}
              <p className="flex items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground">
                <Heart className="size-4" /> {likeCount(p.id) || ""}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Wraps any trigger; opens the live demo drawer and clears visitor uploads on close. */
export function DemoDrawer({ children }: { children: (open: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const openedAt = useRef<string | null>(null);

  function change(next: boolean) {
    if (next) {
      openedAt.current = new Date().toISOString();
      cleanupDemo({ data: {} }).catch(() => {});
    } else if (openedAt.current) {
      cleanupDemo({ data: { since: openedAt.current } }).catch(() => {});
      openedAt.current = null;
    }
    setOpen(next);
  }

  return (
    <>
      {children(() => change(true))}
      <Sheet open={open} onOpenChange={change}>
        <SheetContent side="right" className="w-full overflow-y-auto bg-background sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Try the live demo</SheetTitle>
            <SheetDescription>This is a real wedding album — exactly what your guests get.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8">
            <DemoAlbumPanel />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
