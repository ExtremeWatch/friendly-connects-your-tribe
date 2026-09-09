import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "event-media";

const cache = new Map<string, Promise<string | null>>();

export function signedUrl(path: string): Promise<string | null> {
  if (!cache.has(path)) {
    cache.set(
      path,
      supabase.storage
        .from(MEDIA_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 7)
        .then((res) => res.data?.signedUrl ?? null)
        .catch(() => null),
    );
  }
  return cache.get(path)!;
}

export function useSignedUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    signedUrl(path).then((value) => {
      if (active) setUrl(value);
    });
    return () => {
      active = false;
    };
  }, [path]);

  return url;
}

export async function uploadMedia(eventId: string, file: File): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${eventId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}
