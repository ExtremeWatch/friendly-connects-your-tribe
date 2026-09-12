import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const faqs = [
  {
    q: "Do my guests need an app or an account?",
    a: "No. They scan the QR code or open the link, type their name once, and can post straight away.",
  },
  {
    q: "What can guests share?",
    a: "Photos, videos and text messages, each with an optional caption. They can like anyone else's post too.",
  },
  {
    q: "Can I remove a photo I don't want?",
    a: "Yes. From your event page you can hide or delete any post at any time.",
  },
  {
    q: "Can I show the photos during the party?",
    a: "Open the live slideshow on a TV, laptop or projector. New photos appear automatically as guests post them.",
  },
  {
    q: "How do I keep the photos afterwards?",
    a: "Download the whole album as a single zip file, including a text file with all the messages.",
  },
  {
    q: "Can I stop new posts after the event?",
    a: "Close the album with one tap. Everyone can still look through it, but nobody can add anything new.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Tifkira FAQ — Questions about shared event albums" },
      {
        name: "description",
        content:
          "How guests join without an app, what they can share, moderating posts, the live slideshow and downloading your album.",
      },
      { property: "og:title", content: "Tifkira FAQ — Questions about shared event albums" },
      { property: "og:description", content: "Answers about joining, sharing, moderation, slideshow and downloads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-5 pb-20">
        <h1 className="mt-8 font-display text-4xl leading-tight sm:text-5xl">Common questions</h1>
        <dl className="mt-8 space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-3xl border bg-card p-6 shadow-sm">
              <dt className="font-display text-xl">{f.q}</dt>
              <dd className="mt-2 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
        <Button asChild size="lg" className="mt-10 rounded-full px-8">
          <Link to="/dashboard/new">Create your album</Link>
        </Button>
      </main>
    </div>
  );
}
