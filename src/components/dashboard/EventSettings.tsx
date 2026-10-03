import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, LockOpen, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EventRow } from "@/components/album/types";

type Tab = "general" | "moderation" | "wall";
const tabs: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "moderation", label: "Moderation & permissions" },
  { key: "wall", label: "Photo wall" },
];

const eventTypes = [
  ["wedding", "Wedding"],
  ["birthday", "Birthday"],
  ["festa", "Festa"],
  ["corporate", "Corporate"],
  ["anniversary", "Anniversary"],
  ["other", "Other"],
] as const;

const permissions = [
  { value: "view_and_upload", title: "View & upload", body: "Guests see the album and add their own posts." },
  { value: "view_only", title: "View only", body: "Guests can browse, but cannot add anything." },
  { value: "upload_only", title: "Upload only", body: "A private drop-box — only you see what guests send." },
] as const;

type Patch = Partial<Omit<EventRow, "id" | "host_id" | "created_at">>;

function ToggleRow({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-6 py-5">
      <div>
        <Label htmlFor={id} className="text-base font-semibold">{label}</Label>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function EventSettings({ event, onToggleClosed, onDelete }: { event: EventRow; onToggleClosed: () => void; onDelete: () => void }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("general");
  const [name, setName] = useState(event.name);
  const [date, setDate] = useState(event.event_date ?? "");
  const [type, setType] = useState(event.event_type);
  const [welcome, setWelcome] = useState(event.welcome_message ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(event.name);
    setDate(event.event_date ?? "");
    setType(event.event_type);
    setWelcome(event.welcome_message ?? "");
  }, [event.id, event.name, event.event_date, event.event_type, event.welcome_message]);

  async function update(patch: Patch, message = "Settings saved") {
    queryClient.setQueryData(["event-admin", event.id], { ...event, ...patch });
    const { error } = await supabase.from("events").update(patch).eq("id", event.id);
    if (error) {
      toast.error("Could not save this setting");
      queryClient.invalidateQueries({ queryKey: ["event-admin", event.id] });
      return false;
    }
    queryClient.invalidateQueries({ queryKey: ["event-admin", event.id] });
    queryClient.invalidateQueries({ queryKey: ["my-events"] });
    toast.success(message);
    return true;
  }

  async function saveGeneral() {
    if (!name.trim()) { toast.error("Event name is required"); return; }
    setSaving(true);
    await update({ name: name.trim(), event_date: date || null, event_type: type, welcome_message: welcome.trim() || null }, "Event details saved");
    setSaving(false);
  }

  return (
    <>
      <p className="mb-2 text-xs font-bold uppercase text-primary">Manage event</p>
      <h1 className="text-3xl sm:text-4xl">Event settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Control what guests can do and how your photo wall looks.</p>

      <div role="tablist" className="mt-8 flex gap-1 overflow-x-auto border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {tab === "general" && (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label htmlFor="ev-name">Event name</Label><Input id="ev-name" className="mt-2" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></div>
              <div><Label htmlFor="ev-date">Event date</Label><Input id="ev-date" type="date" className="mt-2" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div>
                <Label>Event type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger aria-label="Event type" className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>{eventTypes.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2"><Label htmlFor="ev-welcome">Welcome message</Label><Textarea id="ev-welcome" className="mt-2" rows={3} value={welcome} onChange={(e) => setWelcome(e.target.value)} maxLength={500} placeholder="A few words guests see when they open the album" /></div>
              <div className="sm:col-span-2 text-sm text-muted-foreground">Event code: <span className="font-mono text-foreground">{event.code}</span></div>
            </div>
            <Button className="mt-6" onClick={saveGeneral} disabled={saving}><Save /> Save details</Button>

            <section className="mt-12 border-t pt-6"><h2 className="text-2xl">Album status</h2><p className="mt-2 text-sm text-muted-foreground">{event.is_closed ? "Guests can browse, but cannot add new posts." : "Guests can add photos, videos and messages."}</p><Button className="mt-5" variant="outline" onClick={onToggleClosed}>{event.is_closed ? <LockOpen /> : <Lock />}{event.is_closed ? "Reopen album" : "Close album"}</Button></section>
            <section className="mt-12 border-t pt-6"><h2 className="text-2xl">Delete event</h2><p className="mt-2 text-sm text-muted-foreground">This permanently deletes the event and its posts. This cannot be undone.</p><Button className="mt-5" variant="destructive" onClick={onDelete}><Trash2 /> Delete event</Button></section>
          </>
        )}

        {tab === "moderation" && (
          <>
            <div className="mt-4 divide-y border-b">
              <ToggleRow id="approval" label="Manually approve guest uploads" hint="New posts wait in “Needs approval” until you publish them." checked={event.require_approval} onChange={(v) => update({ require_approval: v })} />
            </div>
            <h2 className="mt-10 text-xl">Album access</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {permissions.map((p) => {
                const active = event.album_permission === p.value;
                return (
                  <button key={p.value} type="button" aria-pressed={active} onClick={() => !active && update({ album_permission: p.value })} className={`rounded-md border p-4 text-left transition-colors ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card hover:border-foreground/30"}`}>
                    <p className="font-semibold">{p.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                  </button>
                );
              })}
            </div>
            <h2 className="mt-10 text-xl">What guests can share</h2>
            <div className="divide-y border-b">
              <ToggleRow id="photos" label="Photos" hint="Allow guests to upload photos." checked={event.allow_photos} onChange={(v) => update({ allow_photos: v })} />
              <ToggleRow id="videos" label="Videos" hint="Allow guests to upload videos." checked={event.allow_videos} onChange={(v) => update({ allow_videos: v })} />
              <ToggleRow id="text" label="Text messages" hint="Allow posts with only a written message." checked={event.allow_text} onChange={(v) => update({ allow_text: v })} />
            </div>
            <h2 className="mt-10 text-xl">Guest interactions</h2>
            <div className="divide-y border-b">
              <ToggleRow id="downloads" label="Guest downloads" hint="Show a download button when guests open a photo." checked={event.allow_guest_downloads} onChange={(v) => update({ allow_guest_downloads: v })} />
              <ToggleRow id="likes" label="Likes" hint="Let guests like each other's posts." checked={event.allow_likes} onChange={(v) => update({ allow_likes: v })} />
            </div>
          </>
        )}

        {tab === "wall" && (
          <>
            <div className="mt-8">
              <Label>Time per photo</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {[4, 6, 8, 12].map((s) => (
                  <Button key={s} size="sm" variant={event.slideshow_interval === s ? "default" : "outline"} onClick={() => update({ slideshow_interval: s })}>{s} seconds</Button>
                ))}
              </div>
            </div>
            <div className="mt-6 divide-y border-y">
              <ToggleRow id="wall-qr" label="Show QR code" hint="A corner code so guests can join from the screen." checked={event.slideshow_show_qr} onChange={(v) => update({ slideshow_show_qr: v })} />
              <ToggleRow id="wall-captions" label="Show captions & names" hint="Display the guest's name and caption under each photo." checked={event.slideshow_show_captions} onChange={(v) => update({ slideshow_show_captions: v })} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
