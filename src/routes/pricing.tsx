import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { pricingPlans, pricingFaqs, currencyNote } from "@/lib/pricing-plans";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Tifkira pricing — one-time event album packages" },
      {
        name: "description",
        content:
          "Simple one-time prices in euro for shared event albums: free taste, Festa at €24.99 and Grand Wedding at €59. Guests always join free.",
      },
      { property: "og:title", content: "Tifkira pricing — one-time event album packages" },
      {
        property: "og:description",
        content: "Pay once per event. Unlimited guest photos, live slideshow and a full album download.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="mt-8 font-display text-4xl leading-tight sm:text-5xl">Pay once for your event</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your guests never pay and never download an app. Pick the package that fits the size of your celebration.
          </p>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border bg-card p-6 shadow-sm ${
                plan.highlighted ? "border-primary ring-2 ring-primary/30" : ""
              }`}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {plan.badge}
                </span>
              ) : null}

              <h2 className="font-display text-2xl">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

              <p className="mt-5 font-display text-4xl">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.priceNote}</p>

              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                variant={plan.highlighted ? "default" : "secondary"}
                className="mt-6 rounded-full"
              >
                <Link to={plan.ctaTo}>{plan.ctaLabel}</Link>
              </Button>
            </div>
          ))}
        </section>

        <p className="mt-6 text-center text-sm text-muted-foreground">{currencyNote}</p>

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center font-display text-3xl">Questions about pricing</h2>
          <dl className="mt-8 space-y-4">
            {pricingFaqs.map((f) => (
              <div key={f.q} className="rounded-3xl border bg-card p-6 shadow-sm">
                <dt className="font-display text-xl">{f.q}</dt>
                <dd className="mt-2 text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 rounded-3xl border bg-card p-10 text-center shadow-sm">
          <h2 className="font-display text-3xl">Not sure yet?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Have a play with a sample album first, or start a free one for your next small gathering.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/demo">Try it yourself</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
              <Link to="/how-it-works">How it works</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
