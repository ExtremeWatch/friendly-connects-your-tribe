// All package details live here. Edit prices, names and perks in this one file
// and the pricing page updates everywhere.

export type PricingPlan = {
  id: string;
  name: string;
  tagline: string;
  /** Displayed price, e.g. "€24.99". Use "€0" for the free tier. */
  price: string;
  /** Small note under the price, e.g. "one-time, per event". */
  priceNote: string;
  /** Optional ribbon, e.g. "Most popular". */
  badge?: string;
  highlighted?: boolean;
  features: string[];
  ctaLabel: string;
  /** Route the button sends people to. */
  ctaTo: string;
};

export const currencyNote = "All prices in euro, VAT included. One-time payment per event — no subscription.";

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Taste",
    tagline: "Try it with a small gathering.",
    price: "€0",
    priceNote: "free forever",
    features: [
      "Up to 10 guests",
      "Up to 30 photos",
      "Album open for 7 days",
      "QR code and sharing link",
      "Guests join without an app",
    ],
    ctaLabel: "Start free",
    ctaTo: "/auth",
  },
  {
    id: "celebration",
    name: "Festa",
    tagline: "Birthdays, communions, christenings and parties.",
    price: "€24.99",
    priceNote: "one-time, per event",
    features: [
      "Up to 75 guests",
      "Unlimited photos and messages",
      "Album open for 3 months",
      "Live slideshow on the big screen",
      "Download everything as one zip",
      "Hide or delete any post",
    ],
    ctaLabel: "Choose Festa",
    ctaTo: "/auth",
  },
  {
    id: "wedding",
    name: "Grand Wedding & Gala",
    tagline: "Weddings and milestone celebrations.",
    price: "€59",
    priceNote: "one-time, per event",
    badge: "Most popular",
    highlighted: true,
    features: [
      "Unlimited guests",
      "Unlimited photos and videos",
      "Album kept for 1 full year",
      "Live slideshow with your own cover",
      "Full quality download of every file",
      "Guest messages saved as a keepsake file",
      "Priority help on the day",
    ],
    ctaLabel: "Choose Wedding",
    ctaTo: "/auth",
  },
  {
    id: "planner",
    name: "Planners & Photographers",
    tagline: "A bundle for people running events all season.",
    price: "€129",
    priceNote: "5 events — €25.80 each",
    features: [
      "5 events, use them any time",
      "Everything in Grand Wedding",
      "Resell to your clients as an add-on",
      "One place to manage every album",
      "Priority support",
    ],
    ctaLabel: "Get the bundle",
    ctaTo: "/contact",
  },
];

export const pricingFaqs = [
  {
    q: "Do my guests pay anything?",
    a: "Never. Guests scan the QR code and join free, no app and no account.",
  },
  {
    q: "Is this a subscription?",
    a: "No. You pay once for your event. The planner bundle is also a one-time payment for 5 events.",
  },
  {
    q: "What happens when my album period ends?",
    a: "Download the full album any time before it ends, and you keep everything forever. You can also extend an album.",
  },
  {
    q: "How can I pay?",
    a: "Card, Apple Pay, Google Pay and Revolut. Online payments are being switched on shortly.",
  },
  {
    q: "Can I upgrade after the party started?",
    a: "Yes. Move up a package at any time and nothing already posted is lost.",
  },
];
