import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { prepareImage, uploadMedia } from "@/lib/media";
import type { GuestIdentity } from "@/lib/guest";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_BYTES = 500 * 1024 * 1024;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp|tiff?)$/i;
const VIDEO_EXT = /\.(mp4|mov|m4v|3gp|avi|mkv|webm|hevc)$/i;

function kindOf(file: File): "photo" | "video" | null {
  if (file.type.startsWith("image/") || IMAGE_EXT.test(file.name)) return "photo";
  if (file.type.startsWith("video/") || VIDEO_EXT.test(file.name)) return "video";
  return null;
}

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
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).filter((f) => {
      if (!kindOf(f)) {
        toast.error(`${f.name} is not a photo or video`);
        return false;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is larger than 500 MB`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...picked]);
    if (inputRef.current) inputRef.current.value = "";
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
        let done = 0;
        const failed: string[] = [];
        setProgress({ done: 0, total: files.length });
        for (const original of files) {
          const kind = kindOf(original) ?? "photo";
          try {
            const file = kind === "photo" ? await prepareImage(original) : original;
            const path = await uploadMedia(eventId, file);
            const { error } = await supabase.from("posts").insert({
              event_id: eventId,
              guest_id: guest.id,
              author_name: guest.name,
              kind,
              media_url: path,
              caption: caption.trim() || null,
            });
            if (error) throw error;
          } catch (err) {
            console.error("upload failed", original.name, err);
            failed.push(original.name);
          }
          done += 1;
          setProgress({ done, total: files.length });
          onPosted();
        }
        if (failed.length) {
          toast.error(
            failed.length === files.length
              ? "Upload failed — check your connection and try again"
              : `${failed.length} file(s) could not be uploaded`,
          );
          setFiles(files.filter((f) => failed.includes(f.name)));
          return;
        }
      }
      setFiles([]);
      setCaption("");
      onPosted();
      toast.success("Added to the album");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProgress(null);
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
            <span
              key={i}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
            >
              {f.name.slice(0, 22)}
              {!busy && (
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {progress && (
        <p className="mb-3 text-xs text-muted-foreground">
          Uploading {progress.done + 1 > progress.total ? progress.total : progress.done + 1} of{" "}
          {progress.total}…
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*,.heic,.heif,.mov"
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
