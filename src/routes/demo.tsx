import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DemoAlbumPanel } from "@/components/site/DemoDrawer";
import { cleanupDemo } from "@/lib/demo.functions";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Try a live demo album — Tifkira" },
      {
        name: "description",
        content: "Scan the QR code with your phone and add a photo to a real wedding album. Watch it appear live.",
      },
      { property: "og:title", content: "Try a live demo album — Tifkira" },
      { property: "og:description", content: "Scan, post a photo, and watch it appear live in a real wedding album." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  useEffect(() => {
    const since = new Date().toISOString();
    cleanupDemo({ data: {} }).catch(() => {});
    return () => {
      cleanupDemo({ data: { since } }).catch(() => {});
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 pb-20">
        <h1 className="mt-4 text-center font-display text-3xl">Try the live demo</h1>
        <p className="mb-6 mt-2 text-center text-muted-foreground">
          This is a real wedding album — exactly what your guests get.
        </p>
        <DemoAlbumPanel />
        <div className="mt-10 text-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/auth">Create your album</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
