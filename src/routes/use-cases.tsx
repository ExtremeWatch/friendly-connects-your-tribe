import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, Building2, Cake, GraduationCap, Heart, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/use-cases")({
  head: () => ({
    meta: [
      { title: "Occasions — Shared photo albums for weddings & parties" },
      {
        name: "description",
        content:
          "Weddings, birthdays, baby showers, graduations and company parties: collect every guest photo and video in one shared album.",
      },
      { property: "og:title", content: "Occasions — Shared photo albums for weddings & parties" },
      {
        property: "og:description",
        content: "One shared album for weddings, birthdays, showers, graduations and work events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UseCases,
});

const occasions = [
  {
    icon: Heart,
    title: "Weddings",
    body: "A QR card on every table means you see the day from a hundred angles — including all the moments you missed.",
  },
  {
    icon: Cake,
    title: "Birthdays",
    body: "Guests post photos and little messages as the night goes on, so the album doubles as a birthday card.",
  },
  {
    icon: Baby,
    title: "Baby showers & christenings",
    body: "Family who couldn't travel can still follow the album live and leave their good wishes.",
  },
  {
    icon: GraduationCap,
    title: "Graduations",
    body: "Everyone's phone photos in one place instead of scattered across chats that scroll away.",
  },
  {
    icon: Building2,
    title: "Company events",
    body: "Conferences, away days and Christmas parties: one album your team can add to and you can download after.",
  },
  {
    icon: PartyPopper,
    title: "Any get-together",
    body: "Reunions, holidays, hen and stag weekends — anywhere people take more photos than they ever share.",
  },
];

function UseCases() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-5 pb-16">
        <h1 className="mt-8 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
          Made for the days people photograph the most.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          The same simple album works for every occasion: share a code, guests post, you keep everything.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map(({ icon: Icon, title, body }) => (
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
            <Link to="/how-it-works">See how it works</Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
