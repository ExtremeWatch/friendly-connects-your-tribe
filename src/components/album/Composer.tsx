import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";
import type { GuestIdentity } from "@/lib/guest";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_BYTES = 50 * 1024 * 1024;

export function Composer({
  eventId,
  guest,
  onPosted,
}: {
  eventId: string;
  guest: GuestIdentity;
  onPosted: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).filter((f) => {
      if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
        toast.error(`${f.name} is not a photo or video`);
        return false;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is larger than 50 MB`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...picked]);
  }

  async function submit() {
    if (!files.length && !caption.trim()) return;
    setBusy(true);
    try {
      if (files.length === 0) {
        const { error } = await supabase.from("posts").insert({
          event_id: eventId,
          guest_id: guest.id,
          author_name: guest.name,
          kind: "text",
          caption: caption.trim(),
        });
        if (error) throw error;
      } else {
        for (const file of files) {
          const path = await uploadMedia(eventId, file);
          const { error } = await supabase.from("posts").insert({
            event_id: eventId,
            guest_id: guest.id,
            author_name: guest.name,
            kind: file.type.startsWith("video/") ? "video" : "photo",
            media_url: path,
            caption: caption.trim() || null,
          });
          if (error) throw error;
        }
      }
      setFiles([]);
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
      onPosted();
      toast.success("Added to the album");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm">
      <Textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={`Say something, ${guest.name.split(" ")[0]}…`}
        rows={2}
        className="resize-none border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
      />

      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              {f.name.slice(0, 22)}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => pick(e.target.files)}
        />
        <Button type="button" variant="secondary" className="rounded-full" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="size-4" />
          Photos & videos
        </Button>
        <Button
          type="button"
          className="rounded-full"
          disabled={busy || (!files.length && !caption.trim())}
          onClick={submit}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Post
        </Button>
      </div>
    </div>
  );
}
