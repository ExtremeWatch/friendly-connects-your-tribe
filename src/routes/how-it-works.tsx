import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, MonitorPlay, QrCode, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Tifkira works — Shared event albums in three steps" },
      {
        name: "description",
        content:
          "Create your album, share a QR code with guests, then watch photos arrive live on the big screen and download everything afterwards.",
      },
      { property: "og:title", content: "How Tifkira works — Shared event albums in three steps" },
      {
        property: "og:description",
        content: "Create an album, share a QR code, collect every guest photo in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    title: "1. Create your album",
    body: "Give your event a name and date, add a cover photo and a short welcome note for your guests.",
  },
  {
    title: "2. Share the QR code",
    body: "Print it for the tables or send the link in your group chat. Guests type their name and start posting — no app, no account.",
  },
  {
    title: "3. Keep every memory",
    body: "Photos, videos and messages land in one live album. Put it on the big screen during the party and download the lot when it's over.",
  },
];

const extras = [
  { icon: QrCode, title: "One scan to join", body: "Guests are posting within seconds of scanning." },
  { icon: MonitorPlay, title: "Live slideshow", body: "Open the slideshow on a TV or projector; new photos appear as they're shared." },
  { icon: Download, title: "Download everything", body: "Grab all photos, videos and messages in a single zip file." },
  { icon: Shield, title: "You're in control", body: "Hide or delete anything, and close the album whenever you like." },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight">
          Tifkira
        </Link>
        <Button asChild variant="secondary" className="rounded-full">
          <Link to="/dashboard">My events</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20">
        <h1 className="mt-8 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
          Every guest photo, in one place, without asking twice.
        </h1>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="font-display text-xl">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {extras.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl border bg-card p-6 shadow-sm">
              <Icon className="size-6 text-primary" />
              <h2 className="mt-4 font-display text-xl">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/dashboard/new">Create your album</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
            <Link to="/faq">Common questions</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
