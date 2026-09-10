import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Images, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { EventRow } from "@/components/album/types";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "My events — Tifkira" },
      { name: "description", content: "Manage your shared event albums, share links and QR codes." },
      { property: "og:title", content: "My events — Tifkira" },
      { property: "og:description", content: "Manage your shared event albums." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ["my-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link to="/" className="font-display text-xl font-semibold">
          Tifkira
        </Link>
        <button onClick={signOut} className="text-sm text-muted-foreground hover:underline">
          Sign out
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-3xl">My events</h1>
          <Button asChild className="rounded-full">
            <Link to="/dashboard/new">
              <Plus className="size-4" /> New event
            </Link>
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {isLoading && <div className="h-24 animate-pulse rounded-3xl bg-muted" />}
          {!isLoading && events?.length === 0 && (
            <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">
              <Images className="mx-auto size-7 text-primary" />
              <p className="mt-3 font-display text-xl">No albums yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first event and share the QR code with your guests.
              </p>
            </div>
          )}
          {events?.map((event) => (
            <Link
              key={event.id}
              to="/dashboard/event/$id"
              params={{ id: event.id }}
              className="flex items-center justify-between rounded-3xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/30"
            >
              <div>
                <p className="font-display text-xl">{event.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  {event.event_date
                    ? new Date(event.event_date).toLocaleDateString()
                    : "No date set"}
                  {event.is_closed ? " · Closed" : ""}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs">{event.code}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
