import JSZip from "jszip";
import { MEDIA_BUCKET } from "@/lib/media";
import { supabase } from "@/integrations/supabase/client";
import type { PostRow } from "@/components/album/types";

function safeName(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "album";
}

export async function downloadAlbum(
  eventName: string,
  posts: PostRow[],
  onProgress?: (done: number, total: number) => void,
) {
  const media = posts.filter((p) => p.media_url);
  const zip = new JSZip();
  let done = 0;

  for (const post of media) {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).download(post.media_url!);
    if (!error && data) {
      const ext = post.media_url!.split(".").pop() ?? "bin";
      zip.file(`${safeName(post.author_name)}-${post.id.slice(0, 6)}.${ext}`, data);
    }
    done += 1;
    onProgress?.(done, media.length);
  }

  const notes = posts
    .filter((p) => p.kind === "text" || p.caption)
    .map((p) => `${p.author_name} — ${new Date(p.created_at).toLocaleString()}\n${p.caption ?? ""}\n`)
    .join("\n");
  if (notes) zip.file("messages.txt", notes);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName(eventName)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
