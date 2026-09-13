import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Camera, Heart, ImagePlus, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import demo1 from "@/assets/demo-1.jpg";
import demo2 from "@/assets/demo-2.jpg";
import demo3 from "@/assets/demo-3.jpg";
import demo4 from "@/assets/demo-4.jpg";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Try a live demo album — Tifkira" },
      {
        name: "description",
        content:
          "See exactly what your guests see: add a photo, leave a message and like a few posts in this sample event album. Nothing is saved.",
      },
      { property: "og:title", content: "Try a live demo album — Tifkira" },
      {
        property: "og:description",
        content: "Add a photo, leave a message and like a few posts in a sample event album.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

type DemoPost = {
  id: string;
  kind: "photo" | "text";
  src?: string | undefined;
  caption?: string | undefined;
  author: string;
  minutesAgo: number;
  likes: number;
  likedByMe: boolean;
};

const seedPosts: DemoPost[] = [
  {
    id: "p1",
    kind: "photo",
    src: demo1,
    caption: "To the happy couple!",
    author: "Sofia",
    minutesAgo: 4,
    likes: 12,
    likedByMe: false,
  },
  {
    id: "p2",
    kind: "text",
    caption: "Best speech I've ever heard. Not crying, you're crying.",
    author: "Marco",
    minutesAgo: 11,
    likes: 7,
    likedByMe: false,
  },
  { id: "p3", kind: "photo", src: demo2, caption: "Dance floor is officially open", author: "Amy", minutesAgo: 26, likes: 18, likedByMe: false },
  { id: "p4", kind: "photo", src: demo3, caption: "Cake time", author: "Jonas", minutesAgo: 48, likes: 9, likedByMe: false },
  { id: "p5", kind: "photo", src: demo4, caption: "The whole crew made it", author: "Priya", minutesAgo: 72, likes: 23, likedByMe: false },
];

function DemoPage() {
  const [name, setName] = useState("");
  const [joinedAs, setJoinedAs] = useState<string | null>(null);
  const [posts, setPosts] = useState<DemoPost[]>(seedPosts);
  const [caption, setCaption] = useState("");
  const [pending, setPending] = useState<{ file: File; url: string } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const photoPosts = useMemo(() => posts.filter((p) => p.kind === "photo"), [posts]);
  const lightboxPost = photoPosts.find((p) => p.id === lightbox) ?? null;

  function pickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pick a photo for the demo");
      return;
    }
    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    setPending({ file, url });
  }

  function post() {
    if (!joinedAs) return;
    if (!pending && !caption.trim()) return;
    setPosts((prev) => [
      {
        id: crypto.randomUUID(),
        kind: pending ? "photo" : "text",
        src: pending?.url,
        caption: caption.trim() || undefined,
        author: joinedAs,
        minutesAgo: 0,
        likes: 0,
        likedByMe: false,
      },
      ...prev,
    ]);
    setCaption("");
    setPending(null);
    if (fileInput.current) fileInput.current.value = "";
    toast.success("Added to the album");
  }

  function toggleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p,
      ),
    );
  }

  function reset() {
    setPosts(seedPosts);
    setJoinedAs(null);
    setName("");
    setCaption("");
    setPending(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-4 pb-20">
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-accent/30 px-4 py-3 text-sm">
          <p className="flex items-center gap-2 text-accent-foreground">
            <Sparkles className="size-4" /> This is a demo album — nothing you add here is saved or shared.
          </p>
          <Button variant="ghost" size="sm" className="rounded-full" onClick={reset}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>

        <header className="relative mt-4 overflow-hidden rounded-3xl">
          <img
            src={demo1}
            alt="Guests raising a toast at a wedding reception"
            width={900}
            height={1125}
            className="h-56 w-full object-cover sm:h-72"
          />
          <div className="absolute inset-0 bg-linear-to-t from-foreground/75 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-background">
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">Emma &amp; Luca&apos;s Wedding</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm opacity-90">
              <CalendarDays className="size-4" /> A sample album you can play with
            </p>
          </div>
        </header>

        <p className="mt-5 text-center text-muted-foreground">
          Thank you for celebrating with us — please add your photos here!
        </p>

        {joinedAs ? (
          <div className="mt-6 rounded-3xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Posting as <span className="font-semibold text-foreground">{joinedAs}</span>
            </p>
            {pending ? (
              <div className="relative mt-3 overflow-hidden rounded-2xl">
                <img src={pending.url} alt="Your selected photo" className="max-h-72 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  aria-label="Remove photo"
                  className="absolute right-3 top-3 rounded-full bg-foreground/70 p-1.5 text-background"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={pending ? "Add a caption…" : "Write a message to the couple…"}
              className="mt-3 min-h-20 rounded-2xl"
            />
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <Button variant="secondary" className="rounded-full" onClick={() => fileInput.current?.click()}>
                <ImagePlus className="size-4" /> Add photo
              </Button>
              <Button className="rounded-full" disabled={!pending && !caption.trim()} onClick={post}>
                <Send className="size-4" /> Post
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) setJoinedAs(name.trim());
            }}
            className="mt-6 rounded-3xl border bg-card p-6 text-center shadow-sm"
          >
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
            <Button type="submit" size="lg" disabled={!name.trim()} className="mt-4 rounded-full px-8">
              Start sharing
            </Button>
          </form>
        )}

        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-3xl border bg-card shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                  {post.author.slice(0, 1).toUpperCase()}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{post.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.minutesAgo === 0 ? "just now" : `${post.minutesAgo} min ago`}
                  </p>
                </div>
              </div>

              {post.kind === "photo" ? (
                <button type="button" className="block w-full" onClick={() => setLightbox(post.id)}>
                  <img
                    src={post.src}
                    alt={post.caption ?? `Photo by ${post.author}`}
                    loading="lazy"
                    className="aspect-4/5 w-full bg-muted object-cover"
                  />
                </button>
              ) : (
                <p className="px-5 pb-2 pt-1 font-display text-xl leading-snug">{post.caption}</p>
              )}

              {post.kind === "photo" && post.caption ? <p className="px-4 pt-3 text-sm">{post.caption}</p> : null}

              <div className="flex items-center gap-4 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Heart className={`size-5 ${post.likedByMe ? "fill-primary text-primary" : ""}`} />
                  {post.likes || ""}
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-[2rem] border bg-card px-6 py-10 text-center shadow-sm">
          <h2 className="font-display text-2xl sm:text-3xl">Like what you see?</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Set up your own album, print the QR code and let your guests fill it up.
          </p>
          <Button asChild size="lg" className="mt-5 rounded-full px-8">
            <Link to="/auth">Create your album</Link>
          </Button>
        </section>
      </main>

      {lightboxPost ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-5 top-5 rounded-full bg-background/20 p-2 text-background"
            onClick={() => setLightbox(null)}
          >
            <X className="size-5" />
          </button>
          <img
            src={lightboxPost.src}
            alt={lightboxPost.caption ?? `Photo by ${lightboxPost.author}`}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
        </div>
      ) : null}

      <SiteFooter />
    </div>
  );
}
