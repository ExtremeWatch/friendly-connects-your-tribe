import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Heart, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tifkira — One shared album for every event photo" },
      {
        name: "description",
        content:
          "Guests scan a QR code and drop their photos, videos and messages into one live album. No app, no accounts, no chasing people for pictures.",
      },
      { property: "og:title", content: "Tifkira — One shared album for every event photo" },
      {
        property: "og:description",
        content: "Guests scan a QR code and drop their photos into one live album. No app, no accounts.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <span className="font-display text-xl font-semibold tracking-tight">Tifkira</span>
        <nav className="flex items-center gap-2">
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/how-it-works">How it works</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/faq">FAQ</Link>
        </Button>
        {user ? (
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/dashboard">My events</Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/auth">Sign in</Link>
          </Button>
        )}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        <section className="py-14 text-center sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/40 px-4 py-1.5 text-sm text-accent-foreground">
            <Sparkles className="size-4" /> Every guest is your photographer
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
            One shared album for every photo your guests take.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Guests scan a QR code, type their name and start posting. No app to download, no account to create,
            nothing to chase afterwards.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to={user ? "/dashboard/new" : "/auth"}>Create your album</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
              <Link to="/dashboard">My events</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 pb-20 sm:grid-cols-3">
          {[
            {
              icon: QrCode,
              title: "Join in one scan",
              body: "Print the QR code or share the link. Guests are posting within seconds.",
            },
            {
              icon: Camera,
              title: "Photos, videos, messages",
              body: "Everything lands in one live feed, credited to the guest who shared it.",
            },
            {
              icon: Heart,
              title: "You stay in control",
              body: "Hide or remove anything, and close the album when the party's over.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl border bg-card p-6 shadow-sm">
              <Icon className="size-6 text-primary" />
              <h2 className="mt-4 font-display text-xl">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
