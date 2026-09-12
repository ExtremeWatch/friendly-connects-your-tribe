import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Tifkira — Help with your shared event album" },
      {
        name: "description",
        content: "Questions about setting up a shared event album, QR codes, the live slideshow or downloads? Get in touch.",
      },
      { property: "og:title", content: "Contact Tifkira — Help with your shared event album" },
      { property: "og:description", content: "Get help setting up your shared event album." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-5 pb-16">
        <h1 className="mt-8 font-display text-4xl leading-tight sm:text-5xl">Talk to us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Planning something big, or stuck setting up an album? We're happy to help.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <Mail className="size-6 text-primary" />
            <h2 className="mt-4 font-display text-xl">Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Write to hello@tifkira.app and we'll reply within a day.
            </p>
          </div>
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <MessageCircle className="size-6 text-primary" />
            <h2 className="mt-4 font-display text-xl">Quick answers</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Most questions about joining, uploads and downloads are already answered on the FAQ page.
            </p>
            <Button asChild variant="secondary" className="mt-4 rounded-full">
              <Link to="/faq">Read the FAQ</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
