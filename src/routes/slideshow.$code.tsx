import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { albumUrl } from "@/lib/event-code";
import { MediaImage, MediaVideo } from "@/components/album/Media";
import type { EventRow, PostRow } from "@/components/album/types";

const INTERVAL = 7000;

export const Route = createFileRoute("/slideshow/$code")({
  head: () => ({
    meta: [
      { title: "Live slideshow — Tifkira" },
      {
        name: "description",
        content: "Put every guest photo on the big screen, updating live as new pictures arrive.",
      },
      { property: "og:title", content: "Live slideshow — Tifkira" },
      { property: "og:description", content: "Guest photos on the big screen, live during your event." },
    ],
  }),
  component: SlideshowPage,
});

function SlideshowPage() {
  const { code } = Route.useParams();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [qr, setQr] = useState<string | null>(null);

  const { data: event } = useQuery({
    queryKey: ["event", code],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("code", code).maybeSingle();
      if (error) throw error;
      return data as EventRow | null;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["slideshow-posts", event?.id],
    enabled: !!event?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("event_id", event!.id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PostRow[];
    },
  });

  const slides = useMemo(() => (posts ?? []).filter((p) => p.kind !== "text"), [posts]);

  useEffect(() => {
    if (!event?.id) return;
    const channel = supabase
      .channel(`slideshow-${event.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["slideshow-posts", event.id] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [event?.id, queryClient]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  useEffect(() => {
    if (!event) return;
    QRCode.toDataURL(albumUrl(event.code), { width: 320, margin: 1 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [event?.code, event]);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-foreground text-background">
        <p className="font-display text-2xl">Loading the slideshow…</p>
      </div>
    );
  }

  const current = slides[index];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-foreground text-background">
      {current ? (
        <div key={current.id} className="flex size-full flex-1 items-center justify-center p-6">
          {current.kind === "photo" ? (
            <MediaImage
              path={current.media_url}
              alt={current.caption ?? `Photo by ${current.author_name}`}
              className="max-h-[82vh] w-auto max-w-full rounded-3xl object-contain shadow-2xl"
            />
          ) : (
            <MediaVideo
              path={current.media_url}
              className="max-h-[82vh] w-auto max-w-full rounded-3xl object-contain shadow-2xl"
            />
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Camera className="size-10 opacity-70" />
          <p className="font-display text-3xl">Waiting for the first photo…</p>
          <p className="opacity-70">Scan the code to add yours.</p>
        </div>
      )}

      <div className="flex w-full items-end justify-between gap-6 px-8 pb-8">
        <div className="min-w-0">
          <p className="font-display text-3xl leading-tight">{event.name}</p>
          {current ? (
            <p className="mt-1 truncate text-lg opacity-80">
              {current.caption ? `${current.caption} — ` : ""}
              {current.author_name}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-center">
          {qr ? <img src={qr} alt="Scan to join the album" className="size-28 rounded-2xl bg-background p-1" /> : null}
          <p className="mt-1 text-xs opacity-70">Scan to add your photos</p>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute inset-x-0 top-0 h-1 bg-background/20">
          <div
            key={current?.id}
            className="h-full bg-background/80"
            style={{ animation: `slideshow-progress ${INTERVAL}ms linear forwards` }}
          />
        </div>
      )}

      <style>{`@keyframes slideshow-progress { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
