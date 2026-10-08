import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Cake, Camera, Check, Download, Heart, MonitorPlay, PartyPopper, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import heroImage from "@/assets/hero-celebration.jpg";
import { DemoDrawer } from "@/components/site/DemoDrawer";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
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
    icon: MonitorPlay,
    title: "Live on the big screen",
    body: "Put the slideshow on a TV and watch new photos appear as they're posted.",
  },
  {
    icon: Download,
    title: "Keep everything",
    body: "Download all the photos, videos and messages in one file when it's over.",
  },
  {
    icon: Heart,
    title: "Guests can react",
    body: "Likes and little notes turn the album into a keepsake, not just a folder.",
  },
  {
    icon: Sparkles,
    title: "You stay in control",
    body: "Hide or remove anything, and close the album when the party's done.",
  },
];

const steps = [
  { icon: QrCode, n: "01", title: "Scan the table card", body: "Guests point their camera at the QR on their table. The album opens instantly." },
  { icon: Camera, n: "02", title: "Share in seconds", body: "No account, no app. Type a name and post photos, videos and little notes." },
  { icon: MonitorPlay, n: "03", title: "Live wall, lasting keepsake", body: "Watch it all appear on the big screen, then download every memory in one go." },
];

const occasions = [
  { icon: Heart, title: "Weddings", body: "Every angle of your day, from the church steps to the last dance." },
  { icon: PartyPopper, title: "Village festas", body: "Fireworks, bands and processions, gathered by the whole village." },
  { icon: Cake, title: "Milestone birthdays", body: "18ths, 50ths and everything in between, captured by the people who matter." },
  { icon: Briefcase, title: "Corporate events", body: "Conferences and staff parties with your brand on the photo wall." },
];

const comparison: [string, string, string, string][] = [
  ["Photos in one place", "Instantly", "After developing", "Scattered"],
  ["Original quality", "Yes", "Grainy", "Compressed"],
  ["Live on a big screen", "Yes", "No", "No"],
  ["Works for every guest", "Just a scan", "Limited shots", "Need their number"],
];

function Landing() {
  const { user } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-5">
        <section className="py-10 text-center sm:py-16">
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
            <DemoDrawer>
              {(open) => (
                <Button size="lg" variant="secondary" className="rounded-full px-8" onClick={open}>
                  Try live demo
                </Button>
              )}
            </DemoDrawer>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {["No app to download", "Scan the table QR", "Live photo wall"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-primary" /> {t}
              </li>
            ))}
          </ul>

          <img
            src={heroImage}
            alt="Wedding guests holding up their phones to photograph the couple at sunset"
            width={1600}
            height={1104}
            className="mt-12 aspect-16/11 w-full rounded-[2rem] border object-cover shadow-sm"
          />
        </section>

        <section className="py-12">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-primary">How it flows</p>
          <h2 className="mt-2 text-center font-display text-3xl sm:text-4xl">From table to keepsake in three moments</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, n, title, body }) => (
              <div key={n} className="relative rounded-3xl border bg-card p-7 shadow-sm">
                <span className="absolute right-6 top-5 font-display text-5xl text-primary/15">{n}</span>
                <div className="grid size-12 place-items-center rounded-2xl bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-xl">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-center font-display text-3xl sm:text-4xl">Made for every celebration</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {occasions.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl bg-accent/30 p-6">
                <Icon className="size-6 text-primary" />
                <h3 className="mt-3 font-display text-lg">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-center font-display text-3xl sm:text-4xl">Why not just a group chat?</h2>
          <div className="mt-8 overflow-x-auto rounded-3xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-medium text-muted-foreground"></th>
                  <th className="p-4 font-display text-base text-primary">Tifkira</th>
                  <th className="p-4 font-medium">Disposable cameras</th>
                  <th className="p-4 font-medium">Group chats</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([label, a, b, c]) => (
                  <tr key={label} className="border-b last:border-0">
                    <td className="p-4 font-medium">{label}</td>
                    <td className="p-4">{a}</td>
                    <td className="p-4 text-muted-foreground">{b}</td>
                    <td className="p-4 text-muted-foreground">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl border bg-card p-6 shadow-sm">
              <Icon className="size-6 text-primary" />
              <h2 className="mt-4 font-display text-xl">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        <section className="my-8 rounded-[2rem] border bg-card px-6 py-12 text-center shadow-sm">
          <h2 className="font-display text-3xl sm:text-4xl">Ready before your guests arrive.</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Set up an album in a couple of minutes, print the QR code, and let everyone else do the rest.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to={user ? "/dashboard/new" : "/auth"}>Create your album</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
              <Link to="/use-cases">Browse occasions</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
