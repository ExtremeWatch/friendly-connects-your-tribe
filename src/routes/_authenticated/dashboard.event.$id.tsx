import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, ArrowUpRight, CalendarDays, Copy, Download, Eye, EyeOff, Heart, Home, Images, Loader2, Lock, LockOpen, Menu, MonitorPlay, Plus, Settings2, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { albumUrl } from "@/lib/event-code";
import { downloadAlbum } from "@/lib/download";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaImage, MediaVideo } from "@/components/album/Media";
import { useSession } from "@/hooks/useSession";
import type { EventRow, PostRow } from "@/components/album/types";

type Section = "home" | "media" | "settings";
type MediaFilter = "published" | "hidden";
const sections = [
  { key: "home", label: "Home", icon: Home },
  { key: "media", label: "Photos & videos", icon: Images },
  { key: "settings", label: "Event settings", icon: Settings2 },
] as const;

export const Route = createFileRoute("/_authenticated/dashboard/event/$id")({
  head: () => ({
    meta: [
      { title: "Event workspace — Tifkira" },
      { name: "description", content: "Share your event album, manage guest posts and event controls." },
      { property: "og:title", content: "Event workspace — Tifkira" },
      { property: "og:description", content: "Share your event album and manage guest posts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventAdmin,
});

function EventAdmin() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [section, setSection] = useState<Section>("home");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("published");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [zipping, setZipping] = useState<string | null>(null);

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ["event-admin", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as EventRow | null;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["my-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
  });

  const { data: posts, error: postsError } = useQuery({
    queryKey: ["admin-posts", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("event_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PostRow[];
    },
  });

  const { data: likes } = useQuery({
    queryKey: ["admin-likes", id],
    queryFn: async () => {
      const { count, error } = await supabase.from("likes").select("post_id, posts!inner(event_id)", { count: "exact", head: true }).eq("posts.event_id", id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const link = event ? albumUrl(event.code) : "";
  const slideshowLink = event && typeof window !== "undefined" ? `${window.location.origin}/slideshow/${event.code}` : "";

  useEffect(() => {
    setSection("home");
    setMediaFilter("published");
  }, [id]);

  useEffect(() => {
    setQr(null);
    if (!link) return;
    QRCode.toDataURL(link, { width: 512, margin: 1 }).then(setQr).catch(() => setQr(null));
  }, [link]);

  async function copyLink(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  }

  async function toggleHidden(post: PostRow) {
    const { error } = await supabase.from("posts").update({ is_hidden: !post.is_hidden }).eq("id", post.id);
    if (error) return toast.error("Could not update this post");
    queryClient.invalidateQueries({ queryKey: ["admin-posts", id] });
    toast.success(post.is_hidden ? "Post restored" : "Post hidden");
  }

  async function removePost(post: PostRow) {
    if (!window.confirm("Permanently delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) return toast.error("Could not delete this post");
    queryClient.invalidateQueries({ queryKey: ["admin-posts", id] });
    toast.success("Post deleted");
  }

  async function toggleClosed() {
    if (!event) return;
    const { error } = await supabase.from("events").update({ is_closed: !event.is_closed }).eq("id", id);
    if (error) return toast.error("Could not update the album");
    queryClient.invalidateQueries({ queryKey: ["event-admin", id] });
    queryClient.invalidateQueries({ queryKey: ["my-events"] });
    toast.success(event.is_closed ? "Album reopened" : "Album closed");
  }

  async function deleteEvent() {
    if (!window.confirm("Delete this event and everything in it? This cannot be undone.")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast.error("Could not delete the event");
    queryClient.invalidateQueries({ queryKey: ["my-events"] });
    toast.success("Event deleted");
    navigate({ to: "/dashboard", replace: true });
  }

  async function saveAlbum() {
    if (!event) return;
    try {
      setZipping("Preparing…");
      await downloadAlbum(event.name, posts ?? [], (done, total) => setZipping(`${done} / ${total}`));
      toast.success("Album downloaded");
    } catch {
      toast.error("Could not build the download");
    } finally {
      setZipping(null);
    }
  }

  if (eventLoading) return <div className="p-10 text-center text-muted-foreground">Opening event…</div>;
  if (eventError || !event) return <div className="p-10 text-center text-muted-foreground">This event could not be found. <Link to="/dashboard" className="text-primary underline">Back to my events</Link></div>;

  const published = posts?.filter((post) => !post.is_hidden) ?? [];
  const hidden = posts?.filter((post) => post.is_hidden) ?? [];
  const shownPosts = mediaFilter === "published" ? published : hidden;
  const photoCount = published.filter((post) => post.kind === "photo").length;
  const videoCount = published.filter((post) => post.kind === "video").length;

  const navigation = () => (
    <div className="flex h-full flex-col">
      <Link to="/" className="font-display text-2xl font-semibold text-foreground">Tifkira<span className="text-primary">.</span></Link>
      <div className="mt-10">
        <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Current event</p>
        <Select value={id} onValueChange={(value) => { if (value !== id) navigate({ to: "/dashboard/event/$id", params: { id: value } }); setMobileMenuOpen(false); }}>
          <SelectTrigger aria-label="Choose event" className="h-11 bg-card"><SelectValue placeholder={event.name} /></SelectTrigger>
          <SelectContent>
            {(events?.length ? events : [event]).map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button asChild variant="ghost" className="mt-2 w-full justify-start text-muted-foreground"><Link to="/dashboard"><ArrowLeft /> All events</Link></Button>
      </div>
      <div className="mt-9 space-y-1" aria-label="Event workspace">
        {sections.map(({ key, label, icon: Icon }) => (
          <Button key={key} variant="ghost" aria-current={section === key ? "page" : undefined} onClick={() => { setSection(key); setMobileMenuOpen(false); }} className={`h-11 w-full justify-start gap-3 px-3 ${section === key ? "bg-sidebar-accent text-sidebar-primary font-bold" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
            <Icon className="size-4" /> {label}
          </Button>
        ))}
      </div>
      <div className="mt-auto border-t pt-5">
        <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground"><Link to="/dashboard/new"><Plus /> New event</Link></Button>
        {user?.email && <p className="mt-3 truncate px-3 text-xs text-muted-foreground" title={user.email}>{user.email}</p>}
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/", replace: true }); }}>Sign out</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar px-5 py-7 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">{navigation()}</aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between gap-3 border-b bg-background px-4 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild><Button size="icon" variant="ghost" aria-label="Open event menu" className="lg:hidden"><Menu /></Button></SheetTrigger>
              <SheetContent side="left" className="flex flex-col bg-sidebar p-5"><SheetHeader><SheetTitle className="sr-only">Event menu</SheetTitle></SheetHeader>{navigation()}</SheetContent>
            </Sheet>
            <span className="truncate text-sm font-semibold">{event.name}</span>
            <span className={`hidden text-xs sm:inline ${event.is_closed ? "text-muted-foreground" : "text-primary"}`}>· {event.is_closed ? "Closed" : "Open"}</span>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0"><Link to="/a/$code" params={{ code: event.code }} target="_blank">Guest view <ArrowUpRight /></Link></Button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 pb-20 sm:px-8 lg:px-10 lg:py-10">
          {section === "home" && <>
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase text-primary">Event overview</p>
              <h1 className="text-3xl sm:text-4xl">{event.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{event.event_date ? new Date(`${event.event_date}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "Date not set"} · {event.is_closed ? "Album closed" : "Ready to share"}</p>
            </div>
            <div className="mb-9 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border md:grid-cols-4">
              {[
                { label: "Published posts", value: published.length, icon: Images },
                { label: "Photos", value: photoCount, icon: Images },
                { label: "Videos", value: videoCount, icon: Video },
                { label: "Likes", value: likes ?? 0, icon: Heart },
              ].map(({ label, value, icon: Icon }) => <div key={label} className="bg-card p-4 sm:p-5"><Icon className="mb-4 size-4 text-primary" /><p className="font-display text-2xl">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}
            </div>
            <div className="grid gap-8 xl:grid-cols-2">
              <section className="min-w-0 border-t-2 border-primary pt-5">
                <div className="mb-5 flex items-start gap-3"><Images className="mt-1 size-5 text-primary" /><div><h2 className="text-2xl">Guest album</h2><p className="mt-1 text-sm text-muted-foreground">The link your guests scan to share their moments.</p></div></div>
                <div className="flex flex-col gap-5 border bg-card p-5 sm:flex-row sm:items-center">
                  {qr ? <img src={qr} alt="QR code for the guest album" className="mx-auto size-36 shrink-0 bg-card" /> : <div className="mx-auto size-36 shrink-0 animate-pulse bg-muted" />}
                  <div className="min-w-0 flex-1"><p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Guest link</p><p className="break-all text-sm">{link}</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => copyLink(link)}><Copy /> Copy link</Button><Button asChild size="sm" variant="outline"><Link to="/a/$code" params={{ code: event.code }} target="_blank">Open <ArrowUpRight /></Link></Button></div></div>
                </div>
                {qr && <Button asChild variant="ghost" className="mt-3 px-0 text-primary"><a href={qr} download={`${event.code}-qr.png`}><Download /> Download QR code</a></Button>}
              </section>
              <section className="min-w-0 border-t-2 border-accent pt-5">
                <div className="mb-5 flex items-start gap-3"><MonitorPlay className="mt-1 size-5 text-primary" /><div><h2 className="text-2xl">Live photo wall</h2><p className="mt-1 text-sm text-muted-foreground">Show guest posts as they arrive on a big screen.</p></div></div>
                <div className="flex min-h-45 flex-col justify-between border bg-card p-5"><div className="flex items-center gap-4"><div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-secondary"><MonitorPlay className="size-6 text-primary" /></div><div className="min-w-0"><p className="font-semibold">Live slideshow</p><p className="mt-1 break-all text-xs text-muted-foreground">{slideshowLink}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Button asChild size="sm"><Link to="/slideshow/$code" params={{ code: event.code }} target="_blank">Open on screen <ArrowUpRight /></Link></Button><Button size="sm" variant="outline" onClick={() => copyLink(slideshowLink)}><Copy /> Copy link</Button></div></div>
              </section>
            </div>
          </>}

          {section === "media" && <>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase text-primary">Content library</p><h1 className="text-3xl sm:text-4xl">Photos & videos</h1><p className="mt-2 text-sm text-muted-foreground">Review everything shared in your album, including messages.</p></div><Button variant="outline" disabled={!!zipping || !posts?.some((post) => post.media_url)} onClick={saveAlbum}>{zipping ? <Loader2 className="animate-spin" /> : <Download />}{zipping ? `Downloading ${zipping}` : "Download album"}</Button></div>
            <div className="mt-8 flex gap-2 border-b pb-3"><Button size="sm" variant={mediaFilter === "published" ? "default" : "ghost"} onClick={() => setMediaFilter("published")}>Published ({published.length})</Button><Button size="sm" variant={mediaFilter === "hidden" ? "default" : "ghost"} onClick={() => setMediaFilter("hidden")}>Hidden ({hidden.length})</Button></div>
            {postsError && <p className="py-8 text-destructive">Could not load posts.</p>}
            {!posts && !postsError && <p className="py-8 text-muted-foreground">Loading posts…</p>}
            {posts && shownPosts.length === 0 && <p className="py-16 text-center text-muted-foreground">{mediaFilter === "hidden" ? "No hidden posts." : "Nothing shared yet."}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{shownPosts.map((post) => <article key={post.id} className="min-w-0 overflow-hidden border bg-card">
              <div className="flex aspect-4/3 items-center justify-center overflow-hidden bg-muted">{post.kind === "photo" && <MediaImage path={post.media_url} alt={post.caption ?? `Photo by ${post.author_name}`} className="size-full object-cover" />}{post.kind === "video" && <MediaVideo path={post.media_url} className="size-full object-contain" />}{post.kind === "text" && <p className="max-h-full overflow-auto px-6 text-center font-display text-xl">{post.caption}</p>}</div>
              <div className="p-4"><p className="text-sm font-semibold">{post.author_name}</p><p className="mt-1 truncate text-sm text-muted-foreground">{post.caption || post.kind} · {new Date(post.created_at).toLocaleDateString()}</p><div className="mt-4 flex items-center gap-2 border-t pt-3"><Button size="sm" variant="outline" onClick={() => toggleHidden(post)}>{post.is_hidden ? <Eye /> : <EyeOff />}{post.is_hidden ? "Restore" : "Hide"}</Button><Button size="icon" variant="ghost" aria-label={`Delete post by ${post.author_name}`} title="Delete post" className="ml-auto text-destructive" onClick={() => removePost(post)}><Trash2 /></Button></div></div>
            </article>)}</div>
          </>}

          {section === "settings" && <>
            <p className="mb-2 text-xs font-bold uppercase text-primary">Manage event</p><h1 className="text-3xl sm:text-4xl">Event settings</h1><p className="mt-2 text-sm text-muted-foreground">Your event details and album status.</p>
            <div className="mt-9 max-w-3xl divide-y border-y">
              <div className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr]"><span className="flex items-center gap-2 text-sm text-muted-foreground"><Images className="size-4" /> Event name</span><span className="font-medium">{event.name}</span></div>
              <div className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr]"><span className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" /> Event date</span><span className="font-medium">{event.event_date || "Not set"}</span></div>
              <div className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr]"><span className="text-sm text-muted-foreground">Welcome message</span><span className="whitespace-pre-wrap font-medium">{event.welcome_message || "Not set"}</span></div>
              <div className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr]"><span className="text-sm text-muted-foreground">Event code</span><span className="font-mono text-sm font-medium">{event.code}</span></div>
            </div>
            <section className="mt-12 max-w-3xl border-t pt-6"><h2 className="text-2xl">Album access</h2><p className="mt-2 text-sm text-muted-foreground">{event.is_closed ? "Guests can browse, but cannot add new posts." : "Guests can add photos, videos and messages."}</p><Button className="mt-5" variant="outline" onClick={toggleClosed}>{event.is_closed ? <LockOpen /> : <Lock />}{event.is_closed ? "Reopen album" : "Close album"}</Button></section>
            <section className="mt-12 max-w-3xl border-t pt-6"><h2 className="text-2xl">Delete event</h2><p className="mt-2 text-sm text-muted-foreground">This permanently deletes the event and its posts. This cannot be undone.</p><Button className="mt-5" variant="destructive" onClick={deleteEvent}><Trash2 /> Delete event</Button></section>
          </>}
        </main>
      </div>
    </div>
  );
}
