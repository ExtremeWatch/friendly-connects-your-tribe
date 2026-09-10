import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { makeEventCode } from "@/lib/event-code";
import { uploadMedia } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/dashboard/new")({
  head: () => ({
    meta: [
      { title: "Create an event — Tifkira" },
      { name: "description", content: "Set up a new shared album for your event in under a minute." },
      { property: "og:title", content: "Create an event — Tifkira" },
      { property: "og:description", content: "Set up a new shared album for your event." },
    ],
  }),
  component: NewEvent,
});

function NewEvent() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [welcome, setWelcome] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const hostId = userData.user?.id;
      if (!hostId) throw new Error("Please sign in again");

      const code = makeEventCode();
      const { data, error } = await supabase
        .from("events")
        .insert({
          host_id: hostId,
          code,
          name: name.trim(),
          event_date: date || null,
          welcome_message: welcome.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (cover) {
        const path = await uploadMedia(data.id, cover);
        await supabase.from("events").update({ cover_url: path }).eq("id", data.id);
      }

      navigate({ to: "/dashboard/event/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the event");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-xl px-5 py-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" /> My events
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-5 pb-20">
        <h1 className="font-display text-3xl">Create your album</h1>
        <form onSubmit={submit} className="mt-6 space-y-5 rounded-3xl border bg-card p-6 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="name">Event name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sara & Youssef's wedding"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cover">Cover photo</Label>
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="welcome">Welcome message</Label>
            <Textarea
              id="welcome"
              value={welcome}
              onChange={(e) => setWelcome(e.target.value)}
              rows={3}
              placeholder="Thanks for celebrating with us — share your favourite shots here!"
            />
          </div>
          <Button type="submit" disabled={busy || !name.trim()} className="w-full rounded-full">
            Create album
          </Button>
        </form>
      </main>
    </div>
  );
}
