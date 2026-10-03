import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { albumUrl } from "@/lib/event-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventRow } from "@/components/album/types";

const RESERVED = new Set(["auth", "demo", "pricing", "dashboard", "api", "contact", "faq", "admin", "new", "join", "slideshow", "use-cases", "how-it-works", "tifkira", "help", "support", "login", "signup"]);

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-/, "")
    .slice(0, 40);
}

type Status = "idle" | "invalid" | "checking" | "available" | "taken";

export function CustomLink({ event }: { event: EventRow }) {
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState(event.code);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setSlug(event.code), [event.code]);

  useEffect(() => {
    const clean = slug.replace(/-$/, "");
    if (clean === event.code) { setStatus("idle"); setMessage(""); return; }
    if (clean.length < 3) { setStatus("invalid"); setMessage("Use at least 3 characters."); return; }
    if (RESERVED.has(clean)) { setStatus("invalid"); setMessage("This word is reserved — try another."); return; }
    setStatus("checking");
    const t = setTimeout(async () => {
      const { data, error } = await supabase.from("events").select("id").eq("code", clean).maybeSingle();
      if (error) { setStatus("invalid"); setMessage("Could not check right now."); return; }
      if (data) { setStatus("taken"); setMessage("Already taken by another event."); }
      else { setStatus("available"); setMessage("Available!"); }
    }, 400);
    return () => clearTimeout(t);
  }, [slug, event.code]);

  async function save() {
    const clean = slug.replace(/-$/, "");
    if (status !== "available") return;
    if (!window.confirm("Changing your link also changes your QR code. Any QR codes you already printed or shared will stop working. Continue?")) return;
    setSaving(true);
    const { error } = await supabase.from("events").update({ code: clean }).eq("id", event.id);
    setSaving(false);
    if (error) {
      toast.error(error.code === "23505" ? "That link was just taken — try another." : "Could not save the link");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["event-admin", event.id] });
    queryClient.invalidateQueries({ queryKey: ["my-events"] });
    toast.success("Custom link saved");
  }

  const preview = albumUrl(slug.replace(/-$/, "") || event.code);

  return (
    <div className="sm:col-span-2 rounded-md border bg-card p-5">
      <div className="flex items-center gap-2"><Link2 className="size-4 text-primary" /><Label htmlFor="ev-slug" className="text-base font-semibold">Custom link</Label></div>
      <p className="mt-1 text-sm text-muted-foreground">Pick an easy link for guests to type, like <span className="font-mono">sarah-and-mark</span>.</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
          <span className="shrink-0 pl-3 text-sm text-muted-foreground">/a/</span>
          <Input id="ev-slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} maxLength={40} className="border-0 font-mono shadow-none focus-visible:ring-0" />
        </div>
        <Button onClick={save} disabled={status !== "available" || saving}>{saving ? <Loader2 className="animate-spin" /> : <Check />} Save link</Button>
      </div>
      <div className="mt-2 min-h-5 text-sm">
        {status === "checking" && <span className="inline-flex items-center gap-1 text-muted-foreground"><Loader2 className="size-3 animate-spin" /> Checking…</span>}
        {status === "available" && <span className="inline-flex items-center gap-1 text-primary"><Check className="size-3" /> {message}</span>}
        {(status === "taken" || status === "invalid") && <span className="inline-flex items-center gap-1 text-destructive"><X className="size-3" /> {message}</span>}
      </div>
      <p className="mt-1 break-all text-xs text-muted-foreground">Guest link: {preview}</p>
      {status === "available" && <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground"><AlertTriangle className="mt-0.5 size-3 shrink-0" /> Saving changes your QR code — re-print any cards you already made.</p>}
    </div>
  );
}
